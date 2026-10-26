/**
 * ============================================================================
 * Riot Games Multi-Game Dynamic Theme Switcher Engine
 * Supports 6 Visually Distinct Gaming Ecosystem Themes:
 *  1. riot          - Riot Red & Black, aggressive hextech styling
 *  2. valorant      - Tactical Radiant Red/Off-white, angular geometric borders
 *  3. lol           - Hextech Blue & Gold, runic ornate borders, magical glowing accents
 *  4. tft           - Cosmic Starlight & Indigo, soft nebula gradients
 *  5. starguardian  - Pastel Pink, Magenta & Gold, magical girl glitter glow
 *  6. kda           - Neon Cyber Violet & Hot Pink, prestige pop-star dark cyber
 * ============================================================================
 */

class ThemeSwitcher {
    constructor() {
        this.storageKey = 'riot_theme_preference';
        this.legacyKey = 'riot_theme';
        this.defaultTheme = 'riot';
        this.supportedThemes = ['riot', 'valorant', 'lol', 'tft', 'starguardian', 'kda'];

        this.themeData = {
            riot: {
                id: 'riot',
                name: 'Riot Games',
                symbol: '⚡',
                color: '#eb0029',
                description: 'Agressivo, minimalista e clássico Hextech'
            },
            valorant: {
                id: 'valorant',
                name: 'Valorant',
                symbol: '🎯',
                color: '#ff4655',
                description: 'Tático, geométrico com ângulos chanfrados'
            },
            lol: {
                id: 'lol',
                name: 'League of Legends',
                symbol: '⚔️',
                color: '#c8aa6d',
                description: 'Ouro rúnico, azul Hextech e magia arcana'
            },
            tft: {
                id: 'tft',
                name: 'Teamfight Tactics',
                symbol: '🌌',
                color: '#9d4edd',
                description: 'Nebulosa cósmica, starlight e tons astrais'
            },
            starguardian: {
                id: 'starguardian',
                name: 'Star Guardian',
                symbol: '✨',
                color: '#ff66ab',
                description: 'Rosa pastel, magenta, dourado e brilho estelar'
            },
            kda: {
                id: 'kda',
                name: 'K/DA Pop-Stars',
                symbol: '💎',
                color: '#c026d3',
                description: 'Cyber violeta neon, ciano e luxo pop-star'
            }
        };

        this.init();
    }

    /**
     * Initializes theme from localStorage or default, and prepares UI hooks.
     */
    init() {
        const savedTheme = localStorage.getItem(this.storageKey) || 
                           localStorage.getItem(this.legacyKey) || 
                           this.defaultTheme;

        this.applyTheme(savedTheme, false);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }

        // Listen for storage events across tabs
        window.addEventListener('storage', (e) => {
            if ((e.key === this.storageKey || e.key === this.legacyKey) && e.newValue) {
                if (e.newValue !== this.getCurrentTheme()) {
                    this.applyTheme(e.newValue, false);
                }
            }
        });
    }

    /**
     * Normalizes theme string (handles aliases like star-guardian).
     */
    normalizeTheme(themeName) {
        if (!themeName || typeof themeName !== 'string') return this.defaultTheme;
        const cleaned = themeName.trim().toLowerCase();
        if (cleaned === 'star-guardian' || cleaned === 'starguardians') return 'starguardian';
        if (cleaned === 'league' || cleaned === 'league-of-legends') return 'lol';
        if (cleaned === 'teamfight-tactics') return 'tft';
        if (cleaned === 'k/da' || cleaned === 'kdapopstars') return 'kda';
        return this.supportedThemes.includes(cleaned) ? cleaned : this.defaultTheme;
    }

    /**
     * Returns the currently active theme identifier.
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || this.defaultTheme;
    }

    /**
     * Synthesizes or delegates audio whoosh feedback on theme transition.
     */
    playAudioWhoosh() {
        // Delegate to global audio engine if present
        if (window.riotAudio) {
            if (typeof window.riotAudio.playWhoosh === 'function') {
                window.riotAudio.playWhoosh();
                return;
            } else if (typeof window.riotAudio.play === 'function') {
                window.riotAudio.play('whoosh');
                return;
            }
        }

        // Self-contained Web Audio procedural fallback
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(130, now + 0.28);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.linearRampToValueAtTime(240, now + 0.28);

            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.28);
            setTimeout(() => ctx.close().catch(() => {}), 350);
        } catch (e) {
            // Audio context blocked or unsupported
        }
    }

    /**
     * Applies theme to DOM, saves preference, triggers audio and notifications.
     */
    applyTheme(themeName, playAudio = false) {
        const validTheme = this.normalizeTheme(themeName);
        const info = this.themeData[validTheme] || this.themeData[this.defaultTheme];

        // Apply theme attribute to html & body
        document.documentElement.setAttribute('data-theme', validTheme);
        if (document.body) {
            document.body.setAttribute('data-theme', validTheme);
        }

        // Persist preference
        try {
            localStorage.setItem(this.storageKey, validTheme);
            localStorage.setItem(this.legacyKey, validTheme);
        } catch (e) {}

        // Update mobile browser chrome color
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.setAttribute('name', 'theme-color');
            document.head.appendChild(metaTheme);
        }
        metaTheme.setAttribute('content', info.color);

        // Sync dropdown selectors
        const selectors = document.querySelectorAll('#themeSelector, #theme-selector, [data-theme-selector]');
        selectors.forEach(sel => {
            if (sel.tagName === 'SELECT') {
                sel.value = validTheme;
            }
        });

        // Sync theme buttons / chips
        const buttons = document.querySelectorAll('[data-theme-value]');
        buttons.forEach(btn => {
            const btnVal = this.normalizeTheme(btn.getAttribute('data-theme-value'));
            if (btnVal === validTheme) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // Sync any badge or title labels
        const badgeTitles = document.querySelectorAll('[data-theme-display-name]');
        badgeTitles.forEach(el => {
            el.textContent = `${info.symbol} ${info.name}`;
        });

        // Audio notification
        if (playAudio) {
            this.playAudioWhoosh();

            // Client HUD Toast feedback
            if (typeof window.showRiotToast === 'function') {
                window.showRiotToast(`${info.symbol} Tema: ${info.name.toUpperCase()}`, 'info');
            }
        }

        // Dispatch Custom Event for external listeners (Canvas VFX, Particles, Auth)
        window.dispatchEvent(new CustomEvent('riotThemeChanged', {
            detail: {
                theme: validTheme,
                themeData: info
            }
        }));
    }

    /**
     * Cycles through the 6 themes sequentially.
     */
    cycleTheme() {
        const current = this.getCurrentTheme();
        const currentIndex = this.supportedThemes.indexOf(current);
        const nextIndex = (currentIndex + 1) % this.supportedThemes.length;
        const nextTheme = this.supportedThemes[nextIndex];
        this.applyTheme(nextTheme, true);
        return nextTheme;
    }

    /**
     * Sets up UI event listeners and ensures all 6 themes exist in select dropdowns.
     */
    setupUI() {
        const current = this.getCurrentTheme();

        // 1. Setup Select Dropdowns
        const selectors = document.querySelectorAll('#themeSelector, #theme-selector, [data-theme-selector]');
        selectors.forEach(sel => {
            if (sel.tagName === 'SELECT') {
                // Ensure all 6 themes exist as options
                const existingValues = Array.from(sel.options).map(opt => this.normalizeTheme(opt.value));
                this.supportedThemes.forEach(themeKey => {
                    if (!existingValues.includes(themeKey)) {
                        const opt = document.createElement('option');
                        opt.value = themeKey;
                        const data = this.themeData[themeKey];
                        opt.textContent = `${data.symbol} ${data.name}`;
                        sel.appendChild(opt);
                    }
                });

                sel.value = current;

                if (!sel._themeBound) {
                    sel._themeBound = true;
                    sel.addEventListener('change', (e) => {
                        this.applyTheme(e.target.value, true);
                    });
                }
            }
        });

        // 2. Setup Theme Buttons / Chips
        const buttons = document.querySelectorAll('[data-theme-value]');
        buttons.forEach(btn => {
            const val = this.normalizeTheme(btn.getAttribute('data-theme-value'));
            if (val === current) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }

            if (!btn._themeBound) {
                btn._themeBound = true;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.applyTheme(val, true);
                });
            }
        });
    }
}

// Instantiate globally on window
window.riotThemeSwitcher = new ThemeSwitcher();
