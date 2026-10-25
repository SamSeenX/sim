import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { createRoom, TILE_SIZE, COLS, ROWS, T_WALL, T_DOOR, T_CHEST, T_KEY } from './rogue-data.js';
import { renderRogue } from './rogue-render.js';

export class RogueGame extends GameBase {
  constructor(store) {
    super(store);
    this.state = this._createInitialState();
    this._held = { up: false, down: false, left: false, right: false };
    this._onDown = this._onDown.bind(this);
    this._onUp = this._onUp.bind(this);
  }

  init() {
    on('input:down', this._onDown);
    on('input:up',   this._onUp);
  }

  destroy() {
    off('input:down', this._onDown);
    off('input:up',   this._onUp);
    super.destroy();
  }

  _createInitialState() {
    return {
      phase: 'play',
      score: 0,
      roomIdx: 0,
      room: createRoom(0),
      player: {
        x: 6 * TILE_SIZE,
        y: 5 * TILE_SIZE,
        hp: 3,
        maxHp: 3,
        keys: 0,
        dir: 'down',
        slashTimer: 0,
        invuln: 0
      }
    };
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'ready') {
      if (a === 'a' || a === 'start') { s.phase = 'play'; emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'gameover' || s.phase === 'win') {
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

    if (a === 'up')    { this._held.up = true;    s.player.dir = 'up'; }
    if (a === 'down')  { this._held.down = true;  s.player.dir = 'down'; }
    if (a === 'left')  { this._held.left = true;  s.player.dir = 'left'; }
    if (a === 'right') { this._held.right = true; s.player.dir = 'right'; }
    if (a === 'a')     this._attack();
    if (a === 'b')     emit('game:exit');
  }

  _onUp(a) {
    if (a === 'up')    this._held.up = false;
    if (a === 'down')  this._held.down = false;
    if (a === 'left')  this._held.left = false;
    if (a === 'right') this._held.right = false;
  }

  _attack() {
    const p = this.state.player;
    if (p.slashTimer > 0) return;
    p.slashTimer = 0.2;
    emit('audio:play', 'laser');

    // Hitbox check
    let hx = p.x + 4, hy = p.y + 4;
    if (p.dir === 'up')    hy -= 8;
    if (p.dir === 'down')  hy += 8;
    if (p.dir === 'left')  hx -= 8;
    if (p.dir === 'right') hx += 8;

    for (let i = this.state.room.enemies.length - 1; i >= 0; i--) {
      const en = this.state.room.enemies[i];
      if (Math.hypot(en.x + 4 - hx, en.y + 4 - hy) < 10) {
        en.hp--;
        emit('audio:play', 'noise');
        if (en.hp <= 0) {
          this.state.score += 50;
          this.store.setScore('tiny-rogue', this.state.score);
          this.state.room.enemies.splice(i, 1);
        }
      }
    }
  }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;

    const p = s.player;
    if (p.slashTimer > 0) p.slashTimer -= dt;
    if (p.invuln > 0) p.invuln -= dt;

    // Player Movement
    const speed = 45;
    let dx = 0, dy = 0;
    if (this._held.up)    dy -= speed * dt;
    if (this._held.down)  dy += speed * dt;
    if (this._held.left)  dx -= speed * dt;
    if (this._held.right) dx += speed * dt;

    if (dx !== 0 || dy !== 0) {
      const nextX = p.x + dx;
      const nextY = p.y + dy;
      if (!this._collides(nextX, p.y)) p.x = nextX;
      if (!this._collides(p.x, nextY)) p.y = nextY;
      this._checkTileInteractions();
    }

    // Enemies tracking
    for (let i = 0; i < s.room.enemies.length; i++) {
      const en = s.room.enemies[i];
      const ex = p.x - en.x;
      const ey = p.y - en.y;
      const dist = Math.hypot(ex, ey);
      if (dist > 2) {
        en.x += (ex / dist) * 16 * dt;
        en.y += (ey / dist) * 16 * dt;
      }
      if (dist < 8 && p.invuln <= 0) {
        p.hp--;
        p.invuln = 1.0;
        emit('audio:play', 'gameover');
        if (p.hp <= 0) s.phase = 'gameover';
      }
    }
  }

  _collides(x, y) {
    const c = Math.floor((x + 4) / TILE_SIZE);
    const r = Math.floor((y + 4) / TILE_SIZE);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
    const tile = this.state.room.map[r][c];
    return tile === T_WALL;
  }

  _checkTileInteractions() {
    const p = this.state.player;
    const c = Math.floor((p.x + 4) / TILE_SIZE);
    const r = Math.floor((p.y + 4) / TILE_SIZE);
    const tile = this.state.room.map[r][c];

    if (tile === T_KEY) {
      this.state.room.map[r][c] = 0;
      p.keys++;
      this.state.score += 25;
      this.store.setScore('tiny-rogue', this.state.score);
      emit('audio:play', 'collect');
    } else if (tile === T_CHEST && p.keys > 0) {
      this.state.room.map[r][c] = 0;
      p.keys--;
      this.state.score += 100;
      this.store.setScore('tiny-rogue', this.state.score);
      emit('audio:play', 'powerup');
    } else if (tile === T_DOOR) {
      if (this.state.roomIdx < 2) {
        this.state.roomIdx++;
        this.state.room = createRoom(this.state.roomIdx);
        p.x = 6 * TILE_SIZE;
        p.y = 5 * TILE_SIZE;
        emit('audio:play', 'door');
      } else {
        this.state.phase = 'win';
        emit('audio:play', 'powerup');
      }
    }
  }

  render() { renderRogue(this.state); }
}
