# PixelVault — Brain

## Stack
Vite + Vanilla JS ES6 + Plain CSS. No frameworks. No external UI libs. No game engines.

## 200-line rule
Every .js and .css file must stay under 200 lines. Proactively split modules at ~180 lines.

## Architecture
- core/       — event-bus, store, error-boundary
- console/    — shell, screen, controls, haptics, theme-switcher
- games/      — game-base, menu, bouncer/, blockfall/, rooftop-cat/
- styles/     — tokens, reset, shell, screen, controls, main

## Changelog
- 2026-10-22: Project scaffolded with Vite and initial vanilla structure.
