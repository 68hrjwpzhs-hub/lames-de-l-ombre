
// =============================== personnage du joueur : nom, corps, tenue, couleurs, coiffure ===============================
const STYLE_PRESETS = {
  renaissance: { coat: '#7a1a24', coat2: '#4a0f16', hose: '#1d1416', stock: '#d6c7a6', boot: '#2b1a12', trim: '#d8b25e', hatType: 'feutre', hat: '#141014', plume: '#efe4c8', cape: '#161214', glove: '#5a3a22' },
  rodeur: { coat: '#4a3a28', coat2: '#2e3a2a', hose: '#2e3a2a', stock: '#2e3a2a', boot: '#2a1c12', trim: '#a89060', hatType: 'capuche', hat: '#2e3a2a', plume: null, cape: '#2a3424', glove: '#3a2a1a' },
  paysan: { coat: '#e2d6b8', coat2: '#6a5034', hose: '#5a4a34', stock: '#a89878', boot: '#3a2a1a', trim: '#8a7050', hatType: 'paille', hat: '#d8b866', plume: null, cape: null },
  moine: { coat: '#5a4632', coat2: '#4a3a28', hose: '#4a3a28', stock: '#4a3a28', boot: '#4a3020', trim: '#d8ccb0', hatType: 'aucun', hat: null, plume: null, cape: null },
  dame: { coat: '#2a3a6a', coat2: '#1a2448', hose: '#1a1a24', stock: '#e8dcc8', boot: '#2a1a12', trim: '#d8b25e', hatType: 'feutre', hat: '#1a1a24', plume: '#f0e8e0', cape: null, glove: '#5a3a22' },
};
const PAL = {
  cloth: ['#7a1a24', '#4a0f16', '#b8302a', '#8a3a1a', '#c8a050', '#e2d6b8', '#d8d0c0', '#5a4632', '#7d5b2c', '#4a3a28', '#2e3a2a', '#1d4a3e', '#3a4a5a', '#2a3a6a', '#4a2a5a', '#17171c'],
  trim: ['#d8b25e', '#c4c9d2', '#e8e0cc', '#b8302a', '#8a7050', '#2a2a2a'],
  boot: ['#2b1a12', '#1a1410', '#4a3020', '#6a4a2e', '#3a3a3a', '#7a5a3a'],
  skin: ['#f2cdb0', '#e3b596', '#d9a684', '#c99a78', '#a8785a', '#7a5238', '#5a3a26'],
  hair: ['#14100c', '#2a1a10', '#5a3a1a', '#8a5a2a', '#c89a50', '#b8462a', '#9a948a', '#e8e4dc'],
  plume: ['#efe4c8', '#b2302a', '#d8b25e', '#2a3a6a', '#3a6a3a', '#1a1a1a'],
};
const OPTS = {
  body: [['h', 'Homme'], ['f', 'Femme']],
  style: Object.entries(STYLE_NAMES),
  hairStyle: [['court', 'Courts'], ['long', 'Longs'], ['queue', 'Queue'], ['chignon', 'Chignon'], ['tonsure', 'Tonsure'], ['chauve', 'Rasé']],
  beard: [['none', 'Aucune'], ['moustache', 'Moustache'], ['pointed', 'Pointue'], ['full', 'Pleine']],
  hatType: [['feutre', 'Feutre'], ['beret', 'Béret'], ['capuche', 'Capuche'], ['paille', 'Paille'], ['aucun', 'Tête nue']],
};
const DEFAULT_AVATAR = Object.assign({ name: 'Vous', body: 'h', style: 'renaissance', skin: '#d9a684', hair: '#2a1a10', hairStyle: 'court', beard: 'pointed' }, STYLE_PRESETS.renaissance);
function lookFromAvatar(a) { const L = Object.assign({ blade: '#e9eff5' }, DEFAULT_AVATAR, a); if (L.body === 'f') L.beard = 'none'; L.name = (L.name || 'Vous').slice(0, 24); return L; }
function applyAvatar() { LOOKS.player = lookFromAvatar(Save.data.avatar || {}); if (G.p) G.p.look = LOOKS.player; }

const Creator = {
  a: null, raf: 0,
  init() {
    $('goChar').addEventListener('click', () => { Snd.init(); this.open(); });
    $('crSave').addEventListener('click', () => { this.a.name = ($('crName').value || '').trim().slice(0, 24) || 'Vous'; Save.data.avatar = this.a; Save.persist(); applyAvatar(); Snd.ding(); this.close(); });
    $('crCancel').addEventListener('click', () => this.close());
    $('crRandom').addEventListener('click', () => { this.randomize(); this.build(); });
    $('crName').addEventListener('input', () => { this.a.name = $('crName').value.slice(0, 24); });
    const cv = $('crCanvas'); this.g = cv.getContext('2d');
    this.f = new Fighter(true, LOOKS.player); this.f.opp = { x: 99999, state: 'idle', move: null, dist: () => 999 };
  },
  open() { this.a = Object.assign({}, DEFAULT_AVATAR, Save.data.avatar || {}); $('crName').value = this.a.name; this.build(); G.show('creator'); this.loop(); },
  close() { cancelAnimationFrame(this.raf); this.raf = 0; G.toMenu(); },
  set(k, v) {
    this.a[k] = v;
    if (k === 'style') { Object.assign(this.a, STYLE_PRESETS[v]); if (v === 'moine' && this.a.body === 'h') this.a.hairStyle = 'tonsure'; if (v === 'dame') { this.a.body = 'f'; if (this.a.hairStyle === 'court' || this.a.hairStyle === 'tonsure') this.a.hairStyle = 'chignon'; } }
    if (k === 'body' && v === 'f' && ['court', 'tonsure', 'chauve'].includes(this.a.hairStyle)) this.a.hairStyle = 'long';
    if (k === 'coat2') this.a.hose = v;
    this.build();
  },
  randomize() {
    const s = pick(Object.keys(STYLE_PRESETS)), body = s === 'dame' ? 'f' : s === 'moine' ? pick(['h', 'h', 'f']) : pick(['h', 'f']);
    Object.assign(this.a, STYLE_PRESETS[s], { style: s, body, skin: pick(PAL.skin), hair: pick(PAL.hair), coat: pick(PAL.cloth), coat2: pick(PAL.cloth), trim: pick(PAL.trim), boot: pick(PAL.boot) });
    this.a.hose = this.a.coat2; this.a.hairStyle = body === 'f' ? pick(['long', 'queue', 'chignon']) : s === 'moine' ? 'tonsure' : pick(['court', 'court', 'long', 'queue', 'chauve']);
    this.a.beard = body === 'f' ? 'none' : pick(OPTS.beard)[0]; if (this.a.plume) this.a.plume = pick(PAL.plume); if (this.a.cape) this.a.cape = pick(PAL.cloth);
  },
  build() {
    const a = this.a, row = (label, key, opts) => `<div class="crRow"><span>${label}</span><div class="row">${opts.map(([v, t]) => `<button class="opt small" data-k="${key}" data-v="${v}" aria-pressed="${a[key] === v}">${t}</button>`).join('')}</div></div>`;
    const sw = (label, key, pal, none) => `<div class="crRow"><span>${label}</span><div class="sw">${none ? `<button data-k="${key}" data-v="" aria-pressed="${!a[key]}" title="aucune" class="none">∅</button>` : ''}${pal.map(c => `<button data-k="${key}" data-v="${c}" aria-pressed="${a[key] === c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div></div>`;
    let h = row('Corps', 'body', OPTS.body) + row('Tenue', 'style', OPTS.style);
    h += sw(a.style === 'paysan' ? 'Chemise' : a.style === 'moine' ? 'Bure' : a.style === 'rodeur' ? 'Pourpoint de cuir' : a.style === 'dame' ? 'Corsage' : 'Pourpoint', 'coat', PAL.cloth);
    h += sw(a.style === 'dame' ? 'Jupe' : a.style === 'paysan' ? 'Gilet et culotte' : a.style === 'moine' ? 'Scapulaire' : a.style === 'rodeur' ? 'Braies' : 'Chausses et basques', 'coat2', PAL.cloth);
    h += sw('Garnitures', 'trim', PAL.trim) + sw('Bottes', 'boot', PAL.boot) + sw('Peau', 'skin', PAL.skin) + row('Coiffure', 'hairStyle', OPTS.hairStyle) + sw('Cheveux', 'hair', PAL.hair);
    if (a.body === 'h') h += row('Barbe', 'beard', OPTS.beard);
    h += row('Coiffe', 'hatType', OPTS.hatType);
    if (a.hatType === 'feutre' || a.hatType === 'beret' || a.hatType === 'capuche') h += sw('Couleur de la coiffe', 'hat', PAL.cloth);
    if (a.hatType === 'feutre' || a.hatType === 'beret') h += sw('Plume', 'plume', PAL.plume, true);
    h += sw('Cape', 'cape', PAL.cloth, true);
    $('crOpts').innerHTML = h;
    $('crOpts').querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => this.set(b.dataset.k, b.dataset.v || null)));
    this.f.look = lookFromAvatar(this.a);
  },
  loop() {
    const cv = $('crCanvas'), g = this.g, f = this.f, dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth || 240, hh = cv.clientHeight || 300;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
    const t = performance.now() / 1000, ph = t % 6;
    f.x = 0; f.dir = 1; f.state = ph > 3 && ph < 4.6 ? 'guard' : 'idle'; f.t = ph; f.gline = 'ext';
    f.pose = f.animate(1 / 60); f.updateFeet(1 / 60); f.J = f.joints();
    const s = Math.min(hh / 265, w / 280);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh);
    const bg = g.createLinearGradient(0, 0, 0, hh); bg.addColorStop(0, '#2a2230'); bg.addColorStop(1, '#4a3a34'); g.fillStyle = bg; g.fillRect(0, 0, w, hh);
    g.setTransform(dpr * s, 0, 0, dpr * s, dpr * (w / 2 - 55 * s), dpr * (hh / 2 - (GROUND - 118) * s)); drawFighter(g, f);
    this.raf = requestAnimationFrame(() => this.loop());
  },
};
