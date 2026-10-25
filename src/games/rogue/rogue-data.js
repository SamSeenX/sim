export const TILE_SIZE = 12;
export const COLS = 13;
export const ROWS = 10;
export const OFFSET_X = 2;
export const OFFSET_Y = 16;

export const T_EMPTY = 0;
export const T_WALL = 1;
export const T_DOOR = 2;
export const T_CHEST = 3;
export const T_KEY = 4;

export function createRoom(roomIdx) {
  const map = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
        // Doors in center of walls
        if ((r === 0 && c === 6) || (r === ROWS - 1 && c === 6) ||
            (c === 0 && r === 5) || (c === COLS - 1 && r === 5)) {
          row.push(T_DOOR);
        } else {
          row.push(T_WALL);
        }
      } else {
        row.push(T_EMPTY);
      }
    }
    map.push(row);
  }

  // Add room props based on roomIdx
  if (roomIdx === 0) {
    map[3][3] = T_KEY;
  } else if (roomIdx === 1) {
    map[2][6] = T_CHEST;
    map[7][3] = T_KEY;
  } else if (roomIdx === 2) {
    map[5][6] = T_CHEST;
  }

  const enemies = [];
  const enemyCount = 1 + roomIdx;
  for (let i = 0; i < enemyCount; i++) {
    enemies.push({
      x: (3 + i * 3) * T_SIZE(),
      y: (3 + (i % 2) * 3) * T_SIZE(),
      type: i % 2 === 0 ? 'bat' : 'skel',
      hp: i % 2 === 0 ? 1 : 2,
      timer: 0
    });
  }

  return { map, enemies };
}

export function T_SIZE() { return TILE_SIZE; }
