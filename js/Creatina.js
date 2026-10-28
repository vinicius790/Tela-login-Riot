/**
 * Creatina.js - Riot Esports Performance & Biometrics Suite Engine
 * Contains:
 *  1. Biometric Calculators (IMC, Water Intake, Basal Metabolic Rate)
 *  2. APM (Actions Per Minute) Clicker & Precision Trainer
 *  3. Visual Reflex / Reaction Latency Timer with Pro Player Benchmarks
 *  4. Ergonomics Modal & Gamer Active Break Timer
 *  5. Web Audio API Sound Synthesizer
 */

// ==========================================
// 0. WEB AUDIO API SYNTHESIZER
// ==========================================
let audioCtx = null;
let soundEnabled = true;
let soundVolume = parseFloat(localStorage.getItem('riot_bodyfit_volume') || '0.6');

function changeSoundVolume(val) {
    soundVolume = Math.max(0, Math.min(1, parseFloat(val) || 0.6));
    localStorage.setItem('riot_bodyfit_volume', soundVolume);
}

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playAudioFx(type) {
    if (!soundEnabled || soundVolume <= 0) return;
    try {
        initAudio();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
            gain.gain.setValueAtTime(0.2 * soundVolume, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
            gain.gain.setValueAtTime(0.3 * soundVolume, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'buzz') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.setValueAtTime(110, now + 0.1);
            gain.gain.setValueAtTime(0.35 * soundVolume, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'fanfare') {
            // Challenger or High Score Chime
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const noteOsc = audioCtx.createOscillator();
                const noteGain = audioCtx.createGain();
                noteOsc.type = 'sine';
                noteOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
                noteGain.gain.setValueAtTime(0.25 * soundVolume, now + idx * 0.08);
                noteGain.gain.linearRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
                noteOsc.connect(noteGain);
                noteGain.connect(audioCtx.destination);
                noteOsc.start(now + idx * 0.08);
                noteOsc.stop(now + idx * 0.08 + 0.25);
            });
        } else if (type === 'beep') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.25 * soundVolume, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.07);
            osc.start(now);
            osc.stop(now + 0.07);
        }
    } catch (e) {
        console.warn("Audio FX error:", e);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-toggle');
    if (btn) {
        if (soundEnabled) {
            btn.innerHTML = `<i class="fa-solid fa-volume-high"></i> Áudio: ON`;
            btn.classList.add('active');
            playAudioFx('beep');
        } else {
            btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> Áudio: OFF`;
            btn.classList.remove('active');
        }
    }
}

// ==========================================
// 1. CALCULADORAS BIOMÉTRICAS (IMC, Água, TMB)
// ==========================================

function calcularIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const res = document.getElementById('resultado-imc');

    if (!peso || !altura || altura <= 0) {
        res.innerHTML = "Por favor, insira peso e altura válidos!";
        res.style.color = "#FF4444";
        return;
    }

    const imc = peso / (altura * altura);
    let classificacao = "";
    let cor = "#00FF88";

    if (imc < 18.5) {
        classificacao = "Abaixo do peso ideal";
        cor = "#3B82F6";
    } else if (imc < 24.9) {
        classificacao = "Peso normal e saudável (Excelente!)";
        cor = "#00FF88";
    } else if (imc < 29.9) {
        classificacao = "Sobrepeso (Atenção à dieta)";
        cor = "#F59E0B";
    } else {
        classificacao = "Obesidade (Recomendado acompanhamento)";
        cor = "#EF4444";
    }

    playAudioFx('click');
    res.style.color = cor;
    res.innerHTML = `<strong>IMC: ${imc.toFixed(2)}</strong> — ${classificacao}`;
}

function calcularAgua() {
    const peso = parseFloat(document.getElementById('peso-agua').value);
    const res = document.getElementById('resultado-agua');

    if (!peso || peso <= 0) {
        res.innerHTML = "Informe seu peso em kg.";
        res.style.color = "#FF4444";
        return;
    }

    const litros = (peso * 35) / 1000;
    playAudioFx('click');
    res.style.color = "#38BDF8";
    res.innerHTML = `Meta Diária: <strong>${litros.toFixed(2)} Litros</strong> de água (~${Math.round(litros * 4)} copos de 250ml)`;
}

function calcularTMB() {
    const peso = parseFloat(document.getElementById('tmb-peso').value);
    const alturaCm = parseFloat(document.getElementById('tmb-altura').value);
    const idade = parseInt(document.getElementById('tmb-idade').value, 10);
    const sexo = document.getElementById('tmb-sexo').value;
    const res = document.getElementById('resultado-tmb');

    if (!peso || !alturaCm || !idade) {
        res.innerHTML = "Preencha todos os campos da TMB.";
        res.style.color = "#FF4444";
        return;
    }

    let tmb = (10 * peso) + (6.25 * alturaCm) - (5 * idade);
    tmb += (sexo === 'm') ? 5 : -161;

    playAudioFx('click');
    res.style.color = "#C084FC";
    res.innerHTML = `Gasto Calórico Basal: <strong>~${Math.round(tmb)} kcal/dia</strong> (em repouso absoluto)`;
}


// ==========================================
// 2. APM (ACTIONS PER MINUTE) TRAINER
// ==========================================

const APM_TEST_DURATION = 10; // seconds
let apmState = 'idle'; // 'idle' | 'running' | 'finished'
let apmClicks = 0;
let apmTimeRemaining = APM_TEST_DURATION;
let apmInterval = null;
let apmStartTime = null;
let apmMode = 'speed'; // 'speed' | 'precision'

function initApmTrainer() {
    const bestApm = localStorage.getItem('riot_bodyfit_best_apm');
    const bestEl = document.getElementById('apm-best-val');
    if (bestEl && bestApm) {
        bestEl.innerText = bestApm;
    }
}

function setApmMode(mode) {
    if (apmState === 'running') return;
    apmMode = mode;
    document.querySelectorAll('.apm-mode-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-mode-${mode}`);
    if (btn) btn.classList.add('active');

    resetApmTest();
}

function handleApmArenaClick(e) {
    if (apmState === 'finished') return;

    if (apmState === 'idle') {
        startApmTest();
    }

    if (apmState === 'running') {
        // If precision mode, clicks on arena background might count as misses if target wasn't clicked
        if (apmMode === 'precision') {
            // Target click handles its own logic, background clicks are counted or ignored
            return;
        }

        apmClicks++;
        playAudioFx('click');
        createClickRipple(e, document.getElementById('apm-arena'));
        updateApmLiveStats();
    }
}

function handleTargetClick(e) {
    e.stopPropagation();
    if (apmState !== 'running') return;

    apmClicks++;
    playAudioFx('hit');
    createClickRipple(e, document.getElementById('apm-arena'));
    updateApmLiveStats();
    spawnPrecisionTarget();
}

function startApmTest() {
    apmState = 'running';
    apmClicks = 0;
    apmTimeRemaining = APM_TEST_DURATION;
    apmStartTime = performance.now();

    const arena = document.getElementById('apm-arena');
    if (arena) arena.classList.add('running');

    const promptText = document.getElementById('apm-prompt-title');
    const promptSub = document.getElementById('apm-prompt-sub');
    if (promptText) promptText.innerText = apmMode === 'precision' ? "CLIQUE NO ALVO HEXTECH!" : "CLIQUE O MAIS RÁPIDO POSSÍVEL!";
    if (promptSub) promptSub.innerText = "Mantenha o ritmo acelerado!";

    const rankBox = document.getElementById('apm-rank-result');
    if (rankBox) rankBox.style.display = 'none';

    if (apmMode === 'precision') {
        spawnPrecisionTarget();
    }

    playAudioFx('beep');

    apmInterval = setInterval(() => {
        const elapsed = (performance.now() - apmStartTime) / 1000;
        apmTimeRemaining = Math.max(0, APM_TEST_DURATION - elapsed);

        const timeEl = document.getElementById('apm-time-val');
        if (timeEl) timeEl.innerText = apmTimeRemaining.toFixed(1) + 's';

        const fillEl = document.getElementById('apm-timer-fill');
        if (fillEl) {
            const pct = (apmTimeRemaining / APM_TEST_DURATION) * 100;
            fillEl.style.width = pct + '%';
        }

        updateApmLiveStats();

        if (apmTimeRemaining <= 0) {
            finishApmTest();
        }
    }, 50);
}

function updateApmLiveStats() {
    const clicksEl = document.getElementById('apm-clicks-val');
    if (clicksEl) clicksEl.innerText = apmClicks;

    const elapsed = Math.max(0.1, (performance.now() - apmStartTime) / 1000);
    const liveApm = Math.round((apmClicks / elapsed) * 60);

    const apmValEl = document.getElementById('apm-current-val');
    if (apmValEl) apmValEl.innerText = liveApm;
}

function spawnPrecisionTarget() {
    const arena = document.getElementById('apm-arena');
    if (!arena) return;

    // Remove old target
    const oldTarget = arena.querySelector('.hex-target');
    if (oldTarget) oldTarget.remove();

    if (apmState !== 'running') return;

    const arenaRect = arena.getBoundingClientRect();
    const margin = 35;
    const maxX = arenaRect.width - margin * 2;
    const maxY = arenaRect.height - margin * 2;

    const posX = margin + Math.random() * maxX;
    const posY = margin + Math.random() * maxY;

    const target = document.createElement('div');
    target.className = 'hex-target';
    target.style.left = posX + 'px';
    target.style.top = posY + 'px';
    target.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
    target.onclick = handleTargetClick;

    arena.appendChild(target);
}

function finishApmTest() {
    clearInterval(apmInterval);
    apmState = 'finished';

    const arena = document.getElementById('apm-arena');
    if (arena) {
        arena.classList.remove('running');
        const oldTarget = arena.querySelector('.hex-target');
        if (oldTarget) oldTarget.remove();
    }

    const finalApm = Math.round((apmClicks / APM_TEST_DURATION) * 60);
    const timeEl = document.getElementById('apm-time-val');
    if (timeEl) timeEl.innerText = '0.0s';

    const apmValEl = document.getElementById('apm-current-val');
    if (apmValEl) apmValEl.innerText = finalApm;

    // Evaluate Rank
    let rankName = "Ferro";
    let rankColor = "rank-iron";
    let rankIcon = "fa-shield-halved";
    let rankDesc = "Iniciante. Aqueça os dedos, ajuste sua empunhadura e tente novamente!";

    if (finalApm >= 350) {
        rankName = "Challenger / Desafiante";
        rankColor = "rank-challenger";
        rankIcon = "fa-crown";
        rankDesc = "NÍVEL MONDIAL! Reflexos e velocidade de Faker / Chovy. Mãos prontas para a LCK!";
        playAudioFx('fanfare');
    } else if (finalApm >= 240) {
        rankName = "Diamante / Mestre";
        rankColor = "rank-diamond";
        rankIcon = "fa-gem";
        rankDesc = "Excelente velocidade! Ritmo de jogador pro-tier de alto calibre.";
        playAudioFx('fanfare');
    } else if (finalApm >= 160) {
        rankName = "Ouro / Platina";
        rankColor = "rank-gold";
        rankIcon = "fa-medal";
        rankDesc = "Bom ritmo competitivo. Com consistência você alcança o tier Diamante!";
        playAudioFx('hit');
    } else if (finalApm >= 100) {
        rankName = "Prata";
        rankColor = "rank-silver";
        rankIcon = "fa-shield-heart";
        rankDesc = "Média regular. Mantenha os treinos diários e pausas ergonômicas para evoluir.";
        playAudioFx('click');
    } else {
        playAudioFx('click');
    }

    // Save Highscore
    const bestApm = parseInt(localStorage.getItem('riot_bodyfit_best_apm') || '0', 10);
    if (finalApm > bestApm) {
        localStorage.setItem('riot_bodyfit_best_apm', finalApm);
        const bestEl = document.getElementById('apm-best-val');
        if (bestEl) bestEl.innerText = finalApm;
    }

    // Display Result Box
    const rankBox = document.getElementById('apm-rank-result');
    if (rankBox) {
        rankBox.style.display = 'block';
        rankBox.innerHTML = `
            <div class="rank-badge-icon ${rankColor}"><i class="fa-solid ${rankIcon}"></i></div>
            <div class="rank-tier-name ${rankColor}">Rank: ${rankName}</div>
            <div style="font-size: 1.15rem; font-weight: 700; margin: 4px 0; color: #FFF;">${finalApm} APM (${apmClicks} cliques em 10s)</div>
            <p style="font-size: 0.85rem; color: #9CA3AF; margin: 6px auto 14px auto; max-width: 450px;">${rankDesc}</p>
            <button class="btn-calc" onclick="resetApmTest()" style="background: var(--neon-green); color: #080B10; max-width: 200px; margin: 0 auto;">
                <i class="fa-solid fa-rotate-right"></i> Treinar Novamente
            </button>
        `;
    }

    const promptText = document.getElementById('apm-prompt-title');
    const promptSub = document.getElementById('apm-prompt-sub');
    if (promptText) promptText.innerText = "TESTE FINALIZADO!";
    if (promptSub) promptSub.innerText = `Resultado calculado: ${finalApm} APM.`;
}

function resetApmTest() {
    clearInterval(apmInterval);
    apmState = 'idle';
    apmClicks = 0;
    apmTimeRemaining = APM_TEST_DURATION;

    const timeEl = document.getElementById('apm-time-val');
    if (timeEl) timeEl.innerText = '10.0s';

    const clicksEl = document.getElementById('apm-clicks-val');
    if (clicksEl) clicksEl.innerText = '0';

    const apmValEl = document.getElementById('apm-current-val');
    if (apmValEl) apmValEl.innerText = '0';

    const fillEl = document.getElementById('apm-timer-fill');
    if (fillEl) fillEl.style.width = '100%';

    const arena = document.getElementById('apm-arena');
    if (arena) {
        arena.classList.remove('running');
        const oldTarget = arena.querySelector('.hex-target');
        if (oldTarget) oldTarget.remove();
    }

    const promptText = document.getElementById('apm-prompt-title');
    const promptSub = document.getElementById('apm-prompt-sub');
    if (promptText) promptText.innerText = "CLIQUE PARA INICIAR";
    if (promptSub) promptSub.innerText = "O cronômetro de 10 segundos inicia no primeiro clique.";

    const rankBox = document.getElementById('apm-rank-result');
    if (rankBox) rankBox.style.display = 'none';
}

function createClickRipple(e, container) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    const size = 30;
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    container.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 450);
}


// ==========================================
// 3. VISUAL REFLEX / REACTION LATENCY TIMER
// ==========================================

let reflexState = 'idle'; // 'idle' | 'waiting' | 'ready' | 'result' | 'early'
let reflexTimeoutId = null;
let reflexStartTime = 0;
let reflexHistory = [];

function initReflexTimer() {
    const bestReflex = localStorage.getItem('riot_bodyfit_best_reflex');
    const bestEl = document.getElementById('reflex-best-val');
    if (bestEl && bestReflex) {
        bestEl.innerText = bestReflex + ' ms';
    }
}

function handleReflexBoxClick() {
    const box = document.getElementById('reflex-box');
    const title = document.getElementById('reflex-title');
    const desc = document.getElementById('reflex-desc');
    const icon = document.getElementById('reflex-icon');

    if (reflexState === 'idle' || reflexState === 'result' || reflexState === 'early') {
        // Transition to WAITING
        reflexState = 'waiting';
        box.className = 'reflex-box reflex-waiting';
        icon.className = 'fa-solid fa-hourglass-half';
        title.innerText = 'AGUARDE A COR VERDE...';
        desc.innerText = 'Fique atento! Não clique antes da tela mudar de cor.';
        playAudioFx('beep');

        // Randomized delay between 1.6s and 4.2s
        const randomDelay = 1600 + Math.random() * 2600;
        reflexTimeoutId = setTimeout(() => {
            if (reflexState !== 'waiting') return;
            reflexState = 'ready';
            box.className = 'reflex-box reflex-go';
            icon.className = 'fa-solid fa-bolt-lightning';
            title.innerText = 'CLIQUE AGORA!';
            desc.innerText = 'RÁPIDO!';
            reflexStartTime = performance.now();
        }, randomDelay);

    } else if (reflexState === 'waiting') {
        // Early click / False start penalty!
        clearTimeout(reflexTimeoutId);
        reflexState = 'early';
        box.className = 'reflex-box reflex-early';
        icon.className = 'fa-solid fa-triangle-exclamation';
        title.innerText = 'QUEIMOU A LARGADA!';
        desc.innerText = 'Você clicou antes do sinal verde! Penalidade de antecipação. Clique para reiniciar.';
        playAudioFx('buzz');

    } else if (reflexState === 'ready') {
        // Successful response!
        const latency = Math.round(performance.now() - reflexStartTime);
        reflexState = 'result';
        box.className = 'reflex-box reflex-result-state';
        icon.className = 'fa-solid fa-stopwatch-20';
        title.innerText = `${latency} ms`;

        // Pro Benchmark Evaluation
        let benchNote = "";
        if (latency <= 150) {
            benchNote = "GODLIKE! Nível Faker / Chovy (140ms) — Reflexo cirúrgico!";
            playAudioFx('fanfare');
        } else if (latency <= 180) {
            benchNote = "TIER PRO! Nível CBLOL / LCK Pro (Média Pro: 160ms)";
            playAudioFx('hit');
        } else if (latency <= 220) {
            benchNote = "ALTO NÍVEL! Nível Diamante / Mestre (Média: 200ms)";
            playAudioFx('hit');
        } else if (latency <= 270) {
            benchNote = "MÉDIA CASUAL! Gamer Ouro/Prata (Média Humana: 250ms)";
            playAudioFx('click');
        } else {
            benchNote = "REFLEXO REDUZIDO! (> 275ms) Sintoma de fadiga ou sono. Hora de alongar!";
            playAudioFx('click');
        }

        desc.innerHTML = `<strong>${benchNote}</strong><br><span style="font-size: 0.8rem; color: #9CA3AF;">Clique novamente para uma nova tentativa.</span>`;

        // Update personal best
        const bestSoFar = parseInt(localStorage.getItem('riot_bodyfit_best_reflex') || '9999', 10);
        if (latency < bestSoFar) {
            localStorage.setItem('riot_bodyfit_best_reflex', latency);
            const bestEl = document.getElementById('reflex-best-val');
            if (bestEl) bestEl.innerText = latency + ' ms';
        }

        // Add to history
        addReflexHistory(latency);
    }
}

function addReflexHistory(latency) {
    reflexHistory.unshift(latency);
    if (reflexHistory.length > 5) reflexHistory.pop();

    const historyContainer = document.getElementById('reflex-history-pills');
    if (historyContainer) {
        historyContainer.innerHTML = reflexHistory.map((val, idx) => `
            <span class="history-pill ${idx === 0 ? 'recent' : ''}">#${idx + 1}: <strong>${val}ms</strong></span>
        `).join('');
    }

    // Update Average
    const sum = reflexHistory.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / reflexHistory.length);
    const avgEl = document.getElementById('reflex-avg-val');
    if (avgEl) avgEl.innerText = avg + ' ms';
}


// ==========================================
// 4. ERGONOMICS & POSTURE GUIDE MODAL
// ==========================================

function openErgoModal() {
    const modal = document.getElementById('ergo-modal');
    if (modal) {
        modal.classList.add('active');
        playAudioFx('click');
    }
}

function closeErgoModal() {
    const modal = document.getElementById('ergo-modal');
    if (modal) {
        modal.classList.remove('active');
        playAudioFx('click');
    }
}

// Close modal on click outside content
window.addEventListener('click', (e) => {
    const modal = document.getElementById('ergo-modal');
    if (e.target === modal) {
        closeErgoModal();
    }
});

// Close modal on Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeErgoModal();
    }
});


// ==========================================
// 5. GAMER BREAK TIMER (ALONGAMENTO & ÁGUA)
// ==========================================

let breakTimeTotal = 45 * 60; // 45 minutes default
let breakTimeRemaining = 45 * 60;
let breakInterval = null;
let breakTimerRunning = false;

function toggleBreakTimer() {
    if (breakTimerRunning) {
        pauseBreakTimer();
    } else {
        startBreakTimer();
    }
}

function startBreakTimer() {
    breakTimerRunning = true;
    const btn = document.getElementById('btn-break-toggle');
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-pause"></i> Pausar`;
        btn.style.background = '#F59E0B';
    }

    playAudioFx('click');

    breakInterval = setInterval(() => {
        if (breakTimeRemaining > 0) {
            breakTimeRemaining--;
            updateBreakTimerDisplay();
        } else {
            notifyBreakTime();
        }
    }, 1000);
}

function pauseBreakTimer() {
    breakTimerRunning = false;
    clearInterval(breakInterval);
    const btn = document.getElementById('btn-break-toggle');
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-play"></i> Continuar`;
        btn.style.background = 'var(--neon-green)';
    }
}

function resetBreakTimer() {
    pauseBreakTimer();
    breakTimeRemaining = breakTimeTotal;
    updateBreakTimerDisplay();
    const btn = document.getElementById('btn-break-toggle');
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-play"></i> Iniciar Timer`;
        btn.style.background = 'var(--neon-green)';
    }
}

function setBreakDuration(minutes) {
    breakTimeTotal = minutes * 60;
    breakTimeRemaining = breakTimeTotal;
    updateBreakTimerDisplay();
}

function updateBreakTimerDisplay() {
    const m = Math.floor(breakTimeRemaining / 60);
    const s = breakTimeRemaining % 60;
    const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const displayEl = document.getElementById('break-timer-display');
    if (displayEl) {
        displayEl.innerText = formatted;
    }
}

function notifyBreakTime() {
    pauseBreakTimer();
    playAudioFx('fanfare');
    openErgoModal();
    alert("⚡ INTERVALO DE ALTA PERFORMANCE!\n\nPassaram-se 45 minutos de jogo.\nLevante-se, beba 250ml de água e realize a rotina rápida de alongamento de punhos para manter seus reflexos no pico!");
    resetBreakTimer();
}


// ==========================================
// 6. RIOT ESPORTS BIOMETRIC CERTIFICATE ENGINE
// ==========================================

function openCertificateModal(focusType) {
    const modal = document.getElementById('cert-modal');
    if (!modal) return;

    // Prefill APM and Reflex metrics
    const apmInput = document.getElementById('cert-apm-val');
    const reflexInput = document.getElementById('cert-reflex-val');
    const nameInput = document.getElementById('cert-player-name');

    if (apmInput && !apmInput.value) {
        const storedApm = localStorage.getItem('riot_bodyfit_best_apm');
        apmInput.value = storedApm || (apmClicks ? Math.round((apmClicks / (APM_TEST_DURATION - apmTimeRemaining || 1)) * 60) : 240);
    }

    if (reflexInput && !reflexInput.value) {
        const storedReflex = localStorage.getItem('riot_bodyfit_best_reflex');
        reflexInput.value = storedReflex || (reflexHistory.length ? reflexHistory[0] : 175);
    }

    if (nameInput && !nameInput.value) {
        const savedUser = localStorage.getItem('riot_last_username') || localStorage.getItem('riot_remembered_user');
        nameInput.value = savedUser ? savedUser : 'PRO_PLAYER#BR1';
    }

    modal.classList.add('active');
    playAudioFx('fanfare');
    renderCertificate();
}

function closeCertModal() {
    const modal = document.getElementById('cert-modal');
    if (modal) {
        modal.classList.remove('active');
        playAudioFx('click');
    }
}

function handleCertMetricChange() {
    renderCertificate();
}

function calculateCertRank(apm, reflex) {
    if (apm >= 280 && reflex <= 170) return { title: 'CHALLENGER', tier: 'PRO ELITE', color: '#F59E0B', badge: '👑' };
    if (apm >= 220 && reflex <= 200) return { title: 'GRANDMASTER', tier: 'TIER 1', color: '#EF4444', badge: '🔥' };
    if (apm >= 180 && reflex <= 230) return { title: 'DIAMOND', tier: 'TIER 2', color: '#38BDF8', badge: '💎' };
    if (apm >= 140 && reflex <= 270) return { title: 'PLATINUM', tier: 'TIER 3', color: '#10B981', badge: '⭐' };
    if (apm >= 100) return { title: 'GOLD', tier: 'CASUAL', color: '#EAB308', badge: '🥇' };
    return { title: 'SILVER', tier: 'INICIAR', color: '#94A3B8', badge: '🥈' };
}

function renderCertificate() {
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const nameInput = document.getElementById('cert-player-name');
    const apmInput = document.getElementById('cert-apm-val');
    const reflexInput = document.getElementById('cert-reflex-val');
    const rankSelect = document.getElementById('cert-rank-select');

    const playerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim().toUpperCase() : 'SUMMONER#0001';
    const apmVal = parseInt(apmInput && apmInput.value, 10) || 240;
    const reflexVal = parseInt(reflexInput && reflexInput.value, 10) || 175;
    const selectedRank = rankSelect ? rankSelect.value : 'auto';

    let rankInfo = calculateCertRank(apmVal, reflexVal);
    if (selectedRank !== 'auto') {
        const rankMap = {
            challenger: { title: 'CHALLENGER', tier: 'PRO ELITE', color: '#F59E0B', badge: '👑' },
            diamond: { title: 'DIAMOND', tier: 'TIER 2', color: '#38BDF8', badge: '💎' },
            gold: { title: 'GOLD', tier: 'CASUAL', color: '#EAB308', badge: '🥇' },
            silver: { title: 'SILVER', tier: 'INICIAR', color: '#94A3B8', badge: '🥈' },
            iron: { title: 'IRON', tier: 'NOVICE', color: '#64748B', badge: '🛡️' }
        };
        if (rankMap[selectedRank]) rankInfo = rankMap[selectedRank];
    }

    // 1. Deep Cyber Tech Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#06080F');
    bgGrad.addColorStop(0.5, '#0B132B');
    bgGrad.addColorStop(1, '#050811');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Tech Grid Pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // 3. Tech Border Frame & Corner Brackets
    const margin = 36;
    ctx.strokeStyle = 'rgba(200, 170, 109, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

    // Inner Neon Accent Border
    ctx.strokeStyle = rankInfo.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin + 8, margin + 8, w - (margin + 8) * 2, h - (margin + 8) * 2);

    // Tech Corner Accents
    const cornerSize = 28;
    ctx.fillStyle = rankInfo.color;
    // Top-Left
    ctx.fillRect(margin - 4, margin - 4, cornerSize, 6);
    ctx.fillRect(margin - 4, margin - 4, 6, cornerSize);
    // Top-Right
    ctx.fillRect(w - margin - cornerSize + 4, margin - 4, cornerSize, 6);
    ctx.fillRect(w - margin - 2, margin - 4, 6, cornerSize);
    // Bottom-Left
    ctx.fillRect(margin - 4, h - margin - 2, cornerSize, 6);
    ctx.fillRect(margin - 4, h - margin - cornerSize + 4, 6, cornerSize);
    // Bottom-Right
    ctx.fillRect(w - margin - cornerSize + 4, h - margin - 2, cornerSize, 6);
    ctx.fillRect(w - margin - 2, h - margin - cornerSize + 4, 6, cornerSize);

    // 4. Header Section
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C8AA6D';
    ctx.font = '700 16px "Lexend Deca", "Segoe UI", sans-serif';
    ctx.fillText('⚡ RIOT GAMES ESPORTS DIVISION • BIOMETRIC PROTOCOL ⚡', w / 2, 85);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 34px "Lexend Deca", "Segoe UI", sans-serif';
    ctx.fillText('CERTIFICADO OFICIAL DE PERFORMANCE', w / 2, 130);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '400 15px "Segoe UI", sans-serif';
    ctx.fillText('Documento biomecânico autenticado de reflexos e velocidade motora em ambiente competitivo', w / 2, 160);

    // Separator line
    const lineGrad = ctx.createLinearGradient(150, 0, w - 150, 0);
    lineGrad.addColorStop(0, 'rgba(200, 170, 109, 0)');
    lineGrad.addColorStop(0.5, rankInfo.color);
    lineGrad.addColorStop(1, 'rgba(200, 170, 109, 0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 185);
    ctx.lineTo(w - 150, 185);
    ctx.stroke();

    // 5. Athlete Name Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(200, 210, w - 400, 75);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(200, 210, w - 400, 75);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '600 12px "Segoe UI", sans-serif';
    ctx.fillText('ATLETA CREDENCIADO', w / 2, 232);

    ctx.fillStyle = '#00F5FF';
    ctx.font = '900 30px "Lexend Deca", monospace';
    ctx.fillText(playerName, w / 2, 268);

    // 6. Metrics Metric Cards
    const cardY = 320;
    const cardW = 320;
    const cardH = 150;

    // Left Card: APM
    const card1X = 140;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(card1X, cardY, cardW, cardH);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeRect(card1X, cardY, cardW, cardH);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AÇÕES POR MINUTO (APM)', card1X + cardW / 2, cardY + 32);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '900 48px "Lexend Deca", sans-serif';
    ctx.fillText(apmVal.toString(), card1X + cardW / 2, cardY + 92);

    ctx.fillStyle = '#10B981';
    ctx.font = '600 13px "Segoe UI", sans-serif';
    ctx.fillText('Alta Precisão Motora Validada', card1X + cardW / 2, cardY + 128);

    // Center Card: RANK TIER
    const card2X = w / 2 - 140;
    const card2W = 280;
    ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
    ctx.fillRect(card2X, cardY - 10, card2W, cardH + 20);
    ctx.strokeStyle = rankInfo.color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(card2X, cardY - 10, card2W, cardH + 20);

    ctx.fillStyle = '#C8AA6D';
    ctx.font = '700 14px "Segoe UI", sans-serif';
    ctx.fillText('CLASSIFICAÇÃO OFICIAL', w / 2, cardY + 26);

    ctx.fillStyle = rankInfo.color;
    ctx.font = '900 36px "Lexend Deca", sans-serif';
    ctx.fillText(`${rankInfo.badge} ${rankInfo.title}`, w / 2, cardY + 86);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 14px "Segoe UI", sans-serif';
    ctx.fillText(`TIER: ${rankInfo.tier}`, w / 2, cardY + 130);

    // Right Card: REFLEX LATENCY
    const card3X = w - 140 - cardW;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(card3X, cardY, cardW, cardH);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(card3X, cardY, cardW, cardH);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 14px "Segoe UI", sans-serif';
    ctx.fillText('LATÊNCIA DE REAÇÃO', card3X + cardW / 2, cardY + 32);

    ctx.fillStyle = '#10B981';
    ctx.font = '900 48px "Lexend Deca", sans-serif';
    ctx.fillText(`${reflexVal} ms`, card3X + cardW / 2, cardY + 92);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '600 13px "Segoe UI", sans-serif';
    ctx.fillText('Tempo de Resposta Neural', card3X + cardW / 2, cardY + 128);

    // 7. Footer & Security Watermark
    const issueDate = new Date().toLocaleDateString('pt-BR');
    const authHash = 'RGT-SEC-' + Math.abs((playerName + apmVal + reflexVal).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(16).toUpperCase().padStart(8, '0');

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = '600 12px "Courier New", monospace';
    ctx.fillText(`TOKEN DE AUTENTICAÇÃO: ${authHash}`, 60, h - 55);
    ctx.fillText(`DATA DE EMISSÃO: ${issueDate} • HOST: RIOT CLIENT PRODUCTION`, 60, h - 38);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#C8AA6D';
    ctx.font = '700 13px "Lexend Deca", sans-serif';
    ctx.fillText('RIOT PERFORMANCE LABS © 2026', w - 60, h - 55);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 11px "Segoe UI", sans-serif';
    ctx.fillText('Válido para campeonatos e scrims oficiais', w - 60, h - 38);
}

function downloadCertificate() {
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    renderCertificate();

    const nameInput = document.getElementById('cert-player-name');
    const nick = (nameInput && nameInput.value.trim()) ? nameInput.value.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Player';
    const link = document.createElement('a');
    link.download = `Certificado_Riot_${nick}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    playAudioFx('fanfare');
}

async function copyCertificateToClipboard() {
    const canvas = document.getElementById('cert-canvas');
    const btnText = document.getElementById('copy-btn-text');
    if (!canvas) return;

    renderCertificate();
    try {
        if (canvas.toBlob && window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                if (btnText) btnText.textContent = 'Copiado! ✓';
                playAudioFx('click');
                setTimeout(() => {
                    if (btnText) btnText.textContent = 'Copiar Imagem';
                }, 2500);
            });
        } else {
            await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
            if (btnText) btnText.textContent = 'Link Copiado! ✓';
            setTimeout(() => {
                if (btnText) btnText.textContent = 'Copiar Imagem';
            }, 2500);
        }
    } catch (err) {
        console.warn('Clipboard write failed:', err);
        if (btnText) btnText.textContent = 'Use Baixar .png';
        setTimeout(() => {
            if (btnText) btnText.textContent = 'Copiar Imagem';
        }, 2000);
    }
}


// ==========================================
// 7. INITIALIZATION ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initApmTrainer();
    initReflexTimer();
    updateBreakTimerDisplay();
});
