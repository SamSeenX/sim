import { emit } from '../core/event-bus.js';
import { setInputFilter } from './controls.js';
import { captureVRAM, restoreVRAM, drawRect, drawText, blitToDisplay } from './screen.js';

const BOX_X = 18;
const BOX_Y = 38;
const BOX_W = 124;
const BOX_H = 68;

let savedVram = null;
let isOpen = false;
let activeChoice = 'no';
let onConfirmCb = null;
let onCancelCb = null;

export function initExitDialog() {
  const canvas = document.getElementById('pv-canvas');
  if (!canvas) return;

  canvas.addEventListener('click', e => {
    if (!isOpen) return;
    const rect = canvas.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    if (relX < 0.5) {
      handleChoice('no');
    } else {
      handleChoice('yes');
    }
  });
}

export function showExitDialog({ onConfirm, onCancel }) {
  if (isOpen) return;
  isOpen = true;
  onConfirmCb = onConfirm;
  onCancelCb = onCancel;
  activeChoice = 'no';
  savedVram = captureVRAM();

  renderDialog();
  emit('audio:play', 'cursor');
  setInputFilter(handleFilterInput);
}

export function hideExitDialog() {
  if (!isOpen) return;
  isOpen = false;
  setInputFilter(null);
  restoreVRAM(savedVram);
  savedVram = null;
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
    renderDialog();
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

function renderDialog() {
  if (!savedVram) return;
  restoreVRAM(savedVram);

  // Drop shadow
  drawRect(BOX_X + 2, BOX_Y + 2, BOX_W, BOX_H, 3);
  // Outer border
  drawRect(BOX_X, BOX_Y, BOX_W, BOX_H, 3);
  // Substrate fill
  drawRect(BOX_X + 2, BOX_Y + 2, BOX_W - 4, BOX_H - 4, 0);
  // Inner hairline frame
  drawRect(BOX_X + 4, BOX_Y + 4, BOX_W - 8, 1, 3);
  drawRect(BOX_X + 4, BOX_Y + BOX_H - 5, BOX_W - 8, 1, 3);
  drawRect(BOX_X + 4, BOX_Y + 4, 1, BOX_H - 8, 3);
  drawRect(BOX_X + BOX_W - 5, BOX_Y + 4, 1, BOX_H - 8, 3);

  // Header & Subtext
  drawText('EXIT GAME?', BOX_X + 34, BOX_Y + 11, 3);
  drawText('PROGRESS LOST', BOX_X + 23, BOX_Y + 23, 2);

  // Interactive Buttons
  if (activeChoice === 'no') {
    drawRect(BOX_X + 16, BOX_Y + 36, 42, 12, 3);
    drawText('> NO <', BOX_X + 20, BOX_Y + 39, 0);
  } else {
    drawRect(BOX_X + 16, BOX_Y + 36, 42, 12, 1);
    drawText('  NO  ', BOX_X + 20, BOX_Y + 39, 3);
  }

  if (activeChoice === 'yes') {
    drawRect(BOX_X + 66, BOX_Y + 36, 42, 12, 3);
    drawText('> YES <', BOX_X + 68, BOX_Y + 39, 0);
  } else {
    drawRect(BOX_X + 66, BOX_Y + 36, 42, 12, 1);
    drawText('  YES ', BOX_X + 68, BOX_Y + 39, 3);
  }

  // Footer instructions
  drawText('A:OK  B:CANCEL', BOX_X + 22, BOX_Y + 54, 2);

  blitToDisplay();
}
