import { clearScreen, drawRect, drawText, drawPixel } from '../../console/screen.js';
import { CELL, COLS, ROWS, OFFSET_X, OFFSET_Y } from './maze-data.js';

export function renderMaze(state) {
  clearScreen();

  // HUD
  drawText(`SC:${state.score}`, 4, 4, 3);
  drawText(`HI:${state.hiScore}`, 58, 4, 2);
  drawText('L:', 124, 4, 2);
  for (let l = 0; l < state.lives; l++) {
    drawRect(138 + l * 8, 4, 5, 5, 3);
    drawRect(141 + l * 8, 5, 2, 3, 0); // mouth indent
  }

  // Maze Walls & Pellets
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = state.grid[r][c];
      const px = OFFSET_X + c * CELL;
      const py = OFFSET_Y + r * CELL;

      if (tile === 1) {
        // Wall
        drawRect(px, py, CELL, CELL, 3);
        drawRect(px + 1, py + 1, CELL - 2, CELL - 2, 2);
        drawRect(px + 2, py + 2, CELL - 4, CELL - 4, 0);
      } else if (tile === 2) {
        // Small pellet
        drawRect(px + 3, py + 3, 2, 2, 2);
      } else if (tile === 3) {
        // Power pellet (blinking)
        if (Math.floor(state.anim * 6) % 2 === 0) {
          drawRect(px + 2, py + 2, 4, 4, 3);
        }
      }
    }
  }

  // Pac-Man
  const pacX = OFFSET_X + state.pac.x * CELL;
  const pacY = OFFSET_Y + state.pac.y * CELL;
  const chompOpen = Math.floor(state.anim * 10) % 2 === 0;

  drawRect(Math.floor(pacX) + 1, Math.floor(pacY), 6, 8, 3);
  drawRect(Math.floor(pacX), Math.floor(pacY) + 1, 8, 6, 3);

  if (chompOpen) {
    // Cut mouth notch based on direction
    const d = state.pac.dir;
    if (d.x === 1) drawRect(Math.floor(pacX) + 4, Math.floor(pacY) + 2, 4, 4, 0);
    else if (d.x === -1) drawRect(Math.floor(pacX), Math.floor(pacY) + 2, 4, 4, 0);
    else if (d.y === 1) drawRect(Math.floor(pacX) + 2, Math.floor(pacY) + 4, 4, 4, 0);
    else if (d.y === -1) drawRect(Math.floor(pacX) + 2, Math.floor(pacY), 4, 4, 0);
  }

  // Ghosts
  state.ghosts.forEach(g => {
    const gx = OFFSET_X + g.x * CELL;
    const gy = OFFSET_Y + g.y * CELL;
    const isFright = g.frightened > 0;
    const shade = isFright ? (g.frightened < 2 && Math.floor(state.anim * 6) % 2 === 0 ? 3 : 1) : g.shade;

    // Ghost body
    drawRect(Math.floor(gx) + 1, Math.floor(gy), 6, 7, shade);
    drawRect(Math.floor(gx), Math.floor(gy) + 1, 8, 6, shade);
    // Skirt wave
    const wave = Math.floor(state.anim * 8) % 2;
    drawPixel(Math.floor(gx) + 1, Math.floor(gy) + 7, wave === 0 ? shade : 0);
    drawPixel(Math.floor(gx) + 4, Math.floor(gy) + 7, wave === 0 ? 0 : shade);
    drawPixel(Math.floor(gx) + 6, Math.floor(gy) + 7, wave === 0 ? shade : 0);

    // Eyes
    if (!isFright) {
      drawRect(Math.floor(gx) + 2, Math.floor(gy) + 2, 2, 2, 0);
      drawRect(Math.floor(gx) + 5, Math.floor(gy) + 2, 2, 2, 0);
      drawPixel(Math.floor(gx) + (g.dir.x > 0 ? 3 : 2), Math.floor(gy) + 3, 3);
      drawPixel(Math.floor(gx) + (g.dir.x > 0 ? 6 : 5), Math.floor(gy) + 3, 3);
    }
  });

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
  } else if (state.phase === 'clear') {
    drawRect(36, 54, 88, 30, 3);
    drawRect(38, 56, 84, 26, 0);
    drawText('MAZE CLEAR!', 44, 64, 3);
  }
}
