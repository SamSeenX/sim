import { emit } from './event-bus.js';

const DEFAULTS = {
  theme: 'ironside',
  lcdMode: 'matrix',
  scores: {
    bouncer: 0,
    blockfall: 0,
    rooftop: 0,
    'rooftop-cat': 0,
    snake: 0,
    defender: 0,
    'pixel-drift': 0,
    'ghost-maze': 0,
    'micro-sweeper': 0
  },
  activeGame: null,
};

let state = { ...DEFAULTS };

function load() {
  try {
    const t = localStorage.getItem('pv_theme');
    if (t) state.theme = t;
    const lm = localStorage.getItem('pv_lcd_mode');
    if (lm && ['matrix', 'crisp', 'scanline'].includes(lm)) state.lcdMode = lm;
    const s = localStorage.getItem('pv_scores');
    if (s) {
      const parsed = JSON.parse(s);
      state.scores = { ...DEFAULTS.scores, ...parsed };
    }
  } catch (_) { /* corrupt storage — fallback to defaults */ }
}

function save() {
  try {
    localStorage.setItem('pv_theme', state.theme);
    localStorage.setItem('pv_lcd_mode', state.lcdMode);
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
    getLcdMode: () => state.lcdMode || 'matrix',
    setLcdMode(mode) {
      state.lcdMode = mode;
      save();
      emit('lcd:change', mode);
    },
    getScore(game) {
      if (!state.scores) return 0;
      if (state.scores[game] !== undefined) return state.scores[game];
      if (game === 'rooftop-cat') return state.scores.rooftop || 0;
      if (game === 'rooftop') return state.scores['rooftop-cat'] || 0;
      return 0;
    },
    getScores: () => ({ ...state.scores }),
    setScore(game, score) {
      const current = this.getScore(game);
      if (score > current) {
        state.scores[game] = score;
        if (game === 'rooftop-cat') state.scores.rooftop = score;
        if (game === 'rooftop') state.scores['rooftop-cat'] = score;
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
