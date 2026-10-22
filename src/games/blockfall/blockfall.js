import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderBlockFall } from './blockfall-render.js';
import { PIECES, COLS, ROWS } from './blockfall-data.js';

function randPiece() {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    shape: p.shape.map(r => [...r]),
    color: p.color,
    row: 0,
    col: Math.floor((COLS - p.shape[0].length) / 2)
  };
}

function rotate(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
}

function emptyField() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export class BlockFallGame extends GameBase {
  constructor(store) {
    super(store);
    this._onInput = this._onInput.bind(this);
    this._dropTimer = 0;
  }

  init() {
    on('input:down', this._onInput);
    this.state = {
      field: emptyField(),
      piece: randPiece(),
      next: randPiece(),
      score: 0,
      lines: 0,
      level: 1,
      phase: 'play'
    };
  }

  destroy() {
    off('input:down', this._onInput);
    super.destroy();
  }

  _onInput(a) {
    const s = this.state;
    if (s.phase === 'paused') {
      if (a === 'start') {
        s.phase = 'play';
        emit('audio:play', 'cursor');
      } else if (a === 'b' || a === 'select') {
        emit('game:exit');
      }
      return;
    }
    if (s.phase !== 'play') {
      if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (a === 'start') {
      s.phase = 'paused';
      emit('audio:play', 'cursor');
      return;
    }
    if (a === 'left')  this._move(0, -1);
    if (a === 'right') this._move(0,  1);
    if (a === 'down')  this._move(1,  0);
    if (a === 'a' || a === 'up') this._tryRotate();
    if (a === 'b' || a === 'select') emit('game:exit');
  }

  _move(dr, dc) {
    const p = this.state.piece;
    if (this._fits(p.shape, p.row + dr, p.col + dc)) {
      p.row += dr;
      p.col += dc;
      return true;
    }
    return false;
  }

  _tryRotate() {
    const p = this.state.piece;
    const rotated = rotate(p.shape);
    if (this._fits(rotated, p.row, p.col)) {
      p.shape = rotated;
      emit('audio:play', 'rotate');
      return;
    }
    // Wall kicks for smooth rotation near edges
    for (const offset of [-1, 1, -2, 2]) {
      if (this._fits(rotated, p.row, p.col + offset)) {
        p.col += offset;
        p.shape = rotated;
        emit('audio:play', 'rotate');
        return;
      }
    }
  }

  _fits(shape, row, col) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
        if (this.state.field[nr][nc]) return false;
      }
    }
    return true;
  }

  _lock() {
    const s = this.state;
    const p = s.piece;
    p.shape.forEach((row, ri) => {
      row.forEach((v, ci) => {
        if (v) s.field[p.row + ri][p.col + ci] = p.color;
      });
    });

    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (s.field[r].every(c => c !== null)) {
        s.field.splice(r, 1);
        s.field.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }

    if (cleared) {
      s.lines += cleared;
      s.score += [0, 100, 300, 500, 800][cleared] * s.level;
      s.level = Math.floor(s.lines / 10) + 1;
      emit('audio:play', 'line');
    } else {
      emit('audio:play', 'drop');
    }

    s.piece = s.next;
    s.next  = randPiece();

    if (!this._fits(s.piece.shape, s.piece.row, s.piece.col)) {
      s.phase = 'gameover';
      emit('audio:play', 'gameover');
      this.store.setScore('blockfall', s.score);
    }
  }

  tick(dt) {
    if (this.state.phase !== 'play') return;
    const interval = Math.max(0.12, 0.8 - (this.state.level - 1) * 0.045);
    this._dropTimer += dt;
    if (this._dropTimer >= interval) {
      this._dropTimer = 0;
      if (!this._move(1, 0)) this._lock();
    }
  }

  render() { renderBlockFall(this.state); }
}
