
// =============================== héros : les lames de Son Éminence ===============================
// Six lames secrètes du Cardinal (personnages originaux), chacune avec sa rapière et ses qualités.
// resist : multiplie les dégâts subis · speed : multiplie la préparation des attaques (< 1 = plus vif) · dmg : multiplie les dégâts portés
// dash : longueur des pas rapides · parry : s ajoutées à la fenêtre de parade parfaite · arch : posture (destreza : bras tendu)
const HEROES = {
  vaucelles: { name: 'Hugues de Vaucelles', title: 'Le Vieux Loup', desc: 'Capitaine blanchi sous le harnois, il a tout vu et encaisse tout.',
    resist: .8, speed: 1.06, dmg: 1, dash: 1, parry: 0, passive: ['Vieux loup', 'Chaque parade parfaite lui rend 4 points de vie.'], parryHeal: 4,
    rapier: { name: 'La Vieille Garde', desc: 'Pappenheimer usée par trente ans de campagnes.', speed: 1, power: 1.08, len: 114, guard: .02, blade: '#d8dee6', hilt: '#a8acb4' },
    look: { style: 'renaissance', body: 'h', age: 'vieux', scar: true, skin: '#d9a684', hair: '#9a948a', hairStyle: 'court', beard: 'full', hatType: 'feutre', hat: '#1a1a20', plume: '#e8e4dc', cape: '#1a2440', coat: '#24324e', coat2: '#141c30', hose: '#141c30', stock: '#c8c0a8', trim: '#c4c9d2', boot: '#2b1a12', glove: '#4a3422' } },
  isaure: { name: 'Isaure de Mirande', title: 'L\'Aiguille', desc: 'Ancienne espionne de la reine mère : vive, insaisissable, impitoyable en riposte.',
    resist: 1.1, speed: .86, dmg: 1, dash: 1.2, parry: 0, passive: ['Riposte assassine', 'Ses ripostes infligent 6 points de plus.'], ripBonus: 6,
    rapier: { name: 'L\'Aiguille', desc: 'Lame fine et longue, d\'une vivacité de serpent.', speed: .9, power: .95, len: 116, guard: 0, blade: '#f0f4f8', hilt: '#d8b25e' },
    look: { style: 'dame', body: 'f', skin: '#f2cdb0', hair: '#14100c', hairStyle: 'chignon', beard: 'none', hatType: 'feutre', hat: '#14101a', plume: '#6a3a8a', cape: null, coat: '#3a1a4a', coat2: '#1e0e28', hose: '#1a1a24', trim: '#d8b25e', boot: '#2a1a12', glove: '#3a2a3a' } },
  bastien: { name: 'Bastien d\'Armagnac', title: 'Le Gascon', desc: 'Joueur, beau parleur et chirurgien de fortune : il recoud ses plaies entre deux bottes.',
    resist: 1, speed: 1, dmg: 1, dash: 1, parry: 0, passive: ['Chirurgien', 'Chaque touche portée lui rend 3 points de vie.'], healOnHit: 3,
    rapier: { name: 'La Fortune', desc: 'Lame de Tolède gagnée aux dés.', speed: .95, power: 1.04, len: 114, guard: .01, blade: '#e4ebf2', hilt: '#c8a050' },
    look: { style: 'renaissance', body: 'h', nose: 1, skin: '#e3b596', hair: '#5a3a1a', hairStyle: 'long', beard: 'moustache', hatType: 'beret', hat: '#7a1a24', plume: '#d8b25e', cape: '#4a1e0e', coat: '#8a3a1a', coat2: '#4a1e0e', hose: '#4a1e0e', stock: '#d6c7a6', trim: '#d8b25e', boot: '#3a2414', glove: '#6a4a2e' } },
  alvaro: { name: 'Dom Álvaro Teixeira', title: 'Le Diestro', desc: 'Maître portugais de la destreza : bras tendu, géométrie parfaite, la plus longue allonge de Paris.',
    resist: 1, speed: 1.02, dmg: 1, dash: 1, parry: .04, arch: 'destreza', passive: ['Cercle mystérieux', 'Fenêtre de parade parfaite plus large de 0,04 s.'],
    rapier: { name: 'La Línea', desc: 'Longue lame espagnole, toujours en ligne.', speed: 1, power: 1, len: 126, guard: .015, blade: '#e8eef4', hilt: '#b89048' },
    look: { style: 'renaissance', body: 'h', nose: 1.6, skin: '#c99a78', hair: '#14100c', hairStyle: 'queue', beard: 'pointed', hatType: 'feutre', hat: '#0e0e10', plume: '#b2302a', cape: '#14100e', coat: '#1a1a1a', coat2: '#0e0e0e', hose: '#0e0e0e', stock: '#2a2a30', trim: '#c8a050', boot: '#1a1410', glove: '#2a1e18' } },
  corvin: { name: 'Corvin', title: 'L\'Ombre', desc: 'Nul ne connaît son vrai nom. Il frappe fort, et le premier.',
    resist: 1.12, speed: .95, dmg: 1.2, dash: 1.05, parry: 0, passive: ['Coup de l\'ombre', 'Sa première touche de chaque manche inflige 50 % de plus.'], firstHit: 1.5,
    rapier: { name: 'La Lame noire', desc: 'Acier bruni qui ne renvoie aucune lueur.', speed: .94, power: 1.1, len: 112, guard: 0, blade: '#8a929c', hilt: '#3a3a42' },
    look: { style: 'rodeur', body: 'h', scar: true, skin: '#c8957a', hair: '#2a1a10', hairStyle: 'court', beard: 'none', hatType: 'capuche', hat: '#121214', plume: null, cape: '#0e0e10', coat: '#1e1e22', coat2: '#121214', hose: '#121214', stock: '#121214', trim: '#6a6a74', boot: '#0e0c0c', glove: '#1a1416' } },
  mathurin: { name: 'Mathurin Brise-Garde', title: 'Le Colosse', desc: 'Ancien sergent des gardes françaises : lent, massif, ses fentes lourdes fendent toutes les gardes.',
    resist: .9, speed: 1.1, dmg: 1, dash: .9, parry: 0, passive: ['Brise-garde', 'Fente lourde +30 % ; une garde brisée coûte 8 points de vie à l\'adversaire.'], heavyMul: 1.3, breakDmg: 8,
    rapier: { name: 'L\'Épée de guerre', desc: 'Lame large et lourde, faite pour la bataille.', speed: 1.06, power: 1.2, len: 118, guard: 0, blade: '#cfd6de', hilt: '#8a8f98' },
    look: { style: 'paysan', body: 'h', nose: .6, skin: '#d9a684', hair: '#6a4a2a', hairStyle: 'chauve', beard: 'full', hatType: 'beret', hat: '#3a2a1a', plume: null, cape: null, coat: '#b8925a', coat2: '#5a3a24', hose: '#5a3a24', stock: '#8a7a5e', trim: '#8a7050', boot: '#2a1a12', glove: '#5a3a22' } },
};
const HERO_IDS = Object.keys(HEROES);
function curHero() { return HEROES[Save.data && Save.data.hero] || HEROES.vaucelles; }
const heroOf = f => f && f.isPlayer ? curHero() : null;
// le joueur prend l'apparence et la lame de son héros
function applyAvatar() {
  const h = curHero(); LOOKS.player = Object.assign({ blade: '#e9eff5' }, h.look, { name: h.name, blade: h.rapier.blade });
  Object.assign(RAPIERS.heros, h.rapier, { name: h.rapier.name, desc: `${h.rapier.desc} (lame de ${h.name})` });
  if (G.p) { G.p.look = LOOKS.player; }
}
const Creator = { // écran « Héros »
  sel: null, raf: 0,
  init() {
    $('goChar').addEventListener('click', () => { Snd.init(); this.open(); });
    $('crSave').addEventListener('click', () => { Save.data.hero = this.sel; Save.persist(); applyAvatar(); Career.refresh(); Snd.ding(); this.close(); });
    $('crCancel').addEventListener('click', () => this.close());
    this.g = $('crCanvas').getContext('2d');
    this.f = new Fighter(true, LOOKS.player); this.f.opp = { x: 99999, state: 'idle', move: null, dist: () => 999 };
  },
  open() { this.sel = Save.data.hero && HEROES[Save.data.hero] ? Save.data.hero : 'vaucelles'; this.build(); G.show('creator'); this.loop(); },
  close() { cancelAnimationFrame(this.raf); this.raf = 0; G.toMenu(); },
  build() {
    const bar = (v, lo, hi) => `<span class="bar"><i style="width:${clamp((v - lo) / (hi - lo), .06, 1) * 100}%"></i></span>`;
    $('heroList').innerHTML = HERO_IDS.map(id => { const h = HEROES[id]; return `<button class="opt hero" data-h="${id}" aria-pressed="${id === this.sel}"><b>${h.name}</b><span>${h.title}</span></button>`; }).join('');
    $('heroList').querySelectorAll('[data-h]').forEach(b => b.addEventListener('click', () => { this.sel = b.dataset.h; Snd.tick(); this.build(); }));
    const h = HEROES[this.sel], r = h.rapier;
    $('heroInfo').innerHTML = `<h4>${h.name}<span class="tag">${h.title}</span></h4><p>${h.desc}</p>
      <div class="stats"><span>Résistance</span>${bar(1 / h.resist, .85, 1.3)}<span>Vitesse</span>${bar(1 / (h.speed * r.speed), .85, 1.3)}<span>Force</span>${bar(h.dmg * r.power * (h.heavyMul ? 1.05 : 1), .9, 1.35)}<span>Allonge</span>${bar(r.len, 108, 128)}<span>Parade</span>${bar(r.guard + h.parry, -.005, .06)}</div>
      <p class="keys"><b>${h.passive[0]}</b> — ${h.passive[1]}</p><p class="keys">Rapière : <b>${r.name}</b> — ${r.desc}</p>`;
    this.f.look = Object.assign({ blade: r.blade }, h.look, { name: h.name }); this.f.rapier = r; this.f.arch = h.arch || null;
  },
  loop() {
    const cv = $('crCanvas'), g = this.g, f = this.f, dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth || 240, hh = cv.clientHeight || 300;
    if (!cv.clientWidth) { this.raf = requestAnimationFrame(() => this.loop()); return; }
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(hh * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
    const t = performance.now() / 1000, ph = t % 6;
    f.x = 0; f.dir = 1; f.state = ph > 3 && ph < 4.6 ? 'guard' : 'idle'; f.t = ph; f.gline = 'ext';
    f.pose = f.animate(1 / 60); f.updateFeet(1 / 60); f.J = f.joints();
    const s = Math.min(hh / 250, w / 290);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh);
    const bg = g.createLinearGradient(0, 0, 0, hh); bg.addColorStop(0, '#2a2230'); bg.addColorStop(1, '#4a3a34'); g.fillStyle = bg; g.fillRect(0, 0, w, hh);
    g.setTransform(dpr * s, 0, 0, dpr * s, dpr * (w / 2 - 70 * s), dpr * (hh / 2 - (GROUND - 118) * s)); drawFighter(g, f);
    this.raf = requestAnimationFrame(() => this.loop());
  },
};
