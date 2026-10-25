import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { createShip, spawnAsteroid } from './orbit-data.js';
import { updateOrbitPhysics, fireBullet } from './orbit-physics.js';
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
      stars
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
    if (s.phase === 'gameover') {
      if (a === 'a' || a === 'start') {
        this.state = this._createInitialState();
        this._spawnWave();
        emit('audio:play', 'select');
      } else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'paused') {
      if (a === 'start') { s.phase = 'play'; emit('audio:play', 'cursor'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (a === 'start') { s.phase = 'paused'; emit('audio:play', 'cursor'); return; }
    if (a === 'select' || a === 'b') { emit('game:exit'); return; }

    if (a === 'left')  this._held.left = true;
    if (a === 'right') this._held.right = true;
    if (a === 'a')     this._held.thrust = true;
    if (a === 'b')     fireBullet(s);
  }

  _onUp(a) {
    if (a === 'left')  this._held.left = false;
    if (a === 'right') this._held.right = false;
    if (a === 'a')     this._held.thrust = false;
  }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;

    updateOrbitPhysics(s, this._held, dt, this.store);

    if (s.asteroids.length === 0) {
      s.wave++;
      this._spawnWave();
      emit('audio:play', 'powerup');
    }
  }

  render() { renderOrbit(this.state); }
}
