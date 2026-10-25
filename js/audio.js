/**
 * Riot Sound FX & Micro-interactions Engine (Web Audio API)
 * Synthesizes subtle Riot Client sound effects without external audio files.
 */

class RiotAudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('riot_audio_muted') === 'true';
        this.initUI();
        this.bindEvents();
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('riot_audio_muted', this.muted);
        this.updateMuteButtonUI();
        if (!this.muted) {
            this.playClick();
        }
        return this.muted;
    }

    initUI() {
        if (document.getElementById('riot-audio-toggle')) return;

        const btn = document.createElement('button');
        btn.id = 'riot-audio-toggle';
        btn.type = 'button';
        btn.className = 'riot-audio-toggle-btn';
        btn.setAttribute('aria-label', 'Alternar Som');
        
        // CSS for toggle button
        if (!document.getElementById('riot-audio-styles')) {
            const style = document.createElement('style');
            style.id = 'riot-audio-styles';
            style.textContent = `
                .riot-audio-toggle-btn {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                    background: rgba(15, 19, 23, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                }
                .riot-audio-toggle-btn:hover {
                    background: #eb0029;
                    border-color: #eb0029;
                    transform: scale(1.05);
                }
                .riot-audio-toggle-btn svg {
                    width: 20px;
                    height: 20px;
                    fill: currentColor;
                }
            `;
            document.head.appendChild(style);
        }

        this.updateMuteButtonElement(btn);
        btn.addEventListener('click', () => {
            this.toggleMute();
        });

        document.body.appendChild(btn);
    }

    updateMuteButtonUI() {
        const btn = document.getElementById('riot-audio-toggle');
        if (btn) {
            this.updateMuteButtonElement(btn);
        }
    }

    updateMuteButtonElement(btn) {
        if (this.muted) {
            btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
            btn.title = "Ativar Som";
        } else {
            btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
            btn.title = "Desativar Som (Mute)";
        }
    }

    bindEvents() {
        // Auto bind click on buttons and links
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a, .input--checkbox');
            if (target) {
                this.playClick();
            }
        });

        // Auto bind hover on social buttons / interactive elements
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('.icons__button, .login__button');
            if (target && !target._hoverPlayed) {
                target._hoverPlayed = true;
                this.playHover();
                target.addEventListener('mouseleave', () => {
                    target._hoverPlayed = false;
                }, { once: true });
            }
        });

        // Auto bind focus on inputs
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.playFocus();
            }
        });

        // Listen to MockAuth events if present
        window.addEventListener('auth:success', () => this.playSuccess());
        window.addEventListener('auth:error', () => this.playError());
    }

    playClick() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playFocus() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    playHover() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(650, now + 0.04);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    playSuccess() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
            const time = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.15);
        });
    }

    play(type) {
        if (!type) return this.playClick();
        switch (type.toLowerCase()) {
            case 'click': return this.playClick();
            case 'focus': return this.playFocus();
            case 'hover': return this.playHover();
            case 'success': return this.playSuccess();
            case 'error': return this.playError();
            case 'whoosh': return this.playWhoosh();
            default: return this.playClick();
        }
    }

    playWhoosh() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.linearRampToValueAtTime(200, now + 0.25);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playError() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.2);

        // Lowpass filter for muffled error thump
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    }
}

window.riotAudio = new RiotAudioEngine();
