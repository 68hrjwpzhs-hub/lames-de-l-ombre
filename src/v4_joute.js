// =============================== 4.0 · la joute verbale avant le duel ===============================
// Trois piques de l'adversaire, trois réponses à choisir : la bonne repartie retourne la pique contre lui.
// Gagnée, la joute le trouble (souffle entamé, panache pour vous) ; perdue, c'est vous qui partez troublé.
// Répliques originales. Chaque pique a sa repartie juste, une réponse plate et une maladresse.
const JOUTE = [
  { q: 'Votre lame tremble plus qu\'une feuille d\'automne.', good: 'C\'est qu\'elle a hâte de vous rencontrer.', flat: 'Il fait froid, ce matin.', bad: 'Elle tremble, c\'est vrai.' },
  { q: 'On m\'a dit que vous aviez appris l\'escrime dans un poulailler.', good: 'Et j\'y ai appris à plumer les coqs de votre espèce.', flat: 'Dans une salle d\'armes, plutôt.', bad: 'Qui vous a dit ça ?' },
  { q: 'Je vais vous découper comme un rôti du dimanche.', good: 'Encore faudrait-il que vous sachiez tenir le couteau.', flat: 'Nous sommes jeudi.', bad: 'Pas trop cuit, alors.' },
  { q: 'Votre chapeau est plus large que votre courage.', good: 'Il faut bien abriter tout ce courage de la pluie.', flat: 'C\'est la mode, à Paris.', bad: 'Mon chapeau vous plaît ?' },
  { q: 'Mes ancêtres ont combattu à Marignan.', good: 'Il serait temps qu\'un de la famille apprenne enfin.', flat: 'Les miens étaient boulangers.', bad: 'C\'était loin, Marignan.' },
  { q: 'Après ce duel, on vous enterrera sans nom.', good: 'Les miens n\'en ont jamais porté : c\'est notre force.', flat: 'Nous verrons bien.', bad: 'Sans nom, vraiment ?' },
  { q: 'J\'ai désarmé trois capitaines avant le déjeuner.', good: 'Vous les aviez donc pris au saut du lit.', flat: 'Bon appétit.', bad: 'Trois ? C\'est beaucoup.' },
  { q: 'Vous parez comme un sacristain ouvre la porte : lentement.', good: 'Et vous attaquez comme on sonne la cloche : on vous entend venir.', flat: 'Je fais de mon mieux.', bad: 'Les sacristains sont ponctuels.' },
  { q: 'Ma rapière a un nom. La vôtre, un prix.', good: 'Le vôtre est inscrit dessus : « soldée ».', flat: 'Elle s\'appelle comme elle veut.', bad: 'Elle m\'a coûté cher.' },
  { q: 'Je pourrais vous battre les yeux bandés.', good: 'Gardez le bandeau : vous ne verrez pas venir la fin.', flat: 'Essayez donc.', bad: 'Je préférerais que non.' },
  { q: 'Votre maître d\'armes devrait vous rendre ses gages.', good: 'Il l\'a fait : il m\'a envoyé m\'exercer sur vous.', flat: 'Il est mort l\'an passé.', bad: 'Je lui demanderai.' },
  { q: 'Les poètes chanteront ma victoire.', good: 'Les poètes chantent faux quand on les paie d\'avance.', flat: 'Je n\'aime pas la poésie.', bad: 'Lesquels ?' },
  { q: 'Votre garde est ouverte comme une taverne un jour de foire.', good: 'Entrez donc : on y sert la riposte à volonté.', flat: 'Je la fermerai tout à l\'heure.', bad: 'J\'aime les foires.' },
  { q: 'Vous sentez la peur, et le cheval.', good: 'Le cheval vous a porté bonheur jusqu\'ici : il s\'arrête là.', flat: 'Je suis venu à cheval.', bad: 'Vraiment ? La peur ?' },
  { q: 'On racontera que vous êtes tombé sans un cri.', good: 'On racontera surtout que vous avez beaucoup parlé.', flat: 'On racontera ce qu\'on voudra.', bad: 'Je crie rarement.' },
];
const Joute = {
  cur: null, cb: null,
  on() { return store.get('ct2d.joute', true) !== false; },
  // la joute se joue avant les duels libres, la Nuit de Paris, les tournois et les missions (pas en Histoire ni à l'entraînement)
  wanted(opts) { return this.on() && !G.silent && (!opts || (!opts.ecole && opts.mode !== 'story' && opts.mode !== 'training' && opts.mode !== 'run' && !opts.defi && !opts.noJoute)) && G.level !== 'training'; },
  pick(n = 3) { const a = JOUTE.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); },
  build() {
    if ($('joute')) return; const s = document.createElement('section'); s.className = 'screen'; s.id = 'joute'; s.hidden = true;
    s.innerHTML = '<div class="card"><div class="eyebrow" id="jouteEye">Joute verbale</div><h2 id="jouteFoe"></h2><p class="jq" id="jouteQ"></p><div class="row jopts" id="jouteOpts"></div><p class="keys" id="jouteScore"></p><div class="row"><button class="btn ghost" id="jouteSkip">Passer : en garde !</button></div></div>';
    document.body.appendChild(s); const st = document.createElement('style'); st.textContent = '.jq{font:italic 600 19px/1.4 Georgia,serif;color:#f4ead2;border-left:3px solid var(--gold);padding:6px 12px;background:rgba(216,178,94,.08)}.jopts{flex-direction:column}.jopts .opt{flex:0 0 auto;min-height:44px;text-align:left;font-size:15px}.jopts .opt.ok{border-color:#8fd08a;background:rgba(120,200,110,.18)}.jopts .opt.ko{border-color:#e0806a;background:rgba(220,110,90,.15)}'; document.head.appendChild(st);
    $('jouteSkip').addEventListener('click', () => this.finish(true));
  },
  start(foeName, cb) {
    this.build(); this.cur = { lines: this.pick(), k: 0, score: 0, foe: foeName }; this.cb = cb; $('jouteFoe').textContent = foeName; G.state = 'menu'; G.show('joute'); this.show();
  },
  show() {
    const C = this.cur, L = C.lines[C.k]; $('jouteEye').textContent = `Joute verbale · pique ${C.k + 1}/3`; $('jouteQ').textContent = '« ' + L.q + ' »'; $('jouteScore').textContent = C.score ? `Bonnes reparties : ${C.score}` : 'Choisissez la repartie qui retourne la pique.';
    const box = $('jouteOpts'); box.innerHTML = ''; const opts = [['good', L.good], ['flat', L.flat], ['bad', L.bad]].sort(() => Math.random() - .5);
    for (const [k, t] of opts) { const b = document.createElement('button'); b.className = 'opt'; b.dataset.k = k; b.textContent = t; b.addEventListener('click', () => this.answer(k, b)); box.appendChild(b); }
  },
  answer(k, b) {
    const C = this.cur; if (!C || C.locked) return; C.locked = true; if (k === 'good') { C.score++; Snd.ding(); } else Snd.tick();
    $('jouteOpts').querySelectorAll('button').forEach(x => { if (x.dataset.k === 'good') x.classList.add('ok'); else if (x === b) x.classList.add('ko'); });
    setTimeout(() => { C.locked = false; C.k++; if (C.k < 3) this.show(); else this.finish(false); }, G.silent ? 0 : 900);
  },
  finish(skip) {
    const C = this.cur || { score: -1 }, cb = this.cb; this.cur = null; this.cb = null; $('joute').hidden = true;
    const res = skip ? null : C.score >= 2 ? 'gagnee' : C.score === 0 ? 'perdue' : 'egale'; this.last = res; if (res === 'gagnee' && typeof Ach !== 'undefined') Ach.hit('joute'); if (res === 'gagnee' && C.score === 3 && typeof Ach !== 'undefined') Ach.hit('joute3');
    if (res && typeof Rep !== 'undefined') Rep.add(res === 'gagnee' ? { honneur: 1 } : {});
    if (cb) cb(res);
  },
  // effets au début du duel
  apply(res) {
    if (!res) return; const p = G.p, e = G.e;
    if (res === 'gagnee') { e.breath = Math.min(e.breath, .55); Panache.v[0] = Math.max(Panache.v[0], 30); G.say('Il a perdu ses moyens !', [e.x, GROUND - 260], '#ffd76a', 20); }
    if (res === 'perdue') { p.breath = Math.min(p.breath, .7); Panache.v[1] = Math.max(Panache.v[1], 30); G.say('Vous voilà troublé…', [p.x, GROUND - 260], '#f0a48c', 18); }
  },
  init() {
    // la joute s'intercale avant le duel ; ses effets s'appliquent au premier « Allez ! »
    const sm = G.startMatch; G.startMatch = function (opts = {}) {
      if (opts instanceof Event) opts = {}; const self = this, args = arguments;
      if (Joute.wanted(opts) && !opts._jouteDone) { const o = opts.opp, name = o ? o.name : (LOOKS[self.level] || {}).name || 'Votre adversaire'; Joute.start(name, res => { const o2 = Object.assign({}, opts, { _jouteDone: true }); sm.call(self, o2); Joute.pending = res; }); return; }
      return sm.apply(this, args); };
    const st = G.step; G.step = function (dt) { const was = this.state; const r = st.apply(this, arguments); if (was === 'round' && this.state === 'fight' && Joute.pending) { Joute.apply(Joute.pending); Joute.pending = null; } return r; };
    const P = V2.panel('options'), row = $('optGL') && $('optGL').parentElement; if (row && !$('optJoute')) { const b = document.createElement('button'); b.className = 'opt small'; b.id = 'optJoute'; b.textContent = 'Joute verbale avant le duel'; b.setAttribute('aria-pressed', this.on()); b.addEventListener('click', () => { store.set('ct2d.joute', !this.on()); b.setAttribute('aria-pressed', this.on()); }); row.appendChild(b); }
  },
};
