/**
 * Riot Multi-Game Theme Switcher
 * Manages theme switching across Riot Games ecosystem (Riot, Valorant, LoL, TFT)
 * Persists user preference in localStorage.
 */

class ThemeSwitcher {
    constructor() {
        this.storageKey = 'riot_theme_preference';
        this.defaultTheme = 'riot';
        this.supportedThemes = ['riot', 'valorant', 'lol', 'tft'];
        
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem(this.storageKey) || this.defaultTheme;
        this.applyTheme(savedTheme);
        
        // Setup listener when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    applyTheme(themeName) {
        if (!this.supportedThemes.includes(themeName)) {
            themeName = this.defaultTheme;
        }

        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem(this.storageKey, themeName);

        // Dispatch custom event for components to listen if needed
        window.dispatchEvent(new CustomEvent('riotThemeChanged', { detail: { theme: themeName } }));
    }

    setupUI() {
        const selector = document.getElementById('theme-selector') || document.querySelector('[data-theme-selector]');
        if (selector) {
            if (selector.tagName === 'SELECT') {
                selector.value = document.documentElement.getAttribute('data-theme') || this.defaultTheme;
                selector.addEventListener('change', (e) => {
                    this.applyTheme(e.target.value);
                });
            } else {
                // If it's a container of buttons/icons
                const buttons = selector.querySelectorAll('[data-theme-value]');
                buttons.forEach(btn => {
                    const themeVal = btn.getAttribute('data-theme-value');
                    if (themeVal === document.documentElement.getAttribute('data-theme')) {
                        btn.classList.add('active');
                    }
                    btn.addEventListener('click', () => {
                        buttons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.applyTheme(themeVal);
                    });
                });
            }
        }
    }
}

// Export / Instantiate globally
window.riotThemeSwitcher = new ThemeSwitcher();
