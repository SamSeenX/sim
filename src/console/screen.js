const LOGICAL_W = 160;
const LOGICAL_H = 144;
const PIXEL_GAP = 1;

let canvas, ctx, pixelSize;

export function initScreen() {
  canvas = document.getElementById('pv-canvas');
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  recalcScale();
  window.addEventListener('resize', recalcScale);
  clearScreen();
}

function recalcScale() {
  const bezel = document.querySelector('.pv-screen-wrapper');
  if (!bezel) return;
  const bw = bezel.clientWidth;
  const bh = bezel.clientHeight;
  pixelSize = Math.floor(Math.min(bw / LOGICAL_W, bh / LOGICAL_H));
  if (pixelSize < 1) pixelSize = 1;
  const physW = LOGICAL_W * (pixelSize + PIXEL_GAP);
  const physH = LOGICAL_H * (pixelSize + PIXEL_GAP);
  canvas.width = physW;
  canvas.height = physH;
  canvas.style.width  = physW + 'px';
  canvas.style.height = physH + 'px';
}

export function drawPixel(lx, ly, color) {
  ctx.fillStyle = color;
  const px = lx * (pixelSize + PIXEL_GAP);
  const py = ly * (pixelSize + PIXEL_GAP);
  ctx.fillRect(px, py, pixelSize, pixelSize);
}

export function clearScreen() {
  const style = getComputedStyle(document.documentElement);
  const gap   = style.getPropertyValue('--screen-gap').trim() || '#0d0f0c';
  ctx.fillStyle = gap;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawRect(lx, ly, lw, lh, color) {
  for (let y = ly; y < ly + lh; y++) {
    for (let x = lx; x < lx + lw; x++) {
      drawPixel(x, y, color);
    }
  }
}

export function drawSprite(sprite, lx, ly) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const c = sprite[row][col];
      if (c) drawPixel(lx + col, ly + row, c);
    }
  }
}

export function drawText(text, lx, ly, color) {
  let cx = lx;
  for (const ch of text.toUpperCase()) {
    const glyph = FONT[ch];
    if (glyph) {
      for (let row = 0; row < glyph.length; row++) {
        for (let col = 0; col < glyph[row].length; col++) {
          if (glyph[row][col]) drawPixel(cx + col, ly + row, color);
        }
      }
      cx += glyph[0].length + 1;
    } else {
      cx += 4;
    }
  }
}

export function getCanvas() { return canvas; }
export function getCtx()    { return ctx; }
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
