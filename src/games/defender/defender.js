import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderDefender } from './defender-render.js';
import { PLAYER_SPEED } from './defender-data.js';
import { spawnWave, updateAliens, updateLasers, updateAlienBullets } from './defender-waves.js';

export class DefenderGame extends GameBase {
  constructor(store) {
    super(store);
    this._onInput = this._onInput.bind(this);
    this._onInputUp = this._onInputUp.bind(this);
    this._burst = this._burst.bind(this);
    this._playerHit = this._playerHit.bind(this);
    this._onWaveClear = this._onWaveClear.bind(this);
    this._held = { left: false, right: false };
    this._fireTimer = 0;
  }

  init() {
    on('input:down', this._onInput);
    on('input:up', this._onInputUp);
    this._restart();
  }

  destroy() {
    off('input:down', this._onInput);
    off('input:up', this._onInputUp);
    super.destroy();
  }

  _restart() {
    const stars = Array.from({ length: 24 }, () => ({
      x: Math.random() * 160,
      y: Math.random() * 144,
      spd: 15 + Math.random() * 35,
      shade: Math.random() > 0.4 ? 1 : 2
    }));

    const { aliens, alienDir } = spawnWave(1);
    const hi = this.store.getScore('defender') || 0;
    this.state = {
      stars, playerX: 74, lasers: [], aliens, alienDir,
      alienBullets: [], particles: [], shootTimer: 0, invulnTimer: 0,
      lives: 3, score: 0, hiScore: hi, wave: 1, phase: 'play', anim: 0
    };
  }

  _onInput(a) {
    const s = this.state;
    if (s.phase === 'paused') {
      if (a === 'start') { s.phase = 'play'; emit('audio:play', 'cursor'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'gameover') {
      if (a === 'a' || a === 'start') { this._restart(); emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (a === 'start') { s.phase = 'paused'; emit('audio:play', 'cursor'); return; }
    if (a === 'b' || a === 'select') { emit('game:exit'); return; }

    if (a === 'left') this._held.left = true;
    if (a === 'right') this._held.right = true;
    if (a === 'a') this._shoot();
  }

  _onInputUp(a) {
    if (a === 'left') this._held.left = false;
    if (a === 'right') this._held.right = false;
  }

  _shoot() {
    const s = this.state;
    if (s.phase !== 'play' || this._fireTimer > 0) return;
    this._fireTimer = 0.22;
    s.lasers.push({ x: s.playerX + 1, y: 124 }, { x: s.playerX + 8, y: 124 });
    emit('audio:play', 'laser');
  }

  tick(dt) {
    const s = this.state;
    s.anim += dt;
    s.stars.forEach(st => {
      st.y += st.spd * dt;
      if (st.y >= 144) { st.y = 0; st.x = Math.random() * 160; }
    });
    if (s.phase !== 'play') return;

    if (this._fireTimer > 0) this._fireTimer -= dt;
    if (s.invulnTimer > 0) s.invulnTimer -= dt;

    if (this._held.left) s.playerX = Math.max(2, s.playerX - PLAYER_SPEED * dt);
    if (this._held.right) s.playerX = Math.min(147, s.playerX + PLAYER_SPEED * dt);

    updateLasers(s, dt, this._burst, this._onWaveClear);
    if (s.score > s.hiScore) {
      s.hiScore = s.score;
      this.store.setScore('defender', s.score);
    }
    updateAliens(s, dt, this._playerHit);
    updateAlienBullets(s, dt, this._playerHit);

    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) s.particles.splice(i, 1);
    }
  }

  _onWaveClear() {
    const s = this.state;
    s.wave++;
    s.score += 100;
    if (s.score > s.hiScore) {
      s.hiScore = s.score;
      this.store.setScore('defender', s.score);
    }
    emit('audio:play', 'powerup');
    const waveData = spawnWave(s.wave);
    s.aliens = waveData.aliens;
    s.alienDir = waveData.alienDir;
  }

  _playerHit() {
    const s = this.state;
    if (s.invulnTimer > 0) return;
    s.lives--;
    s.invulnTimer = 2.0;
    this._burst(s.playerX + 5, 130);
    emit('audio:play', 'noise');

    if (s.lives <= 0) {
      s.phase = 'gameover';
      emit('audio:play', 'gameover');
      const hi = (this.store.getScore ? this.store.getScore('defender') : this.store.getScores?.()?.defender) || 0;
      if (s.score > hi) this.store.setScore('defender', s.score);
    }
  }

  _burst(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.state.particles.push({
        x, y,
        vx: Math.cos(angle) * (20 + Math.random() * 25),
        vy: Math.sin(angle) * (20 + Math.random() * 25),
        life: 0.25,
        shade: Math.random() > 0.5 ? 3 : 2
      });
    }
  }

  render() {
    renderDefender(this.state);
  }
}
