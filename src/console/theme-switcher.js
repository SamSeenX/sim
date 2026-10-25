import { emit } from '../core/event-bus.js';

const THEMES = [
  { id: 'ironside', shell: '#d1d0c7', lcd: '#9bbc0f', label: 'Classic DMG (Olive)' },
  { id: 'phantom',  shell: '#222429', lcd: '#00dfc2', label: 'Phantom (Teal/Matte)' },
  { id: 'ivory',    shell: '#bf2642', lcd: '#e0dbcd', label: 'Berry (Warm Red)' },
  { id: 'midnight', shell: '#3d4e80', lcd: '#a4c2c2', label: 'Midnight (Navy/Cyan)' },
];

export function initThemeSwitcher(store) {
  const dock = document.getElementById('pv-theme-dock');
  if (!dock) return;

  THEMES.forEach(theme => {
    const btn = document.createElement('button');
    btn.title = theme.label;
    btn.setAttribute('aria-label', `Switch to ${theme.label} theme`);
    btn.style.cssText = `
      width: 20px; height: 20px; border-radius: 50%;
      background: linear-gradient(135deg, ${theme.shell} 50%, ${theme.lcd} 50%);
      border: 2px solid rgba(0, 0, 0, 0.4);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 1px 2px rgba(0, 0, 0, 0.3);
      cursor: pointer; transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
      flex-shrink: 0;
    `;
    btn.addEventListener('click', () => {
      store.setTheme(theme.id);
      updateActive(store.getTheme());
      emit('audio:play', 'cursor');
    });
    btn.dataset.themeId = theme.id;
    dock.appendChild(btn);
  });

  updateActive(store.getTheme());
}

function updateActive(activeId) {
  document.querySelectorAll('#pv-theme-dock button').forEach(btn => {
    const isActive = btn.dataset.themeId === activeId;
    btn.style.borderColor = isActive ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';
    btn.style.transform   = isActive ? 'scale(1.25)' : 'scale(1)';
    btn.style.boxShadow   = isActive
      ? '0 0 6px rgba(255, 255, 255, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
      : 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 1px 2px rgba(0, 0, 0, 0.3)';
  });
}
