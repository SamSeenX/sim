export const TILE = 16;

export const LEVELS = [
  {
    width: 30,
    tiles: [
      ...[...Array(10)].map((_,i) => [i,    7, 1]),
      ...[...Array(6)] .map((_,i) => [i+12, 7, 1]),
      ...[...Array(8)] .map((_,i) => [i+21, 7, 1]),
      [4,5,1],[5,5,1],[6,5,1],
      [14,5,1],[15,5,1],
      [22,5,1],[23,5,1],[24,5,1],
      [8,6,3],[19,6,3],[27,6,3],
    ],
    enemies: [
      { col: 4, row: 4, patrolLeft: 3, patrolRight: 7 },
      { col: 15, row: 4, patrolLeft: 13, patrolRight: 17 },
    ],
    fish: [
      { col: 5, row: 4 }, { col: 14, row: 4 },
      { col: 22, row: 4 }, { col: 25, row: 6 },
    ],
    playerStart: { col: 1, row: 6 },
  },
];
