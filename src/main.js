import { initErrorBoundary } from './core/error-boundary.js';
import { initStore }         from './core/store.js';
import { initAudio }         from './core/audio.js';
import { initShell }         from './console/shell.js';
import { on }                from './core/event-bus.js';
import { MenuGame }          from './games/menu.js';
import { showExitDialog, isExitDialogOpen } from './console/exit-dialog.js';

initErrorBoundary();
initAudio();
const store = initStore();
initShell(store);

// Request persistent storage for durability
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

let activeGame = null;
let currentGameName = 'menu';

const GAME_LOADERS = {
  menu: (s) => new MenuGame(s),
  bouncer: async (s) => new (await import('./games/bouncer/bouncer.js')).BouncerGame(s),
  blockfall: async (s) => new (await import('./games/blockfall/blockfall.js')).BlockFallGame(s),
  'rooftop-cat': async (s) => new (await import('./games/rooftop-cat/rooftop.js')).RooftopGame(s),
  snake: async (s) => new (await import('./games/snake/snake.js')).SnakeGame(s),
  defender: async (s) => new (await import('./games/defender/defender.js')).DefenderGame(s),
  'pixel-drift': async (s) => new (await import('./games/drift/drift.js')).DriftGame(s),
  'ghost-maze': async (s) => new (await import('./games/maze/maze.js')).MazeGame(s),
  'micro-sweeper': async (s) => new (await import('./games/sweeper/sweeper.js')).SweeperGame(s),
  'orbit-buster': async (s) => new (await import('./games/orbit/orbit.js')).OrbitGame(s),
  'tiny-rogue': async (s) => new (await import('./games/rogue/rogue.js')).RogueGame(s),
  'river-hop': async (s) => new (await import('./games/river-hop/river.js')).RiverGame(s),
  lander: async (s) => new (await import('./games/lander/lander.js')).LanderGame(s),
  sokoban: async (s) => new (await import('./games/sokoban/sokoban.js')).SokobanGame(s),
};

export async function loadGame(name, s) {
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
  }

  currentGameName = name;
  const currentStore = s || store;
  const loader = GAME_LOADERS[name];
  if (loader) {
    activeGame = await loader(currentStore);
    activeGame.start();
  }
}

on('game:exit', () => {
  if (currentGameName === 'menu' || isExitDialogOpen()) return;

  if (activeGame && activeGame.pause) {
    activeGame.pause();
  }

  showExitDialog({
    onConfirm: () => {
      loadGame('menu', store);
    },
    onCancel: () => {
      if (activeGame && activeGame.resume) {
        activeGame.resume();
      }
    }
  });
});

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
