import { clearScreen, drawRect, drawText, drawPixel } from '../../console/screen.js';
import { TERRAIN_POINTS, PADS, SAFE_VY, SAFE_VX } from './lander-data.js';

export function renderLander(state) {
  clearScreen();

  // 1. Lunar Terrain
  for (let i = 0; i < TERRAIN_POINTS.length - 1; i++) {
    const p1 = TERRAIN_POINTS[i];
    const p2 = TERRAIN_POINTS[i + 1];
    drawTerrainLine(p1.x, p1.y, p2.x, p2.y);
  }

  // 2. Landing Pads highlight
  for (let i = 0; i < PADS.length; i++) {
    const pad = PADS[i];
    drawRect(pad.x0, pad.y, pad.x1 - pad.x0, 2, 3);
    drawText(`${pad.mult}X`, pad.x0 + 4, pad.y + 4, 2);
  }

  // 3. Lander Capsule
  if (state.phase !== 'crashed') {
    renderCapsule(state.lander);
  }

  // 4. Debris particles
  for (let i = 0; i < state.debris.length; i++) {
    const d = state.debris[i];
    drawPixel(Math.round(d.x), Math.round(d.y), 3);
  }

  // 5. Flight Telemetry HUD
  const l = state.lander;
  const vyColor = Math.abs(l.vy) > SAFE_VY ? 3 : 2;
  const vxColor = Math.abs(l.vx) > SAFE_VX ? 3 : 2;

  drawText(`SC:${state.score}`, 4, 3, 3);
  drawText(`FUEL:${Math.round(l.fuel)}`, 62, 3, l.fuel < 100 ? 3 : 2);
  drawText(`ALT:${Math.max(0, Math.round(144 - l.y))}`, 120, 3, 2);

  drawText(`V/S:${Math.round(l.vy)}`, 4, 12, vyColor);
  drawText(`H/S:${Math.round(l.vx)}`, 54, 12, vxColor);

  // 6. Overlays
  if (state.phase === 'ready') {
    drawRect(34, 50, 92, 26, 3);
    drawRect(36, 52, 88, 22, 0);
    drawText('GRAVITY LANDER', 38, 55, 3);
    drawText('PRESS [A] TO FLY', 42, 65, 2);
  } else if (state.phase === 'landed') {
    drawRect(32, 50, 96, 32, 3);
    drawRect(34, 52, 92, 28, 0);
    drawText('TOUCHDOWN OK!', 42, 56, 3);
    drawText(`+${state.lastBonus} PTS`, 52, 64, 2);
    drawText('[A] NEXT ROUND', 40, 72, 3);
  } else if (state.phase === 'crashed') {
    drawRect(34, 50, 92, 30, 3);
    drawRect(36, 52, 88, 26, 0);
    drawText('CRASH IMPACT!', 44, 55, 3);
    drawText(`SCORE:${state.score}`, 52, 63, 2);
    drawText('[A] RETRY', 56, 71, 3);
  } else if (state.phase === 'paused') {
    drawRect(46, 62, 68, 16, 3);
    drawRect(48, 64, 64, 12, 0);
    drawText('PAUSED', 60, 68, 3);
  }
}

function renderCapsule(l) {
  const lx = Math.round(l.x);
  const ly = Math.round(l.y);

  // Main pod
  drawRect(lx - 3, ly - 3, 7, 5, 3);
  drawRect(lx - 2, ly - 2, 5, 3, 1);
  drawPixel(lx, ly - 1, 3);

  // Landing gear legs
  drawPixel(lx - 4, ly + 3, 3);
  drawPixel(lx + 4, ly + 3, 3);
  drawPixel(lx - 3, ly + 2, 3);
  drawPixel(lx + 3, ly + 2, 3);

  // Thruster flame
  if (l.thrust && l.fuel > 0 && Math.random() < 0.8) {
    const flameY = ly + 4 + Math.floor(Math.random() * 3);
    drawPixel(lx, flameY, 3);
    drawPixel(lx - 1, flameY - 1, 2);
    drawPixel(lx + 1, flameY - 1, 2);
  }
}

function drawTerrainLine(x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = Math.round(x0);
  let cy = Math.round(y0);
  const targetX = Math.round(x1);
  const targetY = Math.round(y1);

  while (true) {
    drawPixel(cx, cy, 3);
    // Fill solid ground beneath
    for (let fillY = cy + 1; fillY < 144; fillY += 3) {
      drawPixel(cx, fillY, 1);
    }
    if (cx === targetX && cy === targetY) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}
