import { clearScreen, drawPixel, drawRect, drawText } from '../../console/screen.js';

export function renderOrbit(state) {
  clearScreen();

  // 1. Distant space stars
  for (let i = 0; i < state.stars.length; i++) {
    const star = state.stars[i];
    drawPixel(star.x, star.y, star.shade);
  }

  // 2. Asteroids
  for (let i = 0; i < state.asteroids.length; i++) {
    renderAsteroid(state.asteroids[i]);
  }

  // 3. Bullets
  for (let i = 0; i < state.bullets.length; i++) {
    const b = state.bullets[i];
    drawRect(Math.round(b.x), Math.round(b.y), 2, 2, 3);
  }

  // 4. Shard Particles
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];
    drawPixel(Math.round(p.x), Math.round(p.y), p.life > 0.2 ? 3 : 2);
  }

  // 5. Player Ship
  if (state.phase === 'play' || (state.phase === 'gameover' && state.lives > 0)) {
    renderShip(state.ship);
  }

  // 6. HUD
  drawText(`SC:${state.score}`, 4, 3, 3);
  drawText(`W:${state.wave}`, 72, 3, 2);
  drawText(`L:${state.lives}`, 134, 3, 3);

  // 7. Overlay phases
  if (state.phase === 'ready') {
    drawRect(36, 60, 88, 22, 3);
    drawRect(38, 62, 84, 18, 0);
    drawText('ORBIT BUSTER', 42, 65, 3);
    drawText('PRESS [A]', 52, 73, 2);
  } else if (state.phase === 'paused') {
    drawRect(46, 62, 68, 16, 3);
    drawRect(48, 64, 64, 12, 0);
    drawText('PAUSED', 60, 68, 3);
  } else if (state.phase === 'gameover') {
    drawRect(38, 54, 84, 32, 3);
    drawRect(40, 56, 80, 28, 0);
    drawText('GAME OVER', 50, 60, 3);
    drawText(`FINAL:${state.score}`, 46, 69, 2);
    drawText('[A] RETRY', 52, 77, 3);
  }
}

function renderShip(ship) {
  const cos = Math.cos(ship.angle);
  const sin = Math.sin(ship.angle);

  // Nose & wings
  const nx = ship.x + cos * 5;
  const ny = ship.y + sin * 5;
  const leftX = ship.x - cos * 3 - sin * 4;
  const leftY = ship.y - sin * 3 + cos * 4;
  const rightX = ship.x - cos * 3 + sin * 4;
  const rightY = ship.y - sin * 3 - cos * 4;

  drawLine(nx, ny, leftX, leftY, 3);
  drawLine(nx, ny, rightX, rightY, 3);
  drawLine(leftX, leftY, rightX, rightY, 2);

  // Thruster flame
  if (ship.thrust && Math.random() < 0.8) {
    const flameX = ship.x - cos * 6;
    const flameY = ship.y - sin * 6;
    drawPixel(Math.round(flameX), Math.round(flameY), 3);
  }
}

function renderAsteroid(ast) {
  const r = Math.round(ast.radius);
  const x = Math.round(ast.x);
  const y = Math.round(ast.y);

  drawRect(x - r + 1, y - r, r * 2 - 2, 1, 3);
  drawRect(x - r + 1, y + r, r * 2 - 2, 1, 3);
  drawRect(x - r, y - r + 1, 1, r * 2 - 2, 3);
  drawRect(x + r, y - r + 1, 1, r * 2 - 2, 3);

  if (ast.size >= 2) {
    drawPixel(x - 1, y - 1, 2);
    drawPixel(x + 2, y + 1, 2);
  }
}

function drawLine(x0, y0, x1, y1, shade) {
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
    drawPixel(cx, cy, shade);
    if (cx === targetX && cy === targetY) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}
