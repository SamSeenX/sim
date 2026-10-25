import { emit } from '../../core/event-bus.js';
import {
  spawnAsteroid, wrapPos, distSq, createShip,
  ROT_SPEED, THRUST_ACCEL, MAX_SPEED, DRAG, BULLET_SPEED, BULLET_LIFE, SHIP_RADIUS
} from './orbit-data.js';

export function fireBullet(s) {
  if (s.phase !== 'play' || s.bullets.length >= 4) return;
  const cos = Math.cos(s.ship.angle);
  const sin = Math.sin(s.ship.angle);
  s.bullets.push({
    x: s.ship.x + cos * 6,
    y: s.ship.y + sin * 6,
    vx: s.ship.vx + cos * BULLET_SPEED,
    vy: s.ship.vy + sin * BULLET_SPEED,
    life: BULLET_LIFE
  });
  emit('audio:play', 'laser');
}

export function explodeParticles(particles, x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 15 + Math.random() * 45;
    particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 0.35 });
  }
}

export function updateOrbitPhysics(s, held, dt, store) {
  // 1. Rotation & Thrust
  if (held.left)  s.ship.angle -= ROT_SPEED * dt;
  if (held.right) s.ship.angle += ROT_SPEED * dt;
  s.ship.thrust = held.thrust;

  if (held.thrust) {
    s.ship.vx += Math.cos(s.ship.angle) * THRUST_ACCEL * dt;
    s.ship.vy += Math.sin(s.ship.angle) * THRUST_ACCEL * dt;
  }

  s.ship.vx *= DRAG;
  s.ship.vy *= DRAG;

  const spd = Math.hypot(s.ship.vx, s.ship.vy);
  if (spd > MAX_SPEED) {
    s.ship.vx = (s.ship.vx / spd) * MAX_SPEED;
    s.ship.vy = (s.ship.vy / spd) * MAX_SPEED;
  }

  s.ship.x = wrapPos(s.ship.x + s.ship.vx * dt, 160);
  s.ship.y = wrapPos(s.ship.y + s.ship.vy * dt, 144);

  // 2. Bullets
  for (let i = s.bullets.length - 1; i >= 0; i--) {
    const b = s.bullets[i];
    b.x = wrapPos(b.x + b.vx * dt, 160);
    b.y = wrapPos(b.y + b.vy * dt, 144);
    b.life -= dt;
    if (b.life <= 0) s.bullets.splice(i, 1);
  }

  // 3. Asteroids & Bullet Collisions
  for (let i = s.asteroids.length - 1; i >= 0; i--) {
    const ast = s.asteroids[i];
    ast.x = wrapPos(ast.x + ast.vx * dt, 160);
    ast.y = wrapPos(ast.y + ast.vy * dt, 144);

    let hit = false;
    for (let j = s.bullets.length - 1; j >= 0; j--) {
      const b = s.bullets[j];
      if (distSq(ast.x, ast.y, b.x, b.y) < ast.radius * ast.radius) {
        s.bullets.splice(j, 1);
        hit = true;
        break;
      }
    }

    if (hit) {
      s.score += (4 - ast.size) * 10;
      store.setScore('orbit-buster', s.score);
      explodeParticles(s.particles, ast.x, ast.y, 6);
      emit('audio:play', 'noise');

      if (ast.size > 1) {
        s.asteroids.push(spawnAsteroid(ast.size - 1, ast.x, ast.y));
        s.asteroids.push(spawnAsteroid(ast.size - 1, ast.x, ast.y));
      }
      s.asteroids.splice(i, 1);
      continue;
    }

    // Ship Collision
    if (distSq(s.ship.x, s.ship.y, ast.x, ast.y) < (ast.radius + SHIP_RADIUS) ** 2) {
      explodeParticles(s.particles, s.ship.x, s.ship.y, 10);
      emit('audio:play', 'gameover');
      s.lives--;
      if (s.lives <= 0) {
        s.phase = 'gameover';
      } else {
        s.ship = createShip();
      }
      break;
    }
  }

  // 4. Particles
  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) s.particles.splice(i, 1);
  }
}
