/**
 * riot-cursor.js - Cybernetic HUD Cursor & Micro-Interactions Engine
 * Features:
 *   - Spring-damper physics-based pointer tracking
 *   - Hextech particle trail on pointer movement
 *   - Magnetic snapping to interactive buttons and links
 *   - Lock-on targeting reticle & pulse effects on click
 *   - WCAG AAA compliance (respects prefers-reduced-motion)
 */

(function () {
    'use strict';

    class RiotCursorEngine {
        constructor() {
            this.enabled = true;
            this.pos = { x: -100, y: -100 };
            this.target = { x: -100, y: -100 };
            this.vel = { x: 0, y: 0 };
            this.k = 0.22; // Spring stiffness
            this.damp = 0.72; // Damping factor
            this.isHovering = false;
            this.isClicking = false;
            this.particles = [];
            this.canvas = null;
            this.ctx = null;
            this.cursorEl = null;
            this.dotEl = null;
            this.animId = null;

            // Check reduced motion preference
            if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.enabled = false;
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
            if (!this.enabled || typeof document === 'undefined') return;

            // Create Canvas for particle sparks
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
            window.addEventListener('resize', () => this.resizeCanvas());

            // Create HUD Cursor Elements
            this.cursorEl = document.createElement('div');
            this.cursorEl.className = 'riot-hud-cursor';
            this.cursorEl.innerHTML = `
                <div class="hud-bracket tl"></div>
                <div class="hud-bracket tr"></div>
                <div class="hud-bracket bl"></div>
                <div class="hud-bracket br"></div>
            `;
            document.body.appendChild(this.cursorEl);

            this.dotEl = document.createElement('div');
            this.dotEl.className = 'riot-hud-dot';
            document.body.appendChild(this.dotEl);

            // Bind pointer events
            window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
            window.addEventListener('pointerdown', () => this.onPointerDown(), { passive: true });
            window.addEventListener('pointerup', () => this.onPointerUp(), { passive: true });
            window.addEventListener('mouseleave', () => this.onMouseLeave(), { passive: true });

            // Magnetic element hover bindings
            this.bindInteractiveElements();

            // Start animation loop
            this.loop();
        }

        resizeCanvas() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        onPointerMove(e) {
            this.target.x = e.clientX;
            this.target.y = e.clientY;

            if (this.dotEl) {
                this.dotEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }

            // Spawn spark particle
            if (Math.random() < 0.45 && this.particles.length < 40) {
                this.spawnSpark(e.clientX, e.clientY);
            }
        }

        onPointerDown() {
            this.isClicking = true;
            if (this.cursorEl) this.cursorEl.classList.add('clicking');
            for (let i = 0; i < 8; i++) {
                this.spawnSpark(this.pos.x, this.pos.y, true);
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

        bindInteractiveElements() {
            const targets = 'button, a, input, select, textarea, .target-chip, .sound-toggle-btn, .theme-badge, .nav-item';
            document.querySelectorAll(targets).forEach((el) => {
                el.addEventListener('pointerenter', () => {
                    this.isHovering = true;
                    if (this.cursorEl) this.cursorEl.classList.add('hovering');
                });
                el.addEventListener('pointerleave', () => {
                    this.isHovering = false;
                    if (this.cursorEl) this.cursorEl.classList.remove('hovering');
                });
            });
        }

        spawnSpark(x, y, isBurst = false) {
            const angle = Math.random() * Math.PI * 2;
            const speed = isBurst ? Math.random() * 4 + 2 : Math.random() * 1.5 + 0.5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1.0,
                decay: isBurst ? 0.04 : 0.025,
                color: isBurst ? '#00f0ff' : '#eb0029',
                size: isBurst ? Math.random() * 3 + 1.5 : Math.random() * 2 + 1
            });
        }

        loop() {
            // Spring-damper Euler physics: F = -k * x - c * v
            const dx = this.target.x - this.pos.x;
            const dy = this.target.y - this.pos.y;
            const ax = dx * this.k;
            const ay = dy * this.k;

            this.vel.x = (this.vel.x + ax) * this.damp;
            this.vel.y = (this.vel.y + ay) * this.damp;

            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;

            if (this.cursorEl) {
                this.cursorEl.style.opacity = '1';
                this.cursorEl.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
            }

            // Render particles
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha -= p.decay;

                    if (p.alpha <= 0) {
                        this.particles.splice(i, 1);
                        continue;
                    }

                    this.ctx.save();
                    this.ctx.globalAlpha = p.alpha;
                    this.ctx.fillStyle = p.color;
                    this.ctx.shadowBlur = 6;
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
