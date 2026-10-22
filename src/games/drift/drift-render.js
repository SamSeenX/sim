import { clearScreen, drawRect, drawText, drawSprite, drawPixel } from '../../console/screen.js';
import { ROAD_LEFT, ROAD_RIGHT, SPRITE_PLAYER_CAR, SPRITE_TRAFFIC_CAR, SPRITE_OIL } from './drift-data.js';

export function renderDrift(state) {
  clearScreen();

  const scroll = Math.floor(state.roadOffset);

  // Left & Right Grass Shoulders with retro dot stipple
  drawRect(0, 0, ROAD_LEFT, 144, 0);
  drawRect(ROAD_RIGHT, 0, 160 - ROAD_RIGHT, 144, 0);
  for (let y = 0; y < 144; y += 12) {
    const py = (y + scroll) % 144;
    drawPixel(12, py, 1);
    drawPixel(22, (py + 6) % 144, 1);
    drawPixel(138, py, 1);
    drawPixel(148, (py + 6) % 144, 1);
  }

  // Curbs with alternating shade blocks
  for (let y = 0; y < 144; y += 16) {
    const cy = (y + scroll * 2) % 144;
    const curbShade = Math.floor((y + scroll * 2) / 16) % 2 === 0 ? 3 : 2;
    drawRect(ROAD_LEFT - 3, cy, 3, 16, curbShade);
    drawRect(ROAD_RIGHT, cy, 3, 16, curbShade);
  }

  // Asphalt road surface
  drawRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, 144, 1);

  // Dashed lane dividers at x=63 and x=96
  const lane1 = ROAD_LEFT + 33;
  const lane2 = ROAD_LEFT + 67;
  for (let y = -16; y < 144; y += 24) {
    const dy = (y + scroll) % 168 - 16;
    drawRect(lane1, dy, 2, 12, 3);
    drawRect(lane2, dy, 2, 12, 3);
  }

  // Traffic & Obstacles
  state.traffic.forEach(v => {
    if (v.type === 'car') {
      drawSprite(SPRITE_TRAFFIC_CAR, Math.floor(v.x), Math.floor(v.y));
    } else if (v.type === 'oil') {
      drawSprite(SPRITE_OIL, Math.floor(v.x), Math.floor(v.y));
    }
  });

  // Crash particles
  state.particles.forEach(p => {
    drawPixel(Math.floor(p.x), Math.floor(p.y), p.shade);
  });

  // Player Car
  if (state.phase !== 'gameover' || Math.floor(state.anim * 8) % 2 === 0) {
    drawSprite(SPRITE_PLAYER_CAR, Math.floor(state.playerX), 116);

    // Turbo boost flames & exhaust smoke
    if (state.boosting) {
      const flameH = 4 + (Math.floor(state.anim * 15) % 3);
      drawRect(Math.floor(state.playerX) + 2, 131, 2, flameH, 3);
      drawRect(Math.floor(state.playerX) + 8, 131, 2, flameH, 3);
    }
  }

  // HUD Bar at top
  drawRect(0, 0, 160, 10, 0);
  drawRect(0, 9, 160, 1, 2);
  drawText(`SC:${Math.floor(state.score)}`, 2, 2, 3);
  drawText(`HI:${state.hiScore}`, 58, 2, 2);
  if (state.boosting) {
    drawText('TURBO', 124, 2, 3);
  } else {
    drawText(`${Math.floor(state.speed)}MPH`, 120, 2, 2);
  }

  // Overlays
  if (state.phase === 'paused') {
    drawRect(42, 60, 76, 24, 3);
    drawRect(44, 62, 72, 20, 0);
    drawText('PAUSED', 58, 68, 3);
  } else if (state.phase === 'gameover') {
    drawRect(36, 54, 88, 36, 3);
    drawRect(38, 56, 84, 32, 0);
    drawText('CRASHED!', 52, 62, 3);
    drawText('A:RETRY B:MENU', 42, 74, 2);
  }
}
