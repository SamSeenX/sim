import { clearScreen, drawRect, drawText, getLogicalW, getLogicalH } from '../../console/screen.js';
import { BRICK_W, BRICK_H, BALL_SIZE, PADDLE_W, PADDLE_H } from './bouncer-data.js';

export function renderBouncer(state) {
  const W = getLogicalW(), H = getLogicalH();

  clearScreen();

  // HUD: dark olive shade 3
  drawText(`SC:${state.score}`, 2, 2, 3);
  for (let i = 0; i < state.lives; i++) {
    drawRect(W - 8 - i * 6, 2, 4, 4, 3);
  }

  // Bricks rendered with authentic 4-shade LCD stipple / tones
  state.bricks.forEach(b => {
    if (!b.alive) return;
    const shade = b.type === 2 ? (b.hits === 1 ? 2 : 3)
                : b.type === 3 ? 1
                : b.type === 4 ? 3
                : 2;
    drawRect(b.x, b.y, BRICK_W - 1, BRICK_H - 1, shade);
    // Bevel highlight on brick top edge
    drawRect(b.x, b.y, BRICK_W - 1, 1, 1);
  });

  // Ball
  state.balls.forEach(ball => {
    drawRect(Math.round(ball.x), Math.round(ball.y), BALL_SIZE, BALL_SIZE, 3);
  });

  // Paddle
  drawRect(Math.round(state.paddle.x), H - PADDLE_H - 4, PADDLE_W, PADDLE_H, 3);
  drawRect(Math.round(state.paddle.x) + 1, H - PADDLE_H - 3, PADDLE_W - 2, 1, 1);

  if (state.phase === 'gameover') {
    drawText('GAME OVER', 38, H / 2 - 8, 3);
    drawText('B: MENU', 46, H / 2 + 4, 2);
  }
  if (state.phase === 'clear') {
    drawText('LEVEL CLEAR', 32, H / 2 - 4, 3);
  }
  if (state.phase === 'ready') {
    drawText('PRESS A TO LAUNCH', 20, H - 20, 3);
  }
}
