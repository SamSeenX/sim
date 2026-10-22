import { LANES } from './drift-data.js';

export function updateTraffic(s, dt) {
  // Spawn traffic timer
  s.spawnTimer -= dt;
  if (s.spawnTimer <= 0) {
    s.spawnTimer = Math.max(0.7, 1.6 - (s.score * 0.0004));
    spawnVehicle(s);
  }

  // Update existing traffic positions
  for (let i = s.traffic.length - 1; i >= 0; i--) {
    const v = s.traffic[i];
    // Movement relative to player's current speed
    const relativeSpeed = s.speed - v.speed;
    v.y += relativeSpeed * dt;

    // Remove if far off screen
    if (v.y > 160 || v.y < -50) {
      s.traffic.splice(i, 1);
    }
  }
}

function spawnVehicle(s) {
  const laneIdx = Math.floor(Math.random() * LANES.length);
  const laneX = LANES[laneIdx];

  // Don't spawn if another vehicle is already near top of this lane
  const tooClose = s.traffic.some(v => Math.abs(v.x - laneX) < 16 && v.y < 30);
  if (tooClose) return;

  const isOil = Math.random() < 0.2;
  if (isOil) {
    s.traffic.push({
      type: 'oil',
      x: laneX + 1,
      y: -15,
      speed: 0,
      w: 10,
      h: 6
    });
  } else {
    // Slower vehicle moving down
    s.traffic.push({
      type: 'car',
      x: laneX,
      y: -25,
      speed: 35 + Math.random() * 20,
      w: 12,
      h: 14
    });
  }
}
