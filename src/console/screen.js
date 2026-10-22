const LOGICAL_W = 160;
const LOGICAL_H = 144;
const PIXEL_SCALE = 4;
const GAP_SIZE = 2;
const CELL_SIZE = PIXEL_SCALE + GAP_SIZE; // 6px per logical pixel

let displayCanvas, displayCtx;
// 160 x 144 typed array holding direct shade indices: 0, 1, 2, or 3
const vram = new Uint8Array(LOGICAL_W * LOGICAL_H);

export function initScreen() {
  displayCanvas = document.getElementById('pv-canvas');
  displayCanvas.width = LOGICAL_W * CELL_SIZE;
  displayCanvas.height = LOGICAL_H * CELL_SIZE;
  displayCtx = displayCanvas.getContext('2d', { alpha: false });
  displayCtx.imageSmoothingEnabled = false;

  clearScreen();
}

export function drawPixel(lx, ly, shade = 3) {
  if (lx < 0 || lx >= LOGICAL_W || ly < 0 || ly >= LOGICAL_H) return;
  const s = typeof shade === 'number' ? shade : 3;
  vram[ly * LOGICAL_W + lx] = Math.max(0, Math.min(3, s));
}

export function clearScreen() {
  vram.fill(0);
  blitToDisplay();
}

export function drawRect(lx, ly, lw, lh, shade = 3) {
  const s = typeof shade === 'number' ? shade : 3;
  const val = Math.max(0, Math.min(3, s));
  const x0 = Math.max(0, Math.min(LOGICAL_W, lx));
  const x1 = Math.max(0, Math.min(LOGICAL_W, lx + lw));
  const y0 = Math.max(0, Math.min(LOGICAL_H, ly));
  const y1 = Math.max(0, Math.min(LOGICAL_H, ly + lh));

  for (let y = y0; y < y1; y++) {
    const rowOffset = y * LOGICAL_W;
    for (let x = x0; x < x1; x++) {
      vram[rowOffset + x] = val;
    }
  }
}

export function drawSprite(sprite, lx, ly) {
  for (let row = 0; row < sprite.length; row++) {
    const py = ly + row;
    if (py < 0 || py >= LOGICAL_H) continue;
    const rowOffset = py * LOGICAL_W;
    const spRow = sprite[row];
    for (let col = 0; col < spRow.length; col++) {
      const px = lx + col;
      if (px < 0 || px >= LOGICAL_W) continue;
      const val = spRow[col];
      if (val !== '' && val !== null && val !== undefined) {
        const s = typeof val === 'number' ? val : 3;
        vram[rowOffset + px] = Math.max(0, Math.min(3, s));
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

function parseHex(hex) {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16)
  ];
}

export function blitToDisplay() {
  if (!displayCtx || !displayCanvas) return;

  const style = getComputedStyle(document.documentElement);
  const rawShades = [
    style.getPropertyValue('--lcd-0').trim() || '#9bbc0f',
    style.getPropertyValue('--lcd-1').trim() || '#8bac0f',
    style.getPropertyValue('--lcd-2').trim() || '#306230',
    style.getPropertyValue('--lcd-3').trim() || '#0f380f',
  ];
  const rawGap = style.getPropertyValue('--lcd-gap').trim() || '#85a50e';

  const shades = rawShades.map(parseHex);
  const gap = parseHex(rawGap);

  const dispW = LOGICAL_W * CELL_SIZE; // 960
  const dispH = LOGICAL_H * CELL_SIZE; // 864
  const imgData = displayCtx.createImageData(dispW, dispH);
  const d32 = new Uint32Array(imgData.data.buffer);

  const gapU32 = (255 << 24) | (gap[2] << 16) | (gap[1] << 8) | gap[0];
  const shadesU32 = shades.map(s => (255 << 24) | (s[2] << 16) | (s[1] << 8) | s[0]);

  // Fill background with gap channel color
  d32.fill(gapU32);

  // Blit 4x4 pixel blocks leaving 2px gap between pixels
  for (let ly = 0; ly < LOGICAL_H; ly++) {
    const vramRow = ly * LOGICAL_W;
    const dispRowStart = ly * CELL_SIZE * dispW;

    for (let lx = 0; lx < LOGICAL_W; lx++) {
      const shadeVal = vram[vramRow + lx];
      const colorU32 = shadesU32[shadeVal];
      const pxOffset = dispRowStart + lx * CELL_SIZE;

      // 4x4 active LCD pixel block
      for (let dy = 0; dy < PIXEL_SCALE; dy++) {
        const lineOffset = pxOffset + dy * dispW;
        d32[lineOffset]     = colorU32;
        d32[lineOffset + 1] = colorU32;
        d32[lineOffset + 2] = colorU32;
        d32[lineOffset + 3] = colorU32;
      }
    }
  }

  displayCtx.putImageData(imgData, 0, 0);
}

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
