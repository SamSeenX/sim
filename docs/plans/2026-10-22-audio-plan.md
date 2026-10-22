# Retro 8-Bit Audio System Plan

## Overview
Implement an authentic 8-bit chiptune sound synthesizer using the Web Audio API (`AudioContext`).
Classic handhelds had 4 audio channels: Pulse/Square Wave 1, Pulse/Square Wave 2, Wave (custom), and Noise.
We will build a lightweight retro sound driver producing distinct chiptune sound effects:
- `click`: crisp button navigation / menu cursor move
- `blip`: selection / game launch
- `jump`: pitch-slide upward square wave
- `brick`: square wave hit impact
- `bounce`: low-to-mid frequency paddle bounce
- `powerup`: rising two-tone arpeggio
- `line`: high-pitched multi-tone chime for line clear
- `collect`: sparkling coin/fish pickup
- `gameover`: descending sad retro chromatic sweep
- `explosion`: white noise burst for game over or hazard collision

## Architecture
- `src/core/audio.js` (< 150 lines): AudioContext manager with synthesized 8-bit sound effects. Automatically resumes audio context upon first user gesture.
- Connect to `event-bus.js` on audio events: `audio:play(soundName)` so all games and UI buttons can trigger audio with zero tight coupling.
- Add audio event triggers in `menu.js`, `controls.js`, `bouncer.js`, `blockfall.js`, and `rooftop.js`.
- Add a retro speaker mute/unmute toggle in `shell.js` / `shell.css`.
