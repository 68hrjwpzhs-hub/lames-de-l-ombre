
// =============================== carrière : rapières, marché, tournois, sauvegarde ===============================
// Statistiques d'une rapière : speed (multiplie la préparation, < 1 = plus vive), power (multiplie les dégâts),
// len (longueur de lame en px, 112 = référence : allonge réelle, prise en compte par la touche), guard (s ajoutées à la fenêtre de parade).
const RAPIERS = {
  heros: { name: 'Lame du héros', desc: 'La lame personnelle de votre héros.', base: 0, rar: 0, speed: 1, power: 1, len: 112, guard: 0, blade: '#e9eff5', hilt: '#c8a050' }, // remplie par applyAvatar
  garnison: { name: 'Rapière de garnison', desc: 'Lame de munition, honnête et sans surprise.', base: 0, rar: 0, speed: 1, power: 1, len: 112, guard: 0, blade: '#d6dde4', hilt: '#9a8a6a' },
  tolede: { name: 'Lame de Tolède', desc: 'Acier d\'Espagne, vif et nerveux.', base: 150, rar: 1, speed: .93, power: 1.04, len: 114, guard: 0, blade: '#e4ebf2', hilt: '#c8a050' },
  solingen: { name: 'Rapière de Solingen', desc: 'Lame lourde de Westphalie : chaque touche porte.', base: 230, rar: 1, speed: 1.02, power: 1.16, len: 112, guard: 0, blade: '#cfd6de', hilt: '#8a8f98' },
  milanaise: { name: 'Spada milanaise', desc: 'Longue lame de Milan, idéale pour tenir la mesure.', base: 290, rar: 1, speed: 1.02, power: 1.04, len: 122, guard: 0, blade: '#e8eef4', hilt: '#b89048' },
  coquille: { name: 'Rapière à coquille', desc: 'La coquille protège la main : parades plus sûres.', base: 340, rar: 2, speed: .97, power: 1, len: 112, guard: .035, blade: '#e0e6ec', hilt: '#c0c6ce' },
  pappenheimer: { name: 'Pappenheimer', desc: 'Garde ajourée et lame solide, pour le duel sérieux.', base: 560, rar: 2, speed: .95, power: 1.12, len: 116, guard: .02, blade: '#e6ecf2', hilt: '#a8acb4' },
  venitienne: { name: 'Rapière vénitienne', desc: 'Légère et rapide, forgée pour les duels à la lanterne.', base: 820, rar: 3, speed: .87, power: 1.08, len: 116, guard: .01, blade: '#f0f4f8', hilt: '#d8b25e' },
  ferrara: { name: 'La Ferrara', desc: 'Lame signée d\'Andrea Ferrara : vive, longue et redoutable.', base: 1300, rar: 3, speed: .89, power: 1.22, len: 120, guard: .025, blade: '#f6f8fb', hilt: '#e8c870' },
};
const RAPIER_IDS = Object.keys(RAPIERS);
const RARITY = ['', 'commune', 'rare', 'de maître'];

// adversaires de tournoi : niveau d'IA, réglages fins, rapière, tenue
const mk = (base, o) => Object.assign({}, LOOKS[base], o);
const TOURNAMENTS = [
  { id: 'loggia', name: 'Défis des toits', venue: 'loggia', fee: 0, prize: 150, desc: 'Les jeunes lames du Marais se mesurent au-dessus des rues, sous le vol des vouivres.',
    bouts: [{ name: 'Bastiano', level: 'debutant', rapier: 'garnison', look: mk('debutant', {}) },
      { name: 'Pietro le Tanneur', level: 'debutant', tweak: { slow: 1.65, perfect: .16 }, rapier: 'garnison', look: mk('debutant', { style: 'paysan', coat: '#d8ccb0', coat2: '#5a4630', hose: '#5a4630', stock: '#9a8a6a', boot: '#3a2a1a', hatType: 'paille', beard: 'moustache', hair: '#2a1a10' }) },
      { name: 'Ser Ottavio', level: 'duelliste', tweak: { slow: 1.75, perfect: .25 }, rapier: 'tolede', look: mk('duelliste', {}) }] },
  { id: 'salle', name: 'Coupe des salles d\'armes', venue: 'salle', fee: 40, prize: 320, desc: 'Les élèves des meilleurs maîtres d\'armes de Paris.',
    bouts: [{ name: 'Giacomo', level: 'duelliste', tweak: { slow: 1.7 }, rapier: 'tolede', look: mk('duelliste', { coat: '#2a3a6a', coat2: '#1a2448', plume: '#e8e4dc', name: 'Giacomo' }) },
      { name: 'Ludovico', level: 'duelliste', rapier: 'solingen', look: mk('duelliste', { coat: '#6a2a52', coat2: '#401834', plume: '#d8b25e', beard: 'pointed' }) },
      { name: 'Ser Ottavio', level: 'duelliste', tweak: { perfect: .45 }, rapier: 'milanaise', look: mk('duelliste', {}) }] },
  { id: 'cloitre', name: 'Joute du Palais-Cardinal', venue: 'cloitre', fee: 90, prize: 500, desc: 'Un tournoi d\'honneur, sous les fenêtres de Son Éminence.',
    bouts: [{ name: 'Fra Anselmo', level: 'duelliste', rapier: 'coquille', look: mk('debutant', { style: 'moine', coat: '#4a3e34', coat2: '#3a3028', hose: '#3a3028', trim: '#d8ccb0', hatType: 'aucun', hat: null, plume: null, cape: null, hair: '#6a5a4a', hairStyle: 'tonsure', beard: 'full' }) },
      { name: 'Donna Lucrezia', level: 'duelliste', tweak: { react: .19, perfect: .5 }, rapier: 'milanaise', look: mk('duelliste', { style: 'dame', body: 'f', coat: '#6a1a2a', coat2: '#3a0e18', hose: '#1a1a1a', stock: '#e8dcc8', trim: '#d8b25e', hatType: 'feutre', hat: '#1a1a1a', plume: '#f0e8e0', cape: null, hair: '#3a2210', hairStyle: 'chignon', beard: 'none' }) },
      { name: 'Il Corvo', level: 'maitre', tweak: { slow: 1.5 }, rapier: 'pappenheimer', look: mk('maitre', { style: 'rodeur', coat: '#2a2a2a', coat2: '#1a1c1a', hose: '#1a1c1a', boot: '#141010', trim: '#8a8f98', hatType: 'capuche', hat: '#151515', plume: null, cape: '#101010', beard: 'pointed', hair: '#14121a', hairStyle: 'long' }) }] },
  { id: 'piazza', name: 'Duels du Pont-Neuf', venue: 'nuit', fee: 160, prize: 780, desc: 'À la lanterne, sans juge ni pitié.',
    bouts: [{ name: 'Marcantonio', level: 'maitre', tweak: { slow: 1.5 }, rapier: 'milanaise', look: mk('duelliste', { coat: '#3a1418', coat2: '#240c10', cape: '#1a1a1a', plume: '#c8c0b0', beard: 'full' }) },
      { name: 'Il Corvo', level: 'maitre', tweak: { slow: 1.42 }, rapier: 'pappenheimer', look: mk('maitre', { style: 'rodeur', coat: '#2a2a2a', coat2: '#1a1c1a', hose: '#1a1c1a', boot: '#141010', trim: '#8a8f98', hatType: 'capuche', hat: '#151515', plume: null, cape: '#101010', beard: 'pointed', hair: '#14121a', hairStyle: 'long' }) },
      { name: 'Maestro Ferrante', level: 'maitre', rapier: 'venitienne', look: mk('maitre', {}) }] },
  { id: 'cathedrale', name: 'Grand Tournoi de Notre-Dame', venue: 'eglise', fee: 300, prize: 1500, desc: 'Le titre de première lame du royaume.',
    bouts: [{ name: 'Don Rodrigo', level: 'maitre', arch: 'destreza', tweak: { slow: 1.3 }, rapier: 'pappenheimer', look: mk('duelliste', { coat: '#1a1a1a', coat2: '#0e0e0e', trim: '#c8a050', plume: '#b2302a', cape: '#5a1418', beard: 'pointed' }) },
      { name: 'Il Corvo', level: 'maitre', tweak: { slow: 1.3, perfect: .55 }, rapier: 'venitienne', look: mk('maitre', { style: 'rodeur', coat: '#2a2a2a', coat2: '#1a1c1a', hose: '#1a1c1a', boot: '#141010', trim: '#8a8f98', hatType: 'capuche', hat: '#151515', plume: null, cape: '#101010', beard: 'pointed', hair: '#14121a', hairStyle: 'long' }) },
      { name: 'Maestro Ferrante', level: 'maitre', tweak: { slow: 1.22, perfect: .6, react: .17 }, rapier: 'ferrara', look: mk('maitre', {}) }] },
];
const STAGE = ['Quart de finale', 'Demi-finale', 'Finale'];
const LEVEL_RAPIER = { debutant: 'garnison', duelliste: 'tolede', maitre: 'solingen', training: 'garnison' };
const LEVEL_NAME = { debutant: 'débutant', duelliste: 'duelliste', maitre: 'maître' };

// ---- sauvegarde : compte claude.ai (données privées du joueur) si disponible, sinon navigateur ----
const Save = {
  data: null, mode: 'local', db: null, uid: null, writing: false, again: false,
  fresh() { return { v: 1, avatar: null, hero: 'vaucelles', ecus: 60, owned: ['heros', 'garnison'], equipped: 'heros', won: {}, tour: null, duels: 0, victories: 0, market: null, updated: 0 }; },
  init() {
    this.data = Object.assign(this.fresh(), store.get('ct2d.save', {}));
    this.migrate(); Market.ensure(); applyAvatar();
    // la base de l'artefact (privée par joueur) arrive plus tard, si ce visiteur y a accès
    (async () => {
      try {
        if (!window.claude || !window.claude.use) return;
        const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
        if (!db || !user) return; const uid = await user.id(); if (!uid) return;
        this.db = db; this.uid = uid;
        const snap = await db.doc('data/users/' + uid + '/save').get();
        if (snap.exists) { const r = snap.data(); if ((r.updated || 0) > (this.data.updated || 0)) { this.data = Object.assign(this.fresh(), JSON.parse(JSON.stringify(r))); this.migrate(); Market.ensure(); applyAvatar(); store.set('ct2d.save', this.data); } }
        this.mode = 'compte'; this.persist(); Career.refresh();
      } catch (e) { this.mode = 'local'; }
    })();
  },
  migrate() { const d = this.data; if (!d.owned.includes('heros')) d.owned.unshift('heros'); if (!d.heroMig) { if (d.equipped === 'garnison') d.equipped = 'heros'; d.heroMig = true; } if (!HEROES[d.hero]) d.hero = 'vaucelles'; },
  persist() {
    this.data.updated = Date.now(); store.set('ct2d.save', this.data);
    if (!this.db) return;
    if (this.writing) { this.again = true; return; } // une écriture à la fois
    this.writing = true;
    this.db.doc('data/users/' + this.uid + '/save').set(JSON.parse(JSON.stringify(this.data)))
      .catch(() => { this.mode = 'local'; })
      .finally(() => { this.writing = false; if (this.again) { this.again = false; this.persist(); } });
  },
};

// ---- export / import de la partie : un code texte (et un fichier) pour la mettre à l'abri ou la passer d'une version du jeu à l'autre ----
// Format : LDO1.<base64url du JSON>.<crc32> — le JSON contient la sauvegarde, les réglages et le bilan des duels.
const SaveIO = {
  crc(str) { let c, crc = 0 ^ -1; for (let i = 0; i < str.length; i++) { c = (crc ^ str.charCodeAt(i)) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crc = (crc >>> 8) ^ c; } return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0'); },
  b64e(s) { const u = new TextEncoder().encode(s); let b = ''; for (let i = 0; i < u.length; i += 8192) b += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new TextDecoder().decode(u); },
  pack() { const o = { fmt: 1, at: new Date().toISOString(), save: Save.data, settings: store.get('ct2d.settings', {}), record: store.get('ct2d.record', { w: 0, l: 0 }) }; const j = JSON.stringify(o), p = this.b64e(j); return 'LDO1.' + p + '.' + this.crc(p); },
  unpack(code) {
    const c = (code || '').replace(/\s+/g, ''), m = /LDO1\.([A-Za-z0-9_-]+)\.([0-9A-Za-z]+)/.exec(c);
    if (!m) throw new Error(c.includes('LDO1') ? 'Code incomplet ou abîmé : recopiez-le en entier.' : 'Ce n\'est pas un code de sauvegarde (il commence par LDO1).');
    if (this.crc(m[1]) !== m[2]) throw new Error('Code incomplet ou abîmé : recopiez-le en entier.');
    const o = JSON.parse(this.b64d(m[1])); if (!o || !o.save || typeof o.save !== 'object') throw new Error('Sauvegarde illisible.'); return o;
  },
  summary(s) { const h = HEROES[s.hero] ? HEROES[s.hero].name : s.hero; return `${h} · ${s.ecus || 0} écus · ${(s.owned || []).length} rapière${(s.owned || []).length > 1 ? 's' : ''} · ${s.victories || 0} victoire${(s.victories || 0) > 1 ? 's' : ''} sur ${s.duels || 0} duel${(s.duels || 0) > 1 ? 's' : ''}`; },
  apply(o) {
    store.set('ct2d.save.backup', { at: new Date().toISOString(), save: Save.data }); // l'ancienne partie est gardée de côté
    Save.data = Object.assign(Save.fresh(), JSON.parse(JSON.stringify(o.save))); Save.migrate(); Market.ensure(); applyAvatar(); Save.persist();
    if (o.settings) store.set('ct2d.settings', o.settings); if (o.record) { store.set('ct2d.record', o.record); G.record = o.record; }
    Career.refresh();
  },
  init() {
    const info = t => { $('saveInfo').textContent = t; }, box = $('saveCode');
    if (window.claude) $('saveFile').hidden = true; // sur claude.ai la page ne peut pas proposer de fichier : le code suffit
    $('optSave').addEventListener('click', () => { Snd.init(); box.value = ''; this.pending = null; $('saveImport').textContent = 'Importer'; info('Partie actuelle : ' + this.summary(Save.data)); G.show('savebox'); });
    $('saveBack').addEventListener('click', () => G.show('menu'));
    $('saveExport').addEventListener('click', () => { box.value = this.pack(); box.focus(); box.select(); info('Code prêt (' + box.value.length + ' caractères) : copiez-le et gardez-le en lieu sûr.'); });
    $('saveCopy').addEventListener('click', async () => { if (!box.value.startsWith('LDO1')) box.value = this.pack(); try { await navigator.clipboard.writeText(box.value); info('Code copié dans le presse-papiers.'); } catch (e) { box.focus(); box.select(); info('Copie automatique refusée par le navigateur : le code est sélectionné, utilisez Copier.'); } });
    $('saveFile').addEventListener('click', () => { const code = this.pack(); box.value = code; try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code + '\n'], { type: 'text/plain' })); a.download = 'lames-de-l-ombre-' + new Date().toISOString().slice(0, 10) + '.ldo.txt'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); info('Fichier proposé au téléchargement (sinon, copiez le code ci-dessus).'); } catch (e) { info('Téléchargement impossible ici : copiez le code ci-dessus.'); } });
    $('saveImport').addEventListener('click', () => {
      const btn = $('saveImport');
      try { const o = this.unpack(box.value), s = this.summary(o.save);
        if (this.pending !== box.value) { this.pending = box.value; btn.textContent = 'Confirmer l\'import'; info('À importer : ' + s + '. Touchez « Confirmer l\'import » pour remplacer la partie actuelle (elle est gardée de côté).'); return; }
        this.pending = null; btn.textContent = 'Importer'; this.apply(o); info('Partie importée : ' + s); Snd.ding(); }
      catch (e) { this.pending = null; btn.textContent = 'Importer'; info(e.message || 'Code illisible.'); }
    });
  },
};

// ---- marché : cours en marche aléatoire ramenée vers le prix de base, étal changeant selon la rareté ----
const Market = {
  ensure() {
    const d = Save.data; if (d.market && d.market.f) return;
    d.market = { day: 1, f: {}, hist: {}, stock: {} };
    for (const id of RAPIER_IDS) { d.market.f[id] = 1; d.market.hist[id] = [1]; d.market.stock[id] = RAPIERS[id].rar < 2 || id === 'coquille'; }
  },
  price(id) { return Math.round(RAPIERS[id].base * Save.data.market.f[id] / 5) * 5; },
  sell(id) { return Math.round(this.price(id) * .55 / 5) * 5; },
  advance() {
    const m = Save.data.market; m.day++;
    for (const id of RAPIER_IDS) {
      if (!RAPIERS[id].base) continue;
      let f = m.f[id]; f += (1 - f) * .15 + (Math.random() - .5) * .16; f = clamp(f, .7, 1.4); m.f[id] = +f.toFixed(3);
      m.hist[id] = (m.hist[id] || []).concat(m.f[id]).slice(-10);
      m.stock[id] = Math.random() < [1, 1, .65, .4][RAPIERS[id].rar];
    }
  },
  trend(id) { const h = Save.data.market.hist[id] || [1]; return h.length < 2 ? 0 : h[h.length - 1] - h[h.length - 2]; },
  spark(id) {
    const h = Save.data.market.hist[id] || [1]; if (h.length < 2) return '';
    const w = 70, hh = 18, lo = Math.min(...h, .7), hi = Math.max(...h, 1.4);
    const pts = h.map((v, i) => `${(i / (h.length - 1) * w).toFixed(1)},${(hh - (v - lo) / (hi - lo) * hh).toFixed(1)}`).join(' ');
    return `<svg width="${w}" height="${hh}" viewBox="0 0 ${w} ${hh}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="#d8b25e" stroke-width="1.5"/></svg>`;
  },
};

// ---- écrans et règles de carrière ----
const Career = {
  init() {
    Save.init(); SaveIO.init();
    $('goTour').addEventListener('click', () => { Snd.init(); Music.play('menu'); this.showTourneys(); });
    $('goMarket').addEventListener('click', () => { Snd.init(); Music.play('menu'); this.showMarket(); });
    $('tourBack').addEventListener('click', () => G.toMenu());
    $('mkBack').addEventListener('click', () => G.toMenu());
    $('brGo').addEventListener('click', () => this.fightBout());
    $('brQuit').addEventListener('click', () => { Save.data.tour = null; Save.persist(); this.showTourneys(); });
    this.refresh();
  },
  purse() { const d = Save.data; return `<span style="color:var(--parch)">${(LOOKS.player.name || 'Vous').replace(/[<&]/g, '')}</span><span><span class="coin"></span><b>${d.ecus}</b> écus</span><span>· Rapière : ${RAPIERS[d.equipped].name}</span><span style="font-size:12px">· ${Save.mode === 'compte' ? 'progression sauvegardée sur votre compte' : 'progression sauvegardée dans ce navigateur'}</span>`; },
  refresh() { for (const id of ['purse', 'purseT', 'purseM']) { const el = $(id); if (el) el.innerHTML = this.purse(); } },
  unlocked(i) { return i === 0 || (Save.data.won[TOURNAMENTS[i - 1].id] || 0) > 0; },
  showTourneys() {
    const d = Save.data; this.refresh();
    $('tourList').innerHTML = TOURNAMENTS.map((t, i) => {
      const un = this.unlocked(i), w = d.won[t.id] || 0, cur = d.tour && d.tour.id === t.id;
      const opp = t.bouts.map(b => `${b.name} (${LEVEL_NAME[b.level]})`).join(' · ');
      const btn = !un ? `<span class="sub">Remportez « ${TOURNAMENTS[i - 1].name} »</span>` : cur ? `<button class="btn small" data-resume="${i}">Reprendre</button>` : `<button class="btn small" data-join="${i}" ${d.ecus < t.fee ? 'disabled' : ''}>S'inscrire${t.fee ? ` (${t.fee})` : ''}</button>`;
      return `<div class="item ${un ? '' : 'locked'}"><div class="main"><h4>${t.name}${w ? `<span class="tag">remporté ×${w}</span>` : ''}</h4><div class="sub">${t.desc} ${VENUES[t.venue].name}.</div><div class="sub">${opp}</div></div><div class="price"><div class="sub">bourse</div><b>${t.prize}</b></div>${btn}</div>`;
    }).join('');
    $('tourList').querySelectorAll('[data-join]').forEach(b => b.addEventListener('click', () => { const t = TOURNAMENTS[+b.dataset.join]; if (Save.data.ecus < t.fee) return; Save.data.ecus -= t.fee; Save.data.tour = { id: t.id, stage: 0 }; Save.persist(); Snd.ding(); this.showBracket(); }));
    $('tourList').querySelectorAll('[data-resume]').forEach(b => b.addEventListener('click', () => this.showBracket()));
    G.show('tourney');
  },
  tour() { const s = Save.data.tour; return s && TOURNAMENTS.find(t => t.id === s.id); },
  showBracket() {
    const t = this.tour(), st = Save.data.tour.stage, b = t.bouts[st];
    $('brEye').textContent = t.name; $('brTitle').textContent = STAGE[st];
    $('brSteps').innerHTML = t.bouts.map((x, i) => `<div class="${i < st ? 'done' : i === st ? 'now' : ''}">${STAGE[i]}<b>${x.name}</b>${i < st ? 'vaincu' : RAPIERS[x.rapier].name}</div>`).join('');
    $('brText').textContent = `${b.name}, ${LEVEL_NAME[b.level]}, tire avec une ${RAPIERS[b.rapier].name.toLowerCase()}. Votre lame : ${RAPIERS[Save.data.equipped].name}. ${st === 2 ? `Bourse du vainqueur : ${t.prize} écus.` : ''}`;
    G.show('bracket');
  },
  fightBout() { const t = this.tour(), b = t.bouts[Save.data.tour.stage]; G.startMatch({ mode: 'tournament', opp: b, venue: t.venue }); },
  // fin de match : récompenses, avancée du tournoi, journée de marché
  onMatchEnd(won, s) {
    const d = Save.data, lines = []; let gain = 0;
    const style = Math.min(20, s.perfect * 2 + s.ripostes);
    if (G.mode === 'tournament') {
      const t = this.tour(), st = d.tour.stage;
      if (won && st < 2) { d.tour.stage++; lines.push(`${STAGE[st]} ${st ? 'remportée' : 'remporté'}. Prochain adversaire : ${t.bouts[st + 1].name}.`); G.overAction = 'bracket'; }
      else if (won) { gain += t.prize; d.won[t.id] = (d.won[t.id] || 0) + 1; d.tour = null; lines.push(`Vainqueur du ${t.name} : +${t.prize} écus.`); G.overAction = 'tourneys'; }
      else { const part = st === 2 ? Math.round(t.prize * .4) : st === 1 ? Math.round(t.prize * .15) : 0; gain += part; d.tour = null; lines.push(st ? `Éliminé en ${STAGE[st].toLowerCase()}${part ? ` : +${part} écus` : ''}.` : 'Éliminé dès le premier duel.'); G.overAction = 'tourneys'; }
    } else if (G.mode === 'duel') {
      const base = won ? { debutant: 25, duelliste: 50, maitre: 90 }[G.level] : 8; gain += base; lines.push(won ? `Victoire : +${base} écus.` : `Défaite : +${base} écus pour la leçon.`); G.overAction = null;
    }
    if (style && G.mode !== 'training') { gain += style; lines.push(`Panache (parades parfaites et ripostes) : +${style}.`); }
    d.ecus += gain; d.duels++; if (won) d.victories++;
    Market.advance(); Save.persist(); this.refresh();
    return lines.join(' ') + ` Bourse : ${d.ecus} écus.`;
  },
  showMarket() {
    const d = Save.data, m = d.market; this.refresh(); $('mkEye').textContent = `Rue de la Ferronnerie · jour ${m.day}`;
    const bar = (v, a, b) => `<span class="bar"><i style="width:${clamp((v - a) / (b - a), .05, 1) * 100}%"></i></span>`;
    $('mkList').innerHTML = RAPIER_IDS.map(id => {
      const r = RAPIERS[id], own = d.owned.includes(id), eq = d.equipped === id, p = Market.price(id), tr = Market.trend(id), avail = m.stock[id];
      const stats = `<div class="stats"><span>Vitesse</span>${bar(1.1 - r.speed, 0, .25)}<span>Puissance</span>${bar(r.power, .95, 1.25)}<span>Allonge</span>${bar(r.len, 108, 124)}<span>Parade</span>${bar(r.guard, -.005, .04)}</div>`;
      let act;
      if (eq) act = `<span class="tag">équipée</span>`;
      else if (own) act = `<button class="btn small" data-eq="${id}">Équiper</button>${r.base ? `<button class="btn ghost small" data-sell="${id}">Vendre ${Market.sell(id)}</button>` : ''}`;
      else if (!avail) act = `<span class="sub">pas à l'étal aujourd'hui</span>`;
      else act = `<button class="btn small" data-buy="${id}" ${d.ecus < p ? 'disabled' : ''}>Acheter</button>`;
      const priceBox = r.base ? `<div class="price"><b>${p}</b> <span class="${tr > 0 ? 'up' : tr < 0 ? 'down' : ''}">${tr > 0 ? '▲' : tr < 0 ? '▼' : ''}</span><div>${Market.spark(id)}</div></div>` : `<div class="price"><span class="sub">fournie</span></div>`;
      return `<div class="item"><div class="main"><h4>${r.name}${r.rar ? `<span class="tag">${RARITY[r.rar]}</span>` : ''}</h4><div class="sub">${r.desc}</div>${stats}</div>${priceBox}<div class="row">${act}</div></div>`;
    }).join('');
    const L = $('mkList');
    L.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.buy, p = Market.price(id); if (d.ecus < p) return; d.ecus -= p; d.owned.push(id); d.equipped = id; Save.persist(); Snd.ding(); this.showMarket(); }));
    L.querySelectorAll('[data-sell]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.sell; d.ecus += Market.sell(id); d.owned = d.owned.filter(x => x !== id); Save.persist(); Snd.tick(); this.showMarket(); }));
    L.querySelectorAll('[data-eq]').forEach(b => b.addEventListener('click', () => { d.equipped = b.dataset.eq; Save.persist(); Snd.clang(false); this.showMarket(); }));
    G.show('market');
  },
};
