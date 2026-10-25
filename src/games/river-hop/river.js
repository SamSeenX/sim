import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { GRID_SIZE, NUM_ROWS, START_ROW, START_COL, createLanes } from './river-data.js';
import { renderRiver } from './river-render.js';

export class RiverGame extends GameBase {
  constructor(store) {
    super(store);
    this.state = this._createInitialState();
    this._onDown = this._onDown.bind(this);
  }

  init() { on('input:down', this._onDown); }
  destroy() { off('input:down', this._onDown); super.destroy(); }

  _createInitialState() {
    return {
      phase: 'play',
      score: 0,
      lives: 3,
      timer: 30,
      frog: { x: START_COL * GRID_SIZE, row: START_ROW },
      lanes: createLanes(),
      goals: [false, false, false, false]
    };
  }

  _onDown(a) {
    const s = this.state;
    if (s.phase === 'ready') {
      if (a === 'a' || a === 'start') { s.phase = 'play'; emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'gameover' || s.phase === 'win') {
      if (a === 'a' || a === 'start') { this.state = this._createInitialState(); this.state.phase = 'play'; emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'paused') {
      if (a === 'start') { s.phase = 'play'; emit('audio:play', 'cursor'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (a === 'start') { s.phase = 'paused'; emit('audio:play', 'cursor'); return; }
    if (a === 'b' || a === 'select') { emit('game:exit'); return; }

    // Frog Hop
    if (a === 'up' && s.frog.row > 0)    { s.frog.row--; s.score += 10; emit('audio:play', 'jump'); }
    if (a === 'down' && s.frog.row < NUM_ROWS - 1) { s.frog.row++; emit('audio:play', 'jump'); }
    if (a === 'left')  { s.frog.x = Math.max(4, s.frog.x - GRID_SIZE); emit('audio:play', 'jump'); }
    if (a === 'right') { s.frog.x = Math.min(146, s.frog.x + GRID_SIZE); emit('audio:play', 'jump'); }

    if (s.frog.row === 0) this._checkGoal();
  }

  tick(dt) {
    const s = this.state;
    if (s.phase !== 'play') return;

    // Timer countdown
    s.timer -= dt;
    if (s.timer <= 0) { this._frogDie(); return; }

    // Move lanes
    for (let r = 0; r < NUM_ROWS; r++) {
      const lane = s.lanes[r];
      if (lane.speed !== 0) {
        lane.offset = (lane.offset + lane.speed * dt) % (160 + lane.itemW + lane.gap);
      }
    }

    // Check Current Lane
    const curLane = s.lanes[s.frog.row];
    if (curLane.type === 'river') {
      // Must be on log
      const log = this._getLogUnderFrog(curLane, s.frog.x);
      if (log) {
        s.frog.x += curLane.speed * dt;
        if (s.frog.x < 0 || s.frog.x > 150) this._frogDie();
      } else {
        this._frogDie();
      }
    } else if (curLane.type === 'road') {
      // Must NOT hit car
      if (this._hitCar(curLane, s.frog.x)) {
        this._frogDie();
      }
    }
  }

  _getLogUnderFrog(lane, fx) {
    const span = lane.itemW + lane.gap;
    for (let x = -lane.itemW; x < 160 + lane.itemW; x += span) {
      const drawX = Math.round((x + lane.offset) % (160 + lane.itemW) - lane.itemW);
      if (fx + 5 >= drawX && fx + 5 <= drawX + lane.itemW) return true;
    }
    return false;
  }

  _hitCar(lane, fx) {
    const span = lane.itemW + lane.gap;
    for (let x = -lane.itemW; x < 160 + lane.itemW; x += span) {
      const drawX = Math.round((x + lane.offset) % (160 + lane.itemW) - lane.itemW);
      if (fx + 8 >= drawX && fx + 2 <= drawX + lane.itemW) return true;
    }
    return false;
  }

  _checkGoal() {
    const s = this.state;
    const fx = s.frog.x + 5;
    let docked = false;
    for (let g = 0; g < 4; g++) {
      const gx = 16 + g * 36;
      if (fx >= gx && fx <= gx + 16 && !s.goals[g]) {
        s.goals[g] = true;
        s.score += 200 + Math.ceil(s.timer) * 10;
        this.store.setScore('river-hop', s.score);
        emit('audio:play', 'powerup');
        docked = true;
        break;
      }
    }

    if (docked) {
      if (s.goals.every(Boolean)) {
        s.phase = 'win';
      } else {
        s.frog = { x: START_COL * GRID_SIZE, row: START_ROW };
        s.timer = 30;
      }
    } else {
      this._frogDie();
    }
  }

  _frogDie() {
    const s = this.state;
    emit('audio:play', 'gameover');
    s.lives--;
    if (s.lives <= 0) {
      s.phase = 'gameover';
    } else {
      s.frog = { x: START_COL * GRID_SIZE, row: START_ROW };
      s.timer = 30;
    }
  }

  render() { renderRiver(this.state); }
}
