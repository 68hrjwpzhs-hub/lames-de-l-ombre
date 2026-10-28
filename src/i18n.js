// =============================== 2.0 · sprint 23 : langues et accessibilité ===============================
// Langue : tous les textes anglais sont réunis dans lang_en.js (généré depuis la liste des textes français du jeu).
// La traduction se fait à l'affichage : textes de la page (observés) et textes dessinés sur le canevas (fillText).
// Accessibilité : sous-titres des sons importants, mode daltonien (signal de parade bleu clair), mouvements réduits.
const I18N = {
  lang: 'fr', cache: new Map(), rx: [], subs: [], gloss: [], last: new WeakMap(),
  pick() { try { const q = new URLSearchParams(location.search).get('lang'); if (q === 'en' || q === 'fr') { store.set('ct2d.lang', q); return q; } } catch (e) { } return store.get('ct2d.lang', 'fr'); },
  set(l) { store.set('ct2d.lang', l); location.reload(); },
  prep() {
    const D = LANG_EN, esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    this.rx = D.tpl.map(([fr, en]) => { const parts = fr.split(/\{\d+\}/), ids = [...fr.matchAll(/\{(\d+)\}/g)].map(m => +m[1]); return { re: new RegExp('^' + parts.map(esc).join('([\\s\\S]*?)') + '$'), ids, en }; });
    this.subs = Object.keys(D.exact).filter(k => k.length >= 8).sort((a, b) => b.length - a.length);
    this.gloss = Object.keys(D.gloss).sort((a, b) => b.length - a.length).map(k => [new RegExp('(^|[^\\p{L}])' + esc(k) + '(?![\\p{L}])', 'gu'), D.gloss[k]]);
  },
  // traduit une chaîne affichée ; les morceaux inconnus restent en français
  tr(s) {
    if (this.lang !== 'en' || s == null) return s; s = String(s); if (!/[A-Za-zÀ-ÿ]/.test(s)) return s;
    const c = this.cache.get(s); if (c !== undefined) return c;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), out = (m[1] + this.core(m[2], 0) + m[3]).replace(/(\d),(\d)/g, '$1.$2'); // 0,12 s → 0.12 s
    if (this.cache.size > 6000) this.cache.clear(); this.cache.set(s, out); return out;
  },
  core(s, depth) {
    const D = LANG_EN; if (!s) return s; if (D.exact[s] !== undefined) return D.exact[s]; if (depth > 3) return s;
    for (const t of this.rx) { const m = t.re.exec(s); if (m) { let en = t.en; t.ids.forEach((id, i) => { en = en.split('{' + id + '}').join(this.core(m[i + 1], depth + 1)); }); return en; } }
    if (s.includes(' · ')) return s.split(' · ').map(x => this.core(x, depth + 1)).join(' · ');
    const nl = s.indexOf('\n'); if (nl > 0) return s.split('\n').map(x => this.core(x, depth + 1)).join('\n');
    if (/[.!?] \S/.test(s)) { const parts = s.split(/(?<=[.!?])\s+(?=\S)/); if (parts.length > 1) return parts.map(x => this.core(x, depth + 1)).join(' '); }
    let r = s; for (const k of this.subs) if (r.includes(k)) r = r.split(k).join(D.exact[k]);
    for (const [re, en] of this.gloss) r = r.replace(re, (all, pre) => pre + en);
    return r;
  },
  node(n) {
    if (n.nodeType === 3) { const p = n.parentNode; if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)) return; if (this.last.get(n) === n.data) return; const t = this.tr(n.data); if (t !== n.data) n.data = t; this.last.set(n, n.data); return; }
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.nodeName)) return;
    for (const a of ['title', 'placeholder', 'aria-label']) if (n.hasAttribute && n.hasAttribute(a)) { const v = n.getAttribute(a), t = this.tr(v); if (t !== v) n.setAttribute(a, t); }
    for (const ch of n.childNodes) this.node(ch);
  },
  init() {
    this.lang = this.pick();
    if (this.lang === 'en' && typeof LANG_EN !== 'undefined') {
      this.prep(); document.documentElement.lang = 'en'; document.title = this.tr(document.title);
      const P = CanvasRenderingContext2D.prototype, I = this;
      for (const k of ['fillText', 'strokeText', 'measureText']) { const o = P[k]; P[k] = function (t, ...a) { return o.call(this, I.tr(t), ...a); }; }
      this.node(document.body);
      new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') this.node(m.target); else if (m.type === 'attributes') this.node(m.target); else for (const n of m.addedNodes) this.node(n); } }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder', 'aria-label'] });
    } else this.lang = 'fr';
    // choix de la langue dans les options
    const P = V2.panel('options'); if (P && !$('langRow')) { const row = document.createElement('div'); row.className = 'row'; row.id = 'langRow'; row.style.alignItems = 'center';
      row.innerHTML = '<span class="keys" style="min-width:110px">Langue · Language</span><div class="row"><button class="opt small" data-l="fr">Français</button><button class="opt small" data-l="en">English</button></div>'; P.prepend(row);
      row.querySelectorAll('[data-l]').forEach(b => { b.setAttribute('aria-pressed', b.dataset.l === this.lang); b.addEventListener('click', () => { if (b.dataset.l !== this.lang) this.set(b.dataset.l); }); }); }
  },
};

// ---- accessibilité 2.0 ----
const A11Y_DEF = { captions: false, cvd: false, calm: false };
const A11y = {
  opt: Object.assign({}, A11Y_DEF),
  load() { this.opt = Object.assign({}, A11Y_DEF, store.get('ct2d.a11y2', {})); try { if (!store.get('ct2d.a11y2', null) && matchMedia('(prefers-reduced-motion: reduce)').matches) this.opt.calm = true; } catch (e) { } },
  save() { store.set('ct2d.a11y2', this.opt); },
  set(k, v) { this.opt[k] = v; this.save(); this.refreshUI(); },
  // sous-titres : les sons qui portent une information de jeu
  caption(t) { if (!this.opt.captions || G.silent) return null; const box = $('captions'); if (!box) return null; const el = document.createElement('div'); el.textContent = '♪ ' + (typeof I18N !== 'undefined' ? I18N.tr(t) : t); box.appendChild(el); while (box.childElementCount > 3) box.firstChild.remove(); setTimeout(() => el.remove(), 2200); return t; },
  init() {
    this.load();
    const box = document.createElement('div'); box.id = 'captions'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box);
    const st = document.createElement('style'); st.textContent = '#captions{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:45;display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none}#captions div{background:#000c;color:#fff;font:600 14px/1.3 system-ui,sans-serif;padding:3px 10px;border-radius:6px}body.bigtext #captions div{font-size:18px}'; document.head.appendChild(st);
    const C = (fn, txt) => { const o = Snd[fn]; if (!o) return; Snd[fn] = function () { const r = o.apply(this, arguments); if (G.state === 'fight' || G.state === 'round' || G.state === 'ko' || G.state === 'finish') A11y.caption(typeof txt === 'function' ? txt.apply(null, arguments) : txt); return r; }; };
    C('bell', 'Cloche : la manche commence'); C('clang', p => p ? 'Clang : parade parfaite' : 'Lames qui s\'entrechoquent'); C('crack', 'Craquement : garde brisée'); C('fanfare', w => w ? 'Fanfare : victoire' : 'Fanfare sombre : défaite');
    const ev = G.event; G.event = function (t, i) { if (A11y.opt.captions && i) { if (t === 'secondWind') A11y.caption('Grondement : deuxième souffle'); if (t === 'hit' && i.d && i.d.isPlayer) A11y.caption('Choc : vous êtes touché'); if (t === 'esquive' && i.d && !i.d.isPlayer) A11y.caption('Souffle d\'air : il esquive'); } return ev.apply(this, arguments); };
    const say = G.say; G.say = function (txt) { if (A11y.opt.captions && /tic|guet/i.test(txt || '')) A11y.caption(txt); return say.apply(this, arguments); };
    // mode daltonien : le signal de parade passe du rouge au bleu clair (lisible pour toutes les formes de daltonisme courantes)
    CFG.cvd = !!this.opt.cvd;
    // mouvements réduits : pas de secousse, pas de zoom brusque, flash atténué
    const rd = G.render; G.render = function () { if (A11y.opt.calm) { this.shake = 0; this.zoom = Math.min(this.zoom || 0, .01); this.flash = Math.min(this.flash || 0, .05); } return rd.apply(this, arguments); };
    document.body.classList.toggle('calm', !!this.opt.calm);
    const P = V2.panel('options'); if (P && !$('a11yOpts')) { const row = document.createElement('div'); row.className = 'row'; row.style.alignItems = 'center'; row.innerHTML = '<span class="keys" style="min-width:110px">Accessibilité</span><div class="row" id="a11yOpts"><button class="opt small" id="optCap">Sous-titres des sons</button><button class="opt small" id="optCvd">Mode daltonien</button><button class="opt small" id="optCalm">Mouvements réduits</button></div>';
      const after = $('v2Opts') ? $('v2Opts').parentElement : null; if (after) after.after(row); else P.prepend(row);
      for (const [id, k] of [['optCap', 'captions'], ['optCvd', 'cvd'], ['optCalm', 'calm']]) $(id).addEventListener('click', () => this.set(k, !this.opt[k])); }
    this.refreshUI();
  },
  refreshUI() { CFG.cvd = !!this.opt.cvd; for (const [id, k] of [['optCap', 'captions'], ['optCvd', 'cvd'], ['optCalm', 'calm']]) { const b = $(id); if (b) b.setAttribute('aria-pressed', !!this.opt[k]); } document.body.classList.toggle('calm', !!this.opt.calm); },
};
