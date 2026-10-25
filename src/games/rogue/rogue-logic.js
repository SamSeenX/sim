import { emit } from '../../core/event-bus.js';
import { createRoom, TILE_SIZE, COLS, ROWS, T_WALL, T_DOOR, T_CHEST, T_KEY } from './rogue-data.js';

export function attackEnemies(state, store) {
  const p = state.player;
  if (p.slashTimer > 0) return;
  p.slashTimer = 0.2;
  emit('audio:play', 'laser');

  let hx = p.x + 4, hy = p.y + 4;
  if (p.dir === 'up')    hy -= 8;
  if (p.dir === 'down')  hy += 8;
  if (p.dir === 'left')  hx -= 8;
  if (p.dir === 'right') hx += 8;

  for (let i = state.room.enemies.length - 1; i >= 0; i--) {
    const en = state.room.enemies[i];
    if (Math.hypot(en.x + 4 - hx, en.y + 4 - hy) < 10) {
      en.hp--;
      emit('audio:play', 'noise');
      if (en.hp <= 0) {
        state.score += 50;
        store.setScore('tiny-rogue', state.score);
        state.room.enemies.splice(i, 1);
      }
    }
  }
}

export function collidesWithWall(room, x, y) {
  const c = Math.floor((x + 4) / TILE_SIZE);
  const r = Math.floor((y + 4) / TILE_SIZE);
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
  return room.map[r][c] === T_WALL;
}

export function handleTileInteractions(state, store) {
  const p = state.player;
  const c = Math.floor((p.x + 4) / TILE_SIZE);
  const r = Math.floor((p.y + 4) / TILE_SIZE);
  const tile = state.room.map[r][c];

  if (tile === T_KEY) {
    state.room.map[r][c] = 0;
    p.keys++;
    state.score += 25;
    store.setScore('tiny-rogue', state.score);
    emit('audio:play', 'collect');
  } else if (tile === T_CHEST && p.keys > 0) {
    state.room.map[r][c] = 0;
    p.keys--;
    state.score += 100;
    store.setScore('tiny-rogue', state.score);
    emit('audio:play', 'powerup');
  } else if (tile === T_DOOR) {
    if (state.roomIdx < 2) {
      state.roomIdx++;
      state.room = createRoom(state.roomIdx);
      p.x = 6 * TILE_SIZE;
      p.y = 5 * TILE_SIZE;
      emit('audio:play', 'select');
    } else {
      state.phase = 'win';
      emit('audio:play', 'powerup');
    }
  }
}
