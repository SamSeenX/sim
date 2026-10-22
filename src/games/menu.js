import { GameBase } from './game-base.js';
import { clearScreen, drawText, drawRect, getLogicalW, getLogicalH } from '../console/screen.js';
import { on, off, emit } from '../core/event-bus.js';
import { loadGame } from '../main.js';

const GAMES = ['BOUNCER', 'BLOCKFALL', 'ROOFTOP CAT', 'SNAKE', 'DEFENDER', 'PIXEL DRIFT'];

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
    if (action === 'down' || action === 'select') {
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
    drawRect(10, 6, W - 20, 18, 3);
    drawRect(12, 8, W - 24, 14, 0);
    drawText('PIXELVAULT', 32, 13, 3);

    // Game menu items
    GAMES.forEach((name, i) => {
      const y = 30 + i * 14;
      const selected = i === this.cursor;
      const key = name.toLowerCase().replace(' ', '-');
      const hi = this.store.getScore(key) || 0;

      if (selected) {
        drawRect(14, y - 2, W - 28, 12, 2);
        drawRect(16, y, W - 32, 8, 0);
        if (Math.floor(this.blink * 3) % 2 === 0) {
          drawText('>', 18, y + 1, 3);
        }
        drawText(name, 25, y + 1, 3);
        drawText(`HI:${hi}`, 104, y + 1, 3);
      } else {
        drawText(name, 25, y + 1, 2);
        drawText(`HI:${hi}`, 104, y + 1, 1);
      }
    });

    drawRect(10, H - 18, W - 20, 1, 2);
    drawText('A:PLAY  ARROWS:NAV', 18, H - 11, 3);
  }
}
