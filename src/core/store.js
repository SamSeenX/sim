import { emit } from './event-bus.js';

const DEFAULTS = {
  theme: 'ironside',
  scores: { bouncer: 0, blockfall: 0, rooftop: 0 },
  activeGame: null,
};

let state = { ...DEFAULTS };

function load() {
  try {
    const t = localStorage.getItem('pv_theme');
    if (t) state.theme = t;
    const s = localStorage.getItem('pv_scores');
    if (s) state.scores = JSON.parse(s);
  } catch (_) { /* corrupt storage — fallback to defaults */ }
}

function save() {
  try {
    localStorage.setItem('pv_theme', state.theme);
    localStorage.setItem('pv_scores', JSON.stringify(state.scores));
  } catch (_) { /* storage quota exceeded */ }
}

export function initStore() {
  load();
  return {
    getTheme: () => state.theme,
    setTheme(t) {
      state.theme = t;
      save();
      emit('theme:change', t);
    },
    getScore: game => (state.scores && state.scores[game]) || 0,
    getScores: () => ({ ...state.scores }),
    setScore(game, score) {
      if (score > (state.scores[game] || 0)) {
        state.scores[game] = score;
        save();
        emit('score:update', { game, score });
      }
    },
    getActiveGame: () => state.activeGame,
    setActiveGame(name) {
      state.activeGame = name;
      emit('game:change', name);
    },
  };
}
