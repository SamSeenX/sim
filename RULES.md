# PixelVault — Project Rules & Constraints

## 1. Modularity & 200-Line Rule
- Strict hard ceiling: 200 lines per file (`.js`, `.css`).
- Proactively split modules at ~180 lines into single-responsibility helpers.
- Clean separation of concerns (`core/`, `console/`, `games/<game>/`, `styles/`).

## 2. Vanilla Philosophy
- Standard Vanilla JavaScript (ES6+ modules) and Plain Vanilla CSS only.
- Strictly zero third-party UI runtime dependencies (no React, no Tailwind, no external game engines).
- Vite as dev server and build tool with modern ES target (`es2022`).

## 3. Storage & Resilience
- Tier 1: LocalStorage for lightweight config (theme, scores) wrapped in safe try/catch.
- Offline-first Service Worker with stale-while-revalidate for assets and network-first navigation fallback.
- Auto-request persistent storage (`navigator.storage.persist()`) on boot.

## 4. Audio & Controls Standard
- Dynamic WebAudio oscillators for sounds (square, triangle, noise).
- 48px touch targets for mobile accessibility.
- Keyboard + Touch controls simultaneously supported.
