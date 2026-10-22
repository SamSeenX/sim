import { emit } from '../../core/event-bus.js';
import { LASER_SPEED, ALIEN_BULLET_SPEED } from './defender-data.js';

export function spawnWave(wave) {
  const aliens = [];
  const rows = 3;
  const cols = 6;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      aliens.push({
        x: 20 + c * 20,
        y: 18 + r * 14,
        type: r === 0 ? 'b' : 'a',
        alive: true
      });
    }
  }
  return { aliens, alienDir: 1 };
}

export function updateAliens(s, dt, onPlayerHit) {
  const speed = 12 + s.wave * 4;
  let hitEdge = false;
  s.aliens.forEach(a => {
    if (!a.alive) return;
    a.x += s.alienDir * speed * dt;
    if (a.x < 4 || a.x > 146) hitEdge = true;
    if (a.y >= 120) onPlayerHit();
  });

  if (hitEdge) {
    s.alienDir *= -1;
    s.aliens.forEach(a => { a.y += 4; });
  }

  s.shootTimer += dt;
  if (s.shootTimer >= Math.max(0.6, 1.8 - s.wave * 0.15)) {
    s.shootTimer = 0;
    const alive = s.aliens.filter(a => a.alive);
    if (alive.length > 0) {
      const shooter = alive[Math.floor(Math.random() * alive.length)];
      s.alienBullets.push({ x: shooter.x + 4, y: shooter.y + 6 });
    }
  }
}

export function updateLasers(s, dt, burstFn, onWaveClear) {
  for (let i = s.lasers.length - 1; i >= 0; i--) {
    const l = s.lasers[i];
    l.y -= LASER_SPEED * dt;
    if (l.y < 12) { s.lasers.splice(i, 1); continue; }

    for (let j = 0; j < s.aliens.length; j++) {
      const al = s.aliens[j];
      if (!al.alive) continue;
      if (l.x >= al.x - 2 && l.x <= al.x + 8 && l.y >= al.y && l.y <= al.y + 7) {
        al.alive = false;
        s.lasers.splice(i, 1);
        s.score += al.type === 'b' ? 30 : 15;
        burstFn(al.x + 4, al.y + 3);
        emit('audio:play', 'brick');
        if (s.aliens.every(a => !a.alive)) onWaveClear();
        break;
      }
    }
  }
}

export function updateAlienBullets(s, dt, onPlayerHit) {
  for (let i = s.alienBullets.length - 1; i >= 0; i--) {
    const b = s.alienBullets[i];
    b.y += ALIEN_BULLET_SPEED * dt;
    if (b.y > 144) { s.alienBullets.splice(i, 1); continue; }

    if (s.invulnTimer <= 0 && b.x >= s.playerX && b.x <= s.playerX + 11 && b.y >= 126 && b.y <= 134) {
      s.alienBullets.splice(i, 1);
      onPlayerHit();
    }
  }
}
