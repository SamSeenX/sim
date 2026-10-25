import { FONT } from './font.js';

const LOGICAL_W = 160;
const LOGICAL_H = 144;

let displayCanvas, displayCtx;
let imgData = null;
let buf32 = null;
let cachedPalette = null;
let cachedTheme = null;

// 160 x 144 typed array holding direct shade indices: 0, 1, 2, or 3
const vram = new Uint8Array(LOGICAL_W * LOGICAL_H);

export function initScreen() {
  displayCanvas = document.getElementById('pv-canvas');
  displayCanvas.width = LOGICAL_W;
  displayCanvas.height = LOGICAL_H;

  displayCtx = displayCanvas.getContext('2d', { alpha: false });
  displayCtx.imageSmoothingEnabled = false;

  imgData = displayCtx.createImageData(LOGICAL_W, LOGICAL_H);
  buf32 = new Uint32Array(imgData.data.buffer);

  cachedTheme = null;
  cachedPalette = null;

  window.addEventListener('resize', recalcDimensions);
  clearScreen();
}

export function recalcDimensions() {
  if (!displayCanvas || !displayCtx) return;
  displayCanvas.width = LOGICAL_W;
  displayCanvas.height = LOGICAL_H;
  displayCtx.imageSmoothingEnabled = false;
  blitToDisplay();
}

function parsePalette() {
  const theme = document.documentElement.getAttribute('data-theme') || 'default';
  if (cachedPalette && cachedTheme === theme) {
    return cachedPalette;
  }

  const style = getComputedStyle(document.documentElement);
  const hexes = [
    style.getPropertyValue('--lcd-0').trim() || '#9bbc0f',
    style.getPropertyValue('--lcd-1').trim() || '#8bac0f',
    style.getPropertyValue('--lcd-2').trim() || '#306230',
    style.getPropertyValue('--lcd-3').trim() || '#0f380f',
  ];

  cachedPalette = new Uint32Array(4);
  for (let i = 0; i < 4; i++) {
    const hex = hexes[i].replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    // Little-endian Uint32 format (0xAABBGGRR)
    cachedPalette[i] = ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }
  cachedTheme = theme;
  return cachedPalette;
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
  if (!displayCtx || !buf32) return;

  const palette = parsePalette();
  const total = LOGICAL_W * LOGICAL_H;

  for (let i = 0; i < total; i++) {
    buf32[i] = palette[vram[i]];
  }

  displayCtx.putImageData(imgData, 0, 0);
}

export function invalidatePalette() {
  cachedPalette = null;
  cachedTheme = null;
}

export function getLogicalW() { return LOGICAL_W; }
export function getLogicalH() { return LOGICAL_H; }
