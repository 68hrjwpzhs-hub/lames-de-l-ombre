// =============================== 4.0 · Paris : la carte, les missions, la réputation, les déguisements, les poursuites ===============================

// ---------- réputation : honneur, crainte, faveur du Cardinal (0 à 100) ----------
const Rep = {
  data() { const d = Save.data; d.rep = d.rep || { honneur: 20, crainte: 10, faveur: 15 }; return d.rep; },
  add(o) { const R = this.data(); for (const k in o) R[k] = clamp((R[k] || 0) + o[k], 0, 100); Save.persist(); if (typeof Ach !== 'undefined') { if (R.honneur >= 80) Ach.hit('honneur'); if (R.crainte >= 80) Ach.hit('crainte'); if (R.faveur >= 80) Ach.hit('faveur'); } },
  title() { const R = this.data(); return R.honneur >= 70 ? 'Lame d\'honneur' : R.crainte >= 70 ? 'Bretteur redouté' : R.faveur >= 70 ? 'Homme du Cardinal' : R.honneur + R.crainte + R.faveur > 120 ? 'Lame connue dans Paris' : 'Lame inconnue'; },
  // effets en combat : la crainte trouble l'adversaire au début du duel ; l'honneur rend les joutes plus faciles (voir carte) ; la faveur rapporte
  init() {
    const st = G.step; G.step = function (dt) { const was = this.state; const r = st.apply(this, arguments); if (was === 'round' && this.state === 'fight' && this.mode !== 'story' && this.mode !== 'training' && !(this.matchOpts && this.matchOpts.ecole)) { const c = Rep.data().crainte; if (c >= 50) { this.e.breath = Math.min(this.e.breath, 1 - (c - 40) / 200); } } return r; };
    // fins de duel : honneur (épargner, saluer), crainte (finales, mêlées), selon le résultat
    const ar = G.afterRound; G.afterRound = function () { const r = ar.apply(this, arguments); if (this.state === 'over' && this.mode !== 'story' && !(this.matchOpts && this.matchOpts.ecole)) { const won = this.wins[0] > this.wins[1]; if (won) Rep.add({ crainte: this.matchOpts && this.matchOpts.melee ? 4 : 1, honneur: (Panache.earned[0] || 0) > 40 ? 1 : 0 }); } return r; };
  },
};

// ---------- les quartiers ----------
const QUARTIERS = {
  marais: { name: 'Le Marais', x: .72, y: .32, venues: ['salle', 'loggia'], desc: 'Hôtels de la noblesse et salles d\'armes. La place Royale n\'est pas loin.' },
  cite: { name: 'L\'île de la Cité', x: .57, y: .64, venues: ['eglise', 'loggia'], desc: 'Notre-Dame, le Palais, et des toits où l\'on court la nuit.' },
  pontneuf: { name: 'Le Pont-Neuf', x: .3, y: .58, venues: ['nuit'], desc: 'Marchands le jour, tire-laine la nuit.' },
  louvre: { name: 'Le Louvre et le Palais-Cardinal', x: .32, y: .32, venues: ['cloitre'], desc: 'Le pouvoir, ses gardes et ses antichambres.' },
  stgermain: { name: 'Saint-Germain', x: .3, y: .7, venues: ['auberge', 'salle'], desc: 'La foire, les auberges et les étudiants querelleurs.' },
  stantoine: { name: 'Le faubourg Saint-Antoine', x: .86, y: .5, venues: ['auberge', 'bastion'], desc: 'La Bastille, les artisans, les routes vers l\'Est.' },
};
const MISSION_TYPES = {
  duel: { name: 'Duel d\'honneur', icon: '⚔', rep: { honneur: 3 } },
  melee: { name: 'Un contre trois', icon: '⚔⚔', rep: { crainte: 4 } },
  poursuite: { name: 'Poursuite sur les toits', icon: '↟', rep: { honneur: 2, faveur: 1 } },
  infiltration: { name: 'Infiltration', icon: '◐', rep: { faveur: 3 } },
  cardinal: { name: 'Pour Son Éminence', icon: '✠', rep: { faveur: 5, honneur: -1 } },
};
const DISGUISES = {
  moine: { name: 'Habit de capucin', look: { style: 'moine', coat: '#5a4632', coat2: '#4a3a28', hose: '#4a3a28', hatType: 'aucun', plume: null, cape: null } },
  garde: { name: 'Casaque de garde', look: { coat: '#8a1a1e', coat2: '#5a0e12', trim: '#d8b25e', cape: '#5a0e12', plume: '#e8e4da', hatType: 'feutre' } },
  laquais: { name: 'Livrée de laquais', look: { coat: '#2a4a6a', coat2: '#16283a', trim: '#c8c0b0', cape: null, plume: null, hatType: 'beret' } },
};
const MISSION_FOES = ['Un spadassin du Marais', 'Un bretteur gascon', 'Un garde du Cardinal', 'Un mousquetaire du roi', 'Un étudiant querelleur', 'Un capitaine sans emploi', 'Une lame de la reine mère'];
const RUMEURS = {
  marais: ['On dit qu\'une salle d\'armes de la rue des Tournelles prend des élèves la nuit.', 'Un marquis cherche un témoin pour un duel, et paie bien.', 'Les dames de la place Royale parient sur les bretteurs.'],
  cite: ['On a vu des écailles luire sous le Petit-Pont.', 'Un chanoine se plaint qu\'on court sur les toits de Notre-Dame.', 'Les archers du guet doublent les rondes près du Palais.'],
  pontneuf: ['Un tire-laine dérobe les bourses à la statue du roi Henri.', 'Les bateleurs du Pont-Neuf cachent des lames sous leurs tréteaux.', 'On se bat à la lanterne, passé minuit.'],
  louvre: ['Son Éminence cherche des lames discrètes.', 'Un garde du Cardinal a perdu sa casaque aux dés.', 'Les mousquetaires et les gardes rouges se toisent à la relève.'],
  stgermain: ['La foire Saint-Germain attire les escrocs de tout le royaume.', 'Un étudiant défie quiconque porte une plume rouge.', 'À l\'auberge de la Croix-Blanche, on vend des lettres volées.'],
  stantoine: ['Un courrier pour l\'Est passe chaque soir à la barrière.', 'Les menuisiers du faubourg ont des cousins dans le guet.', 'On murmure qu\'un prisonnier de la Bastille s\'est évadé.'],
};

const Carte = {
  day() { return Defi.dayKey(); },
  data() { const d = Save.data; d.carte = d.carte || { done: {}, total: 0 }; return d.carte; },
  // trois missions par quartier et par jour (les mêmes toute la journée), une rumeur
  missions(q, day = this.day()) {
    const R = Defi.rng('ldo-carte-' + q + '-' + day), pk = a => a[Math.floor(R() * a.length)], Q = QUARTIERS[q], out = [], types = Object.keys(MISSION_TYPES);
    for (let i = 0; i < 3; i++) {
      let type = pk(types); if (type === 'poursuite' && !Q.venues.includes('loggia') && q !== 'cite' && q !== 'marais') type = 'duel';
      const level = pk(['duelliste', 'duelliste', 'maitre']), foe = pk(MISSION_FOES), venue = pk(Q.venues), dis = type === 'infiltration' ? pk(Object.keys(DISGUISES)) : null;
      out.push({ id: `${day}-${q}-${i}`, q, type, level, foe, venue, need: dis, ecus: { duel: 60, melee: 110, poursuite: 80, infiltration: 90, cardinal: 100 }[type] + (level === 'maitre' ? 40 : 0) });
    }
    return out;
  },
  rumeur(q, day = this.day()) { const R = Defi.rng('ldo-rumeur-' + q + '-' + day); const L = RUMEURS[q]; return L[Math.floor(R() * L.length)]; },
  guet(q) { const c = Rep.data().crainte; return (q === 'cite' || q === 'pontneuf' || q === 'louvre') && c >= 40; }, // un bretteur redouté attire les patrouilles
  foeOpp(m) { const L = LOOKS[m.level] || LOOKS.duelliste; const R = Defi.rng(m.id); const hue = ['#5a1a2a', '#1a3a5a', '#3a4a1a', '#4a2a5a', '#2a2a2a', '#6a3a1a'][Math.floor(R() * 6)];
    return { name: m.foe, level: m.level, rapier: LEVEL_RAPIER[m.level], look: Object.assign({}, L, { coat: m.type === 'cardinal' ? '#2a3a7a' : hue }), offhand: [null, 'dague', 'cape', 'rondache'][Math.floor(R() * 4)] }; },
  // lancer une mission
  play(m, disguise) {
    this.cur = { m, disguise }; const opp = this.foeOpp(m), base = { mode: 'duel', venue: m.venue, mission: m.id, wins: m.type === 'duel' ? 2 : 1 };
    if (m.type === 'melee' || (this.guet(m.q) && m.type !== 'poursuite')) { const n = m.type === 'melee' ? 3 : 2, foes = [opp, ...Melee.gardes(n).slice(0, n - 1)]; return Melee.start(foes, base); }
    if (m.type === 'poursuite') return Chase.start(m, () => G.startMatch(Object.assign({}, base, { opp: Object.assign({}, opp, { name: 'Le fuyard' }), chaseWon: true, noJoute: true })), () => this.end(false));
    G.startMatch(Object.assign({}, base, { opp }));
  },
  // déguisement : le bon habit, et l'adversaire est surpris ; le mauvais, et il est sur ses gardes
  applyDisguise() {
    const C = this.cur; if (!C || !C.m || C.m.type !== 'infiltration' || !C.disguise) return; const ok = C.disguise === C.m.need;
    G.p.look = Object.assign({}, G.p.look, DISGUISES[C.disguise].look);
    if (ok) { G.e.setState('hit', 1.1); G.e.hp = Math.max(1, G.e.hp - 15); G.say('Il ne vous a pas reconnu !', [G.e.x, GROUND - 260], '#ffd76a', 20); if (typeof Ach !== 'undefined') Ach.hit('deguise'); }
    else { G.e.breath = 1; G.say('Le déguisement ne trompe personne…', [G.p.x, GROUND - 260], '#f0a48c', 18); }
  },
  end(won) {
    const C = this.cur; if (!C) return null; const m = C.m, D = this.data(); this.cur = null; let txt = '';
    if (won) { if (!D.done[m.id]) { D.done[m.id] = 1; D.total++; const fav = Rep.data().faveur >= 60 ? 1.2 : 1; const gain = Math.round(m.ecus * fav); Save.data.ecus = (Save.data.ecus || 0) + gain; Rep.add(MISSION_TYPES[m.type].rep); txt = `Mission accomplie : +${gain} écus. ${Object.entries(MISSION_TYPES[m.type].rep).map(([k, v]) => (v > 0 ? '+' : '') + v + ' ' + k).join(', ')}.`; if (typeof Ach !== 'undefined') { Ach.hit('mission'); if (D.total >= 10) Ach.hit('mission10'); } } else txt = 'Mission déjà accomplie aujourd\'hui.'; }
    else { Rep.add({ honneur: -1 }); txt = 'Mission manquée. Le quartier en parlera.'; }
    Save.persist(); return txt;
  },
  // ---- écran ----
  build() {
    if ($('carte')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'carte'; s.hidden = true;
    s.innerHTML = '<div class="card cr-card"><div class="eyebrow">Paris, 1633</div><h2>La carte de Paris</h2><p class="keys" id="crRep"></p><div class="cr-map"><canvas id="crMap" width="900" height="480"></canvas><div id="crPins"></div></div><div id="crQ"></div><h3>La taverne : engager un allié</h3><div id="crAllies" class="row"></div><div class="row"><button class="btn ghost" id="crBack">Retour</button></div></div>';
    document.body.appendChild(s);
    const st = document.createElement('style'); st.textContent = '.cr-card{width:min(940px,96vw)}.cr-map{position:relative;width:100%;aspect-ratio:900/480}.cr-map canvas{width:100%;height:100%;border:1px solid rgba(216,178,94,.5);border-radius:4px}.cr-pin{position:absolute;transform:translate(-50%,-50%);min-height:32px;padding:3px 8px;font-size:12px!important;border:1px solid var(--gold);background:rgba(20,14,10,.82);color:#f4ead2;font:700 13px var(--body);border-radius:16px;cursor:pointer;white-space:nowrap}.cr-pin[aria-pressed=true]{background:rgba(216,178,94,.5);color:#1a1008}.cr-pin.guet::after{content:" · guet";color:#f0a48c}.cr-mis{display:flex;flex-wrap:wrap;gap:6px;align-items:center;border:1px solid rgba(216,178,94,.3);border-radius:8px;padding:6px 10px;margin-top:6px}.cr-mis b{color:var(--parch)}.cr-mis .i{flex:1 1 260px;font-size:13px;color:var(--muted)}.cr-mis.done{opacity:.55}.cr-rum{font-style:italic;color:#e8d8b0;font-size:14px;margin-top:6px}';
    document.head.appendChild(st); $('crBack').addEventListener('click', () => G.show('menu'));
  },
  drawMap() {
    const c = $('crMap'), g = c.getContext('2d'), w = c.width, h = c.height, R = rng(1615);
    g.fillStyle = '#e8d8b0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${R() < .5 ? '120,90,50' : '255,250,230'},${.04 + R() * .06})`; g.fillRect(R() * w, R() * h, 2 + R() * 6, 1 + R() * 3); }
    // l'enceinte, la Seine et ses îles
    g.strokeStyle = 'rgba(90,60,30,.55)'; g.lineWidth = 6; g.setLineDash([10, 6]); g.beginPath(); g.ellipse(w * .55, h * .5, w * .44, h * .42, 0, 0, 7); g.stroke(); g.setLineDash([]);
    g.strokeStyle = '#6a8aa8'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, h * .44); g.bezierCurveTo(w * .25, h * .5, w * .45, h * .62, w * .62, h * .5); g.bezierCurveTo(w * .78, h * .4, w * .9, h * .58, w + 10, h * .62); g.stroke();
    g.fillStyle = '#e8d8b0'; g.beginPath(); g.ellipse(w * .5, h * .54, 46, 14, -.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(w * .6, h * .5, 24, 9, -.4, 0, 7); g.fill();
    g.strokeStyle = '#7a5a3a'; g.lineWidth = 5; g.beginPath(); g.moveTo(w * .38, h * .45); g.lineTo(w * .4, h * .58); g.stroke(); // Pont-Neuf
    // pâtés de maisons
    for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h; if (Math.hypot((x - w * .55) / (w * .44), (y - h * .5) / (h * .42)) > 1) continue; if (Math.abs(y - (h * .5 + Math.sin(x / w * 6) * 20)) < 22) continue; g.fillStyle = `rgba(150,110,70,${.25 + R() * .25})`; g.fillRect(x, y, 8 + R() * 16, 6 + R() * 10); }
    g.fillStyle = '#5a3a20'; g.font = 'italic 22px Georgia, serif'; g.textAlign = 'left'; g.fillText('Lutèce · Paris', 18, 34); g.font = 'italic 13px Georgia, serif'; g.fillText('la Seine', w * .14, h * .42);
    g.strokeStyle = '#5a3a20'; g.lineWidth = 1.5; g.beginPath(); g.arc(w - 50, h - 50, 26, 0, 7); g.stroke(); g.font = 'bold 14px Georgia, serif'; g.textAlign = 'center'; g.fillText('N', w - 50, h - 82); g.beginPath(); g.moveTo(w - 50, h - 74); g.lineTo(w - 44, h - 50); g.lineTo(w - 50, h - 26); g.lineTo(w - 56, h - 50); g.closePath(); g.fillStyle = 'rgba(90,60,30,.6)'; g.fill();
  },
  open(q) { this.build(); this.drawMap(); this.sel = q || this.sel || 'marais'; this.render(); G.show('carte'); },
  render() {
    const R = Rep.data(); $('crRep').textContent = `${Rep.title()} · honneur ${R.honneur} · crainte ${R.crainte} · faveur du Cardinal ${R.faveur} · ${Save.data.ecus || 0} écus`;
    const pins = $('crPins'); pins.innerHTML = '';
    for (const q in QUARTIERS) { const Q = QUARTIERS[q], b = document.createElement('button'); b.className = 'cr-pin' + (this.guet(q) ? ' guet' : ''); b.style.left = Q.x * 100 + '%'; b.style.top = Q.y * 100 + '%'; b.textContent = Q.name; b.setAttribute('aria-pressed', q === this.sel); b.dataset.q = q; b.addEventListener('click', () => { this.sel = q; this.render(); }); pins.appendChild(b); }
    const q = this.sel, Q = QUARTIERS[q], box = $('crQ'), D = this.data(); box.innerHTML = `<h3>${Q.name}</h3><p class="keys">${Q.desc}</p><p class="cr-rum">Rumeur : « ${this.rumeur(q)} »</p>`;
    for (const m of this.missions(q)) {
      const T = MISSION_TYPES[m.type], done = D.done[m.id], div = document.createElement('div'); div.className = 'cr-mis' + (done ? ' done' : '');
      div.innerHTML = `<div class="i"><b>${T.icon} ${T.name}</b> contre ${m.foe} (${m.level === 'maitre' ? 'maître' : 'duelliste'}) · ${VENUES[m.venue].name} · ${m.ecus} écus${done ? ' · accomplie ✓' : ''}${m.type === 'infiltration' ? ' · déguisement requis' : ''}${this.guet(q) && m.type !== 'poursuite' ? ' · le guet patrouille (un adversaire de plus)' : ''}</div>`;
      if (m.type === 'infiltration') for (const k in DISGUISES) { const b = document.createElement('button'); b.className = 'opt small'; b.dataset.mission = m.id; b.dataset.dis = k; b.textContent = DISGUISES[k].name; b.addEventListener('click', () => { Snd.init(); this.play(m, k); }); div.appendChild(b); }
      else { const b = document.createElement('button'); b.className = 'btn small'; b.dataset.mission = m.id; b.textContent = 'Y aller'; b.addEventListener('click', () => { Snd.init(); this.play(m); }); div.appendChild(b); }
      box.appendChild(div);
    }
    const al = $('crAllies'); al.innerHTML = ''; const cur = Save.data.allie, own = Save.data.allies || [];
    for (const k in ALLIES) { const A = ALLIES[k], b = document.createElement('button'); b.className = 'opt small'; b.dataset.ally = k; const has = own.includes(k); b.setAttribute('aria-pressed', cur === k); b.innerHTML = `<b>${A.name}</b><span>${A.desc} ${has ? (cur === k ? '(à vos côtés)' : '(engagé)') : `· ${A.cost} écus`}</span>`; b.addEventListener('click', () => this.hire(k)); al.appendChild(b); }
  },
  hire(k) { const A = ALLIES[k], d = Save.data; d.allies = d.allies || []; if (!d.allies.includes(k)) { if ((d.ecus || 0) < A.cost) return toastMsg(`Il faut ${A.cost} écus pour engager ${A.name}.`); d.ecus -= A.cost; d.allies.push(k); } d.allie = d.allie === k ? null : k; Save.persist(); this.render(); },
  init() {
    this.build();
    // fin de mission : verdict et retour à la carte
    const ar = G.afterRound; G.afterRound = function () { const mis = Carte.cur && this.matchOpts && this.matchOpts.mission; const r = ar.apply(this, arguments); if (mis && this.state === 'over') { const won = this.wins[0] > this.wins[1], t = Carte.end(won); $('overReward').textContent = t + ' ' + $('overReward').textContent; $('again').textContent = 'Carte de Paris'; this.overAction = 'carte'; } return r; };
    $('again').addEventListener('click', e => { if (G.overAction === 'carte') { e.stopImmediatePropagation(); G.toMenu(); applyAvatar(); Carte.open(); } }, true);
    const st = G.step; G.step = function (dt) { const was = this.state; const r = st.apply(this, arguments); if (was === 'round' && this.state === 'fight' && Carte.cur && this.matchOpts && this.matchOpts.mission) { Carte.applyDisguise(); if (this.matchOpts.chaseWon) { this.e.breath = .3; this.e.hp = 80; this.say('Il est à bout de souffle !', [this.e.x, GROUND - 260], '#ffd76a', 20); } } return r; };
    const row = $('goStory') && $('goStory').parentElement; if (row && !$('goCarte')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'goCarte'; b.textContent = 'Carte de Paris'; b.addEventListener('click', () => { Snd.init(); this.open(); }); row.prepend(b); const m = document.createElement('button'); m.className = 'btn ghost'; m.id = 'goMelee'; m.textContent = 'Un contre trois'; m.addEventListener('click', () => { Snd.init(); G.level = 'duelliste'; Melee.start(Melee.gardes(3), { mode: 'duel' }); }); row.appendChild(m); }
  },
};

// ---------- poursuite sur les toits ----------
// Le fuyard court devant ; sautez les cheminées et les trous (Attaque, ↑ ou toucher l'écran), baissez-vous sous le linge (Garde ou ↓).
// Rattrapez-le avant la fin : le duel commence avec un fuyard essoufflé. Sinon, il s'échappe.
const Chase = {
  on: false,
  start(m, win, lose) {
    this.on = true; this.win = win; this.lose = lose; this.t = 0; this.dur = 24; this.gap = 360; this.speed = 300; this.scroll = 0; this.y = 0; this.vy = 0; this.duck = 0; this.trip = 0; this.hits = 0;
    const R = Defi.rng(m ? m.id : 'essai'); this.obs = []; let x = 700; while (x < this.speed * this.dur + 400) { const k = ['cheminee', 'trou', 'linge'][Math.floor(R() * 3)]; this.obs.push({ k, x }); x += 380 + R() * 320; }
    G.state = 'chase'; G.show(null); $('touch').hidden = !Input.touch; this.runner = new Fighter(true, LOOKS.player); this.runner.opp = G.e; this.runner.reset(260); this.runner.rapier = G.p.rapier;
    this.thief = new Fighter(false, mk('duelliste', { style: 'rodeur', coat: '#3a2a2a', coat2: '#1e1414', hatType: 'capuche', hat: '#1e1414', plume: null, cape: '#1e1414', name: 'Le fuyard' })); this.thief.opp = this.runner; this.thief.reset(600); this.thief.dir = 1;
    Music.play && Music.play('combat'); G.banner = { text: 'Poursuite !', sub: 'Sautez : Attaque ou ↑ · Baissez-vous : Garde ou ↓', t: 0, dur: 2 };
  },
  input() {
    const k = Input.keys, jump = Input.pressed.attack || Input.pressed.feint || Input.pressed.esq || k.has('ArrowUp') || k.has('KeyW') || k.has('KeyZ'), duck = Input.btn.guard || k.has('ArrowDown') || k.has('KeyS') || k.has('KeyL') || k.has('Space');
    Input.pressed.attack = Input.pressed.feint = Input.pressed.esq = false; if (typeof Controls !== 'undefined') Controls.pollPad(); return { jump, duck };
  },
  step(dt) {
    if (!this.on) return; if (G.banner) { G.banner.t += dt; if (G.banner.t > G.banner.dur) G.banner = null; }
    const I = this.input(); this.t += dt; const sp = this.trip > 0 ? this.speed * .6 : this.speed; this.trip = Math.max(0, this.trip - dt); this.scroll += sp * dt;
    this.gap -= (sp - this.speed * .9) * dt; // le fuyard court à 90 % de votre vitesse
    if (I.jump && this.y === 0) this.vy = 620; if (this.vy || this.y > 0) { this.vy -= 1700 * dt; this.y = Math.max(0, this.y + this.vy * dt); if (this.y === 0) this.vy = 0; }
    this.duck = I.duck && this.y === 0 ? Math.min(1, this.duck + dt * 8) : Math.max(0, this.duck - dt * 8);
    for (const o of this.obs) { const sx = o.x - this.scroll; if (o.done || sx > 300 || sx < 220) continue; o.done = true;
      const ok = o.k === 'linge' ? this.duck > .5 : this.y > 40; if (!ok) { this.trip = .6; this.hits++; this.gap += 40; Snd.hit(false); G.say(o.k === 'linge' ? 'Le linge vous fouette !' : o.k === 'trou' ? 'Vous manquez de tomber !' : 'Contre la cheminée !', [260, GROUND - 250], '#f0a48c', 18); } else Snd.swish(1); }
    for (const [f, phase] of [[this.runner, 0], [this.thief, 1.3]]) { const c = Math.sin((this.t * 9) + phase); f.pose = Object.assign({}, POSES.g_ext, { torso: 18, py: 82 + Math.abs(c) * 5 - (f === this.runner ? this.duck * 26 : 0), ff: 30 + c * 34, bf: -30 + c * 34, fl: Math.max(0, c) * 16, bl: Math.max(0, -c) * 16, a1: -60, a2: -20, a3: -40, b1: 200 + c * 30, b2: 160 }); f.J = f.joints(f.pose, false); f.feet = { f: { x: f.J.fl.foot[0], lift: 0 }, b: { x: f.J.bl.foot[0], lift: 0 } }; }
    if (this.gap <= 40) return this.finish(true); if (this.t >= this.dur || this.gap > 640) return this.finish(false);
  },
  finish(won) { this.on = false; G.state = 'menu'; G.banner = null; if (won) { if (typeof Ach !== 'undefined') { Ach.hit('poursuite'); if (!this.hits) Ach.hit('poursuite0'); } G.silent = false; this.win && this.win(); } else { G.show('over'); $('verdict').textContent = 'Il s\'échappe…'; $('overEye').textContent = 'Poursuite sur les toits'; $('overStats').textContent = ''; $('overBilan').innerHTML = ''; $('overGrade').textContent = ''; $('overReward').textContent = this.lose ? this.lose() || '' : ''; $('again').textContent = 'Carte de Paris'; G.overAction = 'carte'; } },
  render(g) {
    const bg = venueCanvas('loggia'), off = (this.scroll * .35) % W; g.save(); g.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    const tile = Math.floor(this.scroll * .35 / W); for (let k = 0; k < 2; k++) { const flip = (tile + k) % 2 === 1, x0 = k * W - off; g.save(); if (flip) { g.translate(x0 + W, 0); g.scale(-1, 1); g.drawImage(bg, 0, 0, W, H); } else g.drawImage(bg, x0, 0, W, H); g.restore(); } // copies en miroir : pas de couture
    // faîtage où l'on court
    g.fillStyle = '#3a2a2a'; g.fillRect(0, GROUND - 4, W, 10); g.fillStyle = '#2a1e1e'; g.fillRect(0, GROUND + 6, W, H - GROUND);
    for (const o of this.obs) { const sx = o.x - this.scroll; if (sx < -80 || sx > W + 80) continue;
      if (o.k === 'cheminee') { masonry(g, sx - 22, GROUND - 74, 44, 74, 11, 7, [140, 70, 50], rng(o.x | 0)); g.fillStyle = '#5a3a30'; g.fillRect(sx - 26, GROUND - 80, 52, 8); }
      if (o.k === 'trou') { g.fillStyle = '#0a0808'; g.fillRect(sx - 40, GROUND - 4, 80, H - GROUND + 4); g.fillStyle = 'rgba(255,170,80,.15)'; g.fillRect(sx - 30, GROUND + 30, 60, 30); }
      if (o.k === 'linge') { g.fillStyle = '#3a2a1e'; g.fillRect(sx - 64, GROUND - 156, 5, 156); g.fillRect(sx + 60, GROUND - 156, 5, 156); g.strokeStyle = '#3a3028'; g.lineWidth = 3; g.beginPath(); g.moveTo(sx - 60, GROUND - 150); g.quadraticCurveTo(sx, GROUND - 130, sx + 60, GROUND - 150); g.stroke(); for (const dx of [-36, -8, 20]) { g.fillStyle = ['#e8e0d0', '#c8b898', '#a8c0d8'][(dx + 36) / 28 | 0]; g.fillRect(sx + dx, GROUND - 142, 22, 34); } } }
    g.save(); g.translate(0, -this.y); drawFighter(g, this.runner); g.restore();
    this.thief.x = clamp(260 + this.gap, 330, W - 40); const T2 = this.thief; T2.dir = 1; T2.J = T2.joints(T2.pose, false); T2.feet = { f: { x: T2.J.fl.foot[0], lift: 0 }, b: { x: T2.J.bl.foot[0], lift: 0 } }; drawFighter(g, T2);
    // jauge de distance et temps
    const k = clamp(1 - (this.gap - 40) / 560, 0, 1); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(W / 2 - 160, 18, 320, 14); g.fillStyle = '#d8b25e'; g.fillRect(W / 2 - 160, 18, 320 * k, 14); g.strokeStyle = '#f4ead2'; g.strokeRect(W / 2 - 160, 18, 320, 14);
    g.font = '800 13px "Alegreya Sans", sans-serif'; g.textAlign = 'center'; g.fillStyle = '#f4ead2'; g.fillText(`Le fuyard · ${Math.max(0, Math.ceil(this.dur - this.t))} s`, W / 2, 48);
    if (G.banner) { g.font = '40px "IM Fell English SC", Georgia, serif'; g.fillStyle = '#f6ead0'; g.fillText(G.banner.text, W / 2, 140); g.font = '600 16px "Alegreya Sans", sans-serif'; g.fillText(G.banner.sub, W / 2, 170); }
    g.restore();
  },
  init() {
    const st = G.step; G.step = function (dt) { if (this.state === 'chase') return Chase.step(dt); return st.apply(this, arguments); };
    const rd = G.render; G.render = function (rdt) { if (this.state === 'chase') return Chase.render(this.g); return rd.apply(this, arguments); };
  },
};
