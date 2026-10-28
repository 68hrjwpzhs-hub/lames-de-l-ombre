// =============================== 2.0 · sprint 21 : votre école d'escrime ===============================
// On ouvre une salle, on recrute des élèves (trois candidats par jour), on leur donne des leçons et on leur transmet son traité
// (les planches maîtrisées du manuscrit). Ils se battent ensuite à votre place dans la Nuit de Paris : vous regardez, ou vous passez.
const ECOLE_NAMES = ['Jehan Ravel', 'Perrine Aubry', 'Gilles Montagu', 'Clémence Fauré', 'Thibault Lorrain', 'Aymeric Delaunay', 'Margot Sénéchal', 'Hector Brunel', 'Agathe Morel', 'Florent Gisors', 'Léonie Varenne', 'Baptiste Corneille', 'Isabeau Thénard', 'Matthias Kessel', 'Roseline Ducros', 'Quentin Lespinasse'];
const ECOLE_TALENTS = {
  vif: { name: 'Vif', desc: 'prépare ses attaques plus vite', tw: { slow: -.12 } },
  parade: { name: 'Bonne main', desc: 'pare plus juste', tw: { perfect: .12, react: -.02 } },
  force: { name: 'Bras de fer', desc: 'aime la fente lourde et le fer', tw: { fer: .12 }, w: { heavy: 1.2 } },
  ruse: { name: 'Rusé', desc: 'feinte et attire dans le vide', tw: { feint: .15, bait: .12 } },
};
const ECOLE_COST = { open: 150, recruit: 40, lesson: 10 }, ECOLE_MAX = 4, LESSONS_PER_DAY = 2;
// planches du manuscrit → ce que l'élève en retient
const TRAITE = { jab: { w: { jab: 1 } }, fente: { w: { fente: 1 } }, bassa: { w: { bassa: 1 } }, circ: { w: { circ: 1 } }, degage: { w: { degage: 1 } }, heavy: { w: { heavy: .6 } },
  feint: { tw: { feint: .1 } }, beat: { tw: { fer: .08 } }, lie: { tw: { fer: .08 } }, legare: { tw: { fer: .05 } }, parry: { tw: { perfect: .08 } }, riposte: { tw: { perfect: .04 } },
  stop: { tw: { stopHit: .1 } }, sotto: { tw: { esq: .05 } }, volte: { tw: { esq: .05 } }, reprise: { tw: { retreatAfter: .1 } } };

const Ecole = {
  cur: null,
  data() { const d = Save.data; d.ecole = d.ecole || { open: false, rep: 0, eleves: [], hired: {} }; d.ecole.hired = d.ecole.hired || {}; return d.ecole; },
  today() { return Defi.dayKey(); },
  // trois candidats par jour (les mêmes toute la journée)
  candidates(day = this.today()) {
    const R = Defi.rng('ldo-ecole-' + day), pk = a => a[Math.floor(R() * a.length)], out = [];
    for (let i = 0; i < 3; i++) {
      const name = pk(ECOLE_NAMES), f = R() < .4, talent = pk(Object.keys(ECOLE_TALENTS)), lvl = 1 + Math.floor(R() * 3);
      const coat = pk(['#6a2a2a', '#2a4a6a', '#4a5a2a', '#5a3a6a', '#7a5a2a', '#2a2a2a']), look = mk('duelliste', Object.assign({ coat, coat2: shade(coat, -.4), hose: shade(coat, -.5), plume: pk(['#e8e4dc', '#c8202a', '#e8c46a', null]), beard: f ? 'none' : pk(['none', 'moustache', 'pointed']), hair: pk(['#2a1a10', '#6a4a2a', '#c8a060', '#1a1410']) }, f ? { style: 'dame', body: 'f', hairStyle: 'chignon' } : {}));
      out.push({ id: day + '-' + i, name, talent, lvl, xp: 0, look, offhand: pk([null, null, 'dague', 'cape', 'rondache']) });
    }
    return out;
  },
  open() { const D = this.data(); if (D.open) return true; if ((Save.data.ecus || 0) < ECOLE_COST.open) return false; Save.data.ecus -= ECOLE_COST.open; D.open = true; Save.persist(); return true; },
  recruit(c) {
    const D = this.data(); if (!D.open || D.eleves.length >= ECOLE_MAX || D.hired[c.id] || (Save.data.ecus || 0) < ECOLE_COST.recruit) return false;
    Save.data.ecus -= ECOLE_COST.recruit; D.hired[c.id] = 1; D.eleves.push(Object.assign({}, c, { w: 0, l: 0, stage: 0, taught: [], lessons: { day: null, n: 0 }, hurt: null })); Save.persist(); return true;
  },
  dismiss(id) { const D = this.data(); D.eleves = D.eleves.filter(e => e.id !== id); Save.persist(); },
  lessonsLeft(e) { return e.lessons.day === this.today() ? LESSONS_PER_DAY - e.lessons.n : LESSONS_PER_DAY; },
  // leçon : un tiers de niveau (niveau 10 au plus)
  lesson(e) {
    if (this.lessonsLeft(e) <= 0 || e.lvl >= 10 || (Save.data.ecus || 0) < ECOLE_COST.lesson) return false;
    Save.data.ecus -= ECOLE_COST.lesson; if (e.lessons.day !== this.today()) e.lessons = { day: this.today(), n: 0 }; e.lessons.n++;
    e.xp += 34; if (e.xp >= 100) { e.xp -= 100; e.lvl = Math.min(10, e.lvl + 1); } Save.persist(); return true;
  },
  // le traité : les planches maîtrisées du manuscrit passent à l'élève
  traite() { return MAN_TECH.filter(t => Manuscrit.mastered(t.id)).map(t => t.id); },
  transmit(e) { const T = this.traite(), add = T.filter(id => !e.taught.includes(id)); if (!add.length) return 0; e.taught.push(...add); this.data().rep += add.length; Save.persist(); return add.length; },
  level(e) { return e.lvl >= 8 ? 'maitre' : e.lvl >= 4 ? 'duelliste' : 'debutant'; },
  // réglages de l'IA de l'élève : niveau, talent, traité transmis
  tweak(e) {
    const tw = {}, w = {}, add = (o, src) => { for (const k in src) o[k] = (o[k] || 0) + src[k]; };
    const T = ECOLE_TALENTS[e.talent]; if (T) { add(tw, T.tw || {}); add(w, T.w || {}); }
    for (const id of e.taught) { const t = TRAITE[id]; if (t) { add(tw, t.tw || {}); add(w, t.w || {}); } }
    return { tw, w };
  },
  makeAI(e, me, foe) {
    const ai = new AI(me, foe, this.level(e)), L = ai.L, { tw, w } = this.tweak(e);
    L.w = Object.assign({}, L.w); for (const k in w) L.w[k] = (L.w[k] || 0) + w[k];
    for (const k in tw) { if (k === 'slow') L.slow = Math.max(1, (L.slow || 1.5) + tw.slow); else L[k] = clamp((L[k] || 0) + tw[k], 0, 1); }
    L.slow = Math.max(1, (L.slow || 1.5) - (e.lvl - 1) * .02); // chaque niveau affûte un peu le geste
    return ai;
  },
  foeFor(e) { const tier = RUN_TIERS[Math.min(e.stage, RUN_TIERS.length - 1)]; const R = Defi.rng('ldo-foe-' + e.id + '-' + e.stage + '-' + (e.w + e.l)); return { f: tier.foes[Math.floor(R() * tier.foes.length)], venue: tier.venues[Math.floor(R() * tier.venues.length)], boss: !!tier.boss }; },
  canFight(e) { return e.hurt !== this.today(); },
  // duel délégué : l'élève tient la place du joueur, piloté par son IA ; on regarde (ou on passe)
  fight(e) {
    if (!this.canFight(e)) return false; const { f, venue } = this.foeFor(e);
    this.cur = { e }; G.level = f.level;
    G.startMatch({ ecole: e.id, wins: 2, venue, opp: { name: f.name, level: f.level, tweak: f.tweak, arch: f.arch, sig: f.sig, rapier: f.rapier, look: f.look() } });
    const p = G.p; p.look = Object.assign({}, e.look, { name: e.name }); p.rapier = RAPIERS[e.lvl >= 6 ? 'tolede' : 'garnison'] || RAPIERS.garnison; p.slow = 1; p.offhand = e.offhand || null; p.arch = null;
    this.cur.ai = this.makeAI(e, G.p, G.e); document.body.classList.add('ecole-watch'); $('ecoleBar').hidden = false; $('ecoleBarName').textContent = `${e.name} (niv. ${e.lvl}) contre ${f.name}`;
    return true;
  },
  skip() { if (!this.cur) return; const sil = G.silent; G.silent = true; for (let i = 0; i < 600 * 120 && this.cur && G.matchOpts && G.matchOpts.ecole; i++) { G.hitStop = 0; G.slowT = 0; G.step(1 / 120); if (G.state === 'round' && G.banner) G.banner.t = 99; } G.silent = sil; },
  // fin d'un duel délégué
  end(won) {
    const C = this.cur; if (!C) return; const e = this.data().eleves.find(x => x.id === C.e.id) || C.e, D = this.data(); this.cur = null;
    let txt; if (won) { const gain = 30 + 20 * e.stage; e.w++; Save.data.ecus = (Save.data.ecus || 0) + gain; D.rep += 2 + e.stage; e.xp += 20; if (e.xp >= 100) { e.xp -= 100; e.lvl = Math.min(10, e.lvl + 1); } const fin = e.stage >= RUN_TIERS.length - 1; if (!fin) e.stage++; txt = `${e.name} l'emporte : +${gain} écus pour l'école, réputation ${D.rep}.${fin ? ' Votre élève a vaincu toute la Nuit de Paris !' : ''}`; }
    else { e.l++; e.hurt = this.today(); D.rep = Math.max(0, D.rep - 1); txt = `${e.name} est battu${e.look.body === 'f' ? 'e' : ''} : repos jusqu'à demain. Une leçon de plus, et ce sera pour la prochaine fois.`; }
    Save.persist(); document.body.classList.remove('ecole-watch'); $('ecoleBar').hidden = true;
    G.state = 'over'; Music.play(won ? 'victoire' : 'defaite');
    $('verdict').textContent = won ? 'Victoire de l\'élève' : 'Défaite de l\'élève'; $('overEye').textContent = `Votre école · ${G.e.look.name} · ${G.wins[0]} – ${G.wins[1]}`; $('overReward').textContent = txt;
    $('overStats').textContent = ''; $('overBilan').innerHTML = ''; $('overGrade').textContent = ''; $('again').textContent = 'Retour à l\'école'; G.overAction = 'ecole';
    G.show('over'); this.lastTxt = txt; return txt;
  },
  // ---- écran ----
  build() {
    if ($('ecole')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'ecole'; s.hidden = true;
    s.innerHTML = '<div class="card"><div class="eyebrow">Salle d\'armes</div><h2>Votre école d\'escrime</h2><p class="keys" id="ecoleHead"></p><div id="ecoleOpen"></div><h3>Vos élèves</h3><div id="ecoleList" class="ec-list"></div><h3>Candidats du jour</h3><div id="ecoleCands" class="ec-list"></div><p class="keys" id="ecoleTraite"></p><div class="row"><button class="btn ghost" id="ecoleBack">Retour</button></div></div>';
    document.body.appendChild(s);
    const bar = document.createElement('div'); bar.id = 'ecoleBar'; bar.hidden = true; bar.innerHTML = '<span id="ecoleBarName"></span><button class="btn small" id="ecoleSkip">Passer : voir le résultat</button>'; document.body.appendChild(bar);
    const st = document.createElement('style'); st.textContent = '.ec-list{display:flex;flex-direction:column;gap:6px}.ec-card{border:1px solid rgba(216,178,94,.35);border-radius:10px;padding:8px 10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}.ec-card b{color:var(--parch)}.ec-card .ec-info{flex:1 1 220px;font-size:13px;color:var(--muted)}.ec-card .ec-info span{display:block}.ec-bar{height:4px;background:rgba(216,178,94,.2);border-radius:2px;margin-top:3px}.ec-bar i{display:block;height:100%;background:#d8b25e;border-radius:2px}#ecoleBar{position:fixed;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:40;display:flex;gap:10px;align-items:center;background:#120e0ccc;border:1px solid #d8b25e;border-radius:10px;padding:6px 10px;font:600 13px Georgia,serif;color:#f6ead0}body.ecole-watch #touch{display:none!important}';
    document.head.appendChild(st);
    $('ecoleBack').addEventListener('click', () => G.show('menu')); $('ecoleSkip').addEventListener('click', () => this.skip());
  },
  show() { this.build(); this.render(); G.show('ecole'); },
  render() {
    if (!$('ecole')) return; const D = this.data(), ecus = Save.data.ecus || 0;
    $('ecoleHead').textContent = D.open ? `Réputation ${D.rep} · ${D.eleves.length}/${ECOLE_MAX} élèves · bourse ${ecus} écus` : `Ouvrir une salle coûte ${ECOLE_COST.open} écus. Bourse : ${ecus} écus.`;
    const op = $('ecoleOpen'); op.innerHTML = ''; if (!D.open) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'ecoleOpenBtn'; b.textContent = `Ouvrir l'école (${ECOLE_COST.open} écus)`; b.disabled = ecus < ECOLE_COST.open; b.addEventListener('click', () => { this.open(); this.render(); }); op.appendChild(b); }
    const list = $('ecoleList'); list.innerHTML = '';
    if (!D.eleves.length) list.innerHTML = `<span class="keys">${D.open ? 'Aucun élève : recrutez parmi les candidats du jour.' : 'L\'école est fermée.'}</span>`;
    for (const e of D.eleves) {
      const card = document.createElement('div'); card.className = 'ec-card'; const { f } = this.foeFor(e), left = this.lessonsLeft(e), T = ECOLE_TALENTS[e.talent];
      card.innerHTML = `<div class="ec-info"><b>${e.name}</b> · niveau ${e.lvl} (${{ debutant: 'débutant', duelliste: 'duelliste', maitre: 'maître' }[this.level(e)]}) · ${T.name}${e.offhand ? ' · ' + OFFHANDS[e.offhand].short.toLowerCase() : ''}<span>${e.w} victoire${e.w > 1 ? 's' : ''}, ${e.l} défaite${e.l > 1 ? 's' : ''} · Nuit de Paris : duel ${Math.min(e.stage, RUN_TIERS.length - 1) + 1}/${RUN_TIERS.length} contre ${f.name}${this.canFight(e) ? '' : ' · au repos jusqu\'à demain'}</span><span>Traité : ${e.taught.length} planche${e.taught.length > 1 ? 's' : ''}</span><div class="ec-bar"><i style="width:${e.lvl >= 10 ? 100 : e.xp}%"></i></div></div>`;
      const mkb = (t, fn, dis, cls = 'opt small') => { const b = document.createElement('button'); b.className = cls; b.textContent = t; b.disabled = !!dis; b.addEventListener('click', () => { fn(); this.render(); }); card.appendChild(b); return b; };
      mkb(`Leçon (${ECOLE_COST.lesson} écus, ${left} aujourd'hui)`, () => this.lesson(e), left <= 0 || e.lvl >= 10 || ecus < ECOLE_COST.lesson).dataset.act = 'lesson';
      mkb('Transmettre le traité', () => { const n = this.transmit(e); toastMsg(n ? `${n} planche${n > 1 ? 's' : ''} transmise${n > 1 ? 's' : ''} à ${e.name}.` : 'Rien de nouveau à transmettre : maîtrisez d\'autres planches du manuscrit.'); }, false).dataset.act = 'traite';
      mkb('Envoyer en duel', () => this.fight(e), !this.canFight(e), 'btn small').dataset.act = 'fight';
      list.appendChild(card);
    }
    const cb = $('ecoleCands'); cb.innerHTML = '';
    for (const c of this.candidates()) { const T = ECOLE_TALENTS[c.talent], hired = D.hired[c.id]; const card = document.createElement('div'); card.className = 'ec-card';
      card.innerHTML = `<div class="ec-info"><b>${c.name}</b> · niveau ${c.lvl} · ${T.name} : ${T.desc}${c.offhand ? ' · ' + OFFHANDS[c.offhand].short.toLowerCase() : ''}</div>`;
      const b = document.createElement('button'); b.className = 'opt small'; b.dataset.act = 'recruit'; b.textContent = hired ? 'Recruté' : `Recruter (${ECOLE_COST.recruit} écus)`; b.disabled = hired || !D.open || D.eleves.length >= ECOLE_MAX || ecus < ECOLE_COST.recruit; b.addEventListener('click', () => { this.recruit(c); this.render(); }); card.appendChild(b); cb.appendChild(card); }
    const T = this.traite(); $('ecoleTraite').textContent = T.length ? `Votre traité compte ${T.length} planche${T.length > 1 ? 's' : ''} maîtrisée${T.length > 1 ? 's' : ''} : transmettez-les, vos élèves les joueront en duel.` : 'Votre traité est vide : maîtrisez des planches du manuscrit du duelliste (en duel), puis transmettez-les.';
  },
  init() {
    this.build();
    // l'élève tient la place du joueur : son IA le pilote, pas l'écran tactile
    const ap = Input.apply; Input.apply = function (f, dt) { if (Ecole.cur && G.matchOpts && G.matchOpts.ecole && f === G.p) return Ecole.cur.ai.think(dt); return ap.apply(this, arguments); };
    // pas de qualités de héros pour l'élève
    const ch = curHero; curHero = function () { if (Ecole.cur && G.matchOpts && G.matchOpts.ecole) return { name: Ecole.cur.e.name, resist: 1, speed: 1, dmg: 1, dash: 1, parry: 0, passive: ['', ''], rapier: Object.assign({}, RAPIERS.garnison), look: Object.assign({}, Ecole.cur.e.look) }; return ch.apply(this, arguments); };
    const ar = G.afterRound; G.afterRound = function () {
      if (!(this.matchOpts && this.matchOpts.ecole && Ecole.cur)) return ar.apply(this, arguments);
      const i = this.roundWinner.isPlayer ? 0 : 1; this.wins[i]++;
      if (this.wins[i] >= (this.winsNeeded || 2)) return Ecole.end(i === 0);
      this.round++; this.startRound(); };
    $('again').addEventListener('click', e => { if (G.overAction === 'ecole') { e.stopImmediatePropagation(); G.toMenu(); applyAvatar(); Ecole.show(); } }, true);
    $('overMenu').addEventListener('click', () => { if (G.overAction === 'ecole') { G.overAction = null; applyAvatar(); } });
    const tm = G.toMenu; G.toMenu = function () { if (Ecole.cur) { Ecole.cur = null; document.body.classList.remove('ecole-watch'); $('ecoleBar').hidden = true; } return tm.apply(this, arguments); };
    // bouton dans la Salle d'armes
    const P = V2.panel('salle'), row = P && P.querySelector('.row'); if (row && !$('goEcole')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'goEcole'; b.textContent = 'Mon école'; b.addEventListener('click', () => this.show()); row.prepend(b); }
  },
};
