
// =============================== entraînement ===============================
const INIT_STEPS = ['1/5 · Touchez Attaque : une estocade. Elle part vite et revient vite en garde.', '2/5 · Il attaque : maintenez Garde quand sa pointe rougeoie.', '3/5 · Levez la garde au dernier instant : parade parfaite, puis Attaque (devenue Riposte).', '4/5 · Appuyez sur Esquive quand sa pointe rougeoie : sa lame passe à côté.', '5/5 · Double → pour un pas rapide qui entre dans sa mesure, puis touchez-le.'];
const EXERCISES = {
  initiation: { name: 'Initiation', desc: 'Cinq gestes en une minute : estocade, garde, parade et riposte, esquive, pas rapide.', goal: 5 },
  parade: { name: 'Parade parfaite', desc: 'Il porte des estocades à des rythmes changeants. Levez la garde juste avant la touche, puis appuyez sur Attaque (devenue Riposte) quand l\'anneau se referme sur le cercle doré.', goal: 5 },
  feinte: { name: 'Feinte et riposte', desc: 'Il mêle feintes et vraies estocades. Ne mordez pas à la feinte ; parez la vraie attaque et ripostez.', goal: 4 },
  lourde: { name: 'Contre la lourde', desc: 'Il prépare des fentes lourdes : une garde tenue sera brisée. Parez-les au dernier instant, ou reculez (double ←) et punissez.', goal: 3 },
  mesure: { name: 'Mesure', desc: 'Il avance et recule. Restez hors de sa portée et touchez-le en fente (→ + Attaque) quand il entre dans votre mesure.', goal: 3 },
  garde: { name: 'Briser la garde', desc: 'Il tient sa garde. Maintenez Attaque pour la fente lourde qui la brise, puis enchaînez une estocade.', goal: 4 },
  fer: { name: 'Le fer', desc: 'Il tient sa garde et cherche parfois votre lame. Battez sa lame (→ + Feinte) puis estocade aussitôt, ou prenez le fer (↓ + Feinte). Quand il prend votre fer, dérobez-vous (← + Attaque).', goal: 5 },
  esquive: { name: 'Esquive', desc: 'Il porte estocades, fentes et estocades basses. Appuyez sur Esquive juste avant la touche : sous la lame contre l\'estocade, volte contre la fente et la basse. Puis Attaque, devenue Riposte.', goal: 4 },
  punition: { name: 'Punition', desc: 'Il lance des fentes trop courtes. Laissez-les tomber dans le vide, puis touchez-le pendant sa récupération.', goal: 3 },
  libre: { name: 'Libre', desc: 'Le mannequin varie ses attaques et ses rythmes. Essayez tout.', goal: 0 },
};
const fmt = s => s.toFixed(2).replace('.', ',');
class Coach {
  constructor(me, foe, ex) { this.me = me; this.foe = foe; this.ex = ex; this.E = EXERCISES[ex]; this.reset(); }
  reset() {
    this.count = 0; this.hint = ''; this.hintT = -9; this.next = 1.6; this.gl = 'haute'; this.gT = 0; this.td = REACH.jab - 25; this.tdT = 0;
    this.lastKind = null; this.feintT = -9; this.closeT = 0; this.vulnUntil = -9; this.pending = null;
    this.me.slow = { parade: 1.15, feinte: 1.2, lourde: 1.1, mesure: 1.1, garde: 1, fer: 1.25, esquive: 1.3, initiation: 1.55, punition: 1.2, libre: 1.15 }[this.ex];
  }
  say(s) { this.hint = s; this.hintT = G.time; }
  tick() { this.count++; Snd.ding(); if (this.E.goal && this.count === this.E.goal) { G.banner = { text: 'Exercice réussi', sub: 'Continuez, ou choisissez un autre exercice dans le menu', t: 0, dur: 2.4 }; Snd.fanfare(true); } }
  keep(td) { const pd = this.me.dist(), d = this.me.dir; this.me.intent.dx = pd > td + 12 ? d : pd < td - 12 ? -d : 0; }
  attack(k) { if (!this.me.busy) { this.me.intent.act = k; this.lastKind = k; } }
  think(dt) {
    const me = this.me, it = me.intent, now = G.time, pd = me.dist(); this.next -= dt;
    if (this.pending && now >= this.pending.at) { if (!me.busy || me.state === 'feint') it.act = this.pending.act; this.pending = null; }
    it.guard = false;
    switch (this.ex) {
      case 'parade': this.keep(REACH.jab - 30); if (this.next <= 0) { this.next = pick([1.1, 1.5, 1.9, 2.5, .75]); this.attack('jab'); } break;
      case 'lourde': this.keep(REACH.heavy - 40); if (this.next <= 0) { this.next = rand(2.4, 3.2); this.attack('heavy'); } break;
      case 'feinte': this.keep(REACH.jab - 30); if (this.next <= 0) { this.next = rand(1.9, 2.6); const r = Math.random();
        if (r < .4) { this.attack('feint'); this.feintT = now; this.pending = { at: now + rand(.18, .3), act: pick(['jab', 'jab', 'degage']) }; } else if (r < .7) { this.attack('feint'); this.feintT = now; } else this.attack('jab'); } break;
      case 'mesure': {
        this.tdT -= dt; if (this.tdT <= 0) { this.tdT = rand(1.1, 1.9); this.td = this.td > REACH.fente - 10 ? REACH.fente - 45 : REACH.fente + 55; }
        this.keep(this.td);
        if (pd < REACH.jab - 6) { this.closeT += dt; if (this.closeT > .45) { this.closeT = 0; this.attack('jab'); } } else this.closeT = 0;
        break;
      }
      case 'garde': it.guard = true; it.dx = pd > REACH.jab ? me.dir : 0; break;
      case 'fer': this.keep(REACH.jab - 20); it.guard = !me.busy && this.next > .5; if (this.next <= 0) { this.next = rand(2.6, 3.6); this.attack(pick(['lie', 'lie', 'beat'])); } break;
      case 'initiation': { const st = this.count; if (st >= 5) { it.dx = 0; break; } if (st === 4) { this.keep(REACH.fente + 70); break; } this.keep(REACH.jab - 25); if (st >= 1 && this.next <= 0) { this.next = st === 3 ? 2.2 : 1.9; this.attack('jab'); } break; }
      case 'esquive': this.keep(REACH.jab - 25); if (this.next <= 0) { this.next = pick([1.4, 1.9, 2.4]); this.attack(pick(['jab', 'jab', 'fente', 'bassa'])); } break;
      case 'punition': this.keep(REACH.fente + 60); if (this.next <= 0 && pd > REACH.fente + 20) { this.next = rand(2.4, 3); this.attack('fente'); } break;
      default: this.keep(REACH.jab - 25); if (this.next <= 0) { this.next = rand(1.3, 2.5); const k = pick(['jab', 'jab', 'fente', 'bassa', 'degage', 'circ', 'heavy', 'compo', 'feint']); if (k === 'feint') { this.attack('feint'); this.pending = { at: now + .22, act: 'jab' }; } else this.attack(k); }
    }
  }
  onEvent(type, info) {
    const P = this.foe, D = this.me, ex = this.ex;
    if (ex === 'initiation') { const st = this.count, pa = info.a === P, pd = info.d === P, m = info.m || {};
      if (st === 0 && type === 'hit' && pa) { this.tick(); this.say('Touché ! Maintenant, défendez-vous.'); }
      else if (st === 1 && pd && (type === 'parry' || type === 'block')) { this.tick(); this.say(type === 'parry' ? 'Parade parfaite, déjà !' : 'Bloqué. Levez-la plus tard pour une parade parfaite.'); }
      else if (st === 2 && type === 'hit' && pa && m.kind === 'riposte') { this.tick(); this.say('Riposte ! La parade ouvre la porte.'); }
      else if (st === 2 && type === 'parry' && pd) this.say('Parade parfaite : Attaque est devenue Riposte, frappez !');
      else if (st === 3 && type === 'esquive' && pd) { this.tick(); this.say('Esquivé ! Attaque devient Riposte ici aussi.'); }
      else if (st === 3 && type === 'esqWhiff' && info.a === P) this.say('Trop tôt : attendez que la pointe rougeoie.');
      else if (st === 4 && type === 'hit' && pa && P.stats.dashF > 0) { this.tick(); this.say('Vous savez vous battre. Le reste s\'apprend en duel.'); store.set('ct2d.initDone', 1); setTimeout(() => { if (G.mode === 'training' && G.exercise === 'initiation') G.toMenu(); }, 3200); }
      return; }
    if (type === 'derob' && info.d === P) { this.say('Dérobement : sa lame ne trouve que le vide'); if (ex === 'fer') this.tick(); return; }
    if (type === 'derob' && info.a === P && ex === 'fer') { this.say(info.a.move && info.a.move.kind === 'beat' ? 'Il s\'est dérobé : ne battez pas une lame qui part' : 'Il s\'est dérobé à votre prise de fer'); return; }
    if (type === 'beatMiss' && info.a === P && ex === 'fer') { this.say(info.why === 'Battement dans le vide' ? 'Trop loin : le battement doit trouver la lame (portée d\'estocade)' : info.why === 'Trop tard' ? 'Trop tard : sa lame était déjà partie' : 'On ne bat pas deux fois de suite la même lame : variez'); return; }
    if (type === 'beat' && info.a === P && ex === 'fer') { this.say('Lame battue : estocade, tout de suite !'); return; }
    if (type === 'esquive' && info.d === P) { this.say(info.perfect ? 'Esquive au dernier instant : la riposte est à vous' : 'Esquivé : Attaque est devenue Riposte, frappez'); this.esqT = G.time; return; }
    if (type === 'esqWhiff' && info.a === P) { this.say('Esquive dans le vide : partez quand sa pointe rougeoie, pas avant'); return; }
    if (ex === 'esquive' && type === 'hit' && info.a === P && info.m && info.m.kind === 'riposte' && G.time - (this.esqT || -9) < 1) { this.tick(); this.say('Esquive puis riposte : touché'); return; }
    if (type === 'opposition' && info.d === P) { this.say('Opposition : votre prise de fer a dévié son attaque'); if (ex === 'fer') this.tick(); return; }
    if (info.d === P) { // le joueur défend
      const m = info.m;
      if (ex === 'fer' && type === 'hit' && m && m.kind === 'lie') { this.say('Prise de fer : votre garde tenue ne l\'arrête pas. Dérobez-vous (← + Attaque) ou reculez'); return; }
      if (type === 'parry') { this.say(`Parfait : garde levée ${Math.round(info.early * 1000)} ms avant la touche`); if (ex === 'parade' || ex === 'lourde') this.tick(); }
      else if (type === 'block') this.say(info.mashed ? `Garde relevée moins de ${fmt(CFG.mash)} s après la précédente : pas de parade parfaite` : info.early > .8 ? 'Garde tenue : elle bloque sans riposte. Levez-la juste avant la touche' : `Trop tôt de ${fmt(info.early - info.win)} s (fenêtre ${fmt(info.win)} s)`);
      else if (type === 'break') this.say(ex === 'lourde' ? 'Garde tenue brisée : contre la lourde, parez au dernier instant ou reculez' : 'Garde brisée par la fente lourde');
      else if (type === 'hit') {
        if (ex === 'mesure') this.say('Trop près : à portée d\'estocade, il vous touche. Reculez hors de sa mesure.');
        else if (ex === 'punition') this.say('Trop près : restez hors de portée et laissez sa fente tomber dans le vide.');
        else if (info.noGuard) this.say(D.lastFeint > G.time - .6 ? 'La feinte vous a fait relâcher : gardez le calme, parez la vraie attaque' : 'Pas de garde au moment de la touche');
      }
    } else if (info.d === D || info.a === P) { // le joueur attaque
      const m = info.m || (info.a && info.a.move);
      if (type === 'hit') {
        if (ex === 'feinte' && m.kind === 'riposte') this.tick();
        else if (ex === 'garde') this.tick();
        else if (ex === 'fer') { if (m.kind === 'lie') { this.tick(); this.say('Prise de fer : sa garde n\'a rien pu faire'); } else if (G.time - P.lastBeatOkT < .8) { this.tick(); this.say('Battement puis estocade : touché'); } else this.say('Touché, mais l\'exercice demande le fer : battement ou prise de fer'); }
        else if (ex === 'mesure') { if (m.kind === 'fente') { this.tick(); this.say('Touché en fente depuis la distance de menace'); } else this.say('Touché, mais l\'exercice demande la fente (→ + Attaque)'); }
        else if (ex === 'punition') { if (G.time <= this.vulnUntil) { this.tick(); this.say('Puni pendant sa récupération'); } else this.say('Touché, mais attendez qu\'il ait manqué sa fente'); }
      } else if (type === 'block') { if (ex === 'garde') this.say('Bloqué : une garde tenue arrête tout, sauf la fente lourde (maintenez Attaque)'); }
      else if (type === 'break') { if (ex === 'garde') this.say('Garde brisée : enchaînez tout de suite une estocade'); }
      else if (type === 'whiff' && info.a === P) { if (ex === 'mesure') this.say('Trop loin : attendez qu\'il entre dans votre mesure'); else if (ex === 'punition') this.say('Trop tôt ou trop loin : avancez pendant sa récupération'); }
    }
    if (type === 'whiff' && info.a === D && ex === 'lourde') { this.tick(); this.say('Esquivée : sa lourde tombe dans le vide, punissez-le'); }
    if (type === 'whiff' && info.a === D && ex === 'punition') { this.vulnUntil = G.time + D.move.rec + .1; this.say('Il a manqué : punissez maintenant (→ + Attaque ou double →)'); }
  }
  update() { // détecte une garde levée en réaction à une feinte
    if (this.ex === 'feinte' && this.feintT > 0 && this.foe.pressT >= this.feintT && this.foe.pressT < this.feintT + .3 && this.reacted !== this.feintT) { this.reacted = this.feintT; this.say('Vous avez mordu à la feinte : la vraie attaque arrive juste après'); }
  }
  drawPanel(g) {
    this.update();
    const x = W / 2, y = 96, w = 520; g.fillStyle = 'rgba(12,10,12,.62)'; g.fillRect(x - w / 2, y, w, 70); g.strokeStyle = 'rgba(216,178,94,.35)'; g.strokeRect(x - w / 2 + .5, y + .5, w - 1, 69);
    g.textAlign = 'left'; g.font = '20px "IM Fell English SC", Georgia, serif'; g.fillStyle = '#efe4c8'; g.fillText(this.E.name, x - w / 2 + 12, y + 24);
    g.textAlign = 'right'; g.font = '700 15px "Alegreya Sans", sans-serif'; g.fillStyle = this.E.goal && this.count >= this.E.goal ? '#a8dca0' : '#d8b25e';
    g.fillText(this.E.goal ? `${Math.min(this.count, this.E.goal)} / ${this.E.goal}${this.count > this.E.goal ? ` (+${this.count - this.E.goal})` : ''}` : `${this.count}`, x + w / 2 - 12, y + 24);
    g.textAlign = 'left'; g.font = '14px "Alegreya Sans", sans-serif';
    const fresh = G.time - this.hintT < 4;
    g.fillStyle = fresh ? '#f2e2b8' : '#a79c86';
    wrapText(g, fresh ? this.hint : this.ex === 'initiation' ? INIT_STEPS[Math.min(4, this.count)] : this.E.desc, x - w / 2 + 12, y + 44, w - 24, 17, 2);
  }
}
function wrapText(g, text, x, y, maxW, lh, maxLines) {
  const words = text.split(' '); let line = '', n = 0;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y + n * lh); line = w; if (++n >= maxLines) return; } else line = t; }
  if (line) g.fillText(line, x, y + n * lh);
}

// =============================== démonstration ===============================
// Chaque séquence est jouée au ralenti (×0,35) puis à vitesse réelle.
const once = (f, k, cond, fn) => { if (!f[k] && cond) { f[k] = true; fn(); } };
const Demo = {
  i: 0, pass: 0, t: 0, flags: {},
  steps: [
    { title: 'La garde', cmd: 'Garde (maintenir)', sub: () => 'Tenue, elle bloque toutes les attaques… sauf la fente lourde, qui la brise', d: 225, len: 2.6, setup(p) { p.intent.guard = true; },
      run(t, p, e, f) { p.intent.guard = true; once(f, 'a', t > .4, () => e.intent.act = 'jab'); once(f, 'b', t > 1.4, () => e.intent.act = 'bassa'); } },
    { title: 'Jeu de jambes', cmd: '→ / ← , double ← , double →', sub: () => 'Pas d\'approche (le pied avant d\'abord), pas de retraite (le pied arrière d\'abord), retraite rapide, puis entrée dans la mesure', d: 330, len: 3.4,
      run(t, p, e, f) { p.intent.dx = t > .2 && t < .9 ? 1 : t > 1.1 && t < 1.8 ? -1 : 0; once(f, 'a', t > 2, () => p.intent.dash = -1); once(f, 'b', t > 2.7, () => p.intent.dash = 1); } },
    { title: 'Garde brisée', cmd: 'Attaque maintenue, contre une garde tenue', sub: () => 'Le moulinet chasse la lame haute, le coup final rabat la garde : les genoux plient, l\'adversaire titube et se découvre', d: 280, len: 2.6, setup(p, e) { p.intent.guard = true; },
      run(t, p, e, f) { p.intent.guard = !f.b; e.intent.holdAtk = t > .3 && t < .65; once(f, 'a', t > .3, () => e.intent.act = 'p:jab'); once(f, 'b', p.state === 'broken', () => { }); } },
    { title: 'Estocade directe', cmd: 'Attaque', sub: () => 'Le bras s\'allonge avant le corps : rapide, récupération courte', d: 225, len: 1.8, run(t, p, e, f) { once(f, 'a', t > .35, () => p.intent.act = 'jab'); } },
    { title: 'Fente', cmd: '→ + Attaque', sub: () => 'La jambe avant part, la jambe arrière pousse : longue portée, retour en garde plus lent', d: 310, len: 2.2, run(t, p, e, f) { once(f, 'a', t > .35, () => p.intent.act = 'fente'); } },
    { title: 'Estocade basse', cmd: '↓ + Attaque', sub: () => 'La pointe descend vers la hanche et la jambe avant', d: 240, len: 2, run(t, p, e, f) { once(f, 'a', t > .4, () => p.intent.act = 'bassa'); } },
    { title: 'Dégagement', cmd: '← + Attaque', sub: () => 'La pointe plonge sous la lame adverse et remonte de l\'autre côté', d: 225, len: 2.1, run(t, p, e, f) { once(f, 'a', t > .4, () => p.intent.act = 'degage'); } },
    { title: 'Imbroccata', cmd: '↑ + Attaque', sub: () => 'La main monte, la pointe décrit une courbe haute et plonge vers le visage', d: 225, len: 2.2, run(t, p, e, f) { once(f, 'a', t > .4, () => p.intent.act = 'circ'); } },
    { title: 'Feinte, puis estocade', cmd: 'Feinte, puis Attaque', sub: () => 'La feinte fait réagir ; quand la garde retombe, l\'attaque part presque sans préparation', d: 225, len: 2.4,
      run(t, p, e, f) { once(f, 'a', t > .35, () => p.intent.act = 'feint'); e.intent.guard = t > .46 && t < .74; once(f, 'b', t > .66, () => p.intent.act = 'jab'); } },
    { title: 'Attaque composée', cmd: 'Attaque, puis Feinte aussitôt', sub: () => 'Menace une ligne, change de ligne sous la lame, puis conclut : plus difficile à parer', d: 225, len: 2.4,
      run(t, p, e, f) { once(f, 'a', t > .4, () => p.intent.act = 'jab'); once(f, 'b', t > .46, () => p.intent.act = 'feint'); } },
    { title: 'Fente lourde', cmd: 'Attaque maintenue', sub: () => 'Montée de lame, moulinet complet au-dessus de la tête qui chasse la ligne haute, puis le coup s\'abat avec la fente : brise la garde tenue… et laisse exposé s\'il manque', d: 285, len: 2.9, setup(p, e) { e.intent.guard = true; },
      run(t, p, e, f) { e.intent.guard = !f.b; p.intent.holdAtk = t > .4 && t < .75; once(f, 'a', t > .4, () => p.intent.act = 'p:jab'); once(f, 'b', e.state === 'broken', () => { }); if (f.b && e.state === 'broken' && !(p.state === 'attack' && p.move.kind === 'jab')) p.intent.act = 'jab'; } },
    { title: 'Parade parfaite et riposte', cmd: 'Garde au dernier instant, puis Riposte', sub: () => 'La lame adverse est chassée, le bouton Attaque devient Riposte : frappez quand l\'anneau épouse le cercle doré', d: 225, len: 2.6,
      run(t, p, e, f) { once(f, 'a', t > .4, () => e.intent.act = 'jab'); if (e.state === 'attack' && e.move.kind === 'jab' && e.t >= e.move.wu - .05) f.g = true; p.intent.guard = !!f.g && t < 2 && !f.r; if (p.ripOffer && G.time - p.ripOffer.t0 >= .17 && !f.r) { f.r = true; p.intent.guard = false; p.intent.rip = true; } } },
    { title: 'Esquive : sous la lame', cmd: 'Esquive, puis Attaque', sub: () => 'Le corps plonge, la main libre frôle le sol, l\'estocade passe au-dessus ; Attaque devient Riposte', d: 225, len: 2.6,
      run(t, p, e, f) { once(f, 'a', t > .4, () => e.intent.act = 'jab'); once(f, 'b', e.state === 'attack' && e.move.kind === 'jab' && e.t >= e.move.wu - .1, () => p.intent.esq = true); once(f, 'c', p.ripOffer && G.time - p.ripOffer.t0 >= .15, () => p.intent.rip = true); } },
    { title: 'Esquive : volte', cmd: 'Esquive contre la fente', sub: () => 'Pivot sur le pied arrière, le buste s\'efface : la fente passe devant la poitrine', d: 300, len: 2.8,
      run(t, p, e, f) { once(f, 'a', t > .4, () => e.intent.act = 'fente'); once(f, 'b', e.state === 'attack' && e.move.kind === 'fente' && e.t >= e.move.wu - .1, () => p.intent.esq = true); once(f, 'c', p.ripOffer && G.time - p.ripOffer.t0 >= .15, () => p.intent.rip = true); } },
    { title: 'Battement, puis estocade', cmd: '→ + Feinte, puis Attaque', sub: () => 'Un coup sec du fort sur la lame adverse la chasse, même en garde : l\'estocade passe dans l\'ouverture', d: 225, len: 2.4, setup(p, e) { e.intent.guard = true; },
      run(t, p, e, f) { e.intent.guard = true; once(f, 'a', t > .4, () => p.intent.act = 'beat'); once(f, 'b', p.state === 'attack' && p.move.kind === 'beat' && p.move.beatOk, () => p.intent.act = 'jab'); } },
    { title: 'Prise de fer', cmd: '↓ + Feinte', sub: () => 'La lame domine celle de l\'adversaire et glisse le long jusqu\'au corps : la garde tenue n\'y peut rien', d: 225, len: 2.4, setup(p, e) { e.intent.guard = true; },
      run(t, p, e, f) { e.intent.guard = true; once(f, 'a', t > .4, () => p.intent.act = 'lie'); } },
    { title: 'Dérobement', cmd: '← + Attaque, contre le fer', sub: () => 'Il cherche votre lame : la pointe passe dessous, sa prise ne trouve rien et vous touchez', d: 225, len: 2.6,
      run(t, p, e, f) { once(f, 'a', t > .4, () => e.intent.act = 'lie'); once(f, 'b', e.state === 'attack' && e.move.kind === 'lie' && e.t > .06, () => p.intent.act = 'degage'); } },
    { title: 'Retraite et punition', cmd: 'Double ←, puis → + Attaque', sub: () => 'Sortir de la mesure juste avant la fente adverse, puis revenir frapper pendant sa récupération', d: 290, len: 3,
      run(t, p, e, f) { once(f, 'a', t > .4, () => e.intent.act = 'fente'); once(f, 'b', e.state === 'attack' && e.t > .06, () => p.intent.dash = -1); once(f, 'c', e.state === 'attack' && e.move.whiffed, () => p.intent.act = 'fente'); } },
  ],
  start() { Snd.init(); G.state = 'demo'; G.mode = 'demo'; G.e.look = LOOKS.duelliste; G.venue = 'salle'; this.i = 0; this.begin(0); G.show(null); },
  begin(pass) {
    this.pass = pass; this.t = 0; this.flags = {}; const s = this.steps[this.i];
    G.p.reset(300); G.e.reset(300 + s.d); G.p.reset(300); G.side = 1; G.p.slow = 1; G.e.slow = 1; G.clearIntent(G.p); G.clearIntent(G.e); G.sparks = []; G.texts = []; G.rings = [];
    if (s.setup) { s.setup(G.p, G.e); for (const f of [G.p, G.e]) if (f.intent.guard) { f.prevG = true; f.state = 'guard'; f.guarding = true; } }
  },
  speed() { return this.pass === 0 ? .35 : 1; },
  step(dt) { this.t += dt; const s = this.steps[this.i]; s.run(this.t, G.p, G.e, this.flags); if (this.t > s.len) { if (this.pass === 0) this.begin(1); else this.next(); } },
  next() { this.i++; if (this.i >= this.steps.length) return this.stop(); this.begin(0); },
  stop() { G.toMenu(); },
  onEvent() { },
  draw(g) {
    const s = this.steps[this.i], x = W / 2;
    g.fillStyle = 'rgba(12,10,12,.66)'; g.fillRect(x - 330, 22, 660, 92); g.strokeStyle = 'rgba(216,178,94,.35)'; g.strokeRect(x - 329.5, 22.5, 659, 91);
    g.textAlign = 'center'; g.font = '30px "IM Fell English SC", Georgia, serif'; g.fillStyle = '#f6ead0'; g.fillText(s.title, x, 56);
    g.font = '700 14px "Alegreya Sans", sans-serif'; g.fillStyle = '#d8b25e'; g.fillText(`${s.cmd ? s.cmd + '  ·  ' : ''}${this.pass === 0 ? 'ralenti ×0,35' : 'vitesse réelle'}  ·  ${this.i + 1}/${this.steps.length}`, x, 78);
    g.font = '15px "Alegreya Sans", sans-serif'; g.fillStyle = '#d9cfb8'; g.fillText(s.sub(this.t), x, 100);
  },
};
