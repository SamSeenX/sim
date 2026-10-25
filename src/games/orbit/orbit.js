import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import {
  createShip, spawnAsteroid, wrapPos, distSq,
  ROT_SPEED, THRUST_ACCEL, MAX_SPEED, DRAG, BULLET_SPEED, BULLET_LIFE, SHIP_RADIUS
} from './orbit-data.js';
import { renderOrbit } from './orbit-render.js';

export class OrbitGame extends GameBase {
  constructor(store) {
    super(store);
    this.state = this._createInitialState();
    this._held = { left: false, right: false, thrust: false };
    this._onDown = this._onDown.bind(this);
    this._onUp = this._onUp.bind(this);
  }

  init() {
    on('input:down', this._onDown);
    on('input:up',   this._onUp);
    this._spawnWave();
  }

  destroy() {
    off('input:down', this._onDown);
    off('input:up',   this._onUp);
    super.destroy();
  }

  _createInitialState() {
    const stars = [];
    for (let i = 0; i < 28; i++) {
      stars.push({ x: Math.floor(Math.random() * 160), y: Math.floor(Math.random() * 144), shade: i % 3 === 0 ? 2 : 1 });
    }
    return {
      phase: 'play',
      score: 0,
      lives: 3,
      wave: 1,
      ship: createShip(),
      asteroids: [],
      bullets: [],
      particles: [],
      stars,
      shootCooldown: 0
    };
  }

  _spawnWave() {
    const count = Math.min(3 + this.state.wave, 8);
    for (let i = 0; i < count; i++) {
      this.state.asteroids.push(spawnAsteroid(3));
    }
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'ready') {
      if (a === 'a' || a === 'start') { s.phase = 'play'; this._spawnWave(); emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'gameover') {
      if (a === 'a' || a === 'start') { this.state = this._createInitialState(); this.state.phase = 'play'; this._spawnWave(); emit('audio:play', 'select'); }
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

    if (a === 'left')  this._held.left = true;
    if (a === 'right') this._held.right = true;
    if (a === 'a')     this._held.thrust = true;
    if (a === 'b')     this._shoot();
  }

  _onUp(a) {
    if (a === 'left')  this._held.left = false;
    if (a === 'right') this._held.right = false;
    if (a === 'a')     this._held.thrust = false;
  }

  _shoot() {
    const s = this.state;
    if (s.phase !== 'play' || s.bullets.length >= 4) return;
    const cos = Math.cos(s.ship.angle);
    const sin = Math.sin(s.ship.angle);
    s.bullets.push({
      x: s.ship.x + cos * 6,
      y: s.ship.y + sin * 6,
      vx: s.ship.vx + cos * BULLET_SPEED,
      vy: s.ship.vy + sin * BULLET_SPEED,
      life: BULLET_LIFE
    });
    emit('audio:play', 'laser');
  }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;

    // 1. Rotation & Thrust
    if (this._held.left)  s.ship.angle -= ROT_SPEED * dt;
    if (this._held.right) s.ship.angle += ROT_SPEED * dt;
    s.ship.thrust = this._held.thrust;

    if (this._held.thrust) {
      s.ship.vx += Math.cos(s.ship.angle) * THRUST_ACCEL * dt;
      s.ship.vy += Math.sin(s.ship.angle) * THRUST_ACCEL * dt;
    }

    s.ship.vx *= DRAG;
    s.ship.vy *= DRAG;

    const spd = Math.hypot(s.ship.vx, s.ship.vy);
    if (spd > MAX_SPEED) {
      s.ship.vx = (s.ship.vx / spd) * MAX_SPEED;
      s.ship.vy = (s.ship.vy / spd) * MAX_SPEED;
    }

    s.ship.x = wrapPos(s.ship.x + s.ship.vx * dt, 160);
    s.ship.y = wrapPos(s.ship.y + s.ship.vy * dt, 144);

    // 2. Bullets
    for (let i = s.bullets.length - 1; i >= 0; i--) {
      const b = s.bullets[i];
      b.x = wrapPos(b.x + b.vx * dt, 160);
      b.y = wrapPos(b.y + b.vy * dt, 144);
      b.life -= dt;
      if (b.life <= 0) s.bullets.splice(i, 1);
    }

    // 3. Asteroids & Bullet Collisions
    for (let i = s.asteroids.length - 1; i >= 0; i--) {
      const ast = s.asteroids[i];
      ast.x = wrapPos(ast.x + ast.vx * dt, 160);
      ast.y = wrapPos(ast.y + ast.vy * dt, 144);

      let hit = false;
      for (let j = s.bullets.length - 1; j >= 0; j--) {
        const b = s.bullets[j];
        if (distSq(ast.x, ast.y, b.x, b.y) < ast.radius * ast.radius) {
          s.bullets.splice(j, 1);
          hit = true;
          break;
        }
      }

      if (hit) {
        s.score += (4 - ast.size) * 10;
        this.store.setScore('orbit-buster', s.score);
        this._explode(ast.x, ast.y, 6);
        emit('audio:play', 'noise');

        if (ast.size > 1) {
          s.asteroids.push(spawnAsteroid(ast.size - 1, ast.x, ast.y));
          s.asteroids.push(spawnAsteroid(ast.size - 1, ast.x, ast.y));
        }
        s.asteroids.splice(i, 1);
        continue;
      }

      // Ship Collision
      if (distSq(s.ship.x, s.ship.y, ast.x, ast.y) < (ast.radius + SHIP_RADIUS) ** 2) {
        this._explode(s.ship.x, s.ship.y, 10);
        emit('audio:play', 'gameover');
        s.lives--;
        if (s.lives <= 0) {
          s.phase = 'gameover';
        } else {
          s.ship = createShip();
        }
        break;
      }
    }

    // 4. Wave progression
    if (s.asteroids.length === 0) {
      s.wave++;
      this._spawnWave();
      emit('audio:play', 'powerup');
    }

    // 5. Particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) s.particles.splice(i, 1);
    }
  }

  _explode(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 15 + Math.random() * 45;
      this.state.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 0.35 });
    }
  }

  render() { renderOrbit(this.state); }
}
