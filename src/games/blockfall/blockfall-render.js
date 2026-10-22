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

  // HUD: High Score, Score, Level
  drawText('HI', HUD_X, FIELD_Y, 2);
  drawText(String(state.hiScore || 0), HUD_X, FIELD_Y + 8, 3);
  drawText('SC', HUD_X, FIELD_Y + 17, 2);
  drawText(String(state.score), HUD_X, FIELD_Y + 25, 3);
  drawText('LV', HUD_X, FIELD_Y + 34, 2);
  drawText(String(state.level), HUD_X, FIELD_Y + 42, 3);

  // HUD: Next Piece Preview Box
  drawText('NEXT', HUD_X, FIELD_Y + 52, 2);
  const boxX = HUD_X - 1;
  const boxY = FIELD_Y + 60;
  const boxW = 38;
  const boxH = 26;
  drawRect(boxX, boxY, boxW, boxH, 2);
  drawRect(boxX + 1, boxY + 1, boxW - 2, boxH - 2, 0);

  if (state.next) {
    const pCell = 5;
    const shape = state.next.shape;
    const pw = shape[0].length * pCell;
    const ph = shape.length * pCell;
    const ox = boxX + 1 + Math.floor((boxW - 2 - pw) / 2);
    const oy = boxY + 1 + Math.floor((boxH - 2 - ph) / 2);

    shape.forEach((row, ri) => {
      row.forEach((v, ci) => {
        if (!v) return;
        const bx = ox + ci * pCell;
        const by = oy + ri * pCell;
        drawRect(bx, by, pCell, pCell, 3);
        drawRect(bx + 1, by + 1, pCell - 2, pCell - 2, 0);
        drawRect(bx + 2, by + 2, pCell - 4, pCell - 4, 3);
      });
    });
  }

  if (state.phase === 'paused') {
    drawText('PAUSE', HUD_X, FIELD_Y + 92, 3);
  }
  if (state.phase === 'gameover') {
    drawText('OVER', HUD_X, FIELD_Y + 90, 3);
    drawText('B:MNU', HUD_X, FIELD_Y + 104, 2);
  }
}
