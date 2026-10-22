# PixelVault Console — Design Specification
**Date:** 2026-10-22  
**Status:** Approved

---

## 1. Product Overview

**PixelVault** is a browser-based retro handheld console simulator built with Vite + Vanilla JavaScript. It renders as a physical console body on screen with an authentic pixel-grid display and three original games. All visuals, branding, character names, and game mechanics are fully original — no trademarks, no IP from Nintendo, Atari, or any other rights holder.

- **Desktop:** Full console body rendered center-screen. Keyboard controls.
- **Mobile:** Console fills the viewport like a real handheld device. On-screen buttons with haptic feedback via `navigator.vibrate()`.
- **Deployment:** Static Vite build → Cloudflare Pages (free tier).

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Bundler | Vite |
| Language | Vanilla JavaScript (ES6 Modules) |
| Styling | Plain CSS with custom properties |
| Rendering | HTML5 Canvas (160×144 logical px) |
| Haptics | Web Vibration API |
| Storage | localStorage (scores, last theme) |
| Deployment | Cloudflare Pages |

**Hard constraints:**
- No React, Vue, or any frontend framework
- No Tailwind, Bootstrap, or utility CSS libraries
- No third-party game engines (Phaser, PixiJS, etc.)
- Every `.js` and `.css` file must stay under 200 lines
- Zero external dependencies beyond Vite dev tooling

---

## 3. Visual Design

### 3.1 Console Shell

The console body is a distinct original design — not a replica of any existing hardware. Key physical features:

- Rounded rectangle body, taller than wide (portrait orientation on mobile)
- Recessed screen area with a colored bezel ring
- D-pad on the left, two action buttons (A/B) on the right
- Two smaller buttons (Start, Select) in the center below screen
- Speaker grille slots rendered in CSS on the bottom-right of the body
- A brand mark reading **"PixelVault"** in pixel monospace type — no trademarked logos

### 3.2 Shell Themes (4, selectable at runtime)

Saved to `localStorage` and applied via a `data-theme` attribute on `<body>`.

| Theme ID | Name | Shell color | Bezel | Buttons | Screen BG |
|---|---|---|---|---|---|
| `ironside` | Ironside | `#2a2a2d` | `#1a1a1c` | `#f0a500` | `#0d0f0c` |
| `phantom` | Phantom | `#1c1c2e` | `#0e0e1a` | `#00e5cc` | `#0a0a14` |
| `ivory` | Ivory | `#f0ece4` | `#d6d0c4` | `#c0152a` | `#e8e4dc` |
| `midnight` | Midnight | `#0d1b3e` | `#091228` | `#ffe600` | `#06101f` |

Theme switcher: four small colored circles rendered below the console body on desktop, accessible via a settings button on mobile.

### 3.3 Screen Rendering

- Canvas logical size: **160 × 144 pixels**
- Canvas is scaled up to fill the screen bezel area using CSS `transform: scale()` — scale factor calculated from available bezel dimensions
- Pixel rendering: `image-rendering: pixelated; image-rendering: crisp-edges` on the canvas element — no browser anti-aliasing
- **Pixel gap effect:** Each logical pixel is drawn as a filled square leaving a 1-logical-pixel gap on right and bottom edges. Achieved by drawing each pixel as `(x*scale, y*scale, scale-1, scale-1)` on a higher-resolution canvas, or via CSS `gap` on a pixel grid approach
- **Scanline overlay:** A `::after` pseudo-element with `repeating-linear-gradient` at 10% opacity sits over the canvas — thin horizontal lines, not obtrusive
- Screen palette per theme varies (warm amber phosphor for Ironside, cool teal for Phantom, paper-white for Ivory, deep blue for Midnight)

---

## 4. Architecture

```
sim/
├── index.html
├── package.json
├── vite.config.js
├── brain.md
├── README.md
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.webmanifest
└── src/
    ├── main.js                    # Boot: mounts shell, loads theme, starts menu
    ├── core/
    │   ├── event-bus.js           # Pub/sub: input, game lifecycle, theme change
    │   ├── store.js               # Theme, active game, high scores (localStorage)
    │   └── error-boundary.js      # Global error catcher → on-screen error toast
    ├── console/
    │   ├── shell.js               # Renders console body DOM structure
    │   ├── screen.js              # Canvas init, scale calc, pixel-gap renderer
    │   ├── controls.js            # Keyboard listeners + on-screen button events
    │   ├── haptics.js             # navigator.vibrate() wrapper with fallback
    │   └── theme-switcher.js      # Theme picker UI, applies data-theme
    ├── games/
    │   ├── game-base.js           # Abstract: init(canvas) / tick(dt) / render() / destroy()
    │   ├── menu.js                # Game selection screen (rendered on canvas)
    │   ├── bouncer/
    │   │   ├── bouncer.js         # Game loop, physics, score
    │   │   ├── bouncer-render.js  # Draw paddles, ball, bricks
    │   │   └── bouncer-data.js    # Level layouts, brick configs
    │   ├── blockfall/
    │   │   ├── blockfall.js       # Game loop, piece logic, line clearing
    │   │   ├── blockfall-render.js
    │   │   └── blockfall-data.js  # 7 piece shapes, color rules
    │   └── rooftop-cat/
    │       ├── rooftop.js         # Game loop, physics, collision
    │       ├── rooftop-render.js  # Draw cat (Mochi), tiles, enemies, collectibles
    │       ├── rooftop-data.js    # 3 level maps encoded as 2D arrays
    │       └── rooftop-sprites.js # Pixel art sprite definitions (8×8, 16×16 grids)
    └── styles/
        ├── tokens.css             # All CSS custom props, one block per theme
        ├── reset.css              # Modern CSS reset
        ├── shell.css              # Console body, d-pad, buttons, speaker grille
        ├── screen.css             # Bezel, canvas wrapper, scanline overlay
        ├── controls.css           # On-screen button layout (mobile)
        └── main.css               # Root layout, theme transitions, responsive
```

---

## 5. Controls

### 5.1 Desktop (Keyboard)

| Action | Key |
|---|---|
| D-pad Up | `ArrowUp` |
| D-pad Down | `ArrowDown` |
| D-pad Left | `ArrowLeft` |
| D-pad Right | `ArrowRight` |
| A button | `Z` |
| B button | `X` |
| Start | `Enter` |
| Select | `Shift` |

### 5.2 Mobile (On-screen Buttons)

On-screen controls are absolutely positioned overlays on the console body:
- **D-pad:** CSS cross shape, 4 tap zones (up/down/left/right)
- **A / B buttons:** Two circles, right side
- **Start / Select:** Two small rectangular buttons, center bottom
- All hit targets minimum 48×48px
- `touchstart` fires action immediately (no `click` delay)
- Each button press calls `haptics.pulse()` → `navigator.vibrate(30)`

---

## 6. Games

### 6.1 Bouncer

**Concept:** Single-player brick-clearing game. A ball bounces between a paddle (player-controlled, bottom) and a field of bricks (top half). Clear all bricks to advance. Lives system (3 lives). No Pong or Breakout trademarks — original mechanics include:
- Power-up bricks that split the ball into two
- Speed-increasing bricks
- Shield bricks that take 2 hits

**Controls:** Left/Right arrows (or A/D) to move paddle. No vertical paddle movement.  
**Rendering:** All drawn on 160×144 canvas. Paddle = 24×4px. Ball = 3×3px. Bricks = 12×5px with 1px gaps.

### 6.2 BlockFall

**Concept:** Falling geometric pieces that the player arranges to complete horizontal rows. Completed rows are cleared and score is added. Speed increases over time. Game over when pieces stack to the top.

Seven original piece shapes (same geometry as standard falling-block games — these shapes are not copyrightable, only the Tetris brand/trade dress is). Color palette is original per-theme.

**Controls:** Left/Right to move, Down to soft-drop, Up to rotate, Z for hard-drop.  
**Rendering:** Playfield = 10×16 cells on 160×144 canvas. Each cell = 14×8px (wider than tall to fit portrait canvas). Score/level shown in right margin (remaining 20px width). Alternatively: 10 columns × 14px = 140px wide, 16 rows × 8px = 128px tall — fits within 160×144 with 10px margin top/bottom for HUD.

### 6.3 Rooftop Cat (Mochi's Run)

**Concept:** Side-scrolling platformer. Player controls **Mochi**, a small stray cat, jumping across city rooftops at night. Collect fish (score items), avoid pigeons (enemies that walk back and forth on platforms) and AC unit exhausts (hazard tiles). 3 levels of increasing width.

**Character design:** Mochi is a 16×16 sprite — small white-and-grey cat, visible ears, tail. No resemblance to Mario, Dave, or any existing game character.  
**Enemies:** Pigeons — 12×12 sprite, grey, walk patrol paths.  
**Hazards:** AC exhaust vents — emit a 2px wide air stream upward that bounces Mochi.  
**Collectibles:** Fish silhouette — 8×8 sprite.

**Controls:** Left/Right to run, A (Z key) to jump, double-jump allowed.  
**Rendering:** Camera scrolls with Mochi. Level map stored as 2D tile array (each tile 16×16px).

---

## 7. Menu System

A canvas-rendered main menu (not DOM-based) shows:
- "PixelVault" logo in chunky pixel text (top)
- Three game options with a blinking cursor selector
- A/Start to launch selected game
- B to return to menu from in-game (pause-then-exit)

---

## 8. Persistence

Via `localStorage`:
- Active theme (key: `pv_theme`)
- High scores per game (key: `pv_scores`) — JSON object `{ bouncer: N, blockfall: N, rooftop: N }`

---

## 9. PWA & Deployment

- `manifest.webmanifest` with `display: standalone`, themed icons (192, 512)
- Vite build → `dist/` → Cloudflare Pages free tier
- No server-side code. Fully static.

---

## 10. IP / Legal Checklist

- [ ] No Nintendo trademarks (Game Boy, DMG, GBA, Mario, Donkey Kong, Tetris brand)
- [ ] No Atari trademarks (Pong brand)
- [ ] No Blue Planet Software / Tetris Co. branding (Tetromino, Tetris brand name)
- [ ] No character likenesses (Mario, Luigi, Dave, Dangerous Dave)
- [ ] Console body design is original (not a replica of DMG-01 or any specific device)
- [ ] All game names are original (Bouncer, BlockFall, Rooftop Cat / Mochi's Run)
- [ ] All pixel art sprites are original drawings
