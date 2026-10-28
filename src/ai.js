
// =============================== IA ===============================
// L'IA ne lit jamais les entrées du joueur : elle voit son adversaire avec un temps de réaction (react),
// estime l'instant d'impact d'après la gestuelle (avec une erreur « noise ») et décide selon la distance.
const LEVELS = {
  debutant: { react: .34, noise: .06, perfect: .10, lineRead: .35, guardP: .5, hold: .45, dashBack: .06, stopHit: 0, punish: .2, feint: 0, aggr: .5,
    w: { jab: 6, fente: 2, bassa: 1, degage: 0, circ: .4, compo: 0, heavy: .5 }, think: [.6, 1.1], spaceErr: 55, late: .28, wary: .2, longP: .5, slow: 1.8, feintDecay: .97, retreatAfter: .08, bait: 0, adapt: 0, dashIn: .1, fer: 0, derob: .1, esq: 0 },
  duelliste: { react: .21, noise: .035, perfect: .4, lineRead: .68, guardP: .7, hold: .2, dashBack: .32, stopHit: .14, punish: .65, feint: .18, aggr: .55,
    w: { jab: 5, fente: 2.2, bassa: 2, degage: 1.6, circ: 1.4, compo: 1, heavy: .7 }, think: [.38, .75], spaceErr: 25, late: .08, wary: .4, longP: .3, slow: 1.55, feintDecay: .85, retreatAfter: .4, bait: .12, adapt: .3, dashIn: .3, fer: .14, derob: .45, esq: .07 },
  maitre: { react: .18, noise: .02, perfect: .48, lineRead: .85, guardP: .72, hold: .05, dashBack: .42, stopHit: .3, punish: .85, feint: .24, aggr: .55,
    w: { jab: 4, fente: 2.2, bassa: 2.4, degage: 2.4, circ: 2, compo: 1.8, heavy: .7 }, think: [.28, .6], spaceErr: 10, late: 0, wary: .5, longP: .25, slow: 1.35, feintDecay: .7, retreatAfter: .55, bait: .25, adapt: .8, dashIn: .4, fer: .24, derob: .55, esq: .13 },
};
const roll = p => Math.random() < p;
// archétypes d'adversaires : poids d'attaque ajoutés et réglages modifiés
const ARCH = {
  destreza: { w: { tajo: 2.6, jab: 1.2 }, add: { fer: .32, derob: .2, stopHit: .18, bait: .15 }, compas: 34 }, // l'Espagnol : bras tendu, atajo, tajo, compás
  drac: { w: { griffe: 3.2, heavy: 1 }, add: { react: .02, dashBack: -.15 }, mul: { slow: 1.1 }, compas: 0 }, // le drac : lent, puissant, griffes qui brisent la garde
};
class AI {
  constructor(me, foe, level, tweak) {
    this.me = me; this.foe = foe; this.level = level; this.L = Object.assign({}, LEVELS[level], tweak || {});
    const A = tweak && ARCH[tweak.arch]; if (A) { const L = this.L; L.w = Object.assign({}, L.w); for (const k in A.w) L.w[k] = (L.w[k] || 0) + A.w[k]; for (const k in A.add || {}) L[k] = clamp((L[k] || 0) + A.add[k], 0, 1); for (const k in A.mul || {}) L[k] *= A.mul[k]; this.arch = tweak.arch; }
    me.slow = this.L.slow; this.reset();
  }
  reset() {
    this.seen = []; this.plan = null; this.next = rand(.4, .9); this.td = REACH.jab + 20; this.tdT = 0; this.feintTrust = 1; this.hist = [];
    this.handled = -1; this.punished = -1; this.retreated = -1; this.followUp = null; this.lastFeintSeen = 0; this.guardSince = null; this.S = null; this.ferSeen = 0;
  }
  snap(f) { const m = f.move; return { t: G.time, state: f.state, x: f.x, vx: f.vx, guarding: f.guarding, gline: f.gline, kind: m && m.kind, id: m ? m.id : 0, line: m && m.line, start: m && m.start, wu: m && m.wu, act: m && m.act, ph: f.phase(), whiffed: m && m.whiffed, feintId: f.feintId || 0, dashS: f.dash ? f.dash.s * f.dir : 0 }; }
  perceive() {
    const now = G.time; this.seen.push(this.snap(this.foe));
    while (this.seen.length > 2 && this.seen[1].t < now - this.L.react - .05) this.seen.shift();
    let S = null; for (let i = this.seen.length - 1; i >= 0; i--) if (this.seen[i].t <= now - this.L.react) { S = this.seen[i]; break; }
    this.S = S; return S;
  }
  // attaque choisie selon la distance, la garde vue et les habitudes de l'adversaire
  chooseAttack(pd, S) {
    const L = this.L, w = Object.assign({}, L.w);
    for (const k in w) if (pd > REACH[k] - 8) w[k] = 0;
    if (S && S.guarding) { w.heavy *= 1 + L.adapt * 6; w.jab *= .5; if (w.griffe) w.griffe *= 3; } // une garde tenue ne se force qu'avec la fente lourde (ou une feinte)
    if (S && S.state === 'attack' && S.kind === 'lie') for (const k of STRAIGHT) w[k] = 0; // une prise de fer en cours dévie toute attaque directe
    if (this.ferSeen > 1) { for (const k of STRAIGHT) w[k] *= Math.max(.3, 1 - L.adapt * .7); const k = 1 + L.adapt * Math.min(4, this.ferSeen) * .6; w.degage *= k; w.compo *= k; } // il cherche le fer : se dérober
    let tot = 0; for (const k in w) tot += w[k]; if (tot <= 0) return null;
    let r = Math.random() * tot; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return 'jab';
  }
  predictLine() { // ligne la plus fréquente des dernières attaques adverses
    if (this.hist.length < 3) return null; const c = {}; for (const l of this.hist) c[l] = (c[l] || 0) + 1;
    let best = null; for (const l in c) if (!best || c[l] > c[best]) best = l; return c[best] / this.hist.length >= .5 ? best : null;
  }
  think(dt) {
    const me = this.me, foe = this.foe, L = this.L, it = me.intent, now = G.time;
    const S = this.perceive();
    if (me.state === 'ko' || me.state === 'win' || foe.state === 'ko') { it.dx = 0; it.guard = false; this.plan = null; return; }
    if (!S) return;
    const pd = Math.abs(S.x - me.x), dir = me.dir;
    this.feintTrust = Math.min(1, this.feintTrust + dt * .04);
    if (S.guarding) { if (this.guardSince === null) this.guardSince = S.t; } else this.guardSince = null;
    // suite programmée (feinte → attaque, pas en avant → attaque)
    if (this.followUp && now >= this.followUp.at) { if (me.canAct()) it.act = this.followUp.act; this.followUp = null; }
    // retraite après sa propre attaque
    if (me.state === 'attack' && me.move.id !== this.retreated && me.phase() === 'rec') {
      const m = me.move; if (now - m.start > m.wu + m.act + m.rec * .46) { this.retreated = m.id; if (roll(L.retreatAfter) && me.x * dir > (dir > 0 ? 90 : -870)) it.dash = -1; }
    }
    // touché : on garde le bouton de garde pour la reprise (réflexe humain), afin de ne pas subir l'enchaînement
    const ferRecent = (this.ferTimes || []).filter(t => t > now - 5).length;
    // lame battue : rompre avant l'estocade qui suit (on sent le battement sur sa propre lame)
    if (me.state === 'beaten' && !this.beatenSeen) { this.beatenSeen = true; const room = dir > 0 ? me.x > 120 : me.x < W - 120; if (room && roll(L.dashBack + L.adapt * .3 + (ferRecent >= 2 ? .2 : 0))) it.dash = -1; }
    if (me.state !== 'beaten') this.beatenSeen = false;
    if (me.state === 'hit' && !this.inHit) { this.inHit = true; if (ferRecent >= 2 && roll(L.adapt)) this.plan = { type: 'back', until: now + .6 }; else if (roll(L.guardP)) this.plan = { type: 'guard', line: this.predictLine() || 'ext', pend: null, at: now, lineAt: now, until: now + .75, wary: true, afterHit: true }; }
    if (me.state !== 'hit') this.inHit = false;
    if (this.esqAt && now >= this.esqAt) { this.esqAt = null; if (me.canEsq()) it.esq = true; }
    // parade parfaite : l'IA appuie sur Riposte avec plus ou moins d'à-propos selon son niveau
    if (me.ripOffer) { const o = me.ripOffer; if (o.aiAt === undefined) o.aiAt = roll(.4 + L.punish * .6) ? now + (roll(L.perfect + .35) ? rand(RIP_PERFECT[0] + .01, RIP_PERFECT[1] - .01) : rand(RIP_PERFECT[1] + .02, RIP_WIN - .03)) : null; if (o.aiAt && now >= o.aiAt) { it.rip = true; o.aiAt = null; this.plan = null; it.guard = false; } }
    // garde réussie : riposte manuelle immédiate (sensation de sa propre lame, pas de lecture adverse)
    if (me.state === 'block' && me.lastBlockT !== this.counteredT && now - me.lastBlockT < .05) { this.counteredT = me.lastBlockT; const lung = (this.fenteT || []).filter(t => t > now - 6).length >= 2; if (lung) { this.plan = { type: 'guard', line: 'ext', pend: 'ext', at: now, lineAt: now, until: now + .25, wary: true }; } else if (roll(Math.max(.4, L.punish * .85))) { it.act = pd > REACH.jab - 10 ? 'fente' : pick(['jab', 'jab', 'degage']); this.plan = null; it.guard = false; } } // contre un fendeur : pas de fente de loin dans sa reprise
    // ---- défense ----
    if (S.feintId > this.lastFeintSeen) { // une feinte vue : on peut mordre… de moins en moins
      this.lastFeintSeen = S.feintId;
      if (!this.plan && me.canGuard() && roll(L.guardP * this.feintTrust)) this.plan = { type: 'guard', line: 'ext', at: now, until: now + rand(.3, .5), fooled: true };
      else if (this.feintTrust < .55 && roll(L.adapt * .5) && pd <= REACH.jab - 6 && me.canAct()) it.act = 'jab'; // attaque sur la feinte
      this.feintTrust *= L.feintDecay;
    }
    if (S.state === 'attack' && S.id !== this.handled && S.ph !== 'rec' && S.kind !== 'riposte' && S.kind !== 'pending') {
      this.handled = S.id; this.atkTimes = (this.atkTimes || []).filter(t => t > now - 2.5); this.atkTimes.push(now); this.hist.push(S.kind === 'compo' ? 'int' : S.line); if (this.hist.length > 6) this.hist.shift(); this.kinds = (this.kinds || []).concat(S.kind).slice(-4);
      // le joueur répète le même coup : l'IA en apprend le rythme (garde et parade parfaite plus probables), d'autant plus qu'elle est forte
      this.reps = (this.reps || []).filter(r => r.t > now - 3.5); const rep = this.reps.filter(r => r.k === S.kind).length; this.reps.push({ k: S.kind, t: now });
      const boost = rep >= 2 ? Math.min(.5, (rep - 1) * .17) * (.45 + L.adapt * .7) : 0;
      const threat = pd <= REACH[S.kind] + 40;
      if (MOVES[S.kind].fer) { // le fer adverse : se dérober (dégagement), rompre, ou parer la prise de fer au bon moment
        this.ferSeen = Math.min(6, this.ferSeen + 1); this.ferTimes = (this.ferTimes || []).filter(t => t > now - 5).concat(now);
        if (threat && me.canAct() && pd <= REACH.degage + 30 && roll(L.derob)) { it.guard = false; it.act = 'degage'; this.plan = null; }
        else if (threat && S.kind === 'lie' && roll(L.dashBack) && me.canDash(-1)) { it.guard = false; it.dash = -1; this.plan = { type: 'wait', until: now + .35 }; }
        else if (threat && S.kind === 'lie' && roll(L.perfect)) { const est = S.start + S.wu + S.act * .35, at = Math.max(now + (me.guarding ? CFG.mash + .02 : 0), est - rand(.03, .1)); it.guard = false; this.plan = { type: 'guard', line: 'ext', pend: 'ext', at, lineAt: at, until: est + .3, id: S.id, seenLine: 'ext', perfect: true }; }
      }
      else if (threat) {
        const est = S.start + S.wu + S.act * .35 + rand(-L.noise, L.noise);
        const slowMove = S.wu >= .27, room = dir > 0 ? me.x > 160 : me.x < W - 160;
        const pred = this.predictLine(); let line = roll(L.lineRead) ? S.line : (roll(L.adapt) && pred) || 'ext';
        const fentes = (this.fenteT = (this.fenteT || []).filter(t => t > now - 6).concat(S.kind === 'fente' ? [now] : [])).length; // il enchaîne les fentes : l'IA en lit le rythme
        if (S.kind === 'fente' && fentes >= 2 && roll(Math.min(.9, .3 + L.adapt * .7 + (fentes - 2) * .08))) {
          const r = Math.random();
          if (r < .5 && est - now > .09 && me.canEsq()) { this.esqAt = Math.max(now, est - rand(.07, .14)); this.plan = null; it.guard = false; } // volte, puis riposte
          else if (r < .6 && room && pd < REACH.fente - 30 && me.canDash(-1)) { it.dash = -1; it.guard = false; this.plan = { type: 'wait', until: now + .3 }; } // rompre : la fente tombe dans le vide, puis punir
          else { const atP = Math.max(now + (me.guarding ? CFG.mash + .02 : 0), est - rand(.03, .1)); if (atP > est - .02) this.plan = { type: 'guard', line: 'ext', pend: 'ext', at: now, lineAt: now, until: est + .3, id: S.id, seenLine: S.line }; else { this.plan = { type: 'guard', line: 'ext', pend: 'ext', at: atP, lineAt: atP, until: est + .3, id: S.id, seenLine: S.line, perfect: true }; it.guard = false; } } // pas le temps de relâcher : on tient la garde
        }
        else if (S.kind === 'heavy') { // la fente lourde brise la garde tenue : esquiver, frapper dans sa préparation, la parer au dernier instant… ou encaisser la garde brisée plutôt que la touche
          const atP = Math.max(now + (me.guarding ? CFG.mash + .02 : 0), est - rand(.03, .1));
          if (room && pd + 90 > REACH.heavy + 10 && roll(Math.min(.9, L.dashBack * 1.5 + .25)) && me.canDash(-1)) { it.guard = false; it.dash = -1; this.plan = { type: 'wait', until: now + .4 }; }
          else if (pd <= REACH.jab + 6 && now < est - .24 && me.canAct() && roll(L.stopHit + .2)) { it.guard = false; it.act = 'jab'; this.plan = null; }
          else if (atP <= est - .02 && roll(L.perfect + .2)) { this.plan = { type: 'guard', line: 'ext', pend: 'ext', at: atP, lineAt: atP, until: est + .3, id: S.id, seenLine: S.line, perfect: true }; it.guard = false; }
          else if (me.canGuard()) this.plan = { type: 'guard', line: 'ext', pend: 'ext', at: now, lineAt: now, until: est + .3, id: S.id, seenLine: S.line };
        }
        else if (S.kind !== 'heavy' && (L.esq || 0) > 0 && est - now > .09 && me.canEsq() && roll(L.esq + boost * .3)) { this.esqAt = Math.max(now, est - rand(.07, .15)); this.plan = null; it.guard = false; } // esquive au dernier moment (plus ou moins juste)
        else if (['fente', 'circ'].includes(S.kind) && room && roll(L.dashBack) && me.canDash(-1)) { it.dash = -1; this.plan = { type: 'wait', until: now + .35 }; }
        else if (slowMove && pd <= REACH.jab + 6 && now < est - .2 && me.canAct() && roll(L.stopHit)) it.act = 'jab'; // contretemps : frapper dans la préparation lente
        else if (me.canGuard() && roll(L.guardP + boost + (pred === S.line ? .2 * (.5 + L.adapt) : 0))) {
          const perfect = roll(L.perfect + boost);
          const at = perfect ? Math.max(now, est - rand(.03, Math.min(.13, CFG.perfect * .85))) : now + rand(0, L.late); // réaction tardive selon le niveau
          if (me.guarding && perfect && at - now <= CFG.mash + .02) this.plan = { type: 'guard', line, pend: line, at: now, lineAt: now, until: est + .3, id: S.id, seenLine: S.line, perfect }; // pas le temps de relâcher : on tient
          else this.plan = { type: 'guard', line: me.guarding ? me.gline : line, pend: line, at, lineAt: at, until: est + .3, id: S.id, seenLine: S.line, perfect };
        } else if (roll(.5)) this.plan = { type: 'back', until: now + .3 };
      }
    }
    if (this.plan) {
      const pl = this.plan;
      if (pl.wary && (S.state === 'attack' && S.whiffed || ['parried', 'broken', 'hit', 'clash'].includes(S.state) || pd > REACH.jab + 40)) { this.plan = null; it.guard = false; }
      else if (pl.type === 'guard') {
        // l'attaque composée change de ligne : on peut la relire
        if (pl.id && S.id === pl.id && S.line !== pl.seenLine) { pl.seenLine = S.line; if (roll(L.lineRead)) { pl.pend = S.line; const est = S.start + S.wu + S.act * .35; pl.lineAt = pl.perfect ? Math.max(now, est - rand(.03, .1)) : now; pl.until = est + .3; } }
        if (now >= pl.lineAt) pl.line = pl.pend || pl.line;
        it.guard = now >= pl.at; it.gline = pl.line; it.dx = 0;
        if (now > pl.until + (pl.fooled ? 0 : L.hold)) { this.plan = null; it.guard = false; }
      } else if (pl.type === 'back') { it.dx = -dir; it.guard = false; if (now > pl.until) this.plan = null; }
      else { it.dx = 0; if (now > pl.until) this.plan = null; }
      if (this.plan) return;
    }
    it.guard = false;
    if (me.busy) { it.dx = 0; return; }
    // ---- occasions ----
    if (S.state === 'attack' && S.whiffed && S.id !== this.punished) { // punir une attaque dans le vide
      this.punished = S.id;
      if (roll(L.punish)) { if (ferRecent >= 2 && pd <= REACH.degage - 6) { it.act = 'degage'; return; } if (pd <= REACH.jab - 6) { it.act = 'jab'; return; } if (pd <= REACH.fente - 8) { it.act = 'fente'; return; } if (pd <= REACH.fente + 70) { it.dash = 1; this.followUp = { at: now + .14, act: pd - 82 <= REACH.jab ? 'jab' : 'fente' }; return; } }
    }
    const lunger0 = (this.fenteT || []).filter(t => t > now - 6).length >= 2 && S.state === 'recoil'; // un fendeur repart aussitôt : on ne s'avance pas dans sa reprise
    if (!lunger0 && ['parried', 'broken', 'clash', 'recoil', 'hit', 'beaten', 'stumble'].includes(S.state) && pd <= REACH.jab - 4 && roll(.5 + L.punish * .5)) { const k = this.chooseAttack(pd, S); it.act = S.state === 'broken' || !k || k === 'heavy' ? 'jab' : k; return; }
    if (S.state === 'walk' && S.vx * -dir > 60 && pd <= REACH.jab && pd > REACH.jab - 40 && roll(L.stopHit * dt * 20)) { it.act = 'jab'; return; } // il entre dans ma mesure : attaque sur la préparation
    // il martèle : ne pas attaquer dans ses estocades ; rester juste hors de sa portée (ou en garde) et punir le coup dans le vide
    const mashing = (this.atkTimes || []).filter(t => t > now - 2.5).length >= 3;
    if (mashing && pd <= REACH.fente && me.canGuard() && roll(.4 + L.adapt * .6)) { // garde tenue : ses estocades butent dessus, la riposte part de la garde
      this.plan = { type: 'guard', line: 'ext', pend: 'ext', at: now, lineAt: now, until: now + .35, wary: false }; it.guard = true; it.gline = 'ext'; it.dx = 0; return; }
    if (this.guardSince !== null && now - this.guardSince > .5 && roll(L.adapt * dt * 3)) { // garde tenue : viser la ligne ouverte
      if (roll(L.fer * 2.5) && pd <= REACH.jab) { if (roll(.5)) { it.act = 'beat'; this.followUp = { at: now + MOVES.beat.wu * L.slow + .1, act: pd <= REACH.jab - 10 ? 'jab' : 'fente' }; } else it.act = 'lie'; return; } // garde tenue : la battre ou la dominer
      if (roll(.6) && pd <= REACH.heavy - 8) { it.act = 'heavy'; return; } if (pd <= REACH.jab + 30) { it.act = 'feint'; this.followUp = { at: now + rand(.3, .45), act: pick(['jab', 'degage', 'bassa']) }; return; }
    }
    // il cherche souvent le fer : ne pas lui offrir la lame (dérobement préventif ou rupture) plutôt que d'attendre en garde
    if (ferRecent >= 2 && pd <= REACH.beat && S.state !== 'dash' && (S.state !== 'attack' || MOVES[S.kind] && MOVES[S.kind].fer || S.ph === 'rec') && roll(L.derob * dt * 7)) {
      if (pd <= REACH.degage - 6) { it.act = 'degage'; return; }
      const nearWall = dir > 0 ? me.x < 120 : me.x > W - 120; if (!nearWall) { it.dash = -1; return; }
    }
    // garde d'anticipation : à portée de son estocade, on ferme une ligne un moment (la ligne habituelle de l'adversaire)
    this.waryT = (this.waryT || 0) - dt;
    const pressure = (this.atkTimes || []).filter(t => t > now - 2.5).length;
    if (this.waryT <= 0 && pd <= REACH.jab + 15 && (S.state !== 'attack' || S.ph === 'rec' || pressure >= 3)) {
      this.waryT = rand(.2, .45);
      if (roll(Math.min(.92, L.wary + pressure * .15) * (ferRecent >= 2 ? .35 : 1))) { const line = (roll(L.adapt) && this.predictLine()) || 'ext'; this.plan = { type: 'guard', line, pend: line, at: now, lineAt: now, until: now + rand(.4, 1), wary: true }; it.guard = true; it.gline = line; it.dx = 0; return; }
    }
    // ---- mesure et tempo : allers-retours autour de la distance voulue ----
    this.tdT -= dt;
    if (this.tdT <= 0) {
      this.tdT = rand(.5, 1.3); const r = Math.random();
      this.td = r < L.bait ? REACH.jab - 10 // appât : entrer à la limite de sa portée pour provoquer une attaque
        : r < .25 + L.bait ? REACH.fente + 30 // reprendre de la distance
          : REACH.jab + 18 + rand(-L.spaceErr, L.spaceErr);
      if ((this.kinds || []).filter(k => k === 'fente' || k === 'heavy').length >= 2 && roll(.4 + L.adapt * .5)) this.td = REACH.fente + 30; // il fend souvent : rester hors de sa mesure
      this.baitT = r < L.bait ? now + .35 : 0;
      if (this.arch === 'drac' && roll(.6)) { this.td = REACH.griffe - 14; this.baitT = 0; } // le drac colle à son adversaire pour griffer
    }
    if (this.baitT && now > this.baitT) { this.td = REACH.fente + 20; this.baitT = 0; }
    const cp = this.arch ? ARCH[this.arch].compas : 0, td = this.td + Math.sin(now * (cp ? 3.4 : 2.3) + (me.isPlayer ? 1 : 0)) * (14 + cp); // compás : l'Espagnol entre et sort de mesure sans cesse
    const nearWall = dir > 0 ? me.x < 90 : me.x > W - 90;
    it.dx = pd > td + 12 ? dir : pd < td - 12 && !nearWall ? -dir : 0;
    // fer engagé : pousser pour dominer la lame (selon le goût du fer et l'adaptation), surtout s'il pousse lui-même
    if (me.engaged) { if (!this.wasEng) { this.wasEng = true; if (roll(L.fer * 1.6 + L.adapt * .25)) this.pushUntil = now + rand(.4, 1.1); }
      if (foe.intent && foe.intent.dx * foe.dir > .3 && !(this.pushUntil > now) && roll(L.adapt * dt * 4)) this.pushUntil = now + rand(.3, .8);
      if (this.pushUntil > now && !nearWall) it.dx = dir; } else this.wasEng = false;
    // ---- décision d'attaque, à son rythme ----
    this.next -= dt; if (this.next > 0) return;
    if (pressure >= 3 && pd <= REACH.jab + 30 && roll(.5 + L.adapt * .5)) { this.plan = { type: 'guard', line: 'ext', pend: 'ext', at: now, lineAt: now, until: now + rand(.5, .9), wary: true }; return; } // sous pression : garder et riposter plutôt qu'attaquer lentement
    this.next = rand(L.think[0], L.think[1]);
    if (!roll(L.aggr)) return;
    if (roll(L.fer) && pd <= REACH.jab) { // le fer : battement puis estocade, ou prise de fer
      if (roll(this.arch === 'destreza' ? .3 : .6)) { it.act = 'beat'; this.followUp = { at: now + MOVES.beat.wu * L.slow + .1, act: pd <= REACH.jab - 10 ? pick(['jab', 'jab', 'bassa']) : 'fente' }; } else it.act = 'lie'; return; }
    if (roll(L.feint) && pd <= REACH.jab + 40) { it.act = 'feint'; const k = this.chooseAttack(Math.max(0, pd - 30), null) || 'jab'; this.followUp = { at: now + rand(.12, .24), act: k === 'heavy' ? 'degage' : k }; return; } // provoquer une garde prématurée
    if (pd > REACH.jab - 8 && !roll(L.longP)) return; // de loin, la fente n'est qu'une option parmi d'autres : souvent, on attend
    if (pd > REACH.fente - 8) { if (pd <= REACH.fente + 75 && roll(L.dashIn)) { it.dash = 1; this.followUp = { at: now + .13, act: pd - 82 <= REACH.jab - 8 ? 'jab' : 'fente' }; } return; }
    const lunger = (this.kinds || []).filter(k => k === 'fente' || k === 'heavy').length >= 2;
    if (lunger && pd <= REACH.fente + 10 && roll(.6 + L.adapt * .4)) { const line = 'ext'; this.plan = { type: 'guard', line, pend: line, at: now, lineAt: now, until: now + rand(.5, 1), wary: true }; return; } // il fend souvent : l'attendre en garde
    const k = this.chooseAttack(pd, S); if (k) it.act = k;
  }
}
