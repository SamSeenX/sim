export const GRID_SIZE = 12;
export const NUM_ROWS = 11;
export const NUM_COLS = 13;
export const START_ROW = 10;
export const START_COL = 6;

export const LANES = [
  { type: 'goal', speed: 0 },                        // Row 0: Lily Pads
  { type: 'river', speed: 28, itemW: 32, gap: 48 },   // Row 1: Fast Log
  { type: 'river', speed: -20, itemW: 24, gap: 40 },  // Row 2: Medium Log
  { type: 'river', speed: 24, itemW: 36, gap: 52 },   // Row 3: Long Log
  { type: 'grass', speed: 0 },                       // Row 4: Median Safe Zone
  { type: 'road', speed: -32, itemW: 16, gap: 44 },   // Row 5: Fast Sedan
  { type: 'road', speed: 22, itemW: 24, gap: 50 },    // Row 6: Truck
  { type: 'road', speed: -26, itemW: 18, gap: 46 },   // Row 7: Sports Car
  { type: 'road', speed: 18, itemW: 22, gap: 48 },    // Row 8: Van
  { type: 'grass', speed: 0 },                       // Row 9: Sidewalk
  { type: 'grass', speed: 0 }                        // Row 10: Start Sidewalk
];

export function createLanes() {
  return LANES.map(l => ({
    ...l,
    offset: Math.random() * 80
  }));
}
