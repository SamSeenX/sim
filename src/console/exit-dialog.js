import { emit } from '../core/event-bus.js';
import { setInputFilter } from './controls.js';

let modalEl = null;
let noBtn = null;
let yesBtn = null;
let activeChoice = 'no';
let onConfirmCb = null;
let onCancelCb = null;
let isOpen = false;

export function initExitDialog() {
  modalEl = document.getElementById('pv-exit-modal');
  if (!modalEl) return;

  noBtn = modalEl.querySelector('[data-choice="no"]');
  yesBtn = modalEl.querySelector('[data-choice="yes"]');

  if (noBtn) {
    noBtn.addEventListener('click', () => handleChoice('no'));
  }
  if (yesBtn) {
    yesBtn.addEventListener('click', () => handleChoice('yes'));
  }
}

export function showExitDialog({ onConfirm, onCancel }) {
  if (isOpen || !modalEl) return;
  isOpen = true;
  onConfirmCb = onConfirm;
  onCancelCb = onCancel;
  activeChoice = 'no';
  updateUI();

  modalEl.removeAttribute('hidden');
  emit('audio:play', 'cursor');

  setInputFilter(handleFilterInput);
}

export function hideExitDialog() {
  if (!isOpen || !modalEl) return;
  isOpen = false;
  modalEl.setAttribute('hidden', '');
  setInputFilter(null);
  onConfirmCb = null;
  onCancelCb = null;
}

export function isExitDialogOpen() {
  return isOpen;
}

function handleFilterInput(action) {
  if (!isOpen) return false;

  if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
    activeChoice = activeChoice === 'no' ? 'yes' : 'no';
    updateUI();
    emit('audio:play', 'cursor');
    return true;
  }

  if (action === 'a' || action === 'start') {
    handleChoice(activeChoice);
    return true;
  }

  if (action === 'b') {
    handleChoice('no');
    return true;
  }

  return true;
}

function handleChoice(choice) {
  emit('audio:play', 'select');
  const confirm = choice === 'yes';
  const cb = confirm ? onConfirmCb : onCancelCb;
  hideExitDialog();
  if (cb) cb();
}

function updateUI() {
  if (noBtn) noBtn.classList.toggle('active', activeChoice === 'no');
  if (yesBtn) yesBtn.classList.toggle('active', activeChoice === 'yes');
}
