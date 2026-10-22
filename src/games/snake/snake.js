import { GameBase } from '../game-base.js';
import { on, off, emit } from '../../core/event-bus.js';
import { renderSnake } from './snake-render.js';
import { COLS, ROWS, DIRS, INITIAL_SNAKE, BASE_SPEED, MIN_SPEED } from './snake-data.js';

export class SnakeGame extends GameBase {
  constructor(store) {
    super(store);
    this._onInput = this._onInput.bind(this);
    this._stepTimer = 0;
    this._inputQueue = [];
  }

  init() {
    on('input:down', this._onInput);
    this._restart();
  }

  destroy() {
    off('input:down', this._onInput);
    super.destroy();
  }

  _restart() {
    const hi = this.store.getScore('snake') || 0;
    this.state = {
      snake: INITIAL_SNAKE.map(s => ({ ...s })),
      dir: { ...DIRS.right },
      nextDir: { ...DIRS.right },
      food: null,
      score: 0,
      hiScore: hi,
      phase: 'play',
      anim: 0
    };
    this._inputQueue = [];
    this._stepTimer = 0;
    this._spawnFood();
  }

  _spawnFood() {
    const s = this.state;
    const occupied = new Set(s.snake.map(p => `${p.x},${p.y}`));
    const emptyCells = [];
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        if (!occupied.has(`${x},${y}`)) emptyCells.push({ x, y });
      }
    }
    if (emptyCells.length === 0) {
      s.phase = 'gameover';
      return;
    }
    s.food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  _onInput(a) {
    const s = this.state;
    if (s.phase === 'paused') {
      if (a === 'start') { s.phase = 'play'; emit('audio:play', 'cursor'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (s.phase === 'gameover') {
      if (a === 'a' || a === 'start') { this._restart(); emit('audio:play', 'select'); }
      else if (a === 'b' || a === 'select') emit('game:exit');
      return;
    }
    if (a === 'start') {
      s.phase = 'paused';
      emit('audio:play', 'cursor');
      return;
    }
    if (a === 'b' || a === 'select') {
      emit('game:exit');
      return;
    }

    // Direction queuing (max 2 queued turns)
    const targetDir = DIRS[a];
    if (targetDir && this._inputQueue.length < 2) {
      const lastDir = this._inputQueue.length > 0
        ? this._inputQueue[this._inputQueue.length - 1]
        : s.dir;
      // Disallow 180 degree turns
      if (lastDir.x + targetDir.x !== 0 || lastDir.y + targetDir.y !== 0) {
        this._inputQueue.push(targetDir);
      }
    }
  }

  tick(dt) {
    const s = this.state;
    s.anim += dt;
    if (s.phase !== 'play') return;

    const currentSpeed = Math.max(MIN_SPEED, BASE_SPEED - (s.score * 0.003));
    this._stepTimer += dt;

    if (this._stepTimer >= currentSpeed) {
      this._stepTimer -= currentSpeed;
      this._step();
    }
  }

  _step() {
    const s = this.state;
    if (this._inputQueue.length > 0) {
      s.dir = this._inputQueue.shift();
    }

    const head = s.snake[0];
    const newHead = { x: head.x + s.dir.x, y: head.y + s.dir.y };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
      this._gameOver();
      return;
    }

    // Self collision
    for (let i = 0; i < s.snake.length - 1; i++) {
      if (s.snake[i].x === newHead.x && s.snake[i].y === newHead.y) {
        this._gameOver();
        return;
      }
    }

    s.snake.unshift(newHead);

    // Food collision
    if (s.food && newHead.x === s.food.x && newHead.y === s.food.y) {
      s.score += 10;
      if (s.score > s.hiScore) {
        s.hiScore = s.score;
        this.store.setScore('snake', s.hiScore);
      }
      emit('audio:play', 'collect');
      this._spawnFood();
    } else {
      s.snake.pop();
    }
  }

  _gameOver() {
    this.state.phase = 'gameover';
    emit('audio:play', 'gameover');
  }

  render() {
    renderSnake(this.state);
  }
}
