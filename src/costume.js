// =============================== 3.0 · sprint 29 : étoffes et usure des costumes ===============================
// Les textures (tools/textures.py) sont posées en incrustation sur le pourpoint et la cape, dans le repère du corps : elles suivent
// chaque mouvement. L'étoffe dépend de la tenue (brocart des dames et des gentilshommes, cuir des rôdeurs, laine des paysans et des moines).
// Au fil du duel, la poussière et les taches gagnent le costume du combattant touché.
const FABRIC_OF = { renaissance: 'serge', dame: 'brocart', rodeur: 'cuir', paysan: 'laine', moine: 'laine' };
const Costume = {
  pat: {}, ready: false, scale: .32,
  on() { return store.get('ct2d.etoffes', true) !== false && typeof TEXTURES !== 'undefined'; },
  load() { if (typeof TEXTURES === 'undefined') return; let n = 0; const keys = Object.keys(TEXTURES); for (const k of keys) { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; c.getContext('2d').drawImage(i, 0, 0); this.src = this.src || {}; this.src[k] = c; if (++n === keys.length) this.ready = true; }; i.src = TEXTURES[k]; } },
  pattern(g, k) { const s = this.src && this.src[k]; if (!s) return null; const P = g.createPattern(s, 'repeat'); if (P && P.setTransform && typeof DOMMatrix !== 'undefined') P.setTransform(new DOMMatrix().scale(this.scale)); return P; },
  fabric(f, S) { return (f.look && f.look.fabric) || FABRIC_OF[S.style] || 'serge'; },
  wear(f) { if (!f || f.state === 'cine' || G.state === 'menu' || G.state === 'scene') return 0; return clamp((100 - (f.hp == null ? 100 : f.hp)) / 100 * .9 + (f.marks ? f.marks.length * .05 : 0), 0, 1); },
  // incrustation sur le chemin courant (déjà rempli par la couleur et l'ombrage)
  overlay(g, f, S, k, a) {
    if (!this.on() || !this.ready || f.flash > 0) return; const P = this.pattern(g, k); if (!P) return;
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = a; g.fillStyle = P; g.fill();
    const w = this.wear(f); if (w > .05) { const D = this.pattern(g, 'salissure'); if (D) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = w * .55; g.fillStyle = D; g.fill(); } }
    g.restore();
  },
  init() {
    this.load();
    const ft = fillTorso; fillTorso = function (g, f, S, col, C, d) { const sf = g.stroke; let painted = false; g.stroke = function () { if (!painted) { painted = true; Costume.overlay(g, f, S, Costume.fabric(f, S), S.style === 'dame' ? .55 : .45); } return sf.apply(this, arguments); }; try { return ft.apply(this, arguments); } finally { delete g.stroke; } };
    const P = V2.panel('options'), row = $('optGL') && $('optGL').parentElement; if (row && !$('optFab')) { const b = document.createElement('button'); b.className = 'opt small'; b.id = 'optFab'; b.textContent = 'Étoffes et usure'; b.setAttribute('aria-pressed', this.on()); b.addEventListener('click', () => { store.set('ct2d.etoffes', !this.on()); b.setAttribute('aria-pressed', this.on()); }); row.appendChild(b); }
  },
};
