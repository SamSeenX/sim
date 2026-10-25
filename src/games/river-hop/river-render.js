import { clearScreen, drawRect, drawText, drawPixel } from '../../console/screen.js';
import { GRID_SIZE, NUM_ROWS } from './river-data.js';

export function renderRiver(state) {
  clearScreen();

  // 1. Lanes Background
  for (let r = 0; r < NUM_ROWS; r++) {
    const y = 14 + r * GRID_SIZE;
    const lane = state.lanes[r];
    if (lane.type === 'river') {
      drawRect(0, y, 160, GRID_SIZE, 1);
    } else if (lane.type === 'road') {
      drawRect(0, y, 160, GRID_SIZE, 0);
      drawRect(0, y + GRID_SIZE - 1, 160, 1, 1);
    } else if (lane.type === 'grass') {
      drawRect(0, y, 160, GRID_SIZE, 2);
    } else if (lane.type === 'goal') {
      drawRect(0, y, 160, GRID_SIZE, 2);
      // 4 Lily pad bays
      for (let g = 0; g < 4; g++) {
        const gx = 16 + g * 36;
        drawRect(gx, y + 2, 16, 8, state.goals[g] ? 3 : 0);
        if (state.goals[g]) drawText('☻', gx + 4, y + 3, 1);
      }
    }
  }

  // 2. Obstacles (Logs & Cars)
  for (let r = 0; r < NUM_ROWS; r++) {
    const lane = state.lanes[r];
    if (lane.speed === 0) continue;
    const y = 14 + r * GRID_SIZE + 2;
    const span = lane.itemW + lane.gap;
    for (let x = -lane.itemW; x < 160 + lane.itemW; x += span) {
      const drawX = Math.round((x + lane.offset) % (160 + lane.itemW) - lane.itemW);
      if (lane.type === 'river') {
        drawRect(drawX, y, lane.itemW, 8, 3);
        drawRect(drawX + 1, y + 1, lane.itemW - 2, 6, 2);
      } else {
        drawRect(drawX, y, lane.itemW, 8, 3);
        drawPixel(drawX + 2, y + 2, 0);
        drawPixel(drawX + lane.itemW - 3, y + 2, 0);
      }
    }
  }

  // 3. Player Frog
  const fx = Math.round(state.frog.x);
  const fy = Math.round(14 + state.frog.row * GRID_SIZE + 2);
  drawRect(fx + 2, fy + 1, 6, 6, 3);
  drawPixel(fx + 1, fy + 1, 3);
  drawPixel(fx + 8, fy + 1, 3);
  drawPixel(fx + 1, fy + 6, 3);
  drawPixel(fx + 8, fy + 6, 3);

  // 4. HUD
  drawText(`SC:${state.score}`, 4, 3, 3);
  drawText(`TIME:${Math.ceil(state.timer)}`, 72, 3, 2);
  drawText(`L:${state.lives}`, 134, 3, 3);

  // 5. Overlays
  if (state.phase === 'ready') {
    drawRect(36, 56, 88, 26, 3);
    drawRect(38, 58, 84, 22, 0);
    drawText('RIVER HOP', 50, 62, 3);
    drawText('PRESS [A]', 54, 72, 2);
  } else if (state.phase === 'paused') {
    drawRect(46, 62, 68, 16, 3);
    drawRect(48, 64, 64, 12, 0);
    drawText('PAUSED', 60, 68, 3);
  } else if (state.phase === 'gameover') {
    drawRect(38, 56, 84, 28, 3);
    drawRect(40, 58, 80, 24, 0);
    drawText('SPLASH! OVER', 46, 61, 3);
    drawText(`SCORE:${state.score}`, 48, 69, 2);
    drawText('[A] RETRY', 54, 76, 3);
  } else if (state.phase === 'win') {
    drawRect(36, 56, 88, 28, 3);
    drawRect(38, 58, 84, 24, 0);
    drawText('ALL HOME! WIN!', 40, 61, 3);
    drawText(`SCORE:${state.score}`, 48, 69, 2);
    drawText('[A] RETRY', 54, 76, 3);
  }
}
