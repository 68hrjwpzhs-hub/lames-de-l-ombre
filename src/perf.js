// =============================== compteur de performance (Réglages → Mesure, ou adresse terminée par #perf) ===============================
// Mesure le vrai temps entre deux images (pas seulement le calcul), les pas de simulation par image et le coût du rendu.
const Perf = {
  on: false, iv: [], cpu: [], steps: [0, 0, 0, 0], el: null, last: 0,
  init() {
    try { this.on = location.hash.includes('perf') || store.get('ct2d.perf', false); } catch (e) { }
    const b = $('optPerf'); if (b) { b.setAttribute('aria-pressed', this.on); b.addEventListener('click', () => { this.toggle(); b.setAttribute('aria-pressed', this.on); }); }
    if (this.on) this.show();
  },
  toggle() { this.on = !this.on; store.set('ct2d.perf', this.on); if (this.on) this.show(); else if (this.el) this.el.hidden = true; },
  show() {
    if (!this.el) { const d = document.createElement('div'); d.id = 'perfBox'; d.innerHTML = '<pre></pre><button type="button">Copier</button>';
      d.style.cssText = 'position:fixed;left:calc(env(safe-area-inset-left) + 6px);top:6px;z-index:50;background:rgba(10,8,10,.78);color:#e8f4d8;font:11px/1.3 ui-monospace,Menlo,monospace;padding:6px 8px;border:1px solid rgba(216,178,94,.5);border-radius:4px;pointer-events:auto;max-width:230px';
      d.querySelector('button').style.cssText = 'margin-top:4px;font:700 11px sans-serif;padding:6px 10px;min-height:32px;background:#3a2e1c;color:#fff3d6;border:1px solid #d8b25e;border-radius:3px';
      d.querySelector('button').addEventListener('click', async e => { e.stopPropagation(); const t = JSON.stringify(this.report()); try { await navigator.clipboard.writeText(t); e.target.textContent = 'Copié'; } catch (er) { prompt('Rapport de performance', t); } setTimeout(() => e.target.textContent = 'Copier', 1500); });
      document.body.appendChild(d); this.el = d; }
    this.el.hidden = false;
  },
  // appelé par G.frame : intervalle réel, calcul du rendu, pas de simulation de cette image
  sample(interval, cpu, n) {
    this.iv.push(interval); this.cpu.push(cpu); if (this.iv.length > 240) { this.iv.shift(); this.cpu.shift(); } this.steps[Math.min(3, n)]++;
    if (!this.on || !this.el || this.el.hidden) return; const now = performance.now(); if (now - this.last < 250) return; this.last = now;
    const r = this.report(); this.el.querySelector('pre').textContent = `${r.fps} i/s · ${r.avg} ms\np95 ${r.p95} ms · pire ${r.worst} ms\nà-coups >20 ms : ${r.janks} %\npas/image 0:${r.st0}% 3+:${r.st3}%\nrendu (calcul) ${r.cpu} ms\nrendu cinéma ${r.paint} · k ${r.k}/${r.kMax}\ncanevas ${r.canvas}`;
  },
  report() {
    const a = this.iv.slice(-120), s = a.slice().sort((x, y) => x - y), n = a.length || 1, avg = a.reduce((x, y) => x + y, 0) / n, tot = this.steps.reduce((x, y) => x + y, 0) || 1, c = G.cv || {};
    return { fps: Math.round(1000 / (avg || 16.7)), avg: +avg.toFixed(1), p95: +(s[Math.floor(n * .95)] || 0).toFixed(1), worst: +(s[n - 1] || 0).toFixed(1), janks: Math.round(a.filter(x => x > 20).length / n * 100),
      st0: Math.round(this.steps[0] / tot * 100), st3: Math.round(this.steps[3] / tot * 100), cpu: +(this.cpu.slice(-120).reduce((x, y) => x + y, 0) / n).toFixed(1),
      paint: Paint.on ? 'oui' : 'non', k: Paint.k, kMax: Paint.kMax, canvas: `${c.width}×${c.height}`, dpr: devicePixelRatio, ua: navigator.userAgent.slice(0, 80), venue: G.venue, state: G.state };
  },
};
