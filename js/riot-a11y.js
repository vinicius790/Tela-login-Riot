/**
 * ==========================================================================
 * riot-a11y.js — Riot Games Accessibility & Screen Reader Engine
 * Standards: WCAG 2.2 AAA & WAI-ARIA 1.2
 * ==========================================================================
 */
(function() {
  'use strict';

  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  // ========================================================================
  // 1. LIVE REGION ANNOUNCER (WCAG 4.1.3 Status Messages)
  // ========================================================================
  class RiotA11yAnnouncer {
    constructor() {
      this.politeRegion = null;
      this.assertiveRegion = null;
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;
      if (document.getElementById('riot-a11y-polite')) {
        this.politeRegion = document.getElementById('riot-a11y-polite');
        this.assertiveRegion = document.getElementById('riot-a11y-assertive');
        return;
      }

      const container = document.createElement('div');
      container.id = 'riot-a11y-live-container';
      container.className = 'sr-only';

      this.politeRegion = document.createElement('div');
      this.politeRegion.id = 'riot-a11y-polite';
      this.politeRegion.setAttribute('role', 'status');
      this.politeRegion.setAttribute('aria-live', 'polite');
      this.politeRegion.setAttribute('aria-atomic', 'true');

      this.assertiveRegion = document.createElement('div');
      this.assertiveRegion.id = 'riot-a11y-assertive';
      this.assertiveRegion.setAttribute('role', 'alert');
      this.assertiveRegion.setAttribute('aria-live', 'assertive');
      this.assertiveRegion.setAttribute('aria-atomic', 'true');

      container.appendChild(this.politeRegion);
      container.appendChild(this.assertiveRegion);
      document.body.appendChild(container);
    }

    announce(message, priority = 'polite') {
      const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
      if (!region) return;
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 50);
    }
  }

  // ========================================================================
  // 2. UNIVERSAL MODAL FOCUS TRAP (WCAG 2.1.2 & 2.4.3)
  // ========================================================================
  class RiotFocusTrapManager {
    constructor() {
      this.activeTrap = null;
      this.previousActiveElement = null;
      this.boundKeyHandler = this.handleKeyDown.bind(this);
    }

    trap(modalElement, initialFocusSelector = null, triggerElement = null) {
      if (!modalElement || typeof document === 'undefined') return;

      this.previousActiveElement = triggerElement || document.activeElement;
      this.activeTrap = modalElement;

      if (!modalElement.hasAttribute('role')) modalElement.setAttribute('role', 'dialog');
      modalElement.setAttribute('aria-modal', 'true');

      this.setSiblingsInert(modalElement, true);

      const focusables = this.getFocusables(modalElement);
      let targetToFocus = focusables[0];

      if (initialFocusSelector) {
        const customTarget = modalElement.querySelector(initialFocusSelector);
        if (customTarget) targetToFocus = customTarget;
      }

      if (targetToFocus) {
        setTimeout(() => targetToFocus.focus(), 60);
      }

      document.addEventListener('keydown', this.boundKeyHandler);
    }

    release() {
      if (!this.activeTrap || typeof document === 'undefined') return;

      this.setSiblingsInert(this.activeTrap, false);
      document.removeEventListener('keydown', this.boundKeyHandler);

      const toRestore = this.previousActiveElement;
      this.activeTrap = null;
      this.previousActiveElement = null;

      if (toRestore && typeof toRestore.focus === 'function') {
        setTimeout(() => toRestore.focus(), 50);
      }
    }

    getFocusables(container) {
      if (!container || typeof container.querySelectorAll !== 'function') return [];
      return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => {
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
      });
    }

    handleKeyDown(e) {
      if (!this.activeTrap) return;

      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        const closeBtn = this.activeTrap.querySelector('.modal-close-btn, .riot-modal-close, [data-modal-close]');
        if (closeBtn) {
          closeBtn.click();
        } else {
          this.activeTrap.classList.remove('active');
          this.release();
        }
        return;
      }

      if (e.key === 'Tab' || e.keyCode === 9) {
        const focusables = this.getFocusables(this.activeTrap);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !this.activeTrap.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !this.activeTrap.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    setSiblingsInert(modalElement, isInert) {
      if (typeof document === 'undefined') return;
      const topSiblings = Array.from(document.body.children);
      topSiblings.forEach(el => {
        if (el === modalElement || el.contains(modalElement) || el.id === 'riot-a11y-live-container') return;
        if (isInert) {
          el.setAttribute('aria-hidden', 'true');
          el.setAttribute('inert', '');
        } else {
          el.removeAttribute('aria-hidden');
          el.removeAttribute('inert');
        }
      });
    }
  }

  const a11yEngine = {
    announcer: null,
    focusTrap: new RiotFocusTrapManager(),
    announce(msg, prio = 'polite') {
      if (!this.announcer) this.announcer = new RiotA11yAnnouncer();
      this.announcer.announce(msg, prio);
    }
  };

  if (typeof window !== 'undefined') {
    window.RiotA11y = a11yEngine;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RiotA11y: a11yEngine, RiotFocusTrapManager, RiotA11yAnnouncer };
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      window.RiotA11y.announcer = new RiotA11yAnnouncer();

      const modalObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.classList.contains('modal-overlay') || target.classList.contains('riot-modal-overlay')) {
              if (target.classList.contains('active')) {
                window.RiotA11y.focusTrap.trap(target);
                const heading = target.querySelector('h1, h2, h3, [id*="Title"]');
                if (heading) {
                  window.RiotA11y.announce(`Janela modal aberta: ${heading.textContent.trim()}`);
                }
              } else {
                window.RiotA11y.focusTrap.release();
              }
            }
          }
        });
      });

      document.querySelectorAll('.modal-overlay, .riot-modal-overlay').forEach(modal => {
        modalObserver.observe(modal, { attributes: true });
      });

      const apmArena = document.getElementById('apm-arena');
      if (apmArena) {
        apmArena.setAttribute('role', 'button');
        apmArena.setAttribute('tabindex', '0');
        apmArena.setAttribute('aria-label', 'Arena de Treinamento APM. Pressione Espaço ou Enter para registrar cliques.');
        apmArena.addEventListener('keydown', e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            apmArena.click();
          }
        });
      }

      const reflexBox = document.getElementById('reflex-box');
      if (reflexBox) {
        reflexBox.setAttribute('role', 'button');
        reflexBox.setAttribute('tabindex', '0');
        reflexBox.setAttribute('aria-label', 'Sensor de Latência Motora e Reflexo Visual. Pressione Espaço ou Enter para acionar.');
        reflexBox.addEventListener('keydown', e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            reflexBox.click();
          }
        });
      }
    });
  }
})();
