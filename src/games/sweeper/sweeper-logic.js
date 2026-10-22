import { COLS, ROWS, TOTAL_MINES, STATE_COVERED, STATE_UNCOVERED } from './sweeper-data.js';

export function generateMines(grid, safeC, safeR) {
  let placed = 0;
  while (placed < TOTAL_MINES) {
    const c = Math.floor(Math.random() * COLS);
    const r = Math.floor(Math.random() * ROWS);
    if ((c === safeC && r === safeR) || grid[r][c].mine) continue;
    if (Math.abs(c - safeC) <= 1 && Math.abs(r - safeR) <= 1 && placed < 6) continue;

    grid[r][c].mine = true;
    placed++;
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine) {
            count++;
          }
        }
      }
      grid[r][c].count = count;
    }
  }
}

export function floodReveal(grid, c, r) {
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
  const cell = grid[r][c];
  if (cell.state !== STATE_COVERED || cell.mine) return;

  cell.state = STATE_UNCOVERED;
  if (cell.count === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) floodReveal(grid, c + dc, r + dr);
      }
    }
  }
}
