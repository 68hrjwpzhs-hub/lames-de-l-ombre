// =============================== version installable (PWA) : hors ligne, mise à jour proposée au menu seulement ===============================
const GAME_VERSION = '4.0.0';
const PWA = {
  init() {
    const v = $('verLine'); if (v) v.textContent = 'Version ' + GAME_VERSION + (this.installed() ? ' · installée' : '');
    // seulement dans la version installable (fichier manifeste présent), jamais sur claude.ai
    if (!('serviceWorker' in navigator) || !document.querySelector('link[rel="manifest"]') || (location.protocol !== 'https:' && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname))) return;
    navigator.serviceWorker.register('./sw.js').then(reg => {
      const offer = w => { const b = $('pwaUpdate'); if (!b || !w) return; b.hidden = false; b.onclick = () => { Save.persist(); w.postMessage('skipWaiting'); }; };
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener('updatefound', () => { const w = reg.installing; w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); }); });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => { }); });
    }).catch(() => { });
    let reloaded = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded) return; reloaded = true; location.reload(); });
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { }); // demander au système de ne pas effacer la sauvegarde
  },
  installed() { return (window.matchMedia && matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches) || navigator.standalone === true; },
};
