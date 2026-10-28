// =============================== relecture du dernier échange : après une touche reçue, les 2 dernières secondes au ralenti, expliquées ===============================
const Replay = {
  rec: [], last: null, cur: null, SPAN: 240, SLOW: .3,
  snap(f) { return { J: f.J, x: f.x, dir: f.dir, state: f.state, t: f.t, dur: f.dur, flash: f.flash, vx: f.vx, hp: f.hp, hpShow: f.hpShow, breath: f.breath, look: f.look, rapier: f.rapier, isPlayer: f.isPlayer, arch: f.arch, disarmed: f.disarmed,
    move: f.move && { kind: f.move.kind, wu: f.move.wu, act: f.move.act, rec: f.move.rec, lunge: f.move.lunge }, dash: f.dash && { s: f.dash.s, dur: f.dash.dur }, feet: { f: { x: f.feet.f.x, lift: f.feet.f.lift }, b: { x: f.feet.b.x, lift: f.feet.b.lift } },
    wounds: Object.assign({}, f.wounds), marks: f.marks.slice(), trail: f.trail.slice(), pose: f.pose, capeS: f.capeS, cloth: Cloth.copy(f.cloth), browC: f.browC && f.browC.slice(), hpMax: f.hpMax }; },
  record() { if (G.state !== 'fight' || !G.p.J || !G.e.J) return; this.rec.push([this.snap(G.p), this.snap(G.e)]); if (this.rec.length > this.SPAN) this.rec.shift(); },
  // pourquoi le joueur a été touché : lecture de la situation au moment de la touche
  explain(a, d, m, info, before) {
    const nm = k => (MOVES[k] && MOVES[k].name || k).toLowerCase(), now = G.time, sa = k => (k === 'griffe' ? 'ses ' : ['degage', 'beat', 'tajo'].includes(k) || /^[aeéiou]/.test(nm(k)) ? 'son ' : 'sa ') + nm(k), votre = k => (k === 'griffe' ? 'vos ' : 'votre ') + nm(k);
    if (before.state === 'attack' && before.move && (before.move.kind === 'pending' || before.phase === 'prep')) return `Contre-temps : ${sa(m.kind)} vous a touché pendant la préparation de ${votre(before.move.kind === 'pending' ? 'jab' : before.move.kind)}. Attaquez quand il recule ou récupère, pas quand il est prêt.`;
    if (before.state === 'attack' && before.move) return `Touché pendant votre retour en garde après ${votre(before.move.kind)}${before.move.whiffed ? ', parti dans le vide' : ''}. Un coup manqué se paie : attaquez à la bonne distance.`;
    if (before.state === 'broken') return 'Votre garde était brisée : après une garde brisée, rompez (double ←) plutôt que de rester sur place.';
    if (m.kind === 'lie') return 'Prise de fer : elle domine votre lame et passe la garde tenue. Parez-la au moment du contact, rompez, ou dérobez-vous (← + Attaque).';
    if (before.state === 'dash' && before.dashS > 0) return 'Vous êtes entré dans sa mesure en pas rapide : il vous attendait. Entrez quand il attaque dans le vide.';
    if (before.winded) return `À bout de souffle : vos gestes étaient plus lents. Reprenez votre souffle hors de portée (jauge bleue) avant de relancer.`;
    if (info.noGuard) {
      const rel = now - (d.lastEdge || -9);
      if (!d.prevG && rel < .45 && now - (a.lastFeint || -9) < 1.2) return 'Feinte : votre garde est partie sur la menace, puis retombée. Attendez que la lame parte vraiment (la pointe rougeoie).';
      if (!d.prevG && rel < .45) return `Garde relâchée ${rel.toFixed(2).replace('.', ',')} s avant la touche : tenez-la jusqu'au contact.`;
      return `Pas de garde : ${sa(m.kind)} visait la ligne ${LINE_NAME[m.line] || ''}. Maintenez Garde quand la pointe adverse rougeoie.`;
    }
    return `${sa(m.kind).charAt(0).toUpperCase() + sa(m.kind).slice(1)} est passé${['degage', 'beat', 'tajo'].includes(m.kind) ? '' : m.kind === 'griffe' ? 'es' : 'e'}. Variez la distance et parez au dernier moment.`;
  },
  onHit(a, d, m, info, before) {
    if (!d.isPlayer || G.state === 'demo' || this.rec.length < 30) return;
    this.last = { frames: this.rec.slice(), why: this.explain(a, d, m, info, before), at: G.time, kind: m.kind };
    const b = $('bReplay'); if (b) { b.hidden = false; clearTimeout(this.hideT); this.hideT = setTimeout(() => { b.hidden = true; }, 4500); }
  },
  start() {
    if (!this.last || this.cur || !(G.state === 'fight' || G.state === 'ko' || G.state === 'round')) return;
    $('bReplay').hidden = true; this.cur = { frames: this.last.frames, i: 0, back: G.state, why: this.last.why }; G.state = 'replay'; Snd.init(); $('touch').hidden = true;
  },
  // avance la relecture (temps réel ralenti) ; à la fin, la partie reprend où elle était
  update(rdt) {
    const c = this.cur; if (!c) return; c.i += rdt * 120 * this.SLOW;
    if (c.i >= c.frames.length + 50) this.stop();
  },
  stop() { const c = this.cur; if (!c) return; this.cur = null; G.state = c.back; $('touch').hidden = !(Input.touch && (G.state === 'fight' || G.state === 'round')); },
  proxy(s) { const f = Object.assign(Object.create(Fighter.prototype), s); f.opp = { x: 0 }; f.prevJ = s.J; return f; },
  render(rdt) { // dessine l'image enregistrée à la place de l'état courant
    const c = this.cur, k = Math.min(c.frames.length - 1, Math.floor(c.i)), fr = c.frames[k], P = G.p, E = G.e, saved = [G.sparks, G.texts, G.sfxs, G.rings, G.banner, G.drops];
    G.p = this.proxy(fr[0]); G.e = this.proxy(fr[1]); G.p.opp = G.e; G.e.opp = G.p; G.sparks = []; G.texts = []; G.sfxs = []; G.rings = []; G.banner = null; G.drops = [];
    try { G.render(rdt); } finally { G.p = P; G.e = E; [G.sparks, G.texts, G.sfxs, G.rings, G.banner, G.drops] = saved; }
    const g = G.g; g.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    const u = clamp(1 / (G.scale / Math.min(devicePixelRatio || 1, 2)), 1, 1.6), lines = this.wrap(g, c.why, 860, u);
    g.fillStyle = 'rgba(8,6,10,.78)'; g.fillRect(0, H - (28 + lines.length * 20) * u, W, (28 + lines.length * 20) * u);
    g.textAlign = 'center'; g.fillStyle = '#d8b25e'; g.font = `800 ${Math.round(11 * u)}px "Alegreya Sans", sans-serif`; g.fillText(`RELECTURE · RALENTI ×${this.SLOW.toString().replace('.', ',')} · touchez pour passer`, W / 2, H - (12 + lines.length * 20) * u);
    g.fillStyle = '#efe4c8'; g.font = `700 ${Math.round(15 * u)}px "Alegreya Sans", sans-serif`; lines.forEach((l, i) => g.fillText(l, W / 2, H - (lines.length - 1 - i) * 20 * u - 10 * u));
  },
  wrap(g, t, w, u) { g.font = `700 ${Math.round(15 * u)}px "Alegreya Sans", sans-serif`; const out = []; let cur = ''; for (const wd of t.split(' ')) { const nx = cur ? cur + ' ' + wd : wd; if (g.measureText(nx).width > w && cur) { out.push(cur); cur = wd; } else cur = nx; } if (cur) out.push(cur); return out; },
  init() {
    const b = $('bReplay'); if (b) b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); this.start(); });
    $('c').addEventListener('pointerdown', () => { if (this.cur) this.stop(); });
    addEventListener('keydown', e => { if (e.code === 'KeyR' && !this.cur) this.start(); else if (this.cur && (e.code === 'Escape' || e.code === 'Space' || e.code === 'KeyR')) this.stop(); });
  },
};
