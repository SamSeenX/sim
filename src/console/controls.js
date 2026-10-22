import { emit } from '../core/event-bus.js';
import { pulse } from './haptics.js';

const KEY_MAP = {
  // Primary D-Pad (Arrows)
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowLeft:  'left',
  ArrowRight: 'right',

  // WASD D-Pad
  KeyW:       'up',
  KeyS:       'down',
  KeyA:       'left',
  KeyD:       'right',

  // A Button: Z, K, Space
  KeyZ:       'a',
  KeyK:       'a',
  Space:      'a',

  // B Button: X, J
  KeyX:       'b',
  KeyJ:       'b',

  // Start & Select
  Enter:      'start',
  ShiftLeft:  'select',
  ShiftRight: 'select',
};

const held = new Set();

export function initControls() {
  window.addEventListener('keydown', e => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
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

  // Touch and pointer interactions
  document.querySelectorAll('[data-action]').forEach(btn => {
    const action = btn.dataset.action;

    const handleStart = ev => {
      ev.preventDefault();
      pulse(20);
      emit('input:down', action);
    };

    const handleEnd = ev => {
      ev.preventDefault();
      emit('input:up', action);
    };

    btn.addEventListener('touchstart', handleStart, { passive: false });
    btn.addEventListener('touchend', handleEnd, { passive: false });
    btn.addEventListener('touchcancel', handleEnd, { passive: false });

    btn.addEventListener('mousedown', () => emit('input:down', action));
    btn.addEventListener('mouseup',   () => emit('input:up',   action));
    btn.addEventListener('mouseleave',() => emit('input:up',   action));
  });
}

export function isHeld(action) { return held.has(action); }
