# PixelVault — BRAIN

## Architectural Philosophy
PixelVault is designed around the pure web platform and zero runtime dependencies:
- **Display Engine**: 160x144 logical VRAM backing a typed `Uint8Array`. Renderers blit 2-bit shade indices (0..3) mapped dynamically to active LCD palette themes via CSS variables.
- **Micro-Framework**: Decoupled `EventBus` (`core/event-bus.js`) and reactive `Store` (`core/store.js`) handle state subscriptions and input propagation without circular imports.
- **Audio Synthesis**: Pure WebAudio API synthesizer (`core/audio.js`) generating square, triangle, and noise waveforms for authentic 8-bit sound without external audio files.
- **Modular Game Structure**: Every game subclasses `GameBase` and is split into `<game>-data.js`, `<game>-render.js`, and `<game>.js` to ensure clean separation of concerns and strict adherence to the 200-line rule.

## PWA & Storage Architecture
- **Persistent Storage**: Startup requests storage durability via `navigator.storage.persist()`.
- **Local Storage**: High scores and themes stored with error resilience.
- **Service Worker (`public/sw.js`)**: Resilient offline caching using stale-while-revalidate for static assets, network-first for navigation, and selective ignoring of Vite dev HMR.
- **Web App Manifest**: Valid 192x192, 512x512, and SVG icons for cross-platform installability.

## 200-Line Limit Rule
Every JavaScript and CSS file strictly stays under 200 lines (proactively split around 180 lines).
