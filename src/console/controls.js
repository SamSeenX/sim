import { emit } from '../core/event-bus.js';
import { pulse } from './haptics.js';

const KEY_MAP = {
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowLeft:  'left',
  ArrowRight: 'right',
  KeyZ:       'a',
  KeyX:       'b',
  Enter:      'start',
  ShiftLeft:  'select',
  ShiftRight: 'select',
};

const held = new Set();

export function initControls() {
  window.addEventListener('keydown', e => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    e.preventDefault();
    if (held.has(action)) return;
    held.add(action);
    emit('input:down', action);
  });

  window.addEventListener('keyup', e => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    held.delete(action);
    emit('input:up', action);
  });

  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      const action = btn.dataset.action;
      pulse(25);
      emit('input:down', action);
    }, { passive: false });

    btn.addEventListener('touchend', e => {
      e.preventDefault();
      emit('input:up', btn.dataset.action);
    }, { passive: false });

    btn.addEventListener('mousedown', () => emit('input:down', btn.dataset.action));
    btn.addEventListener('mouseup',   () => emit('input:up',   btn.dataset.action));
  });
}

export function isHeld(action) { return held.has(action); }
