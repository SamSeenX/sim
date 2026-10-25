import { clearScreen, drawRect, drawText, drawPixel } from '../../console/screen.js';
import { TILE_SIZE, COLS, ROWS, OFFSET_X, OFFSET_Y, T_WALL, T_DOOR, T_CHEST, T_KEY } from './rogue-data.js';

export function renderRogue(state) {
  clearScreen();

  // 1. Top HUD
  let heartStr = '';
  for (let i = 0; i < state.player.maxHp; i++) {
    heartStr += i < state.player.hp ? '♥' : '.';
  }
  drawText(`HP:${heartStr}`, 4, 4, 3);
  drawText(`KEY:${state.player.keys}`, 64, 4, 2);
  drawText(`SC:${state.score}`, 112, 4, 3);

  // 2. Dungeon Tiles
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = state.room.map[r][c];
      const tx = OFFSET_X + c * TILE_SIZE;
      const ty = OFFSET_Y + r * TILE_SIZE;

      if (tile === T_WALL) {
        drawRect(tx, ty, TILE_SIZE, TILE_SIZE, 3);
        drawRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2, 2);
      } else if (tile === T_DOOR) {
        drawRect(tx, ty, TILE_SIZE, TILE_SIZE, 1);
        drawRect(tx + 3, ty + 3, TILE_SIZE - 6, TILE_SIZE - 6, 0);
      } else if (tile === T_KEY) {
        drawText('¶', tx + 3, ty + 2, 3);
      } else if (tile === T_CHEST) {
        drawRect(tx + 2, ty + 3, 8, 6, 3);
        drawRect(tx + 3, ty + 4, 6, 4, 1);
        drawPixel(tx + 5, ty + 5, 3);
      }
    }
  }

  // 3. Enemies
  for (let i = 0; i < state.room.enemies.length; i++) {
    const en = state.room.enemies[i];
    const ex = OFFSET_X + Math.round(en.x);
    const ey = OFFSET_Y + Math.round(en.y);
    if (en.type === 'bat') {
      drawRect(ex + 1, ey + 2, 6, 4, 3);
      drawPixel(ex, ey + 1, 3);
      drawPixel(ex + 7, ey + 1, 3);
    } else {
      drawRect(ex + 2, ey + 1, 5, 7, 3);
      drawPixel(ex + 3, ey + 3, 0);
      drawPixel(ex + 5, ey + 3, 0);
    }
  }

  // 4. Hero Player
  const px = OFFSET_X + Math.round(state.player.x);
  const py = OFFSET_Y + Math.round(state.player.y);
  drawRect(px + 2, py + 2, 6, 7, 3);
  drawRect(px + 3, py + 3, 4, 4, 1);

  // Sword Slash
  if (state.player.slashTimer > 0) {
    const dir = state.player.dir;
    let sx = px + 4, sy = py + 4;
    if (dir === 'up')    { sx = px + 2; sy = py - 4; drawRect(sx, sy, 6, 3, 3); }
    if (dir === 'down')  { sx = px + 2; sy = py + 9; drawRect(sx, sy, 6, 3, 3); }
    if (dir === 'left')  { sx = px - 4; sy = py + 2; drawRect(sx, sy, 3, 6, 3); }
    if (dir === 'right') { sx = px + 9; sy = py + 2; drawRect(sx, sy, 3, 6, 3); }
  }

  // 5. Overlays
  if (state.phase === 'ready') {
    drawRect(38, 56, 84, 26, 3);
    drawRect(40, 58, 80, 22, 0);
    drawText('TINY ROGUE', 48, 62, 3);
    drawText('PRESS [A]', 54, 72, 2);
  } else if (state.phase === 'paused') {
    drawRect(46, 62, 68, 16, 3);
    drawRect(48, 64, 64, 12, 0);
    drawText('PAUSED', 60, 68, 3);
  } else if (state.phase === 'gameover') {
    drawRect(38, 56, 84, 28, 3);
    drawRect(40, 58, 80, 24, 0);
    drawText('YOU PERISHED', 44, 61, 3);
    drawText(`SCORE:${state.score}`, 48, 69, 2);
    drawText('[A] RETRY', 54, 76, 3);
  } else if (state.phase === 'win') {
    drawRect(36, 56, 88, 28, 3);
    drawRect(38, 58, 84, 24, 0);
    drawText('DUNGEON CLEARED!', 40, 61, 3);
    drawText(`SCORE:${state.score}`, 48, 69, 2);
    drawText('[A] RETRY', 54, 76, 3);
  }
}
