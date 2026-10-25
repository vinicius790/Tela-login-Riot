/**
 * confetti.js - Lightweight Canvas Confetti Generator
 * Triggered on successful authentication, registration, or 2FA verification.
 */
(function() {
    'use strict';

    window.triggerConfetti = function() {
        const canvas = document.createElement('canvas');
        canvas.id = 'riot-confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const count = 70;
        const colors = ['#EB0029', '#FF4655', '#C4B998', '#FFFFFF', '#1B77F3', '#FFD700'];
        const particles = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                w: Math.random() * 8 + 4,
                h: Math.random() * 6 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.5) * 16 - 3,
                rotation: Math.random() * 360,
                rspeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        let start = performance.now();
        function render(time) {
            const elapsed = time - start;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let alive = false;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.35; // gravity
                p.vx *= 0.98; // air drag
                p.rotation += p.rspeed;
                p.opacity = Math.max(0, 1 - elapsed / 2200);

                if (p.opacity > 0) {
                    alive = true;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.opacity;
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                }
            }

            if (alive && elapsed < 2500) {
                requestAnimationFrame(render);
            } else {
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }
        }

        requestAnimationFrame(render);
    };
})();
