// =============================== sprint 9 : le carnet du maître d'armes (encyclopédie débloquée en jouant) ===============================
// Faits historiques vérifiables d'un côté ; le Paris des dracs (fiction du jeu) clairement à part.
const CODEX_CATS = [['tech', 'Techniques'], ['ecole', 'Écoles et maîtres'], ['lieu', 'Lieux'], ['epoque', 'L\'époque'], ['ombre', 'Le Paris des dracs (légende du jeu)']];
const CODEX = [
  // techniques : le nom d'époque (italien de l'école de Capoferro, espagnol de la destreza)
  { id: 'stoccata', cat: 'tech', title: 'Estocade · stoccata', hint: 'Toucher d\'une estocade', text: 'Le coup d\'estoc porté main basse et tournée, pointe en avant. Les maîtres italiens du début du XVIIe siècle en font le coup le plus sûr : il part court et revient vite en garde.' },
  { id: 'imbroccata', cat: 'tech', title: 'Imbroccata', hint: 'Porter une imbroccata (↑ + Attaque)', text: 'Estoc porté main haute, la pointe plongeant par-dessus la lame adverse. Plus lent que la stoccata, il passe au-dessus d\'une garde trop basse.' },
  { id: 'misura', cat: 'tech', title: 'La mesure · misura', hint: 'Toucher en fente', text: 'La distance d\'où l\'on peut toucher en se fendant. Capoferro distingue la mesure large (il faut se fendre) et la mesure étroite (le bras suffit). Toute l\'escrime de rapière commence par elle.' },
  { id: 'parata', cat: 'tech', title: 'La parade · parata', hint: 'Réussir une parade parfaite', text: 'Au début du XVIIe siècle, la parade de rapière se fait le plus souvent avec le fort de la lame, en couvrant la ligne attaquée, idéalement au dernier moment pour enchaîner aussitôt.' },
  { id: 'risposta', cat: 'tech', title: 'La riposte · risposta', hint: 'Toucher d\'une riposte', text: 'L\'attaque qui suit immédiatement une parade, pendant que l\'adversaire est encore engagé dans la sienne. Le mot français vient de l\'italien risposta, « réponse ».' },
  { id: 'finta', cat: 'tech', title: 'La feinte · finta', hint: 'Faire une feinte', text: 'Menacer une ligne pour faire parer, puis frapper dans celle qui s\'ouvre. Les traités italiens mettent en garde : une feinte trop lente devient un cadeau pour l\'adversaire.' },
  { id: 'battuta', cat: 'tech', title: 'Le battement · battuta', hint: 'Réussir un battement', text: 'Un coup sec sur la lame adverse pour l\'écarter avant d\'attaquer. Il ouvre la ligne, mais part dans le vide si l\'adversaire dérobe sa lame à temps.' },
  { id: 'legamento', cat: 'tech', title: 'La prise de fer · atajo', hint: 'Faire une prise de fer', text: 'Dominer la lame adverse et la contrôler jusqu\'au corps. Les maîtres espagnols de la destreza en font un principe central sous le nom d\'atajo.' },
  { id: 'legare', cat: 'tech', title: 'Le liement · legare', hint: 'Dominer le fer adverse', text: 'Lames en contact, l\'escrimeur sent la pression adverse et pousse au bon moment pour prendre le fort sur le faible. Le fer dominé laisse la ligne ouverte.' },
  { id: 'cavazione', cat: 'tech', title: 'Le dérobement · cavazione', hint: 'Se dérober à un battement ou une prise de fer', text: 'Passer la pointe sous la lame adverse pour échapper à son contact. Contre le battement et la prise de fer, c\'est la réponse naturelle : l\'adversaire ne trouve que le vide.' },
  { id: 'contratempo', cat: 'tech', title: 'Le coup d\'arrêt · contratempo', hint: 'Toucher pendant la préparation adverse', text: 'Frapper dans le temps de l\'attaque adverse, pendant sa préparation. Le contretemps est l\'arme des escrimeurs patients : il punit ceux qui armeront trop large.' },
  { id: 'passata', cat: 'tech', title: 'La passe sous la lame · passata sotto', hint: 'Esquiver sous la lame', text: 'Esquive décrite par les maîtres italiens : le corps plonge sous l\'estoc adverse, la main libre se pose au sol, et la pointe remonte vers la poitrine. Spectaculaire et risquée.' },
  { id: 'volte', cat: 'tech', title: 'La volte · inquartata', hint: 'Esquiver en volte', text: 'Le pied arrière tourne et efface le corps de la ligne, pendant que la pointe reste en avant. Les Italiens nommeront plus tard ce geste inquartata.' },
  { id: 'taille', cat: 'tech', title: 'Le coup de taille · mandritto', hint: 'Briser une garde', text: 'La rapière est d\'abord une arme d\'estoc, mais elle garde un tranchant. Un coup de taille appuyé, porté de haut, peut forcer une garde tenue trop raide.' },
  // écoles
  { id: 'capoferro', cat: 'ecole', title: 'Ridolfo Capoferro', hint: 'Gagner un premier duel', text: 'Maître siennois. Son Gran Simulacro dell\'arte e dell\'uso della scherma, publié à Sienne en 1610, est l\'un des grands traités de rapière : mesure, tempo et fente y sont décrits avec précision.' },
  { id: 'fabris', cat: 'ecole', title: 'Salvator Fabris', hint: 'Battre un adversaire de niveau Maître', text: 'Maître padouan au service du roi du Danemark. Son traité De lo schermo overo scienza d\'arme paraît à Copenhague en 1606 ; on y voit des gardes très basses et des passes sous la lame.' },
  { id: 'destreza', cat: 'ecole', title: 'La destreza espagnole', hint: 'Affronter un escrimeur de la destreza', text: 'École fondée par Jerónimo Sánchez de Carranza (De la filosofía de las armas, 1582), puis Luis Pacheco de Narváez (1600). Bras tendu, géométrie des pas autour d\'un cercle imaginaire, contrôle de la lame adverse.' },
  { id: 'thibault', cat: 'ecole', title: 'Girard Thibault d\'Anvers', hint: 'Terminer le chapitre 4', text: 'Son Académie de l\'Espée, publiée en 1630, transpose la destreza dans d\'immenses gravures où les escrimeurs marchent sur un cercle inscrit au sol. Le cercle de la salle espagnole du chapitre 4 en est un hommage.' },
  // lieux
  { id: 'pontneuf', cat: 'lieu', title: 'Le Pont-Neuf', hint: 'Se battre au bord de la Seine, la nuit', text: 'Achevé en 1607, c\'est le premier pont de Paris sans maisons. La statue équestre d\'Henri IV y est installée dans les années 1610. De jour, on y vend de tout ; de nuit, on y détrousse.' },
  { id: 'cite', cat: 'lieu', title: 'Les toits de la Cité', hint: 'Se battre sur la loggia', text: 'L\'île de la Cité est alors un entassement de maisons hautes et étroites autour du Palais et de Notre-Dame. Les toits d\'ardoise forment un second Paris, celui des voleurs et des chats.' },
  { id: 'palaiscardinal', cat: 'lieu', title: 'Le Palais-Cardinal', hint: 'Se battre dans la cour du palais', text: 'Richelieu fait bâtir son palais près du Louvre à partir de la fin des années 1620. Légué au roi à sa mort, il deviendra le Palais-Royal.' },
  { id: 'notredame', cat: 'lieu', title: 'Notre-Dame', hint: 'Se battre dans la cathédrale', text: 'La cathédrale de l\'île de la Cité, achevée au XIVe siècle. En 1633, ses cloches rythment encore la vie de tout Paris.' },
  { id: 'placeroyale', cat: 'lieu', title: 'La place Royale', hint: 'Terminer le chapitre 3', text: 'Inaugurée en 1612 (aujourd\'hui place des Vosges), la plus élégante place de Paris. C\'est là qu\'en 1627 le comte de Bouteville se bat en duel, en plein jour, au mépris de l\'édit.' },
  // époque
  { id: 'edit', cat: 'epoque', title: 'L\'édit de 1626', hint: 'Terminer le chapitre 1', text: 'En février 1626, un édit de Louis XIII, voulu par Richelieu, punit le duel de mort. Les duels déciment alors la noblesse ; le Cardinal veut des épées au service du roi, pas des querelles.' },
  { id: 'bouteville', cat: 'epoque', title: 'L\'affaire Bouteville', hint: 'Terminer le chapitre 3', text: 'François de Montmorency-Bouteville, duelliste célèbre, se bat place Royale en mai 1627. Malgré son nom et les suppliques, il est décapité en place de Grève le 22 juin 1627 : l\'édit s\'applique à tous.' },
  { id: 'mousquetaires', cat: 'epoque', title: 'Mousquetaires du roi', hint: 'Affronter un mousquetaire', text: 'Compagnie créée par Louis XIII en 1622, casaque bleue à croix blanche. La rivalité avec les gardes du Cardinal, en rouge, est une réalité de la cour… que la littérature amplifiera.' },
  { id: 'pappenheimer', cat: 'epoque', title: 'La rapière Pappenheimer', hint: 'Posséder la Pappenheimer', text: 'Garde à coquilles percées et branches multiples, associée au général Pappenheim, figure de la guerre de Trente Ans qui fait rage en Allemagne en 1633.' },
  // fiction du jeu
  { id: 'dracs', cat: 'ombre', title: 'Les dracs', hint: 'Terminer le chapitre 7', text: 'Dans le Paris de ce jeu, des êtres à écailles vivent cachés parmi les hommes. Peau dure, griffes qui brisent la garde… et des jambes comme tout le monde. Pure légende du jeu.' },
  { id: 'vouivres', cat: 'ombre', title: 'Les vouivres', hint: 'Apercevoir une vouivre dans le ciel', text: 'Petits dragons des toits qui passent parfois au-dessus de la Seine. Le nom vient des légendes françaises de la vouivre, serpent ailé des campagnes ; leur présence à Paris est une invention du jeu.' },
  { id: 'ecaillegrise', cat: 'ombre', title: 'La Confrérie de l\'Écaille grise', hint: 'Terminer le chapitre 6', text: 'Société secrète de dracs qui rêve de voir Paris à genoux. Inventée pour le Registre écarlate.' },
];
const Codex = {
  toastQ: [],
  data() { const d = Save.data; if (!d.codex) d.codex = {}; return d.codex; },
  has(id) { return !!this.data()[id]; },
  unlock(id) {
    if (G.state === 'demo' || G.silent || G.mode === 'demo') return; const e = CODEX.find(x => x.id === id); if (!e || this.has(id)) return;
    this.data()[id] = Date.now(); Save.persist(); this.toastQ.push({ e, t0: 0 });
  },
  count() { return CODEX.filter(e => this.has(e.id)).length; },
  init() {
    const ev0 = G.event.bind(G); G.event = (type, info) => { ev0(type, info); try { this.onEvent(type, info || {}); } catch (err) { } };
    const b = $('goCodex'); if (b) b.addEventListener('click', () => { Snd.init(); this.show(); });
    const back = $('codexBack'); if (back) back.addEventListener('click', () => G.show('menu'));
  },
  onEvent(type, i) {
    if (G.state !== 'fight' && G.state !== 'ko') return;
    const pa = i.a && i.a.isPlayer, pd = i.d && i.d.isPlayer, k = i.m && i.m.kind;
    if (type === 'hit' && pa) { if (k === 'jab') this.unlock('stoccata'); if (k === 'fente') this.unlock('misura'); if (k === 'riposte') this.unlock('risposta'); if (i.crit === 'Coup d\'arrêt') this.unlock('contratempo'); }
    if (type === 'parry' && pd) this.unlock('parata');
    if (type === 'break' && pa) this.unlock('taille');
    if (type === 'beat' && pa) this.unlock('battuta');
    if (type === 'dominate' && pa) this.unlock('legare');
    if (type === 'derob' && pd) this.unlock('cavazione');
    if (type === 'esquive' && pd) this.unlock(i.d.esq && i.d.esq.kind === 'volte' ? 'volte' : 'passata');
  },
  // vérifications à chaque pas (gestes, lieux, adversaires)
  step() {
    if (G.state !== 'fight') return; const p = G.p, e = G.e;
    if (p.state === 'attack' && p.move) { if (p.move.kind === 'circ') this.unlock('imbroccata'); if (p.move.kind === 'lie') this.unlock('legamento'); }
    if (p.state === 'feint') this.unlock('finta');
    const V = { nuit: 'pontneuf', loggia: 'cite', cloitre: 'palaiscardinal', eglise: 'notredame' }[G.venue]; if (V && G.time > 3) this.unlock(V);
    if (e.arch === 'destreza') this.unlock('destreza');
    if (/mousquetaire/i.test(e.look && e.look.name || '')) this.unlock('mousquetaires');
    if ((Save.data.owned || []).includes('pappenheimer')) this.unlock('pappenheimer');
  },
  onMatchEnd(won) { if (!won) return; this.unlock('capoferro'); if (G.level === 'maitre' || (G.ai && G.ai.level === 'maitre')) this.unlock('fabris'); },
  onChapter(id) { ({ ch01: ['edit'], ch03: ['placeroyale', 'bouteville'], ch04: ['thibault'], ch06: ['ecaillegrise'], ch07: ['dracs'] }[id] || []).forEach(x => this.unlock(x)); },
  // écran du carnet
  show() {
    const box = $('codexList'); box.innerHTML = ''; $('codexCount').textContent = `${this.count()} / ${CODEX.length} entrées`;
    for (const [cat, name] of CODEX_CATS) {
      const h = document.createElement('div'); h.className = 'eyebrow'; h.textContent = name; box.appendChild(h);
      const row = document.createElement('div'); row.className = 'cx-row';
      for (const e of CODEX.filter(x => x.cat === cat)) {
        const ok = this.has(e.id), b = document.createElement('button'); b.className = 'opt small cx' + (ok ? '' : ' locked');
        b.innerHTML = ok ? `<b>${e.title}</b>` : `<b>???</b><span>${e.hint}</span>`; b.disabled = !ok;
        b.addEventListener('click', () => { $('codexTitle').textContent = e.title; $('codexText').textContent = e.text; $('codexRead').hidden = false; });
        row.appendChild(b);
      }
      box.appendChild(row);
    }
    $('codexRead').hidden = true; G.show('codex');
  },
  // annonce d'une nouvelle entrée (repère écran)
  draw(g, u) {
    const q = this.toastQ[0]; if (!q) return; if (!q.t0) { if (G.banner || CutIn.cur || Story.lesson || G.state === 'finish') return; q.t0 = performance.now(); } /* un seul message important à la fois */ const t = (performance.now() - q.t0) / 1000; if (t > 3) { this.toastQ.shift(); return; }
    const a = Math.min(1, t / .25, (3 - t) / .4), txt = /^Manuscrit/.test(q.e.title) ? q.e.title : 'Carnet du maître d\'armes · ' + q.e.title; g.save(); g.globalAlpha = a; g.font = `700 ${Math.round(13 * u)}px "Alegreya Sans", sans-serif`;
    const w = g.measureText(txt).width + 30 * u, x = W / 2 - w / 2, y = (G.mode === 'training' ? 176 : 64) * u; /* sous le panneau du maître d'armes à l'entraînement */ g.fillStyle = 'rgba(12,9,8,.85)'; g.fillRect(x, y, w, 26 * u); g.strokeStyle = 'rgba(216,178,94,.8)'; g.strokeRect(x + .5, y + .5, w - 1, 26 * u - 1);
    g.fillStyle = '#f2e2b8'; g.textAlign = 'center'; g.fillText(txt, W / 2, y + 17.5 * u); g.restore();
  },
};
