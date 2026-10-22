export function pulse(ms = 30) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch (_) {}
  }
}

export function pattern(arr) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(arr);
    } catch (_) {}
  }
}
