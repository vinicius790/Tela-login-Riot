/**
 * Riot Web Audio Synthesis Engine (Zero External Audio Assets)
 * Procedural synthesis of authentic Riot Games client sound effects and micro-interactions.
 * 
 * Sound Design Specifications:
 * - 'click':   Crisp metallic mechanical UI click with high transient & dual resonance.
 * - 'hover':   Subtle high-pass harmonic blip with clean decay (non-fatiguing).
 * - 'focus':   Soft electronic rising chime with gentle envelope for input fields.
 * - 'whoosh':  Low-pass resonant wind sweep with dynamic filter sweep for theme/tabs.
 * - 'success': Triumphant brass & chime chord (major triad fanfare) for login & 2FA.
 * - 'error':   Low double buzzer with authoritative frequency drop.
 * - 'lockin':  Heavy cinematic champion lock-in drum boom with sub-bass drop & metallic clank.
 * - 'ambient': Gentle ambient cyber drone with pulsing resonant LFO filter.
 * 
 * Global API:
 * window.riotAudio = {
 *   play(soundName),
 *   toggleMute(),
 *   isMuted(),
 *   toggleAmbient(state),
 *   isAmbientPlaying(),
 *   ...
 * }
 */

(function() {
    'use strict';

    class RiotAudioEngine {
        constructor() {
            this.ctx = null;
            this.muted = localStorage.getItem('riot_audio_muted') === 'true';
            this.ambientPlaying = localStorage.getItem('riot_audio_ambient') === 'true';
            this.ambientNodes = null;
            this.noiseBuffer = null;
            this.masterGainNode = null;
            this.unlocked = false;

            // Initialize Context on user interaction to comply with autoplay policies
            this.setupAutoplayUnlock();

            // Bind UI & DOM Events
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initUI();
                    this.bindEvents();
                });
            } else {
                this.initUI();
                this.bindEvents();
            }
        }

        /**
         * Unlock Web Audio API context on first user gesture
         */
        setupAutoplayUnlock() {
            const unlockHandler = () => {
                this.initContext();
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                this.unlocked = true;

                // Resume ambient drone if user previously had it enabled and audio is unmuted
                if (this.ambientPlaying && !this.muted && !this.ambientNodes) {
                    this.startAmbient();
                }

                ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
                    document.removeEventListener(evt, unlockHandler);
                });
            };

            ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
                document.addEventListener(evt, unlockHandler, { once: true, passive: true });
            });
        }

        /**
         * Initialize AudioContext and Master Gain
         */
        initContext() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                    this.masterGainNode = this.ctx.createGain();
                    this.masterGainNode.gain.setValueAtTime(0.85, this.ctx.currentTime);
                    this.masterGainNode.connect(this.ctx.destination);
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
            return this.ctx;
        }

        /**
         * Generate a 1-second procedural white noise buffer (zero external assets)
         */
        getNoiseBuffer() {
            if (this.noiseBuffer) return this.noiseBuffer;
            if (!this.ctx) return null;

            const bufferSize = this.ctx.sampleRate;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            this.noiseBuffer = buffer;
            return buffer;
        }

        /**
         * Returns whether audio is currently muted
         * @returns {boolean}
         */
        isMuted() {
            return this.muted;
        }

        /**
         * Returns whether ambient cyber drone is currently playing
         * @returns {boolean}
         */
        isAmbientPlaying() {
            return Boolean(this.ambientPlaying && this.ambientNodes && !this.muted);
        }

        /**
         * Toggle Mute State and persist in localStorage
         * @returns {boolean} Current muted state
         */
        toggleMute() {
            this.muted = !this.muted;
            localStorage.setItem('riot_audio_muted', this.muted);

            if (this.muted) {
                if (this.ambientNodes) {
                    this.stopAmbient(true); // temporary pause
                }
            } else {
                this.initContext();
                this.playClick();
                if (this.ambientPlaying) {
                    this.startAmbient();
                }
            }

            this.updateAllAudioUI();

            if (window.showRiotToast) {
                window.showRiotToast(
                    this.muted ? 'Áudio do Riot Client silenciado' : 'Áudio do Riot Client ativado',
                    this.muted ? 'info' : 'success'
                );
            }

            return this.muted;
        }

        /**
         * Toggle Ambient Cyber Drone on/off
         * @param {boolean} [forceState]
         * @returns {boolean}
         */
        toggleAmbient(forceState) {
            if (typeof forceState === 'boolean') {
                this.ambientPlaying = forceState;
            } else {
                this.ambientPlaying = !this.ambientPlaying;
            }

            localStorage.setItem('riot_audio_ambient', this.ambientPlaying);

            if (this.ambientPlaying) {
                if (this.muted) {
                    this.toggleMute(); // unmute so user can hear drone
                } else {
                    this.initContext();
                    this.startAmbient();
                }
                if (window.showRiotToast) {
                    window.showRiotToast('Drone Cyberpunk Ambiente Ativado', 'info');
                }
            } else {
                this.stopAmbient();
                if (window.showRiotToast) {
                    window.showRiotToast('Drone Ambiente Desativado', 'info');
                }
            }

            this.updateAllAudioUI();
            return this.ambientPlaying;
        }

        /**
         * Start the real-time looping synthesized Cyber Drone
         */
        startAmbient() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;
            if (this.ambientNodes) return; // already running

            const now = this.ctx.currentTime;

            // Ambient Master Gain (with smooth 2.0s fade in)
            const ambientGain = this.ctx.createGain();
            ambientGain.gain.setValueAtTime(0.0001, now);
            ambientGain.gain.exponentialRampToValueAtTime(0.045, now + 2.0);

            // Resonant Lowpass Filter
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(220, now);
            filter.Q.setValueAtTime(3.2, now);

            // Breathing LFO for organic cybernetic swell
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.12, now); // ~8.3 second cycle

            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(110, now); // sweeps filter between 110Hz and 330Hz

            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            // Warm detuned multi-oscillator chord (A1, A2, E3, A3 + micro-detune)
            const frequencies = [
                { freq: 55.0, type: 'sine', gain: 0.8 },      // Deep A1 root sub
                { freq: 110.0, type: 'triangle', gain: 0.6 },  // A2 warm body
                { freq: 164.81, type: 'sine', gain: 0.5 },    // E3 harmonic 5th
                { freq: 220.4, type: 'sine', gain: 0.35 },    // A3 +0.4Hz detune for subtle beating
                { freq: 329.63, type: 'triangle', gain: 0.2 }  // E4 ethereal shimmer
            ];

            const oscillators = [];

            frequencies.forEach(spec => {
                const osc = this.ctx.createOscillator();
                osc.type = spec.type;
                osc.frequency.setValueAtTime(spec.freq, now);

                const oscGain = this.ctx.createGain();
                oscGain.gain.setValueAtTime(spec.gain, now);

                osc.connect(oscGain);
                oscGain.connect(filter);
                osc.start(now);
                oscillators.push(osc);
            });

            filter.connect(ambientGain);
            ambientGain.connect(this.masterGainNode || this.ctx.destination);
            lfo.start(now);

            this.ambientNodes = {
                ambientGain,
                filter,
                lfo,
                lfoGain,
                oscillators
            };
        }

        /**
         * Stop the synthesized Cyber Drone with smooth fade-out
         * @param {boolean} [isTemporary]
         */
        stopAmbient(isTemporary = false) {
            if (!this.ambientNodes || !this.ctx) return;

            const now = this.ctx.currentTime;
            const nodes = this.ambientNodes;
            this.ambientNodes = null;

            try {
                nodes.ambientGain.gain.cancelScheduledValues(now);
                nodes.ambientGain.gain.setValueAtTime(nodes.ambientGain.gain.value, now);
                nodes.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

                setTimeout(() => {
                    try {
                        nodes.oscillators.forEach(osc => osc.stop());
                        nodes.lfo.stop();
                        nodes.ambientGain.disconnect();
                    } catch (e) {}
                }, 750);
            } catch (e) {
                // fallback immediate teardown
                nodes.oscillators.forEach(osc => {
                    try { osc.stop(); } catch (err) {}
                });
            }

            if (!isTemporary) {
                this.ambientPlaying = false;
                localStorage.setItem('riot_audio_ambient', false);
            }
        }

        // =========================================================================
        // PROCEDURAL SOUND SYNTHESIS METHODS (ZERO EXTERNAL ASSETS)
        // =========================================================================

        /**
         * 'click': Crisp metallic mechanical UI click with high transient & dual resonance
         */
        playClick() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const dest = this.masterGainNode || this.ctx.destination;

            // 1. Noise transient burst (mechanical switch impact)
            const noise = this.getNoiseBuffer();
            if (noise) {
                const noiseSrc = this.ctx.createBufferSource();
                noiseSrc.buffer = noise;

                const noiseFilter = this.ctx.createBiquadFilter();
                noiseFilter.type = 'bandpass';
                noiseFilter.frequency.setValueAtTime(3600, now);
                noiseFilter.Q.setValueAtTime(3.5, now);

                const noiseGain = this.ctx.createGain();
                noiseGain.gain.setValueAtTime(0.12, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

                noiseSrc.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(dest);

                noiseSrc.start(now);
                noiseSrc.stop(now + 0.02);
            }

            // 2. Metallic Switch Body (sharp pitch drop triangle)
            const bodyOsc = this.ctx.createOscillator();
            bodyOsc.type = 'triangle';
            bodyOsc.frequency.setValueAtTime(1450, now);
            bodyOsc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

            const bodyGain = this.ctx.createGain();
            bodyGain.gain.setValueAtTime(0.14, now);
            bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

            bodyOsc.connect(bodyGain);
            bodyGain.connect(dest);
            bodyOsc.start(now);
            bodyOsc.stop(now + 0.035);

            // 3. Bottom Mechanical Micro-Thud (tactile bass feedback)
            const thudOsc = this.ctx.createOscillator();
            thudOsc.type = 'sine';
            thudOsc.frequency.setValueAtTime(260, now);
            thudOsc.frequency.exponentialRampToValueAtTime(65, now + 0.025);

            const thudGain = this.ctx.createGain();
            thudGain.gain.setValueAtTime(0.10, now);
            thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

            thudOsc.connect(thudGain);
            thudGain.connect(dest);
            thudOsc.start(now);
            thudOsc.stop(now + 0.025);
        }

        /**
         * 'hover': Subtle high-pass harmonic blip with clean decay (non-fatiguing)
         */
        playHover() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const dest = this.masterGainNode || this.ctx.destination;

            // Highpass filter to eliminate muddy lows
            const hpFilter = this.ctx.createBiquadFilter();
            hpFilter.type = 'highpass';
            hpFilter.frequency.setValueAtTime(1600, now);
            hpFilter.Q.setValueAtTime(1.2, now);

            // Fundamental Sine Harmonic
            const osc1 = this.ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1850, now);
            osc1.frequency.linearRampToValueAtTime(2150, now + 0.03);

            // Upper 5th Harmonic (3:2 frequency ratio)
            const osc2 = this.ctx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(2775, now);
            osc2.frequency.linearRampToValueAtTime(3225, now + 0.03);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.032, now + 0.003); // anti-pop attack
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(hpFilter);
            hpFilter.connect(dest);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.036);
            osc2.stop(now + 0.036);
        }

        /**
         * 'focus': Soft electronic rising chime with gentle envelope
         */
        playFocus() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const dest = this.masterGainNode || this.ctx.destination;

            // Warm Lowpass Filter for rounded, silky chime
            const lpFilter = this.ctx.createBiquadFilter();
            lpFilter.type = 'lowpass';
            lpFilter.frequency.setValueAtTime(2600, now);

            // Tone 1: D5 (587.33Hz)
            const osc1 = this.ctx.createOscillator();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(587.33, now);

            const gain1 = this.ctx.createGain();
            gain1.gain.setValueAtTime(0.001, now);
            gain1.gain.linearRampToValueAtTime(0.045, now + 0.005);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

            osc1.connect(gain1);
            gain1.connect(lpFilter);
            osc1.start(now);
            osc1.stop(now + 0.10);

            // Tone 2: A5 to C6 (880Hz -> 1046.5Hz) rising harmonic chime
            const osc2 = this.ctx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880.0, now + 0.035);
            osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.11);

            const gain2 = this.ctx.createGain();
            gain2.gain.setValueAtTime(0.001, now + 0.035);
            gain2.gain.linearRampToValueAtTime(0.040, now + 0.042);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

            osc2.connect(gain2);
            gain2.connect(lpFilter);
            osc2.start(now + 0.035);
            osc2.stop(now + 0.14);

            lpFilter.connect(dest);
        }

        /**
         * 'whoosh': Low-pass resonant wind sweep with dynamic filter sweep
         */
        playWhoosh() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const dest = this.masterGainNode || this.ctx.destination;
            const duration = 0.38;

            // 1. Resonant Bandpass Noise Sweep
            const noise = this.getNoiseBuffer();
            if (noise) {
                const noiseSrc = this.ctx.createBufferSource();
                noiseSrc.buffer = noise;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.Q.setValueAtTime(4.2, now);
                filter.frequency.setValueAtTime(260, now);
                filter.frequency.exponentialRampToValueAtTime(1750, now + 0.12);
                filter.frequency.exponentialRampToValueAtTime(240, now + duration);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.12, now + 0.10);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

                noiseSrc.connect(filter);
                filter.connect(gain);
                gain.connect(dest);

                noiseSrc.start(now);
                noiseSrc.stop(now + duration);
            }

            // 2. Air displacement sub tone (smooth downward glide)
            const subOsc = this.ctx.createOscillator();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(260, now);
            subOsc.frequency.exponentialRampToValueAtTime(60, now + duration);

            const subGain = this.ctx.createGain();
            subGain.gain.setValueAtTime(0.001, now);
            subGain.gain.linearRampToValueAtTime(0.05, now + 0.08);
            subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            subOsc.connect(subGain);
            subGain.connect(dest);
            subOsc.start(now);
            subOsc.stop(now + duration);
        }

        /**
         * 'success': Triumphant brass & chime chord (major triad fanfare)
         */
        playSuccess() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const dest = this.masterGainNode || this.ctx.destination;

            // Heroic F Major Triad Voicing: F3, C4, F4, A4, C5, F5
            const chord = [
                { note: 174.61, delay: 0.00, dur: 0.85, type: 'triangle', gain: 0.09 }, // F3
                { note: 261.63, delay: 0.04, dur: 0.80, type: 'sawtooth', gain: 0.07 }, // C4
                { note: 349.23, delay: 0.08, dur: 0.80, type: 'triangle', gain: 0.08 }, // F4
                { note: 440.00, delay: 0.12, dur: 0.90, type: 'sine',     gain: 0.09 }, // A4
                { note: 523.25, delay: 0.16, dur: 0.95, type: 'sine',     gain: 0.08 }, // C5
                { note: 698.46, delay: 0.20, dur: 1.10, type: 'sine',     gain: 0.07 }  // F5
            ];

            // Dynamic brass filter sweep opening up with triumphant energy
            const brassFilter = this.ctx.createBiquadFilter();
            brassFilter.type = 'lowpass';
            brassFilter.frequency.setValueAtTime(320, now);
            brassFilter.frequency.exponentialRampToValueAtTime(3400, now + 0.14);
            brassFilter.frequency.exponentialRampToValueAtTime(1600, now + 0.9);
            brassFilter.connect(dest);

            chord.forEach(item => {
                const startTime = now + item.delay;
                const osc = this.ctx.createOscillator();
                osc.type = item.type;
                osc.frequency.setValueAtTime(item.note, startTime);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.0001, startTime);
                gain.gain.linearRampToValueAtTime(item.gain, startTime + 0.035);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + item.dur);

                osc.connect(gain);
                gain.connect(brassFilter);

                osc.start(startTime);
                osc.stop(startTime + item.dur);
            });
        }

        /**
         * 'error': Low double buzzer with authoritative frequency drop
         */
        playError() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const dest = this.masterGainNode || this.ctx.destination;

            const createBuzzPulse = (startTime, startFreq, endFreq, dur, gainVal) => {
                const osc = this.ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(startFreq, startTime);
                osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + dur);

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(420, startTime);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

                // Sub body
                const sub = this.ctx.createOscillator();
                sub.type = 'sine';
                sub.frequency.setValueAtTime(startFreq * 0.5, startTime);
                sub.frequency.exponentialRampToValueAtTime(endFreq * 0.5, startTime + dur);

                const subGain = this.ctx.createGain();
                subGain.gain.setValueAtTime(gainVal * 0.5, startTime);
                subGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(dest);

                sub.connect(subGain);
                subGain.connect(dest);

                osc.start(startTime);
                osc.stop(startTime + dur);
                sub.start(startTime);
                sub.stop(startTime + dur);
            };

            // Pulse 1
            createBuzzPulse(now, 165, 105, 0.13, 0.15);
            // Pulse 2 (40ms gap)
            createBuzzPulse(now + 0.17, 135, 75, 0.17, 0.17);
        }

        /**
         * 'lockin': Heavy cinematic champion lock-in drum boom with sub-bass drop & metallic clank
         */
        playLockin() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const dest = this.masterGainNode || this.ctx.destination;

            // 1. Heavy Sub-bass Drop (sine wave dropping from 145Hz down to 35Hz)
            const subOsc = this.ctx.createOscillator();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(145, now);
            subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.85);

            const subGain = this.ctx.createGain();
            subGain.gain.setValueAtTime(0.28, now);
            subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

            subOsc.connect(subGain);
            subGain.connect(dest);
            subOsc.start(now);
            subOsc.stop(now + 1.2);

            // 2. Punch Kick Impact Transient (rapid pitch drop 320Hz -> 50Hz in 35ms)
            const punchOsc = this.ctx.createOscillator();
            punchOsc.type = 'triangle';
            punchOsc.frequency.setValueAtTime(320, now);
            punchOsc.frequency.exponentialRampToValueAtTime(50, now + 0.035);

            const punchGain = this.ctx.createGain();
            punchGain.gain.setValueAtTime(0.25, now);
            punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            punchOsc.connect(punchGain);
            punchGain.connect(dest);
            punchOsc.start(now);
            punchOsc.stop(now + 0.04);

            // 3. Metallic Lock Clank / Anvil Impact (bandpassed noise burst + harmonic ping)
            const noise = this.getNoiseBuffer();
            if (noise) {
                const noiseSrc = this.ctx.createBufferSource();
                noiseSrc.buffer = noise;

                const clankFilter = this.ctx.createBiquadFilter();
                clankFilter.type = 'bandpass';
                clankFilter.frequency.setValueAtTime(2700, now);
                clankFilter.Q.setValueAtTime(5.0, now);

                const clankGain = this.ctx.createGain();
                clankGain.gain.setValueAtTime(0.18, now);
                clankGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

                noiseSrc.connect(clankFilter);
                clankFilter.connect(clankGain);
                clankGain.connect(dest);

                noiseSrc.start(now);
                noiseSrc.stop(now + 0.05);
            }

            const ringOsc = this.ctx.createOscillator();
            ringOsc.type = 'square';
            ringOsc.frequency.setValueAtTime(1080, now);

            const ringGain = this.ctx.createGain();
            ringGain.gain.setValueAtTime(0.06, now);
            ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

            ringOsc.connect(ringGain);
            ringGain.connect(dest);
            ringOsc.start(now);
            ringOsc.stop(now + 0.05);

            // 4. Detuned Low Rumble Resonance (adds spatial depth)
            const rumbleOsc = this.ctx.createOscillator();
            rumbleOsc.type = 'sine';
            rumbleOsc.frequency.setValueAtTime(42, now);

            const rumbleGain = this.ctx.createGain();
            rumbleGain.gain.setValueAtTime(0.15, now);
            rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

            rumbleOsc.connect(rumbleGain);
            rumbleGain.connect(dest);
            rumbleOsc.start(now);
            rumbleOsc.stop(now + 1.3);
        }

        /**
         * Generic dispatcher for synthesized sound effects
         * @param {string} soundName
         */
        play(soundName) {
            if (!soundName) return this.playClick();
            const normalized = String(soundName).toLowerCase().replace(/[-_]/g, '').trim();

            switch (normalized) {
                case 'click':
                    return this.playClick();
                case 'hover':
                    return this.playHover();
                case 'focus':
                    return this.playFocus();
                case 'whoosh':
                case 'woosh':
                    return this.playWhoosh();
                case 'success':
                case 'fanfare':
                    return this.playSuccess();
                case 'error':
                case 'buzz':
                    return this.playError();
                case 'lockin':
                case 'lock':
                case 'boom':
                    return this.playLockin();
                case 'ambient':
                case 'drone':
                    return this.toggleAmbient();
                default:
                    return this.playClick();
            }
        }

        // =========================================================================
        // UI & EVENT CONNECTIONS
        // =========================================================================

        /**
         * Initialize Audio UI Controls: binds header buttons or fallback floating button
         */
        initUI() {
            // 1. Connect Header Audio Toggle Button (#audioToggleBtn)
            const headerAudioBtn = document.getElementById('audioToggleBtn');
            if (headerAudioBtn && !headerAudioBtn._riotAudioBound) {
                headerAudioBtn._riotAudioBound = true;
                headerAudioBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMute();
                });

                // Right click / Contextmenu to toggle Ambient Cyber Drone
                headerAudioBtn.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleAmbient();
                });
            }

            // 2. Connect Dedicated Ambient Toggle Button (#ambientToggleBtn)
            const headerAmbientBtn = document.getElementById('ambientToggleBtn');
            if (headerAmbientBtn && !headerAmbientBtn._riotAudioBound) {
                headerAmbientBtn._riotAudioBound = true;
                headerAmbientBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleAmbient();
                });
            }

            // 3. Create fallback floating button only if no audio controls exist
            if (!headerAudioBtn && !document.getElementById('riot-audio-toggle')) {
                const floatingBtn = document.createElement('button');
                floatingBtn.id = 'riot-audio-toggle';
                floatingBtn.type = 'button';
                floatingBtn.className = 'riot-audio-toggle-btn';
                floatingBtn.setAttribute('aria-label', 'Alternar Som Riot');

                // Style for floating toggle
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
                            backdrop-filter: blur(8px);
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
                            box-shadow: 0 4px 14px rgba(0,0,0,0.6);
                        }
                        .riot-audio-toggle-btn:hover {
                            background: #EB0029;
                            border-color: #EB0029;
                            transform: scale(1.08);
                        }
                        .riot-audio-toggle-btn svg {
                            width: 20px;
                            height: 20px;
                            fill: currentColor;
                        }
                        .control-btn.ambient-active {
                            border-color: #10B981 !important;
                            color: #10B981 !important;
                            box-shadow: 0 0 10px rgba(16, 185, 129, 0.35);
                        }
                    `;
                    document.head.appendChild(style);
                }

                floatingBtn.addEventListener('click', () => this.toggleMute());
                floatingBtn.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleAmbient();
                });

                document.body.appendChild(floatingBtn);
            }

            this.updateAllAudioUI();
        }

        /**
         * Update state and icons across all audio buttons in the DOM
         */
        updateAllAudioUI() {
            // 1. Header Audio Toggle Button
            const headerAudioBtn = document.getElementById('audioToggleBtn');
            const audioIcon = document.getElementById('audioIcon');
            if (headerAudioBtn) {
                if (this.muted) {
                    if (audioIcon) audioIcon.textContent = '🔇';
                    headerAudioBtn.title = 'Áudio Silenciado (Ctrl+M para ativar | Clique direito: Cyber Drone)';
                    headerAudioBtn.classList.add('audio-muted');
                } else {
                    if (audioIcon) audioIcon.textContent = '🔊';
                    headerAudioBtn.title = 'Áudio Ativado (Ctrl+M para silenciar | Clique direito: Cyber Drone)';
                    headerAudioBtn.classList.remove('audio-muted');
                }
            }

            // 2. Header Ambient Button
            const ambientBtn = document.getElementById('ambientToggleBtn');
            const ambientIcon = document.getElementById('ambientIcon');
            if (ambientBtn) {
                if (this.ambientPlaying && !this.muted) {
                    ambientBtn.classList.add('ambient-active');
                    if (ambientIcon) ambientIcon.textContent = '🎧 Drone (ON)';
                    ambientBtn.title = 'Drone Cyberpunk Ambiente Ativo (Alt+A para desligar)';
                } else {
                    ambientBtn.classList.remove('ambient-active');
                    if (ambientIcon) ambientIcon.textContent = '🎧 Drone';
                    ambientBtn.title = 'Drone Cyberpunk Ambiente Desligado (Alt+A para ligar)';
                }
            }

            // 3. Fallback Floating Button
            const floatingBtn = document.getElementById('riot-audio-toggle');
            if (floatingBtn) {
                if (this.muted) {
                    floatingBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
                    floatingBtn.title = 'Ativar Áudio Riot (Ctrl+M)';
                } else {
                    floatingBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
                    floatingBtn.title = 'Silenciar Áudio Riot (Ctrl+M | Clique direito: Cyber Drone)';
                }
            }
        }

        /**
         * Bind UI buttons, inputs, theme switch, 2FA submission & keyboard shortcuts
         */
        bindEvents() {
            // A. Click Events on Interactive UI Elements
            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-no-audio]')) return;

                // 1. Champion Lock-in Boom on Login Submit & 2FA Confirm
                const lockinTarget = e.target.closest('.login__button, #loginSubmitBtn, #btnVerify2FA');
                if (lockinTarget) {
                    this.playLockin();
                    return;
                }

                // 2. Audio control buttons have their own toggles
                if (e.target.closest('#audioToggleBtn, #riot-audio-toggle, #ambientToggleBtn')) {
                    return;
                }

                // 3. Crisp Mechanical Click for all standard buttons, links, controls & checkboxes
                const clickTarget = e.target.closest('button, a, .input--checkbox, .control-btn, .control-select, .icons__button, .password-toggle-btn');
                if (clickTarget) {
                    this.playClick();
                }
            });

            // B. Hover Events on Buttons, Icons & Navigation
            document.addEventListener('mouseover', (e) => {
                const target = e.target.closest('button, a, .icons__button, .login__button, .control-btn, .control-select, .input--checkbox');
                if (target && !target._hoverSoundPlayed) {
                    target._hoverSoundPlayed = true;
                    this.playHover();

                    target.addEventListener('mouseleave', () => {
                        target._hoverSoundPlayed = false;
                    }, { once: true });
                }
            });

            // C. Focus Events on Form Inputs & Selects
            document.addEventListener('focusin', (e) => {
                const tag = e.target.tagName;
                if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
                    if (e.target.classList.contains('otp-field')) {
                        this.playHover(); // quick subtle blip for OTP pin code
                    } else {
                        this.playFocus(); // soft rising electronic chime
                    }
                }
            });

            // D. Typing on OTP 2FA fields
            document.addEventListener('input', (e) => {
                if (e.target.classList && e.target.classList.contains('otp-field')) {
                    if (e.target.value.length > 0) {
                        this.playHover();
                    }
                }
            });

            // E. Theme Switch Events (Whoosh resonant wind sweep)
            window.addEventListener('riotThemeChanged', () => {
                this.playWhoosh();
            });

            const themeSelector = document.getElementById('themeSelector');
            if (themeSelector) {
                themeSelector.addEventListener('change', () => {
                    this.playWhoosh();
                });
            }

            // F. 2FA Submission & Authentication Events
            window.addEventListener('auth:success', () => {
                this.playSuccess();
            });

            window.addEventListener('auth:error', () => {
                this.playError();
            });

            window.addEventListener('auth:2fa_required', () => {
                this.playWhoosh();
            });

            window.addEventListener('auth:account_created', () => {
                this.playSuccess();
            });

            window.addEventListener('auth:password_recovery_sent', () => {
                this.playSuccess();
            });

            window.addEventListener('auth:logout', () => {
                this.playWhoosh();
            });

            // G. Keyboard Shortcuts: Alt + A for Cyber Drone Ambient
            document.addEventListener('keydown', (e) => {
                if (e.altKey && (e.key === 'a' || e.key === 'A')) {
                    e.preventDefault();
                    this.toggleAmbient();
                }
            });
        }
    }

    // Expose Global Singleton instance as required
    window.riotAudio = new RiotAudioEngine();

})();
