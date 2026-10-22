import { COLS, ROWS, MAZE_MAP, DIRS } from './maze-data.js';

export function createGhosts() {
  return [
    { x: 8, y: 6, dir: { x: 0, y: -1 }, speed: 4.2, frightened: 0, shade: 3, id: 'blinky' },
    { x: 8, y: 7, dir: { x: 0, y: -1 }, speed: 3.8, frightened: 0, shade: 2, id: 'pinky' }
  ];
}

export function updateGhosts(ghosts, pac, dt) {
  ghosts.forEach(g => {
    if (g.frightened > 0) g.frightened -= dt;

    // Movement
    g.x += g.dir.x * g.speed * dt;
    g.y += g.dir.y * g.speed * dt;

    // Grid snapping check at cell centers
    const targetCol = Math.round(g.x);
    const targetRow = Math.round(g.y);
    const distToCenter = Math.hypot(g.x - targetCol, g.y - targetRow);

    if (distToCenter < 0.15) {
      g.x = targetCol;
      g.y = targetRow;

      // Choose next valid direction (cannot 180 reverse unless blocked)
      const validDirs = [];
      for (const key of ['up', 'down', 'left', 'right']) {
        const d = DIRS[key];
        // Don't reverse directly
        if (d.x === -g.dir.x && d.y === -g.dir.y) continue;
        const nc = (targetCol + d.x + COLS) % COLS;
        const nr = (targetRow + d.y + ROWS) % ROWS;
        if (MAZE_MAP[nr] && MAZE_MAP[nr][nc] !== 1) {
          validDirs.push(d);
        }
      }

      if (validDirs.length > 0) {
        if (g.frightened > 0) {
          // Random direction when scared
          g.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
        } else {
          // Target player: sort by Euclidean distance to pac
          validDirs.sort((a, b) => {
            const da = Math.hypot(targetCol + a.x - pac.x, targetRow + a.y - pac.y);
            const db = Math.hypot(targetCol + b.x - pac.x, targetRow + b.y - pac.y);
            return da - db;
          });
          // 80% chase, 20% random for organic gameplay
          g.dir = Math.random() < 0.8 ? validDirs[0] : validDirs[Math.floor(Math.random() * validDirs.length)];
        }
      } else {
        // Reverse if completely blocked
        g.dir = { x: -g.dir.x, y: -g.dir.y };
      }
    }

    // Warp tunnel
    if (g.x < 0) g.x = COLS - 1;
    if (g.x >= COLS) g.x = 0;
  });
}
