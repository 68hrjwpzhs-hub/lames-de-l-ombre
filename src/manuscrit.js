// =============================== sprint 13 : le manuscrit du duelliste (votre propre traité, qui s'écrit en jouant) ===============================
// Planches gravées des techniques maîtrisées (dessinées par le jeu lui-même, à la manière des traités de Capoferro et Thibault),
// pages des adversaires vaincus, signature du duelliste. Le carnet reste l'encyclopédie ; le manuscrit, c'est vous.
const MAN_TECH = [
  // id, titre, nom d'époque, seuil de maîtrise, pose du maître, pose de l'adversaire, ce qui compte, exercice lié, leçon
  { id: 'jab', t: 'L\'estocade', it: 'stoccata', need: 3, a: 'jabA', b: 'g_ext', d: 205, ex: 'libre', how: 'Le bras part avant le corps. Courte, vive, elle revient vite en garde : c\'est le coup le plus sûr.' },
  { id: 'fente', t: 'La fente', it: 'passata lunga', need: 3, a: 'fenteA', b: 'g_ext', d: 255, ex: 'mesure', how: 'La jambe avant part, l\'arrière pousse et reste tendue. Elle touche de loin, mais se paie si elle tombe dans le vide.' },
  { id: 'bassa', t: 'L\'estocade basse', it: 'stoccata bassa', need: 2, a: 'bassaA', b: 'g_haute', d: 215, ex: 'libre', how: 'La pointe descend vers la hanche et la jambe avant, sous une garde portée trop haut.' },
  { id: 'circ', t: 'L\'imbroccata', it: 'imbroccata', need: 2, a: 'cA', b: 'g_basse', d: 215, ex: 'libre', how: 'Main haute, la pointe plonge par-dessus la lame adverse. Plus lente, elle punit une garde basse.' },
  { id: 'degage', t: 'Le dégagement', it: 'cavazione', need: 2, a: 'dgA', b: 'g_ext', d: 210, ex: 'fer', how: 'La pointe passe sous la lame adverse et remonte de l\'autre côté, dans la ligne qu\'elle laisse ouverte.' },
  { id: 'heavy', t: 'Le coup de taille', it: 'mandritto', need: 2, a: 'tajoA', b: 'broken', d: 220, ex: 'garde', how: 'Moulinet au-dessus de la tête, puis la lame s\'abat : elle brise une garde tenue trop raide.' },
  { id: 'feint', t: 'La feinte', it: 'finta', need: 6, a: 'feintJab', b: 'g_ext', d: 215, ex: 'feinte', how: 'Menacer pour faire parer, puis frapper où la garde n\'est plus. Une feinte lente est un cadeau.' },
  { id: 'beat', t: 'Le battement', it: 'battuta', need: 3, a: 'beatA', b: 'beaten', d: 200, ex: 'fer', how: 'Un coup sec du fort sur la lame adverse : elle s\'écarte, l\'estocade suit aussitôt.' },
  { id: 'lie', t: 'La prise de fer', it: 'atajo', need: 2, a: 'lieA', b: 'beaten', d: 205, ex: 'fer', how: 'Dominer la lame et la conduire jusqu\'au corps : la garde tenue n\'y peut rien.' },
  { id: 'legare', t: 'Le liement', it: 'legare', need: 2, a: 'beatW', b: 'beatW', d: 190, ex: 'fer', how: 'Fer contre fer, sentir la pression et pousser au bon moment : le fer dominé laisse la ligne ouverte.' },
  { id: 'parry', t: 'La parade', it: 'parata', need: 5, a: 'g_ext', b: 'parried', d: 200, ex: 'parade', how: 'Lever la garde au dernier instant : la lame adverse est chassée d\'un grand geste.' },
  { id: 'riposte', t: 'La riposte', it: 'risposta', need: 3, a: 'rA', b: 'parried', d: 215, ex: 'parade', how: 'Frapper aussitôt après la parade, pendant que l\'adversaire est encore pris dans son geste.' },
  { id: 'stop', t: 'Le coup d\'arrêt', it: 'contratempo', need: 2, a: 'jabA', b: 'fenteC', d: 215, ex: 'mesure', how: 'Toucher pendant la préparation adverse : le contretemps punit ceux qui arment trop large.' },
  { id: 'sotto', t: 'La passe sous la lame', it: 'passata sotto', need: 2, a: 'esqSotto', b: 'jabA', d: 215, ex: 'esquive', how: 'Le corps plonge sous l\'estoc, la main libre au sol, la pointe remonte vers la poitrine.' },
  { id: 'volte', t: 'La volte', it: 'inquartata', need: 2, a: 'esqVolte', b: 'fenteA', d: 265, ex: 'esquive', how: 'Le pied arrière tourne et efface le corps : la fente passe devant la poitrine.' },
  { id: 'reprise', t: 'La reprise en arrière', it: 'ritirata', need: 2, a: 'fenteR', b: 'g_ext', d: 250, ex: 'mesure', how: 'Après la fente, se remettre en garde en reculant : on ne reste pas à portée de sa riposte.' },
];
const Manuscrit = {
  data() { const d = Save.data; if (!d.manus) d.manus = { tech: {}, foes: {}, duels: { w: 0, l: 0 } }; return d.manus; },
  live() { return !G.silent && G.state !== 'demo' && G.state !== 'menu' && (G.state === 'fight' || G.state === 'ko' || G.state === 'finish'); },
  count(id, n = 1) { if (!this.live()) return; const T = this.data().tech, e = T[id] || (T[id] = { n: 0, at: Date.now() }), M = MAN_TECH.find(x => x.id === id), was = M && e.n >= M.need; e.n += n; if (M && !was && e.n >= M.need) { e.master = Date.now(); Codex.toastQ.push({ e: { title: 'Manuscrit · planche : ' + M.t }, t0: 0 }); } Save.persist(); },
  mastered(id) { const M = MAN_TECH.find(x => x.id === id), e = this.data().tech[id]; return !!(M && e && e.n >= M.need); },
  init() {
    const ev0 = G.event.bind(G); G.event = (type, info) => { ev0(type, info); try { this.onEvent(type, info || {}); } catch (err) { } };
    const b = $('goManus'); if (b) b.addEventListener('click', () => { Snd.init(); this.show(); });
    const back = $('manusBack'); if (back) back.addEventListener('click', () => G.show('menu'));
  },
  onEvent(type, i) {
    const pa = i.a && i.a.isPlayer, pd = i.d && i.d.isPlayer, k = i.m && i.m.kind;
    if (type === 'hit' && pa) { if (['jab', 'fente', 'bassa', 'circ', 'degage', 'riposte'].includes(k)) this.count(k); if (k === 'lie') this.count('lie'); if (i.crit === 'Coup d\'arrêt') this.count('stop'); }
    if (type === 'parry' && pd) this.count('parry');
    if (type === 'break' && pa) this.count('heavy');
    if (type === 'beat' && pa) this.count('beat');
    if (type === 'derob' && pd) this.count('degage');
    if (type === 'dominate' && pa) this.count('legare');
    if (type === 'esquive' && pd) this.count(i.d.esq && i.d.esq.kind === 'volte' ? 'volte' : 'sotto');
  },
  step() {
    if (G.state !== 'fight') return; const p = G.p;
    if (p.state === 'feint' && p.feintId !== this.lastFeint) { this.lastFeint = p.feintId; this.count('feint'); }
    if (p.state === 'attack' && p.move && p.move.retreat && this.lastRetreat !== p.move.id) { this.lastRetreat = p.move.id; this.count('reprise'); }
  },
  // fin de match : la page de l'adversaire s'enrichit
  onMatchEnd(won) {
    if (G.silent || G.mode === 'training' || !G.e.look) return; const D = this.data(), name = G.e.look.name || 'Inconnu', F = D.foes[name] || (D.foes[name] = { w: 0, l: 0, taken: {}, look: null });
    if (won) { F.w++; D.duels.w++; } else { F.l++; D.duels.l++; }
    F.look = Object.assign({}, G.e.look); F.arch = G.e.arch || null; F.sig = G.e.sig || null; F.fav = G.favKind || F.fav || null; F.boss = G.matchOpts && G.matchOpts.opp && G.matchOpts.opp.boss || F.boss || null;
    const by = G.p.stats.takenBy || {}; for (const k in by) F.taken[k] = (F.taken[k] || 0) + by[k];
    D.parries = (D.parries || 0) + (G.p.stats.perfect || 0); D.faced = (D.faced || 0) + (G.e.stats.attacks || 0); Save.persist();
  },
  // surnom : il suit votre façon de vous battre
  nickname() {
    const T = this.data().tech, n = k => (T[k] && T[k].n) || 0, f = typeof curHero === 'function' && curHero().look && curHero().look.body === 'f';
    const S = [['parry', f ? 'la Patiente' : 'le Patient'], ['riposte', f ? 'la Riposte vive' : 'la Riposte vive'], ['sotto', f ? 'l\'Insaisissable' : 'l\'Insaisissable'], ['volte', f ? 'l\'Insaisissable' : 'l\'Insaisissable'], ['fente', 'la Longue Lame'], ['feint', f ? 'la Trompeuse' : 'le Trompeur'], ['legare', 'la Main de fer'], ['heavy', 'Brise-Garde'], ['stop', f ? 'l\'Horlogère' : 'l\'Horloger'], ['jab', 'la Lame vive']];
    let best = null, bn = 0; for (const [k, nm] of S) { const v = n(k) / (MAN_TECH.find(x => x.id === k) || { need: 1 }).need; if (v > bn) { bn = v; best = nm; } }
    return bn >= 1 ? best : f ? 'l\'Apprentie' : 'l\'Apprenti';
  },
  // ---- écran du manuscrit ----
  show() {
    const D = this.data(), list = $('manusList'); list.innerHTML = '';
    const h = typeof curHero === 'function' ? curHero() : null, mastered = MAN_TECH.filter(m => this.mastered(m.id)).length;
    const add = (label, cls) => { const e = document.createElement('div'); e.className = cls; e.textContent = label; list.appendChild(e); return e; };
    const btn = (label, sub, ok, fn) => { const b = document.createElement('button'); b.className = 'opt small mn' + (ok ? '' : ' locked'); b.innerHTML = `<b>${label}</b>${sub ? `<span>${sub}</span>` : ''}`; b.addEventListener('click', fn); list.appendChild(b); return b; };
    add('Signature', 'eyebrow'); btn(`${h ? h.name.split(',')[0] : 'Vous'}, ${this.nickname()}`, `${D.duels.w} victoires · ${D.duels.l} défaites · ${mastered}/${MAN_TECH.length} planches`, true, () => this.page('sig'));
    add('Planches des techniques', 'eyebrow');
    for (const m of MAN_TECH) { const e = D.tech[m.id], ok = this.mastered(m.id); btn(ok ? m.t : '— ' + m.t, ok ? m.it : `${e ? e.n : 0}/${m.need} réussites`, ok, () => this.page('tech', m)); }
    add('Adversaires', 'eyebrow'); const foes = Object.keys(D.foes); if (!foes.length) add('Aucun duel consigné pour l\'instant.', 'keys');
    for (const n of foes) { const F = D.foes[n]; btn(n, `${F.w} victoire${F.w > 1 ? 's' : ''} · ${F.l} défaite${F.l > 1 ? 's' : ''}`, true, () => this.page('foe', n)); }
    this.page('sig'); G.show('manus');
  },
  page(kind, arg) {
    const D = this.data(), t = $('manusTitle'), x = $('manusText'), go = $('manusTrain'); go.hidden = true; go.onclick = null;
    const cv = $('manusPlate'); cv.width = 640; cv.height = 400; const g = cv.getContext('2d');
    if (kind === 'sig') {
      const h = curHero(), tot = MAN_TECH.reduce((a, m) => a + ((D.tech[m.id] && D.tech[m.id].n) || 0), 0), top = MAN_TECH.slice().sort((a, b) => ((D.tech[b.id] || {}).n || 0) - ((D.tech[a.id] || {}).n || 0))[0];
      t.textContent = `${h.name.split(',')[0]}, ${this.nickname()}`;
      x.textContent = `Traité de l'escrime de ${h.name.split(',')[0]}, commencé à Paris en l'an 1633. ${D.duels.w} duels gagnés, ${D.duels.l} perdus. Parades parfaites : ${D.faced ? Math.round(100 * (D.parries || 0) / D.faced) : 0} % des attaques reçues. ${tot ? `Technique de prédilection : ${top.t.toLowerCase()} (${(D.tech[top.id] || {}).n || 0} fois).` : 'Aucune technique encore consignée : allez vous battre.'}`;
      this.plate(g, { a: 'salutUp', b: 'salutUp', d: 230, title: 'Frontispice', it: this.nickname(), heroLook: h.look });
      return;
    }
    if (kind === 'tech') {
      const m = arg, e = D.tech[m.id], ok = this.mastered(m.id);
      t.textContent = `${m.t} · ${m.it}`;
      x.textContent = ok ? `${m.how} Réussie ${e.n} fois${e.master ? ', maîtrisée le ' + new Date(e.master).toLocaleDateString('fr-FR') : ''}.` : `Planche à gagner : réussissez ${m.t.toLowerCase()} ${m.need} fois en duel (${e ? e.n : 0}/${m.need}). ${m.how}`;
      this.plate(g, Object.assign({ locked: !ok, title: 'Planche ' + (MAN_TECH.indexOf(m) + 1) }, m));
      go.hidden = false; go.textContent = 'S\'entraîner à ce geste'; go.onclick = () => { G.level = 'training'; G.exercise = m.ex; G.saveSettings && G.saveSettings(); G.startMatch(); };
      return;
    }
    if (kind === 'foe') {
      const F = D.foes[arg], fav = F.fav && MOVES[F.fav] ? MOVES[F.fav].name.toLowerCase() : null; let top = null; for (const k in F.taken) if (!top || F.taken[k] > F.taken[top]) top = k;
      const tell = F.sig === 'lanterne' ? 'Sa lanterne se lève avant une vraie attaque, reste basse pendant ses feintes.' : F.sig === 'horloger' ? 'Un tic-tac précède ses coups d\'arrêt.' : F.sig === 'ecaille' || F.arch === 'drac' ? 'Ses écailles luisent avant la griffe, qui brise la garde.' : F.arch === 'destreza' ? 'Bras tendu, il cherche votre fer et tourne autour de vous.' : fav ? `Un appel du pied avant son coup favori : ${fav}.` : 'Observez son appel du pied : il précède son coup favori.';
      t.textContent = arg; x.textContent = `${F.w} victoire${F.w > 1 ? 's' : ''}, ${F.l} défaite${F.l > 1 ? 's' : ''}. ${tell}${F.boss ? ' À mi-vie, il change de garde.' : ''}${top ? ` Ce qui vous a coûté le plus contre lui : ${(MOVES[top] ? MOVES[top].name : top).toLowerCase()}. ${Bilan.ADVICE[top] || ''}` : ''}`;
      this.plate(g, { a: 'g_ext', b: 'point', d: 230, title: 'Adversaire', it: arg, foeLook: F.look });
    }
  },
  // planche gravée : papier vergé, cadre, deux figures à l'encre sépia, lignes de mesure, lettres A et B
  plate(g, o) {
    const Wp = 640, Hp = 400; g.setTransform(1, 0, 0, 1, 0, 0);
    const pg = g.createRadialGradient(Wp / 2, Hp / 2, 60, Wp / 2, Hp / 2, 420); pg.addColorStop(0, '#efe2c4'); pg.addColorStop(1, '#cdb88f'); g.fillStyle = pg; g.fillRect(0, 0, Wp, Hp);
    g.strokeStyle = 'rgba(90,60,30,.08)'; for (let y = 4; y < Hp; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(Wp, y); g.stroke(); } // vergeures
    g.strokeStyle = '#5a3a1e'; g.lineWidth = 2; g.strokeRect(14, 14, Wp - 28, Hp - 28); g.lineWidth = .8; g.strokeRect(20, 20, Wp - 40, Hp - 40);
    const sepia = { key: 'sepia', rgb: [70, 45, 25], mix: .78, dark: .05 }, gy = 330, cx = Wp / 2, d = o.d || 220;
    const mk = (look, pose, x, dir) => { const f = new Fighter(false, Object.assign({}, look)); f.reset(x); f.dir = dir; f.pose = Object.assign({}, POSES[pose] || POSES.g_ext); f.feet.f.x = x + dir * f.pose.ff; f.feet.b.x = x + dir * f.pose.bf; f.feet.f.lift = f.feet.b.lift = 0; f.opp = { x: x + dir * 100, J: null }; f.state = 'idle'; f.rapier = RAPIERS.garnison; f.J = f.joints(); f.cloth = null; return f; };
    const h = typeof curHero === 'function' ? curHero() : null, LA = o.heroLook || (h ? h.look : LOOKS.player), LB = o.foeLook || LOOKS.duelliste;
    // les figures sont dessinées dans le repère du jeu (sol à GROUND), puis ramenées sur la planche
    const SC = .86; g.save(); g.translate(0, gy - GROUND * SC); g.scale(SC, SC);
    const xa = (cx / SC) - d / 2, xb = (cx / SC) + d / 2, A = mk(LA, o.a, xa, 1), B = mk(LB, o.b, xb, -1);
    if (o.foeLook) { A.look = Object.assign({}, LA); }
    g.globalAlpha = o.locked ? .22 : 1; RIM.a = 0;
    for (const f of [B, A]) { drawFighter(g, f, { bare: true, tint: sepia }); }
    g.globalAlpha = 1; g.restore();
    // lignes de mesure (à la manière de Thibault) et lettres
    g.strokeStyle = 'rgba(90,50,20,.55)'; g.lineWidth = 1; g.setLineDash([4, 4]); g.beginPath(); g.ellipse(cx, gy + 8, d * SC * .5 + 60, 12, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx - d * SC / 2 - 60, gy + 8); g.lineTo(cx + d * SC / 2 + 60, gy + 8); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#4a2e14'; g.font = 'italic 18px "IM Fell English SC", Georgia, serif'; g.textAlign = 'center'; g.fillText('A', cx - d * SC / 2, gy + 34); g.fillText('B', cx + d * SC / 2, gy + 34);
    g.font = '22px "IM Fell English SC", Georgia, serif'; g.fillText((o.title || '') + (o.it ? ' · ' + o.it : ''), cx, 52);
    if (o.locked) { g.font = 'italic 16px Georgia, serif'; g.fillStyle = 'rgba(74,46,20,.8)'; g.fillText('planche à gagner en duel', cx, Hp / 2); }
  },
};

// ---- menu principal en quatre onglets : Jouer · Salle d'armes · Bibliothèque · Options (les éléments existants sont rangés, rien n'est supprimé) ----
const Menu = {
  init() {
    const card = $('menu') && $('menu').querySelector('.card'); if (!card || card.querySelector('.mtabs')) return;
    const purse = $('purse'), tabs = document.createElement('div'); tabs.className = 'mtabs'; tabs.setAttribute('role', 'tablist');
    const P = {}, names = [['jouer', 'Jouer'], ['salle', 'Salle d\'armes'], ['biblio', 'Bibliothèque'], ['options', 'Options']];
    for (const [k, n] of names) { const b = document.createElement('button'); b.textContent = n; b.dataset.k = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => this.open(k)); tabs.appendChild(b); const d = document.createElement('div'); d.className = 'mpanel'; d.dataset.k = k; P[k] = d; }
    purse.after(tabs); let at = tabs; for (const [k] of names) { at.after(P[k]); at = P[k]; }
    const mv = (el, k) => { if (el) P[k].appendChild(el); };
    const modeRow = $('goStory').parentElement; mv(modeRow, 'jouer');
    const h3 = [...card.querySelectorAll('h3')].find(x => /Duel libre/.test(x.textContent)); mv(h3, 'jouer');
    mv(card.querySelector('.lede'), 'jouer'); mv($('lvls'), 'jouer'); mv($('exBox'), 'jouer'); mv($('go').parentElement, 'jouer'); mv($('venues').parentElement, 'jouer');
    // salle d'armes : héros, marché, exercices
    const salle = document.createElement('div'); salle.className = 'row'; for (const id of ['goChar', 'goMarket']) salle.appendChild($(id));
    const ex = document.createElement('button'); ex.className = 'btn ghost'; ex.textContent = 'Exercices'; ex.addEventListener('click', () => { const tb = $('lvls').querySelector('[data-v="training"]'); if (tb) tb.click(); this.open('jouer'); }); salle.appendChild(ex); P.salle.appendChild(salle);
    const sl = document.createElement('p'); sl.className = 'keys'; sl.textContent = 'Choisissez votre héros, achetez vos rapières, et travaillez vos gestes avec le maître d\'armes.'; P.salle.appendChild(sl);
    // bibliothèque : manuscrit, carnet, aide des coups
    const bib = document.createElement('div'); bib.className = 'row'; for (const id of ['goManus', 'goCodex']) bib.appendChild($(id)); P.biblio.appendChild(bib); mv($('help'), 'biblio'); if ($('help')) $('help').open = true;
    // options
    mv($('audioOpts').parentElement, 'options'); mv($('pw').parentElement, 'options'); mv($('verLine').parentElement, 'options');
    // le reste des boutons de la première rangée (Nuit de Paris, Tournois restent dans Jouer)
    this.open(store.get('ct2d.tab', 'jouer'));
    // premier lancement : proposer le duel d'initiation plutôt qu'un écran d'aide
    if (!store.get('ct2d.initDone', 0) && !store.get('ct2d.initOffered', 0)) { const w = document.createElement('div'); w.className = 'welcome'; w.innerHTML = '<b>Premier duel ?</b><span>L\'initiation dure une minute : cinq gestes, et vous êtes prêt.</span><div class="row"><button class="btn" id="initGo">Commencer l\'initiation</button><button class="btn ghost" id="initLater">Plus tard</button></div>'; P.jouer.prepend(w);
      const done = () => { store.set('ct2d.initOffered', 1); w.remove(); }; $('initGo').addEventListener('click', () => { done(); Snd.init(); G.level = 'training'; G.exercise = 'initiation'; G.startMatch(); }); $('initLater').addEventListener('click', done); }
  },
  open(k) { const card = $('menu').querySelector('.card'); card.querySelectorAll('.mtabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.k === k)); card.querySelectorAll('.mpanel').forEach(p => p.hidden = p.dataset.k !== k); store.set('ct2d.tab', k); },
};
