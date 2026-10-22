const LOGICAL_W = 160;
const LOGICAL_H = 144;
const PIXEL_SCALE = 4;
const GAP_SIZE = 2;
const CELL_SIZE = PIXEL_SCALE + GAP_SIZE; // 6px per logical pixel

let buffer, bufferCtx;
let displayCanvas, displayCtx;

export function initScreen() {
  displayCanvas = document.getElementById('pv-canvas');
  displayCanvas.width = LOGICAL_W * CELL_SIZE;
  displayCanvas.height = LOGICAL_H * CELL_SIZE;
  displayCtx = displayCanvas.getContext('2d', { alpha: false });
  displayCtx.imageSmoothingEnabled = false;

  buffer = document.createElement('canvas');
  buffer.width = LOGICAL_W;
  buffer.height = LOGICAL_H;
  bufferCtx = buffer.getContext('2d', { willReadFrequently: true });
  bufferCtx.imageSmoothingEnabled = false;

  clearScreen();
}

export function drawPixel(lx, ly, shade = 3) {
  if (lx < 0 || lx >= LOGICAL_W || ly < 0 || ly >= LOGICAL_H) return;
  bufferCtx.fillStyle = typeof shade === 'number' ? `index:${shade}` : shade;
  bufferCtx.fillRect(lx, ly, 1, 1);
}

export function clearScreen() {
  bufferCtx.fillStyle = 'index:0';
  bufferCtx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  blitToDisplay();
}

export function drawRect(lx, ly, lw, lh, shade = 3) {
  bufferCtx.fillStyle = typeof shade === 'number' ? `index:${shade}` : shade;
  bufferCtx.fillRect(lx, ly, lw, lh);
}

export function drawSprite(sprite, lx, ly) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const val = sprite[row][col];
      if (val !== '' && val !== null && val !== undefined) {
        drawPixel(lx + col, ly + row, val);
      }
    }
  }
}

export function drawText(text, lx, ly, shade = 3) {
  let cx = lx;
  for (const ch of text.toUpperCase()) {
    const glyph = FONT[ch];
    if (glyph) {
      for (let row = 0; row < glyph.length; row++) {
        for (let col = 0; col < glyph[row].length; col++) {
          if (glyph[row][col]) drawPixel(cx + col, ly + row, shade);
        }
      }
      cx += glyph[0].length + 1;
    } else {
      cx += 4;
    }
  }
}

export function blitToDisplay() {
  if (!displayCtx || !displayCanvas) return;

  const style = getComputedStyle(document.documentElement);
  const shades = [
    style.getPropertyValue('--lcd-0').trim() || '#9bbc0f',
    style.getPropertyValue('--lcd-1').trim() || '#8bac0f',
    style.getPropertyValue('--lcd-2').trim() || '#306230',
    style.getPropertyValue('--lcd-3').trim() || '#0f380f',
  ];
  const gapColor = style.getPropertyValue('--lcd-gap').trim() || '#85a50e';

  // Fill entire display with 2px gap background
  displayCtx.fillStyle = gapColor;
  displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);

  const imgData = bufferCtx.getImageData(0, 0, LOGICAL_W, LOGICAL_H).data;

  // Render discrete pixel blocks leaving ~2px gap between pixels
  for (let y = 0; y < LOGICAL_H; y++) {
    const py = y * CELL_SIZE;
    for (let x = 0; x < LOGICAL_W; x++) {
      const idx = (y * LOGICAL_W + x) * 4;
      const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
      
      // Map arbitrary colors or luminosity to authentic 4-shade monochromatic palette
      let shadeIndex = 0;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (lum < 0.25) shadeIndex = 3;
      else if (lum < 0.55) shadeIndex = 2;
      else if (lum < 0.85) shadeIndex = 1;
      else shadeIndex = 0;

      displayCtx.fillStyle = shades[shadeIndex];
      displayCtx.fillRect(x * CELL_SIZE, py, PIXEL_SCALE, PIXEL_SCALE);
    }
  }
}

export function getCanvas() { return buffer; }
export function getCtx()    { return bufferCtx; }
export function getLogicalW() { return LOGICAL_W; }
export function getLogicalH() { return LOGICAL_H; }

const FONT = {
  'A':[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'B':[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
  'C':[[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  'D':[[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
  'E':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  'F':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  'G':[[0,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[0,1,1,1]],
  'H':[[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'I':[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'J':[[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,1]],
  'K':[[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1]],
  'L':[[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  'M':[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N':[[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
  'O':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'P':[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  'Q':[[0,1,1,0],[1,0,0,1],[1,0,1,1],[1,0,0,1],[0,1,1,1]],
  'R':[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
  'S':[[0,1,1,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  'T':[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U':[[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'V':[[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,1,0,1,0],[0,0,1,0,0]],
  'W':[[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X':[[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1]],
  'Y':[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'Z':[[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
  '0':[[0,1,1,0],[1,0,0,1],[1,0,1,1],[1,1,0,1],[0,1,1,0]],
  '1':[[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2':[[1,1,1,0],[0,0,0,1],[0,1,1,0],[1,0,0,0],[1,1,1,1]],
  '3':[[1,1,1,0],[0,0,0,1],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  '4':[[1,0,0,1],[1,0,0,1],[1,1,1,1],[0,0,0,1],[0,0,0,1]],
  '5':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[0,0,0,1],[1,1,1,0]],
  '6':[[0,1,1,0],[1,0,0,0],[1,1,1,0],[1,0,0,1],[0,1,1,0]],
  '7':[[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,0,0]],
  '8':[[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0]],
  '9':[[0,1,1,0],[1,0,0,1],[0,1,1,1],[0,0,0,1],[0,1,1,0]],
  ':':[[0],[1],[0],[1],[0]],
  '!':[[1],[1],[1],[0],[1]],
  '-':[[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  '>':[[1,0],[0,1],[1,0]],
  ' ':[[0,0,0]],
};
