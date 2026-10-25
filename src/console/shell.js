import { on, emit } from '../core/event-bus.js';
import { initScreen, invalidatePalette, blitToDisplay } from './screen.js';
import { initControls } from './controls.js';
import { initThemeSwitcher } from './theme-switcher.js';
import { initExitDialog } from './exit-dialog.js';

export function initShell(store) {
  const app = document.getElementById('app');
  app.innerHTML = buildShellHTML();
  document.documentElement.setAttribute('data-theme', store.getTheme());
  document.documentElement.setAttribute('data-lcd-mode', store.getLcdMode());

  initScreen(store);
  initControls(store);
  initThemeSwitcher(store);
  initExitDialog();

  const lcdBtn = document.getElementById('pv-lcd-toggle');
  const modes = ['matrix', 'crisp', 'scanline'];
  const labels = {
    matrix: 'LCD: MATRIX',
    crisp: 'LCD: CRISP',
    scanline: 'LCD: CRT'
  };

  const updateLcdButton = (mode) => {
    if (lcdBtn) {
      const text = lcdBtn.querySelector('.pv-lcd-toggle-text');
      if (text) text.textContent = labels[mode] || 'LCD: MATRIX';
    }
  };

  updateLcdButton(store.getLcdMode());

  if (lcdBtn) {
    lcdBtn.addEventListener('click', () => {
      const cur = store.getLcdMode();
      const nextIdx = (modes.indexOf(cur) + 1) % modes.length;
      const nextMode = modes[nextIdx];
      store.setLcdMode(nextMode);
      document.documentElement.setAttribute('data-lcd-mode', nextMode);
      updateLcdButton(nextMode);
      emit('audio:play', 'cursor');
    });
  }

  on('theme:change', theme => {
    document.documentElement.setAttribute('data-theme', theme);
    invalidatePalette();
    blitToDisplay();
  });

  on('lcd:change', mode => {
    document.documentElement.setAttribute('data-lcd-mode', mode);
    updateLcdButton(mode);
  });
}

function buildShellHTML() {
  return `
    <div class="pv-scene">
      <div class="pv-console">
        <div class="pv-top-ridge">
          <span class="pv-ridge-line"></span>
          <span class="pv-ridge-line"></span>
          <span class="pv-ridge-line"></span>
        </div>

        <div class="pv-brand-row">
          <div class="pv-brand">PIXELVAULT</div>
          <div class="pv-brand-sub">8-BIT COLOR SYSTEM</div>
        </div>

        <div class="pv-screen-bezel">
          <div class="pv-bezel-header">
            <div class="pv-battery-group">
              <span class="pv-led"></span>
              <span class="pv-led-label">BATTERY</span>
            </div>
            <button class="pv-lcd-toggle" id="pv-lcd-toggle" type="button" aria-label="Toggle LCD mode">
              <span class="pv-lcd-dot"></span>
              <span class="pv-lcd-toggle-text">LCD: MATRIX</span>
            </button>
          </div>
          <div class="pv-screen-wrapper">
            <canvas id="pv-canvas" width="160" height="144"></canvas>
            <div class="pv-pixel-grid"></div>
            <div class="pv-screen-sheen"></div>
          </div>
        </div>

        <!-- Desktop Controls Quick Help -->
        <div class="pv-desktop-hint">
          <span>ARROWS / WASD: MOVE</span>
          <span>Z/K: [A]</span>
          <span>X/J: [B]</span>
          <span>ENTER: START</span>
        </div>

        <div class="pv-controls-section">
          <!-- D-Pad with center divot & directional relief -->
          <div class="pv-dpad">
            <button class="pv-btn-dpad pv-dpad-up" data-action="up" aria-label="Up">
              <span class="pv-arrow pv-arrow-up"></span>
            </button>
            <button class="pv-btn-dpad pv-dpad-left" data-action="left" aria-label="Left">
              <span class="pv-arrow pv-arrow-left"></span>
            </button>
            <div class="pv-dpad-center">
              <span class="pv-center-circle"></span>
            </div>
            <button class="pv-btn-dpad pv-dpad-right" data-action="right" aria-label="Right">
              <span class="pv-arrow pv-arrow-right"></span>
            </button>
            <button class="pv-btn-dpad pv-dpad-down" data-action="down" aria-label="Down">
              <span class="pv-arrow pv-arrow-down"></span>
            </button>
          </div>

          <!-- Slanted Action Buttons in recessed pill -->
          <div class="pv-action-pod">
            <div class="pv-action-pill">
              <div class="pv-action-slot">
                <button class="pv-btn-action" data-action="b" aria-label="B button">B</button>
                <span class="pv-action-label">B</span>
              </div>
              <div class="pv-action-slot">
                <button class="pv-btn-action" data-action="a" aria-label="A button">A</button>
                <span class="pv-action-label">A</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Angled Rubber Select / Start Buttons -->
        <div class="pv-sys-row">
          <div class="pv-sys-wrapper">
            <button class="pv-btn-sys" data-action="select" aria-label="Select"></button>
            <span class="pv-sys-label">SELECT</span>
          </div>
          <div class="pv-sys-wrapper">
            <button class="pv-btn-sys" data-action="start" aria-label="Start"></button>
            <span class="pv-sys-label">START</span>
          </div>
        </div>

        <!-- Authentic diagonal speaker grill -->
        <div class="pv-lower-deck">
          <div class="pv-theme-dock" id="pv-theme-dock"></div>
          <div class="pv-speaker-grill">
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>

        <div class="pv-phone-jack-hint">
          <span>PHONES</span>
        </div>
      </div>
    </div>
  `;
}
