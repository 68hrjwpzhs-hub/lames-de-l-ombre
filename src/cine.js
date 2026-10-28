// =============================== sprint 9 : mise en scène 2D (cinématiques jouées par le moteur), salut avant la manche ===============================
// Une scène = des acteurs (les deux duellistes et des figurants), et pour chaque réplique une liste d'instructions :
//   ['walk', qui, x]  ['pose', qui, geste]  ['stance', qui, posture|null]  ['enter', qui, depuisX, versX]  ['exit', qui, versX]
//   ['cam', x, zoom] ou ['cam', null]  ['face', qui, autre]  ['shake', force]  ['sfx', nom]
// Les répliques des acteurs présents s'affichent en bulle au-dessus de leur tête ; la narration garde le bandeau du bas.
Object.assign(POSES, {
  stand: P({ px: -2, py: 88, torso: 0, head: 2, a1: -72, a2: -58, a3: -70, b1: -100, b2: -92, ff: 18, bf: -20, tw: -6 }),       // au repos, lame basse
  salutUp: P({ py: 88, torso: -2, head: 4, a1: -5, a2: 118, a3: 92, b1: -100, b2: -92, ff: 18, bf: -22, tw: -4 }),             // garde au visage, lame verticale
  salutDown: P({ py: 87, torso: 4, head: -2, a1: -30, a2: -38, a3: -55, b1: -95, b2: -90, ff: 20, bf: -24 }),                  // la lame balaie vers le sol
  bow: P({ py: 84, torso: 30, head: -16, a1: -40, a2: -70, a3: -110, b1: -30, b2: 40, ff: 22, bf: -30 }),                       // révérence
  point: P({ py: 87, torso: 4, head: 0, a1: 4, a2: 2, a3: 0, b1: -100, b2: -92, ff: 22, bf: -26, tw: 8 }),                       // la pointe désigne
  kneel: P({ px: -6, py: 52, torso: 12, head: -10, a1: -82, a2: -76, a3: -90, b1: -50, b2: -10, ff: 32, bf: -30, tw: -8 }),     // un genou à terre
  shoulder: P({ py: 88, torso: -3, head: 2, a1: 50, a2: 150, a3: 172, b1: -100, b2: -92, ff: 20, bf: -22 }),                   // lame sur l'épaule
  diestro: P({ py: 88, torso: 0, head: 0, a1: -2, a2: 0, a3: 88, b1: -100, b2: -92, ff: 16, bf: -20 }),                       // salut de la destreza : bras tendu, lame droite
  monk: P({ py: 88, torso: 4, head: -6, a1: -60, a2: 60, a3: 60, b1: -60, b2: 60, ff: 16, bf: -18 }),                         // mains jointes
  triumph: P({ py: 88, torso: -6, head: 8, a1: 70, a2: 95, a3: 100, b1: -90, b2: -80, ff: 20, bf: -24 }),                     // lame levée
});
// ---- saluts : un par héros (et selon l'école pour les adversaires) ----
const SALUTS = {
  classique: B => [[0, B], [.35, POSES.salutUp], [.75, POSES.salutUp], [1.05, POSES.salutDown], [1.45, POSES.g_ext]],
  vif: B => [[0, B], [.18, POSES.salutUp], [.36, addPose(POSES.salutUp, { a3: 40, a2: 100 })], [.54, POSES.salutUp], [.8, POSES.salutDown], [1.2, POSES.g_ext]],
  gascon: B => [[0, B], [.3, POSES.salutUp], [.7, addPose(POSES.bow, { b1: 120, b2: 150 })], [1.05, addPose(POSES.bow, { b1: 120, b2: 150 })], [1.45, POSES.g_ext]],
  diestro: B => [[0, B], [.4, POSES.diestro], [.85, POSES.diestro], [1.15, POSES.salutDown], [1.45, POSES.g_line || POSES.g_ext]],
  ombre: B => [[0, B], [.4, addPose(POSES.g_ext, { head: -16, torso: 6, a3: -20 })], [.95, addPose(POSES.g_ext, { head: -16, torso: 6, a3: -20 })], [1.35, POSES.g_ext]],
  colosse: B => [[0, B], [.38, POSES.shoulder], [.85, POSES.shoulder], [1.15, POSES.salutDown], [1.45, POSES.g_ext]],
};
const HERO_SALUT = { vaucelles: 'classique', isaure: 'vif', bastien: 'gascon', alvaro: 'diestro', corvin: 'ombre', mathurin: 'colosse' };
const GESTES = { // gestes ponctuels des scènes
  salut: B => SALUTS.classique(B).slice(0, 4).concat([[1.4, POSES.stand]]),
  bow: B => [[0, B], [.4, POSES.bow], [1, POSES.bow], [1.4, POSES.stand]],
  nod: B => [[0, B], [.25, addPose(POSES.stand, { head: -16, torso: 5 })], [.6, POSES.stand]],
  draw: B => [[0, B], [.3, POSES.salutDown], [.7, POSES.g_ext]],
  point: B => [[0, B], [.3, POSES.point], [1.6, POSES.point], [2, POSES.stand]],
  triumph: B => [[0, B], [.4, POSES.triumph], [1.4, POSES.triumph], [1.8, POSES.stand]],
  lesson: B => [[0, B], [.3, POSES.fenteC], [.55, addPose(POSES.fenteA, { a3: 6 })], [1, addPose(POSES.fenteA, { a3: 6 })], [1.5, POSES.stand]],
};
const geste = (f, name) => { const fn = GESTES[name] || SALUTS[name]; if (!fn) return; const tr = fn(normPose(Object.assign({}, f.pose))); f.playTrack(tr, tr[tr.length - 1][0] + .05); };

// ---- figurants ----
const NPC_LOOK = {
  lacombe: () => mk('maitre', { name: 'Maître Lacombe', coat: '#4a3a2a', coat2: '#2a2018', hose: '#2a2018', hair: '#e8e4dc', beard: 'full', hatType: 'aucun', cape: null, plume: null, trim: '#a89060' }),
  tancrede: () => ({ name: 'Frère Tancrède', style: 'moine', body: 'h', skin: '#d9a684', hair: '#5a4632', hairStyle: 'tonsure', beard: 'none', hatType: 'aucun', coat: '#5a4632', coat2: '#4a3a28', hose: '#4a3a28', stock: '#4a3a28', boot: '#4a3020', trim: '#d8ccb0', cape: null, plume: null, noBlade: true }),
  pietro: () => (typeof STORY_FOES !== 'undefined' ? STORY_FOES.pietro.look() : mk('debutant', {})),
  gaspar: () => STORY_FOES.gaspar.look(),
  rouvray: () => STORY_FOES.rouvray.look(),
  vaucelles: () => Object.assign({}, HEROES.vaucelles.look, { name: 'Hugues de Vaucelles' }),
  ombeline: () => STORY_FOES.ombeline.look(),
  garde: () => mk('duelliste', { coat: '#8a1a1e', coat2: '#5a0e12', trim: '#d8b25e', cape: '#5a0e12' }),
};

// ---- scripts : chapitre → phase (intro, outro, ou fin choisie) → { cast, place, who, steps } ----
// who : quel acteur prononce les répliques de tel personnage (héros → p, adversaire en scène → e, figurant → sa clé)
const CINE = {
  ch01: {
    intro: { place: { p: -60, e: 700 }, cast: { lacombe: { x: 470, face: 'p', stance: 'stand' }, pietro: { x: 860, face: 'lacombe', stance: 'stand' } }, stance: { p: 'stand', e: 'stand' },
      who: { lacombe: 'lacombe', vaucelles: 'p' },
      steps: [[['cam', 520, 1.02], ['walk', 'p', 240]], [['cam', 400, 1.35], ['pose', 'lacombe', 'nod']], [['cam', 300, 1.35]], [['cam', 400, 1.3], ['face', 'lacombe', 'e']],
        [['cam', 300, 1.3], ['stance', 'p', null], ['pose', 'p', 'lesson']], [['cam', 420, 1.25], ['walk', 'lacombe', 520], ['face', 'lacombe', 'p'], ['stance', 'p', 'stand']],
        [['cam', 330, 1.35], ['pose', 'p', 'salut']], [['cam', null], ['walk', 'lacombe', 1010], ['walk', 'e', 620], ['pose', 'e', 'salut'], ['stance', 'p', null], ['stance', 'e', null]]] },
    outro: { place: { p: 300, e: 640 }, cast: { tancrede: { x: 1040, face: 'p', stance: 'monk' }, lacombe: { x: 880, face: 'p', stance: 'stand' } }, stance: { p: 'stand', e: 'kneel' },
      who: { tancrede: 'tancrede', vaucelles: 'p', lacombe: 'lacombe' },
      steps: [[['cam', 560, 1.05], ['walk', 'tancrede', 730]], [['cam', 640, 1.3], ['pose', 'tancrede', 'bow']], [['cam', 420, 1.25]], [['cam', 640, 1.35], ['stance', 'tancrede', 'monk']],
        [['cam', 760, 1.2], ['walk', 'lacombe', 820], ['pose', 'lacombe', 'nod']], [['cam', 300, 1.45], ['pose', 'p', 'point']]] },
  },
  ch02: {
    intro: { place: { p: -120, e: -40 }, stance: { p: 'stand', e: 'stand' }, who: { voleur: 'e' },
      steps: [[['cam', 480, 1.0], ['run', 'e', 700], ['run', 'p', 300]], [['cam', 340, 1.35]], [['cam', 680, 1.35]], [['cam', 420, 1.2], ['pose', 'p', 'point']], [['cam', null], ['stance', 'p', null], ['stance', 'e', null], ['sfx', 'bell']]] },
    outro: { place: { p: 340, e: 640 }, stance: { p: 'point', e: 'kneel' }, who: { voleur: 'e' },
      steps: [[['cam', 620, 1.4]], [['cam', 360, 1.3]], [['cam', 620, 1.35]], [['cam', 480, 1.0], ['stance', 'p', 'stand'], ['run', 'p', -140], ['sfx', 'bell']]] },
  },
  ch03: {
    intro: { place: { p: -60, e: 650 }, stance: { p: 'stand', e: 'stand' }, who: { mousquetaire: 'e' },
      steps: [[['cam', 520, 1.05], ['walk', 'p', 300]], [['cam', 330, 1.35]], [['cam', 640, 1.35], ['stance', 'e', null], ['pose', 'e', 'draw']], [['cam', 360, 1.3], ['pose', 'p', 'gascon']]] },
    outro: { place: { p: 330, e: 640 }, stance: { p: 'stand', e: 'kneel' }, who: { mousquetaire: 'e' },
      steps: [[['cam', 620, 1.35]], [['cam', 340, 1.3]], [['cam', 600, 1.3], ['stance', 'e', 'stand']], [['cam', 480, 1.05], ['walk', 'e', 1120]]] },
  },
  ch04: {
    intro: { place: { p: -60, e: 780 }, cast: { gaspar: { x: 600, face: 'p', stance: 'stand' } }, stance: { p: 'stand', e: 'diestro' }, who: { gaspar: 'gaspar' },
      steps: [[['cam', 520, 1.0], ['walk', 'p', 300]], [['cam', 560, 1.35], ['pose', 'gaspar', 'nod']], [['cam', 340, 1.35], ['pose', 'p', 'diestro']], [['cam', null], ['walk', 'gaspar', 900], ['walk', 'e', 640], ['stance', 'e', null], ['stance', 'p', null]]] },
    outro: { place: { p: 330, e: 640 }, stance: { p: 'stand', e: 'kneel' }, who: { gaspar: 'e' },
      steps: [[['cam', 620, 1.4]], [['cam', 340, 1.35], ['stance', 'p', 'point']], [['cam', 600, 1.3], ['stance', 'e', 'stand'], ['stance', 'p', 'stand']]] },
  },
  ch05: {
    intro: { place: { p: -60, e: 640 }, stance: { p: 'stand', e: 'stand' }, who: { ombeline: 'e' },
      steps: [[['cam', 560, 1.05], ['walk', 'p', 320]], [['cam', 640, 1.4]], [['cam', 340, 1.35]], [['cam', 620, 1.3], ['pose', 'e', 'vif']], [['cam', null], ['stance', 'p', null], ['stance', 'e', null]]] },
    outro: { place: { p: 340, e: 640 }, stance: { p: 'stand', e: 'kneel' }, who: { ombeline: 'e' },
      steps: [[['cam', 620, 1.4]], [['cam', 360, 1.3]], [['cam', 620, 1.35]]] },
  },
  ch06: {
    intro: { place: { p: -60, e: 780 }, cast: { rouvray: { x: 640, face: 'p', stance: 'stand' } }, stance: { p: 'stand', e: 'stand' }, who: { rouvray: 'rouvray' },
      steps: [[['cam', 520, 1.0], ['walk', 'p', 300]], [['cam', 340, 1.35]], [['cam', 600, 1.35], ['pose', 'rouvray', 'nod']], [['cam', null], ['walk', 'rouvray', 920], ['walk', 'e', 640], ['pose', 'p', 'colosse'], ['stance', 'e', null]]] },
    outro: { place: { p: 330, e: 640 }, stance: { p: 'stand', e: 'kneel' }, who: { rouvray: 'e' },
      steps: [[['cam', 620, 1.4]], [['cam', 340, 1.3], ['pose', 'p', 'point']], [['cam', 600, 1.35]]] },
  },
  ch07: {
    intro: { place: { p: 220, e: 1120 }, stance: { p: 'stand' }, who: { drac: 'e' },
      steps: [[['cam', 480, 1.0], ['run', 'e', 680]], [['cam', 320, 1.35], ['pose', 'p', 'ombre']], [['cam', 660, 1.35], ['shake', 2]], [['cam', null], ['stance', 'p', null]]] },
    outro: { place: { p: 330, e: 640 }, stance: { p: 'stand', e: 'kneel' }, who: { drac: 'e' },
      steps: [[['cam', 620, 1.4]], [['cam', 340, 1.35]], [['cam', 480, 1.0], ['sfx', 'bell']]] },
  },
  ch08: {
    intro: { place: { p: -60, e: 620 }, stance: { p: 'stand', e: 'stand' }, who: { brevannes: 'e' },
      steps: [[['cam', 560, 1.05], ['walk', 'p', 300]], [['cam', 620, 1.4], ['sfx', 'tick']], [['cam', 340, 1.35]], [['cam', 600, 1.3], ['pose', 'e', 'ombre']], [['cam', null], ['stance', 'p', null], ['stance', 'e', null]]] },
    outro: { place: { p: 330, e: 640 }, stance: { p: 'stand', e: 'kneel' }, who: { brevannes: 'e' },
      steps: [[['cam', 620, 1.4]], [['cam', 340, 1.3]], [['cam', 600, 1.35], ['stance', 'e', 'stand']], [['cam', 480, 1.0], ['run', 'e', 1150], ['shake', 3]]] },
  },
  ch09: {
    intro: { place: { p: 300, e: 1160 }, cast: { tancrede: { x: 520, face: 'p', stance: 'monk' }, vaucelles: { x: 650, face: 'p', stance: 'stand' } }, stance: { p: 'stand' }, who: { tancrede: 'tancrede', vaucelles: 'vaucelles' },
      steps: [[['cam', 480, 1.25], ['pose', 'tancrede', 'bow']], [['cam', 560, 1.3], ['pose', 'vaucelles', 'point']], [['cam', 480, 1.0], ['walk', 'vaucelles', 1120], ['walk', 'tancrede', 1120], ['stance', 'p', null]]] },
    outro: { place: { p: 330, e: 640 }, cast: { tancrede: { x: 1100, face: 'p', stance: 'monk' } }, stance: { p: 'stand', e: 'kneel' }, who: { tancrede: 'tancrede' },
      steps: [[['cam', 480, 1.0], ['sfx', 'bell'], ['walk', 'tancrede', 720]], [['cam', 560, 1.3], ['pose', 'tancrede', 'bow']]] },
  },
  ch10: {
    intro: { place: { p: -60, e: 720 }, cast: {}, stance: { p: 'stand', e: 'shoulder' }, who: { ecaille: 'e' },
      steps: [[['cam', 480, 1.0], ['walk', 'p', 290], ['sfx', 'bell']], [['cam', 680, 1.4], ['shake', 3]], [['cam', 600, 1.25], ['pose', 'e', 'point'], ['sfx', 'bell']],
        [['cam', null], ['stance', 'e', null], ['stance', 'p', null], ['pose', 'p', 'salut']]] },
    outro: { place: { p: 380, e: 640 }, cast: { tancrede: { x: -80, face: 'p', stance: 'monk' } }, stance: { p: 'stand', e: 'kneel' }, who: { ecaille: 'e', tancrede: 'tancrede' },
      steps: [[['cam', 600, 1.4], ['sfx', 'bell']], [['cam', 300, 1.25], ['walk', 'tancrede', 200], ['face', 'p', 'tancrede']]] },
    rendre: { keep: true, who: { tancrede: 'tancrede' }, steps: [[['cam', 260, 1.3], ['walk', 'p', 290], ['pose', 'tancrede', 'bow']], [['cam', 330, 1.35], ['pose', 'p', 'nod']], [['cam', 480, 1.0], ['walk', 'tancrede', -80]]] },
    bruler: { keep: true, who: { tancrede: 'tancrede' }, steps: [[['cam', 640, 1.2], ['face', 'p', 'e'], ['walk', 'p', 560], ['sfx', 'bell']], [['cam', 220, 1.35], ['pose', 'tancrede', 'nod']], [['cam', 480, 1.0], ['pose', 'p', 'triumph']]] },
  },
};

const Cine = {
  on: false, sc: null, npcs: {}, cam: null, bubble: null, title: null,
  actor(k) { return k === 'p' ? G.p : k === 'e' ? G.e : this.npcs[k] || null; },
  begin(chId, phase) {
    const sc = CINE[chId] && CINE[chId][phase]; if (!sc) { if (!(this.sc && phase !== 'intro' && phase !== 'outro')) this.end(); return false; }
    if (!sc.keep) this.clearNpcs();
    this.on = true; this.sc = sc; this.cam = null; this.bubble = null;
    if (sc.place) { if (sc.place.p != null) G.p.reset(sc.place.p); if (sc.place.e != null) G.e.reset(sc.place.e); }
    const hk = this.heroKey();
    for (const k in sc.cast || {}) { if (k === hk || (sc.cast[k].if && !sc.cast[k].if(Story.data()))) continue; const c = sc.cast[k], L = NPC_LOOK[k] ? NPC_LOOK[k]() : mk('duelliste', {}); const f = new Fighter(false, L); f.noBlade = !!L.noBlade; f.opp = G.p; f.reset(c.x); f.npcKey = k; this.npcs[k] = f; if (c.stance) f.stance = c.stance; }
    for (const k in sc.cast || {}) { const c = sc.cast[k]; if (c.face && this.npcs[k]) this.npcs[k].opp = this.actor(c.face) || G.p; }
    if (sc.stance) for (const k in sc.stance) { const a = this.actor(k); if (a) a.stance = sc.stance[k]; }
    for (const k of ['p', 'e', ...Object.keys(this.npcs)]) { const a = this.actor(k); if (a) a.walkTo = null; }
    return true;
  },
  clearNpcs() { this.npcs = {}; },
  end() { G.p.talking = G.e.talking = false; this.on = false; this.sc = null; this.cam = null; this.bubble = null; this.clearNpcs(); for (const f of [G.p, G.e]) { f.stance = null; f.walkTo = null; if (f.state === 'cine') f.setState('idle'); } },
  // exécute les instructions d'une réplique ; renvoie l'acteur qui parle (bulle) ou null (bandeau)
  line(k, l) {
    if (!this.on || !this.sc) return null; const st = this.sc.steps && this.sc.steps[k] || [];
    for (const a of st) this.exec(a);
    const who = l.who === this.heroKey() ? 'p' : this.sc.who && this.sc.who[l.who], act = who && this.actor(who);
    this.bubble = act ? { act, txt: l.txt, t0: performance.now(), name: (SPK[l.who] || {}).name || '' } : null;
    if (act) for (const f of [G.p, G.e, ...Object.values(this.npcs)]) if (f !== act && f.state !== 'cine' && f.x > -100 && f.x < W + 100 && Math.random() < .35) setTimeout(() => { if (this.on && f.state !== 'cine') geste(f, 'nod'); }, 500 + Math.random() * 900); // les autres réagissent : un hochement de tête
    return act;
  },
  exec(a) {
    const [op, k, v, w] = a, f = typeof k === 'string' ? this.actor(k) : null;
    switch (op) {
      case 'walk': if (f) { f.walkTo = v; f.run = false; } break;
      case 'run': if (f) { f.walkTo = v; f.run = true; } break;
      case 'pose': if (f) geste(f, v); break;
      case 'stance': if (f) { f.stance = v; if (f.state === 'cine') f.setState('idle'); } break;
      case 'enter': if (f) { f.reset(v); f.walkTo = w; } break;
      case 'exit': if (f) f.walkTo = v; break;
      case 'face': { const o = this.actor(v); if (f && o) { if (f === G.p || f === G.e) f.faceT = o; else f.opp = o; } break; }
      case 'cam': this.cam = k == null ? null : { x: k, s: v || 1.2 }; break;
      case 'shake': G.shake = Math.max(G.shake || 0, k || 4); break;
      case 'sfx': if (k === 'bell') { Snd.bell(); setTimeout(() => Snd.bell(), 650); } else if (Snd[k]) Snd[k](); break;
    }
  },
  heroKey() { const h = typeof curHero === 'function' && curHero(); return h && Object.keys(HEROES).find(x => HEROES[x].name === h.name) || null; },
  salutOf(f) {
    if (f.isPlayer) { const h = typeof curHero === 'function' && curHero(); const k = h && Object.keys(HEROES).find(x => HEROES[x].name === h.name); return HERO_SALUT[k] || 'classique'; }
    return f.arch === 'destreza' ? 'diestro' : f.arch === 'drac' ? 'colosse' : f.sig === 'horloger' ? 'ombre' : f.sig === 'lanterne' ? 'vif' : 'classique';
  },
  revealed() { const b = this.bubble; return !b || (performance.now() - b.t0) / 1000 * 42 >= b.txt.length; },
  reveal() { if (this.bubble) this.bubble.t0 = -1e9; },
  // pilote la marche des acteurs (appelé à chaque pas de simulation pendant une scène)
  step(dt) {
    if (!this.on) return; const tb = this.bubble && !this.revealed() ? this.bubble.act : null; for (const f of [G.p, G.e, ...Object.values(this.npcs)]) f.talking = f === tb;
    const drive = f => { if (f.walkTo == null || f.state === 'cine') { f.intent.dx = 0; return; } const d = f.walkTo - f.x; if (Math.abs(d) < 5) { f.intent.dx = 0; f.walkTo = null; } else f.intent.dx = Math.sign(d) * (f.run ? 1 : .5); };
    for (const f of [G.p, G.e]) drive(f);
    for (const k in this.npcs) { const f = this.npcs[k]; drive(f); f.update(dt); }
  },
  // un acteur mené à reculons se retourne : les duellistes regardent leur cible de scène si elle est donnée
  fixFacing() { for (const f of [G.p, G.e]) if (this.on && f.faceT && f.state !== 'ko') f.dir = f.faceT.x > f.x ? 1 : -1; },
  drawWorld(g, venue, time) { if (!this.on) return; for (const k in this.npcs) { const f = this.npcs[k]; if (!f.J) continue; Paint.actor(g, f, venue, time); } },
  // bulle de dialogue (repère écran) et carton de titre
  drawScreen(g, cam, u) {
    const b = this.bubble;
    if (b && b.act && b.act.J && G.state === 'scene') {
      const j = b.act.J, sx = (j.head[0] - cam.x) * cam.s + W / 2, sy = (j.head[1] - 40 - cam.y) * cam.s + H / 2;
      const n = Math.floor(Math.max(0, (performance.now() - b.t0) / 1000) * 42), txt = b.txt.slice(0, n), fs = Math.round(15 * u), lh = fs * 1.3, mw = Math.min(360 * u, W * .6);
      g.font = `600 ${fs}px "Alegreya Sans", sans-serif`; const lines = wrapLines(g, b.txt, mw), shown = wrapLines(g, txt, mw);
      const bw = Math.min(mw, Math.max(...lines.map(l => g.measureText(l).width))) + 24 * u, bh = lines.length * lh + 30 * u;
      const bx = clamp(sx - bw / 2, 8, W - bw - 8), by = clamp(sy - bh - 14 * u, 8, H - bh - 8), tx = clamp(sx, bx + 14 * u, bx + bw - 14 * u);
      g.save(); g.fillStyle = 'rgba(246,236,214,.96)'; g.strokeStyle = 'rgba(60,40,24,.85)'; g.lineWidth = 1.5 * u;
      g.beginPath(); g.roundRect ? g.roundRect(bx, by, bw, bh, 10 * u) : g.rect(bx, by, bw, bh); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(tx - 8 * u, by + bh - 1); g.lineTo(clamp(sx, bx, bx + bw), Math.min(sy, by + bh + 14 * u)); g.lineTo(tx + 8 * u, by + bh - 1); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(246,236,214,1)'; g.fillRect(tx - 7 * u, by + bh - 3 * u, 14 * u, 4 * u);
      g.fillStyle = '#7a4a1a'; g.font = `800 ${Math.round(10.5 * u)}px "Alegreya Sans", sans-serif`; g.textAlign = 'left'; g.fillText(b.name.toUpperCase(), bx + 12 * u, by + 15 * u);
      g.fillStyle = '#2a1e14'; g.font = `600 ${fs}px "Alegreya Sans", sans-serif`; shown.forEach((l, i) => g.fillText(l, bx + 12 * u, by + 15 * u + (i + 1) * lh));
      if (this.revealed() && Math.sin(performance.now() / 180) > 0) { g.fillStyle = '#7a4a1a'; g.beginPath(); const ax = bx + bw - 14 * u, ay = by + bh - 10 * u; g.moveTo(ax - 4 * u, ay - 4 * u); g.lineTo(ax + 4 * u, ay - 4 * u); g.lineTo(ax, ay + 2 * u); g.closePath(); g.fill(); }
      g.restore();
    }
    const T = this.title; if (T) { const t = (performance.now() - T.t0) / 1000; if (t > 2.6) this.title = null; else drawTitleCard(g, T, t, u); }
  },
};
function wrapLines(g, text, maxW) { const out = []; let cur = ''; for (const w of text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out.length ? out : ['']; }
// carton de chapitre façon gravure : cadre à filets, numéro en capitales, titre calligraphié
function drawTitleCard(g, T, t, u) {
  const a = Math.min(1, t / .4, (2.6 - t) / .5), y = H * .42;
  g.save(); g.globalAlpha = clamp(a, 0, 1);
  const gr = g.createLinearGradient(0, y - 90, 0, y + 90); gr.addColorStop(0, 'rgba(10,7,6,0)'); gr.addColorStop(.25, 'rgba(10,7,6,.86)'); gr.addColorStop(.75, 'rgba(10,7,6,.86)'); gr.addColorStop(1, 'rgba(10,7,6,0)');
  g.fillStyle = gr; g.fillRect(0, y - 90, W, 180);
  const w2 = 230 + 40 * Math.min(1, t / .8); g.strokeStyle = 'rgba(216,178,94,.85)'; g.lineWidth = 1;
  for (const dy of [-46, 46]) { g.beginPath(); g.moveTo(W / 2 - w2, y + dy); g.lineTo(W / 2 + w2, y + dy); g.stroke(); g.beginPath(); g.moveTo(W / 2 - w2 + 12, y + dy + (dy < 0 ? 4 : -4)); g.lineTo(W / 2 + w2 - 12, y + dy + (dy < 0 ? 4 : -4)); g.stroke();
    g.fillStyle = 'rgba(216,178,94,.9)'; g.save(); g.translate(W / 2, y + dy); g.rotate(Math.PI / 4); g.fillRect(-4, -4, 8, 8); g.restore(); }
  g.textAlign = 'center'; g.fillStyle = '#d8b25e'; g.font = `800 ${Math.round(12 * u)}px "Alegreya Sans", sans-serif`; g.fillText((T.act + ' · Chapitre ' + T.n).toUpperCase().split('').join(' '), W / 2, y - 22);
  g.fillStyle = '#f6ead0'; g.font = `${Math.round(34 * Math.min(u, 1.3))}px "IM Fell English SC", Georgia, serif`; g.fillText(T.title, W / 2, y + 22);
  g.restore();
}
