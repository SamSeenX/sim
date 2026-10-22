import { on } from '../core/event-bus.js';
import { initScreen } from './screen.js';
import { initControls } from './controls.js';
import { initThemeSwitcher } from './theme-switcher.js';

export function initShell(store) {
  const app = document.getElementById('app');
  app.innerHTML = buildShellHTML();
  document.documentElement.setAttribute('data-theme', store.getTheme());

  initScreen(store);
  initControls(store);
  initThemeSwitcher(store);

  on('theme:change', theme => {
    document.documentElement.setAttribute('data-theme', theme);
  });
}

function buildShellHTML() {
  return `
    <div class="pv-scene">
      <div class="pv-console">
        <div class="pv-brand">PixelVault</div>
        <div class="pv-screen-bezel">
          <div class="pv-screen-wrapper">
            <canvas id="pv-canvas" width="160" height="144"></canvas>
            <div class="pv-scanlines"></div>
          </div>
        </div>
        <div class="pv-controls-row">
          <div class="pv-dpad">
            <button class="pv-btn-dpad pv-dpad-up"   data-action="up"></button>
            <button class="pv-btn-dpad pv-dpad-left"  data-action="left"></button>
            <button class="pv-btn-dpad pv-dpad-center"></button>
            <button class="pv-btn-dpad pv-dpad-right" data-action="right"></button>
            <button class="pv-btn-dpad pv-dpad-down"  data-action="down"></button>
          </div>
          <div class="pv-sys-btns">
            <button class="pv-btn-sys" data-action="select">SEL</button>
            <button class="pv-btn-sys" data-action="start">STR</button>
          </div>
          <div class="pv-action-btns">
            <button class="pv-btn-action" data-action="b">B</button>
            <button class="pv-btn-action" data-action="a">A</button>
          </div>
        </div>
        <div class="pv-grille">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>
        <div class="pv-theme-dock" id="pv-theme-dock"></div>
      </div>
    </div>
  `;
}
