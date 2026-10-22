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
    if (action === 'up') {
      this.cursor = (this.cursor - 1 + GAMES.length) % GAMES.length;
      emit('audio:play', 'cursor');
    }
    if (action === 'down') {
      this.cursor = (this.cursor + 1) % GAMES.length;
      emit('audio:play', 'cursor');
    }
    if (action === 'a' || action === 'start') {
      emit('audio:play', 'select');
      const g = GAMES[this.cursor].toLowerCase().replace(' ', '-');
      loadGame(g, this.store);
    }
  }

  tick(dt) { this.blink += dt; }

  render() {
    const W = getLogicalW(), H = getLogicalH();

    clearScreen();

    // Authentic retro banner
    drawRect(10, 10, W - 20, 22, 3);
    drawRect(12, 12, W - 24, 18, 0);
    drawText('PIXELVAULT', 32, 17, 3);

    // Game menu items
    GAMES.forEach((name, i) => {
      const y = 48 + i * 20;
      const selected = i === this.cursor;
      if (selected) {
        drawRect(16, y - 2, W - 32, 13, 2);
        drawRect(18, y, W - 36, 9, 0);
        if (Math.floor(this.blink * 3) % 2 === 0) {
          drawText('>', 22, y + 1, 3);
        }
        drawText(name, 32, y + 1, 3);
      } else {
        drawText(name, 32, y + 1, 2);
      }
    });

    drawRect(10, H - 22, W - 20, 1, 2);
    drawText('A:PLAY  ARROWS:NAV', 18, H - 14, 3);
  }
}
