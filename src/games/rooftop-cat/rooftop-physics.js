import { emit } from '../../core/event-bus.js';
import { TILE } from './rooftop-data.js';

const GRAVITY = 260;
const RUN_SPD = 65;
const AC_PUSH = -150;

export function updatePhysics(s, held, dt) {
  const p = s.player;
  p.moving = held.left || held.right;
  if (held.left)  p.x -= RUN_SPD * dt;
  if (held.right) p.x += RUN_SPD * dt;
  p.x = Math.max(0, p.x);

  p.animTimer = p.moving ? p.animTimer + dt : 0;
  p.vy += GRAVITY * dt;
  p.y  += p.vy * dt;

  p.onGround = false;
  s.tiles.forEach(t => {
    if (t.type === 0) return;
    if (p.x + 11 > t.x && p.x < t.x + TILE && p.y + 11 > t.y && p.y < t.y + TILE) {
      if (p.vy >= 0 && p.y + 11 - p.vy * dt <= t.y + 2) {
        p.y = t.y - 11;
        p.vy = 0;
        p.onGround = true;
        p.jumps = 0;
      } else if (p.vy < 0) {
        p.vy = 0;
        p.y = t.y + TILE;
      }
      if (t.type === 3 && p.x + 6 > t.x && p.x < t.x + TILE) {
        p.vy = AC_PUSH;
        emit('audio:play', 'bounce');
      }
    }
  });

  const targetCam = p.x - 16;
  s.camX += (targetCam - s.camX) * 0.12;
  s.camX = Math.max(0, Math.min(s.camX, s.levelData.width * TILE - 160));
}
