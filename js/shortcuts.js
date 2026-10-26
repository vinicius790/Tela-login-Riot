/**
 * shortcuts.js - Keyboard Shortcuts & Fullscreen API for Riot Login
 * Provides client-like navigation and immersive mode:
 * - Alt + T: Cycle themes (Riot -> Valorant -> LoL -> TFT)
 * - Alt + L: Cycle languages (pt-BR -> en-US -> es-ES -> ja-JP -> ko-KR)
 * - Ctrl + M / Cmd + M: Toggle audio mute
 * - Esc: Close any open modal
 * - F11 / Button: Toggle true fullscreen
 */
(function() {
    'use strict';

    // HUD Toast Notification in Riot Client Style
    window.showRiotToast = function(message, type = 'info') {
        let toastContainer = document.getElementById('riot-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'riot-toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '24px';
            toastContainer.style.right = '24px';
            toastContainer.style.display = 'flex';
            toastContainer.style.flexDirection = 'column';
            toastContainer.style.gap = '10px';
            toastContainer.style.zIndex = '99999';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'riot-toast';
        toast.style.background = 'rgba(15, 15, 18, 0.95)';
        toast.style.backdropFilter = 'blur(10px)';
        toast.style.color = '#FFF';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '6px';
        toast.style.fontSize = '0.86rem';
        toast.style.fontWeight = '600';
        toast.style.letterSpacing = '0.5px';
        toast.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.6)';
        toast.style.borderLeft = type === 'success' ? '4px solid #10B981' :
                                type === 'error' ? '4px solid #EF4444' :
                                '4px solid var(--primary, #EB0029)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        toast.innerHTML = `<span style="font-size: 1.1em; opacity: 0.9;">${icon}</span> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3200);
    };

    // Fullscreen Toggle
    window.toggleFullscreen = function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            window.showRiotToast('Modo Tela Cheia Ativado', 'info');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
                window.showRiotToast('Modo Tela Cheia Desativado', 'info');
            }
        }
    };

    // Global Key Listener
    document.addEventListener('keydown', (e) => {
        // Esc to close all modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
        }

        // Alt + T: Cycle themes (Supports all 6 gaming themes)
        if (e.altKey && (e.key === 't' || e.key === 'T')) {
            e.preventDefault();
            if (window.riotThemeSwitcher && typeof window.riotThemeSwitcher.cycleTheme === 'function') {
                window.riotThemeSwitcher.cycleTheme();
            } else {
                const themes = ['riot', 'valorant', 'lol', 'tft', 'starguardian', 'kda'];
                const current = document.documentElement.getAttribute('data-theme') || 'riot';
                const next = themes[(themes.indexOf(current) + 1) % themes.length];
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('riot_theme_preference', next);
                localStorage.setItem('riot_theme', next);
                const selector = document.getElementById('themeSelector');
                if (selector) selector.value = next;
                if (window.riotAudio) window.riotAudio.play('whoosh');
                window.showRiotToast(`Tema alterado: ${next.toUpperCase()}`, 'info');
            }
        }

        // Alt + L: Cycle language
        if (e.altKey && (e.key === 'l' || e.key === 'L')) {
            e.preventDefault();
            if (window.i18n && typeof window.i18n.cycleLanguage === 'function') {
                window.i18n.cycleLanguage(true, true);
            } else {
                const langs = ['pt-BR', 'en-US', 'es-ES', 'ja-JP', 'ko-KR', 'de-DE'];
                const langSelector = document.getElementById('langSelector');
                const current = langSelector ? langSelector.value : 'pt-BR';
                const next = langs[(langs.indexOf(current) + 1) % langs.length];
                if (langSelector) {
                    langSelector.value = next;
                    langSelector.dispatchEvent(new Event('change'));
                }
            }
        }

        // Ctrl + M: Toggle Mute
        if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
            e.preventDefault();
            if (window.riotAudio) {
                window.riotAudio.toggleMute();
            } else {
                const muteBtn = document.getElementById('audioToggleBtn');
                if (muteBtn) muteBtn.click();
            }
        }

        // Alt + A: Toggle Ambient Cyber Drone
        if (e.altKey && (e.key === 'a' || e.key === 'A')) {
            e.preventDefault();
            if (window.riotAudio) {
                window.riotAudio.toggleAmbient();
            }
        }
    });
})();
