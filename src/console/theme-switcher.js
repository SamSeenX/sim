import { emit } from '../core/event-bus.js';

const THEMES = [
  { id: 'ironside', label: 'Classic DMG (Grey / Olive)' },
  { id: 'phantom',  label: 'Phantom (Matte Black / Cyan)' },
  { id: 'ivory',    label: 'Berry (Ruby Red / Cream)' },
  { id: 'midnight', label: 'Midnight (Deep Navy / Backlit)' },
];

export function initThemeSwitcher(store) {
  const dock = document.getElementById('pv-theme-dock');
  if (!dock) return;

  dock.innerHTML = '';

  THEMES.forEach(theme => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pv-theme-btn';
    btn.dataset.themeId = theme.id;
    btn.title = theme.label;
    btn.setAttribute('aria-label', `Switch to ${theme.label} theme`);

    const pip = document.createElement('span');
    pip.className = 'pv-theme-pip';
    btn.appendChild(pip);

    btn.addEventListener('click', () => {
      store.setTheme(theme.id);
      updateActive(store.getTheme());
      emit('audio:play', 'cursor');
    });

    dock.appendChild(btn);
  });

  updateActive(store.getTheme());
}

function updateActive(activeId) {
  document.querySelectorAll('#pv-theme-dock .pv-theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeId === activeId);
  });
}
