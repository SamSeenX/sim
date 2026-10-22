import { clearScreen, drawRect, drawText, getLogicalW, getLogicalH } from '../../console/screen.js';
import { COLS, ROWS, CELL, FIELD_X, FIELD_Y } from './snake-data.js';

export function renderSnake(state) {
  clearScreen();

  const fw = COLS * CELL;
  const fh = ROWS * CELL;

  // HUD: Score and High Score
  drawText(`SC:${state.score}`, FIELD_X, 8, 3);
  drawText(`HI:${state.hiScore}`, FIELD_X + fw - 42, 8, 2);

  // Outer border & playfield
  drawRect(FIELD_X - 2, FIELD_Y - 2, fw + 4, fh + 4, 3);
  drawRect(FIELD_X - 1, FIELD_Y - 1, fw + 2, fh + 2, 0);
  drawRect(FIELD_X, FIELD_Y, fw, fh, 1);

  // Food / Apple
  if (state.food) {
    const fx = FIELD_X + state.food.x * CELL;
    const fy = FIELD_Y + state.food.y * CELL;
    // Authentic pixel apple
    drawRect(fx + 2, fy + 2, 4, 4, 3);
    drawRect(fx + 3, fy + 1, 2, 1, 2); // stem
    if (Math.floor(state.anim * 6) % 2 === 0) {
      drawRect(fx + 3, fy + 3, 2, 2, 0); // blinking highlight
    }
  }

  // Snake body
  const body = state.snake;
  for (let i = body.length - 1; i >= 0; i--) {
    const seg = body[i];
    const sx = FIELD_X + seg.x * CELL;
    const sy = FIELD_Y + seg.y * CELL;

    if (i === 0) {
      // Head
      drawRect(sx, sy, CELL, CELL, 3);
      drawRect(sx + 1, sy + 1, CELL - 2, CELL - 2, 2);
      // Eyes based on direction
      const d = state.dir;
      if (d.x === 1) {
        drawRect(sx + 5, sy + 1, 2, 2, 3);
        drawRect(sx + 5, sy + 5, 2, 2, 3);
      } else if (d.x === -1) {
        drawRect(sx + 1, sy + 1, 2, 2, 3);
        drawRect(sx + 1, sy + 5, 2, 2, 3);
      } else if (d.y === -1) {
        drawRect(sx + 1, sy + 1, 2, 2, 3);
        drawRect(sx + 5, sy + 1, 2, 2, 3);
      } else {
        drawRect(sx + 1, sy + 5, 2, 2, 3);
        drawRect(sx + 5, sy + 5, 2, 2, 3);
      }
    } else {
      // Body segment with LCD bevel
      drawRect(sx, sy, CELL, CELL, 3);
      drawRect(sx + 1, sy + 1, CELL - 2, CELL - 2, 2);
      drawRect(sx + 2, sy + 2, CELL - 4, CELL - 4, 3);
    }
  }

  // Overlays
  if (state.phase === 'paused') {
    drawRect(42, 60, 76, 24, 3);
    drawRect(44, 62, 72, 20, 0);
    drawText('PAUSED', 58, 68, 3);
  } else if (state.phase === 'gameover') {
    drawRect(36, 54, 88, 36, 3);
    drawRect(38, 56, 84, 32, 0);
    drawText('GAME OVER', 48, 62, 3);
    drawText('A:RETRY B:MENU', 42, 74, 2);
  }
}
