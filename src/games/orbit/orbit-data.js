export const SHIP_RADIUS = 4;
export const ROT_SPEED = 3.8;      // Radians per sec
export const THRUST_ACCEL = 70;    // Pixels per sec^2
export const MAX_SPEED = 85;
export const DRAG = 0.985;
export const BULLET_SPEED = 120;
export const BULLET_LIFE = 0.9;

export function createShip() {
  return {
    x: 80,
    y: 72,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    thrust: false
  };
}

export function spawnAsteroid(size = 3, x, y) {
  const rad = size === 3 ? 10 : size === 2 ? 6 : 3.5;
  const speed = (4 - size) * 12 + Math.random() * 8;
  const angle = Math.random() * Math.PI * 2;

  let spawnX = x !== undefined ? x : (Math.random() < 0.5 ? 5 : 155);
  let spawnY = y !== undefined ? y : Math.random() * 144;

  return {
    x: spawnX,
    y: spawnY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    radius: rad
  };
}

export function wrapPos(pos, max) {
  if (pos < 0) return pos + max;
  if (pos >= max) return pos - max;
  return pos;
}

export function distSq(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}
