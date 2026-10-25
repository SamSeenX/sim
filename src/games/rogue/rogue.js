import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { createRoom, TILE_SIZE } from './rogue-data.js';
import { attackEnemies, collidesWithWall, handleTileInteractions } from './rogue-logic.js';
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
    if (s.phase === 'gameover' || s.phase === 'win') {
      if (a === 'a' || a === 'start') { this.state = this._createInitialState(); emit('audio:play', 'select'); }
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

    if (a === 'up')    { this._held.up = true;    s.player.dir = 'up'; }
    if (a === 'down')  { this._held.down = true;  s.player.dir = 'down'; }
    if (a === 'left')  { this._held.left = true;  s.player.dir = 'left'; }
    if (a === 'right') { this._held.right = true; s.player.dir = 'right'; }
    if (a === 'a')     attackEnemies(s, this.store);
  }

  _onUp(a) {
    if (a === 'up')    this._held.up = false;
    if (a === 'down')  this._held.down = false;
    if (a === 'left')  this._held.left = false;
    if (a === 'right') this._held.right = false;
  }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;

    const p = s.player;
    if (p.slashTimer > 0) p.slashTimer -= dt;
    if (p.invuln > 0) p.invuln -= dt;

    // Movement
    const speed = 45;
    let dx = 0, dy = 0;
    if (this._held.up)    dy -= speed * dt;
    if (this._held.down)  dy += speed * dt;
    if (this._held.left)  dx -= speed * dt;
    if (this._held.right) dx += speed * dt;

    if (dx !== 0 || dy !== 0) {
      const nextX = p.x + dx;
      const nextY = p.y + dy;
      if (!collidesWithWall(s.room, nextX, p.y)) p.x = nextX;
      if (!collidesWithWall(s.room, p.x, nextY)) p.y = nextY;
      handleTileInteractions(s, this.store);
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

  render() { renderRogue(this.state); }
}
