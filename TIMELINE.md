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
- **Architecture Validation**: Maintained strict compliance with the 200-line modularity rule across all source files.

## Active Backlog
- [ ] Cartridge insertion sound effect and splash animation.
- [ ] Sound volume toggle slider in bottom phone jack area.
