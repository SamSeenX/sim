import { clearScreen, drawRect, drawText, drawPixel } from '../../console/screen.js';
import { TILE_SIZE, W_WALL, W_FLOOR, W_TARGET, W_BOX, W_BOX_ON } from './sokoban-data.js';

export function renderSokoban(state) {
  clearScreen();

  // 1. HUD
  drawText(`LV:${state.level + 1}`, 6, 4, 3);
  drawText(`MOVES:${state.moves}`, 54, 4, 2);
  drawText(`PTS:${state.score}`, 114, 4, 3);

  // 2. Warehouse Grid
  const grid = state.grid;
  const offX = 14;
  const offY = 18;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const tile = grid[r][c];
      const tx = offX + c * TILE_SIZE;
      const ty = offY + r * TILE_SIZE;

      if (tile === W_WALL) {
        drawRect(tx, ty, TILE_SIZE, TILE_SIZE, 3);
        drawRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2, 2);
      } else if (tile === W_TARGET) {
        drawPixel(tx + 5, ty + 5, 3);
        drawPixel(tx + 6, ty + 5, 3);
        drawPixel(tx + 5, ty + 6, 3);
        drawPixel(tx + 6, ty + 6, 3);
      } else if (tile === W_BOX || tile === W_BOX_ON) {
        drawRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2, 3);
        drawRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4, tile === W_BOX_ON ? 1 : 2);
        drawText('X', tx + 3, ty + 3, 3);
      }
    }
  }

  // 3. Player Keeper
  const px = offX + state.player.c * TILE_SIZE;
  const py = offY + state.player.r * TILE_SIZE;
  drawRect(px + 3, py + 2, 6, 8, 3);
  drawPixel(px + 4, py + 4, 0);
  drawPixel(px + 7, py + 4, 0);
  drawRect(px + 4, py + 7, 4, 3, 1);

  // 4. Overlays
  if (state.phase === 'ready') {
    drawRect(36, 54, 88, 26, 3);
    drawRect(38, 56, 84, 22, 0);
    drawText('SOKOBAN', 54, 60, 3);
    drawText('PRESS [A]', 54, 70, 2);
  } else if (state.phase === 'cleared') {
    drawRect(32, 54, 96, 28, 3);
    drawRect(34, 56, 92, 24, 0);
    drawText('LEVEL SOLVED!', 38, 60, 3);
    drawText('[A] NEXT LEVEL', 40, 70, 2);
  } else if (state.phase === 'win') {
    drawRect(32, 54, 96, 28, 3);
    drawRect(34, 56, 92, 24, 0);
    drawText('ALL PUZZLES SOLVED!', 34, 60, 3);
    drawText('[A] PLAY AGAIN', 40, 70, 2);
  } else if (state.phase === 'paused') {
    drawRect(46, 62, 68, 16, 3);
    drawRect(48, 64, 64, 12, 0);
    drawText('PAUSED', 60, 68, 3);
  }
}
