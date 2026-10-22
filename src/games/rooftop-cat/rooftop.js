import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderRooftop } from './rooftop-render.js';
import { LEVELS, TILE } from './rooftop-data.js';
import { updatePhysics } from './rooftop-physics.js';

const JUMP_V = -125;

export class RooftopGame extends GameBase {
  constructor(store) {
    super(store);
    this._onDown = this._onDown.bind(this);
    this._onUp   = this._onUp.bind(this);
    this._held   = { left: false, right: false };
  }

  init() {
    on('input:down', this._onDown);
    on('input:up',   this._onUp);
    this._loadLevel(0);
  }

  destroy() {
    off('input:down', this._onDown);
    off('input:up',   this._onUp);
    super.destroy();
  }

  _loadLevel(idx) {
    const lvl = LEVELS[idx];
    const tiles = lvl.tiles.map(([col, row, type]) => ({ x: col * TILE, y: row * TILE, type }));
    const hi = this.store.getScore('rooftop-cat') || 0;
    const prevScore = this.state && this.state.phase !== 'gameover' ? this.state.score : 0;

    this.state = {
      level: idx,
      levelData: lvl,
      tiles,
      player: {
        x: lvl.playerStart.col * TILE,
        y: lvl.playerStart.row * TILE - 11,
        vy: 0,
        onGround: false,
        jumps: 0,
        screenX: 16,
        moving: false,
        animTimer: 0
      },
      enemies: lvl.enemies.map(e => ({
        x: e.col * TILE,
        y: e.row * TILE - 8,
        dir: 1,
        pl: e.patrolLeft * TILE,
        pr: e.patrolRight * TILE
      })),
      fish: lvl.fish.map(f => ({ x: f.col * TILE, y: f.row * TILE - 8, collected: false })),
      camX: 0,
      score: prevScore,
      hiScore: Math.max(hi, prevScore),
      phase: 'play',
    };
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'gameover') {
      if (a === 'a' || a === 'start') {
        this.state = null;
        this._loadLevel(0);
        emit('audio:play', 'select');
      } else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'paused') {
      if (a === 'start') { s.phase = 'play'; emit('audio:play', 'cursor'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (a === 'start' && s.phase === 'play') {
      s.phase = 'paused';
      emit('audio:play', 'cursor');
      return;
    }
    if (a === 'left')  this._held.left  = true;
    if (a === 'right') this._held.right = true;
    if (a === 'a' && s.player.jumps < 2) {
      s.player.vy = JUMP_V;
      s.player.jumps++;
      s.player.onGround = false;
      emit('audio:play', 'jump');
    }
    if (a === 'b' || a === 'select') emit('game:exit');
  }

  _onUp(a) {
    if (a === 'left')  this._held.left  = false;
    if (a === 'right') this._held.right = false;
  }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;
    const p = s.player;

    updatePhysics(s, this._held, dt);

    if (p.y > 144) {
      s.phase = 'gameover';
      emit('audio:play', 'gameover');
      this.store.setScore('rooftop-cat', s.score);
    }

    s.enemies.forEach(e => {
      e.x += e.dir * 24 * dt;
      if (e.x <= e.pl) e.dir = 1;
      if (e.x >= e.pr) e.dir = -1;
      if (Math.abs(e.x - p.x) < 9 && Math.abs(e.y - p.y) < 9) {
        s.phase = 'gameover';
        emit('audio:play', 'noise');
        this.store.setScore('rooftop-cat', s.score);
      }
    });

    s.fish.forEach(f => {
      if (!f.collected && Math.abs(f.x - p.x) < 10 && Math.abs(f.y - p.y) < 10) {
        f.collected = true;
        s.score += 50;
        if (s.score > s.hiScore) {
          s.hiScore = s.score;
          this.store.setScore('rooftop-cat', s.score);
        }
        emit('audio:play', 'collect');
      }
    });

    if (s.fish.every(f => f.collected)) {
      s.phase = 'win';
      emit('audio:play', 'powerup');
      this.store.setScore('rooftop-cat', s.score);
      setTimeout(() => this._loadLevel((s.level + 1) % LEVELS.length), 2000);
    }
  }

  render() { renderRooftop(this.state); }
}
