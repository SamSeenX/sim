import { clearScreen, drawRect, drawText } from '../../console/screen.js';
import { COLS, ROWS, CELL, FIELD_X, FIELD_Y, HUD_X } from './blockfall-data.js';

export function renderBlockFall(state) {
  clearScreen();

  // Playfield frame in shade 2
  drawRect(FIELD_X - 1, FIELD_Y - 1, COLS * CELL + 2, ROWS * CELL + 2, 2);
  drawRect(FIELD_X, FIELD_Y, COLS * CELL, ROWS * CELL, 0);

  // Placed blocks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellVal = state.field[r][c];
      if (cellVal !== null) {
        const shade = typeof cellVal === 'number' ? cellVal : 3;
        const x = FIELD_X + c * CELL;
        const y = FIELD_Y + r * CELL;
        drawRect(x, y, CELL, CELL, shade);
        // Authentic block inner rim
        drawRect(x + 1, y + 1, CELL - 2, CELL - 2, 0);
        drawRect(x + 2, y + 2, CELL - 4, CELL - 4, shade);
      }
    }
  }

  // Active falling piece
  if (state.piece) {
    state.piece.shape.forEach((row, ri) => {
      row.forEach((v, ci) => {
        if (!v) return;
        const x = FIELD_X + (state.piece.col + ci) * CELL;
        const y = FIELD_Y + (state.piece.row + ri) * CELL;
        drawRect(x, y, CELL, CELL, 3);
        drawRect(x + 1, y + 1, CELL - 2, CELL - 2, 0);
        drawRect(x + 2, y + 2, CELL - 4, CELL - 4, 3);
      });
    });
  }

  // HUD
  drawText('SC', HUD_X, FIELD_Y, 2);
  drawText(String(state.score), HUD_X, FIELD_Y + 10, 3);
  drawText('LV', HUD_X, FIELD_Y + 28, 2);
  drawText(String(state.level), HUD_X, FIELD_Y + 38, 3);

  if (state.phase === 'gameover') {
    drawText('OVER', HUD_X, FIELD_Y + 60, 3);
    drawText('B:MNU', HUD_X, FIELD_Y + 74, 2);
  }
}
