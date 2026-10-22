import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderDrift } from './drift-render.js';
import { ROAD_LEFT, ROAD_RIGHT, BASE_SPEED, BOOST_SPEED, STEER_SPEED } from './drift-data.js';
import { updateTraffic } from './drift-traffic.js';

export class DriftGame extends GameBase {
  constructor(store) {
    super(store);
    this._onDown = this._onDown.bind(this);
    this._onUp   = this._onUp.bind(this);
    this._held   = { left: false, right: false, boost: false };
  }

  init() {
    on('input:down', this._onDown);
    on('input:up',   this._onUp);
    this._restart();
  }

  destroy() {
    off('input:down', this._onDown);
    off('input:up',   this._onUp);
    super.destroy();
  }

  _restart() {
    const hi = this.store.getScore('pixel-drift') || 0;
    this.state = {
      playerX: 74,
      speed: BASE_SPEED,
      targetSpeed: BASE_SPEED,
      boosting: false,
      roadOffset: 0,
      traffic: [],
      particles: [],
      spawnTimer: 1.0,
      score: 0,
      hiScore: hi,
      phase: 'play',
      anim: 0
    };
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'gameover') {
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

    if (a === 'left') this._held.left = true;
    if (a === 'right') this._held.right = true;
    if (a === 'a') {
      this._held.boost = true;
      emit('audio:play', 'boost');
    }
  }

  _onUp(a) {
    if (a === 'left') this._held.left = false;
    if (a === 'right') this._held.right = false;
    if (a === 'a') this._held.boost = false;
  }

  tick(dt) {
    const s = this.state;
    s.anim += dt;
    if (s.phase !== 'play') return;

    // Acceleration & Boost
    s.boosting = this._held.boost;
    s.targetSpeed = s.boosting ? BOOST_SPEED : BASE_SPEED + Math.min(60, s.score * 0.05);
    s.speed += (s.targetSpeed - s.speed) * dt * 4;

    // Road scroll & score
    s.roadOffset = (s.roadOffset + s.speed * dt) % 168;
    s.score += (s.speed * dt * 0.2);
    if (s.score > s.hiScore) {
      s.hiScore = Math.floor(s.score);
      this.store.setScore('pixel-drift', s.hiScore);
    }

    // Steering
    if (this._held.left) s.playerX = Math.max(ROAD_LEFT - 2, s.playerX - STEER_SPEED * dt);
    if (this._held.right) s.playerX = Math.min(ROAD_RIGHT - 10, s.playerX + STEER_SPEED * dt);

    updateTraffic(s, dt);
    this._checkCollisions(dt);
  }

  _checkCollisions(dt) {
    const s = this.state;
    const px = s.playerX, py = 116, pw = 12, ph = 14;

    for (let i = 0; i < s.traffic.length; i++) {
      const v = s.traffic[i];
      if (px + pw > v.x && px < v.x + v.w && py + ph > v.y && py < v.y + v.h) {
        if (v.type === 'oil') {
          // Spin out
          s.speed = Math.max(30, s.speed * 0.5);
          s.playerX += (Math.random() > 0.5 ? 8 : -8);
          emit('audio:play', 'screech');
          s.traffic.splice(i, 1);
          break;
        } else {
          // Crash!
          this._crash();
          break;
        }
      }
    }

    // Particle decay
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) s.particles.splice(i, 1);
    }
  }

  _crash() {
    const s = this.state;
    s.phase = 'gameover';
    emit('audio:play', 'noise');
    emit('audio:play', 'gameover');
    this.store.setScore('pixel-drift', Math.floor(s.score));

    // Spawn crash particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      s.particles.push({
        x: s.playerX + 6,
        y: 122,
        vx: Math.cos(angle) * (25 + Math.random() * 30),
        vy: Math.sin(angle) * (25 + Math.random() * 30),
        life: 0.35,
        shade: Math.random() > 0.4 ? 3 : 2
      });
    }
  }

  render() {
    renderDrift(this.state);
  }
}
