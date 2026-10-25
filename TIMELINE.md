# PixelVault — Milestone Roadmap & Timeline

## Milestones & Completed Features

### Milestone 1: Console Hardware & Core Engine (Completed)
- Handheld hardware shell with authentic D-Pad, slanted A/B action buttons, Select/Start, and speaker grille.
- 160x144 LCD dot-matrix canvas renderer with theme switcher.
- Audio synthesizer for retro chiptune SFX.
- Initial games: Bouncer, BlockFall, Rooftop Cat.

### Milestone 2: Game Polish, New Games & PWA Durability (Completed)
- **BlockFall Control Improvements**: Replaced fast-forward on `A` button with piece rotation + wall-kicks; down arrow controls soft drop. Fixed runaway speed curve by scaling levels with lines cleared instead of score multipliers.
- **Store & Snake Stability**: Added `getScore(game)` to central Store, resolving the runtime error on Snake game launch.
- **BlockFall Next Piece HUD**: Implemented next piece sidebar preview box matching authentic Game Boy Tetris layout.
- **PWA Repair & Enhancement**: Replaced placeholder 1x1 icons with genuine 192x192 & 512x512 PNG icons; updated manifest; enhanced service worker caching and offline navigation.
- **New Game — Snake**: Added complete retro grid snake with turn input buffering, apple food, and score persistence.
- **New Game — Defender**: Added space shooter featuring parallax scrolling starfield, alien formation sway and dive, laser blasters, and explosions.
- **New Game — Pixel Drift**: Added top-down arcade highway racer with 3-lane road scrolling, traffic dodging, oil slicks, turbo boost on [A], and audio.
- **New Game — Ghost Maze**: Added authentic arcade labyrinth maze with pellet chomping, power pellets, frightened ghost hunting, and score persistence.
- **New Game — Micro Sweeper**: Added 12x10 minefield with safe first-tap guarantee, flood fill, flag toggles on [B], and timer records.
- **Universal High Scores & Menu Scrolling**: Connected durable high score tracking across all 8 games with dynamic scroll-windowed main menu navigation.
- **Architecture Validation**: Maintained strict compliance with the 200-line modularity rule across all source files.

### Milestone 3: Retro LCD Engine Overhaul & Visual Polish (Completed)
- **Eliminated Messy Grid Aliasing**: Replaced CPU-heavy, 23,040-path `displayCtx.rect` loops and non-integer cell rounding with a native 160x144 pixel-perfect `ImageData` 32-bit blitter.
- **Harmonious Reflective Palettes**: Refined substrate gap colors across all 4 themes (`ironside`, `phantom`, `ivory`, `midnight`) to remove harsh high-contrast dark green grid lines.
- **Multi-Mode LCD Visual Engine**: Added interactive bezel toggle for cycling between `LCD: MATRIX` (authentic STN dot-matrix with glass sheen and vignette), `LCD: CRISP` (clean modern 8-bit pixels), and `LCD: CRT` (classic scanlines).
- **Persistent LCD Preference**: Integrated screen mode state into `Store` with local storage durability.

## Active Backlog
- [ ] Cartridge insertion sound effect and splash animation.
- [ ] Sound volume toggle slider in bottom phone jack area.
