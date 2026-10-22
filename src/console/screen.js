import { FONT } from './font.js';

const LOGICAL_W = 160;
const LOGICAL_H = 144;
const GAP_PX = 2; // 2px gap between pixels

let displayCanvas, displayCtx;
let pixelW = 1;
let pixelH = 1;
let cellW = 3;
let cellH = 3;

// 160 x 144 typed array holding direct shade indices: 0, 1, 2, or 3
const vram = new Uint8Array(LOGICAL_W * LOGICAL_H);

export function initScreen() {
  displayCanvas = document.getElementById('pv-canvas');
  displayCtx = displayCanvas.getContext('2d', { alpha: false });
  displayCtx.imageSmoothingEnabled = false;

  recalcDimensions();
  window.addEventListener('resize', recalcDimensions);

  clearScreen();
}

export function recalcDimensions() {
  const wrapper = document.querySelector('.pv-screen-wrapper');
  if (!wrapper || !displayCanvas) return;

  const availableW = wrapper.clientWidth;
  if (!availableW) return;

  // Direct calculation as requested:
  // cell width = availableW / 160
  // pixel width = (availableW / 160) - 2px gap
  const stepW = availableW / LOGICAL_W;
  const pw = Math.max(1, stepW - GAP_PX);
  const ph = pw;
  const stepH = pw + GAP_PX;

  pixelW = pw;
  pixelH = ph;
  cellW = stepW;
  cellH = stepH;

  const totalW = Math.round(stepW * LOGICAL_W);
  const totalH = Math.round(stepH * LOGICAL_H);

  displayCanvas.width = totalW;
  displayCanvas.height = totalH;
  displayCanvas.style.width = `${totalW}px`;
  displayCanvas.style.height = `${totalH}px`;

  displayCtx.imageSmoothingEnabled = false;
  blitToDisplay();
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

export function blitToDisplay() {
  if (!displayCtx || !displayCanvas) return;

  const style = getComputedStyle(document.documentElement);
  const shades = [
    style.getPropertyValue('--lcd-0').trim() || '#9bbc0f',
    style.getPropertyValue('--lcd-1').trim() || '#8bac0f',
    style.getPropertyValue('--lcd-2').trim() || '#306230',
    style.getPropertyValue('--lcd-3').trim() || '#0f380f',
  ];
  const gap = style.getPropertyValue('--lcd-gap').trim() || '#85a50e';

  displayCtx.fillStyle = gap;
  displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);

  for (let s = 0; s < 4; s++) {
    displayCtx.fillStyle = shades[s];
    displayCtx.beginPath();

    for (let ly = 0; ly < LOGICAL_H; ly++) {
      const vramRow = ly * LOGICAL_W;
      const yPos = Math.round(ly * cellH);

      for (let lx = 0; lx < LOGICAL_W; lx++) {
        if (vram[vramRow + lx] === s) {
          const xPos = Math.round(lx * cellW);
          displayCtx.rect(xPos, yPos, Math.round(pixelW), Math.round(pixelH));
        }
      }
    }

    displayCtx.fill();
  }
}

export function getLogicalW() { return LOGICAL_W; }
export function getLogicalH() { return LOGICAL_H; }
