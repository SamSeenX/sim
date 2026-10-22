import { clearScreen, drawRect, drawText, drawPixel } from '../../console/screen.js';
import { COLS, ROWS, CELL, OFFSET_X, OFFSET_Y, STATE_COVERED, STATE_UNCOVERED, STATE_FLAGGED } from './sweeper-data.js';

export function renderSweeper(state) {
  clearScreen();

  // HUD
  drawText(`MN:${state.minesLeft}`, 6, 6, 3);
  drawText(`HI:${state.hiScore}`, 60, 6, 2);
  drawText(`TM:${Math.floor(state.timer)}`, 116, 6, 3);

  // Playfield frame
  const fw = COLS * CELL;
  const fh = ROWS * CELL;
  drawRect(OFFSET_X - 2, OFFSET_Y - 2, fw + 4, fh + 4, 3);
  drawRect(OFFSET_X - 1, OFFSET_Y - 1, fw + 2, fh + 2, 0);

  // Grid Cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = state.grid[r][c];
      const x = OFFSET_X + c * CELL;
      const y = OFFSET_Y + r * CELL;

      if (cell.state === STATE_COVERED) {
        // 3D beveled covered button
        drawRect(x, y, CELL - 1, CELL - 1, 2);
        drawRect(x, y, CELL - 1, 1, 1);
        drawRect(x, y, 1, CELL - 1, 1);
        drawRect(x, y + CELL - 2, CELL - 1, 1, 3);
        drawRect(x + CELL - 2, y, 1, CELL - 1, 3);
      } else if (cell.state === STATE_FLAGGED) {
        // Flag
        drawRect(x, y, CELL - 1, CELL - 1, 2);
        drawRect(x + 3, y + 2, 3, 2, 3); // flag triangle
        drawRect(x + 2, y + 2, 1, 5, 3); // pole
        drawRect(x + 1, y + 7, 5, 1, 3); // base
      } else if (cell.state === STATE_UNCOVERED) {
        // Flat uncovered cell
        drawRect(x, y, CELL - 1, CELL - 1, 0);
        drawRect(x + CELL - 1, y, 1, CELL, 1);
        drawRect(x, y + CELL - 1, CELL, 1, 1);

        if (cell.mine) {
          // Exploded Mine
          drawRect(x + 2, y + 2, 5, 5, 3);
          drawPixel(x + 4, y + 1, 3);
          drawPixel(x + 4, y + 7, 3);
          drawPixel(x + 1, y + 4, 3);
          drawPixel(x + 7, y + 4, 3);
          drawPixel(x + 3, y + 3, 0);
        } else if (cell.count > 0) {
          // Number 1-8
          drawText(String(cell.count), x + 3, y + 2, cell.count === 1 ? 2 : 3);
        }
      }
    }
  }

  // Blinking Selector Cursor
  if (state.phase === 'play' && Math.floor(state.anim * 6) % 2 === 0) {
    const cx = OFFSET_X + state.cursor.x * CELL;
    const cy = OFFSET_Y + state.cursor.y * CELL;
    drawRect(cx - 1, cy - 1, CELL + 1, 1, 3);
    drawRect(cx - 1, cy + CELL - 1, CELL + 1, 1, 3);
    drawRect(cx - 1, cy - 1, 1, CELL + 1, 3);
    drawRect(cx + CELL - 1, cy - 1, 1, CELL + 1, 3);
  }

  // Overlays
  if (state.phase === 'paused') {
    drawRect(42, 60, 76, 24, 3);
    drawRect(44, 62, 72, 20, 0);
    drawText('PAUSED', 58, 68, 3);
  } else if (state.phase === 'gameover') {
    drawRect(36, 54, 88, 36, 3);
    drawRect(38, 56, 84, 32, 0);
    drawText('BOOM! OVER', 46, 62, 3);
    drawText('A:RETRY B:MENU', 42, 74, 2);
  } else if (state.phase === 'win') {
    drawRect(36, 54, 88, 36, 3);
    drawRect(38, 56, 84, 32, 0);
    drawText('YOU WON!', 54, 62, 3);
    drawText('A:RETRY B:MENU', 42, 74, 2);
  }
}
