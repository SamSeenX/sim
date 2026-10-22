import { clearScreen, drawRect, drawSprite, drawText, getLogicalW, getLogicalH } from '../../console/screen.js';
import { MOCHI_IDLE, PIGEON, FISH, TILE_COLORS } from './rooftop-sprites.js';
import { TILE } from './rooftop-data.js';

export function renderRooftop(state) {
  const style = getComputedStyle(document.documentElement);
  const px  = style.getPropertyValue('--screen-px').trim()  || '#8bac0f';
  const W = getLogicalW(), H = getLogicalH();
  const camX = Math.round(state.camX);

  clearScreen();

  drawRect(0, 0, W, H, TILE_COLORS.sky);

  [[12,4],[35,8],[70,2],[100,6],[130,3],[150,9]].forEach(([sx,sy]) => {
    const sx2 = sx - (camX % W);
    if (sx2 >= 0 && sx2 < W) drawRect(sx2, sy, 1, 1, '#ffffff');
  });

  state.tiles.forEach(t => {
    const sx = t.x - camX;
    if (sx + TILE < 0 || sx > W) return;
    const color = t.type === 1 ? TILE_COLORS.roof : t.type === 2 ? TILE_COLORS.brick : TILE_COLORS.ac;
    drawRect(sx, t.y, TILE - 1, TILE - 1, color);
    if (t.type === 3) {
      for (let ay = t.y - 6; ay < t.y; ay += 2) {
        drawRect(sx + 6, ay, 2, 1, TILE_COLORS.air);
      }
    }
  });

  state.fish.forEach(f => {
    if (f.collected) return;
    const sx = f.x - camX;
    if (sx >= -8 && sx < W) drawSprite(FISH, sx, f.y);
  });

  state.enemies.forEach(e => {
    const sx = e.x - camX;
    if (sx >= -12 && sx < W) drawSprite(PIGEON, sx, e.y);
  });

  drawSprite(MOCHI_IDLE, Math.round(state.player.screenX), Math.round(state.player.y));

  drawText(`SC:${state.score}`, 2, 2, px);
  drawText(`LV${state.level + 1}`, W - 24, 2, px);

  if (state.phase === 'gameover') {
    drawText('GAME OVER', 40, H / 2 - 8, px);
    drawText('B: MENU', 46, H / 2 + 4, px);
  }
  if (state.phase === 'win') {
    drawText('STAGE CLEAR!', 36, H / 2, px);
  }
}
