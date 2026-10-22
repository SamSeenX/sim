# Implementation Plan: Retro Authenticity, Real Pixel Grid, and Fullscreen Mobile

## Problem Analysis
1. **Graphics flow out / Fake overlay appearance**:
   - `screen.js` was trying to dynamically calculate `canvas.width = 160 * (pixelSize + 1)` which can clip or scale improperly against the flex container, causing canvas dimensions to overflow the bezel.
   - True pixel hardware behavior: The logical canvas should be strictly **160 × 144 native pixels** (or a fixed integer scale without arbitrary container overflow).
   - Drawing pixels: instead of doing raw canvas pixel scaling that breaks alignment, we draw discrete matrix pixels or render a crisp 160x144 internal framebuffer rendered onto the display canvas with an authentic LCD matrix shader/gap pattern that never overflows the viewport.
2. **Keybindings documentation / on-screen guide**:
   - Keys: `Arrow Keys` (D-pad), `Z` (A button), `X` (B button), `Enter` (Start), `Shift` (Select).
   - Also allow `W/A/S/D` and `J/K` or `Space` for convenience.
   - Show a subtle retro badge / label so the user knows desktop controls immediately.
3. **Mobile Fullscreen Handheld Feel**:
   - When on mobile (`max-width: 600px`), the console shouldn't just be an ordinary website. It should occupy 100vw and 100dvh with zero margin, ergonomic handheld thumb zones, curved authentic shoulder curves, and styled like you are gripping a physical console.
4. **Nostalgia & Industrial Design**:
   - The shell looks too modern/flat. Classic handhelds feature:
     - Slanted action buttons (B lower left, A upper right) in a recessed oval pill.
     - Authentic tactile D-pad with center circular indent and directional arrows.
     - Angled rubberized pill START / SELECT buttons.
     - Screen bezel with authentic tinted glass frame, power LED indicator (glowing red battery LED!), and retro stereo/mono headphone or volume bevels.
     - Authentic classic colorways (including the iconic retro DMG classic grey/off-white with purple/magenta buttons and dark grey bezel).

## Execution Steps
1. Update `src/styles/tokens.css` with iconic retro colorways (Classic 1989 DMG Gray + Magenta, Pocket Black, Atomic Clear/Teal, Cherry Red).
2. Fix `src/console/screen.js` to ensure the canvas strictly draws within its 160×144 pixel buffer, properly fitted to the bezel with zero overflow, and true sub-pixel LCD grid rendering.
3. Overhaul `src/console/shell.js` and `src/styles/shell.css` for deep retro nostalgia:
   - Slanted B/A pill button layout
   - Power LED indicator on the screen bezel
   - Realistic D-pad cross with engraved arrows and center divot
   - Angled rubber select/start buttons
   - Speaker slots angled or ribbed at the bottom right
   - Fullscreen edge-to-edge mobile handheld fit
4. Add secondary desktop keybindings (`WASD`, `J/K`, `Space`) in `src/console/controls.js`.
5. Verify build (`npm run build`).
