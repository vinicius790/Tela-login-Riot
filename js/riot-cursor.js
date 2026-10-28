/**
 * riot-cursor.js - Cybernetic HUD Cursor & Micro-Interactions Engine
 * Riot Games / Hextech Cybernetic Design System
 * 
 * Features:
 *   1. Cybernetic HUD Cursor:
 *      - Spring-damper Euler physics pointer tracking (stiffness k=0.22, damping c=0.72)
 *      - Dynamic crosshair scaling & spread based on instantaneous mouse velocity
 *      - Magnetic lock-on snapping when hovering interactive elements (button, input, a, .interactive)
 *      - Click impulse shockwave (expanding canvas rings) & energetic spark particle burst
 *      - Trailing spark particles with Hextech palette (#00f0ff, #c8aa6e, #eb0029, #ffffff)
 *      - Hotkey toggle (Alt+C) & backdrop double-click toggle
 *      - Local preference persistence via localStorage ('riot_custom_cursor')
 *   2. Micro-Interactions:
 *      - Hextech ripple click effect dynamically attached to all interactive buttons
 *      - Event-delegated dynamic targeting for modals and dynamically injected elements
 *   3. WCAG AAA Compliance:
 *      - Respects prefers-reduced-motion media query with real-time OS preference change listener
 *      - Smooth deactivation/activation and complete restoration of default OS cursor
 */

(function () {
    'use strict';

    class RiotCursorEngine {
        constructor() {
            this.storageKey = 'riot_custom_cursor';
            this.pos = { x: -100, y: -100 };
            this.target = { x: -100, y: -100 };
            this.vel = { x: 0, y: 0 };
            this.k = 0.22;       // Spring stiffness
            this.damp = 0.72;    // Damping factor
            this.velocity = 0;   // Smoothed mouse speed in px/ms
            this.lastX = -100;
            this.lastY = -100;
            this.lastTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            
            this.isHovering = false;
            this.isClicking = false;
            this.hoveredEl = null;
            
            this.particles = [];
            this.shockwaves = [];
            
            this.canvas = null;
            this.ctx = null;
            this.cursorEl = null;
            this.dotEl = null;
            this.animId = null;
            this.initialized = false;

            // Check OS prefers-reduced-motion
            this.reducedMotion = typeof window !== 'undefined' && 
                window.matchMedia && 
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Load persisted preference
            let savedPref = null;
            try {
                if (typeof localStorage !== 'undefined') {
                    savedPref = localStorage.getItem(this.storageKey);
                }
            } catch (err) {
                savedPref = null;
            }

            if (savedPref === 'disabled') {
                this.enabled = false;
            } else if (savedPref === 'enabled') {
                this.enabled = !this.reducedMotion;
            } else {
                // Default: enabled unless reduced motion is requested
                this.enabled = !this.reducedMotion;
            }

            if (typeof document !== 'undefined') {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.init());
                } else {
                    this.init();
                }
            }
        }

        init() {
            if (this.initialized || typeof document === 'undefined') return;
            this.initialized = true;

            // Canvas for sparks & shockwaves
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'riotCursorCanvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '99998';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });

            // Cybernetic HUD Cursor Outer Reticle
            this.cursorEl = document.createElement('div');
            this.cursorEl.className = 'riot-hud-cursor';
            this.cursorEl.innerHTML = `
                <div class="hud-reticle-crosshair"></div>
                <div class="hud-bracket tl"></div>
                <div class="hud-bracket tr"></div>
                <div class="hud-bracket bl"></div>
                <div class="hud-bracket br"></div>
                <div class="hud-status-chip"><span>LOCK</span></div>
            `;
            document.body.appendChild(this.cursorEl);

            // Precision HUD Center Dot
            this.dotEl = document.createElement('div');
            this.dotEl.className = 'riot-hud-dot';
            document.body.appendChild(this.dotEl);

            // Pointer event listeners
            window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
            window.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: true });
            window.addEventListener('pointerup', () => this.onPointerUp(), { passive: true });
            window.addEventListener('mouseleave', () => this.onMouseLeave(), { passive: true });

            // Hotkey Toggle (Alt+C) and Backdrop Double-Click
            this.bindToggleEvents();

            // Interactive element hover & magnetic lock-on bindings (Event Delegated)
            this.bindInteractiveElements();

            // Button Ripple micro-interaction
            this.bindButtonRipples();

            // Listen to OS prefers-reduced-motion changes dynamically
            this.bindReducedMotionListener();

            // Apply active state
            if (this.enabled && !this.reducedMotion) {
                this.enable(false);
            } else {
                this.disable(false);
            }
        }

        resizeCanvas() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        bindToggleEvents() {
            // Toggle Hotkey: Alt + C
            window.addEventListener('keydown', (e) => {
                if (e.altKey && (e.code === 'KeyC' || e.key === 'c' || e.key === 'C')) {
                    e.preventDefault();
                    this.toggle();
                }
            });

            // Double click on page background or wallpaper toggles cursor
            document.addEventListener('dblclick', (e) => {
                const isBackdrop = e.target === document.body || 
                                   e.target === document.documentElement ||
                                   e.target.classList.contains('wallpaper') ||
                                   e.target.tagName === 'MAIN';
                if (isBackdrop) {
                    this.toggle();
                }
            });
        }

        bindInteractiveElements() {
            const selector = 'button, a, input, select, textarea, .interactive, .target-chip, .sound-toggle-btn, .theme-badge, .nav-item, .control-btn, .control-select, .icons__button, .login__button, .theme-chip-btn, [role="button"]';

            // Event delegation for robust dynamic element support
            document.addEventListener('pointerover', (e) => {
                if (!this.enabled || this.reducedMotion) return;
                const el = e.target.closest(selector);
                if (el) {
                    this.isHovering = true;
                    this.hoveredEl = el;
                    if (this.cursorEl) {
                        this.cursorEl.classList.add('hovering');
                        this.cursorEl.classList.add('magnetic-locked');
                    }
                    el.classList.add('hud-element-locked');
                }
            }, { passive: true });

            document.addEventListener('pointerout', (e) => {
                const el = e.target.closest(selector);
                if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) {
                    this.isHovering = false;
                    if (this.hoveredEl === el) {
                        this.hoveredEl = null;
                    }
                    if (this.cursorEl) {
                        this.cursorEl.classList.remove('hovering');
                        this.cursorEl.classList.remove('magnetic-locked');
                    }
                    el.classList.remove('hud-element-locked');
                }
            }, { passive: true });
        }

        bindButtonRipples() {
            const btnSelector = 'button, [role="button"], .interactive, .btn-action-primary, .login__button, .control-btn, .icons__button, .header-btn, .btn-ghost-sm';
            
            document.addEventListener('pointerdown', (e) => {
                if (this.reducedMotion) return;
                const btn = e.target.closest(btnSelector);
                if (btn) {
                    this.createRipple(e, btn);
                }
            }, { passive: true });
        }

        createRipple(e, btn) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const size = Math.max(rect.width, rect.height) * 2.2;

            // Ensure button contains ripple properly
            const computed = window.getComputedStyle(btn);
            if (computed.position === 'static') {
                btn.style.position = 'relative';
            }
            btn.style.overflow = 'hidden';

            const ripple = document.createElement('span');
            ripple.className = 'riot-ripple';
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            btn.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            }, { once: true });

            setTimeout(() => {
                if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            }, 700);
        }

        bindReducedMotionListener() {
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            const handleMotion = (matches) => {
                this.reducedMotion = matches;
                if (matches) {
                    this.disable(false);
                } else {
                    let savedPref = null;
                    try { if (typeof localStorage !== 'undefined') savedPref = localStorage.getItem(this.storageKey); } catch (e) {}
                    if (savedPref !== 'disabled') {
                        this.enable(false);
                    }
                }
            };

            if (motionQuery.addEventListener) {
                motionQuery.addEventListener('change', (e) => handleMotion(e.matches));
            } else if (motionQuery.addListener) {
                motionQuery.addListener((e) => handleMotion(e.matches));
            }
        }

        onPointerMove(e) {
            if (!this.enabled || this.reducedMotion) return;

            const now = performance.now();
            const dt = Math.max(1, now - this.lastTime);
            const dist = Math.hypot(e.clientX - this.lastX, e.clientY - this.lastY);
            const rawSpeed = dist / dt; // Velocity in px/ms

            // Exponential moving average for velocity smoothing
            this.velocity = this.velocity * 0.72 + rawSpeed * 0.28;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.lastTime = now;

            // Magnetic Lock-on: pull target coordinates towards element center
            if (this.isHovering && this.hoveredEl && typeof this.hoveredEl.getBoundingClientRect === 'function') {
                const rect = this.hoveredEl.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // 38% gravitational pull towards center of interactive element
                const pullFactor = 0.38;
                this.target.x = e.clientX * (1 - pullFactor) + centerX * pullFactor;
                this.target.y = e.clientY * (1 - pullFactor) + centerY * pullFactor;
            } else {
                this.target.x = e.clientX;
                this.target.y = e.clientY;
            }

            // High-precision physical dot follows pointer with zero latency
            if (this.dotEl) {
                this.dotEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }

            // Dynamic spark particle trailing
            if (dist > 3 && Math.random() < Math.min(0.25 + this.velocity * 0.3, 0.8) && this.particles.length < 50) {
                this.spawnSpark(e.clientX, e.clientY, false);
            }
        }

        onPointerDown(e) {
            if (!this.enabled || this.reducedMotion) return;
            this.isClicking = true;
            if (this.cursorEl) this.cursorEl.classList.add('clicking');

            // Click impulse shockwave ring
            this.spawnShockwave(e.clientX, e.clientY);

            // Spark burst: 14 energetic Hextech sparks
            const burstCount = 14;
            for (let i = 0; i < burstCount; i++) {
                this.spawnSpark(e.clientX, e.clientY, true);
            }

            if (window.riotAudio && typeof window.riotAudio.play === 'function') {
                window.riotAudio.play('click');
            }
        }

        onPointerUp() {
            this.isClicking = false;
            if (this.cursorEl) this.cursorEl.classList.remove('clicking');
        }

        onMouseLeave() {
            if (this.cursorEl) this.cursorEl.style.opacity = '0';
            if (this.dotEl) this.dotEl.style.opacity = '0';
        }

        spawnShockwave(x, y) {
            if (this.reducedMotion) return;
            this.shockwaves.push({
                x,
                y,
                radius: 4,
                maxRadius: 54,
                alpha: 1.0,
                decay: 0.045,
                color: '#00f0ff',
                lineWidth: 2.5
            });
        }

        spawnSpark(x, y, isBurst = false) {
            if (this.reducedMotion) return;
            const angle = Math.random() * Math.PI * 2;
            const speed = isBurst ? Math.random() * 4.5 + 2.0 : Math.random() * 1.8 + 0.4;
            const palette = ['#00f0ff', '#c8aa6e', '#eb0029', '#ffffff'];
            const color = isBurst 
                ? (Math.random() < 0.6 ? '#00f0ff' : '#c8aa6e')
                : palette[Math.floor(Math.random() * palette.length)];

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1.0,
                decay: isBurst ? 0.038 : 0.024,
                color: color,
                size: isBurst ? Math.random() * 3 + 1.5 : Math.random() * 2 + 1,
                glow: isBurst ? 10 : 6
            });
        }

        enable(savePref = true) {
            this.enabled = true;
            if (savePref) {
                try { if (typeof localStorage !== 'undefined') localStorage.setItem(this.storageKey, 'enabled'); } catch (e) {}
            }
            if (typeof document !== 'undefined') {
                document.documentElement.classList.add('riot-cursor-active');
            }
            if (this.cursorEl) this.cursorEl.style.opacity = '1';
            if (this.dotEl) this.dotEl.style.opacity = '1';
            if (this.canvas) this.canvas.style.opacity = '1';

            if (!this.animId) {
                this.loop();
            }

            if (savePref && typeof window !== 'undefined' && window.showRiotToast) {
                window.showRiotToast('Cybernetic HUD Cursor: ATIVADO (Alt+C)', 'info');
            }
        }

        disable(savePref = true) {
            this.enabled = false;
            if (savePref) {
                try { if (typeof localStorage !== 'undefined') localStorage.setItem(this.storageKey, 'disabled'); } catch (e) {}
            }
            if (typeof document !== 'undefined') {
                document.documentElement.classList.remove('riot-cursor-active');
            }
            if (this.cursorEl) this.cursorEl.style.opacity = '0';
            if (this.dotEl) this.dotEl.style.opacity = '0';
            if (this.canvas) {
                this.canvas.style.opacity = '0';
                if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            this.particles = [];
            this.shockwaves = [];

            if (this.animId) {
                cancelAnimationFrame(this.animId);
                this.animId = null;
            }

            if (savePref && typeof window !== 'undefined' && window.showRiotToast) {
                window.showRiotToast('Cybernetic HUD Cursor: DESATIVADO (Alt+C)', 'info');
            }
        }

        toggle() {
            if (this.reducedMotion) {
                if (typeof window !== 'undefined' && window.showRiotToast) {
                    window.showRiotToast('Cursor HUD desativado devido à preferência de movimento reduzido (WCAG)', 'info');
                }
                return;
            }
            if (this.enabled) {
                this.disable(true);
            } else {
                this.enable(true);
            }
            if (typeof window !== 'undefined' && window.riotAudio && typeof window.riotAudio.play === 'function') {
                window.riotAudio.play('whoosh');
            }
        }

        loop() {
            if (!this.enabled || this.reducedMotion) {
                this.animId = null;
                return;
            }

            // Spring-damper Euler physics: F = -k * x - c * v
            const dx = this.target.x - this.pos.x;
            const dy = this.target.y - this.pos.y;
            const ax = dx * this.k;
            const ay = dy * this.k;

            this.vel.x = (this.vel.x + ax) * this.damp;
            this.vel.y = (this.vel.y + ay) * this.damp;

            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;

            // Velocity decay towards rest
            this.velocity *= 0.93;
            if (this.velocity < 0.002) this.velocity = 0;

            // Dynamic crosshair scaling based on velocity
            const velocityScale = 1.0 + Math.min(this.velocity * 0.42, 0.85);
            const spread = Math.min(this.velocity * 9, 15);

            if (this.cursorEl) {
                this.cursorEl.style.opacity = '1';
                this.cursorEl.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
                this.cursorEl.style.setProperty('--hud-spread', `${spread.toFixed(1)}px`);
                this.cursorEl.style.setProperty('--hud-scale', velocityScale.toFixed(3));
            }

            // Render Canvas shockwaves & spark particles
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // Render click shockwaves
                for (let i = this.shockwaves.length - 1; i >= 0; i--) {
                    const sw = this.shockwaves[i];
                    sw.radius += (sw.maxRadius - sw.radius) * 0.20 + 2;
                    sw.alpha -= sw.decay;

                    if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                        this.shockwaves.splice(i, 1);
                        continue;
                    }

                    this.ctx.save();
                    this.ctx.globalAlpha = sw.alpha;
                    this.ctx.strokeStyle = sw.color;
                    this.ctx.lineWidth = sw.lineWidth;
                    this.ctx.shadowBlur = 12;
                    this.ctx.shadowColor = sw.color;
                    this.ctx.beginPath();
                    this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.restore();
                }

                // Render particle sparks
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 0.96;
                    p.vy *= 0.96;
                    p.alpha -= p.decay;

                    if (p.alpha <= 0) {
                        this.particles.splice(i, 1);
                        continue;
                    }

                    this.ctx.save();
                    this.ctx.globalAlpha = p.alpha;
                    this.ctx.fillStyle = p.color;
                    this.ctx.shadowBlur = p.glow;
                    this.ctx.shadowColor = p.color;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }

            this.animId = requestAnimationFrame(() => this.loop());
        }
    }

    if (typeof window !== 'undefined') {
        window.RiotCursorEngine = RiotCursorEngine;
        window.riotCursor = new RiotCursorEngine();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { RiotCursorEngine };
    }
})();
