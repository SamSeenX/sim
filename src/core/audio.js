import { on } from './event-bus.js';

let ctx = null;
let masterGain = null;
let muted = false;

function getContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function initAudio() {
  const unlock = () => {
    getContext();
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('mousedown', unlock);
  };
  window.addEventListener('keydown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('mousedown', unlock, { once: true });

  on('audio:play', soundName => {
    if (!muted) playSound(soundName);
  });
}

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(muted ? 0 : 0.12, ctx.currentTime);
  }
  return muted;
}

export function playSound(name) {
  const ac = getContext();
  if (!ac || muted) return;

  const t = ac.currentTime;

  if (name === 'cursor') {
    playTone(ac, t, 440, 0.04, 'square', 0.08);
  } else if (name === 'select') {
    playTone(ac, t, 587.33, 0.05, 'square', 0.1);
    playTone(ac, t + 0.06, 880, 0.09, 'square', 0.1);
  } else if (name === 'bounce') {
    playTone(ac, t, 220, 0.06, 'triangle', 0.12);
  } else if (name === 'brick') {
    playTone(ac, t, 523.25, 0.05, 'square', 0.1);
  } else if (name === 'jump') {
    playPitchSlide(ac, t, 160, 480, 0.14, 'square', 0.1);
  } else if (name === 'rotate') {
    playTone(ac, t, 330, 0.04, 'square', 0.08);
  } else if (name === 'drop') {
    playTone(ac, t, 140, 0.06, 'square', 0.1);
  } else if (name === 'line') {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      playTone(ac, t + i * 0.06, f, 0.08, 'square', 0.1);
    });
  } else if (name === 'collect') {
    playTone(ac, t, 987.77, 0.06, 'square', 0.1);
    playTone(ac, t + 0.07, 1318.51, 0.12, 'square', 0.1);
  } else if (name === 'powerup') {
    [330, 440, 554.37, 659.25].forEach((f, i) => {
      playTone(ac, t + i * 0.04, f, 0.06, 'square', 0.1);
    });
  } else if (name === 'laser') {
    playPitchSlide(ac, t, 900, 220, 0.08, 'sawtooth', 0.09);
  } else if (name === 'boost') {
    playPitchSlide(ac, t, 180, 420, 0.12, 'sawtooth', 0.08);
  } else if (name === 'screech') {
    playPitchSlide(ac, t, 600, 300, 0.09, 'triangle', 0.08);
  } else if (name === 'gameover') {
    [392, 349.23, 311.13, 261.63].forEach((f, i) => {
      playTone(ac, t + i * 0.1, f, 0.14, 'square', 0.12);
    });
  } else if (name === 'noise') {
    playNoise(ac, t, 0.18, 0.12);
  }
}

function playTone(ac, startTime, freq, duration, type, vol) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playPitchSlide(ac, startTime, freq1, freq2, duration, type, vol) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq1, startTime);
  osc.frequency.exponentialRampToValueAtTime(freq2, startTime + duration);

  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playNoise(ac, startTime, duration, vol) {
  const bufferSize = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ac.createBufferSource();
  noise.buffer = buffer;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  noise.connect(gain);
  gain.connect(masterGain);

  noise.start(startTime);
  noise.stop(startTime + duration);
}
