const THEMES = [
  { id: 'ironside', color: '#f0a500', label: 'Ironside' },
  { id: 'phantom',  color: '#00e5cc', label: 'Phantom'  },
  { id: 'ivory',    color: '#c0152a', label: 'Ivory'    },
  { id: 'midnight', color: '#ffe600', label: 'Midnight' },
];

export function initThemeSwitcher(store) {
  const dock = document.getElementById('pv-theme-dock');
  if (!dock) return;

  THEMES.forEach(theme => {
    const btn = document.createElement('button');
    btn.title = theme.label;
    btn.setAttribute('aria-label', `Switch to ${theme.label} theme`);
    btn.style.cssText = `
      width: 18px; height: 18px; border-radius: 50%;
      background: ${theme.color}; border: 2px solid transparent;
      cursor: pointer; transition: border-color 0.15s, transform 0.1s;
      flex-shrink: 0;
    `;
    btn.addEventListener('click', () => {
      store.setTheme(theme.id);
      updateActive(store.getTheme());
    });
    btn.dataset.themeId = theme.id;
    dock.appendChild(btn);
  });

  updateActive(store.getTheme());
}

function updateActive(activeId) {
  document.querySelectorAll('#pv-theme-dock button').forEach(btn => {
    const isActive = btn.dataset.themeId === activeId;
    btn.style.borderColor = isActive ? '#fff' : 'transparent';
    btn.style.transform   = isActive ? 'scale(1.2)' : 'scale(1)';
  });
}
