import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import {
  GRAVITY, THRUST, ROT_SPEED, SAFE_VY, SAFE_VX, SAFE_ANGLE,
  TERRAIN_POINTS, PADS, createLander
} from './lander-data.js';
import { renderLander } from './lander-render.js';

export class LanderGame extends GameBase {
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
      lastBonus: 0,
      lander: createLander(),
      debris: []
    };
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'ready') {
      if (a === 'a' || a === 'start') { s.phase = 'play'; emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'landed') {
      if (a === 'a' || a === 'start') {
        const nextFuel = Math.min(600, s.lander.fuel + 150);
        s.lander = createLander();
        s.lander.fuel = nextFuel;
        s.phase = 'play';
        emit('audio:play', 'select');
      } else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'crashed') {
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

    if (a === 'left')  this._held.left = true;
    if (a === 'right') this._held.right = true;
    if (a === 'a')     this._held.thrust = true;
    if (a === 'b')     emit('game:exit');
  }

  _onUp(a) {
    if (a === 'left')  this._held.left = false;
    if (a === 'right') this._held.right = false;
    if (a === 'a')     this._held.thrust = false;
  }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;
    const l = s.lander;

    // Attitude Rotation
    if (this._held.left)  l.angle -= ROT_SPEED * dt;
    if (this._held.right) l.angle += ROT_SPEED * dt;

    // Thruster & Gravity
    l.thrust = this._held.thrust && l.fuel > 0;
    if (l.thrust) {
      l.fuel = Math.max(0, l.fuel - 28 * dt);
      l.vx += Math.sin(l.angle) * THRUST * dt;
      l.vy -= Math.cos(l.angle) * THRUST * dt;
    }

    l.vy += GRAVITY * dt;
    l.x += l.vx * dt;
    l.y += l.vy * dt;

    // Boundary wrap/clamping
    if (l.x < 4)   { l.x = 4;   l.vx = 0; }
    if (l.x > 156) { l.x = 156; l.vx = 0; }

    // Check Terrain Collision
    const groundY = this._getGroundY(l.x);
    if (l.y + 4 >= groundY) {
      this._handleTouchdown(groundY);
    }
  }

  _getGroundY(x) {
    for (let i = 0; i < TERRAIN_POINTS.length - 1; i++) {
      const p1 = TERRAIN_POINTS[i];
      const p2 = TERRAIN_POINTS[i + 1];
      if (x >= p1.x && x <= p2.x) {
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y + t * (p2.y - p1.y);
      }
    }
    return 144;
  }

  _handleTouchdown(groundY) {
    const s = this.state;
    const l = s.lander;
    l.y = groundY - 4;

    // Check if on flat landing pad
    let landedPad = null;
    for (let i = 0; i < PADS.length; i++) {
      const pad = PADS[i];
      if (l.x >= pad.x0 && l.x <= pad.x1 && Math.abs(groundY - pad.y) < 2) {
        landedPad = pad;
        break;
      }
    }

    const safeSpeed = Math.abs(l.vy) <= SAFE_VY && Math.abs(l.vx) <= SAFE_VX;
    const safeAttitude = Math.abs(l.angle) <= SAFE_ANGLE;

    if (landedPad && safeSpeed && safeAttitude) {
      const bonus = Math.round((50 + Math.round(l.fuel * 0.5)) * landedPad.mult);
      s.score += bonus;
      s.lastBonus = bonus;
      this.store.setScore('lander', s.score);
      s.phase = 'landed';
      emit('audio:play', 'powerup');
    } else {
      s.phase = 'crashed';
      emit('audio:play', 'noise');
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 10 + Math.random() * 30;
        s.debris.push({ x: l.x, y: l.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd });
      }
    }
  }

  render() { renderLander(this.state); }
}
