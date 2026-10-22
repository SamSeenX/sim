import { GameBase } from './game-base.js';
import { clearScreen, drawText, drawRect, getLogicalW, getLogicalH } from '../console/screen.js';
import { on, off, emit } from '../core/event-bus.js';
import { loadGame } from '../main.js';

const GAMES = [
  'BOUNCER',
  'BLOCKFALL',
  'ROOFTOP CAT',
  'SNAKE',
  'DEFENDER',
  'PIXEL DRIFT',
  'GHOST MAZE',
  'MICRO SWEEPER'
];
const VISIBLE_COUNT = 5;

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

    const startIdx = Math.max(0, Math.min(this.cursor - 2, GAMES.length - VISIBLE_COUNT));

    // Scroll arrows
    if (startIdx > 0) drawText('^', W - 18, 13, 2);
    if (startIdx + VISIBLE_COUNT < GAMES.length) drawText('V', W - 18, H - 11, 2);

    // Visible menu items
    for (let i = startIdx; i < startIdx + VISIBLE_COUNT; i++) {
      const name = GAMES[i];
      const slotY = 32 + (i - startIdx) * 16;
      const selected = i === this.cursor;
      const key = name.toLowerCase().replace(' ', '-');
      const hi = this.store.getScore(key) || 0;

      if (selected) {
        drawRect(14, slotY - 2, W - 28, 13, 2);
        drawRect(16, slotY, W - 32, 9, 0);
        if (Math.floor(this.blink * 3) % 2 === 0) {
          drawText('>', 18, slotY + 1, 3);
        }
        drawText(name, 25, slotY + 1, 3);
        drawText(`HI:${hi}`, 104, slotY + 1, 3);
      } else {
        drawText(name, 25, slotY + 1, 2);
        drawText(`HI:${hi}`, 104, slotY + 1, 1);
      }
    }

    drawRect(10, H - 18, W - 20, 1, 2);
    drawText('A:PLAY  ARROWS:NAV', 18, H - 11, 3);
  }
}
