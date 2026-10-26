/**
 * auth.js - Riot Form Interaction & Validation Engineer Module
 * Features:
 * - Floating labels control
 * - Real-time validation (username + password >= 8 chars)
 * - Caps Lock detection and tooltip warning
 * - Password visibility toggle (eye icon)
 * - Sound effect / modular hook support
 */

document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.input');
  const button = document.querySelector('.login__button');
  const passwordInput = document.querySelector('input[name="password"]');

  // 1. Floating Labels
  const handleFocus = ({ target }) => {
    const span = target.previousElementSibling;
    if (span && span.tagName === 'SPAN') {
      span.classList.add('span-active');
    }
  };

  const handleFocusOut = ({ target }) => {
    if (target.value === '') {
      const span = target.previousElementSibling;
      if (span && span.tagName === 'SPAN') {
        span.classList.remove('span-active');
      }
    }
  };

  inputs.forEach((input) => {
    input.addEventListener('focus', handleFocus);
    input.addEventListener('focusout', handleFocusOut);
  });

  // 2. Real-time Validation
  const handleChange = () => {
    const username = document.querySelector('input[name="username"]');
    const password = document.querySelector('input[name="password"]');

    if (username && password) {
      if (username.value.trim() !== '' && password.value.length >= 8) {
        if (button) button.removeAttribute('disabled');
      } else {
        if (button) button.setAttribute('disabled', '');
      }
    }
  };

  inputs.forEach((input) => {
    input.addEventListener('input', handleChange);
    input.addEventListener('keyup', handleChange);
  });

  // 3. Caps Lock Detection & Tooltip
  if (passwordInput) {
    let tooltip = document.querySelector('.caps-lock-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'caps-lock-tooltip';
      tooltip.innerText = '⚠️ Caps Lock ativado';
      tooltip.style.cssText = 'position:absolute; background:#ff4655; color:#fff; font-size:11px; padding:2px 6px; border-radius:3px; display:none; margin-top:4px; z-index:10;';
      passwordInput.parentNode.style.position = 'relative';
      passwordInput.parentNode.appendChild(tooltip);
    }

    passwordInput.addEventListener('keydown', (e) => {
      const capsLockOn = e.getModifierState && e.getModifierState('CapsLock');
      tooltip.style.display = capsLockOn ? 'block' : 'none';
    });

    passwordInput.addEventListener('blur', () => {
      tooltip.style.display = 'none';
    });
  }

  // 4. Password Visibility Toggle (Eye Toggle)
  if (passwordInput) {
    const parentLabel = passwordInput.parentElement;
    if (parentLabel) {
      parentLabel.style.position = 'relative';
      let toggleBtn = parentLabel.querySelector('.password-toggle');
      if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.style.cssText = 'position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; opacity:0.7;';
        parentLabel.appendChild(toggleBtn);
      }

      toggleBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleBtn.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
      });
    }
  }

  // 5. Sound effect / complementary modules hook
  if (button) {
    button.addEventListener('click', () => {
      if (window.riotAudio) {
        window.riotAudio.play('lockin');
      }
    });
  }
});
