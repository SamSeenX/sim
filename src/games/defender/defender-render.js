import { clearScreen, drawRect, drawText, drawSprite, drawPixel } from '../../console/screen.js';
import { SPRITE_PLAYER, SPRITE_ALIEN_A0, SPRITE_ALIEN_A1, SPRITE_ALIEN_B0, SPRITE_ALIEN_B1 } from './defender-data.js';

export function renderDefender(state) {
  clearScreen();

  // Moving Starfield
  for (let i = 0; i < state.stars.length; i++) {
    const star = state.stars[i];
    drawPixel(Math.floor(star.x), Math.floor(star.y), star.shade);
  }

  // HUD
  drawText(`SC:${state.score}`, 4, 3, 3);
  drawText(`W:${state.wave}`, 70, 3, 2);
  drawText('L:', 116, 3, 2);
  for (let l = 0; l < state.lives; l++) {
    drawRect(132 + l * 8, 3, 5, 5, 3);
    drawRect(134 + l * 8, 2, 1, 2, 3);
  }
  drawRect(0, 11, 160, 1, 1);

  // Player lasers
  for (let i = 0; i < state.lasers.length; i++) {
    const l = state.lasers[i];
    drawRect(Math.floor(l.x), Math.floor(l.y), 2, 5, 3);
  }

  // Alien bullets
  for (let i = 0; i < state.alienBullets.length; i++) {
    const b = state.alienBullets[i];
    drawRect(Math.floor(b.x), Math.floor(b.y), 2, 3, 2);
  }

  // Aliens
  const animFrame = Math.floor(state.anim * 3) % 2;
  for (let i = 0; i < state.aliens.length; i++) {
    const a = state.aliens[i];
    if (!a.alive) continue;
    let sprite;
    if (a.type === 'a') {
      sprite = animFrame === 0 ? SPRITE_ALIEN_A0 : SPRITE_ALIEN_A1;
    } else {
      sprite = animFrame === 0 ? SPRITE_ALIEN_B0 : SPRITE_ALIEN_B1;
    }
    drawSprite(sprite, Math.floor(a.x), Math.floor(a.y));
  }

  // Particles / Explosions
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];
    drawPixel(Math.floor(p.x), Math.floor(p.y), p.shade);
  }

  // Player Ship
  if (state.lives > 0) {
    if (state.invulnTimer <= 0 || Math.floor(state.invulnTimer * 12) % 2 === 0) {
      drawSprite(SPRITE_PLAYER, Math.floor(state.playerX), 126);
      // Engine thruster glow
      if (Math.floor(state.anim * 10) % 2 === 0) {
        drawRect(Math.floor(state.playerX) + 4, 134, 3, 2, 2);
      }
    }
  }

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
  }
}
