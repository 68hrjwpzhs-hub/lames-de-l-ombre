
// =============================== « Nuit de Paris » : une nuit, sept duels ===============================
// Une course d'une seule traite : sept duels en une manche chacun, la santé ne revient qu'en partie entre deux,
// et après chaque victoire on choisit un avantage parmi trois. Une défaite termine la nuit ; les écus gagnés restent.
const BOONS = {
  lynx: { name: 'Œil de lynx', desc: 'Fenêtre de parade parfaite +0,05 s.' },
  riposte: { name: 'Riposte sanglante', desc: 'Vos ripostes infligent +6.' },
  pied: { name: 'Pied léger', desc: 'Pas rapides plus longs (+30 %).' },
  vive: { name: 'Lame vive', desc: 'Toutes vos attaques partent 12 % plus vite.' },
  poigne: { name: 'Poigne de fer', desc: 'Toutes vos touches infligent +15 %.' },
  buffle: { name: 'Cuir de buffle', desc: 'Vous subissez 15 % de dégâts en moins.' },
  etourdir: { name: 'Battement étourdissant', desc: 'Une lame battue reste ouverte 0,15 s de plus.' },
  sangfroid: { name: 'Sang-froid', desc: 'Chaque parade parfaite rend 5 points de vie.' },
  botte: { name: 'Botte secrète', desc: 'Votre première touche de chaque duel inflige le double.' },
  panache: { name: 'Bourse du panache', desc: 'Écus de la nuit ×1,5.' },
  souffle: { name: 'Second souffle', desc: 'Soigne 40 points de vie tout de suite.', repeat: true },
};
// adversaires par palier (un tiré au sort par duel), lieux possibles
const RUN_TIERS = [
  { venues: ['loggia', 'nuit'], foes: [
    { name: 'Un tire-laine', level: 'debutant', tweak: { slow: 1.7 }, rapier: 'garnison', look: () => mk('debutant', { style: 'paysan', coat: '#c8b898', coat2: '#4a3a2a', hose: '#4a3a2a', hatType: 'aucun', beard: 'none' }) },
    { name: 'Un laquais querelleur', level: 'debutant', tweak: { slow: 1.6 }, rapier: 'garnison', look: () => mk('debutant', { coat: '#5a6a3a', coat2: '#3a4426' }) }] },
  { venues: ['nuit', 'loggia'], foes: [
    { name: 'Spadassin du Marais', level: 'debutant', tweak: { slow: 1.4, perfect: .2, lineRead: .5 }, rapier: 'tolede', look: () => mk('duelliste', { coat: '#3a2a3a', coat2: '#241824', plume: null, cape: '#141014' }) },
    { name: 'Bretteur gascon', level: 'debutant', tweak: { slow: 1.35, aggr: .7 }, rapier: 'garnison', look: () => mk('duelliste', { coat: '#7a4a1a', coat2: '#4a2a10', plume: '#e8e0c8' }) },
    { name: 'Drac des bas-fonds', level: 'debutant', arch: 'drac', tweak: { slow: 1.5 }, rapier: 'garnison', look: () => mk('debutant', { race: 'drac', skin: '#6f8a5a', hairStyle: 'chauve', beard: 'none', hatType: 'aucun', plume: null, style: 'paysan', coat: '#7a6a4a', coat2: '#3a3020', hose: '#3a3020' }) }] },
  { venues: ['salle', 'cloitre'], foes: [
    { name: 'Garde du Cardinal', level: 'duelliste', tweak: { slow: 1.7 }, rapier: 'tolede', look: () => mk('duelliste', { coat: '#8a1a1e', coat2: '#5a0e12', trim: '#e8e4da', plume: '#e8e4da', cape: '#5a0e12' }) },
    { name: 'Mousquetaire du roi', level: 'duelliste', tweak: { slow: 1.7 }, rapier: 'tolede', look: () => mk('duelliste', { coat: '#2a3a7a', coat2: '#1a2450', trim: '#e8e4da', plume: '#e8e4da', cape: '#1a2450' }) },
    { name: 'Diestro de Séville', level: 'duelliste', arch: 'destreza', tweak: { slow: 1.75 }, rapier: 'tolede', look: () => mk('duelliste', { coat: '#2a2420', coat2: '#14100e', trim: '#c8a050', plume: '#e8e4da', beard: 'pointed', cape: '#14100e' }) }] },
  { venues: ['cloitre', 'salle', 'nuit'], foes: [
    { name: 'Lieutenant des gardes', level: 'duelliste', tweak: { slow: 1.6, perfect: .45 }, rapier: 'solingen', look: () => mk('duelliste', { coat: '#8a1a1e', coat2: '#5a0e12', trim: '#d8b25e', plume: '#b2302a', beard: 'full' }) },
    { name: 'Dame à la lanterne', level: 'duelliste', tweak: { react: .19, perfect: .5 }, rapier: 'milanaise', look: () => mk('duelliste', { style: 'dame', body: 'f', coat: '#2a2a4a', coat2: '#14142a', hose: '#14142a', hairStyle: 'chignon', beard: 'none' }) }] },
  { venues: ['nuit', 'loggia'], foes: [
    { name: 'Spadassin espagnol', level: 'duelliste', arch: 'destreza', tweak: { react: .19, perfect: .5 }, rapier: 'tolede', look: () => mk('maitre', { coat: '#1a1a1a', coat2: '#0e0e0e', trim: '#c8a050', plume: '#b2302a', beard: 'pointed' }) },
    { name: 'Le Corbeau', level: 'maitre', tweak: { slow: 1.6 }, rapier: 'pappenheimer', look: () => mk('maitre', { style: 'rodeur', coat: '#2a2a2a', coat2: '#1a1c1a', hose: '#1a1c1a', hatType: 'capuche', hat: '#1a1a1a' }) },
    { name: 'Drac mercenaire', level: 'duelliste', arch: 'drac', tweak: { perfect: .4 }, rapier: 'solingen', look: () => mk('duelliste', { race: 'drac', skin: '#6f8a5a', hairStyle: 'chauve', beard: 'none', hatType: 'aucun', plume: null, style: 'rodeur', skin: '#5f7a52', coat: '#4a3a28', coat2: '#2a2218', hose: '#2a2218' }) }] },
  { venues: ['loggia', 'salle', 'cloitre'], foes: [
    { name: 'Maître italien', level: 'maitre', tweak: { slow: 1.45 }, rapier: 'venitienne', look: () => mk('maitre', { coat: '#3a1418', coat2: '#240c10', plume: '#c8c0b0' }) },
    { name: 'Capitaine des gardes', level: 'maitre', tweak: { slow: 1.45 }, rapier: 'pappenheimer', look: () => mk('maitre', { coat: '#8a1a1e', coat2: '#5a0e12', trim: '#d8b25e', plume: '#e8e4da', cape: '#5a0e12' }) },
    { name: 'Maître de la destreza', level: 'maitre', arch: 'destreza', tweak: { slow: 1.5 }, rapier: 'venitienne', look: () => mk('maitre', { coat: '#1a1a1a', coat2: '#0e0e0e', trim: '#c8a050', plume: '#b2302a', beard: 'full', hair: '#9a948a' }) }] },
  { venues: ['eglise'], boss: true, foes: [
    { name: 'Le Chevalier d\'Écaille', level: 'maitre', arch: 'drac', tweak: { slow: 1.18, perfect: .58, react: .17, fer: .32, derob: .7 }, rapier: 'ferrara', look: () => mk('maitre', { race: 'drac', skin: '#4f7a62', hairStyle: 'chauve', beard: 'none', hatType: 'aucun', plume: null, coat: '#1e3a2e', coat2: '#10241c', hose: '#10241c', boot: '#0e1612', trim: '#7ad0a0', cape: '#0e1a14', blade: '#d8ffe8' }) }] },
];
const RUN_FOE_HP = [55, 65, 75, 85, 90, 100, 100]; // les premières lames de la nuit tombent plus vite
const RUN_HEAL = 35, RUN_ECUS = [15, 20, 30, 40, 55, 70, 0], RUN_FINAL = 300;
// note de style d'un duel : S, A, B ou C
function duelGrade(s, hpLost, won) {
  const score = 40 + (s.perfect || 0) * 10 + (s.ripostes || 0) * 6 + (s.ripPerfect || 0) * 5 + (s.beatOk || 0) * 5 + (s.derob || 0) * 5 + (s.hits || 0) * 2 - (s.whiffs || 0) * 2 - hpLost * .5;
  const g = !won ? 'C' : score >= 95 ? 'S' : score >= 72 ? 'A' : score >= 52 ? 'B' : 'C';
  return { g, score: Math.round(score) };
}
const Run = {
  cur: null,
  has(id) { return !!(this.cur && G.mode === 'run' && this.cur.boons.includes(id)); },
  init() {
    $('goRun').addEventListener('click', () => { Snd.init(); Music.play('menu'); this.showIntro(); });
    $('runGo').addEventListener('click', () => this.go());
    $('runQuit').addEventListener('click', () => this.abandon());
  },
  best() { return Save.data.runBest || 0; },
  showIntro() {
    this.cur = null; this.render(); G.show('run');
  },
  start() {
    const tiers = RUN_TIERS.map(t => ({ foe: pick(t.foes), venue: pick(t.venues), boss: !!t.boss }));
    this.cur = { stage: 0, hp: 100, boons: [], ecus: 0, grades: [], tiers, offer: null, over: false };
    Save.data.runs = (Save.data.runs || 0) + 1; Save.persist();
  },
  go() {
    if (!this.cur || this.cur.over) { this.start(); }
    if (this.cur.offer) return; // un avantage doit d'abord être choisi
    const t = this.cur.tiers[this.cur.stage], f = t.foe;
    G.startMatch({ mode: 'run', venue: t.venue, opp: { name: f.name, level: f.level, tweak: f.tweak, arch: f.arch, rapier: f.rapier, look: f.look(), boss: t.boss ? (f.arch === 'drac' ? 'griffe' : f.arch === 'destreza' ? 'fer' : 'force') : null } });
  },
  abandon() { if (this.cur && !this.cur.over) this.finish(false, true); else { this.cur = null; G.toMenu(); } },
  // appelé par G.afterRound à la fin de chaque duel de la nuit
  onDuelEnd(won) {
    Manuscrit.onMatchEnd(won);
    const r = this.cur, p = G.p, hpLost = Math.max(0, r.hp - p.hp), gr = duelGrade(p.stats, hpLost, won); r.grades.push(gr.g);
    let gain = won ? RUN_ECUS[r.stage] : 0; if (won && gr.g === 'S') gain += 15; else if (won && gr.g === 'A') gain += 5; r.ecus += gain;
    G.lastGrade = gr;
    if (!won) return this.finish(false);
    r.hp = Math.min(100, Math.max(1, p.hp) + RUN_HEAL); r.stage++;
    if (r.stage >= RUN_TIERS.length) return this.finish(true);
    r.offer = this.offer(); this.lastGain = gain; G.state = 'over'; this.render(); G.show('run');
  },
  offer() {
    const own = this.cur.boons, ids = Object.keys(BOONS).filter(k => BOONS[k].repeat || !own.includes(k));
    const out = []; while (out.length < 3 && ids.length) { const i = Math.floor(Math.random() * ids.length); out.push(ids.splice(i, 1)[0]); }
    if (this.cur.hp < 50 && !out.includes('souffle')) out[2] = 'souffle'; // blessé : on propose de quoi se refaire
    return out;
  },
  choose(id) {
    const r = this.cur; if (!r || !r.offer) return;
    if (id === 'souffle') r.hp = Math.min(100, r.hp + 40); else r.boons.push(id);
    r.offer = null; Snd.ding(); this.render();
  },
  finish(won, quit) {
    const r = this.cur; r.over = true; r.won = won; const d = Save.data;
    let total = r.ecus + (won ? RUN_FINAL : 0); if (r.boons.includes('panache')) total = Math.round(total * 1.5);
    r.total = total; d.ecus += total; d.runBest = Math.max(d.runBest || 0, won ? RUN_TIERS.length : r.stage); if (won) d.runWins = (d.runWins || 0) + 1;
    Save.persist(); Career.refresh();
    G.state = 'over'; Snd.fanfare(won); Music.play(won ? 'victoire' : 'defaite'); this.render(); G.show('run');
    void quit;
  },
  // ---- écran de la nuit : progression, santé, avantages, choix ----
  render() {
    const r = this.cur, nodes = RUN_TIERS.length, best = this.best(), gradeCol = { S: '#ffd76a', A: '#a8dca0', B: '#9cc8ee', C: '#a79c86' };
    let h = '';
    if (!r) {
      $('runTitle').textContent = 'Nuit de Paris';
      h += `<p>Sept duels d'une seule traite, de la tombée du jour aux cloches de Notre-Dame. Une manche par duel ; entre deux, vous ne regagnez que ${RUN_HEAL} points de vie. Après chaque victoire, choisissez un avantage parmi trois. Une défaite met fin à la nuit, mais les écus gagnés restent acquis.</p>`;
      h += `<p class="keys">Meilleure nuit : ${best ? `${best} duel${best > 1 ? 's' : ''} sur ${nodes}` : 'aucune'}${Save.data.runWins ? ` · nuits complètes : ${Save.data.runWins}` : ''}</p>`;
      $('runGo').textContent = 'Commencer la nuit'; $('runGo').hidden = false; $('runQuit').textContent = 'Retour';
    } else {
      const stepsHtml = r.tiers.map((t, i) => `<div class="${i < r.stage ? 'done' : i === r.stage && !r.over ? 'now' : ''}" title="${i <= r.stage ? t.foe.name : ''}"><b>${i + 1}${t.boss ? ' ★' : ''}${r.grades[i] ? ` <span style="color:${gradeCol[r.grades[i]]};font-weight:800">${r.grades[i]}</span>` : ''}</b>${i < r.stage || i === r.stage ? t.foe.name : '?'}</div>`).join('');
      const steps = `<div class="bracket runSteps">${stepsHtml}</div>`; if (!r.offer) h += steps;
      h += `<div class="purse"><span>Vie</span><span class="bar" style="width:160px;display:inline-block;height:8px"><i style="width:${r.hp}%;background:linear-gradient(90deg,#8d2219,#d8473a)"></i></span><b>${Math.round(r.hp)}</b><span>· écus de la nuit : <b>${r.ecus}</b></span></div>`;
      if (r.boons.length) h += `<p class="keys">Avantages : ${r.boons.map(b => `<b>${BOONS[b].name}</b>`).join(' · ')}</p>`;
      if (r.over) {
        $('runTitle').textContent = r.won ? 'Aube victorieuse' : 'La nuit s\'achève';
        h += `<p class="reward">${r.won ? `Vous avez vaincu les sept lames de la nuit, Chevalier d'Écaille compris : +${RUN_FINAL} écus de prime.` : `Tombé au duel ${r.stage + 1} sur ${nodes}${r.stage >= best && r.stage ? ' : votre meilleure nuit' : ''}.`} Total rapporté : ${r.total} écus.</p>`;
        $('runGo').textContent = 'Nouvelle nuit'; $('runGo').hidden = false; $('runQuit').textContent = 'Menu';
      } else if (r.offer) {
        $('runTitle').textContent = 'Choisissez un avantage';
        const gr = G.lastGrade;
        h = `${gr && r.stage > 0 ? `<p class="reward">Duel remporté — note <b style="color:${gradeCol[gr.g]};font-size:22px">${gr.g}</b> · +${this.lastGain} écus · +${RUN_HEAL} points de vie</p>` : ''}<div class="list boons">${r.offer.map(id => `<button class="opt boon" data-b="${id}"><b>${BOONS[id].name}</b><span>${BOONS[id].desc}</span></button>`).join('')}</div>` + h + steps;
        $('runGo').hidden = true; $('runQuit').textContent = 'Abandonner';
      } else {
        const t = r.tiers[r.stage]; $('runTitle').textContent = t.boss ? 'Le dernier duel' : `Duel ${r.stage + 1} sur ${nodes}`;
        h += `<p>${t.boss ? 'Sous les voûtes de Notre-Dame, une silhouette aux reflets d\'écaille vous attend.' : `Prochain adversaire : <b>${t.foe.name}</b> · ${VENUES[t.venue].name}.`}</p>`;
        $('runGo').textContent = 'En garde'; $('runGo').hidden = false; $('runQuit').textContent = 'Abandonner';
      }
    }
    $('runBody').innerHTML = h;
    $('runBody').querySelectorAll('[data-b]').forEach(b => b.addEventListener('click', () => this.choose(b.dataset.b)));
  },
};
