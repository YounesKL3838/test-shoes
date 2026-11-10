import { store } from './state.js';

let toastTimer = null;

export function showToast(message) {
  const toastEl = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-message');
  if (!toastEl || !toastText) return;

  toastText.textContent = message;
  toastEl.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
  toastEl.classList.add('opacity-100', 'translate-y-0');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('opacity-100', 'translate-y-0');
    toastEl.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
  }, 2400);
}

export { store };
