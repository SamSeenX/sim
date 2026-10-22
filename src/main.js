import { initErrorBoundary } from './core/error-boundary.js';
import { initStore }         from './core/store.js';
import { initShell }         from './console/shell.js';
import { on }                from './core/event-bus.js';
import { MenuGame }          from './games/menu.js';

initErrorBoundary();
const store = initStore();
initShell(store);

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
}

on('game:exit', () => loadGame('menu', store));

// Start on main menu
loadGame('menu', store);
