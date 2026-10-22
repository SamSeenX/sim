import { clearScreen, drawRect, drawText, getLogicalH } from '../../console/screen.js';
import { COLS, ROWS, CELL, FIELD_X, FIELD_Y, HUD_X } from './blockfall-data.js';

export function renderBlockFall(state) {
  const style = getComputedStyle(document.documentElement);
  const px  = style.getPropertyValue('--screen-px').trim()  || '#8bac0f';

  clearScreen();

  drawRect(FIELD_X - 1, FIELD_Y - 1, COLS * CELL + 2, ROWS * CELL + 2, px + '44');

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = state.field[r][c];
      if (color) {
        drawRect(FIELD_X + c * CELL, FIELD_Y + r * CELL, CELL - 1, CELL - 1, color);
      }
    }
  }

  if (state.piece) {
    state.piece.shape.forEach((row, ri) => {
      row.forEach((v, ci) => {
        if (!v) return;
        drawRect(
          FIELD_X + (state.piece.col + ci) * CELL,
          FIELD_Y + (state.piece.row + ri) * CELL,
          CELL - 1, CELL - 1,
          state.piece.color
        );
      });
    });
  }

  drawText('SC', HUD_X, FIELD_Y, px);
  drawText(String(state.score), HUD_X, FIELD_Y + 10, px);
  drawText('LV', HUD_X, FIELD_Y + 28, px);
  drawText(String(state.level), HUD_X, FIELD_Y + 38, px);

  if (state.phase === 'gameover') {
    drawText('OVER', HUD_X, FIELD_Y + 60, px);
    drawText('B:MNU', HUD_X, FIELD_Y + 74, px);
  }
}
