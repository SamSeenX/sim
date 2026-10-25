import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import {
  parseLevel, LEVELS, W_WALL, W_FLOOR, W_TARGET, W_BOX, W_BOX_ON
} from './sokoban-data.js';
import { renderSokoban } from './sokoban-render.js';

export class SokobanGame extends GameBase {
  constructor(store) {
    super(store);
    this.state = this._createInitialState();
    this._onDown = this._onDown.bind(this);
  }

  init() { on('input:down', this._onDown); }
  destroy() { off('input:down', this._onDown); super.destroy(); }

  _createInitialState() {
    const parsed = parseLevel(0);
    return {
      phase: 'ready',
      level: 0,
      moves: 0,
      score: 0,
      grid: parsed.grid,
      player: parsed.player,
      targets: parsed.targets
    };
  }

  _loadLevel(lvl) {
    const parsed = parseLevel(lvl);
    this.state.level = lvl;
    this.state.moves = 0;
    this.state.grid = parsed.grid;
    this.state.player = parsed.player;
    this.state.targets = parsed.targets;
    this.state.phase = 'play';
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'ready') {
      if (a === 'a' || a === 'start') { s.phase = 'play'; emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'cleared') {
      if (a === 'a' || a === 'start') {
        if (s.level + 1 < LEVELS.length) {
          this._loadLevel(s.level + 1);
          emit('audio:play', 'select');
        } else {
          s.phase = 'win';
        }
      } else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'win') {
      if (a === 'a' || a === 'start') { this.state = this._createInitialState(); this.state.phase = 'play'; emit('audio:play', 'select'); }
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
    if (a === 'b') { emit('game:exit'); return; }

    let dr = 0, dc = 0;
    if (a === 'up')    dr = -1;
    if (a === 'down')  dr = 1;
    if (a === 'left')  dc = -1;
    if (a === 'right') dc = 1;

    if (dr !== 0 || dc !== 0) {
      this._tryMove(dr, dc);
    }
  }

  _tryMove(dr, dc) {
    const s = this.state;
    const nr = s.player.r + dr;
    const nc = s.player.c + dc;
    const targetTile = s.grid[nr][nc];

    if (targetTile === W_WALL) return;

    if (targetTile === W_BOX || targetTile === W_BOX_ON) {
      // Pushing box
      const nnr = nr + dr;
      const nnc = nc + dc;
      const nextNextTile = s.grid[nnr][nnc];

      if (nextNextTile === W_FLOOR || nextNextTile === W_TARGET) {
        // Move box
        s.grid[nnr][nnc] = nextNextTile === W_TARGET ? W_BOX_ON : W_BOX;
        s.grid[nr][nc] = targetTile === W_BOX_ON ? W_TARGET : W_FLOOR;

        s.player.r = nr;
        s.player.c = nc;
        s.moves++;
        emit('audio:play', nextNextTile === W_TARGET ? 'powerup' : 'brick');
        this._checkVictory();
      }
    } else {
      // Normal walk
      s.player.r = nr;
      s.player.c = nc;
      s.moves++;
      emit('audio:play', 'cursor');
    }
  }

  _checkVictory() {
    const s = this.state;
    let boxesOnTarget = 0;
    for (let r = 0; r < s.grid.length; r++) {
      for (let c = 0; c < s.grid[r].length; c++) {
        if (s.grid[r][c] === W_BOX_ON) boxesOnTarget++;
      }
    }

    if (boxesOnTarget === s.targets) {
      s.score += Math.max(50, 500 - s.moves * 10);
      this.store.setScore('sokoban', s.score);
      s.phase = 'cleared';
      emit('audio:play', 'powerup');
    }
  }

  tick() {}
  render() { renderSokoban(this.state); }
}
