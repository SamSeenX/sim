import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderSweeper } from './sweeper-render.js';
import { COLS, ROWS, TOTAL_MINES, STATE_COVERED, STATE_UNCOVERED, STATE_FLAGGED } from './sweeper-data.js';
import { generateMines, floodReveal } from './sweeper-logic.js';

export class SweeperGame extends GameBase {
  constructor(store) {
    super(store);
    this._onDown = this._onDown.bind(this);
  }

  init() {
    on('input:down', this._onDown);
    this._restart();
  }

  destroy() {
    off('input:down', this._onDown);
    super.destroy();
  }

  _restart() {
    const hi = this.store.getScore('micro-sweeper') || 0;
    const grid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        mine: false,
        state: STATE_COVERED,
        count: 0
      }))
    );

    this.state = {
      grid,
      cursor: { x: 5, y: 4 },
      minesLeft: TOTAL_MINES,
      generated: false,
      timer: 0,
      hiScore: hi,
      phase: 'play',
      anim: 0
    };
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'gameover' || s.phase === 'win') {
      if (a === 'a' || a === 'start') { this._restart(); emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'paused') {
      if (a === 'start') { s.phase = 'play'; emit('audio:play', 'cursor'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (a === 'start') { s.phase = 'paused'; emit('audio:play', 'cursor'); return; }
    if (a === 'select') { emit('game:exit'); return; }

    if (a === 'up')    { s.cursor.y = Math.max(0, s.cursor.y - 1); emit('audio:play', 'cursor'); }
    if (a === 'down')  { s.cursor.y = Math.min(ROWS - 1, s.cursor.y + 1); emit('audio:play', 'cursor'); }
    if (a === 'left')  { s.cursor.x = Math.max(0, s.cursor.x - 1); emit('audio:play', 'cursor'); }
    if (a === 'right') { s.cursor.x = Math.min(COLS - 1, s.cursor.x + 1); emit('audio:play', 'cursor'); }

    if (a === 'a') this._reveal(s.cursor.x, s.cursor.y);
    if (a === 'b') this._toggleFlag(s.cursor.x, s.cursor.y);
  }

  _reveal(c, r) {
    const s = this.state;
    if (!s.generated) {
      generateMines(s.grid, c, r);
      s.generated = true;
    }

    const cell = s.grid[r][c];
    if (cell.state !== STATE_COVERED) return;

    if (cell.mine) {
      s.phase = 'gameover';
      emit('audio:play', 'noise');
      emit('audio:play', 'gameover');
      s.grid.forEach(row => row.forEach(cl => { if (cl.mine) cl.state = STATE_UNCOVERED; }));
      return;
    }

    floodReveal(s.grid, c, r);
    emit('audio:play', 'brick');
    this._checkWin();
  }

  _toggleFlag(c, r) {
    const cell = this.state.grid[r][c];
    if (cell.state === STATE_COVERED) {
      cell.state = STATE_FLAGGED;
      this.state.minesLeft--;
      emit('audio:play', 'select');
    } else if (cell.state === STATE_FLAGGED) {
      cell.state = STATE_COVERED;
      this.state.minesLeft++;
      emit('audio:play', 'cursor');
    }
  }

  _checkWin() {
    const s = this.state;
    let coveredCount = 0;
    s.grid.forEach(row => row.forEach(cl => {
      if (cl.state === STATE_COVERED || cl.state === STATE_FLAGGED) coveredCount++;
    }));

    if (coveredCount === TOTAL_MINES) {
      s.phase = 'win';
      const score = Math.max(10, 1000 - Math.floor(s.timer) * 5);
      if (score > s.hiScore) {
        s.hiScore = score;
        this.store.setScore('micro-sweeper', score);
      }
      emit('audio:play', 'powerup');
    }
  }

  tick(dt) {
    const s = this.state;
    s.anim += dt;
    if (s.phase === 'play' && s.generated) s.timer += dt;
  }

  render() {
    renderSweeper(this.state);
  }
}
