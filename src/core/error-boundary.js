export function initErrorBoundary() {
  window.addEventListener('error', e => {
    console.error('[PixelVault] Unhandled error:', e.message);
    showErrorToast(e.message);
  });
  window.addEventListener('unhandledrejection', e => {
    console.error('[PixelVault] Unhandled promise rejection:', e.reason);
    showErrorToast(String(e.reason));
  });
}

function showErrorToast(msg) {
  const existing = document.getElementById('pv-error-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'pv-error-toast';
  el.textContent = `Error: ${msg}`;
  el.style.cssText = `
    position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
    background:#c0152a;color:#fff;padding:8px 16px;border-radius:4px;
    font-family:monospace;font-size:12px;z-index:9999;max-width:90vw;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}
