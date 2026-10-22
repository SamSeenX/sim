export const COLS = 16;
export const ROWS = 14;
export const CELL = 8;
export const FIELD_X = 16;
export const FIELD_Y = 22;

export const DIRS = {
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 }
};

export const INITIAL_SNAKE = [
  { x: 7, y: 7 },
  { x: 6, y: 7 },
  { x: 5, y: 7 }
];

export const BASE_SPEED = 0.16; // seconds per step
export const MIN_SPEED  = 0.07;
