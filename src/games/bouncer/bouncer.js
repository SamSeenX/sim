import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { getLogicalW, getLogicalH } from '../../console/screen.js';
import { renderBouncer } from './bouncer-render.js';
import { LEVELS, BRICK_W, BRICK_H, BRICK_GAP, PADDLE_W, PADDLE_H, BALL_SIZE } from './bouncer-data.js';

const PADDLE_SPEED = 90;
const BALL_SPEED_BASE = 65;
const BRICK_START_Y = 16;

export class BouncerGame extends GameBase {
  constructor(store) {
    super(store);
    this._onInput = this._onInput.bind(this);
    this._onInputUp = this._onInputUp.bind(this);
    this._held = { left: false, right: false };
  }

  init() {
    on('input:down', this._onInput);
    on('input:up',   this._onInputUp);
    this._loadLevel(0);
  }

  destroy() {
    off('input:down', this._onInput);
    off('input:up',   this._onInputUp);
    super.destroy();
  }

  _onInput(a) {
    if (a === 'left')  this._held.left = true;
    if (a === 'right') this._held.right = true;
    if (a === 'a' && this.state.phase === 'ready') this._launch();
    if (a === 'b') emit('game:exit');
  }

  _onInputUp(a) {
    if (a === 'left')  this._held.left = false;
    if (a === 'right') this._held.right = false;
  }

  _loadLevel(idx) {
    const W = getLogicalW(), H = getLogicalH();
    const layout = LEVELS[idx] || LEVELS[LEVELS.length - 1];
    const bricks = [];
    layout.forEach((row, ri) => {
      row.forEach((type, ci) => {
        if (!type) return;
        bricks.push({
          x: 12 + ci * (BRICK_W + BRICK_GAP),
          y: BRICK_START_Y + ri * (BRICK_H + BRICK_GAP),
          type,
          hits: 0,
          alive: true
        });
      });
    });
    this.state = {
      paddle: { x: (W - PADDLE_W) / 2 },
      balls: [{ x: W / 2, y: H - PADDLE_H - 10, vx: BALL_SPEED_BASE * 0.6, vy: -BALL_SPEED_BASE }],
      bricks,
      score: 0,
      lives: 3,
      level: idx,
      phase: 'ready',
    };
  }

  _launch() { this.state.phase = 'play'; }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;
    const W = getLogicalW(), H = getLogicalH();

    if (this._held.left)  s.paddle.x = Math.max(0, s.paddle.x - PADDLE_SPEED * dt);
    if (this._held.right) s.paddle.x = Math.min(W - PADDLE_W, s.paddle.x + PADDLE_SPEED * dt);

    s.balls = s.balls.filter(ball => {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x <= 0) { ball.x = 0; ball.vx = Math.abs(ball.vx); }
      if (ball.x + BALL_SIZE >= W) { ball.x = W - BALL_SIZE; ball.vx = -Math.abs(ball.vx); }
      if (ball.y <= 0) { ball.y = 0; ball.vy = Math.abs(ball.vy); }

      if (ball.y > H) return false;

      const px = s.paddle.x, py = H - PADDLE_H - 4;
      if (ball.y + BALL_SIZE >= py && ball.y < py + PADDLE_H && ball.x + BALL_SIZE > px && ball.x < px + PADDLE_W) {
        ball.vy = -Math.abs(ball.vy);
        const offset = (ball.x + BALL_SIZE / 2 - (px + PADDLE_W / 2)) / (PADDLE_W / 2);
        ball.vx = offset * BALL_SPEED_BASE * 1.2;
        ball.y = py - BALL_SIZE;
      }

      s.bricks.forEach(b => {
        if (!b.alive) return;
        if (ball.x + BALL_SIZE > b.x && ball.x < b.x + BRICK_W - 1 && ball.y + BALL_SIZE > b.y && ball.y < b.y + BRICK_H - 1) {
          b.hits++;
          const maxHits = b.type === 2 ? 2 : 1;
          if (b.hits >= maxHits) {
            b.alive = false;
            s.score += b.type === 2 ? 20 : 10;
            if (b.type === 3) s.balls.push({ x: ball.x, y: ball.y, vx: -ball.vx, vy: ball.vy });
            if (b.type === 4) { ball.vx *= 1.15; ball.vy *= 1.15; }
          }
          ball.vy = -ball.vy;
        }
      });

      return true;
    });

    if (s.balls.length === 0) {
      s.lives--;
      if (s.lives <= 0) {
        s.phase = 'gameover';
        this.store.setScore('bouncer', s.score);
      } else {
        this._resetBall();
        s.phase = 'ready';
      }
    }

    if (s.bricks.every(b => !b.alive)) {
      s.phase = 'clear';
      setTimeout(() => this._loadLevel(s.level + 1 < LEVELS.length ? s.level + 1 : 0), 2000);
    }
  }

  _resetBall() {
    const W = getLogicalW(), H = getLogicalH();
    this.state.balls = [{ x: W / 2, y: H - PADDLE_H - 12, vx: BALL_SPEED_BASE * 0.6, vy: -BALL_SPEED_BASE }];
  }

  render() { renderBouncer(this.state); }
}
