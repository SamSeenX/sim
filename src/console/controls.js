import { emit } from '../core/event-bus.js';
import { pulse } from './haptics.js';

const KEY_MAP = {
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowLeft:  'left',
  ArrowRight: 'right',
  KeyW:       'up',
  KeyS:       'down',
  KeyA:       'left',
  KeyD:       'right',
  KeyZ:       'a',
  KeyK:       'a',
  Space:      'a',
  KeyX:       'b',
  KeyJ:       'b',
  Enter:      'start',
  ShiftLeft:  'select',
  ShiftRight: 'select',
};

const held = new Set();
let inputFilter = null;

export function setInputFilter(fn) {
  inputFilter = fn;
}

export function isHeld(action) {
  return held.has(action);
}

function triggerDown(action) {
  if (!action || held.has(action)) return;
  held.add(action);
  pulse(16);
  if (inputFilter && inputFilter(action)) return;
  emit('input:down', action);
}

function triggerUp(action) {
  if (!action || !held.has(action)) return;
  held.delete(action);
  emit('input:up', action);
}

export function initControls() {
  window.addEventListener('keydown', e => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    triggerDown(action);
  });

  window.addEventListener('keyup', e => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    triggerUp(action);
  });

  const dpad = document.querySelector('.pv-dpad');
  if (dpad) {
    let currentDpadAction = null;

    const getActionUnderTouch = (touch) => {
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const btn = el ? el.closest('.pv-btn-dpad') : null;
      return btn ? btn.dataset.action : null;
    };

    const handleDpadTouch = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const targetAction = getActionUnderTouch(touch);
      if (targetAction !== currentDpadAction) {
        if (currentDpadAction) {
          highlightDpadBtn(currentDpadAction, false);
          triggerUp(currentDpadAction);
        }
        if (targetAction) {
          highlightDpadBtn(targetAction, true);
          triggerDown(targetAction);
        }
        currentDpadAction = targetAction;
      }
    };

    const handleDpadEnd = (e) => {
      e.preventDefault();
      if (currentDpadAction) {
        highlightDpadBtn(currentDpadAction, false);
        triggerUp(currentDpadAction);
        currentDpadAction = null;
      }
    };

    dpad.addEventListener('touchstart', handleDpadTouch, { passive: false });
    dpad.addEventListener('touchmove',  handleDpadTouch, { passive: false });
    dpad.addEventListener('touchend',   handleDpadEnd,   { passive: false });
    dpad.addEventListener('touchcancel',handleDpadEnd,   { passive: false });
  }

  document.querySelectorAll('[data-action]:not(.pv-btn-dpad)').forEach(btn => {
    const action = btn.dataset.action;
    const onStart = ev => {
      ev.preventDefault();
      btn.classList.add('active');
      triggerDown(action);
    };
    const onEnd = ev => {
      ev.preventDefault();
      btn.classList.remove('active');
      triggerUp(action);
    };

    btn.addEventListener('touchstart', onStart, { passive: false });
    btn.addEventListener('touchend', onEnd, { passive: false });
    btn.addEventListener('touchcancel', onEnd, { passive: false });
    btn.addEventListener('mousedown', onStart);
    btn.addEventListener('mouseup', onEnd);
    btn.addEventListener('mouseleave', onEnd);
  });

  document.querySelectorAll('.pv-btn-dpad').forEach(btn => {
    const action = btn.dataset.action;
    btn.addEventListener('mousedown', () => {
      highlightDpadBtn(action, true);
      triggerDown(action);
    });
    btn.addEventListener('mouseup', () => {
      highlightDpadBtn(action, false);
      triggerUp(action);
    });
    btn.addEventListener('mouseleave', () => {
      highlightDpadBtn(action, false);
      triggerUp(action);
    });
  });
}

function highlightDpadBtn(action, active) {
  const btn = document.querySelector(`.pv-btn-dpad[data-action="${action}"]`);
  if (btn) btn.classList.toggle('active', active);
}
