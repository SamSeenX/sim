import { GameBase } from './game-base.js';
import { clearScreen, drawText, drawRect, getLogicalW, getLogicalH } from '../console/screen.js';
import { on, off } from '../core/event-bus.js';
import { loadGame } from '../main.js';

const GAMES = ['BOUNCER', 'BLOCKFALL', 'ROOFTOP CAT'];

export class MenuGame extends GameBase {
  constructor(store) {
    super(store);
    this.cursor = 0;
    this.blink  = 0;
    this._onInput = this._onInput.bind(this);
  }

  init() { on('input:down', this._onInput); }
  destroy() { off('input:down', this._onInput); super.destroy(); }

  _onInput(action) {
    if (action === 'up')    this.cursor = (this.cursor - 1 + GAMES.length) % GAMES.length;
    if (action === 'down')  this.cursor = (this.cursor + 1) % GAMES.length;
    if (action === 'a' || action === 'start') {
      const g = GAMES[this.cursor].toLowerCase().replace(' ', '-');
      loadGame(g, this.store);
    }
  }

  tick(dt) { this.blink += dt; }

  render() {
    const style = getComputedStyle(document.documentElement);
    const px  = style.getPropertyValue('--screen-px').trim()  || '#8bac0f';
    const W = getLogicalW(), H = getLogicalH();

    clearScreen();

    drawText('PIXELVAULT', 32, 16, px);
    drawRect(12, 28, W - 24, 1, px);

    GAMES.forEach((name, i) => {
      const y = 46 + i * 22;
      const selected = i === this.cursor;
      if (selected) {
        drawRect(10, y - 3, W - 20, 15, px + '26');
        if (Math.floor(this.blink * 3) % 2 === 0) {
          drawText('>', 14, y + 1, px);
        }
      }
      drawText(name, 26, y + 1, px);
    });

    drawText('A:PLAY  ARROWS:NAV', 14, H - 16, px);
  }
}
