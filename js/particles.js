/**
 * particles.js - Interactive Canvas VFX Engine for Riot Login
 * Renders 60fps thematic particles & animated central game watermarks based on active theme:
 * - Riot: Glowing crimson embers + high-tech geometric grid
 * - Valorant: Tactical sharp sparks + radar sweep & crosshair reticles
 * - LoL: Hextech arcane energy motes + rotating runic rings
 * - TFT: Cosmic stardust drifting + celestial orbital rings
 */
(function() {
    'use strict';

    class ParticleEngine {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.maxParticles = 55;
            this.animationId = null;
            this.theme = 'riot';
            this.rotation = 0;
            this.pulse = 0;
            this.mouse = { x: -1000, y: -1000, radius: 120 };

            this.init();
        }

        init() {
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

            wallpaper.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });

            wallpaper.addEventListener('mouseleave', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            });

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
            const dpr = window.devicePixelRatio || 1;
            this.width = this.canvas.offsetWidth || (window.innerWidth / 2);
            this.height = this.canvas.offsetHeight || window.innerHeight;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.resetParticles();
        }

        getThemeColor() {
            switch (this.theme) {
                case 'valorant':
                    return { r: 255, g: 70, b: 85, hex: '#FF4655' }; // Red / Crimson
                case 'lol':
                    return { r: 196, g: 185, b: 152, hex: '#C4B998' }; // Hextech Gold
                case 'tft':
                    return { r: 157, g: 78, b: 221, hex: '#9D4EDD' }; // Cosmic Purple
                case 'riot':
                default:
                    return { r: 235, g: 0, b: 41, hex: '#EB0029' }; // Riot Red
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
                x: Math.random() * (this.width || 800),
                y: Math.random() * (this.height || 600),
                radius: Math.random() * 2.8 + 0.8,
                vx: (Math.random() - 0.5) * 0.9,
                vy: -Math.random() * 1.4 - 0.3,
                alpha: Math.random() * 0.6 + 0.2,
                color: color
            };
        }

        drawThematicCenterpiece() {
            if (!this.ctx) return;
            const cx = this.width / 2;
            const cy = this.height / 2;
            const color = this.getThemeColor();

            this.rotation += 0.005;
            this.pulse = Math.sin(Date.now() * 0.002) * 5;

            this.ctx.save();
            this.ctx.translate(cx, cy);

            if (this.theme === 'valorant') {
                // Valorant Tactical Crosshairs & Radar Reticle
                this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`;
                this.ctx.lineWidth = 1.5;

                // Outer polygon
                this.ctx.rotate(this.rotation * 0.5);
                this.ctx.strokeRect(-90, -90, 180, 180);

                // Inner angled reticle
                this.ctx.rotate(-this.rotation);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 60 + this.pulse, 0, Math.PI * 2);
                this.ctx.stroke();

                // Crosshair markers
                this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
                this.ctx.fillRect(-2, -80, 4, 16);
                this.ctx.fillRect(-2, 64, 4, 16);
                this.ctx.fillRect(-80, -2, 16, 4);
                this.ctx.fillRect(64, -2, 16, 4);

            } else if (this.theme === 'lol') {
                // League of Legends Hextech Runic Rings
                this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`;
                this.ctx.lineWidth = 1.5;

                // Outer rotating ring with dashes
                this.ctx.rotate(this.rotation * 0.3);
                this.ctx.beginPath();
                this.ctx.setLineDash([12, 8]);
                this.ctx.arc(0, 0, 95 + this.pulse, 0, Math.PI * 2);
                this.ctx.stroke();

                // Inner rotating ring opposite direction
                this.ctx.rotate(-this.rotation * 0.7);
                this.ctx.beginPath();
                this.ctx.setLineDash([6, 6]);
                this.ctx.arc(0, 0, 65, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);

                // Core crystal gem
                this.ctx.fillStyle = `rgba(10, 200, 185, 0.3)`;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
                this.ctx.fill();

            } else if (this.theme === 'tft') {
                // TFT Cosmic Galaxy Rings
                this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
                this.ctx.lineWidth = 1.5;

                this.ctx.rotate(this.rotation * 0.4);
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, 110, 45, Math.PI / 4, 0, Math.PI * 2);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, 110, 45, -Math.PI / 4, 0, Math.PI * 2);
                this.ctx.stroke();

            } else {
                // Riot Games Core Hex Shield Emblem
                this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.22)`;
                this.ctx.lineWidth = 2;

                this.ctx.beginPath();
                const r = 85 + this.pulse;
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i + (this.rotation * 0.2);
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);
                    if (i === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
                this.ctx.closePath();
                this.ctx.stroke();

                // Inner shield
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 45, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
        }

        animate() {
            if (!this.ctx || !this.canvas) return;
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw game centerpiece
            this.drawThematicCenterpiece();

            // Draw floating particles
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                p.y += p.vy;
                p.x += p.vx;
                p.alpha += Math.sin(Date.now() * 0.003) * 0.005;

                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    p.x -= Math.cos(angle) * 2.5;
                    p.y -= Math.sin(angle) * 2.5;
                }

                if (p.y < 0) p.y = this.height;
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.max(0.12, Math.min(0.85, p.alpha))})`;
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
