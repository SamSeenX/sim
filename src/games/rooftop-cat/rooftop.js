import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderRooftop } from './rooftop-render.js';
import { LEVELS, TILE } from './rooftop-data.js';

const GRAVITY  = 260;
const JUMP_V   = -125;
const RUN_SPD  = 65;
const AC_PUSH  = -150;

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
        screenX: 16
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
      score: 0,
      phase: 'play',
    };
  }

  _onDown(a) {
    if (a === 'left')  this._held.left  = true;
    if (a === 'right') this._held.right = true;
    if (a === 'a' && this.state.player.jumps < 2) {
      this.state.player.vy = JUMP_V;
      this.state.player.jumps++;
      this.state.player.onGround = false;
      emit('audio:play', 'jump');
    }
    if (a === 'b') emit('game:exit');
  }

  _onUp(a) {
    if (a === 'left')  this._held.left  = false;
    if (a === 'right') this._held.right = false;
  }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;
    const p = s.player;

    if (this._held.left)  p.x -= RUN_SPD * dt;
    if (this._held.right) p.x += RUN_SPD * dt;
    p.x = Math.max(0, p.x);

    p.vy += GRAVITY * dt;
    p.y  += p.vy * dt;

    p.onGround = false;
    s.tiles.forEach(t => {
      if (t.type === 0) return;
      if (p.x + 11 > t.x && p.x < t.x + TILE && p.y + 11 > t.y && p.y < t.y + TILE) {
        if (p.vy >= 0 && p.y + 11 - p.vy * dt <= t.y + 2) {
          p.y = t.y - 11;
          p.vy = 0;
          p.onGround = true;
          p.jumps = 0;
        } else if (p.vy < 0) {
          p.vy = 0;
          p.y = t.y + TILE;
        }
        if (t.type === 3 && p.x + 6 > t.x && p.x < t.x + TILE) {
          p.vy = AC_PUSH;
          emit('audio:play', 'bounce');
        }
      }
    });

    if (p.y > 144) {
      s.phase = 'gameover';
      emit('audio:play', 'gameover');
      this.store.setScore('rooftop', s.score);
    }

    const targetCam = p.x - 16;
    s.camX += (targetCam - s.camX) * 0.12;
    s.camX = Math.max(0, Math.min(s.camX, s.levelData.width * TILE - 160));

    s.enemies.forEach(e => {
      e.x += e.dir * 24 * dt;
      if (e.x <= e.pl) e.dir = 1;
      if (e.x >= e.pr) e.dir = -1;
      if (Math.abs(e.x - p.x) < 9 && Math.abs(e.y - p.y) < 9) {
        s.phase = 'gameover';
        emit('audio:play', 'noise');
        this.store.setScore('rooftop', s.score);
      }
    });

    s.fish.forEach(f => {
      if (!f.collected && Math.abs(f.x - p.x) < 10 && Math.abs(f.y - p.y) < 10) {
        f.collected = true;
        s.score += 50;
        emit('audio:play', 'collect');
      }
    });

    if (s.fish.every(f => f.collected)) {
      s.phase = 'win';
      emit('audio:play', 'powerup');
      this.store.setScore('rooftop', s.score);
      setTimeout(() => this._loadLevel((s.level + 1) % LEVELS.length), 2000);
    }
  }

  render() { renderRooftop(this.state); }
}
