// =============================== 2.0 · sprint 17 : la main gauche (dague, cape, rondache) ===============================
// Aucune nouvelle touche : la main gauche agit d'elle-même sur la parade, l'esquive et la garde tenue.
// b1/b2 : angles du bras libre en garde (0° = vers l'adversaire, 90° = vers le haut), mêlés à la pose courante.
const OFFHANDS = {
  dague: { name: 'Dague de main gauche', short: 'Dague', b1: -58, b2: 28,
    desc: 'Parade parfaite : la dague frappe dans le même temps (5 points) et la riposte reste offerte plus longtemps.' },
  cape: { name: 'Cape enroulée', short: 'Cape', b1: -66, b2: -4,
    desc: 'Esquive réussie : la cape emmêle la lame, l\'adversaire reste ouvert plus longtemps. Les touches perdent 10 % de leur force.' },
  rondache: { name: 'Rondache', short: 'Rondache', b1: -36, b2: 14,
    desc: 'Garde tenue : moitié moins de souffle, et la rondache résiste à une fente lourde par manche. L\'esquive est un peu plus lente.' },
};
const OFFH_KEYS = Object.keys(OFFHANDS);
// main gauche préférée de chaque héros (le joueur peut en changer dans la Salle d'armes)
const HERO_OFFHAND = { vaucelles: 'rondache', isaure: 'dague', bastien: 'cape', alvaro: null, corvin: 'dague', mathurin: 'rondache' };
const NO_OFFH_STATES = { ko: 1, cine: 1, esquive: 1, finish: 1 };

const Offhand = {
  ofPlayer() { const d = Save.data || {}, o = d.offh || {}, h = d.hero || 'vaucelles'; return h in o ? o[h] : (HERO_OFFHAND[h] || null); },
  setPlayer(k) { const d = Save.data; d.offh = d.offh || {}; d.offh[d.hero || 'vaucelles'] = k || null; Save.persist(); this.refreshUI(); if (G.p) G.p.offhand = k || null; },
  // adversaire : imposé par l'histoire (opp.offhand), sinon tiré selon le niveau
  ofFoe(opts) {
    const o = opts && opts.opp; if (o && 'offhand' in o) return o.offhand;
    if (G.mode === 'training' || G.level === 'debutant' || (o && (o.arch === 'drac' || o.sig))) return null;
    if (o && o.boss) return 'dague';
    return pick([null, null, 'dague', 'cape', 'rondache']);
  },
  // l'IA joue sa main gauche : la cape pousse à l'esquive, la dague à la parade tardive, la rondache à la garde tenue
  tuneAI(ai, k) { if (!ai || !ai.L || !k) return; const L = ai.L; if (k === 'cape') L.esq = Math.min(.5, (L.esq || 0) + .1); if (k === 'dague') { L.late = Math.max(0, (L.late || 0) - .05); L.wary = Math.min(1, (L.wary || 0) + .05); } if (k === 'rondache') L.wary = Math.min(1, (L.wary || 0) + .12); },
  init() {
    // héros : main gauche par défaut
    for (const id in HERO_OFFHAND) if (HEROES[id]) HEROES[id].offhand = HERO_OFFHAND[id];
    const sm = G.startMatch; G.startMatch = function (opts = {}) { if (opts instanceof Event) opts = {}; const r = sm.call(this, opts); this.p.offhand = Offhand.ofPlayer(); this.e.offhand = Offhand.ofFoe(opts); Offhand.tuneAI(this.ai, this.e.offhand); return r; };
    const sr = G.startRound; G.startRound = function () { const r = sr.apply(this, arguments); for (const f of [this.p, this.e]) if (f) f.rondUsed = false; return r; };
    // dague : coup de main gauche dans le temps de la parade
    const pa = G.parry; G.parry = function (a, d, bp, info) {
      const r = pa.call(this, a, d, bp, info);
      if (d.offhand === 'dague' && a.hp > 0) { const v = 5; a.hp = Math.max(1, a.hp - v); a.flash = .1; d.stats.dague = (d.stats.dague || 0) + 1; if (d.ripOffer) d.ripOffer.end += .15;
        const j = d.J; if (j) this.spark(j.bwr, 10, '#e8f0ff'); this.say('Main gauche !', [a.x, GROUND - 262], '#cfe0ff', 20); Snd.tick(); this.event('dague', { a: d, d: a }); }
      return r; };
    // cape : l'esquive emmêle la lame ; l'attaque perdue récupère plus lentement
    const dg = G.dodge; G.dodge = function (a, d, at) { const r = dg.call(this, a, d, at); if (d.offhand === 'cape') { a.tangleT = this.time; d.stats.cape = (d.stats.cape || 0) + 1; this.say('La cape emmêle la lame !', [a.x, GROUND - 262], '#e0c8a8', 18); this.event('cape', { a: d, d: a }); } return r; };
    const wf = G.onWhiff; G.onWhiff = function (f) { if (f.tangleT != null && this.time - f.tangleT < 1 && f.move) { const m = f.move; m.rec += .3; if (m.keys) m.keys[m.keys.length - 1][0] += .3; f.tangleT = null; } return wf.apply(this, arguments); };
    const dm = G.dmgFor; G.dmgFor = function (a, d, m) { const v = dm.call(this, a, d, m); return d.offhand === 'cape' ? Math.max(1, Math.round(v * .9)) : v; };
    // rondache : la garde tenue coûte moitié moins, et tient une fois face à la fente lourde
    const bk = G.block; G.block = function (a, d, bp, info) { const b0 = d.breath; const r = bk.call(this, a, d, bp, info); if (d.offhand === 'rondache' && CFG.breath && d.breath < b0) d.breath += (b0 - d.breath) / 2; return r; };
    const br = G.breakGuard; G.breakGuard = function (a, d, bp, info) {
      if (d.offhand === 'rondache' && !d.rondUsed && d.breath >= .08) { d.rondUsed = true; d.stats.rond = (d.stats.rond || 0) + 1; this.say('La rondache tient !', [d.x, GROUND - 262], '#e6dcc4', 20); this.event('rondache', { a: d, d: a }); return this.block(a, d, bp, info); }
      return br.call(this, a, d, bp, info); };
    const se = Fighter.prototype.startEsquive; Fighter.prototype.startEsquive = function () { const r = se.apply(this, arguments); if (this.offhand === 'rondache') this.dur += .06; return r; };
    // carnet : la main gauche
    if (!CODEX.some(e => e.id === 'maingauche')) CODEX.push({ id: 'maingauche', cat: 'tech', title: 'La main gauche', hint: 'Toucher de la dague, de la cape ou de la rondache', text: 'Au début du XVIIe siècle, la rapière se porte souvent avec une arme de la main gauche : dague à larges quillons pour parer et frapper dans le même temps, cape roulée autour du bras pour engager la lame, ou petit bouclier rond, la rondache. Les traités italiens et espagnols leur consacrent des chapitres entiers.' });
    const ev = G.event; G.event = function (t, i) { if ((t === 'dague' || t === 'cape' || t === 'rondache') && i && i.a && i.a.isPlayer) Codex.unlock('maingauche'); return ev.apply(this, arguments); };
  },
  // Salle d'armes : choix de la main gauche du héros courant
  menu(P) {
    if (!P || $('offhRow')) return; const box = document.createElement('div'); box.id = 'offhBox';
    box.innerHTML = '<h3>Main gauche</h3><div class="row" id="offhRow"></div><p class="keys" id="offhDesc"></p>';
    P.appendChild(box); const row = $('offhRow');
    for (const k of [null, ...OFFH_KEYS]) { const b = document.createElement('button'); b.className = 'opt small'; b.dataset.v = k || ''; b.textContent = k ? OFFHANDS[k].short : 'Aucune'; b.addEventListener('click', () => this.setPlayer(k)); row.appendChild(b); }
    this.refreshUI();
  },
  refreshUI() { const row = $('offhRow'); if (!row) return; const cur = this.ofPlayer() || ''; row.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === cur)); const fav = HERO_OFFHAND[(Save.data || {}).hero] || null; $('offhDesc').textContent = (cur ? OFFHANDS[cur].desc : 'La rapière seule : rien ne gêne la lame.') + (fav === (cur || null) ? ' (préférée de votre héros)' : ''); },
};

// dessin de l'arme de main gauche, à la main libre (appelé par drawFighter)
function drawOffhand(g, f, j, C) {
  const k = f.offhand; if (!k || f.noBlade) return;
  const w = j.bwr, ang = Math.atan2(j.bwr[1] - j.bel[1], j.bwr[0] - j.bel[0]), d = f.dir, L = f.look || {};
  g.save(); g.translate(w[0], w[1]); g.lineJoin = 'round';
  if (k === 'dague') {
    g.rotate(ang - d * .35);
    g.strokeStyle = C('#8a7040'); g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -9); g.lineTo(0, 9); g.stroke(); // quillons
    g.fillStyle = C('#e2e8ee'); g.beginPath(); g.moveTo(2, -2.6); g.lineTo(36, -.5); g.lineTo(40, 0); g.lineTo(36, .5); g.lineTo(2, 2.6); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = .8; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .7; g.beginPath(); g.moveTo(5, -.6); g.lineTo(33, -.2); g.stroke();
    g.fillStyle = C('#5a3a20'); g.fillRect(-7, -2, 6, 4);
  } else if (k === 'rondache') {
    g.rotate(ang * .2); const col = '#6a4a2a';
    g.fillStyle = C(shade(col, -.15)); g.beginPath(); g.ellipse(d * 2, 0, 8, 19, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke();
    g.strokeStyle = C('#a8a49a'); g.lineWidth = 2; g.beginPath(); g.ellipse(d * 2, 0, 6.5, 17, 0, 0, 7); g.stroke(); // cerclage
    g.fillStyle = C('#c8c4b8'); g.beginPath(); g.ellipse(d * 4, 0, 3, 5, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = .7; g.stroke(); // umbo
  } else if (k === 'cape') {
    const col = L.cape || L.coat2 || '#3a2a2a';
    g.rotate(ang); g.fillStyle = C(shade(col, -.05)); g.beginPath(); g.ellipse(-8, 0, 13, 7.5, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke(); // enroulée sur l'avant-bras
    g.rotate(-ang); const sw = Math.sin((G.time || 0) * 3 + f.x * .01) * 3;
    g.fillStyle = C(shade(col, -.18)); g.beginPath(); g.moveTo(-6, 2); g.quadraticCurveTo(-4 - d * 4 + sw, 22, -d * 10 + sw, 34); g.lineTo(d * 6 + sw, 30); g.quadraticCurveTo(d * 6, 14, 6, 3); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = INKW; g.stroke(); // pan qui pend
  }
  g.restore();
}
