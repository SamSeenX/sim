export const TILE_SIZE = 12;

export const W_EMPTY  = 0;
export const W_WALL   = 1;
export const W_FLOOR  = 2;
export const W_TARGET = 3;
export const W_BOX    = 4;
export const W_BOX_ON = 5;

// Handcrafted classic warehouse levels (9 rows x 11 cols)
export const LEVELS = [
  // Level 1: Beginner
  [
    "  #####    ",
    "###   #    ",
    "# $ # ##   ",
    "# #  . #   ",
    "#    # #   ",
    "## #.. #   ",
    " #   $##   ",
    " #  @ #    ",
    " ######    "
  ],
  // Level 2: Four Corners
  [
    " #####     ",
    " #   #     ",
    " #$# #     ",
    "### #######",
    "#  $  ..  #",
    "# #$### # #",
    "#    @  # #",
    "####### # #",
    "      #####"
  ],
  // Level 3: Corridor
  [
    "  ######   ",
    "  # .. #   ",
    "###    ### ",
    "#  $  $  # ",
    "# ##  ## # ",
    "#   @    # ",
    "########## ",
    "           ",
    "           "
  ]
];

export function parseLevel(idx) {
  const raw = LEVELS[idx % LEVELS.length];
  const grid = [];
  let player = { r: 0, c: 0 };
  let targets = 0;

  for (let r = 0; r < raw.length; r++) {
    const row = [];
    const line = raw[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '#') row.push(W_WALL);
      else if (ch === '.') { row.push(W_TARGET); targets++; }
      else if (ch === '$') row.push(W_BOX);
      else if (ch === '*') { row.push(W_BOX_ON); targets++; }
      else if (ch === '@') { row.push(W_FLOOR); player = { r, c }; }
      else if (ch === '+') { row.push(W_TARGET); player = { r, c }; targets++; }
      else if (ch === ' ') row.push(W_EMPTY);
      else row.push(W_FLOOR);
    }
    grid.push(row);
  }

  return { grid, player, targets };
}
