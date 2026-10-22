import { initErrorBoundary } from './core/error-boundary.js';
import { initStore }         from './core/store.js';
import { initAudio }         from './core/audio.js';
import { initShell }         from './console/shell.js';
import { on }                from './core/event-bus.js';
import { MenuGame }          from './games/menu.js';

initErrorBoundary();
initAudio();
const store = initStore();
initShell(store);

// Request persistent storage for durability
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

let activeGame = null;

export function loadGame(name, s) {
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
  }

  const currentStore = s || store;

  if (name === 'menu') {
    activeGame = new MenuGame(currentStore);
    activeGame.start();
    return;
  }

  if (name === 'bouncer') {
    import('./games/bouncer/bouncer.js').then(m => {
      activeGame = new m.BouncerGame(currentStore);
      activeGame.start();
    });
    return;
  }

  if (name === 'blockfall') {
    import('./games/blockfall/blockfall.js').then(m => {
      activeGame = new m.BlockFallGame(currentStore);
      activeGame.start();
    });
    return;
  }

  if (name === 'rooftop-cat') {
    import('./games/rooftop-cat/rooftop.js').then(m => {
      activeGame = new m.RooftopGame(currentStore);
      activeGame.start();
    });
    return;
  }

  if (name === 'snake') {
    import('./games/snake/snake.js').then(m => {
      activeGame = new m.SnakeGame(currentStore);
      activeGame.start();
    });
    return;
  }

  if (name === 'defender') {
    import('./games/defender/defender.js').then(m => {
      activeGame = new m.DefenderGame(currentStore);
      activeGame.start();
    });
    return;
  }

  if (name === 'pixel-drift') {
    import('./games/drift/drift.js').then(m => {
      activeGame = new m.DriftGame(currentStore);
      activeGame.start();
    });
    return;
  }

  if (name === 'ghost-maze') {
    import('./games/maze/maze.js').then(m => {
      activeGame = new m.MazeGame(currentStore);
      activeGame.start();
    });
    return;
  }

  if (name === 'micro-sweeper') {
    import('./games/sweeper/sweeper.js').then(m => {
      activeGame = new m.SweeperGame(currentStore);
      activeGame.start();
    });
    return;
  }
}

on('game:exit', () => loadGame('menu', store));

// Start on main menu
loadGame('menu', store);

// Register Service Worker for PWA offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('[PWA] Service worker registration failed:', err);
    });
  });
}
