# PixelVault Console — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use react-native-hifi:subagent-driven-development (recommended) or react-native-hifi:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based retro handheld console simulator (PixelVault) with 4 shell themes, a 160×144 pixel-grid screen, keyboard + on-screen touch controls with haptics, and three original games (Bouncer, BlockFall, Rooftop Cat).

**Architecture:** Vite + Vanilla JS (ES6 modules). A `console/` layer handles shell rendering, screen scaling, input, and theming. A `games/` layer contains each game behind a common `GameBase` interface. An `EventBus` decouples all modules. All game rendering goes through a single `<canvas>` element using the pixel-gap renderer in `screen.js`.

**Tech Stack:** Vite 5, Vanilla JS ES6 Modules, Plain CSS custom properties, HTML5 Canvas, Web Vibration API, localStorage.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `public/manifest.webmanifest`
- Create: `brain.md`

- [ ] **Step 1: Initialise the Vite project**

```bash
cd /Users/samseen/DEV/samseen/sim
npm create vite@latest . -- --template vanilla
```

Expected output: Files created, prompt to install dependencies.

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Replace `index.html` with project root**

```html
<!DOCTYPE html>
<html lang="en" data-theme="ironside">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#2a2a2d" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <title>PixelVault</title>
    <link rel="stylesheet" href="/src/styles/reset.css" />
    <link rel="stylesheet" href="/src/styles/tokens.css" />
    <link rel="stylesheet" href="/src/styles/shell.css" />
    <link rel="stylesheet" href="/src/styles/screen.css" />
    <link rel="stylesheet" href="/src/styles/controls.css" />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

- [ ] **Step 5: Create `public/manifest.webmanifest`**

```json
{
  "name": "PixelVault",
  "short_name": "PixelVault",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#2a2a2d",
  "theme_color": "#2a2a2d",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 6: Create placeholder icons (1×1 px PNGs)**

```bash
cd /Users/samseen/DEV/samseen/sim
node -e "
const { createCanvas } = require('canvas');
" 2>/dev/null || true
# Use a simpler approach — copy any 192/512 placeholder PNGs or create via canvas in main later.
# For now create empty placeholder files so the manifest doesn't 404:
touch public/icon-192.png public/icon-512.png public/favicon.ico
```

- [ ] **Step 7: Create stub `src/main.js`**

```js
import './styles/reset.css';
import { initShell } from './console/shell.js';
import { initStore } from './core/store.js';
import { initErrorBoundary } from './core/error-boundary.js';

initErrorBoundary();
const store = initStore();
initShell(store);
```

- [ ] **Step 8: Verify dev server starts**

```bash
cd /Users/samseen/DEV/samseen/sim
npm run dev
```

Expected: `http://localhost:5173` — blank page, no console errors.

- [ ] **Step 9: Create `brain.md`**

```markdown
# PixelVault — Brain

## Stack
Vite + Vanilla JS ES6 + Plain CSS. No frameworks. No external UI libs. No game engines.

## 200-line rule
Every .js and .css file must stay under 200 lines. Split proactively at ~180.

## Architecture
- core/       — event-bus, store, error-boundary
- console/    — shell, screen, controls, haptics, theme-switcher
- games/      — game-base, menu, bouncer/, blockfall/, rooftop-cat/
- styles/     — tokens, reset, shell, screen, controls, main

## Changelog
- 2026-10-22: Project scaffolded
```

- [ ] **Step 10: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git init
git add .
git commit -m "feat: scaffold PixelVault Vite project"
```

---

## Task 2: Core Modules (EventBus, Store, ErrorBoundary)

**Files:**
- Create: `src/core/event-bus.js`
- Create: `src/core/store.js`
- Create: `src/core/error-boundary.js`

- [ ] **Step 1: Create `src/core/event-bus.js`**

```js
// Lightweight pub/sub. Max 200 lines.
const listeners = {};

export function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
}

export function off(event, fn) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(f => f !== fn);
}

export function emit(event, data) {
  if (!listeners[event]) return;
  listeners[event].forEach(fn => fn(data));
}
```

- [ ] **Step 2: Create `src/core/store.js`**

```js
import { emit } from './event-bus.js';

const DEFAULTS = {
  theme: 'ironside',
  scores: { bouncer: 0, blockfall: 0, rooftop: 0 },
  activeGame: null,
};

let state = { ...DEFAULTS };

function load() {
  try {
    const t = localStorage.getItem('pv_theme');
    if (t) state.theme = t;
    const s = localStorage.getItem('pv_scores');
    if (s) state.scores = JSON.parse(s);
  } catch (_) { /* corrupt storage — use defaults */ }
}

function save() {
  try {
    localStorage.setItem('pv_theme', state.theme);
    localStorage.setItem('pv_scores', JSON.stringify(state.scores));
  } catch (_) { /* storage quota exceeded — silent fail */ }
}

export function initStore() {
  load();
  return {
    getTheme: () => state.theme,
    setTheme(t) {
      state.theme = t;
      save();
      emit('theme:change', t);
    },
    getScores: () => ({ ...state.scores }),
    setScore(game, score) {
      if (score > (state.scores[game] || 0)) {
        state.scores[game] = score;
        save();
        emit('score:update', { game, score });
      }
    },
    getActiveGame: () => state.activeGame,
    setActiveGame(name) {
      state.activeGame = name;
      emit('game:change', name);
    },
  };
}
```

- [ ] **Step 3: Create `src/core/error-boundary.js`**

```js
export function initErrorBoundary() {
  window.addEventListener('error', e => {
    console.error('[PixelVault] Unhandled error:', e.message);
    showErrorToast(e.message);
  });
  window.addEventListener('unhandledrejection', e => {
    console.error('[PixelVault] Unhandled promise rejection:', e.reason);
    showErrorToast(String(e.reason));
  });
}

function showErrorToast(msg) {
  const existing = document.getElementById('pv-error-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'pv-error-toast';
  el.textContent = `Error: ${msg}`;
  el.style.cssText = `
    position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
    background:#c0152a;color:#fff;padding:8px 16px;border-radius:4px;
    font-family:monospace;font-size:12px;z-index:9999;max-width:90vw;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/core/
git commit -m "feat: add core event-bus, store, error-boundary"
```

---

## Task 3: CSS Tokens & Reset

**Files:**
- Create: `src/styles/reset.css`
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Create `src/styles/reset.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { height: 100%; -webkit-text-size-adjust: 100%; }
body { height: 100%; min-height: 100dvh; overscroll-behavior: none; }
img, canvas { display: block; }
button { cursor: pointer; border: none; background: none; font: inherit; }
```

- [ ] **Step 2: Create `src/styles/tokens.css`**

```css
/* ── Ironside (default) ─────────────────────────────────────────── */
[data-theme="ironside"] {
  --shell-bg:      #2a2a2d;
  --shell-shadow:  #111113;
  --bezel-bg:      #1a1a1c;
  --btn-primary:   #f0a500;
  --btn-secondary: #c88a00;
  --btn-text:      #1a0e00;
  --screen-bg:     #0d0f0c;
  --screen-px:     #8bac0f;   /* amber-green phosphor pixel */
  --screen-gap:    #0d0f0c;
  --body-bg:       #111113;
  --text:          #e0d8c0;
}
/* ── Phantom ────────────────────────────────────────────────────── */
[data-theme="phantom"] {
  --shell-bg:      #1c1c2e;
  --shell-shadow:  #0a0a14;
  --bezel-bg:      #0e0e1a;
  --btn-primary:   #00e5cc;
  --btn-secondary: #00b8a3;
  --btn-text:      #001a18;
  --screen-bg:     #0a0a14;
  --screen-px:     #00e5cc;
  --screen-gap:    #0a0a14;
  --body-bg:       #08080f;
  --text:          #c0f0ea;
}
/* ── Ivory ──────────────────────────────────────────────────────── */
[data-theme="ivory"] {
  --shell-bg:      #f0ece4;
  --shell-shadow:  #c8c4bc;
  --bezel-bg:      #d6d0c4;
  --btn-primary:   #c0152a;
  --btn-secondary: #960f20;
  --btn-text:      #fff5f5;
  --screen-bg:     #e8e4dc;
  --screen-px:     #1a1a14;
  --screen-gap:    #c8c4bc;
  --body-bg:       #e0dcd4;
  --text:          #1a1a14;
}
/* ── Midnight ───────────────────────────────────────────────────── */
[data-theme="midnight"] {
  --shell-bg:      #0d1b3e;
  --shell-shadow:  #060e20;
  --bezel-bg:      #091228;
  --btn-primary:   #ffe600;
  --btn-secondary: #ccb800;
  --btn-text:      #1a1600;
  --screen-bg:     #06101f;
  --screen-px:     #ffe600;
  --screen-gap:    #06101f;
  --body-bg:       #060c18;
  --text:          #e8e0a0;
}
/* ── Shared ─────────────────────────────────────────────────────── */
:root {
  --console-width-desk:  360px;
  --console-height-desk: 620px;
  --screen-width:        240px;   /* bezel inner display area */
  --screen-height:       216px;   /* 160×144 scaled ×1.5 */
  --radius-shell:        24px;
  --radius-screen:       8px;
  --font-ui:             'Courier New', Courier, monospace;
  --transition-theme:    background 0.2s ease, color 0.2s ease;
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/styles/reset.css src/styles/tokens.css
git commit -m "feat: add CSS tokens and reset for all 4 themes"
```

---

## Task 4: Console Shell (DOM Structure)

**Files:**
- Create: `src/console/shell.js`
- Create: `src/styles/shell.css`
- Create: `src/styles/main.css`

- [ ] **Step 1: Create `src/console/shell.js`**

```js
import { on } from '../core/event-bus.js';
import { initScreen } from './screen.js';
import { initControls } from './controls.js';
import { initThemeSwitcher } from './theme-switcher.js';

export function initShell(store) {
  const app = document.getElementById('app');
  app.innerHTML = buildShellHTML();
  document.documentElement.setAttribute('data-theme', store.getTheme());

  initScreen(store);
  initControls(store);
  initThemeSwitcher(store);

  on('theme:change', theme => {
    document.documentElement.setAttribute('data-theme', theme);
  });
}

function buildShellHTML() {
  return `
    <div class="pv-scene">
      <div class="pv-console">
        <div class="pv-brand">PixelVault</div>
        <div class="pv-screen-bezel">
          <div class="pv-screen-wrapper">
            <canvas id="pv-canvas" width="160" height="144"></canvas>
            <div class="pv-scanlines"></div>
          </div>
        </div>
        <div class="pv-controls-row">
          <div class="pv-dpad">
            <button class="pv-btn-dpad pv-dpad-up"   data-action="up"></button>
            <button class="pv-btn-dpad pv-dpad-left"  data-action="left"></button>
            <button class="pv-btn-dpad pv-dpad-center"></button>
            <button class="pv-btn-dpad pv-dpad-right" data-action="right"></button>
            <button class="pv-btn-dpad pv-dpad-down"  data-action="down"></button>
          </div>
          <div class="pv-sys-btns">
            <button class="pv-btn-sys" data-action="select">SEL</button>
            <button class="pv-btn-sys" data-action="start">STR</button>
          </div>
          <div class="pv-action-btns">
            <button class="pv-btn-action" data-action="b">B</button>
            <button class="pv-btn-action" data-action="a">A</button>
          </div>
        </div>
        <div class="pv-grille">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>
        <div class="pv-theme-dock" id="pv-theme-dock"></div>
      </div>
    </div>
  `;
}
```

- [ ] **Step 2: Create `src/styles/shell.css`**

```css
.pv-scene {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background: var(--body-bg);
  transition: var(--transition-theme);
  padding: 16px;
}

.pv-console {
  width: var(--console-width-desk);
  background: var(--shell-bg);
  border-radius: var(--radius-shell);
  box-shadow: 0 8px 32px var(--shell-shadow), 0 2px 4px var(--shell-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 24px 24px;
  gap: 16px;
  transition: var(--transition-theme);
  position: relative;
  user-select: none;
}

/* Brand label */
.pv-brand {
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.15em;
  color: var(--btn-primary);
  text-transform: none;
  align-self: flex-start;
  opacity: 0.8;
}

/* Controls row: d-pad | sys | action */
.pv-controls-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

/* D-pad */
.pv-dpad {
  display: grid;
  grid-template-areas:
    ". up ."
    "left center right"
    ". down .";
  grid-template-columns: 36px 36px 36px;
  grid-template-rows: 36px 36px 36px;
  gap: 2px;
}
.pv-dpad-up     { grid-area: up; }
.pv-dpad-left   { grid-area: left; }
.pv-dpad-center { grid-area: center; background: var(--shell-shadow) !important; }
.pv-dpad-right  { grid-area: right; }
.pv-dpad-down   { grid-area: down; }

.pv-btn-dpad {
  background: color-mix(in srgb, var(--shell-bg) 60%, var(--shell-shadow));
  border-radius: 4px;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.1s;
}
.pv-btn-dpad:active { background: var(--btn-primary); }

/* Action buttons (A/B) */
.pv-action-btns {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pv-btn-action {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--btn-primary);
  color: var(--btn-text);
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 3px 0 var(--btn-secondary);
  transition: transform 0.08s, box-shadow 0.08s;
}
.pv-btn-action:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--btn-secondary);
}

/* Select / Start */
.pv-sys-btns { display: flex; flex-direction: column; gap: 8px; align-items: center; }
.pv-btn-sys {
  background: color-mix(in srgb, var(--shell-bg) 40%, var(--shell-shadow));
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: 0.05em;
  border-radius: 10px;
  padding: 4px 10px;
  min-height: 24px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.1s;
}
.pv-btn-sys:active { background: var(--btn-primary); color: var(--btn-text); }

/* Speaker grille */
.pv-grille {
  display: flex;
  gap: 5px;
  align-self: flex-end;
  margin-top: -8px;
  opacity: 0.4;
}
.pv-grille span {
  width: 3px;
  height: 20px;
  background: var(--shell-shadow);
  border-radius: 2px;
}

/* Theme dock */
.pv-theme-dock {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding-top: 4px;
}

/* Mobile: console fills viewport */
@media (max-width: 480px) {
  .pv-scene { padding: 0; align-items: stretch; }
  .pv-console {
    width: 100%;
    min-height: 100dvh;
    border-radius: 0;
    padding: 12px 16px env(safe-area-inset-bottom, 16px);
    justify-content: space-between;
  }
}
```

- [ ] **Step 3: Create `src/styles/main.css`**

```css
html, body { height: 100%; }
body {
  background: var(--body-bg);
  color: var(--text);
  font-family: var(--font-ui);
  transition: var(--transition-theme);
}
/* Prevent pull-to-refresh on mobile */
body { overscroll-behavior-y: contain; }
```

- [ ] **Step 4: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/console/shell.js src/styles/shell.css src/styles/main.css
git commit -m "feat: console shell DOM structure and CSS"
```

---

## Task 5: Screen Renderer (Canvas + Pixel Grid)

**Files:**
- Create: `src/console/screen.js`
- Create: `src/styles/screen.css`

- [ ] **Step 1: Create `src/console/screen.js`**

```js
// Manages the 160×144 canvas, pixel-gap rendering, and scale calculation.
const LOGICAL_W = 160;
const LOGICAL_H = 144;
const PIXEL_GAP = 1; // px gap between logical pixels on physical canvas

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

/** Draw one logical pixel at (lx, ly) with given CSS color string. */
export function drawPixel(lx, ly, color) {
  ctx.fillStyle = color;
  const px = lx * (pixelSize + PIXEL_GAP);
  const py = ly * (pixelSize + PIXEL_GAP);
  ctx.fillRect(px, py, pixelSize, pixelSize);
}

/** Fill entire logical screen with gap color (clears to background). */
export function clearScreen() {
  const style = getComputedStyle(document.documentElement);
  const gap   = style.getPropertyValue('--screen-gap').trim() || '#000';
  ctx.fillStyle = gap;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/** Draw a rectangle in logical pixels. */
export function drawRect(lx, ly, lw, lh, color) {
  for (let y = ly; y < ly + lh; y++) {
    for (let x = lx; x < lx + lw; x++) {
      drawPixel(x, y, color);
    }
  }
}

/** Draw a sprite: 2D array of color strings, '' = transparent. */
export function drawSprite(sprite, lx, ly) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const c = sprite[row][col];
      if (c) drawPixel(lx + col, ly + row, c);
    }
  }
}

/** Draw pixel-font text. Uses built-in 5×7 font map. */
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
      cx += 4; // space
    }
  }
}

export function getCanvas() { return canvas; }
export function getCtx()    { return ctx; }
export function getLogicalW() { return LOGICAL_W; }
export function getLogicalH() { return LOGICAL_H; }

// Minimal 5×7 pixel font (A-Z, 0-9, basic punctuation)
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
  ' ':[[0,0,0]],
};
```

- [ ] **Step 2: Create `src/styles/screen.css`**

```css
.pv-screen-bezel {
  width: 100%;
  background: var(--bezel-bg);
  border-radius: var(--radius-screen);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 8px var(--shell-shadow);
  transition: var(--transition-theme);
}

.pv-screen-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 160 / 144;
  background: var(--screen-bg);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

#pv-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: block;
}

/* Scanline overlay */
.pv-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 1px,
    rgba(0,0,0,0.08) 1px,
    rgba(0,0,0,0.08) 2px
  );
  pointer-events: none;
  border-radius: 4px;
}
```

- [ ] **Step 3: Update `src/main.js` to call initScreen**

```js
import { initShell } from './console/shell.js';
import { initStore } from './core/store.js';
import { initErrorBoundary } from './core/error-boundary.js';

initErrorBoundary();
const store = initStore();
initShell(store);
```

(shell.js already calls initScreen internally — no change needed.)

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Expected: Console body visible, dark screen with pixel gap canvas, scanline overlay.

- [ ] **Step 5: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/console/screen.js src/styles/screen.css
git commit -m "feat: pixel-gap canvas renderer and screen CSS"
```

---

## Task 6: Input (Keyboard + Touch) & Haptics

**Files:**
- Create: `src/console/controls.js`
- Create: `src/console/haptics.js`
- Create: `src/styles/controls.css`

- [ ] **Step 1: Create `src/console/haptics.js`**

```js
export function pulse(ms = 30) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

export function pattern(arr) {
  if (navigator.vibrate) navigator.vibrate(arr);
}
```

- [ ] **Step 2: Create `src/console/controls.js`**

```js
import { emit } from '../core/event-bus.js';
import { pulse } from './haptics.js';

const KEY_MAP = {
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowLeft:  'left',
  ArrowRight: 'right',
  KeyZ:       'a',
  KeyX:       'b',
  Enter:      'start',
  ShiftLeft:  'select',
  ShiftRight: 'select',
};

const held = new Set();

export function initControls() {
  // Keyboard
  window.addEventListener('keydown', e => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    e.preventDefault();
    if (held.has(action)) return; // prevent key repeat flooding
    held.add(action);
    emit('input:down', action);
  });

  window.addEventListener('keyup', e => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    held.delete(action);
    emit('input:up', action);
  });

  // On-screen buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      const action = btn.dataset.action;
      pulse(25);
      emit('input:down', action);
    }, { passive: false });

    btn.addEventListener('touchend', e => {
      e.preventDefault();
      emit('input:up', btn.dataset.action);
    }, { passive: false });

    // Mouse fallback for desktop testing of on-screen buttons
    btn.addEventListener('mousedown', () => emit('input:down', btn.dataset.action));
    btn.addEventListener('mouseup',   () => emit('input:up',   btn.dataset.action));
  });
}

export function isHeld(action) { return held.has(action); }
```

- [ ] **Step 3: Create `src/styles/controls.css`**

```css
/* On-screen controls — always rendered, keyboard fallback on desktop */
.pv-controls-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
/* Touch targets on mobile get slightly larger */
@media (max-width: 480px) {
  .pv-btn-action { width: 56px; height: 56px; font-size: 16px; }
  .pv-dpad { grid-template-columns: 44px 44px 44px; grid-template-rows: 44px 44px 44px; }
  .pv-btn-dpad { min-width: 44px; min-height: 44px; }
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/console/controls.js src/console/haptics.js src/styles/controls.css
git commit -m "feat: keyboard and touch input with haptic feedback"
```

---

## Task 7: Theme Switcher

**Files:**
- Create: `src/console/theme-switcher.js`

- [ ] **Step 1: Create `src/console/theme-switcher.js`**

```js
import { emit } from '../core/event-bus.js';

const THEMES = [
  { id: 'ironside', color: '#f0a500', label: 'Ironside' },
  { id: 'phantom',  color: '#00e5cc', label: 'Phantom'  },
  { id: 'ivory',    color: '#c0152a', label: 'Ivory'    },
  { id: 'midnight', color: '#ffe600', label: 'Midnight' },
];

export function initThemeSwitcher(store) {
  const dock = document.getElementById('pv-theme-dock');
  if (!dock) return;

  THEMES.forEach(theme => {
    const btn = document.createElement('button');
    btn.title = theme.label;
    btn.setAttribute('aria-label', `Switch to ${theme.label} theme`);
    btn.style.cssText = `
      width: 18px; height: 18px; border-radius: 50%;
      background: ${theme.color}; border: 2px solid transparent;
      cursor: pointer; transition: border-color 0.15s, transform 0.1s;
      flex-shrink: 0;
    `;
    btn.addEventListener('click', () => {
      store.setTheme(theme.id);
      updateActive(store.getTheme());
    });
    btn.dataset.themeId = theme.id;
    dock.appendChild(btn);
  });

  updateActive(store.getTheme());
}

function updateActive(activeId) {
  document.querySelectorAll('#pv-theme-dock button').forEach(btn => {
    const isActive = btn.dataset.themeId === activeId;
    btn.style.borderColor = isActive ? '#fff' : 'transparent';
    btn.style.transform   = isActive ? 'scale(1.2)' : 'scale(1)';
  });
}
```

- [ ] **Step 2: Verify theme switching in browser**

Open dev server, click each dot — console body should change color immediately.

- [ ] **Step 3: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/console/theme-switcher.js
git commit -m "feat: runtime theme switcher with 4 shell themes"
```

---

## Task 8: Game Base & Menu Screen

**Files:**
- Create: `src/games/game-base.js`
- Create: `src/games/menu.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/games/game-base.js`**

```js
/**
 * All games extend this. Override init, tick, render, destroy.
 * tick(dt) — dt in seconds since last frame.
 */
export class GameBase {
  constructor(store) { this.store = store; this._raf = null; this._last = 0; }

  init() {}   // called once before first tick
  tick(_dt) {}
  render() {}
  destroy() { this.stop(); }

  start() {
    this.init();
    const loop = ts => {
      const dt = Math.min((ts - this._last) / 1000, 0.05); // cap at 50ms
      this._last = ts;
      this.tick(dt);
      this.render();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(ts => { this._last = ts; loop(ts); });
  }

  stop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }
}
```

- [ ] **Step 2: Create `src/games/menu.js`**

```js
import { GameBase } from './game-base.js';
import { clearScreen, drawText, drawRect, getLogicalW, getLogicalH } from '../console/screen.js';
import { on, off } from '../core/event-bus.js';
import { loadGame } from '../main.js';

const GAMES = ['BOUNCER', 'BLOCKFALL', 'ROOFTOP CAT'];

export class MenuGame extends GameBase {
  constructor(store) {
    super(store);
    this.cursor = 0;
    this.blink  = 0;
    this._onInput = this._onInput.bind(this);
  }

  init() { on('input:down', this._onInput); }
  destroy() { off('input:down', this._onInput); super.destroy(); }

  _onInput(action) {
    if (action === 'up')    this.cursor = (this.cursor - 1 + GAMES.length) % GAMES.length;
    if (action === 'down')  this.cursor = (this.cursor + 1) % GAMES.length;
    if (action === 'a' || action === 'start') loadGame(GAMES[this.cursor].toLowerCase().replace(' ', '-'), this.store);
  }

  tick(dt) { this.blink += dt; }

  render() {
    const style = getComputedStyle(document.documentElement);
    const px  = style.getPropertyValue('--screen-px').trim()  || '#8bac0f';
    const gap = style.getPropertyValue('--screen-gap').trim() || '#0d0f0c';
    const W = getLogicalW(), H = getLogicalH();

    clearScreen();

    // Title
    drawText('PIXELVAULT', 18, 12, px);
    // Divider
    drawRect(10, 22, W - 20, 1, px);
    // Game list
    GAMES.forEach((name, i) => {
      const y = 36 + i * 22;
      const selected = i === this.cursor;
      if (selected) drawRect(8, y - 2, W - 16, 14, px + '22');
      // Blinking cursor arrow
      if (selected && Math.floor(this.blink * 2) % 2 === 0) drawText('>', 10, y, px);
      drawText(name, 20, y, selected ? px : gap.replace(gap, style.getPropertyValue('--text').trim() || px));
    });
    // Footer
    drawText('A:SELECT', 30, H - 12, px);
  }
}
```

- [ ] **Step 3: Update `src/main.js` with game loader**

```js
import { initErrorBoundary } from './core/error-boundary.js';
import { initStore }         from './core/store.js';
import { initShell }         from './console/shell.js';
import { MenuGame }          from './games/menu.js';

initErrorBoundary();
const store = initStore();
initShell(store);

let activeGame = null;

export function loadGame(name, s) {
  if (activeGame) { activeGame.destroy(); activeGame = null; }
  if (name === 'menu') {
    activeGame = new MenuGame(s || store);
  } else if (name === 'bouncer') {
    import('./games/bouncer/bouncer.js').then(m => {
      activeGame = new m.BouncerGame(s || store);
      activeGame.start();
    });
    return;
  } else if (name === 'blockfall') {
    import('./games/blockfall/blockfall.js').then(m => {
      activeGame = new m.BlockFallGame(s || store);
      activeGame.start();
    });
    return;
  } else if (name === 'rooftop-cat') {
    import('./games/rooftop-cat/rooftop.js').then(m => {
      activeGame = new m.RooftopGame(s || store);
      activeGame.start();
    });
    return;
  }
  if (activeGame) activeGame.start();
}

// Boot into menu
loadGame('menu', store);
```

- [ ] **Step 4: Verify menu renders on canvas**

```bash
npm run dev
```

Expected: "PIXELVAULT" title, three game options, blinking cursor, arrow keys navigate.

- [ ] **Step 5: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/games/ src/main.js
git commit -m "feat: game base class and canvas-rendered menu"
```

---

## Task 9: Bouncer Game

**Files:**
- Create: `src/games/bouncer/bouncer-data.js`
- Create: `src/games/bouncer/bouncer-render.js`
- Create: `src/games/bouncer/bouncer.js`

- [ ] **Step 1: Create `src/games/bouncer/bouncer-data.js`**

```js
// Brick types: 0=empty, 1=normal, 2=hard(2-hits), 3=powerup-split, 4=speed
export const LEVELS = [
  // Level 1: 8 cols × 4 rows of bricks
  [
    [1,1,1,1,1,1,1,1],
    [1,2,1,1,1,1,2,1],
    [1,1,3,1,1,3,1,1],
    [1,1,1,1,1,1,1,1],
  ],
  // Level 2
  [
    [2,2,2,2,2,2,2,2],
    [1,3,1,4,4,1,3,1],
    [2,1,1,2,2,1,1,2],
    [1,1,2,1,1,2,1,1],
    [1,2,1,1,1,1,2,1],
  ],
];

export const BRICK_W  = 16;
export const BRICK_H  = 6;
export const BRICK_GAP = 1;
export const BRICK_COLS = 8;
export const PADDLE_W  = 28;
export const PADDLE_H  = 4;
export const BALL_SIZE = 3;
export const COLORS = {
  normal:  '#55aa00',
  hard:    '#aa5500',
  powerup: '#00aaff',
  speed:   '#ff5500',
  hit1:    '#886600',
};
```

- [ ] **Step 2: Create `src/games/bouncer/bouncer-render.js`**

```js
import { clearScreen, drawRect, drawText, getLogicalW, getLogicalH } from '../../console/screen.js';
import { BRICK_W, BRICK_H, BRICK_GAP, BALL_SIZE, PADDLE_W, PADDLE_H, COLORS } from './bouncer-data.js';

export function renderBouncer(state) {
  const style = getComputedStyle(document.documentElement);
  const px  = style.getPropertyValue('--screen-px').trim()  || '#8bac0f';
  const W = getLogicalW(), H = getLogicalH();

  clearScreen();

  // HUD
  drawText(`SC:${state.score}`, 2, 2, px);
  for (let i = 0; i < state.lives; i++) drawRect(W - 8 - i * 6, 2, 4, 4, px);

  // Bricks
  state.bricks.forEach(b => {
    if (!b.alive) return;
    const color = b.type === 2 ? (b.hits === 1 ? COLORS.hit1 : COLORS.hard)
                : b.type === 3 ? COLORS.powerup
                : b.type === 4 ? COLORS.speed
                : COLORS.normal;
    drawRect(b.x, b.y, BRICK_W - 1, BRICK_H - 1, color);
  });

  // Balls
  state.balls.forEach(ball => {
    drawRect(Math.round(ball.x), Math.round(ball.y), BALL_SIZE, BALL_SIZE, px);
  });

  // Paddle
  drawRect(Math.round(state.paddle.x), H - PADDLE_H - 4, PADDLE_W, PADDLE_H, px);

  // Game over / level clear
  if (state.phase === 'gameover') { drawText('GAME OVER', 30, H / 2 - 4, px); }
  if (state.phase === 'clear')    { drawText('LEVEL CLEAR', 20, H / 2 - 4, px); }
  if (state.phase === 'ready')    { drawText('PRESS A', 40, H - 20, px); }
}
```

- [ ] **Step 3: Create `src/games/bouncer/bouncer.js`**

```js
import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { getLogicalW, getLogicalH } from '../../console/screen.js';
import { renderBouncer } from './bouncer-render.js';
import { LEVELS, BRICK_W, BRICK_H, BRICK_GAP, BRICK_COLS, PADDLE_W, PADDLE_H, BALL_SIZE } from './bouncer-data.js';

const PADDLE_SPEED = 80; // px/sec
const BALL_SPEED_BASE = 60;
const BRICK_START_Y = 14;

export class BouncerGame extends GameBase {
  constructor(store) {
    super(store);
    this._onInput = this._onInput.bind(this);
    this._held = { left: false, right: false };
  }

  init() {
    on('input:down', this._onInput);
    on('input:up',   this._onInputUp.bind(this));
    this._loadLevel(0);
  }

  destroy() {
    off('input:down', this._onInput);
    off('input:up',   this._onInputUp.bind(this));
    super.destroy();
  }

  _onInput(a)   { if (a === 'left') this._held.left = true; if (a === 'right') this._held.right = true; if (a === 'a' && this.state.phase === 'ready') this._launch(); if (a === 'b') emit('game:exit'); }
  _onInputUp(a) { if (a === 'left') this._held.left = false; if (a === 'right') this._held.right = false; }

  _loadLevel(idx) {
    const W = getLogicalW(), H = getLogicalH();
    const layout = LEVELS[idx] || LEVELS[LEVELS.length - 1];
    const bricks = [];
    layout.forEach((row, ri) => {
      row.forEach((type, ci) => {
        if (!type) return;
        bricks.push({ x: 8 + ci * (BRICK_W + BRICK_GAP), y: BRICK_START_Y + ri * (BRICK_H + BRICK_GAP), type, hits: 0, alive: true });
      });
    });
    this.state = {
      paddle: { x: (W - PADDLE_W) / 2 },
      balls: [{ x: W / 2, y: H - PADDLE_H - 10, vx: BALL_SPEED_BASE * 0.6, vy: -BALL_SPEED_BASE }],
      bricks,
      score: 0,
      lives: 3,
      level: idx,
      phase: 'ready',
    };
  }

  _launch() { this.state.phase = 'play'; }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;
    const W = getLogicalW(), H = getLogicalH();

    // Move paddle
    if (this._held.left)  s.paddle.x = Math.max(0, s.paddle.x - PADDLE_SPEED * dt);
    if (this._held.right) s.paddle.x = Math.min(W - PADDLE_W, s.paddle.x + PADDLE_SPEED * dt);

    // Update each ball
    s.balls = s.balls.filter(ball => {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Wall bounce
      if (ball.x <= 0)            { ball.x = 0;          ball.vx = Math.abs(ball.vx); }
      if (ball.x + BALL_SIZE >= W){ ball.x = W-BALL_SIZE; ball.vx = -Math.abs(ball.vx); }
      if (ball.y <= 0)            { ball.y = 0;           ball.vy = Math.abs(ball.vy); }

      // Lost
      if (ball.y > H) return false;

      // Paddle collision
      const px = s.paddle.x, py = H - PADDLE_H - 4;
      if (ball.y + BALL_SIZE >= py && ball.y < py + PADDLE_H && ball.x + BALL_SIZE > px && ball.x < px + PADDLE_W) {
        ball.vy = -Math.abs(ball.vy);
        const offset = (ball.x + BALL_SIZE / 2 - (px + PADDLE_W / 2)) / (PADDLE_W / 2);
        ball.vx = offset * BALL_SPEED_BASE * 1.1;
        ball.y = py - BALL_SIZE;
      }

      // Brick collision
      s.bricks.forEach(b => {
        if (!b.alive) return;
        if (ball.x + BALL_SIZE > b.x && ball.x < b.x + BRICK_W - 1 && ball.y + BALL_SIZE > b.y && ball.y < b.y + BRICK_H - 1) {
          b.hits++;
          const maxHits = b.type === 2 ? 2 : 1;
          if (b.hits >= maxHits) {
            b.alive = false;
            s.score += b.type === 2 ? 20 : 10;
            if (b.type === 3) s.balls.push({ x: ball.x, y: ball.y, vx: -ball.vx, vy: ball.vy });
            if (b.type === 4) { ball.vx *= 1.15; ball.vy *= 1.15; }
          }
          ball.vy = -ball.vy;
        }
      });

      return true;
    });

    // All balls lost
    if (s.balls.length === 0) {
      s.lives--;
      if (s.lives <= 0) { s.phase = 'gameover'; this.store.setScore('bouncer', s.score); }
      else { this._resetBall(); s.phase = 'ready'; }
    }

    // Level clear
    if (s.bricks.every(b => !b.alive)) {
      s.phase = 'clear';
      setTimeout(() => this._loadLevel(s.level + 1 < LEVELS.length ? s.level + 1 : 0), 2000);
    }
  }

  _resetBall() {
    const W = getLogicalW(), H = getLogicalH();
    this.state.balls = [{ x: W / 2, y: H - PADDLE_H - 12, vx: BALL_SPEED_BASE * 0.6, vy: -BALL_SPEED_BASE }];
  }

  render() { renderBouncer(this.state); }
}
```

- [ ] **Step 4: Test Bouncer in browser**

Navigate to dev server → menu → select Bouncer → verify ball, paddle, bricks render and physics work.

- [ ] **Step 5: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/games/bouncer/
git commit -m "feat: Bouncer game — brick physics, power-ups, lives"
```

---

## Task 10: BlockFall Game

**Files:**
- Create: `src/games/blockfall/blockfall-data.js`
- Create: `src/games/blockfall/blockfall-render.js`
- Create: `src/games/blockfall/blockfall.js`

- [ ] **Step 1: Create `src/games/blockfall/blockfall-data.js`**

```js
// 7 piece shapes encoded as 2D arrays of 1s
export const PIECES = [
  { shape: [[1,1,1,1]],                        color: '#00cccc' }, // I
  { shape: [[1,1],[1,1]],                       color: '#cccc00' }, // O
  { shape: [[0,1,1],[1,1,0]],                   color: '#00cc00' }, // S
  { shape: [[1,1,0],[0,1,1]],                   color: '#cc0000' }, // Z
  { shape: [[1,0,0],[1,1,1]],                   color: '#cc6600' }, // L
  { shape: [[0,0,1],[1,1,1]],                   color: '#0000cc' }, // J
  { shape: [[0,1,0],[1,1,1]],                   color: '#cc00cc' }, // T
];

export const COLS   = 10;
export const ROWS   = 16;
export const CELL   = 13; // logical pixels per cell
export const FIELD_X = 5; // left offset on 160px canvas
export const FIELD_Y = 8; // top offset
export const HUD_X   = FIELD_X + COLS * CELL + 4;
```

- [ ] **Step 2: Create `src/games/blockfall/blockfall-render.js`**

```js
import { clearScreen, drawRect, drawText, getLogicalH } from '../../console/screen.js';
import { COLS, ROWS, CELL, FIELD_X, FIELD_Y, HUD_X } from './blockfall-data.js';

export function renderBlockFall(state) {
  const style = getComputedStyle(document.documentElement);
  const px  = style.getPropertyValue('--screen-px').trim()  || '#8bac0f';
  const bg  = style.getPropertyValue('--screen-bg').trim()  || '#0d0f0c';

  clearScreen();

  // Field border
  drawRect(FIELD_X - 1, FIELD_Y - 1, COLS * CELL + 2, ROWS * CELL + 2, px + '44');

  // Placed cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = state.field[r][c];
      if (color) drawRect(FIELD_X + c * CELL, FIELD_Y + r * CELL, CELL - 1, CELL - 1, color);
    }
  }

  // Active piece
  if (state.piece) {
    state.piece.shape.forEach((row, ri) => {
      row.forEach((v, ci) => {
        if (!v) return;
        drawRect(
          FIELD_X + (state.piece.col + ci) * CELL,
          FIELD_Y + (state.piece.row + ri) * CELL,
          CELL - 1, CELL - 1,
          state.piece.color
        );
      });
    });
  }

  // HUD
  drawText('SC', HUD_X, FIELD_Y,      px);
  drawText(String(state.score),        HUD_X, FIELD_Y + 8,  px);
  drawText('LV', HUD_X, FIELD_Y + 22, px);
  drawText(String(state.level),        HUD_X, FIELD_Y + 30, px);

  if (state.phase === 'gameover') drawText('OVER', 36, getLogicalH() / 2, px);
}
```

- [ ] **Step 3: Create `src/games/blockfall/blockfall.js`**

```js
import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderBlockFall } from './blockfall-render.js';
import { PIECES, COLS, ROWS } from './blockfall-data.js';

function randPiece() {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape: p.shape.map(r => [...r]), color: p.color, row: 0, col: Math.floor((COLS - p.shape[0].length) / 2) };
}

function rotate(shape) {
  const rows = shape.length, cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c]));
}

function emptyField() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export class BlockFallGame extends GameBase {
  constructor(store) {
    super(store);
    this._onInput = this._onInput.bind(this);
    this._dropTimer = 0;
  }

  init() {
    on('input:down', this._onInput);
    this.state = { field: emptyField(), piece: randPiece(), next: randPiece(), score: 0, level: 1, phase: 'play' };
  }

  destroy() { off('input:down', this._onInput); super.destroy(); }

  _onInput(a) {
    const s = this.state;
    if (s.phase !== 'play') return;
    if (a === 'left')  this._move(0, -1);
    if (a === 'right') this._move(0,  1);
    if (a === 'down')  this._move(1,  0);
    if (a === 'up')    this._tryRotate();
    if (a === 'a')     this._hardDrop();
    if (a === 'b')     emit('game:exit');
  }

  _move(dr, dc) {
    const p = this.state.piece;
    if (this._fits(p.shape, p.row + dr, p.col + dc)) { p.row += dr; p.col += dc; return true; }
    return false;
  }

  _tryRotate() {
    const p = this.state.piece;
    const rotated = rotate(p.shape);
    if (this._fits(rotated, p.row, p.col)) p.shape = rotated;
  }

  _hardDrop() {
    while (this._move(1, 0)) {}
    this._lock();
  }

  _fits(shape, row, col) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nr = row + r, nc = col + c;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
        if (this.state.field[nr][nc]) return false;
      }
    }
    return true;
  }

  _lock() {
    const s = this.state, p = s.piece;
    p.shape.forEach((row, ri) => row.forEach((v, ci) => { if (v) s.field[p.row + ri][p.col + ci] = p.color; }));
    // Clear full rows
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (s.field[r].every(c => c !== null)) {
        s.field.splice(r, 1);
        s.field.unshift(Array(COLS).fill(null));
        cleared++; r++;
      }
    }
    if (cleared) { s.score += [0, 100, 300, 500, 800][cleared] * s.level; s.level = Math.floor(s.score / 1000) + 1; }
    s.piece = s.next;
    s.next  = randPiece();
    if (!this._fits(s.piece.shape, s.piece.row, s.piece.col)) {
      s.phase = 'gameover';
      this.store.setScore('blockfall', s.score);
    }
  }

  tick(dt) {
    if (this.state.phase !== 'play') return;
    const interval = Math.max(0.1, 0.8 - (this.state.level - 1) * 0.07);
    this._dropTimer += dt;
    if (this._dropTimer >= interval) { this._dropTimer = 0; if (!this._move(1, 0)) this._lock(); }
  }

  render() { renderBlockFall(this.state); }
}
```

- [ ] **Step 4: Test BlockFall in browser**

Navigate menu → BlockFall → verify pieces fall, rotate, rows clear, level increases.

- [ ] **Step 5: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/games/blockfall/
git commit -m "feat: BlockFall game — falling pieces, line clear, levels"
```

---

## Task 11: Rooftop Cat (Mochi's Run)

**Files:**
- Create: `src/games/rooftop-cat/rooftop-sprites.js`
- Create: `src/games/rooftop-cat/rooftop-data.js`
- Create: `src/games/rooftop-cat/rooftop-render.js`
- Create: `src/games/rooftop-cat/rooftop.js`

- [ ] **Step 1: Create `src/games/rooftop-cat/rooftop-sprites.js`**

```js
// Pixel art sprites as 2D arrays of color strings, '' = transparent
const _ = '';
const W = '#e8e8e8'; // white fur
const G = '#888888'; // grey fur
const K = '#222222'; // dark outline
const P = '#ffaaaa'; // pink ear/nose
const Y = '#ffee00'; // fish/collectible

export const MOCHI_IDLE = [
  [_,_,K,K,K,K,_,_,_,_,_,_,_,_,_,_],
  [_,K,W,W,W,W,K,_,_,_,_,_,_,_,_,_],
  [K,W,P,W,W,P,W,K,_,_,_,_,_,_,_,_],
  [K,W,K,W,W,K,W,K,_,_,_,_,_,_,_,_],
  [K,W,W,W,W,W,W,K,_,_,_,_,_,_,_,_],
  [K,G,W,W,W,W,G,K,_,_,_,_,_,_,_,_],
  [_,K,W,W,W,W,K,_,_,_,_,_,_,_,_,_],
  [_,K,G,K,_,K,G,K,_,_,_,_,_,K,K,_],
  [_,_,K,_,_,_,K,_,_,_,_,_,K,G,G,K],
  [_,_,K,_,_,_,K,_,_,_,_,K,G,G,G,K],
  [_,K,K,_,_,K,K,K,_,_,_,K,G,K,_,_],
];

export const PIGEON = [
  [_,_,K,K,K,_,_,_,_,_,_,_],
  [_,K,G,G,G,K,_,_,_,_,_,_],
  [K,G,W,G,G,G,K,_,_,_,_,_],
  [K,G,G,G,G,G,K,K,_,_,_,_],
  [_,K,G,G,G,K,G,G,K,_,_,_],
  [_,_,K,K,K,_,K,K,_,_,_,_],
  [_,_,K,_,K,_,_,_,_,_,_,_],
  [_,K,K,_,K,K,_,_,_,_,_,_],
];

export const FISH = [
  [_,_,Y,Y,Y,_,_,_],
  [_,Y,Y,Y,Y,Y,_,_],
  [Y,Y,Y,Y,Y,Y,Y,Y],
  [_,Y,Y,Y,Y,Y,_,_],
  [_,_,Y,Y,Y,_,_,_],
];

// Tile colors
export const TILE_COLORS = {
  roof:  '#445566',
  brick: '#664433',
  sky:   '#112233',
  ac:    '#334455',
  air:   '#88ccff',
};
```

- [ ] **Step 2: Create `src/games/rooftop-cat/rooftop-data.js`**

```js
// Tile types: 0=air, 1=roof, 2=brick, 3=ac_vent
// Level map rows top-to-bottom, each row = array of tile cols
// 160px / 16px = 10 cols visible. Levels scroll horizontally.
// Total level width = 30 tiles

export const TILE = 16;

export const LEVELS = [
  {
    width: 30,
    // Sparse tile definitions: [col, row, type]
    tiles: [
      // Ground roof spans
      ...[...Array(10)].map((_,i) => [i,    7, 1]),
      ...[...Array(6)] .map((_,i) => [i+12, 7, 1]),
      ...[...Array(8)] .map((_,i) => [i+21, 7, 1]),
      // Upper platforms
      [4,5,1],[5,5,1],[6,5,1],
      [14,5,1],[15,5,1],
      [22,5,1],[23,5,1],[24,5,1],
      // AC vents
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
```

- [ ] **Step 3: Create `src/games/rooftop-cat/rooftop-render.js`**

```js
import { clearScreen, drawRect, drawSprite, drawText, getLogicalW, getLogicalH } from '../../console/screen.js';
import { MOCHI_IDLE, PIGEON, FISH, TILE_COLORS } from './rooftop-sprites.js';
import { TILE } from './rooftop-data.js';

export function renderRooftop(state) {
  const style = getComputedStyle(document.documentElement);
  const px  = style.getPropertyValue('--screen-px').trim()  || '#8bac0f';
  const W = getLogicalW(), H = getLogicalH();
  const camX = Math.round(state.camX);

  clearScreen();

  // Sky background
  drawRect(0, 0, W, H, TILE_COLORS.sky);

  // Stars
  [[12,4],[35,8],[70,2],[100,6],[130,3],[150,9]].forEach(([sx,sy]) => {
    const sx2 = sx - camX % W;
    if (sx2 >= 0 && sx2 < W) drawRect(sx2, sy, 1, 1, '#ffffff');
  });

  // Tiles
  state.tiles.forEach(t => {
    const sx = t.x - camX;
    if (sx + TILE < 0 || sx > W) return;
    const color = t.type === 1 ? TILE_COLORS.roof : t.type === 2 ? TILE_COLORS.brick : TILE_COLORS.ac;
    drawRect(sx, t.y, TILE - 1, TILE - 1, color);
    if (t.type === 3) { // AC vent exhaust
      for (let ay = t.y - 6; ay < t.y; ay += 2) drawRect(sx + 6, ay, 2, 1, TILE_COLORS.air);
    }
  });

  // Fish
  state.fish.forEach(f => {
    if (f.collected) return;
    const sx = f.x - camX;
    if (sx >= -8 && sx < W) drawSprite(FISH, sx, f.y);
  });

  // Enemies
  state.enemies.forEach(e => {
    const sx = e.x - camX;
    if (sx >= -12 && sx < W) drawSprite(PIGEON, sx, e.y);
  });

  // Player
  drawSprite(MOCHI_IDLE, Math.round(state.player.screenX), Math.round(state.player.y));

  // HUD
  drawText(`SC:${state.score}`, 2, 2, px);
  drawText(`LV${state.level + 1}`, W - 22, 2, px);

  if (state.phase === 'gameover') drawText('GAME OVER', 28, H / 2, px);
  if (state.phase === 'win')      drawText('NICE!', 52, H / 2, px);
}
```

- [ ] **Step 4: Create `src/games/rooftop-cat/rooftop.js`**

```js
import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderRooftop } from './rooftop-render.js';
import { LEVELS, TILE } from './rooftop-data.js';

const GRAVITY  = 280;
const JUMP_V   = -130;
const RUN_SPD  = 70;
const AC_PUSH  = -160;

export class RooftopGame extends GameBase {
  constructor(store) {
    super(store);
    this._onDown = this._onDown.bind(this);
    this._onUp   = this._onUp.bind(this);
    this._held   = { left: false, right: false };
  }

  init() {
    on('input:down', this._onDown);
    on('input:up',   this._onUp);
    this._loadLevel(0);
  }

  destroy() { off('input:down', this._onDown); off('input:up', this._onUp); super.destroy(); }

  _loadLevel(idx) {
    const lvl = LEVELS[idx];
    const tileMap = {};
    lvl.tiles.forEach(([col, row, type]) => { tileMap[`${col},${row}`] = type; });
    const tiles = lvl.tiles.map(([col, row, type]) => ({ x: col * TILE, y: row * TILE, type }));

    this.state = {
      level: idx,
      levelData: lvl,
      tiles,
      player: { x: lvl.playerStart.col * TILE, y: lvl.playerStart.row * TILE - 11, vy: 0, onGround: false, jumps: 0, screenX: 16 },
      enemies: lvl.enemies.map(e => ({ x: e.col * TILE, y: e.row * TILE - 8, dir: 1, pl: e.patrolLeft * TILE, pr: e.patrolRight * TILE })),
      fish: lvl.fish.map(f => ({ x: f.col * TILE, y: f.row * TILE - 8, collected: false })),
      camX: 0,
      score: 0,
      phase: 'play',
    };
  }

  _onDown(a) {
    if (a === 'left')  this._held.left  = true;
    if (a === 'right') this._held.right = true;
    if ((a === 'a') && this.state.player.jumps < 2) {
      this.state.player.vy = JUMP_V;
      this.state.player.jumps++;
      this.state.player.onGround = false;
    }
    if (a === 'b') emit('game:exit');
  }
  _onUp(a) { if (a === 'left') this._held.left = false; if (a === 'right') this._held.right = false; }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;
    const p = s.player;

    // Horizontal movement
    if (this._held.left)  p.x -= RUN_SPD * dt;
    if (this._held.right) p.x += RUN_SPD * dt;
    p.x = Math.max(0, p.x);

    // Gravity
    p.vy += GRAVITY * dt;
    p.y  += p.vy * dt;

    // Tile collision (simple AABB against roof tiles)
    p.onGround = false;
    s.tiles.forEach(t => {
      if (t.type === 0) return;
      if (p.x + 11 > t.x && p.x < t.x + TILE && p.y + 11 > t.y && p.y < t.y + TILE) {
        if (p.vy >= 0 && p.y + 11 - p.vy * dt <= t.y + 1) {
          p.y = t.y - 11; p.vy = 0; p.onGround = true; p.jumps = 0;
        } else if (p.vy < 0) { p.vy = 0; p.y = t.y + TILE; }
        // AC vent push
        if (t.type === 3 && p.x + 6 > t.x && p.x < t.x + TILE) p.vy = AC_PUSH;
      }
    });

    // Fell off
    if (p.y > LEVELS[s.level].width * TILE) { s.phase = 'gameover'; this.store.setScore('rooftop', s.score); }

    // Camera
    const targetCam = p.x - 16;
    s.camX += (targetCam - s.camX) * 0.12;
    s.camX = Math.max(0, Math.min(s.camX, s.levelData.width * TILE - 160));

    // Enemies
    s.enemies.forEach(e => {
      e.x += e.dir * 28 * dt;
      if (e.x <= e.pl) e.dir = 1;
      if (e.x >= e.pr) e.dir = -1;
      // Collision with player
      if (Math.abs(e.x - p.x) < 10 && Math.abs(e.y - p.y) < 10) {
        s.phase = 'gameover'; this.store.setScore('rooftop', s.score);
      }
    });

    // Fish collection
    s.fish.forEach(f => {
      if (!f.collected && Math.abs(f.x - p.x) < 10 && Math.abs(f.y - p.y) < 10) {
        f.collected = true; s.score += 50;
      }
    });

    // Win: all fish collected
    if (s.fish.every(f => f.collected)) {
      s.phase = 'win';
      this.store.setScore('rooftop', s.score);
      setTimeout(() => this._loadLevel((s.level + 1) % LEVELS.length), 2000);
    }
  }

  render() { renderRooftop(this.state); }
}
```

- [ ] **Step 5: Test Rooftop Cat**

Navigate menu → Rooftop Cat → verify Mochi runs, jumps, double-jumps, pigeons patrol, fish collected, AC vents push up.

- [ ] **Step 6: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/games/rooftop-cat/
git commit -m "feat: Rooftop Cat (Mochi's Run) — platformer with pigeons, fish, AC vents"
```

---

## Task 12: Game Exit Routing & Menu Return

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Handle `game:exit` event in `src/main.js`**

Add this after `loadGame('menu', store)` at the bottom of `main.js`:

```js
import { on } from './core/event-bus.js';
on('game:exit', () => loadGame('menu', store));
```

- [ ] **Step 2: Verify B button returns to menu from any game**

Launch any game → press B (or X on keyboard) → menu appears.

- [ ] **Step 3: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add src/main.js
git commit -m "feat: B button exits game and returns to menu"
```

---

## Task 13: PWA Icons & Cloudflare Deployment Config

**Files:**
- Modify: `public/manifest.webmanifest`
- Create: `public/_headers` (Cloudflare)
- Create: `public/_redirects`

- [ ] **Step 1: Generate simple pixel icons via Node script**

```bash
cd /Users/samseen/DEV/samseen/sim
node -e "
const fs = require('fs');
// Write minimal valid 1×1 PNG (base64) as icon placeholders
// Real icons should be replaced with proper 192/512 PNGs before deploy
const PNG1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64');
fs.writeFileSync('public/icon-192.png', PNG1);
fs.writeFileSync('public/icon-512.png', PNG1);
console.log('Icons written');
"
```

- [ ] **Step 2: Create `public/_headers` for Cloudflare**

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: vibrate=*
```

- [ ] **Step 3: Create `public/_redirects`**

```
/* /index.html 200
```

- [ ] **Step 4: Build and verify**

```bash
cd /Users/samseen/DEV/samseen/sim
npm run build
```

Expected: `dist/` folder created, no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add public/ dist/
git commit -m "feat: PWA manifest, Cloudflare headers, production build"
```

---

## Task 14: Final Polish — Responsive Mobile Layout

**Files:**
- Modify: `src/styles/shell.css`
- Modify: `src/styles/screen.css`

- [ ] **Step 1: Ensure screen fills console body width on mobile**

Add to `src/styles/screen.css`:
```css
@media (max-width: 480px) {
  .pv-screen-bezel { padding: 8px; }
  .pv-screen-wrapper { width: 100%; }
}
```

- [ ] **Step 2: Lock portrait orientation hint in `index.html` meta**

Add inside `<head>`:
```html
<meta name="screen-orientation" content="portrait" />
```

- [ ] **Step 3: Verify on mobile viewport (DevTools → 390×844)**

Checklist:
- [ ] Console fills viewport top to bottom
- [ ] Screen canvas is large and centered
- [ ] D-pad and A/B buttons are reachable with thumbs
- [ ] Theme dots visible and tappable
- [ ] No horizontal scroll

- [ ] **Step 4: Final commit**

```bash
cd /Users/samseen/DEV/samseen/sim
git add .
git commit -m "feat: mobile responsive polish, portrait layout"
```

---

## Spec Coverage Check

| Spec Section | Covered By |
|---|---|
| Desktop console body render | Task 4 (shell.js + shell.css) |
| Keyboard controls | Task 6 (controls.js) |
| Mobile on-screen buttons + haptics | Task 6 (controls.js + haptics.js) |
| 160×144 pixel-grid screen | Task 5 (screen.js + screen.css) |
| Pixel gap effect | Task 5 (screen.js drawRect) |
| Scanline overlay | Task 5 (screen.css .pv-scanlines) |
| 4 shell themes + switcher | Task 3 (tokens.css) + Task 7 (theme-switcher.js) |
| Theme persistence (localStorage) | Task 2 (store.js) |
| Canvas menu (game select) | Task 8 (menu.js) |
| Bouncer game | Task 9 |
| BlockFall game | Task 10 |
| Rooftop Cat game | Task 11 |
| B to exit games → menu | Task 12 |
| High score persistence | Task 2 (store.setScore) + Tasks 9–11 |
| PWA manifest | Task 1 + Task 13 |
| Cloudflare Pages deploy | Task 13 |
| Mobile responsive | Task 14 |
| Zero IP/trademark violations | All tasks — original names, sprites, mechanics |
