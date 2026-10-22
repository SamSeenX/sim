import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderMaze } from './maze-render.js';
import { COLS, ROWS, MAZE_MAP, DIRS } from './maze-data.js';
import { createGhosts, updateGhosts } from './maze-ghosts.js';

export class MazeGame extends GameBase {
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
    const hi = this.store.getScore('ghost-maze') || 0;
    const grid = MAZE_MAP.map(r => [...r]);
    let dots = 0;
    grid.forEach(r => r.forEach(v => { if (v === 2 || v === 3) dots++; }));

    this.state = {
      grid,
      pac: { x: 8, y: 11, dir: { x: -1, y: 0 }, nextDir: { x: -1, y: 0 }, speed: 5.0 },
      ghosts: createGhosts(),
      dotsLeft: dots,
      lives: 3,
      score: 0,
      hiScore: hi,
      phase: 'play',
      anim: 0
    };
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'gameover' || s.phase === 'clear') {
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
    if (a === 'b' || a === 'select') { emit('game:exit'); return; }

    if (DIRS[a]) s.pac.nextDir = DIRS[a];
  }

  tick(dt) {
    const s = this.state;
    s.anim += dt;
    if (s.phase !== 'play') return;

    this._updatePac(dt);
    updateGhosts(s.ghosts, s.pac, dt);
    this._checkGhostCollisions();
  }

  _updatePac(dt) {
    const s = this.state;
    const p = s.pac;

    // Turn buffer at intersections
    const curCol = Math.round(p.x);
    const curRow = Math.round(p.y);
    const distToCenter = Math.hypot(p.x - curCol, p.y - curRow);

    if (distToCenter < 0.15) {
      const nextCol = (curCol + p.nextDir.x + COLS) % COLS;
      const nextRow = (curRow + p.nextDir.y + ROWS) % ROWS;
      if (s.grid[nextRow] && s.grid[nextRow][nextCol] !== 1) {
        p.dir = p.nextDir;
        p.x = curCol;
        p.y = curRow;
      }
    }

    // Move in current direction if not hitting wall
    const aheadCol = (Math.round(p.x) + p.dir.x + COLS) % COLS;
    const aheadRow = (Math.round(p.y) + p.dir.y + ROWS) % ROWS;
    const isWallAhead = s.grid[aheadRow] && s.grid[aheadRow][aheadCol] === 1;

    if (!isWallAhead || distToCenter > 0.05) {
      p.x += p.dir.x * p.speed * dt;
      p.y += p.dir.y * p.speed * dt;
    }

    // Warp tunnel
    if (p.x < 0) p.x = COLS - 1;
    if (p.x >= COLS) p.x = 0;

    // Eat pellets
    const tileCol = Math.round(p.x);
    const tileRow = Math.round(p.y);
    if (s.grid[tileRow]) {
      const val = s.grid[tileRow][tileCol];
      if (val === 2) {
        s.grid[tileRow][tileCol] = 0;
        s.score += 10;
        s.dotsLeft--;
        this._checkHighScore();
        emit('audio:play', 'collect');
        if (s.dotsLeft <= 0) this._win();
      } else if (val === 3) {
        s.grid[tileRow][tileCol] = 0;
        s.score += 50;
        s.dotsLeft--;
        s.ghosts.forEach(g => { g.frightened = 7.0; });
        this._checkHighScore();
        emit('audio:play', 'powerup');
        if (s.dotsLeft <= 0) this._win();
      }
    }
  }

  _checkGhostCollisions() {
    const s = this.state;
    for (let i = 0; i < s.ghosts.length; i++) {
      const g = s.ghosts[i];
      if (Math.hypot(g.x - s.pac.x, g.y - s.pac.y) < 0.7) {
        if (g.frightened > 0) {
          s.score += 200;
          this._checkHighScore();
          g.frightened = 0;
          g.x = 8;
          g.y = 6;
          emit('audio:play', 'powerup');
        } else {
          s.lives--;
          emit('audio:play', 'noise');
          if (s.lives <= 0) {
            s.phase = 'gameover';
            emit('audio:play', 'gameover');
            this.store.setScore('ghost-maze', s.score);
          } else {
            s.pac.x = 8;
            s.pac.y = 11;
            s.pac.dir = { x: -1, y: 0 };
          }
          break;
        }
      }
    }
  }

  _checkHighScore() {
    if (this.state.score > this.state.hiScore) {
      this.state.hiScore = this.state.score;
      this.store.setScore('ghost-maze', this.state.hiScore);
    }
  }

  _win() {
    this.state.phase = 'clear';
    emit('audio:play', 'powerup');
    this.store.setScore('ghost-maze', this.state.score);
  }

  render() {
    renderMaze(this.state);
  }
}
