/**
 * pwa-engine.js - Progressive Web App Client Engine for Riot Client Suite
 * 
 * Features:
 *  1. Service Worker lifecycle management with automatic fallback
 *  2. Real-time online/offline network detection with Cyber HUD banners
 *  3. A2HS (Add to Home Screen) install prompt orchestration & deferred prompts
 *  4. Storage quota monitoring & offline cache diagnostics
 *  5. Background sync and client update notification
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RiotPWA = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class PWAEngine {
    constructor() {
      this.registration = null;
      this.deferredPrompt = null;
      this.isInstalled = false;
      this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      this.listeners = new Map();

      this._init();
    }

    _init() {
      if (typeof window === 'undefined') return;

      this._checkDisplayMode();
      this._bindNetworkEvents();
      this._bindInstallPrompt();
      this._registerServiceWorker();
    }

    _checkDisplayMode() {
      if (typeof window === 'undefined') return;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true;
      this.isInstalled = isStandalone;
    }

    _bindNetworkEvents() {
      if (typeof window === 'undefined') return;

      window.addEventListener('online', () => {
        this.isOnline = true;
        this._showNetworkStatus(true);
        this.emit('network-change', { online: true });
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this._showNetworkStatus(false);
        this.emit('network-change', { online: false });
      });
    }

    _showNetworkStatus(isOnline) {
      if (typeof document === 'undefined') return;
      const existing = document.getElementById('riot-network-indicator');
      if (existing) existing.remove();

      const banner = document.createElement('div');
      banner.id = 'riot-network-indicator';
      banner.setAttribute('role', 'status');
      banner.setAttribute('aria-live', 'polite');
      banner.style.position = 'fixed';
      banner.style.bottom = '20px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.padding = '10px 22px';
      banner.style.borderRadius = '4px';
      banner.style.fontFamily = "'FF Mark W05', 'Segoe UI', sans-serif";
      banner.style.fontSize = '12px';
      banner.style.fontWeight = '700';
      banner.style.letterSpacing = '1.5px';
      banner.style.textTransform = 'uppercase';
      banner.style.zIndex = '999999';
      banner.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)';
      banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      if (isOnline) {
        banner.style.background = '#0ac8b9';
        banner.style.color = '#001a18';
        banner.style.border = '1px solid #2cfce8';
        banner.innerHTML = '⚡ LINK RESTABELECIDO // PROTOCOLO ONLINE';
        setTimeout(() => {
          banner.style.opacity = '0';
          setTimeout(() => banner.remove(), 300);
        }, 3500);
      } else {
        banner.style.background = '#eb0029';
        banner.style.color = '#ffffff';
        banner.style.border = '1px solid #ff4655';
        banner.innerHTML = '⚠️ FALHA DE REDE // MODO OFFLINE ATIVADO (CACHE LOCAL)';
      }

      document.body.appendChild(banner);
    }

    _bindInstallPrompt() {
      if (typeof window === 'undefined') return;

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.emit('can-install', true);
        this._renderInstallButton();
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.isInstalled = true;
        this.emit('installed', true);
        const btn = document.getElementById('riot-pwa-install-btn');
        if (btn) btn.remove();
      });
    }

    _renderInstallButton() {
      if (typeof document === 'undefined') return;
      if (document.getElementById('riot-pwa-install-btn')) return;

      const container = document.querySelector('.header-actions') || document.body;
      const btn = document.createElement('button');
      btn.id = 'riot-pwa-install-btn';
      btn.type = 'button';
      btn.className = 'btn-pwa-install';
      btn.innerHTML = '📥 INSTALAR CLIENTE';
      btn.setAttribute('aria-label', 'Instalar aplicativo Riot Games na Área de Trabalho');
      btn.style.cssText = `
        padding: 6px 14px;
        background: rgba(235, 0, 41, 0.15);
        border: 1px solid #eb0029;
        color: #ff4655;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        margin-right: 8px;
      `;

      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#eb0029';
        btn.style.color = '#ffffff';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(235, 0, 41, 0.15)';
        btn.style.color = '#ff4655';
      });

      btn.addEventListener('click', () => this.promptInstall());

      if (container !== document.body) {
        container.prepend(btn);
      }
    }

    async promptInstall() {
      if (!this.deferredPrompt) {
        return { outcome: 'unavailable' };
      }
      this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return choice;
    }

    async _registerServiceWorker() {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return;
      }

      try {
        // Try root worker first, then fallback to local path
        const swPath = window.location.pathname.includes('/index/') ? '../sw.js' : './sw.js';
        this.registration = await navigator.serviceWorker.register(swPath, { scope: '../' }).catch(async () => {
          return await navigator.serviceWorker.register(swPath);
        });

        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.emit('update-available', true);
              }
            });
          }
        });
      } catch (err) {
        console.warn('[RiotPWA] Service Worker registration skipped or restricted:', err);
      }
    }

    async getStorageEstimate() {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        return {
          usage: est.usage || 0,
          quota: est.quota || 0,
          percentage: est.quota ? ((est.usage / est.quota) * 100).toFixed(2) : 0
        };
      }
      return { usage: 0, quota: 0, percentage: 0 };
    }

    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }

    emit(event, payload) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(fn => {
          try { fn(payload); } catch (e) { console.error(e); }
        });
      }
    }
  }

  const pwaInstance = new PWAEngine();
  return pwaInstance;
}));
