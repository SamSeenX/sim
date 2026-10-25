import { blitToDisplay } from '../console/screen.js';

export class GameBase {
  constructor(store) {
    this.store = store;
    this._raf = null;
    this._last = 0;
  }

  init() {}
  tick(_dt) {}
  render() {}
  destroy() { this.stop(); }

  start() {
    this.init();
    this.resume();
  }

  stop() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  pause() {
    this.stop();
  }

  resume() {
    if (this._raf) return;
    const loop = ts => {
      const dt = Math.min((ts - this._last) / 1000, 0.05);
      this._last = ts;
      this.tick(dt);
      this.render();
      blitToDisplay();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(ts => {
      this._last = ts;
      loop(ts);
    });
  }
}
