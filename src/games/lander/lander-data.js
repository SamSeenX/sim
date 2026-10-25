export const GRAVITY = 15;
export const THRUST = 38;
export const ROT_SPEED = 2.4;
export const SAFE_VY = 18;
export const SAFE_VX = 12;
export const SAFE_ANGLE = 0.35; // radians from vertical

export const TERRAIN_POINTS = [
  { x: 0,   y: 110 },
  { x: 20,  y: 130 },
  { x: 40,  y: 130 }, // Pad 1 (3x)
  { x: 55,  y: 95  },
  { x: 75,  y: 120 },
  { x: 95,  y: 120 }, // Pad 2 (2x)
  { x: 115, y: 80  },
  { x: 130, y: 125 },
  { x: 150, y: 125 }, // Pad 3 (5x small)
  { x: 160, y: 100 }
];

export const PADS = [
  { x0: 20,  x1: 40,  y: 130, mult: 3 },
  { x0: 75,  x1: 95,  y: 120, mult: 2 },
  { x0: 130, x1: 150, y: 125, mult: 5 }
];

export function createLander() {
  return {
    x: 25,
    y: 20,
    vx: 12,
    vy: 0,
    angle: 0, // 0 = straight up
    fuel: 450,
    thrust: false
  };
}
