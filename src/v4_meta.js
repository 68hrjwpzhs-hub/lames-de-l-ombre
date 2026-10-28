// =============================== 4.0 · l'armurier, les succès, la nouvelle partie +, le mode photo, les emplacements, le son ===============================

// ---------- l'armurier : améliorer sa rapière (garde, équilibre, trempe ; trois degrés chacun) ----------
const FORGE = {
  garde: { name: 'Garde', desc: 'fenêtre de parade parfaite +0,01 s par degré', cost: [60, 120, 220] },
  equil: { name: 'Équilibre', desc: 'attaques 3 % plus vives par degré', cost: [70, 140, 240] },
  trempe: { name: 'Trempe', desc: 'touches 4 % plus fortes par degré', cost: [80, 160, 260] },
};
const Forge = {
  of(id) { const d = Save.data; d.forge = d.forge || {}; return d.forge[id] = d.forge[id] || { garde: 0, equil: 0, trempe: 0 }; },
  price(id, k) { const lv = this.of(id)[k]; if (lv >= 3) return null; const hon = typeof Rep !== 'undefined' && Rep.data().honneur >= 60 ? .85 : 1; return Math.round(FORGE[k].cost[lv] * hon); },
  buy(id, k) { const p = this.price(id, k); if (p == null || (Save.data.ecus || 0) < p) return false; Save.data.ecus -= p; this.of(id)[k]++; Save.persist(); if (typeof Ach !== 'undefined') { Ach.hit('forge'); const F = this.of(id); if (F.garde + F.equil + F.trempe >= 9) Ach.hit('forge9'); } return true; },
  apply(r, id) { if (!r) return r; const F = this.of(id); if (!F.garde && !F.equil && !F.trempe) return r; return Object.assign({}, r, { guard: (r.guard || 0) + .01 * F.garde, speed: (r.speed || 1) * (1 - .03 * F.equil), power: (r.power || 1) * (1 + .04 * F.trempe), name: r.name + ' ' + '★'.repeat(F.garde + F.equil + F.trempe) }); },
  build() {
    if ($('forge')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'forge'; s.hidden = true;
    s.innerHTML = '<div class="card"><div class="eyebrow">Rue de la Heaumerie</div><h2>L\'armurier</h2><p class="keys" id="fgHead"></p><div id="fgList"></div><div class="row"><button class="btn ghost" id="fgBack">Retour</button></div></div>'; document.body.appendChild(s);
    $('fgBack').addEventListener('click', () => G.show('menu'));
  },
  open() { this.build(); this.render(); G.show('forge'); },
  render() {
    const id = Save.data.equipped || 'heros', r = RAPIERS[id] || RAPIERS.heros, F = this.of(id);
    $('fgHead').textContent = `Rapière portée : ${r.name} · ${Save.data.ecus || 0} écus${typeof Rep !== 'undefined' && Rep.data().honneur >= 60 ? ' · l\'armurier respecte votre honneur : −15 %' : ''}`;
    const box = $('fgList'); box.innerHTML = '';
    for (const k in FORGE) { const f = FORGE[k], p = this.price(id, k), row = document.createElement('div'); row.className = 'cr-mis'; row.innerHTML = `<div class="i"><b>${f.name} ${'★'.repeat(F[k])}${'☆'.repeat(3 - F[k])}</b> · ${f.desc}</div>`;
      const b = document.createElement('button'); b.className = 'btn small'; b.dataset.up = k; b.textContent = p == null ? 'Au plus haut' : `Améliorer (${p} écus)`; b.disabled = p == null || (Save.data.ecus || 0) < p; b.addEventListener('click', () => { this.buy(id, k); Snd.clang(false); this.render(); }); row.appendChild(b); box.appendChild(row); }
  },
  init() {
    this.build();
    const sm = G.startMatch; G.startMatch = function (opts = {}) { const r = sm.apply(this, arguments); if (!(opts && opts.ecole) && this.p && this.p.rapier) this.p.rapier = Forge.apply(this.p.rapier, Save.data.equipped || 'heros'); return r; };
    const P = V2.panel('salle'), row = P && P.querySelector('.row'); if (row && !$('goForge')) { const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'goForge'; b.textContent = 'Armurier'; b.addEventListener('click', () => this.open()); row.appendChild(b); }
  },
};

// ---------- succès : trente exploits ----------
const ACH = [
  ['premier', 'Première lame', 'Gagner un premier duel'], ['parfait10', 'Mur de fer', '10 parades parfaites (au total)'], ['riposte', 'Réponse du berger', 'Une riposte parfaite'], ['esquive', 'Insaisissable', 'Une esquive parfaite'],
  ['panache', 'Panache !', 'Remplir la jauge de panache'], ['botte', 'Botte de panache', 'Toucher d\'une botte de panache'], ['prop_tabouret', 'Le tabouret volant', 'Renverser un tabouret sur l\'adversaire'], ['prop_tonneau', 'Rouler sa bosse', 'Lancer un tonneau'],
  ['prop_table', 'Sur la table !', 'Sauter sur une table'], ['prop_lustre', 'Le lustre', 'Trancher la corde d\'un lustre'], ['melee', 'Un contre trois', 'Gagner une mêlée'], ['melee_nohit', 'Intouchable', 'Gagner une mêlée sans être pris à revers'],
  ['joute', 'Langue acérée', 'Gagner une joute verbale'], ['joute3', 'Trois fois touché', 'Trois bonnes reparties dans une joute'], ['mission', 'Au service de Paris', 'Accomplir une mission'], ['mission10', 'Connu dans tout Paris', 'Accomplir 10 missions'],
  ['poursuite', 'Le chat des toits', 'Rattraper un fuyard'], ['poursuite0', 'Sans un faux pas', 'Rattraper un fuyard sans trébucher'], ['deguise', 'Méconnaissable', 'Réussir une infiltration avec le bon déguisement'], ['valet', 'La cruche de Guillot', 'Votre valet lance une cruche'],
  ['compagne', 'Bien entourée', 'Votre compagne d\'armes pare pour vous'], ['forge', 'Chez l\'armurier', 'Améliorer une rapière'], ['forge9', 'Chef-d\'œuvre', 'Neuf améliorations sur la même rapière'], ['honneur', 'Lame d\'honneur', 'Honneur à 80'],
  ['crainte', 'Redouté', 'Crainte à 80'], ['faveur', 'Homme du Cardinal', 'Faveur du Cardinal à 80'], ['livre1', 'Le Registre écarlate', 'Terminer le Livre I'], ['livre3', 'Le Cercle de Madrid', 'Terminer le Livre III'],
  ['ngp', 'Encore une fois', 'Commencer une nouvelle partie +'], ['photo', 'Le peintre', 'Enregistrer une photo de duel'],
];
const Ach = {
  data() { const d = Save.data; d.ach = d.ach || {}; return d.ach; },
  has(id) { return !!this.data()[id]; },
  hit(id) { const D = this.data(); if (D[id] || !ACH.some(a => a[0] === id)) return false; D[id] = Date.now(); Save.persist(); const A = ACH.find(a => a[0] === id); if (!G.silent) toastMsg('Succès : ' + A[1] + ' — ' + A[2]); return true; },
  count() { return Object.keys(this.data()).filter(k => ACH.some(a => a[0] === k)).length; },
  build() {
    if ($('succes')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'succes'; s.hidden = true;
    s.innerHTML = '<div class="card"><div class="eyebrow">Bibliothèque</div><h2>Succès</h2><p class="keys" id="acCount"></p><div id="acList" class="ac-list"></div><div class="row"><button class="btn ghost" id="acBack">Retour</button></div></div>'; document.body.appendChild(s);
    const st = document.createElement('style'); st.textContent = '.ac-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}.ac{border:1px solid rgba(216,178,94,.25);border-radius:6px;padding:6px 9px;font-size:13px;color:var(--muted)}.ac b{display:block;color:var(--parch)}.ac.on{border-color:var(--gold);background:rgba(216,178,94,.12)}.ac:not(.on){opacity:.6}'; document.head.appendChild(st);
    $('acBack').addEventListener('click', () => G.show('menu'));
  },
  open() { this.build(); const D = this.data(); $('acCount').textContent = `${this.count()} / ${ACH.length}`; const box = $('acList'); box.innerHTML = ''; for (const [id, t, d] of ACH) { const e = document.createElement('div'); e.className = 'ac' + (D[id] ? ' on' : ''); e.innerHTML = `<b>${D[id] ? '★ ' : ''}${t}</b>${d}`; box.appendChild(e); } G.show('succes'); },
  init() {
    this.build();
    const ev = G.event; G.event = function (t, i) { if (i && !G.silent) { const pp = i.d && i.d.isPlayer, pa = i.a && i.a.isPlayer;
      if (t === 'parry' && pp) { const D = Ach.data(); D._parries = (D._parries || 0) + 1; if (D._parries >= 10) Ach.hit('parfait10'); }
      if (t === 'riposte' && pa && i.perfect) Ach.hit('riposte'); if (t === 'esquive' && pp && i.perfect) Ach.hit('esquive'); } return ev.apply(this, arguments); };
    const ar = G.afterRound; G.afterRound = function () { const melee = Melee.active(), hpBefore = Melee.hurt; const r = ar.apply(this, arguments); if (this.state === 'over' && !this.silent && !(this.matchOpts && this.matchOpts.ecole)) { const won = this.wins[0] > this.wins[1]; if (won) { Ach.hit('premier'); if (melee) { Ach.hit('melee'); if (!Melee.hurt) Ach.hit('melee_nohit'); } } } return r; };
    const sm = G.startMatch; G.startMatch = function () { Melee.hurt = 0; return sm.apply(this, arguments); };
    const say = G.say; G.say = function (t) { if (t === 'Pris à revers !') Melee.hurt = (Melee.hurt || 0) + 1; return say.apply(this, arguments); };
    const oc = Codex.onChapter.bind(Codex); Codex.onChapter = id => { oc(id); if (id === 'ch10') Ach.hit('livre1'); if (id === 'c08') Ach.hit('livre3'); };
    const P = V2.panel('biblio'), row = P && P.querySelector('.row'); if (row && !$('goAch')) { const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'goAch'; b.textContent = 'Succès'; b.addEventListener('click', () => this.open()); row.appendChild(b); }
  },
};

// ---------- nouvelle partie + : on rejoue l'histoire avec ses acquis, contre des adversaires plus durs ----------
const NGP = {
  level() { return Save.data.ngp || 0; },
  can() { return !!Story.data().done.c08; },
  start() { const S = Story.data(); Save.data.ngp = this.level() + 1; S.done = {}; S.choices = {}; S.ending = null; Save.persist(); Ach.hit('ngp'); Story.showList(); toastMsg(`Nouvelle partie + ${Save.data.ngp} : l'histoire recommence, vos écus, rapières et techniques restent ; les adversaires sont plus durs.`); },
  init() {
    // adversaires plus vifs et plus justes à chaque niveau
    const sm = G.startMatch; G.startMatch = function (opts = {}) { const r = sm.apply(this, arguments); const n = NGP.level(); if (n && opts && opts.mode === 'story' && this.ai && this.ai.L) { const L = this.ai.L; L.slow = Math.max(1, (L.slow || 1.5) - .12 * n); L.perfect = clamp((L.perfect || 0) + .06 * n, 0, .8); this.e.hp = this.e.hpShow = 100; } return r; };
    const sl = Story.showList.bind(Story); Story.showList = function () { sl(); const box = $('storyList'); if (!box || !NGP.can() || $('ngpBtn')) return; const b = document.createElement('button'); b.className = 'btn'; b.id = 'ngpBtn'; b.textContent = `Nouvelle partie + ${NGP.level() + 1}`; b.title = 'Rejouer l\'histoire avec vos acquis, contre des adversaires plus durs'; b.addEventListener('click', () => NGP.start()); box.prepend(b); };
  },
};

// ---------- mode photo : figer le duel, cadrer, filtrer, enregistrer ----------
const PHOTO_FILTERS = { aucun: '', gravure: 'grayscale(1) contrast(1.35) brightness(1.05)', sepia: 'sepia(.85) contrast(1.1)', nuit: 'saturate(.6) hue-rotate(190deg) brightness(.85)' };
const Photo = {
  on: false, cam: null, filter: 'aucun',
  build() {
    if ($('photo')) return; const d = document.createElement('div'); d.id = 'photo'; d.hidden = true;
    d.innerHTML = '<div class="ph-bar"><b>Mode photo</b><label>Zoom <input type="range" id="phZoom" min="1" max="2.6" step=".02"></label><button class="opt small" data-f="aucun">Naturel</button><button class="opt small" data-f="gravure">Gravure</button><button class="opt small" data-f="sepia">Sépia</button><button class="opt small" data-f="nuit">Nuit</button><button class="btn small" id="phSave">Enregistrer</button><button class="btn ghost small" id="phQuit">Quitter</button></div><p class="ph-hint">Glissez pour cadrer.</p>';
    document.body.appendChild(d); const st = document.createElement('style'); st.textContent = '#photo{position:fixed;inset:0;z-index:30;touch-action:none}#photo .ph-bar{position:absolute;left:50%;top:max(8px,env(safe-area-inset-top));transform:translateX(-50%);display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;background:#120e0cdd;border:1px solid #d8b25e;border-radius:10px;padding:6px 10px;color:#f6ead0;font:600 13px Georgia,serif;max-width:94vw}#photo .ph-hint{position:absolute;bottom:10px;width:100%;text-align:center;color:#f6ead0;text-shadow:0 1px 3px #000}body.photo #touch,body.photo #pause{display:none!important}'; document.head.appendChild(st);
    let drag = null; d.addEventListener('pointerdown', e => { if (e.target.closest('.ph-bar')) return; drag = { x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y }; });
    d.addEventListener('pointermove', e => { if (!drag) return; const k = W / $('c').getBoundingClientRect().width / this.cam.s; this.cam.x = clamp(drag.cx - (e.clientX - drag.x) * k, 0, W); this.cam.y = clamp(drag.cy - (e.clientY - drag.y) * k, 0, H); this.draw(); });
    d.addEventListener('pointerup', () => { drag = null; }); $('phZoom').addEventListener('input', e => { this.cam.s = +e.target.value; this.draw(); });
    d.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { this.filter = b.dataset.f; this.draw(); }));
    $('phSave').addEventListener('click', () => this.save()); $('phQuit').addEventListener('click', () => this.stop());
  },
  start() { if (G.state !== 'pause') return; this.build(); this.on = true; const c = G.cam || { s: 1.2, x: W / 2, y: H / 2 }; this.cam = { s: c.s, x: c.x, y: c.y }; $('phZoom').value = this.cam.s; $('photo').hidden = false; $('pause').hidden = true; document.body.classList.add('photo'); this.draw(); },
  stop() { this.on = false; $('photo').hidden = true; document.body.classList.remove('photo'); for (const c of [$('c'), $('gl')]) if (c) c.style.filter = ''; G.show('pause'); },
  draw() { const f = PHOTO_FILTERS[this.filter]; for (const c of [$('c'), $('gl')]) if (c) c.style.filter = f; $('photo').querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === this.filter)); G.render(0); },
  // image finale : le monde (WebGL ou 2D), sans HUD, filtre appliqué
  shot() {
    G.render(0); const src = GL.on && $('gl') ? $('gl') : $('c'), out = document.createElement('canvas'); out.width = src.width; out.height = src.height; const g = out.getContext('2d');
    g.filter = PHOTO_FILTERS[this.filter] || 'none'; g.drawImage(src, 0, 0); g.filter = 'none';
    g.font = `italic ${Math.round(out.height / 30)}px Georgia, serif`; g.fillStyle = 'rgba(246,234,208,.85)'; g.textAlign = 'right'; g.fillText('Les Lames de l\'Ombre', out.width - 16, out.height - 14); return out;
  },
  async save() {
    const c = this.shot(); Ach.hit('photo'); const blob = await new Promise(r => c.toBlob(r, 'image/png')); if (!blob) return;
    const file = new File([blob], 'duel-lames-de-l-ombre.png', { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return; } } catch (e) { if (e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  },
  init() {
    this.build();
    const cam = G.camera; G.camera = function () { if (Photo.on) return Photo.cam; return cam.apply(this, arguments); };
    const hud = G.hud; G.hud = function () { if (Photo.on) return; return hud.apply(this, arguments); };
    const row = $('resume') && $('resume').parentElement; if (row && !$('goPhoto')) { const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'goPhoto'; b.textContent = 'Mode photo'; b.addEventListener('click', () => this.start()); row.appendChild(b); }
  },
};

// ---------- trois emplacements de sauvegarde ----------
const Slots = {
  cur() { return store.get('ct2d.slot', 1); },
  meta(n) { const s = n === this.cur() ? Save.data : store.get('ct2d.slot.' + n, null); if (!s) return 'vide'; return `${(HEROES[s.hero] || HEROES.vaucelles).name.split(' ')[0]} · ${s.ecus || 0} écus · ${Object.keys((s.story || {}).done || {}).length} chapitres`; },
  use(n) { if (n === this.cur()) return; store.set('ct2d.slot.' + this.cur(), Save.data); const next = store.get('ct2d.slot.' + n, null); store.set('ct2d.save', next || {}); store.set('ct2d.slot', n); location.reload(); },
  init() {
    const P = V2.panel('options'); if (!P || $('slotRow')) return; const row = document.createElement('div'); row.className = 'row'; row.id = 'slotRow'; row.style.alignItems = 'center'; row.innerHTML = '<span class="keys" style="min-width:110px">Emplacements</span><div class="row" id="slotBtns"></div>'; P.appendChild(row);
    for (const n of [1, 2, 3]) { const b = document.createElement('button'); b.className = 'opt small'; b.dataset.slot = n; b.setAttribute('aria-pressed', n === this.cur()); b.innerHTML = `<b>Partie ${n}</b><span>${this.meta(n)}</span>`; b.addEventListener('click', () => this.use(n)); $('slotBtns').appendChild(b); }
  },
};

// ---------- le son : salles des nouveaux lieux, chocs placés dans l'espace, souffles des duellistes ----------
const AudioV4 = {
  pans: null,
  on() { return store.get('ct2d.souffles', true) !== false; },
  pan(x, fn) { const c = Snd.ctx; if (!c || !c.createStereoPanner || !Snd.out || !Aud.ready) return fn(); if (!this.pans) { this.base = Snd.out; this.pans = [-.6, -.3, 0, .3, .6].map(v => { const p = c.createStereoPanner(); p.pan.value = v; p.connect(this.base); return p; }); }
    const k = clamp(Math.round(((x / W) * 2 - 1) * 2) + 2, 0, 4), o = Snd.out; Snd.out = this.pans[k]; try { return fn(); } finally { Snd.out = o; } },
  // souffle d'effort : bruit passé dans deux formants (« hah »), voix plus grave pour les colosses
  effort(f) { if (!this.on() || G.silent || !Snd.ctx || !CFG.sfx) return; const L = f.look || {}, low = L.body === 'f' ? 1.25 : L.style === 'paysan' ? .82 : 1;
    this.pan(f.x, () => { Snd.noise(.16, 'bandpass', 720 * low, 560 * low, 3, .05); Snd.noise(.12, 'bandpass', 1240 * low, 980 * low, 4, .03); }); },
  init() {
    Object.assign(Aud.ROOMS, { auberge: { rt: .9, wet: .2, lp: 4200, floor: 'bois' }, navire: { rt: .5, wet: .08, lp: 6500, floor: 'bois' }, bastion: { rt: .8, wet: .12, lp: 5500, floor: 'pierre' }, plaza: { rt: .9, wet: .14, lp: 6500, floor: 'pierre' }, academia: { rt: 1.2, wet: .22, lp: 5000, floor: 'pierre' }, alcazar: { rt: 1.8, wet: .26, lp: 4500, floor: 'pierre' } });
    for (const k of ['clang', 'hit', 'crack']) { const o = Snd[k]; Snd[k] = function () { const a = arguments, self = this; const x = (G.p && G.e) ? (G.p.x + G.e.x) / 2 : W / 2; return AudioV4.pan(x, () => o.apply(self, a)); }; }
    const sm = Fighter.prototype.startMove; Fighter.prototype.startMove = function (kind) { const r = sm.apply(this, arguments); if ((kind === 'heavy' || kind === 'fente' || kind === 'riposte') && G.state === 'fight') AudioV4.effort(this); return r; };
    const row = $('optGL') && $('optGL').parentElement; if (row && !$('optSouffle')) { const b = document.createElement('button'); b.className = 'opt small'; b.id = 'optSouffle'; b.textContent = 'Souffles des duellistes'; b.setAttribute('aria-pressed', this.on()); b.addEventListener('click', () => { store.set('ct2d.souffles', !this.on()); b.setAttribute('aria-pressed', this.on()); }); row.appendChild(b); }
  },
};
