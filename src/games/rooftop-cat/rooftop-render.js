import { clearScreen, drawRect, drawSprite, drawText, getLogicalW, getLogicalH } from '../../console/screen.js';
import { MOCHI_IDLE, MOCHI_RUN_1, MOCHI_RUN_2, MOCHI_JUMP, PIGEON, FISH } from './rooftop-sprites.js';
import { TILE } from './rooftop-data.js';

export function renderRooftop(state) {
  const W = getLogicalW(), H = getLogicalH();
  const camX = Math.round(state.camX);

  clearScreen();

  // Distant rooftop skyline silhouette in shade 1 (light background layer)
  for (let sx = 0; sx < W; sx += 24) {
    const skyX = (sx - Math.floor(camX * 0.3)) % (W + 24);
    drawRect(skyX, 70, 20, 74, 1);
  }

  // Roof and hazard tiles
  state.tiles.forEach(t => {
    const sx = t.x - camX;
    if (sx + TILE < 0 || sx > W) return;
    
    if (t.type === 1) {
      drawRect(sx, t.y, TILE, TILE, 3);
      drawRect(sx + 1, t.y + 1, TILE - 2, 2, 2);
      drawRect(sx + 1, t.y + 3, TILE - 2, TILE - 4, 3);
    } else if (t.type === 3) {
      drawRect(sx, t.y, TILE, TILE, 2);
      drawRect(sx + 2, t.y + 2, TILE - 4, TILE - 4, 3);
      for (let ay = t.y - 8; ay < t.y; ay += 3) {
        drawRect(sx + 6, ay, 3, 1, 2);
      }
    }
  });

  // Collectible fish
  state.fish.forEach(f => {
    if (f.collected) return;
    const sx = f.x - camX;
    if (sx >= -8 && sx < W) drawSprite(FISH, sx, f.y);
  });

  // Patrolling pigeons
  state.enemies.forEach(e => {
    const sx = e.x - camX;
    if (sx >= -12 && sx < W) drawSprite(PIGEON, sx, e.y);
  });

  // Animated Mochi the cat
  const p = state.player;
  let sprite = MOCHI_IDLE;
  if (!p.onGround) {
    sprite = MOCHI_JUMP;
  } else if (p.moving) {
    sprite = Math.floor(p.animTimer * 9) % 2 === 0 ? MOCHI_RUN_1 : MOCHI_RUN_2;
  }

  drawSprite(sprite, Math.round(p.screenX), Math.round(p.y));

  // HUD
  drawText(`SC:${state.score}`, 2, 2, 3);
  drawText(`HI:${state.hiScore || 0}`, 54, 2, 2);
  drawText(`LV${state.level + 1}`, W - 24, 2, 3);

  if (state.phase === 'paused') {
    drawText('PAUSE', 56, H / 2 - 4, 3);
  }
  if (state.phase === 'gameover') {
    drawText('GAME OVER', 40, H / 2 - 8, 3);
    drawText('B: MENU', 46, H / 2 + 4, 2);
  }
  if (state.phase === 'win') {
    drawText('STAGE CLEAR!', 36, H / 2, 3);
  }
}
