/**
 * particles.js - Interactive Canvas VFX Engine for Riot Login
 * Renders 60fps thematic particles based on the active theme:
 * - Riot: Subtle glowing crimson embers
 * - Valorant: Tactical sharp sparks & speed lines
 * - LoL: Hextech magic blue/gold motes
 * - TFT: Cosmic stardust drifting
 */
(function() {
    'use strict';

    class ParticleEngine {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.maxParticles = 45;
            this.animationId = null;
            this.theme = 'riot';
            this.mouse = { x: -1000, y: -1000, radius: 100 };

            this.init();
        }

        init() {
            // Find or create canvas behind the wallpaper
            const wallpaper = document.querySelector('.wallpaper');
            if (!wallpaper) return;

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'riot-vfx-canvas';
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '1';
            
            wallpaper.style.position = 'relative';
            wallpaper.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            this.resize();
            window.addEventListener('resize', () => this.resize());

            // Track mouse interaction on wallpaper
            wallpaper.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });

            wallpaper.addEventListener('mouseleave', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            });

            // Watch for theme changes
            const observer = new MutationObserver(() => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'riot';
                if (currentTheme !== this.theme) {
                    this.theme = currentTheme;
                    this.resetParticles();
                }
            });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

            this.theme = document.documentElement.getAttribute('data-theme') || 'riot';
            this.resetParticles();
            this.animate();
        }

        resize() {
            if (!this.canvas) return;
            this.canvas.width = this.canvas.offsetWidth || window.innerWidth;
            this.canvas.height = this.canvas.offsetHeight || window.innerHeight;
            this.resetParticles();
        }

        getThemeColor() {
            switch (this.theme) {
                case 'valorant':
                    return { r: 255, g: 70, b: 85 }; // Red / Crimson
                case 'lol':
                    return { r: 196, g: 185, b: 152 }; // Hextech Gold
                case 'tft':
                    return { r: 130, g: 80, b: 255 }; // Cosmic Purple
                case 'riot':
                default:
                    return { r: 235, g: 0, b: 41 }; // Riot Red
            }
        }

        resetParticles() {
            this.particles = [];
            for (let i = 0; i < this.maxParticles; i++) {
                this.particles.push(this.createParticle());
            }
        }

        createParticle() {
            const color = this.getThemeColor();
            return {
                x: Math.random() * (this.canvas.width || 800),
                y: Math.random() * (this.canvas.height || 600),
                radius: Math.random() * 2.5 + 1,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -Math.random() * 1.2 - 0.3, // gently floating upwards
                alpha: Math.random() * 0.6 + 0.2,
                color: color,
                pulse: Math.random() * 0.02 + 0.01
            };
        }

        animate() {
            if (!this.ctx || !this.canvas) return;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                p.y += p.vy;
                p.x += p.vx;
                p.alpha += Math.sin(Date.now() * 0.003) * 0.005;

                // Mouse push
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    p.x -= Math.cos(angle) * 2;
                    p.y -= Math.sin(angle) * 2;
                }

                // Wrap boundaries
                if (p.y < 0) p.y = this.canvas.height;
                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;

                // Render particle with glow
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.max(0.1, Math.min(0.8, p.alpha))})`;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = `rgb(${p.color.r}, ${p.color.g}, ${p.color.b})`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }

            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new ParticleEngine());
    } else {
        new ParticleEngine();
    }
})();
