/**
 * Durateston.js - Riot Form Interaction & Validation Engineer Module
 * Backward compatible entry point loading js/auth.js and keeping original listeners if needed.
 */
// Load auth.js dynamically only if not already included in the document
if (!document.querySelector('script[src*="auth.js"]')) {
  const script = document.createElement('script');
  const inSubdir = window.location.pathname.includes('/index/') || window.location.pathname.endsWith('/trembolona.html') || window.location.pathname.endsWith('/index.html');
  script.src = inSubdir ? '../js/auth.js' : './js/auth.js';
  script.defer = true;
  document.head.appendChild(script);
}

// Fallback / legacy compatibility
const inputs = document.querySelectorAll('.input');
const button = document.querySelector('.login__button');

if (inputs.length > 0 && button) {
  const handleFocus = ({ target }) => {
    const span = target.closest('.login__label')?.querySelector('span') || target.previousElementSibling;
    if (span) span.classList.add('span-active');
  }

  const handleFocusOut = ({ target }) => {
    if (target.value === '') {
      const span = target.closest('.login__label')?.querySelector('span') || target.previousElementSibling;
      if (span) span.classList.remove('span-active');
    }
  }

  const handleChange = () => {
    const [username, password] = inputs;
    if (username && password && username.value && password.value.length >= 8) {
      button.removeAttribute('disabled');
    } else if (button) {
      button.setAttribute('disabled', '');
    }
  }

  inputs.forEach((input) => input.addEventListener('focus', handleFocus));
  inputs.forEach((input) => input.addEventListener('focusout', handleFocusOut));
  inputs.forEach((input) => input.addEventListener('input', handleChange));
}
