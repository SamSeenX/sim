export const PIECES = [
  { shape: [[1,1,1,1]],                        color: '#00cccc' },
  { shape: [[1,1],[1,1]],                       color: '#cccc00' },
  { shape: [[0,1,1],[1,1,0]],                   color: '#00cc00' },
  { shape: [[1,1,0],[0,1,1]],                   color: '#cc0000' },
  { shape: [[1,0,0],[1,1,1]],                   color: '#cc6600' },
  { shape: [[0,0,1],[1,1,1]],                   color: '#0000cc' },
  { shape: [[0,1,0],[1,1,1]],                   color: '#cc00cc' },
];

export const COLS    = 10;
export const ROWS    = 16;
export const CELL    = 8;
export const FIELD_X = 14;
export const FIELD_Y = 8;
export const HUD_X   = FIELD_X + COLS * CELL + 12;
