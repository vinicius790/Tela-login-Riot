/**
 * ==========================================================================
 * riot-security.js — Riot Games Advanced Auth & Security Engine
 * ==========================================================================
 * 
 * Features:
 * 1. Interactive Sliding Puzzle Captcha Widget Modal (Anti-bot / Suspicious login challenge)
 * 2. Biometric WebAuthn Passkey Support (Real navigator.credentials + Fallback Simulation)
 * 3. Riot ID Tagline Generator & Validator (Format: Username#TAG, 3-5 alphanumeric chars)
 * 4. Shard & Region Selector with Simulated Live Latency Ping Indicator (BR, NA, EUW, EUNE, KR, JP, LAN, LAS, OCE)
 * 5. Secure Remember Me using Web Cryptography API (AES-256-GCM encrypted vault)
 * 
 * Compatible with Riot Client themes (Riot, Valorant, LoL, TFT).
 */

(function() {
    'use strict';

    // ==========================================================================
    // 1. CONFIGURATION & CONSTANTS
    // ==========================================================================

    const SHARDS = {
        BR:   { id: 'br1',  name: 'Brasil',              city: 'São Paulo',       flag: '🇧🇷', basePing: 16,  jitter: 4,  status: 'Operacional', tickrate: 128 },
        NA:   { id: 'na1',  name: 'North America',       city: 'Chicago / Oregon', flag: '🇺🇸', basePing: 125, jitter: 12, status: 'Operacional', tickrate: 128 },
        EUW:  { id: 'euw1', name: 'Europe West',         city: 'Frankfurt',       flag: '🇪🇺', basePing: 185, jitter: 15, status: 'Operacional', tickrate: 128 },
        EUNE: { id: 'eun1', name: 'Europe Nordic & East', city: 'Helsinki',        flag: '🇪🇺', basePing: 210, jitter: 18, status: 'Operacional', tickrate: 128 },
        KR:   { id: 'kr',   name: 'Korea',               city: 'Seoul',           flag: '🇰🇷', basePing: 295, jitter: 22, status: 'Operacional', tickrate: 128 },
        JP:   { id: 'jp1',  name: 'Japan',               city: 'Tokyo',           flag: '🇯🇵', basePing: 310, jitter: 25, status: 'Operacional', tickrate: 128 },
        LAN:  { id: 'la1',  name: 'Latin America North', city: 'Miami / Mexico',  flag: '🇲🇽', basePing: 92,  jitter: 8,  status: 'Operacional', tickrate: 128 },
        LAS:  { id: 'la2',  name: 'Latin America South', city: 'Santiago',        flag: '🇨🇱', basePing: 54,  jitter: 6,  status: 'Operacional', tickrate: 128 },
        OCE:  { id: 'oc1',  name: 'Oceania',             city: 'Sydney',          flag: '🇦🇺', basePing: 335, jitter: 30, status: 'Operacional', tickrate: 128 }
    };

    const TAGLINE_SEEDS = {
        BR:   ['BR1', 'BR2', 'HUE', 'HEX', 'SP1', 'RJ1', 'PENT4', 'DIFF', 'CARRY', '0001'],
        NA:   ['NA1', 'NA2', 'USA', 'CALI', 'NY1', 'CLUTCH', 'VIPER', 'DIFF', '0001', 'RIOT'],
        EUW:  ['EUW', 'EUW1', 'FR1', 'GER', 'MAD', 'SMURF', 'CHAMP', 'ACE', 'NEXUS', '0001'],
        EUNE: ['EUN1', 'EUN', 'PL1', 'NORD', 'EAST', 'DIFF', 'CHAMP', '0001'],
        KR:   ['KR1', 'SEOUL', 'T1', 'GEN', 'FAKER', 'GOD', 'DIFF', '0001'],
        JP:   ['JP1', 'TOKYO', 'AKB', 'OSK', 'ANIME', 'DIFF', '0001'],
        LAN:  ['LAN1', 'MEX', 'MIA', 'COL', 'DIFF', 'PENT4', '0001'],
        LAS:  ['LAS1', 'CHL', 'ARG', 'BUE', 'DIFF', 'PENT4', '0001'],
        OCE:  ['OCE1', 'SYD', 'AUS', 'MEL', 'DIFF', '0001']
    };

    const VAULT_STORAGE_KEY = 'riot_encrypted_vault';
    const PASSKEYS_STORAGE_KEY = 'riot_registered_passkeys';
    const SHARD_STORAGE_KEY = 'riot_selected_shard';

    // ==========================================================================
    // 2. WEB CRYPTOGRAPHY STORAGE MODULE (AES-256-GCM)
    // ==========================================================================

    class RiotCryptoStorage {
        constructor() {
            this.subtle = typeof window !== 'undefined' && window.crypto && window.crypto.subtle;
            this.volatileVault = new Map();
        }

        getOrCreateSalt() {
            if (typeof window === 'undefined') return new Uint8Array(16);
            let hexSalt = localStorage.getItem('riot_vault_salt_v3');
            if (!hexSalt) {
                const arr = new Uint8Array(16);
                if (window.crypto && window.crypto.getRandomValues) {
                    window.crypto.getRandomValues(arr);
                } else {
                    for (let i = 0; i < 16; i++) arr[i] = Math.floor(Math.random() * 256);
                }
                hexSalt = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
                try { localStorage.setItem('riot_vault_salt_v3', hexSalt); } catch (e) {}
            }
            const match = hexSalt.match(/.{1,2}/g);
            return new Uint8Array(match ? match.map(byte => parseInt(byte, 16)) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        }

        async deriveKey(machineSeed = '') {
            if (!this.subtle) return null;
            const seed = machineSeed || ((typeof navigator !== 'undefined' ? navigator.userAgent : 'RiotClient') + (typeof screen !== 'undefined' ? screen.width + 'x' + screen.height : '') + 'RiotSecVault');
            const enc = new TextEncoder();
            const salt = this.getOrCreateSalt();
            const keyMaterial = await this.subtle.importKey(
                'raw',
                enc.encode(seed),
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );

            return await this.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        }

        async encrypt(dataObj) {
            if (!this.subtle) {
                const memKey = 'mem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
                this.volatileVault.set(memKey, dataObj);
                return { fallback: true, volatileId: memKey, timestamp: Date.now() };
            }
            try {
                const key = await this.deriveKey();
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                const encodedData = new TextEncoder().encode(JSON.stringify(dataObj));

                const ciphertext = await this.subtle.encrypt(
                    { name: 'AES-GCM', iv },
                    key,
                    encodedData
                );

                return {
                    fallback: false,
                    algorithm: 'AES-256-GCM',
                    iv: this.buf2b64(iv),
                    ciphertext: this.buf2b64(ciphertext),
                    timestamp: Date.now()
                };
            } catch (err) {
                console.warn('[RiotSecurity] WebCrypto encrypt failed, volatile memory fallback used:', err);
                const memKey = 'mem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
                this.volatileVault.set(memKey, dataObj);
                return { fallback: true, volatileId: memKey, timestamp: Date.now() };
            }
        }

        async decrypt(envelope) {
            if (!envelope) return null;
            if (envelope.fallback) {
                if (envelope.volatileId && this.volatileVault.has(envelope.volatileId)) {
                    return this.volatileVault.get(envelope.volatileId);
                }
                return null;
            }
            if (!this.subtle) return null;

            try {
                const key = await this.deriveKey();
                const iv = this.b642buf(envelope.iv);
                const ciphertext = this.b642buf(envelope.ciphertext);

                const decrypted = await this.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    key,
                    ciphertext
                );

                const decStr = new TextDecoder().decode(decrypted);
                return JSON.parse(decStr);
            } catch (err) {
                console.warn('[RiotSecurity] WebCrypto decrypt failed or token invalid:', err);
                return null;
            }
        }

        async saveSessionVault(sessionData) {
            const envelope = await this.encrypt({
                ...sessionData,
                storedAt: Date.now(),
                expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(envelope));
            return envelope;
        }

        async restoreSessionVault() {
            const raw = localStorage.getItem(VAULT_STORAGE_KEY);
            if (!raw) return null;
            try {
                const envelope = JSON.parse(raw);
                const session = await this.decrypt(envelope);
                if (session && session.expiresAt && Date.now() < session.expiresAt) {
                    return session;
                }
                this.clearSessionVault();
                return null;
            } catch {
                return null;
            }
        }

        clearSessionVault() {
            localStorage.removeItem(VAULT_STORAGE_KEY);
        }

        buf2b64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        }

        b642buf(base64) {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        }
    }

    // ==========================================================================
    // 3. RIOT ID TAGLINE VALIDATOR & GENERATOR
    // ==========================================================================

    class RiotIdManager {
        constructor() {
            this.defaultShard = localStorage.getItem(SHARD_STORAGE_KEY) || 'BR';
        }

        /**
         * Validates Riot ID format: GameName#TAG
         * Rules:
         * - GameName: 3-16 characters
         * - Tagline: 3-5 alphanumeric characters (e.g. BR1, EUW, 007)
         */
        validate(fullString) {
            const trimmed = (fullString || '').trim();
            if (!trimmed) {
                return { isValid: false, reason: 'empty', message: 'Informe seu Riot ID ou Nome de Usuário' };
            }

            if (!trimmed.includes('#')) {
                // Single username provided without tag
                const isValidPlain = trimmed.length >= 3 && trimmed.length <= 16;
                return {
                    isValid: isValidPlain,
                    isRiotId: false,
                    gameName: trimmed,
                    tagline: null,
                    suggestedTag: this.generateTag(this.defaultShard),
                    formatted: `${trimmed}#${this.defaultShard}1`,
                    reason: isValidPlain ? 'plain_valid' : 'invalid_length',
                    message: isValidPlain ? `Adicione uma tag (ex: #${this.defaultShard}1)` : 'O nome deve ter entre 3 e 16 caracteres'
                };
            }

            const parts = trimmed.split('#');
            if (parts.length > 2) {
                return { isValid: false, isRiotId: true, reason: 'multiple_hashes', message: 'Riot ID só pode conter um símbolo #' };
            }

            const gameName = parts[0].trim();
            const tagline = parts[1].trim();

            if (gameName.length < 3 || gameName.length > 16) {
                return { isValid: false, isRiotId: true, gameName, tagline, reason: 'invalid_gamename', message: 'O nome antes da # deve ter entre 3 e 16 caracteres' };
            }

            const tagRegex = /^[a-zA-Z0-9]{3,5}$/;
            if (!tagRegex.test(tagline)) {
                return { isValid: false, isRiotId: true, gameName, tagline, reason: 'invalid_tagline', message: 'A tagline deve ter entre 3 e 5 caracteres alfanuméricos (ex: #BR1)' };
            }

            return {
                isValid: true,
                isRiotId: true,
                gameName,
                tagline: tagline.toUpperCase(),
                formatted: `${gameName}#${tagline.toUpperCase()}`,
                reason: 'valid',
                message: 'Riot ID Válido'
            };
        }

        generateTag(shard = 'BR') {
            const list = TAGLINE_SEEDS[shard] || TAGLINE_SEEDS.BR;
            const chosen = list[Math.floor(Math.random() * list.length)];
            return chosen;
        }

        attachLiveValidator(inputElement, badgeContainer, onTagGenerateClick) {
            if (!inputElement || !badgeContainer) return;

            const updateUI = () => {
                const res = this.validate(inputElement.value);
                badgeContainer.innerHTML = '';

                if (!inputElement.value.trim()) {
                    badgeContainer.style.display = 'none';
                    return;
                }

                badgeContainer.style.display = 'flex';
                badgeContainer.style.alignItems = 'center';
                badgeContainer.style.gap = '8px';
                badgeContainer.style.marginTop = '6px';
                badgeContainer.style.fontSize = '0.75rem';

                if (res.isValid && res.isRiotId) {
                    badgeContainer.innerHTML = `
                        <span style="color: #10B981; font-weight: 700; display:flex; align-items:center; gap:4px;">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                            Riot ID Válido: <strong style="letter-spacing:0.5px;">${res.formatted}</strong>
                        </span>
                    `;
                } else if (res.reason === 'plain_valid') {
                    const tag = this.generateTag(localStorage.getItem(SHARD_STORAGE_KEY) || 'BR');
                    badgeContainer.innerHTML = `
                        <span style="color: #A1A1AA;">Riot ID detectado sem tag.</span>
                        <button type="button" class="riot-tag-suggest-btn" style="background: rgba(235, 0, 41, 0.15); border: 1px solid var(--primary, #EB0029); color: #FFF; padding: 2px 7px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
                            + #${tag}
                        </button>
                    `;
                    const btn = badgeContainer.querySelector('.riot-tag-suggest-btn');
                    if (btn) {
                        btn.addEventListener('click', () => {
                            inputElement.value = `${inputElement.value.trim()}#${tag}`;
                            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                            if (window.riotAudio) window.riotAudio.play('click');
                        });
                    }
                } else {
                    badgeContainer.innerHTML = `
                        <span style="color: #EF4444; font-weight: 500; display:flex; align-items:center; gap:4px;">
                            ⚠️ ${res.message}
                        </span>
                    `;
                }
            };

            inputElement.addEventListener('input', updateUI);
            inputElement.addEventListener('focus', updateUI);
            inputElement.addEventListener('blur', () => {
                if (!inputElement.value.trim()) badgeContainer.style.display = 'none';
            });
        }
    }

    // ==========================================================================
    // 4. SHARD & REGION SELECTOR WITH LIVE LATENCY PING INDICATOR
    // ==========================================================================

    class ShardManager {
        constructor() {
            this.currentShard = localStorage.getItem(SHARD_STORAGE_KEY) || 'BR';
            this.listeners = [];
            this.pingInterval = null;
            this.lastPing = this.getShardConfig().basePing;
            this.initPingTicker();
        }

        getShards() {
            return SHARDS;
        }

        getCurrentShard() {
            return this.currentShard;
        }

        getShardConfig(shardKey = this.currentShard) {
            return SHARDS[shardKey] || SHARDS.BR;
        }

        setShard(shardKey) {
            if (SHARDS[shardKey]) {
                this.currentShard = shardKey;
                localStorage.setItem(SHARD_STORAGE_KEY, shardKey);
                this.lastPing = this.calcPing(shardKey);
                this.notify();
                if (window.showRiotToast) {
                    const cfg = SHARDS[shardKey];
                    window.showRiotToast(`Região alterada: ${cfg.flag} ${cfg.name} (${cfg.city})`, 'info');
                }
            }
        }

        calcPing(shardKey = this.currentShard) {
            const cfg = SHARDS[shardKey] || SHARDS.BR;
            // Realistic fluctuation based on basePing and jitter
            const delta = (Math.random() * 2 - 1) * cfg.jitter;
            return Math.max(8, Math.round(cfg.basePing + delta));
        }

        initPingTicker() {
            if (this.pingInterval) clearInterval(this.pingInterval);
            this.pingInterval = setInterval(() => {
                this.lastPing = this.calcPing();
                this.notify();
            }, 3200);
        }

        subscribe(callback) {
            this.listeners.push(callback);
            callback(this.currentShard, this.lastPing, this.getShardConfig());
        }

        notify() {
            const cfg = this.getShardConfig();
            this.listeners.forEach(cb => {
                try { cb(this.currentShard, this.lastPing, cfg); } catch (e) {}
            });
        }

        getPingColor(ping) {
            if (ping < 60) return '#10B981'; // Green
            if (ping < 140) return '#F59E0B'; // Amber
            return '#EF4444'; // Red
        }
    }

    // ==========================================================================
    // 5. INTERACTIVE SLIDING PUZZLE CAPTCHA WIDGET MODAL
    // ==========================================================================

    class SlidingCaptchaModal {
        constructor() {
            this.modal = null;
            this.canvasBg = null;
            this.canvasPiece = null;
            this.sliderThumb = null;
            this.sliderTrack = null;
            this.statusText = null;
            this.targetX = 180;
            this.targetY = 45;
            this.pieceSize = 42;
            this.tabSize = 9;
            this.canvasW = 320;
            this.canvasH = 160;
            this.isDragging = false;
            this.startX = 0;
            this.dragStartTime = 0;
            this.currentPieceX = 0;
            this.isVerified = false;
            this.resolveCallback = null;
            this.rejectCallback = null;
            this.initDOM();
        }

        initDOM() {
            if (document.getElementById('modalRiotCaptcha')) {
                this.modal = document.getElementById('modalRiotCaptcha');
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.id = 'modalRiotCaptcha';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'captchaTitle');

            overlay.innerHTML = `
                <div class="modal-box captcha-modal-box" style="max-width: 380px; padding: 24px; text-align: center; border: 1px solid rgba(235, 0, 41, 0.4); box-shadow: 0 20px 50px rgba(0,0,0,0.85);">
                    <button class="modal-close-btn" id="closeCaptchaBtn" aria-label="Fechar" data-i18n-aria="close_aria">&times;</button>
                    
                    <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom: 6px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--primary, #EB0029)">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                        </svg>
                        <h2 id="captchaTitle" data-i18n="captcha_title" style="font-size: 1.18rem; font-weight: 700; margin: 0; color: #FFF;">Verificação de Segurança</h2>
                    </div>
                    
                    <p data-i18n="captcha_puzzle_instruction" style="font-size: 0.82rem; color: #A1A1AA; margin-bottom: 14px;">
                        Deslize a peça para encaixar na área sombreada e confirmar que você é humano.
                    </p>

                    <!-- Canvas Container -->
                    <div class="captcha-stage-wrapper" style="position: relative; width: 320px; height: 160px; margin: 0 auto 16px auto; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: inset 0 0 20px rgba(0,0,0,0.6); background: #0c0d12;">
                        <canvas id="captchaCanvasBg" width="320" height="160" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
                        <canvas id="captchaCanvasPiece" width="320" height="160" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.85));"></canvas>
                        
                        <button type="button" id="btnRefreshCaptcha" title="Gerar novo quebra-cabeça" data-i18n-title="captcha_reload" style="position: absolute; top: 8px; right: 8px; background: rgba(0, 0, 0, 0.65); border: 1px solid rgba(255, 255, 255, 0.2); color: #FFF; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: transform 0.2s;">
                            ↻
                        </button>
                    </div>

                    <!-- Slider Control -->
                    <div class="captcha-slider-container" style="position: relative; width: 320px; height: 44px; margin: 0 auto; background: #27272A; border-radius: 22px; border: 1px solid #3F3F46; user-select: none; touch-action: none; overflow: hidden;">
                        <div class="captcha-slider-progress" id="captchaSliderProgress" style="position: absolute; left: 0; top: 0; height: 100%; width: 0; background: linear-gradient(90deg, rgba(235, 0, 41, 0.4), var(--primary, #EB0029)); border-radius: 22px; transition: background 0.2s;"></div>
                        <div class="captcha-slider-label" data-i18n="captcha_slide_right" style="position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; color: #A1A1AA; pointer-events: none; letter-spacing: 0.5px;">
                            Deslize para a direita ➔
                        </div>
                        <div class="captcha-slider-thumb" id="captchaSliderThumb" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Controle deslizante do quebra-cabeça de verificação" data-i18n-aria="captcha_slider_aria" style="position: absolute; left: 2px; top: 2px; width: 40px; height: 40px; background: #FFF; border-radius: 50%; cursor: grab; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); color: #111; font-weight: bold; font-size: 1.1rem; transition: background-color 0.2s, box-shadow 0.2s; outline-offset: 2px;">
                            ➔
                        </div>
                    </div>

                    <!-- Status Feedback Text -->
                    <div id="captchaStatusMsg" aria-live="polite" data-i18n="captcha_infrastructure_msg" style="margin-top: 12px; font-size: 0.78rem; min-height: 18px; color: #A1A1AA; font-weight: 600;">
                        Segurança protegida pela infraestrutura Riot Games.
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            this.modal = overlay;
            if (window.i18n && typeof window.i18n.updateDOM === 'function') {
                window.i18n.updateDOM();
            }

            this.canvasBg = overlay.querySelector('#captchaCanvasBg');
            this.canvasPiece = overlay.querySelector('#captchaCanvasPiece');
            this.sliderThumb = overlay.querySelector('#captchaSliderThumb');
            this.sliderTrack = overlay.querySelector('.captcha-slider-container');
            this.statusText = overlay.querySelector('#captchaStatusMsg');

            overlay.querySelector('#closeCaptchaBtn').addEventListener('click', () => this.close(false));
            overlay.querySelector('#btnRefreshCaptcha').addEventListener('click', () => {
                if (window.riotAudio) window.riotAudio.play('click');
                this.generatePuzzle();
            });

            this.bindEvents();
        }

        bindEvents() {
            this.trajectory = [];

            const onDragStart = (clientX, clientY) => {
                if (this.isVerified) return;
                this.isDragging = true;
                this.startX = clientX;
                this.dragStartTime = Date.now();
                this.trajectory = [{ x: clientX, y: clientY || 0, t: this.dragStartTime }];
                this.sliderThumb.style.cursor = 'grabbing';
            };

            const onDragMove = (clientX, clientY) => {
                if (!this.isDragging) return;
                this.trajectory.push({ x: clientX, y: clientY || 0, t: Date.now() });
                const rect = this.sliderTrack.getBoundingClientRect();
                const maxDrag = rect.width - 44;
                let moveX = clientX - rect.left - 20;
                moveX = Math.max(0, Math.min(moveX, maxDrag));

                this.sliderThumb.style.left = `${moveX + 2}px`;
                const progress = this.modal.querySelector('#captchaSliderProgress');
                if (progress) progress.style.width = `${moveX + 22}px`;

                // Map slider movement to puzzle piece horizontally
                const maxPieceShift = this.canvasW - this.pieceSize - 20;
                this.currentPieceX = (moveX / maxDrag) * maxPieceShift;
                this.renderPiece(this.currentPieceX, this.targetY);
            };

            const onDragEnd = () => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.sliderThumb.style.cursor = 'grab';
                this.checkVerification();
            };

            // Mouse events
            this.sliderThumb.addEventListener('mousedown', (e) => onDragStart(e.clientX, e.clientY));
            window.addEventListener('mousemove', (e) => onDragMove(e.clientX, e.clientY));
            window.addEventListener('mouseup', onDragEnd);

            // Touch events
            this.sliderThumb.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) onDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) onDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }, { passive: true });

            window.addEventListener('touchend', onDragEnd);

            // WCAG AAA Keyboard Slider Navigation
            this.sliderThumb.addEventListener('keydown', (e) => {
                if (this.isVerified) return;
                const maxDrag = 276;
                let currentVal = parseFloat(this.sliderThumb.getAttribute('aria-valuenow') || '0');
                let step = 5;

                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentVal = Math.min(100, currentVal + step);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentVal = Math.max(0, currentVal - step);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    currentVal = 0;
                } else if (e.key === 'End') {
                    e.preventDefault();
                    currentVal = 100;
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.isDragging = false;
                    this.checkVerification();
                    return;
                } else {
                    return;
                }

                this.sliderThumb.setAttribute('aria-valuenow', Math.round(currentVal));
                const moveX = (currentVal / 100) * maxDrag;
                this.sliderThumb.style.left = `${moveX + 2}px`;

                const progress = this.modal.querySelector('#captchaSliderProgress');
                if (progress) progress.style.width = `${moveX + 22}px`;

                const maxPieceShift = this.canvasW - this.pieceSize - 20;
                this.currentPieceX = (moveX / maxDrag) * maxPieceShift;
                this.renderPiece(this.currentPieceX, this.targetY);
            });
        }

        drawJigsawPath(ctx, x, y, size, tab) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            // Top edge with upward tab
            ctx.lineTo(x + size * 0.35, y);
            ctx.bezierCurveTo(x + size * 0.35, y - tab, x + size * 0.65, y - tab, x + size * 0.65, y);
            ctx.lineTo(x + size, y);
            // Right edge with rightward tab
            ctx.lineTo(x + size, y + size * 0.35);
            ctx.bezierCurveTo(x + size + tab, y + size * 0.35, x + size + tab, y + size * 0.65, x + size, y + size * 0.65);
            ctx.lineTo(x + size, y + size);
            // Bottom edge with downward tab
            ctx.lineTo(x + size * 0.65, y + size);
            ctx.bezierCurveTo(x + size * 0.65, y + size + tab, x + size * 0.35, y + size + tab, x + size * 0.35, y + size);
            ctx.lineTo(x, y + size);
            // Left edge
            ctx.lineTo(x, y);
            ctx.closePath();
        }

        generatePuzzle() {
            if (!this.canvasBg || !this.canvasPiece) return;
            const ctxBg = this.canvasBg.getContext('2d');
            const ctxPiece = this.canvasPiece.getContext('2d');

            // Pick random target position
            this.targetX = Math.floor(130 + Math.random() * (this.canvasW - 130 - this.pieceSize - 15));
            this.targetY = Math.floor(25 + Math.random() * (this.canvasH - this.pieceSize - 35));

            // Reset slider
            this.sliderThumb.style.left = '2px';
            const progress = this.modal.querySelector('#captchaSliderProgress');
            if (progress) progress.style.width = '0';
            this.sliderThumb.style.backgroundColor = '#FFF';
            this.sliderThumb.innerHTML = '➔';
            this.statusText.textContent = 'Arraste para encaixar a peça';
            this.statusText.style.color = '#A1A1AA';

            // 1. Draw rich background on ctxBg
            this.renderThemedBackground(ctxBg);

            // 2. Punch cutout slot on background
            ctxBg.save();
            this.drawJigsawPath(ctxBg, this.targetX, this.targetY, this.pieceSize, this.tabSize);
            ctxBg.fillStyle = 'rgba(0, 0, 0, 0.72)';
            ctxBg.fill();
            ctxBg.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctxBg.lineWidth = 2;
            ctxBg.setLineDash([4, 4]);
            ctxBg.stroke();
            ctxBg.restore();

            // 3. Render initial piece at position 0
            this.currentPieceX = 0;
            this.renderPiece(0, this.targetY);
        }

        renderThemedBackground(ctx) {
            const w = this.canvasW;
            const h = this.canvasH;
            const theme = document.documentElement.getAttribute('data-theme') || 'riot';

            // Base gradient
            const grad = ctx.createLinearGradient(0, 0, w, h);
            if (theme === 'valorant') {
                grad.addColorStop(0, '#0f1923');
                grad.addColorStop(0.5, '#1e2833');
                grad.addColorStop(1, '#ff4655');
            } else if (theme === 'lol') {
                grad.addColorStop(0, '#010a10');
                grad.addColorStop(0.6, '#091428');
                grad.addColorStop(1, '#c8aa6d');
            } else if (theme === 'tft') {
                grad.addColorStop(0, '#13092d');
                grad.addColorStop(0.5, '#2b1055');
                grad.addColorStop(1, '#9d4edd');
            } else {
                grad.addColorStop(0, '#0a0a0d');
                grad.addColorStop(0.5, '#18181f');
                grad.addColorStop(1, '#eb0029');
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // High-tech Cyber Grid Lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= w; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y <= h; y += 20) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Tactical diagonal cuts & radar circles
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 25, 0, Math.PI * 2);
            ctx.stroke();

            // Riot Emblem Silhouette
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.font = "900 36px 'Lexend Deca', sans-serif";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(theme.toUpperCase(), w / 2, h / 2);
            ctx.restore();
        }

        renderPiece(xPos, yPos) {
            const ctxPiece = this.canvasPiece.getContext('2d');
            ctxPiece.clearRect(0, 0, this.canvasW, this.canvasH);

            ctxPiece.save();
            // Create clipping mask of the jigsaw piece at current position
            this.drawJigsawPath(ctxPiece, xPos, yPos, this.pieceSize, this.tabSize);
            ctxPiece.clip();

            // Draw the underlying background shifted into the cutout
            const shiftX = xPos - this.targetX;
            ctxPiece.drawImage(this.canvasBg, shiftX, 0);

            // Glow border around piece
            ctxPiece.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctxPiece.lineWidth = 2.5;
            this.drawJigsawPath(ctxPiece, xPos, yPos, this.pieceSize, this.tabSize);
            ctxPiece.stroke();

            ctxPiece.restore();
        }

        checkVerification() {
            const delta = Math.abs(this.currentPieceX - this.targetX);
            const duration = Date.now() - this.dragStartTime;
            const tolerance = 6.5; // pixel tolerance
            const trajectoryPoints = (this.trajectory && this.trajectory.length) || 0;
            const isHumanPaced = duration >= 160 && duration <= 15000 && trajectoryPoints >= 3;

            if (delta <= tolerance && isHumanPaced) {
                // SUCCESS
                this.isVerified = true;
                this.sliderThumb.style.backgroundColor = '#10B981';
                this.sliderThumb.style.color = '#FFF';
                this.sliderThumb.innerHTML = '✓';
                const progress = this.modal.querySelector('#captchaSliderProgress');
                if (progress) progress.style.background = '#10B981';

                this.statusText.textContent = window.i18n ? window.i18n.t('captcha_success') : '✓ Verificação concluída com sucesso!';
                this.statusText.style.color = '#10B981';

                // Snap piece into position
                this.renderPiece(this.targetX, this.targetY);

                if (window.riotAudio) window.riotAudio.play('success');

                setTimeout(() => {
                    this.close(true);
                    if (this.resolveCallback) this.resolveCallback(true);
                }, 550);
            } else if (delta <= tolerance && !isHumanPaced) {
                // Bot jump detected
                if (window.riotAudio) window.riotAudio.play('error');
                this.sliderThumb.style.backgroundColor = '#EF4444';
                this.sliderThumb.style.color = '#FFF';
                this.sliderThumb.innerHTML = '✕';
                this.statusText.textContent = 'Movimento não natural detectado. Arraste manualmente.';
                this.statusText.style.color = '#EF4444';

                const box = this.modal.querySelector('.modal-box');
                if (box) {
                    box.classList.add('animate-shake');
                    setTimeout(() => box.classList.remove('animate-shake'), 400);
                }

                setTimeout(() => {
                    this.generatePuzzle();
                }, 750);
            } else {
                // FAILURE
                if (window.riotAudio) window.riotAudio.play('error');
                this.sliderThumb.style.backgroundColor = '#EF4444';
                this.sliderThumb.style.color = '#FFF';
                this.sliderThumb.innerHTML = '✕';
                this.statusText.textContent = window.i18n ? window.i18n.t('captcha_failed') : 'Encaixe incorreto. Tente novamente.';
                this.statusText.style.color = '#EF4444';

                // Shake modal box
                const box = this.modal.querySelector('.modal-box');
                if (box) {
                    box.classList.add('animate-shake');
                    setTimeout(() => box.classList.remove('animate-shake'), 400);
                }

                setTimeout(() => {
                    this.generatePuzzle();
                }, 600);
            }
        }

        prompt() {
            return new Promise((resolve, reject) => {
                this.resolveCallback = resolve;
                this.rejectCallback = reject;
                this.isVerified = false;
                this.generatePuzzle();
                this.modal.classList.add('active');
            });
        }

        close(verified = false) {
            if (this.modal) this.modal.classList.remove('active');
            if (!verified && this.rejectCallback) {
                this.rejectCallback(new Error('Captcha cancelled'));
            }
        }
    }

    // ==========================================================================
    // 6. WEBAUTHN BIOMETRIC PASSKEY MODULE (Real + Simulation Fallback)
    // ==========================================================================

    class WebAuthnManager {
        constructor() {
            this.modal = null;
            this.initModalDOM();
        }

        isAvailable() {
            return !!(window.PublicKeyCredential && navigator.credentials);
        }

        initModalDOM() {
            if (document.getElementById('modalBiometricPasskey')) {
                this.modal = document.getElementById('modalBiometricPasskey');
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.id = 'modalBiometricPasskey';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');

            overlay.innerHTML = `
                <div class="modal-box" style="max-width: 400px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 20px 50px rgba(0,0,0,0.85);">
                    <button class="modal-close-btn" id="closeBiometricBtn" aria-label="Fechar">&times;</button>
                    
                    <h2 style="font-size: 1.25rem; font-weight: 700; color: #FFF; margin-bottom: 6px;">Autenticação Biométrica</h2>
                    <p style="font-size: 0.85rem; color: #A1A1AA; margin-bottom: 20px;">
                        Passkey WebAuthn (FIDO2) de alta segurança vinculada ao hardware.
                    </p>

                    <!-- Sensor Visual Icon -->
                    <div id="bioSensorBtn" style="position: relative; width: 96px; height: 96px; margin: 0 auto 20px auto; border-radius: 50%; background: #27272A; border: 2px solid #3F3F46; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
                        <svg id="bioFingerprintSvg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10"/>
                            <path d="M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
                            <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4"/>
                            <path d="M12 12v3"/>
                            <path d="M12 18.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                            <path d="M9 16c.83 1.2 2.14 2 3.65 2 1.35 0 2.55-.65 3.35-1.65"/>
                            <path d="M6 15c1.4 2.8 4.2 4.7 7.5 4.7s6.1-1.9 7.5-4.7"/>
                        </svg>
                        <div id="bioScanLine" style="position: absolute; width: 80%; height: 2px; background: #10B981; box-shadow: 0 0 8px #10B981; top: 15%; display: none;"></div>
                    </div>

                    <!-- Terminal readout -->
                    <div id="bioTerminalLogs" style="background: #111116; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px 12px; font-family: monospace; font-size: 0.72rem; color: #10B981; text-align: left; height: 75px; overflow-y: auto; margin-bottom: 20px;">
                        <div>> Aguardando leitura do sensor biométrico...</div>
                    </div>

                    <div class="modal-actions" style="margin-top: 10px;">
                        <button type="button" class="btn-action-primary" id="btnBioTriggerAction" style="background: #10B981;">
                            Escanear Biometria
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            this.modal = overlay;

            overlay.querySelector('#closeBiometricBtn').addEventListener('click', () => {
                this.modal.classList.remove('active');
            });
        }

        log(msg, color = '#10B981') {
            const terminal = this.modal.querySelector('#bioTerminalLogs');
            if (terminal) {
                const line = document.createElement('div');
                line.style.color = color;
                line.textContent = `> ${msg}`;
                terminal.appendChild(line);
                terminal.scrollTop = terminal.scrollHeight;
            }
        }

        async registerPasskey(username) {
            try {
                if (this.isAvailable() && window.location.protocol.startsWith('http')) {
                    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
                    const credential = await navigator.credentials.create({
                        publicKey: {
                            challenge,
                            rp: { name: 'Riot Games Client', id: window.location.hostname || 'localhost' },
                            user: {
                                id: new TextEncoder().encode(username),
                                name: username,
                                displayName: username
                            },
                            pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
                            authenticatorSelection: { userVerification: 'preferred' },
                            timeout: 60000
                        }
                    });

                    if (credential) {
                        this.saveRegisteredPasskey(username, credential.id);
                        return { success: true, native: true, id: credential.id };
                    }
                }
            } catch (err) {
                console.warn('[WebAuthn] Native create skipped or unsupported, falling back to simulated UI:', err);
            }

            // Fallback simulation
            return this.promptSimulatedAuth(username, 'register');
        }

        async authenticatePasskey(username) {
            try {
                if (this.isAvailable() && window.location.protocol.startsWith('http')) {
                    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
                    const assertion = await navigator.credentials.get({
                        publicKey: {
                            challenge,
                            rpId: window.location.hostname || 'localhost',
                            userVerification: 'preferred',
                            timeout: 60000
                        }
                    });

                    if (assertion) {
                        return { success: true, native: true, user: username };
                    }
                }
            } catch (err) {
                console.warn('[WebAuthn] Native get skipped, using interactive simulation fallback:', err);
            }

            return this.promptSimulatedAuth(username, 'login');
        }

        saveRegisteredPasskey(username, credentialId = 'passkey_' + Date.now()) {
            const stored = JSON.parse(localStorage.getItem(PASSKEYS_STORAGE_KEY) || '[]');
            if (!stored.some(p => p.username.toLowerCase() === username.toLowerCase())) {
                stored.push({
                    username,
                    credentialId,
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem(PASSKEYS_STORAGE_KEY, JSON.stringify(stored));
            }
        }

        hasPasskey(username) {
            const stored = JSON.parse(localStorage.getItem(PASSKEYS_STORAGE_KEY) || '[]');
            return stored.some(p => p.username.toLowerCase() === username.toLowerCase());
        }

        promptSimulatedAuth(username, mode = 'login') {
            return new Promise((resolve) => {
                this.modal.classList.add('active');
                const terminal = this.modal.querySelector('#bioTerminalLogs');
                if (terminal) terminal.innerHTML = '';
                this.log(`Iniciando WebAuthn [${mode.toUpperCase()}] para: ${username}...`);

                const sensorBtn = this.modal.querySelector('#bioSensorBtn');
                const actionBtn = this.modal.querySelector('#btnBioTriggerAction');
                const scanLine = this.modal.querySelector('#bioScanLine');
                const svg = this.modal.querySelector('#bioFingerprintSvg');

                actionBtn.textContent = mode === 'register' ? 'Registrar Minha Biometria' : 'Escanear Minha Digital';
                sensorBtn.style.borderColor = '#3F3F46';
                svg.style.stroke = '#A1A1AA';
                scanLine.style.display = 'none';

                const runScan = () => {
                    actionBtn.disabled = true;
                    sensorBtn.style.borderColor = '#10B981';
                    svg.style.stroke = '#10B981';
                    scanLine.style.display = 'block';
                    if (window.riotAudio) window.riotAudio.play('focus');

                    // Animate scanline
                    let scanStep = 0;
                    const interval = setInterval(() => {
                        scanStep += 10;
                        scanLine.style.top = `${15 + (scanStep % 70)}%`;
                    }, 50);

                    this.log('Gerando desafio criptográfico SHA-256...');
                    setTimeout(() => {
                        this.log('Autenticador de Plataforma respondendo...');
                    }, 400);

                    setTimeout(() => {
                        this.log('Assinatura ECDSA validada com sucesso!', '#10B981');
                        clearInterval(interval);
                        scanLine.style.display = 'none';
                        sensorBtn.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.6)';

                        this.saveRegisteredPasskey(username);
                        if (window.riotAudio) window.riotAudio.play('success');

                        setTimeout(() => {
                            this.modal.classList.remove('active');
                            actionBtn.disabled = false;
                            sensorBtn.style.boxShadow = 'none';
                            resolve({ success: true, simulated: true, user: username });
                        }, 700);
                    }, 1200);
                };

                const cleanAction = () => {
                    actionBtn.removeEventListener('click', cleanAction);
                    sensorBtn.removeEventListener('click', cleanAction);
                    runScan();
                };

                actionBtn.addEventListener('click', cleanAction);
                sensorBtn.addEventListener('click', cleanAction);
            });
        }
    }

    // ==========================================================================
    // 7. MAIN RIOT SECURITY CONTROLLER & INITIALIZER
    // ==========================================================================

    class RiotSecurityController {
        constructor() {
            this.cryptoStorage = new RiotCryptoStorage();
            this.riotId = new RiotIdManager();
            this.shards = new ShardManager();
            this.captcha = new SlidingCaptchaModal();
            this.webauthn = new WebAuthnManager();
            this.failedAttempts = 0;

            this.init();
        }

        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.bindUI());
            } else {
                this.bindUI();
            }
        }

        bindUI() {
            this.setupShardSelectorUI();
            this.setupRiotIdLiveInputs();
            this.setupBiometricButton();
            this.setupCryptoSessionRestore();
            this.hookMockAuthInterception();
        }

        // --- Shard Selector & Ping Badge UI ---
        setupShardSelectorUI() {
            const topControls = document.querySelector('.top-controls');
            if (!topControls) return;

            // 1. Shard Select Element
            let shardSelect = document.getElementById('shardSelector');
            if (!shardSelect) {
                shardSelect = document.createElement('select');
                shardSelect.id = 'shardSelector';
                shardSelect.className = 'control-select';
                shardSelect.setAttribute('aria-label', 'Seletor de Shard / Região');

                const shardsObj = this.shards.getShards();
                Object.keys(shardsObj).forEach(key => {
                    const item = shardsObj[key];
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.textContent = `${item.flag} ${key} — ${item.name}`;
                    if (key === this.shards.getCurrentShard()) opt.selected = true;
                    shardSelect.appendChild(opt);
                });

                // Insert before theme selector or at end
                const themeSelector = document.getElementById('themeSelector');
                if (themeSelector) {
                    topControls.insertBefore(shardSelect, themeSelector);
                } else {
                    topControls.appendChild(shardSelect);
                }

                shardSelect.addEventListener('change', (e) => {
                    this.shards.setShard(e.target.value);
                });
            }

            // 2. Ping Live Indicator Pill
            let pingBadge = document.getElementById('shardPingBadge');
            if (!pingBadge) {
                pingBadge = document.createElement('button');
                pingBadge.type = 'button';
                pingBadge.id = 'shardPingBadge';
                pingBadge.className = 'control-btn';
                pingBadge.title = 'Status do Servidor Riot & Latência em tempo real (Clique para detalhes)';
                pingBadge.style.display = 'inline-flex';
                pingBadge.style.alignItems = 'center';
                pingBadge.style.gap = '6px';
                pingBadge.style.fontFamily = 'monospace';

                topControls.insertBefore(pingBadge, shardSelect);

                pingBadge.addEventListener('click', () => {
                    this.showShardStatusModal();
                });
            }

            // Subscribe to ping changes
            this.shards.subscribe((shard, ping, cfg) => {
                if (shardSelect && shardSelect.value !== shard) shardSelect.value = shard;
                if (pingBadge) {
                    const color = this.shards.getPingColor(ping);
                    pingBadge.innerHTML = `
                        <span style="width: 7px; height: 7px; border-radius: 50%; background: ${color}; box-shadow: 0 0 6px ${color};"></span>
                        <span style="color: ${color}; font-weight: bold;">${ping} ms</span>
                        <span style="opacity: 0.7; font-size: 0.72rem;">(${shard})</span>
                    `;
                }
            });
        }

        // --- Detailed Shard Status Modal ---
        showShardStatusModal() {
            let modal = document.getElementById('modalShardDetails');
            if (!modal) {
                modal = document.createElement('div');
                modal.className = 'modal-overlay';
                modal.id = 'modalShardDetails';
                modal.innerHTML = `
                    <div class="modal-box" style="max-width: 540px; border: 1px solid rgba(255,255,255,0.15);">
                        <button class="modal-close-btn" id="closeShardModalBtn">&times;</button>
                        <h2 style="font-size: 1.3rem; margin-bottom: 6px; color: #FFF; display:flex; align-items:center; gap:8px;">
                            <span>🌐</span> Status dos Servidores Globais Riot
                        </h2>
                        <p style="font-size: 0.82rem; color: #A1A1AA; margin-bottom: 16px;">
                            Infraestrutura distribuída com roteamento Riot Direct Anycast e 128Hz Sub-tick.
                        </p>

                        <div id="shardListGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; max-height: 320px; overflow-y: auto; padding-right: 4px;">
                        </div>

                        <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; font-size: 0.78rem; color: #A1A1AA;">
                            <span>Status Global: <strong style="color: #10B981;">99.98% Uptime</strong></span>
                            <span>Direct Anycast v3.4</span>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                modal.querySelector('#closeShardModalBtn').addEventListener('click', () => modal.classList.remove('active'));
            }

            const grid = modal.querySelector('#shardListGrid');
            const allShards = this.shards.getShards();
            const cur = this.shards.getCurrentShard();
            grid.innerHTML = '';

            Object.keys(allShards).forEach(key => {
                const s = allShards[key];
                const ping = this.shards.calcPing(key);
                const color = this.shards.getPingColor(ping);
                const isSelected = key === cur;

                const card = document.createElement('div');
                card.style.background = isSelected ? 'rgba(235, 0, 41, 0.15)' : '#27272A';
                card.style.border = isSelected ? '1px solid var(--primary, #EB0029)' : '1px solid #3F3F46';
                card.style.borderRadius = '8px';
                card.style.padding = '10px 12px';
                card.style.cursor = 'pointer';
                card.style.transition = 'all 0.2s';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-weight: 700; font-size: 0.9rem; color: #FFF;">${s.flag} ${key}</span>
                        <span style="color: ${color}; font-family: monospace; font-weight: bold; font-size: 0.82rem;">${ping} ms</span>
                    </div>
                    <div style="font-size: 0.75rem; color: #A1A1AA; margin-bottom: 2px;">${s.name} (${s.city})</div>
                    <div style="font-size: 0.7rem; color: #10B981; display:flex; align-items:center; gap:4px;">
                        <span>●</span> ${s.status} • ${s.tickrate} Tick
                    </div>
                `;

                card.addEventListener('click', () => {
                    this.shards.setShard(key);
                    modal.classList.remove('active');
                });

                grid.appendChild(card);
            });

            modal.classList.add('active');
        }

        // --- Riot ID Live Validation & Tagline Generation ---
        setupRiotIdLiveInputs() {
            const userInput = document.getElementById('usernameInput');
            if (userInput) {
                let badge = document.getElementById('riotIdLoginBadge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.id = 'riotIdLoginBadge';
                    userInput.parentNode.appendChild(badge);
                }
                this.riotId.attachLiveValidator(userInput, badge);

                const btnGenTag = document.getElementById('btnLoginGenTag');
                if (btnGenTag) {
                    btnGenTag.addEventListener('click', (e) => {
                        e.preventDefault();
                        const tag = this.riotId.generateTag(this.shards.getCurrentShard());
                        const curVal = userInput.value.trim();
                        if (curVal.includes('#')) {
                            userInput.value = `${curVal.split('#')[0]}#${tag}`;
                        } else {
                            userInput.value = `${curVal || 'Player'}#${tag}`;
                        }
                        userInput.dispatchEvent(new Event('input', { bubbles: true }));
                        if (window.riotAudio) window.riotAudio.play('click');
                    });
                }
            }

            const regInput = document.getElementById('regUsername');
            if (regInput) {
                let badge = document.getElementById('riotIdRegBadge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.id = 'riotIdRegBadge';
                    regInput.parentNode.appendChild(badge);
                }
                this.riotId.attachLiveValidator(regInput, badge);

                const btnRegGenTag = document.getElementById('btnRegGenTag');
                if (btnRegGenTag) {
                    btnRegGenTag.addEventListener('click', (e) => {
                        e.preventDefault();
                        const tag = this.riotId.generateTag(this.shards.getCurrentShard());
                        const curVal = regInput.value.trim();
                        if (curVal.includes('#')) {
                            regInput.value = `${curVal.split('#')[0]}#${tag}`;
                        } else {
                            regInput.value = `${curVal || 'Player'}#${tag}`;
                        }
                        regInput.dispatchEvent(new Event('input', { bubbles: true }));
                        if (window.riotAudio) window.riotAudio.play('click');
                    });
                }
            }

            const testCaptchaLink = document.getElementById('linkSecurityTest');
            if (testCaptchaLink) {
                testCaptchaLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.riotAudio) window.riotAudio.play('click');
                    this.captcha.prompt().catch(() => {});
                });
            }
        }

        // --- Biometric Passkey Login Button ---
        setupBiometricButton() {
            const iconsContainer = document.querySelector('.login__icons');
            if (!iconsContainer) return;

            if (document.getElementById('btnPasskeyAuth')) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'icons__button';
            btn.id = 'btnPasskeyAuth';
            btn.title = 'Entrar com Biometria / WebAuthn Passkey';
            btn.style.background = '#18181B';
            btn.style.border = '1px solid #10B981';

            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10"/>
                    <path d="M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
                    <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4"/>
                    <path d="M12 12v3"/>
                    <path d="M12 18.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                </svg>
            `;

            iconsContainer.appendChild(btn);

            btn.addEventListener('click', async () => {
                const u = document.getElementById('usernameInput');
                const targetUser = (u && u.value.trim()) || 'player1';
                if (window.riotAudio) window.riotAudio.play('click');

                const res = await this.webauthn.authenticatePasskey(targetUser);
                if (res && res.success) {
                    if (u) {
                        u.value = res.user;
                        u.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    const passInput = document.getElementById('passwordInput');
                    if (passInput) {
                        passInput.value = 'password123';
                        passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    if (window.showRiotToast) {
                        window.showRiotToast(`Biometria verificada! Entrando como ${res.user}...`, 'success');
                    }

                    // Directly trigger verified login
                    if (window.mockAuth) {
                        window.mockAuth.verify2FA(res.user, '123456');
                    }
                }
            });
        }

        // --- Remember Me with Web Cryptography AES-256-GCM ---
        async setupCryptoSessionRestore() {
            const restored = await this.cryptoStorage.restoreSessionVault();
            if (restored && restored.username) {
                const u = document.getElementById('usernameInput');
                if (u && !u.value) {
                    u.value = restored.username;
                    u.dispatchEvent(new Event('input', { bubbles: true }));
                }
                const cb = document.getElementById('rememberCheckbox');
                if (cb) cb.checked = true;

                if (window.showRiotToast) {
                    window.showRiotToast(`Sessão segura restaurada via Web Crypto Token (AES-256-GCM): ${restored.username}`, 'info');
                }
            }
        }

        // --- Hook into mockAuth for Captcha & Crypto storage ---
        hookMockAuthInterception() {
            // Listen for login clicks to require sliding captcha challenge
            const submitBtn = document.getElementById('loginSubmitBtn');
            const userInput = document.getElementById('usernameInput');
            const passInput = document.getElementById('passwordInput');
            const rememberCb = document.getElementById('rememberCheckbox');

            if (submitBtn) {
                // Wrap click listener with captcha requirement
                submitBtn.addEventListener('click', async (e) => {
                    if (!userInput || !passInput) return;
                    if (!userInput.value.trim() || passInput.value.length < 8) return;

                    // If not yet verified by captcha in this interaction, prompt it!
                    if (!this.captcha.isVerified) {
                        e.stopImmediatePropagation();
                        e.preventDefault();

                        try {
                            const verified = await this.captcha.prompt();
                            if (verified) {
                                // Resume login
                                if (window.mockAuth) {
                                    window.mockAuth.login(userInput.value.trim(), passInput.value, rememberCb?.checked);
                                }
                            }
                        } catch (err) {
                            // User closed captcha
                        }
                    }
                }, true); // capture phase
            }

            // Hook auth success to save encrypted session
            window.addEventListener('auth:success', async (e) => {
                this.failedAttempts = 0;
                this.captcha.isVerified = false; // Reset for next session

                if (rememberCb?.checked && e.detail && e.detail.user) {
                    await this.cryptoStorage.saveSessionVault({
                        username: e.detail.user.username,
                        email: e.detail.user.email,
                        token: e.detail.user.token,
                        shard: this.shards.getCurrentShard()
                    });
                }
            });

            // On error, increment failed count and re-require captcha
            window.addEventListener('auth:error', () => {
                this.failedAttempts++;
                this.captcha.isVerified = false;
            });

            // On logout, clear encrypted vault
            window.addEventListener('auth:logout', () => {
                this.cryptoStorage.clearSessionVault();
                this.captcha.isVerified = false;
            });
        }
    }

    // Expose global instance
    window.RiotSecurity = new RiotSecurityController();
})();
