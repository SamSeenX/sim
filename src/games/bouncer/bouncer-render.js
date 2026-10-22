import { clearScreen, drawRect, drawText, getLogicalW, getLogicalH } from '../../console/screen.js';
import { BRICK_W, BRICK_H, BALL_SIZE, PADDLE_W, PADDLE_H, COLORS } from './bouncer-data.js';

export function renderBouncer(state) {
  const style = getComputedStyle(document.documentElement);
  const px  = style.getPropertyValue('--screen-px').trim()  || '#8bac0f';
  const W = getLogicalW(), H = getLogicalH();

  clearScreen();

  drawText(`SC:${state.score}`, 2, 2, px);
  for (let i = 0; i < state.lives; i++) {
    drawRect(W - 8 - i * 6, 2, 4, 4, px);
  }

  state.bricks.forEach(b => {
    if (!b.alive) return;
    const color = b.type === 2 ? (b.hits === 1 ? COLORS.hit1 : COLORS.hard)
                : b.type === 3 ? COLORS.powerup
                : b.type === 4 ? COLORS.speed
                : COLORS.normal;
    drawRect(b.x, b.y, BRICK_W - 1, BRICK_H - 1, color);
  });

  state.balls.forEach(ball => {
    drawRect(Math.round(ball.x), Math.round(ball.y), BALL_SIZE, BALL_SIZE, px);
  });

  drawRect(Math.round(state.paddle.x), H - PADDLE_H - 4, PADDLE_W, PADDLE_H, px);

  if (state.phase === 'gameover') {
    drawText('GAME OVER', 38, H / 2 - 8, px);
    drawText('B: MENU', 46, H / 2 + 4, px);
  }
  if (state.phase === 'clear') {
    drawText('LEVEL CLEAR', 32, H / 2 - 4, px);
  }
  if (state.phase === 'ready') {
    drawText('PRESS A TO LAUNCH', 20, H - 20, px);
  }
}
