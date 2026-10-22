import { GameBase } from './game-base.js';
import { clearScreen, drawText, drawRect, getLogicalW, getLogicalH } from '../console/screen.js';
import { on, off, emit } from '../core/event-bus.js';
import { loadGame } from '../main.js';

const GAMES = ['BOUNCER', 'BLOCKFALL', 'ROOFTOP CAT', 'SNAKE', 'DEFENDER'];

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
    drawRect(10, 8, W - 20, 20, 3);
    drawRect(12, 10, W - 24, 16, 0);
    drawText('PIXELVAULT', 32, 15, 3);

    // Game menu items
    GAMES.forEach((name, i) => {
      const y = 36 + i * 16;
      const selected = i === this.cursor;
      if (selected) {
        drawRect(14, y - 2, W - 28, 13, 2);
        drawRect(16, y, W - 32, 9, 0);
        if (Math.floor(this.blink * 3) % 2 === 0) {
          drawText('>', 19, y + 1, 3);
        }
        drawText(name, 28, y + 1, 3);
      } else {
        drawText(name, 28, y + 1, 2);
      }
    });

    drawRect(10, H - 20, W - 20, 1, 2);
    drawText('A:PLAY  ARROWS:NAV', 18, H - 12, 3);
  }
}
