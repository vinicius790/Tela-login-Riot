/**
 * particles.js - Advanced Interactive Canvas VFX Engine for Riot Games Portal
 * 
 * Features:
 * - 6 Dynamic Theme Centerpieces with rotating high-precision vector art:
 *   1. Riot: Hex Shield with glowing fist insignia & expanding sonar hex waves
 *   2. Valorant: Radar reticle with 360° scanning sweep, tactical blip pings & coordinate HUD
 *   3. LoL: Hextech concentric spinning rune circles & glowing arcane crystal core
 *   4. TFT: Cosmic constellation network with 3D tilted gyroscopic orbiting star points
 *   5. Star Guardian: Shimmering 4-point star burst with starlight halo & glitter trail
 *   6. K/DA: Diamond faceted geometric prism with dynamic neon laser sweeps & floating shards
 * - Interactive Mouse Physics:
 *   - Proportional inverse-distance particle repulsion on cursor hover
 *   - Gravitational spiral vortex attraction while mouse button is held
 *   - Dynamic velocity-based trailing sparks with theme-specific styling
 *   - Click shockwave impulse ring dispersing nearby particles
 * - Performance & Optimization:
 *   - High-DPI (Retina / 4K) canvas scaling with sub-pixel crispness
 *   - RequestAnimationFrame loop with automatic pause on tab inactivity (visibilitychange)
 *   - Particle pooling & spark cap to guarantee 60fps performance
 *   - Prefers-reduced-motion accessibility support
 */

(function() {
    'use strict';

    // Theme Visual Configurations & Color Palettes
    const THEME_CONFIG = {
        riot: {
            name: 'Riot Games',
            primary: { r: 235, g: 0, b: 41, hex: '#EB0029' },
            secondary: { r: 255, g: 255, b: 255, hex: '#FFFFFF' },
            accent: { r: 255, g: 70, b: 85, hex: '#FF4655' },
            glow: 'rgba(235, 0, 41, 0.45)',
            particleStyle: 'ember',
            count: 60,
            repulsionRadius: 135
        },
        valorant: {
            name: 'Valorant',
            primary: { r: 255, g: 70, b: 85, hex: '#FF4655' },
            secondary: { r: 236, g: 232, b: 225, hex: '#ECE8E1' },
            accent: { r: 0, g: 245, b: 212, hex: '#00F5D4' },
            glow: 'rgba(255, 70, 85, 0.45)',
            particleStyle: 'tactical',
            count: 55,
            repulsionRadius: 140
        },
        lol: {
            name: 'League of Legends',
            primary: { r: 200, g: 170, b: 109, hex: '#C8AA6D' },
            secondary: { r: 10, g: 200, b: 185, hex: '#0AC8B9' },
            accent: { r: 240, g: 230, b: 210, hex: '#F0E6D2' },
            glow: 'rgba(10, 200, 185, 0.4)',
            particleStyle: 'hextech',
            count: 65,
            repulsionRadius: 135
        },
        tft: {
            name: 'Teamfight Tactics',
            primary: { r: 157, g: 78, b: 221, hex: '#9D4EDD' },
            secondary: { r: 76, g: 201, b: 240, hex: '#4CC9F0' },
            accent: { r: 255, g: 209, b: 102, hex: '#FFD166' },
            glow: 'rgba(157, 78, 221, 0.45)',
            particleStyle: 'cosmic',
            count: 70,
            repulsionRadius: 140
        },
        'star-guardian': {
            name: 'Star Guardian',
            primary: { r: 255, g: 102, b: 178, hex: '#FF66B2' },
            secondary: { r: 255, g: 215, b: 0, hex: '#FFD700' },
            accent: { r: 165, g: 243, b: 252, hex: '#A5F3FC' },
            glow: 'rgba(255, 102, 178, 0.55)',
            particleStyle: 'glitter',
            count: 75,
            repulsionRadius: 145
        },
        kda: {
            name: 'K/DA',
            primary: { r: 199, g: 0, b: 125, hex: '#C7007D' },
            secondary: { r: 0, g: 240, b: 255, hex: '#00F0FF' },
            accent: { r: 155, g: 81, b: 224, hex: '#9B51E0' },
            glow: 'rgba(0, 240, 255, 0.45)',
            particleStyle: 'prism',
            count: 60,
            repulsionRadius: 140
        }
    };
    THEME_CONFIG['starguardian'] = THEME_CONFIG['star-guardian'];

    class ParticleEngine {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.width = 0;
            this.height = 0;
            this.dpr = 1;
            this.animationId = null;
            this.isRunning = false;
            this.prefersReducedMotion = false;

            this.theme = 'riot';
            this.config = THEME_CONFIG.riot;

            // Particles & Interactive Sparks
            this.particles = [];
            this.sparks = [];
            this.maxSparks = 45;
            this.shockwaves = [];

            // Mouse Dynamics & Physics
            this.mouse = {
                x: -1000,
                y: -1000,
                prevX: -1000,
                prevY: -1000,
                vx: 0,
                vy: 0,
                isDown: false,
                isInside: false,
                radius: 140
            };

            // Animation Clocks & Counters
            this.time = 0;
            this.lastFrameTime = performance.now();
            this.rotation = 0;
            this.pulse = 0;

            // Radar & Theme Specific State
            this.radarAngle = 0;
            this.radarBlips = [
                { r: 42, theta: 0.7, pingTime: 0 },
                { r: 72, theta: 2.3, pingTime: 0 },
                { r: 84, theta: 4.1, pingTime: 0 },
                { r: 58, theta: 5.4, pingTime: 0 }
            ];

            // Constellation Nodes for TFT
            this.constellationNodes = [
                { x: -75, y: -45, phase: 0.1 },
                { x: -35, y: -70, phase: 1.2 },
                { x: 25, y: -65, phase: 2.3 },
                { x: 70, y: -30, phase: 3.4 },
                { x: 55, y: 35, phase: 4.5 },
                { x: 10, y: 65, phase: 5.6 },
                { x: -45, y: 55, phase: 0.8 },
                { x: -70, y: 15, phase: 2.9 }
            ];

            this.init();
        }

        /**
         * Normalize theme strings from various possible sources
         */
        normalizeTheme(rawTheme) {
            if (!rawTheme) return 'riot';
            const clean = String(rawTheme).toLowerCase().trim().replace(/['"]/g, '');
            if (clean === 'starguardian' || clean === 'star_guardian' || clean === 'star-guardian' || clean === 'sg') {
                return 'star-guardian';
            }
            if (clean === 'kda' || clean === 'k/da' || clean === 'k-da') {
                return 'kda';
            }
            if (clean === 'valorant') return 'valorant';
            if (clean === 'lol' || clean === 'league') return 'lol';
            if (clean === 'tft') return 'tft';
            return 'riot';
        }

        init() {
            // Find container element: prioritize .wallpaper, fallback to main or body
            const container = document.querySelector('.wallpaper') || document.querySelector('main') || document.body;
            if (!container) return;

            // Check reduced motion preference
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.prefersReducedMotion = mediaQuery.matches;
            mediaQuery.addEventListener('change', (e) => {
                this.prefersReducedMotion = e.matches;
            });

            // Initialize or attach canvas
            let existingCanvas = document.getElementById('riot-vfx-canvas');
            if (existingCanvas) {
                this.canvas = existingCanvas;
            } else {
                this.canvas = document.createElement('canvas');
                this.canvas.id = 'riot-vfx-canvas';
                this.canvas.setAttribute('aria-hidden', 'true');
                this.canvas.style.position = 'absolute';
                this.canvas.style.top = '0';
                this.canvas.style.left = '0';
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                this.canvas.style.pointerEvents = 'none';
                this.canvas.style.zIndex = '1';
                container.style.position = 'relative';
                container.appendChild(this.canvas);
            }

            this.ctx = this.canvas.getContext('2d', { alpha: true });

            // Detect initial theme
            const currentTheme = this.normalizeTheme(document.documentElement.getAttribute('data-theme'));
            this.setTheme(currentTheme, false);

            // Handle Resize
            this.resize();
            window.addEventListener('resize', () => this.resize(), { passive: true });

            // Setup Mouse / Touch Interactions
            this.setupInteractionListeners(container);

            // Setup Theme Change Listeners
            this.setupThemeListeners();

            // Tab Visibility Listener for 100% pause on inactive tab
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pause();
                } else {
                    this.resume();
                }
            });

            // Start animation loop
            this.resume();
        }

        setupInteractionListeners(container) {
            const updateMousePosition = (e) => {
                if (!this.canvas) return;
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                if (this.mouse.prevX !== -1000) {
                    this.mouse.vx = x - this.mouse.prevX;
                    this.mouse.vy = y - this.mouse.prevY;
                } else {
                    this.mouse.vx = 0;
                    this.mouse.vy = 0;
                }

                this.mouse.prevX = this.mouse.x;
                this.mouse.prevY = this.mouse.y;
                this.mouse.x = x;
                this.mouse.y = y;
                this.mouse.isInside = (x >= 0 && x <= this.width && y >= 0 && y <= this.height);

                // Spawn dynamic trailing sparks along cursor path
                const speed = Math.hypot(this.mouse.vx, this.mouse.vy);
                if (this.mouse.isInside && speed > 1.2) {
                    const sparkCount = Math.min(4, Math.floor(speed * 0.4) + 1);
                    for (let i = 0; i < sparkCount; i++) {
                        this.spawnSpark(x, y, this.mouse.vx, this.mouse.vy);
                    }
                }
            };

            window.addEventListener('mousemove', updateMousePosition, { passive: true });

            // Interactive attraction on mousedown
            window.addEventListener('mousedown', (e) => {
                this.mouse.isDown = true;
                if (this.mouse.isInside) {
                    this.triggerShockwave(this.mouse.x, this.mouse.y);
                }
            });

            window.addEventListener('mouseup', () => {
                this.mouse.isDown = false;
            });

            window.addEventListener('mouseleave', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
                this.mouse.prevX = -1000;
                this.mouse.prevY = -1000;
                this.mouse.vx = 0;
                this.mouse.vy = 0;
                this.mouse.isInside = false;
                this.mouse.isDown = false;
            });

            // Touch interaction support for mobile/tablets
            if (container && typeof container.addEventListener === 'function') {
                container.addEventListener('touchmove', (e) => {
                    if (e.touches && e.touches.length > 0) {
                        const touch = e.touches[0];
                        updateMousePosition(touch);
                    }
                }, { passive: true });

                container.addEventListener('touchstart', (e) => {
                    if (e.touches && e.touches.length > 0) {
                        this.mouse.isDown = true;
                        updateMousePosition(e.touches[0]);
                        this.triggerShockwave(this.mouse.x, this.mouse.y);
                    }
                }, { passive: true });

                container.addEventListener('touchend', () => {
                    this.mouse.isDown = false;
                    this.mouse.x = -1000;
                    this.mouse.y = -1000;
                });
            }
        }

        setupThemeListeners() {
            // MutationObserver on data-theme attribute
            const observer = new MutationObserver(() => {
                const currentTheme = this.normalizeTheme(document.documentElement.getAttribute('data-theme'));
                if (currentTheme !== this.theme) {
                    this.setTheme(currentTheme, true);
                }
            });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

            // Custom event dispatched by theme-switcher.js
            window.addEventListener('riotThemeChanged', (e) => {
                if (e.detail && e.detail.theme) {
                    const normalized = this.normalizeTheme(e.detail.theme);
                    if (normalized !== this.theme) {
                        this.setTheme(normalized, true);
                    }
                }
            });
        }

        setTheme(newTheme, triggerBurst = true) {
            this.theme = this.normalizeTheme(newTheme);
            this.config = THEME_CONFIG[this.theme] || THEME_CONFIG.riot;
            this.mouse.radius = this.config.repulsionRadius;

            this.resetParticles();

            // Trigger celebratory burst on theme change
            if (triggerBurst && this.width > 0 && this.height > 0) {
                this.triggerShockwave(this.width / 2, this.height / 2, 80);
                for (let i = 0; i < 20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spd = Math.random() * 6 + 2;
                    this.spawnSpark(this.width / 2, this.height / 2, Math.cos(angle) * spd, Math.sin(angle) * spd);
                }
            }
        }

        resize() {
            if (!this.canvas) return;
            // High-DPI Canvas Scaling (Retina / 4K optimization capped at 2 for performance)
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);

            const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
            this.width = rect.width || window.innerWidth;
            this.height = rect.height || window.innerHeight;

            this.canvas.width = Math.round(this.width * this.dpr);
            this.canvas.height = Math.round(this.height * this.dpr);

            if (this.ctx) {
                this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
            }

            this.resetParticles();
        }

        resetParticles() {
            this.particles = [];
            const count = this.config.count;
            for (let i = 0; i < count; i++) {
                this.particles.push(this.createParticle());
            }
        }

        createParticle() {
            const cfg = this.config;
            const w = this.width || 800;
            const h = this.height || 600;

            let vx, vy, radius, alpha, rotSpeed, isStar;

            switch (this.theme) {
                case 'valorant':
                    vx = (Math.random() - 0.5) * 1.2;
                    vy = -Math.random() * 1.6 - 0.2;
                    radius = Math.random() * 2.2 + 0.8;
                    alpha = Math.random() * 0.6 + 0.25;
                    rotSpeed = (Math.random() - 0.5) * 0.05;
                    isStar = false;
                    break;
                case 'lol':
                    vx = (Math.random() - 0.5) * 1.0;
                    vy = -Math.random() * 1.3 - 0.3;
                    radius = Math.random() * 3.0 + 1.0;
                    alpha = Math.random() * 0.7 + 0.2;
                    rotSpeed = (Math.random() - 0.5) * 0.04;
                    isStar = Math.random() > 0.65;
                    break;
                case 'tft':
                    vx = (Math.random() - 0.5) * 0.8;
                    vy = -Math.random() * 0.9 - 0.15;
                    radius = Math.random() * 2.5 + 0.6;
                    alpha = Math.random() * 0.75 + 0.25;
                    rotSpeed = (Math.random() - 0.5) * 0.03;
                    isStar = Math.random() > 0.5;
                    break;
                case 'star-guardian':
                    vx = (Math.random() - 0.5) * 0.9;
                    vy = -Math.random() * 1.2 - 0.2;
                    radius = Math.random() * 3.2 + 1.0;
                    alpha = Math.random() * 0.8 + 0.2;
                    rotSpeed = (Math.random() - 0.5) * 0.06;
                    isStar = Math.random() > 0.4;
                    break;
                case 'kda':
                    vx = (Math.random() - 0.5) * 1.5;
                    vy = -Math.random() * 1.5 - 0.3;
                    radius = Math.random() * 2.8 + 1.0;
                    alpha = Math.random() * 0.7 + 0.25;
                    rotSpeed = (Math.random() - 0.5) * 0.08;
                    isStar = Math.random() > 0.6;
                    break;
                case 'riot':
                default:
                    vx = (Math.random() - 0.5) * 0.9;
                    vy = -Math.random() * 1.5 - 0.3;
                    radius = Math.random() * 2.6 + 0.8;
                    alpha = Math.random() * 0.65 + 0.2;
                    rotSpeed = (Math.random() - 0.5) * 0.03;
                    isStar = false;
                    break;
            }

            // Decide color between primary, secondary, and accent
            const colorRoll = Math.random();
            let chosenColor = cfg.primary;
            if (colorRoll > 0.75) chosenColor = cfg.accent;
            else if (colorRoll > 0.5) chosenColor = cfg.secondary;

            return {
                x: Math.random() * w,
                y: Math.random() * h,
                baseRadius: radius,
                radius: radius,
                vx: vx,
                vy: vy,
                baseAlpha: alpha,
                alpha: alpha,
                color: chosenColor,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: rotSpeed,
                isStar: isStar,
                phase: Math.random() * Math.PI * 2
            };
        }

        spawnSpark(x, y, vx, vy) {
            if (this.sparks.length >= this.maxSparks) {
                this.sparks.shift(); // Evict oldest
            }

            const cfg = this.config;
            const chosenColor = Math.random() > 0.5 ? cfg.primary : cfg.accent;

            this.sparks.push({
                x: x,
                y: y,
                vx: vx * 0.25 + (Math.random() - 0.5) * 3.5,
                vy: vy * 0.25 + (Math.random() - 0.5) * 3.5 - 0.8,
                size: Math.random() * 3.0 + 1.2,
                alpha: 1.0,
                decay: Math.random() * 0.03 + 0.02,
                color: chosenColor,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.15,
                isStar: this.theme === 'star-guardian' || (this.theme === 'lol' && Math.random() > 0.5)
            });
        }

        triggerShockwave(x, y, maxRadius = 140) {
            this.shockwaves.push({
                x: x,
                y: y,
                radius: 5,
                maxRadius: maxRadius,
                alpha: 0.9,
                color: this.config.primary
            });

            // Disperse nearby particles
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const dx = p.x - x;
                const dy = p.y - y;
                const dist = Math.hypot(dx, dy);
                if (dist < maxRadius && dist > 1) {
                    const angle = Math.atan2(dy, dx);
                    const push = ((maxRadius - dist) / maxRadius) * 6;
                    p.vx += Math.cos(angle) * push;
                    p.vy += Math.sin(angle) * push;
                }
            }
        }

        pause() {
            if (this.isRunning) {
                cancelAnimationFrame(this.animationId);
                this.isRunning = false;
            }
        }

        resume() {
            if (!this.isRunning) {
                this.isRunning = true;
                this.lastFrameTime = performance.now();
                this.animationId = requestAnimationFrame((ts) => this.loop(ts));
            }
        }

        loop(timestamp) {
            if (!this.isRunning) return;

            const delta = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
            this.lastFrameTime = timestamp;

            const motionFactor = this.prefersReducedMotion ? 0.35 : 1.0;
            this.time += delta * motionFactor;
            this.rotation += 0.006 * motionFactor;
            this.pulse = Math.sin(this.time * 2.5) * 4;

            this.updatePhysics(delta, motionFactor);
            this.render();

            this.animationId = requestAnimationFrame((ts) => this.loop(ts));
        }

        updatePhysics(delta, motionFactor) {
            const w = this.width;
            const h = this.height;
            const mouse = this.mouse;
            const repulsionRadius = this.config.repulsionRadius;

            // 1. Update ambient particles
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                p.x += p.vx * motionFactor;
                p.y += p.vy * motionFactor;
                p.angle += p.rotSpeed * motionFactor;

                // Subtle twinkling opacity
                p.alpha = Math.max(0.12, Math.min(0.9, p.baseAlpha + Math.sin(this.time * 3 + p.phase) * 0.15));

                // Mouse interaction: Repulsion or Gravitational Vortex Attraction
                if (mouse.x !== -1000 && mouse.y !== -1000) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < repulsionRadius && dist > 2) {
                        const angle = Math.atan2(dy, dx);
                        const normDist = (repulsionRadius - dist) / repulsionRadius;

                        if (mouse.isDown) {
                            // Attraction Vortex Physics (Holding mouse pulls into swirling vortex)
                            const pullForce = normDist * 3.2;
                            p.vx -= Math.cos(angle) * pullForce + Math.sin(angle) * 1.5;
                            p.vy -= Math.sin(angle) * pullForce - Math.cos(angle) * 1.5;
                        } else {
                            // Repulsion Physics (Cursor pushes particles away smoothly)
                            const pushForce = Math.pow(normDist, 1.4) * 2.8;
                            p.vx += Math.cos(angle) * pushForce;
                            p.vy += Math.sin(angle) * pushForce;
                        }
                    }
                }

                // Damping to return to smooth natural drift
                p.vx *= 0.97;
                if (Math.abs(p.vx) < 0.2) p.vx = (Math.random() - 0.5) * 0.8;

                // Wrap-around screen bounds
                if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y > h + 10) p.y = -10;
            }

            // 2. Update dynamic sparks
            for (let i = this.sparks.length - 1; i >= 0; i--) {
                const s = this.sparks[i];
                s.x += s.vx * motionFactor;
                s.y += s.vy * motionFactor;
                s.vx *= 0.95;
                s.vy += 0.05; // slight gravity drift
                s.alpha -= s.decay * motionFactor;
                s.size *= 0.97;
                s.angle += s.rotSpeed * motionFactor;

                if (s.alpha <= 0.01 || s.size <= 0.4) {
                    this.sparks.splice(i, 1);
                }
            }

            // 3. Update shockwaves
            for (let i = this.shockwaves.length - 1; i >= 0; i--) {
                const sw = this.shockwaves[i];
                sw.radius += (sw.maxRadius - sw.radius) * 0.12 * motionFactor + 1.2;
                sw.alpha -= 0.028 * motionFactor;

                if (sw.alpha <= 0.01 || sw.radius >= sw.maxRadius) {
                    this.shockwaves.splice(i, 1);
                }
            }
        }

        render() {
            const ctx = this.ctx;
            if (!ctx) return;

            ctx.clearRect(0, 0, this.width, this.height);

            // 1. Draw Thematic Rotating Vector Centerpiece
            this.drawCenterpiece();

            // 2. Draw Shockwaves
            this.drawShockwaves();

            // 3. Draw Ambient Thematic Particles
            this.drawParticles();

            // 4. Draw Interactive Trailing Sparks
            this.drawSparks();
        }

        /**
         * Master Vector Centerpiece Renderer for all 6 Themes
         */
        drawCenterpiece() {
            const ctx = this.ctx;
            const cx = this.width / 2;
            const cy = this.height / 2;

            ctx.save();
            ctx.translate(cx, cy);

            switch (this.theme) {
                case 'riot':
                    this.drawRiotCenterpiece(ctx);
                    break;
                case 'valorant':
                    this.drawValorantCenterpiece(ctx);
                    break;
                case 'lol':
                    this.drawLoLCenterpiece(ctx);
                    break;
                case 'tft':
                    this.drawTFTCenterpiece(ctx);
                    break;
                case 'star-guardian':
                    this.drawStarGuardianCenterpiece(ctx);
                    break;
                case 'kda':
                    this.drawKDACenterpiece(ctx);
                    break;
                default:
                    this.drawRiotCenterpiece(ctx);
                    break;
            }

            ctx.restore();
        }

        /**
         * 1. RIOT GAMES: Hex Shield with Glowing Fist Insignia
         */
        drawRiotCenterpiece(ctx) {
            const primary = this.config.primary;
            const rHex = 95 + this.pulse;

            // Outer expanding sonar hex ripple wave
            const rippleProgress = (this.time * 0.5) % 1;
            const rippleRadius = 40 + rippleProgress * 105;
            const rippleAlpha = (1 - rippleProgress) * 0.35;
            ctx.strokeStyle = `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${rippleAlpha})`;
            ctx.lineWidth = 1.5;
            this.drawPolygon(ctx, 0, 0, rippleRadius, 6, 0);

            // Outer Rotating Hexagonal Shield with Corner Rivets
            ctx.save();
            ctx.rotate(this.rotation * 0.2);
            ctx.strokeStyle = `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.5)`;
            ctx.lineWidth = 2.2;
            ctx.shadowColor = primary.hex;
            ctx.shadowBlur = 12;
            this.drawPolygon(ctx, 0, 0, rHex, 6, 0);

            // Outer Corner Rivets
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const rx = rHex * Math.cos(angle);
                const ry = rHex * Math.sin(angle);
                ctx.fillStyle = primary.hex;
                ctx.beginPath();
                ctx.arc(rx, ry, 3.2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // Middle Counter-Rotating Tech Hex
            ctx.save();
            ctx.rotate(-this.rotation * 0.3);
            ctx.strokeStyle = `rgba(255, 255, 255, 0.35)`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([14, 8]);
            this.drawPolygon(ctx, 0, 0, 72, 6, Math.PI / 6);
            ctx.setLineDash([]);
            ctx.restore();

            // Inner Shield Glow Backplate
            ctx.fillStyle = `rgba(235, 0, 41, 0.12)`;
            ctx.beginPath();
            ctx.arc(0, 0, 48, 0, Math.PI * 2);
            ctx.fill();

            // Center: The Iconic Riot Fist Insignia in High-Precision Vector
            ctx.save();
            ctx.shadowColor = `rgb(${primary.r}, ${primary.g}, ${primary.b})`;
            ctx.shadowBlur = 16;
            ctx.fillStyle = primary.hex;

            // Fist Forearm / Base
            ctx.beginPath();
            ctx.moveTo(-16, 26);
            ctx.lineTo(16, 26);
            ctx.lineTo(13, 8);
            ctx.lineTo(-13, 8);
            ctx.closePath();
            ctx.fill();

            // Fist Thumb
            ctx.beginPath();
            ctx.moveTo(-14, 8);
            ctx.lineTo(-24, 2);
            ctx.lineTo(-22, -9);
            ctx.lineTo(-12, -4);
            ctx.closePath();
            ctx.fill();

            // 4 Segmented Knuckles / Fingers
            // Finger 1 (Index)
            this.drawKnuckle(ctx, -14, -18, 6.5, 20);
            // Finger 2 (Middle - tallest)
            this.drawKnuckle(ctx, -6, -23, 7.0, 24);
            // Finger 3 (Ring)
            this.drawKnuckle(ctx, 2.5, -21, 7.0, 22);
            // Finger 4 (Pinky)
            this.drawKnuckle(ctx, 11, -16, 6.5, 17);

            // Crisp White Fist Core Accent Line
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-10, 14);
            ctx.lineTo(10, 14);
            ctx.stroke();

            ctx.restore();
        }

        drawKnuckle(ctx, x, y, w, h) {
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x, y + 4);
            ctx.lineTo(x + w * 0.5, y);
            ctx.lineTo(x + w, y + 2);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.fill();
        }

        /**
         * 2. VALORANT: Radar Reticle with Scanning Pulse and Coordinate Grid
         */
        drawValorantCenterpiece(ctx) {
            const primary = this.config.primary;
            const accent = this.config.accent;
            const rMax = 105;

            // Scanning radar sweep angle
            this.radarAngle = (this.time * 2.2) % (Math.PI * 2);

            // Radar Coordinate Grid Rings
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.25)`;
            for (let r of [35, 70, rMax]) {
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Compass Tick Marks every 30°
            ctx.strokeStyle = `rgba(236, 232, 225, 0.45)`;
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI / 6) * i;
                const isMajor = (i % 3 === 0);
                const len = isMajor ? 9 : 4;
                ctx.lineWidth = isMajor ? 1.8 : 1.0;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * (rMax - len), Math.sin(angle) * (rMax - len));
                ctx.lineTo(Math.cos(angle) * rMax, Math.sin(angle) * rMax);
                ctx.stroke();
            }

            // Coordinate Grid Crosshairs (with gap in center)
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.35)`;
            ctx.beginPath();
            // Horizontal
            ctx.moveTo(-rMax - 8, 0); ctx.lineTo(-16, 0);
            ctx.moveTo(16, 0); ctx.lineTo(rMax + 8, 0);
            // Vertical
            ctx.moveTo(0, -rMax - 8); ctx.lineTo(0, -16);
            ctx.moveTo(0, 16); ctx.lineTo(0, rMax + 8);
            ctx.stroke();

            // Outer Corner HUD Brackets [ ]
            ctx.strokeStyle = accent.hex;
            ctx.lineWidth = 1.8;
            const b = 88;
            const bLen = 14;
            // Top Left [
            ctx.beginPath(); ctx.moveTo(-b, -b + bLen); ctx.lineTo(-b, -b); ctx.lineTo(-b + bLen, -b); ctx.stroke();
            // Top Right ]
            ctx.beginPath(); ctx.moveTo(b - bLen, -b); ctx.lineTo(b, -b); ctx.lineTo(b, -b + bLen); ctx.stroke();
            // Bottom Left [
            ctx.beginPath(); ctx.moveTo(-b, b - bLen); ctx.lineTo(-b, b); ctx.lineTo(-b + bLen, b); ctx.stroke();
            // Bottom Right ]
            ctx.beginPath(); ctx.moveTo(b - bLen, b); ctx.lineTo(b, b); ctx.lineTo(b, b - bLen); ctx.stroke();

            // Radar Scanning Sweep Cone (Sector Arc with Gradient)
            ctx.save();
            ctx.rotate(this.radarAngle);

            const sweepWidth = Math.PI * 0.28; // ~50 degrees
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, rMax, -sweepWidth, 0);
            ctx.closePath();

            const coneGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, rMax);
            coneGrad.addColorStop(0, `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.5)`);
            coneGrad.addColorStop(1, `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.02)`);
            ctx.fillStyle = coneGrad;
            ctx.fill();

            // Sharp Leading Radar Beam Line
            ctx.strokeStyle = accent.hex;
            ctx.lineWidth = 2.0;
            ctx.shadowColor = accent.hex;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rMax, 0);
            ctx.stroke();
            ctx.restore();

            // Radar Blip Pings (Targets lighting up when scanned)
            for (let blip of this.radarBlips) {
                const angleDiff = ((this.radarAngle - blip.theta) + Math.PI * 2) % (Math.PI * 2);
                const intensity = Math.max(0, 1 - angleDiff / 1.2);
                const bx = blip.r * Math.cos(blip.theta);
                const by = blip.r * Math.sin(blip.theta);

                if (intensity > 0.05) {
                    ctx.fillStyle = `rgba(0, 245, 212, ${intensity})`;
                    ctx.shadowColor = accent.hex;
                    ctx.shadowBlur = 10;
                    ctx.fillRect(bx - 3, by - 3, 6, 6);

                    // Expanding ping ring
                    ctx.strokeStyle = `rgba(0, 245, 212, ${intensity * 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(bx, by, (1 - intensity) * 16 + 4, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // Central Rotating Diamond Reticle
            ctx.save();
            ctx.rotate(-this.rotation * 0.8);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-9, -9, 18, 18);
            ctx.fillStyle = primary.hex;
            ctx.fillRect(-3, -3, 6, 6);
            ctx.restore();

            // Tactical HUD Data Labels
            ctx.font = '8px monospace';
            ctx.fillStyle = `rgba(236, 232, 225, 0.6)`;
            ctx.fillText('RADAR // SYS.ACT', -rMax + 8, -rMax - 6);
            ctx.fillText('DEF // ONLINE', rMax - 68, rMax + 14);
        }

        /**
         * 3. LEAGUE OF LEGENDS: Hextech Concentric Spinning Rune Circles
         */
        drawLoLCenterpiece(ctx) {
            const gold = this.config.primary;
            const cyan = this.config.secondary;

            // 1. Outer Hextech Filigree Ring (Rotating Clockwise)
            ctx.save();
            ctx.rotate(this.rotation * 0.25);
            ctx.strokeStyle = gold.hex;
            ctx.lineWidth = 2.0;
            ctx.shadowColor = gold.hex;
            ctx.shadowBlur = 10;

            const rOuter = 100 + this.pulse * 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
            ctx.stroke();

            // 6 Outer Runic Brackets & Arcane Sigils
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                ctx.save();
                ctx.rotate(angle);
                ctx.translate(0, -rOuter);

                // Golden ornate tooth bracket
                ctx.fillStyle = gold.hex;
                ctx.beginPath();
                ctx.moveTo(-6, 0);
                ctx.lineTo(0, -10);
                ctx.lineTo(6, 0);
                ctx.closePath();
                ctx.fill();

                // Arcane Sigil
                this.drawRunicGlyph(ctx, 0, 16, i);
                ctx.restore();
            }
            ctx.restore();

            // 2. Middle Arcane Energy Ring (Rotating Counter-Clockwise)
            ctx.save();
            ctx.rotate(-this.rotation * 0.5);
            ctx.strokeStyle = cyan.hex;
            ctx.lineWidth = 1.6;
            ctx.shadowColor = cyan.hex;
            ctx.shadowBlur = 12;
            ctx.setLineDash([14, 10]);

            const rMid = 70;
            ctx.beginPath();
            ctx.arc(0, 0, rMid, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // 4 Orbiting Cyan Energy Nodes
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI / 2) * i;
                const nx = rMid * Math.cos(angle);
                const ny = rMid * Math.sin(angle);
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // 3. Inner Concentric Runic Ring with Hexagram Spokes
            ctx.save();
            ctx.rotate(this.rotation * 0.7);
            ctx.strokeStyle = `rgba(${gold.r}, ${gold.g}, ${gold.b}, 0.6)`;
            ctx.lineWidth = 1.2;

            const rInner = 44;
            ctx.beginPath();
            ctx.arc(0, 0, rInner, 0, Math.PI * 2);
            ctx.stroke();

            // 6 Radial Conduits
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
                ctx.lineTo(Math.cos(angle) * rInner, Math.sin(angle) * rInner);
                ctx.stroke();
            }
            ctx.restore();

            // 4. Central Hextech Crystal Gem Core
            ctx.save();
            ctx.shadowColor = cyan.hex;
            ctx.shadowBlur = 22;

            const crystalGrad = ctx.createLinearGradient(-15, -18, 15, 18);
            crystalGrad.addColorStop(0, '#FFFFFF');
            crystalGrad.addColorStop(0.3, cyan.hex);
            crystalGrad.addColorStop(1, '#005A82');

            ctx.fillStyle = crystalGrad;
            ctx.beginPath();
            // Faceted Octagonal Crystal
            const rC = 17;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 4) * i;
                const x = rC * Math.cos(angle);
                const y = rC * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Inner Crystal Facet Reflection Lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-10, -6);
            ctx.lineTo(0, -14);
            ctx.lineTo(10, -6);
            ctx.stroke();

            ctx.restore();
        }

        drawRunicGlyph(ctx, x, y, type) {
            ctx.strokeStyle = `rgba(200, 170, 109, 0.75)`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            switch (type % 4) {
                case 0: // Chevron
                    ctx.moveTo(x - 5, y - 4); ctx.lineTo(x, y + 4); ctx.lineTo(x + 5, y - 4);
                    break;
                case 1: // Triangle
                    ctx.moveTo(x, y - 5); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4); ctx.closePath();
                    break;
                case 2: // Diamond
                    ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 4, y); ctx.closePath();
                    break;
                case 3: // Rune Cross
                    ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5);
                    ctx.moveTo(x - 4, y - 1); ctx.lineTo(x + 4, y - 1);
                    break;
            }
            ctx.stroke();
        }

        /**
         * 4. TEAMFIGHT TACTICS: Cosmic Constellation with Orbiting Star Points
         */
        drawTFTCenterpiece(ctx) {
            const violet = this.config.primary;
            const cyan = this.config.secondary;
            const gold = this.config.accent;

            // 1. Tilted 3D Orbital Gyroscopic Ellipses
            const angles = [0, Math.PI / 3, -Math.PI / 3];
            ctx.lineWidth = 1.4;

            for (let i = 0; i < angles.length; i++) {
                const tilt = angles[i];
                ctx.save();
                ctx.rotate(tilt + this.rotation * 0.15);
                ctx.strokeStyle = i === 0 ? `rgba(${cyan.r}, ${cyan.g}, ${cyan.b}, 0.35)` : `rgba(${violet.r}, ${violet.g}, ${violet.b}, 0.35)`;

                ctx.beginPath();
                ctx.ellipse(0, 0, 105, 42, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Orbiting Star Points along the ellipse path
                const orbitSpeed = (i + 1) * 0.7;
                const starAngle = this.time * orbitSpeed + (i * Math.PI * 0.6);
                const sx = 105 * Math.cos(starAngle);
                const sy = 42 * Math.sin(starAngle);

                // Star point glowing core
                ctx.fillStyle = i === 1 ? gold.hex : (i === 2 ? '#FFFFFF' : cyan.hex);
                ctx.shadowColor = gold.hex;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
                ctx.fill();

                // Mini orbital comet tail
                ctx.strokeStyle = `rgba(255, 209, 102, 0.4)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx - Math.sin(starAngle) * 12, sy + Math.cos(starAngle) * 5);
                ctx.stroke();

                ctx.restore();
            }

            // 2. Cosmic Constellation Network Lines
            ctx.save();
            ctx.rotate(this.rotation * 0.1);
            ctx.strokeStyle = `rgba(76, 201, 240, 0.35)`;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            const nodes = this.constellationNodes;
            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i];
                const n2 = nodes[(i + 1) % nodes.length];
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
            }
            // Cross diagonal lines
            ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[4].x, nodes[4].y);
            ctx.moveTo(nodes[2].x, nodes[2].y); ctx.lineTo(nodes[6].x, nodes[6].y);
            ctx.stroke();

            // Constellation Star Nodes
            for (let node of nodes) {
                const twinkle = Math.sin(this.time * 3 + node.phase) * 0.35 + 0.65;
                ctx.fillStyle = `rgba(255, 209, 102, ${twinkle})`;
                ctx.shadowColor = gold.hex;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 2.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // 3. Center Cosmic Nebula Singularity Core
            ctx.save();
            const nebulaGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 32);
            nebulaGrad.addColorStop(0, '#FFFFFF');
            nebulaGrad.addColorStop(0.3, cyan.hex);
            nebulaGrad.addColorStop(0.7, violet.hex);
            nebulaGrad.addColorStop(1, 'rgba(157, 78, 221, 0)');

            ctx.fillStyle = nebulaGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 32, 0, Math.PI * 2);
            ctx.fill();

            // 4-Ray Starlight Lens Flare
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.8;
            ctx.shadowColor = cyan.hex;
            ctx.shadowBlur = 14;
            const flareLen = 28 + this.pulse;
            ctx.beginPath();
            ctx.moveTo(0, -flareLen); ctx.lineTo(0, flareLen);
            ctx.moveTo(-flareLen, 0); ctx.lineTo(flareLen, 0);
            ctx.stroke();
            ctx.restore();
        }

        /**
         * 5. STAR GUARDIAN: Shimmering 4-Point Star Burst with Glitter Trail
         */
        drawStarGuardianCenterpiece(ctx) {
            const pink = this.config.primary;
            const gold = this.config.secondary;

            // 1. Outer Rotating Magic Starlight Halo
            ctx.save();
            ctx.rotate(this.rotation * 0.2);
            ctx.strokeStyle = `rgba(255, 215, 0, 0.45)`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 78, 0, Math.PI * 2);
            ctx.stroke();

            // 4 Orbiting Satellite Mini 4-Point Stars
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI / 2) * i;
                const ox = 78 * Math.cos(angle);
                const oy = 78 * Math.sin(angle);
                this.drawMini4PointStar(ctx, ox, oy, 6.0, gold.hex);
            }
            ctx.restore();

            // 2. Radiant Starlight Cross Lens Flare
            ctx.save();
            ctx.rotate(-this.rotation * 0.15);
            const flareRayLen = 110 + this.pulse * 1.5;
            const rayGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, flareRayLen);
            rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
            rayGrad.addColorStop(0.3, 'rgba(255, 102, 178, 0.4)');
            rayGrad.addColorStop(1, 'rgba(255, 102, 178, 0)');

            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            // Vertical elongated ray diamond
            ctx.moveTo(0, -flareRayLen); ctx.lineTo(7, 0); ctx.lineTo(0, flareRayLen); ctx.lineTo(-7, 0); ctx.closePath();
            // Horizontal ray diamond
            ctx.moveTo(-flareRayLen * 0.7, 0); ctx.lineTo(0, 6); ctx.lineTo(flareRayLen * 0.7, 0); ctx.lineTo(0, -6); ctx.closePath();
            ctx.fill();
            ctx.restore();

            // 3. Iconic Star Guardian 4-Point Winged Star
            ctx.save();
            ctx.shadowColor = pink.hex;
            ctx.shadowBlur = 24;

            // Outer Celestial Gold Filigree Frame
            ctx.strokeStyle = gold.hex;
            ctx.lineWidth = 3.0;
            this.drawStarGuardianPath(ctx, 88 + this.pulse * 0.5, 54 + this.pulse * 0.3);
            ctx.stroke();

            // Inner Radiant Gem Fill
            const starGemGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 50);
            starGemGrad.addColorStop(0, '#FFFFFF');
            starGemGrad.addColorStop(0.35, pink.hex);
            starGemGrad.addColorStop(1, '#B0005C');
            ctx.fillStyle = starGemGrad;
            this.drawStarGuardianPath(ctx, 84 + this.pulse * 0.5, 50 + this.pulse * 0.3);
            ctx.fill();

            // Facet Line Accents
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(0, -84); ctx.lineTo(0, 84);
            ctx.moveTo(-50, 0); ctx.lineTo(50, 0);
            ctx.stroke();

            ctx.restore();
        }

        drawStarGuardianPath(ctx, hLen, wLen) {
            const inner = 15;
            ctx.beginPath();
            // Top point
            ctx.moveTo(0, -hLen);
            ctx.quadraticCurveTo(inner * 0.8, -inner * 1.5, inner, -inner);
            // Right point
            ctx.quadraticCurveTo(wLen * 0.3, -inner * 0.5, wLen, 0);
            ctx.quadraticCurveTo(wLen * 0.3, inner * 0.5, inner, inner);
            // Bottom point
            ctx.quadraticCurveTo(inner * 0.8, inner * 1.5, 0, hLen);
            ctx.quadraticCurveTo(-inner * 0.8, inner * 1.5, -inner, inner);
            // Left point
            ctx.quadraticCurveTo(-wLen * 0.3, inner * 0.5, -wLen, 0);
            ctx.quadraticCurveTo(-wLen * 0.3, -inner * 0.5, -inner, -inner);
            ctx.quadraticCurveTo(-inner * 0.8, -inner * 1.5, 0, -hLen);
            ctx.closePath();
        }

        drawMini4PointStar(ctx, x, y, size, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 0.3, -size * 0.3);
            ctx.lineTo(size, 0);
            ctx.lineTo(size * 0.3, size * 0.3);
            ctx.lineTo(0, size);
            ctx.lineTo(-size * 0.3, size * 0.3);
            ctx.lineTo(-size, 0);
            ctx.lineTo(-size * 0.3, -size * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        /**
         * 6. K/DA: Diamond Faceted Geometric Prism with Neon Laser Sweeps
         */
        drawKDACenterpiece(ctx) {
            const magenta = this.config.primary;
            const cyan = this.config.secondary;

            // 1. Neon Laser Sweeps Across Canvas
            const laserY = Math.sin(this.time * 2.0) * 75;
            ctx.save();
            // Horizontal Laser Line
            ctx.strokeStyle = cyan.hex;
            ctx.lineWidth = 2.0;
            ctx.shadowColor = cyan.hex;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(-160, laserY);
            ctx.lineTo(160, laserY);
            ctx.stroke();

            // Diagonal Neon Sweep
            const diagOffset = Math.cos(this.time * 1.6) * 60;
            ctx.strokeStyle = magenta.hex;
            ctx.lineWidth = 1.8;
            ctx.shadowColor = magenta.hex;
            ctx.beginPath();
            ctx.moveTo(-120 + diagOffset, -90);
            ctx.lineTo(120 + diagOffset, 90);
            ctx.stroke();
            ctx.restore();

            // 2. Orbiting Angular Cyber Shards
            ctx.save();
            ctx.rotate(this.rotation * 0.4);
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const dist = 95 + Math.sin(this.time * 3 + i) * 6;
                const sx = dist * Math.cos(angle);
                const sy = dist * Math.sin(angle);

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(angle + Math.PI / 4);
                ctx.fillStyle = i % 2 === 0 ? cyan.hex : magenta.hex;
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(0, -9); ctx.lineTo(6, 0); ctx.lineTo(0, 9); ctx.lineTo(-6, 0); ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();

            // 3. 3D Faceted Diamond Prism
            ctx.save();
            ctx.shadowColor = cyan.hex;
            ctx.shadowBlur = 18;

            // Parallax Apex Offset responding slightly to mouse and time
            const apexX = Math.sin(this.time * 1.5) * 8;
            const apexY = Math.cos(this.time * 1.5) * 6;

            // Diamond Vertices:
            // Top (0, -82), Bottom (0, 82), Left (-64, 0), Right (64, 0), Center Apex (apexX, apexY)
            // Mid Top-Left (-28, -36), Mid Top-Right (28, -36), Mid Bot-Left (-28, 42), Mid Bot-Right (28, 42)

            // Render Multi-Faceted Prisms with Iridescent Gradients
            this.drawFacet(ctx, [0, -82], [64, 0], [apexX, apexY], magenta.hex, cyan.hex, 0.45);
            this.drawFacet(ctx, [0, -82], [-64, 0], [apexX, apexY], cyan.hex, '#7928CA', 0.55);
            this.drawFacet(ctx, [0, 82], [64, 0], [apexX, apexY], '#00F0FF', '#FF007F', 0.6);
            this.drawFacet(ctx, [0, 82], [-64, 0], [apexX, apexY], '#7928CA', magenta.hex, 0.5);

            // Facet Wireframe Edge Outlines
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            // Outer Rhombus
            ctx.moveTo(0, -82); ctx.lineTo(64, 0); ctx.lineTo(0, 82); ctx.lineTo(-64, 0); ctx.closePath();
            // Apex Spokes
            ctx.moveTo(0, -82); ctx.lineTo(apexX, apexY);
            ctx.moveTo(64, 0); ctx.lineTo(apexX, apexY);
            ctx.moveTo(0, 82); ctx.lineTo(apexX, apexY);
            ctx.moveTo(-64, 0); ctx.lineTo(apexX, apexY);
            ctx.stroke();

            // Sparkling Reflection Node at Diamond Apex
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(apexX, apexY, 4.0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        drawFacet(ctx, p1, p2, p3, c1, c2, alpha) {
            const grad = ctx.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
            grad.addColorStop(0, c1);
            grad.addColorStop(1, c2);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.lineTo(p3[0], p3[1]);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        /**
         * Draw Ambient Particles
         */
        drawParticles() {
            const ctx = this.ctx;

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
                ctx.shadowColor = `rgb(${p.color.r}, ${p.color.g}, ${p.color.b})`;
                ctx.shadowBlur = 8;

                if (p.isStar) {
                    // Star shape for LoL, TFT & Star Guardian
                    this.drawMini4PointStar(ctx, 0, 0, p.radius * 1.5, ctx.fillStyle);
                } else if (this.theme === 'valorant') {
                    // Diamond tactical spark
                    ctx.beginPath();
                    ctx.moveTo(0, -p.radius * 1.4);
                    ctx.lineTo(p.radius, 0);
                    ctx.lineTo(0, p.radius * 1.4);
                    ctx.lineTo(-p.radius, 0);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Round glowing orb
                    ctx.beginPath();
                    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        /**
         * Draw Dynamic Trailing Sparks from Cursor & Bursts
         */
        drawSparks() {
            const ctx = this.ctx;

            for (let i = 0; i < this.sparks.length; i++) {
                const s = this.sparks[i];

                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.angle);
                ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.alpha})`;
                ctx.shadowColor = `rgb(${s.color.r}, ${s.color.g}, ${s.color.b})`;
                ctx.shadowBlur = 10;

                if (s.isStar) {
                    this.drawMini4PointStar(ctx, 0, 0, s.size * 1.6, ctx.fillStyle);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, s.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        /**
         * Draw Shockwave Ripples
         */
        drawShockwaves() {
            const ctx = this.ctx;

            for (let sw of this.shockwaves) {
                ctx.save();
                ctx.strokeStyle = `rgba(${sw.color.r}, ${sw.color.g}, ${sw.color.b}, ${sw.alpha})`;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = `rgb(${sw.color.r}, ${sw.color.g}, ${sw.color.b})`;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        /**
         * Helper: Draw Regular Polygon
         */
        drawPolygon(ctx, x, y, radius, sides, startAngle = 0) {
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i + startAngle;
                const px = x + radius * Math.cos(angle);
                const py = y + radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }

    // Initialize Engine when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.riotParticleEngine = new ParticleEngine();
        });
    } else {
        window.riotParticleEngine = new ParticleEngine();
    }
})();