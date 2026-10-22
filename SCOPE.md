# PixelVault — Project Scope

## In-Scope Features
- **Console Simulation**: 160x144 dot-matrix display, responsive touch controls, customizable themes.
- **Classic Games Library**:
  - `BOUNCER`: Breakout paddle and destructible brick tiers.
  - `BLOCKFALL`: Tetris puzzle with A-button rotation, wall kicks, and next piece preview.
  - `ROOFTOP CAT`: Scrolling 2D platform runner with physics.
  - `SNAKE`: Grid-based serpent with speed ramp and input buffering.
  - `DEFENDER`: Vertical space shooter with parallax stars, formations, and lasers.
  - `PIXEL DRIFT`: Top-down 3-lane highway racer with turbo boost and obstacles.
  - `GHOST MAZE`: Arcade labyrinth chomp puzzle with pellets and ghosts.
  - `MICRO SWEEPER`: 12x10 minefield with recursive flood-fill and flagging.
- **PWA Durability**: Offline playability, web manifest, installable icon set.
- **Decoupled Architecture**: Vanilla EventBus, Store, and GameBase lifecycle (`init()`, `tick()`, `render()`, `destroy()`).

## Out-of-Scope Boundaries
- Multi-megabyte external asset packs (spritesheets, MP3s, fonts) — all graphics are procedurally generated in code or drawn as 1-bit bitmaps.
- Third-party game engines (Phaser, Three.js, Pixi.js) or UI frameworks.
- Server-side backends or cloud auth.
