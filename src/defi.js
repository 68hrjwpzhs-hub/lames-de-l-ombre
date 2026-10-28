// =============================== 2.0 · sprint 19 : le Défi du jour ===============================
// Chaque jour, le même défi pour tous (graine = la date) : un adversaire, un décor, une contrainte.
// Séries de jours réussis, écus, et une collection d'ornements (plumes, pourpoints, gardes) à porter.
const DEFI_RULES = {
  sansParade: { name: 'Sans parade', desc: 'Gagnez sans une seule parade parfaite : garde tenue et esquive seulement.', ok: c => c.won && c.parry === 0 },
  ripostes: { name: 'Trois ripostes', desc: 'Gagnez en touchant au moins 3 fois en riposte.', ok: c => c.won && c.rip >= 3 },
  esquives: { name: 'L\'anguille', desc: 'Gagnez en réussissant au moins 3 esquives.', ok: c => c.won && c.esq >= 3 },
  intact: { name: 'Sans une égratignure', desc: 'Gagnez en perdant moins de 40 points de vie sur tout le duel.', ok: c => c.won && c.taken < 40 },
  eclair: { name: 'Duel éclair', desc: 'Gagnez en moins de 75 secondes.', ok: c => c.won && c.time < 75 },
  dague: { name: 'Main gauche', desc: 'À la dague imposée : gagnez avec au moins 2 coups de main gauche.', ok: c => c.won && c.dague >= 2, offhand: 'dague' },
  rondache: { name: 'Le bouclier', desc: 'Rondache imposée : gagnez en tenant au moins 4 attaques en garde.', ok: c => c.won && c.blocks >= 4, offhand: 'rondache' },
};
const DEFI_KEYS = Object.keys(DEFI_RULES);
const DEFI_FOES = [['Ser Ottavio', 'duelliste'], ['Le Balafré', 'duelliste'], ['Dame Guillemette', 'maitre'], ['Le Capitaine Rouvray', 'maitre'], ['Frère Anselme', 'duelliste'], ['Le Flamand', 'maitre'], ['Mademoiselle de Sorel', 'duelliste']];
// ornements à collectionner : plume du chapeau, pourpoint, garde de la rapière
const COSM = [
  { id: 'plumeOr', kind: 'plume', name: 'Plume dorée', col: '#e8c46a' },
  { id: 'pourpointBordeaux', kind: 'coat', name: 'Pourpoint bordeaux', col: '#6a1a24', col2: '#3a0e14' },
  { id: 'gardeArgent', kind: 'hilt', name: 'Garde d\'argent', col: '#d8dce4' },
  { id: 'plumeAzur', kind: 'plume', name: 'Plume d\'azur', col: '#4a7ac8' },
  { id: 'pourpointVert', kind: 'coat', name: 'Pourpoint vert de Saxe', col: '#1e4a3a', col2: '#0e281e' },
  { id: 'gardeNoire', kind: 'hilt', name: 'Garde bronzée', col: '#6a5030' },
  { id: 'plumeNoire', kind: 'plume', name: 'Plume de corbeau', col: '#16141a' },
  { id: 'pourpointNuit', kind: 'coat', name: 'Pourpoint bleu de nuit', col: '#1a2240', col2: '#0c1024' },
  { id: 'gardeOr', kind: 'hilt', name: 'Garde dorée', col: '#e0b24a' },
  { id: 'plumeEcarlate', kind: 'plume', name: 'Plume écarlate', col: '#c8202a' },
  { id: 'pourpointCuir', kind: 'coat', name: 'Buffletin de cuir', col: '#8a6a40', col2: '#4a3420' },
  { id: 'plumeBlanche', kind: 'plume', name: 'Plume du Cardinal (7 jours de suite)', col: '#f4f0e6', streak: 7 },
];

const Defi = {
  cur: null,
  // date locale AAAA-MM-JJ
  dayKey(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  prevKey(k) { const [y, m, d] = k.split('-').map(Number); return this.dayKey(new Date(y, m - 1, d - 1)); },
  rng(key) { let h = 2166136261; for (const c of key) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } let a = h >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
  // le défi d'un jour donné : le même pour tous
  of(key = this.dayKey()) {
    const r = this.rng('ldo-defi-' + key), pk = a => a[Math.floor(r() * a.length)];
    const rule = pk(DEFI_KEYS), [name, level] = pk(DEFI_FOES), venue = pk(VENUE_KEYS.filter(v => v !== 'aleatoire')), offh = pk([null, 'dague', 'cape', 'rondache']);
    const lk = LOOKS[level] || LOOKS.duelliste, hue = pk(['#5a1a2a', '#1a3a5a', '#3a4a1a', '#4a2a5a', '#2a2a2a', '#6a3a1a']);
    return { key, rule, name, level, venue, offhand: offh, look: Object.assign({}, lk, { coat: hue, plume: pk(['#e8e4dc', '#c8202a', '#e8c46a', '#3a6aa8']) }) };
  },
  data() { const d = Save.data; d.defi = d.defi || { done: {}, streak: 0, best: 0, last: null, cosm: [], wear: {} }; d.defi.cosm = d.defi.cosm || []; d.defi.wear = d.defi.wear || {}; return d.defi; },
  // série : jours réussis consécutifs (elle tient tant qu'hier ou aujourd'hui est réussi)
  streak(today = this.dayKey()) { const D = this.data(); let k = D.done[today] ? today : this.prevKey(today), n = 0; while (D.done[k]) { n++; k = this.prevKey(k); } return n; },
  start(key = this.dayKey()) {
    const df = this.of(key), R = DEFI_RULES[df.rule];
    this.cur = { df, c: { won: false, parry: 0, rip: 0, esq: 0, taken: 0, time: 0, dague: 0, blocks: 0 }, t0: null };
    G.level = df.level; G.venuePref = G.venuePref || 'aleatoire';
    G.startMatch({ defi: true, wins: 2, venue: df.venue, opp: { name: df.name, level: df.level, look: df.look, rapier: LEVEL_RAPIER[df.level], offhand: df.offhand } });
    if (R.offhand) G.p.offhand = R.offhand;
    this.cur.t0 = G.time;
  },
  onEvent(t, i) {
    const C = this.cur; if (!C || !G.matchOpts || !G.matchOpts.defi || !i) return; const c = C.c;
    if (t === 'parry' && i.d && i.d.isPlayer) c.parry++;
    if (t === 'hit' && i.a && i.a.isPlayer && i.m && i.m.kind === 'riposte') c.rip++;
    if (t === 'esquive' && i.d && i.d.isPlayer) c.esq++;
    if (t === 'dague' && i.a && i.a.isPlayer) c.dague++;
    if (t === 'block' && i.d && i.d.isPlayer) c.blocks++;
  },
  // fin du duel du défi : verdict, série, récompenses
  finish(won) {
    const C = this.cur; if (!C) return null; const D = this.data(), df = C.df, R = DEFI_RULES[df.rule], c = C.c;
    c.won = won; c.taken = G.p.stats.taken || 0; c.time = Math.round(G.time - C.t0);
    const ok = R.ok(c), first = ok && !D.done[df.key], out = { ok, first, ecus: 0, cosm: null, streak: 0, rule: R.name };
    if (first) {
      D.done[df.key] = { t: c.time, g: G.lastGrade ? G.lastGrade.g : '' }; D.last = df.key; out.streak = this.streak(df.key); D.best = Math.max(D.best || 0, out.streak);
      out.ecus = 40 + 10 * Math.min(out.streak - 1, 6); Save.data.ecus = (Save.data.ecus || 0) + out.ecus;
      const next = COSM.find(x => !D.cosm.includes(x.id) && (!x.streak || out.streak >= x.streak)); if (next) { D.cosm.push(next.id); out.cosm = next; }
      Save.persist();
    }
    this.cur = null; this.lastOut = Object.assign({ df, c }, out); this.badge(); return out;
  },
  // ornements portés : appliqués sur l'apparence du héros
  wear(kind, id) { const D = this.data(); if (id && !D.cosm.includes(id)) return; D.wear[kind] = id || null; Save.persist(); applyAvatar(); this.render(); },
  applyLook() {
    const D = Save.data && Save.data.defi; if (!D || !D.wear) return; const L = LOOKS.player;
    for (const k in D.wear) { const x = COSM.find(c => c.id === D.wear[k]); if (!x) continue;
      if (x.kind === 'plume' && L.plume !== null) L.plume = x.col; if (x.kind === 'coat') { L.coat = x.col; L.coat2 = x.col2; } if (x.kind === 'hilt') RAPIERS.heros.hilt = x.col; }
  },
  // carte du défi (image) pour la partager
  card(o = this.lastOut) {
    const c = document.createElement('canvas'); c.width = 900; c.height = 500; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 500); gr.addColorStop(0, '#efe2c2'); gr.addColorStop(1, '#d9c69c'); g.fillStyle = gr; g.fillRect(0, 0, 900, 500);
    g.strokeStyle = '#7a5a2a'; g.lineWidth = 6; g.strokeRect(18, 18, 864, 464); g.lineWidth = 1.5; g.strokeRect(30, 30, 840, 440);
    g.fillStyle = '#3a2410'; g.textAlign = 'center'; g.font = '30px Georgia, serif'; g.fillText('Les Lames de l\'Ombre · Défi du jour', 450, 86);
    if (o) { const [y, m, d] = o.df.key.split('-');
      g.font = 'italic 24px Georgia, serif'; g.fillText(`${d}/${m}/${y} · ${DEFI_RULES[o.df.rule].name} contre ${o.df.name}`, 450, 140);
      g.font = 'bold 64px Georgia, serif'; g.fillStyle = o.ok ? '#6a4a10' : '#7a1a1a'; g.fillText(o.ok ? 'Défi relevé' : 'Défi manqué', 450, 240);
      g.fillStyle = '#3a2410'; g.font = '26px Georgia, serif'; g.fillText(`Duel en ${o.c.time} s · ripostes ${o.c.rip} · esquives ${o.c.esq} · vie perdue ${o.c.taken}`, 450, 310);
      if (o.ok) g.fillText(`Série : ${this.streak(o.df.key)} jour${this.streak(o.df.key) > 1 ? 's' : ''}`, 450, 360); }
    g.font = 'italic 20px Georgia, serif'; g.fillStyle = '#6a4a2a'; g.fillText('68hrjwpzhs-hub.github.io/lames-de-l-ombre', 450, 440);
    return c;
  },
  shareText(o = this.lastOut) { if (!o) return ''; const [y, m, d] = o.df.key.split('-'); return `Les Lames de l'Ombre · Défi du ${d}/${m} (${DEFI_RULES[o.df.rule].name}) : ${o.ok ? 'relevé' : 'manqué'} en ${o.c.time} s${o.ok ? ', série de ' + this.streak(o.df.key) + ' jour(s)' : ''}. ${location.href.split('#')[0]}`; },
  async share() {
    const o = this.lastOut; if (!o) return 'rien'; const text = this.shareText(o);
    try { const blob = await new Promise(r => this.card(o).toBlob(r, 'image/png')); const file = new File([blob], 'defi-' + o.df.key + '.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return 'image'; }
      if (navigator.share) { await navigator.share({ text }); return 'texte'; } } catch (e) { if (e && e.name === 'AbortError') return 'annule'; }
    try { await navigator.clipboard.writeText(text); G.say && toastMsg('Résultat copié : collez-le où vous voulez.'); return 'copie'; } catch (e) { return 'echec'; }
  },
  // ---- écran ----
  build() {
    if ($('defi')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'defi'; s.hidden = true;
    s.innerHTML = '<div class="card"><div class="eyebrow">Chaque jour, le même pour tous</div><h2>Le Défi du jour</h2><div id="defiToday" class="defi-today"></div><div class="row"><button class="btn" id="defiGo">Relever le défi</button><button class="btn ghost" id="defiShare" hidden>Partager</button></div><h3>Les quatorze derniers jours</h3><div id="defiCal" class="defi-cal"></div><p class="keys" id="defiStreak"></p><h3>Ornements</h3><p class="keys">Un ornement par défi relevé (la plume du Cardinal après 7 jours de suite). Touchez pour le porter.</p><div id="defiCosm" class="row"></div><div class="row"><button class="btn ghost" id="defiBack">Retour</button></div></div>';
    document.body.appendChild(s);
    const st = document.createElement('style'); st.textContent = '.defi-today{border:1px solid rgba(216,178,94,.45);border-radius:10px;padding:10px 12px;background:rgba(216,178,94,.07)}.defi-today b{color:var(--parch);font-size:17px}.defi-today span{display:block;font-size:13px;color:var(--muted)}.defi-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}.defi-cal div{border:1px solid rgba(216,178,94,.25);border-radius:6px;padding:4px 0;text-align:center;font:700 12px var(--body);color:var(--muted)}.defi-cal div.ok{background:rgba(216,178,94,.28);color:var(--parch)}.defi-cal div.today{outline:2px solid #e8c46a}.cosm{display:flex;align-items:center;gap:6px}.cosm i{width:14px;height:14px;border-radius:50%;border:1px solid #0008;display:inline-block}';
    document.head.appendChild(st);
    $('defiGo').addEventListener('click', () => { Snd.init(); this.start(); });
    $('defiShare').addEventListener('click', () => this.share());
    $('defiBack').addEventListener('click', () => { G.show('menu'); });
  },
  open() { this.build(); this.render(); G.show('defi'); },
  render() {
    if (!$('defi')) return; const D = this.data(), key = this.dayKey(), df = this.of(key), R = DEFI_RULES[df.rule], done = D.done[key];
    $('defiToday').innerHTML = `<b>${R.name}</b> contre ${df.name} <small>(${df.level === 'maitre' ? 'maître' : 'duelliste'}${df.offhand ? ', ' + OFFHANDS[df.offhand].short.toLowerCase() : ''})</small><span>${R.desc}</span><span>Décor : ${(VENUES[df.venue] && VENUES[df.venue].name) || df.venue}${done ? ' · relevé aujourd\'hui ✓' : ''}</span>`;
    $('defiGo').textContent = done ? 'Rejouer (pour le plaisir)' : 'Relever le défi'; $('defiShare').hidden = !this.lastOut;
    const cal = $('defiCal'); cal.innerHTML = ''; let k = key; const days = []; for (let i = 0; i < 14; i++) { days.unshift(k); k = this.prevKey(k); }
    for (const d of days) { const e = document.createElement('div'); e.textContent = d.slice(8); if (D.done[d]) e.className = 'ok'; if (d === key) e.classList.add('today'); e.title = d; cal.appendChild(e); }
    const s = this.streak(key); $('defiStreak').textContent = `Série en cours : ${s} jour${s > 1 ? 's' : ''} · meilleure : ${D.best || 0}`;
    const box = $('defiCosm'); box.innerHTML = '';
    if (!D.cosm.length) box.innerHTML = '<span class="keys">Aucun ornement pour l\'instant.</span>';
    for (const id of D.cosm) { const x = COSM.find(c => c.id === id); if (!x) continue; const b = document.createElement('button'); b.className = 'opt small cosm'; b.dataset.id = id; const on = D.wear[x.kind] === id; b.setAttribute('aria-pressed', on); b.innerHTML = `<i style="background:${x.col}"></i>${x.name}`; b.addEventListener('click', () => this.wear(x.kind, on ? null : id)); box.appendChild(b); }
  },
  init() {
    this.build();
    const ap = applyAvatar; applyAvatar = function () { const r = ap.apply(this, arguments); Defi.applyLook(); return r; }; applyAvatar();
    const ev = G.event; G.event = function (t, i) { Defi.onEvent(t, i); return ev.apply(this, arguments); };
    const ar = G.afterRound; G.afterRound = function () {
      const defi = this.matchOpts && this.matchOpts.defi && Defi.cur; const r = ar.apply(this, arguments);
      if (defi && this.state === 'over') { const won = this.wins[0] > this.wins[1], o = Defi.finish(won);
        if (o) { $('overEye').textContent = 'Défi du jour · ' + o.rule; const t = o.ok ? (o.first ? `Défi relevé ! +${o.ecus} écus · série ${o.streak} jour${o.streak > 1 ? 's' : ''}${o.cosm ? ' · nouvel ornement : ' + o.cosm.name : ''}` : 'Défi déjà relevé aujourd\'hui : bravo encore.') : `Défi manqué : ${DEFI_RULES[Defi.lastOut.df.rule].desc}`;
          $('overReward').textContent = t + ' ' + $('overReward').textContent; $('again').textContent = 'Défi du jour'; this.overAction = 'defi'; } }
      return r; };
    // « Revanche » devient « Défi du jour » : retour à l'écran du défi
    $('again').addEventListener('click', e => { if (G.overAction === 'defi') { e.stopImmediatePropagation(); Defi.open(); } }, true);
    // bouton dans l'onglet Jouer
    const row = $('goStory') && $('goStory').parentElement; if (row && !$('goDefi')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'goDefi'; b.textContent = 'Défi du jour'; b.addEventListener('click', () => this.open()); row.insertBefore(b, $('goRun')); this.badge(); }
  },
  badge() { const b = $('goDefi'); if (!b) return; const done = this.data().done[this.dayKey()]; b.textContent = done ? 'Défi du jour ✓' : 'Défi du jour'; },
};
function toastMsg(t) { if (typeof G !== 'undefined' && G.say && G.state !== 'menu') return G.say(t, [W / 2, 120], '#f6ead0', 18); const el = document.createElement('div'); el.className = 'v2toast'; el.textContent = t; el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1a1410ee;color:#f6ead0;border:1px solid #d8b25e;border-radius:8px;padding:8px 14px;font:600 14px Georgia,serif;z-index:99'; document.body.appendChild(el); setTimeout(() => el.remove(), 2600); }
