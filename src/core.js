'use strict';
// =============================== constantes ===============================
const W = 960, H = 540, GROUND = 468, DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const outC = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const inQ = t => { t = clamp(t, 0, 1); return t * t; };
// courbes d'animation : entrée (accélération), entrée-sortie, sortie avec léger dépassement (rattrapage du poids)
const inC = t => { t = clamp(t, 0, 1); return t * t * t; };
const inOut = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const backOut = t => { t = clamp(t, 0, 1); const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const wrap180 = a => { a = ((a + 180) % 360 + 360) % 360 - 180; return a === -180 ? 180 : a; };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const $ = id => document.getElementById(id);
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };

// Réglages (modifiables depuis le menu)
const PARRY_PRESETS = { large: .32, normale: .24, stricte: .14 }; // facile, normal, difficile
const CFG = { breath: true, perfectAI: .2, perfect: .24, mash: .25, touchBonus: .03, assist: false, blood: true, music: true, sfx: true, paint: true, cutins: true, finisher: true, bigText: false, bigBtn: false, cueShape: false };
const MINDIST = 104;          // les corps ne se rapprochent jamais davantage (centre à centre)
const LUNGE_STOP = 118;       // une fente s'arrête à cette distance de l'adversaire

// ---- lignes et gardes ----
// haute = au-dessus de la lame adverse vers le visage · ext = dehors · int = dedans · basse = sous la garde
const LINES = ['haute', 'ext', 'int', 'basse'];
const LINE_NAME = { haute: 'haute', ext: 'dehors', int: 'dedans', basse: 'basse' };
const LINE_COL = { haute: '#e8cf7a', ext: '#9cc8ee', int: '#f0a48c', basse: '#a8dca0' };
const GUARD_NAME = { haute: 'Prima', ext: 'Terza', int: 'Quarta', basse: 'Bassa' };
const GUARD_CMD = { haute: '↑ + Garde', ext: 'Garde', int: '← + Garde', basse: '↓ + Garde' };
// couverture[garde][ligne attaquée] : 1 fermée, .5 garde faible, 0 ouverte
const COVER = {
  haute: { haute: 1, ext: .5, int: .5, basse: 0 },
  ext: { haute: .5, ext: 1, int: 0, basse: .5 },
  int: { haute: .5, ext: 0, int: 1, basse: .5 },
  basse: { haute: 0, ext: .5, int: .5, basse: 1 },
};
const OPEN = { haute: 'basse', ext: 'int', int: 'ext', basse: 'haute' };
const ATTACK_FOR_LINE = { haute: 'circ', ext: 'jab', int: 'degage', basse: 'bassa' };

// ---- coups : préparation (wu) → exécution (act, fenêtre de contact) → récupération (rec), en secondes ----
// lunge : avancée du corps · back : part de la fente reprise en reculant à la récupération · whiff : récupération ajoutée si le coup manque
// pw : multiplicateur de la fenêtre de parade parfaite · breaks : brise une garde tenue
const MOVES = {
  jab: { name: 'Estocade', wu: .17, act: .07, rec: .22, whiff: .1, lunge: 22, line: 'ext', dmg: 8, pw: 1, light: true },
  fente: { name: 'Fente', wu: .24, act: .10, rec: .36, whiff: .3, lunge: 96, back: .3, line: 'ext', dmg: 12, pw: 1.1 },
  bassa: { name: 'Estocade basse', wu: .17, act: .08, rec: .28, whiff: .1, lunge: 30, line: 'basse', dmg: 8, pw: 1, light: true },
  degage: { name: 'Dégagement', wu: .22, act: .08, rec: .26, whiff: .1, lunge: 24, line: 'int', dmg: 9, pw: .9, light: true },
  circ: { name: 'Imbroccata', wu: .30, act: .09, rec: .34, whiff: .08, lunge: 36, line: 'haute', dmg: 11, pw: 1.15 },
  compo: { name: 'Attaque composée', wu: .32, act: .08, rec: .32, whiff: .1, lunge: 40, line: 'ext', dmg: 12, pw: .9 },
  heavy: { name: 'Fente lourde', wu: .32, act: .14, rec: .46, whiff: .2, lunge: 76, back: .2, line: 'haute', dmg: 18, pw: 1.25, breaks: true },
  riposte: { name: 'Riposte', wu: .04, act: .1, rec: .20, lunge: 0, line: 'ext', dmg: 14, pw: 1 },
  // le jeu de lames (le fer) : battement (chasser la lame adverse) et prise de fer (dominer la lame et filer jusqu'au corps)
  beat: { name: 'Battement', wu: .12, act: .06, rec: .16, whiff: .3, lunge: 8, line: 'ext', dmg: 0, pw: 1, fer: true },
  // adversaires seulement : le tajo des Espagnols (coup de taille descendant), les griffes des dracs (main libre, brisent la garde tenue)
  tajo: { name: 'Tajo', wu: .23, act: .09, rec: .3, whiff: .12, lunge: 30, line: 'haute', dmg: 10, pw: 1.1, cut: true, light: true },
  griffe: { name: 'Griffes', wu: .25, act: .08, rec: .34, whiff: .2, lunge: 64, line: 'haute', dmg: 11, pw: 1, breaks: true, claw: true },
  lie: { name: 'Prise de fer', wu: .30, act: .1, rec: .3, whiff: .3, lunge: 40, line: 'ext', dmg: 9, pw: 1, fer: true },
};
const BEAT_DUR = .38, BEAT_MEMORY = .45, BEAT_BONUS = .6, BEAT_WARY = 1.6; // lame chassée : ouverte 0,38 s ; l'attaque qui suit part vite
const STRAIGHT = ['jab', 'fente', 'bassa', 'circ']; // attaques directes : l'opposition d'une prise de fer les dévie
const DEROB = ['degage', 'compo']; // la pointe passe sous la lame : dérobement
const FEINT_DUR = .24, FEINT_BONUS = .55, FEINT_MEMORY = .4;
// riposte : proposée seulement après une parade parfaite, déclenchée par son propre bouton ; parfaite si appuyée dans la zone dorée
// esquive : amorce, fenêtre où l'attaque passe à côté, durée totale ; esquive dans le vide : on trébuche
const ESQ = { a: .04, b: .22, dur: .5, fail: .34, perfect: .1 };
const RIP_WIN = .45, RIP_PERFECT = [.12, .26], RIP_DMG = 12, RIP_DMG_PERFECT = 18;
const RIP_ZONES = { large: [.1, .3], normale: [.12, .26], stricte: [.13, .22] }; // zone dorée selon la fenêtre de parade choisie
const setRipZone = pw => { const z = RIP_ZONES[pw] || RIP_ZONES.normale; RIP_PERFECT[0] = z[0]; RIP_PERFECT[1] = z[1]; };
const HOLD_HEAVY = .22;
const DESPAIR = .03;
// souffle : coût de chaque action (fraction de la jauge), récupération par seconde ; essoufflé sous BREATH_LOW
const BREATH_COST = { jab: .17, bassa: .17, degage: .18, circ: .2, fente: .22, compo: .2, heavy: .3, riposte: .06, beat: .08, lie: .15, tajo: .17, griffe: .2, whiff: .08, dash: .1, feint: .06, block: .05, esq: .14 }, BREATH_REGEN = .2, BREATH_LOW = .3; // énergie du désespoir : sous 30 % de vie, la fenêtre de parade parfaite s'élargit de 0,03 s
const CAM_MAX = 1.5, CAM_REF = 1.4; // caméra : zoom maximal, et définition de référence des décors et personnages // maintenir Attaque au-delà : fente lourde

// =============================== son (synthèse) ===============================
const Snd = {
  ctx: null, vol: .8,
  init() { if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; } try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); const c = this.ctx; this.out = c.createGain(); this.out.gain.value = this.vol; const k = c.createDynamicsCompressor(); this.out.connect(k); k.connect(c.destination); const n = c.sampleRate; const b = c.createBuffer(1, n, n); const d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; this.nb = b; } catch (e) { this.ctx = null; } },
  noise(dur, type, f0, f1, q, g, delay = 0) { const c = this.ctx; if (!c || G.silent || !CFG.sfx) return; const t = c.currentTime + delay; const s = c.createBufferSource(); s.buffer = this.nb; const f = c.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur); const a = c.createGain(); a.gain.setValueAtTime(.0001, t); a.gain.exponentialRampToValueAtTime(g, t + .01); a.gain.exponentialRampToValueAtTime(.0001, t + dur); s.connect(f); f.connect(a); a.connect(this.out); s.start(t, Math.random() * .5); s.stop(t + dur + .05); },
  tone(f, dur, g, type = 'sine', f1, delay = 0) { const c = this.ctx; if (!c || G.silent || !CFG.sfx) return; const t = c.currentTime + delay; const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur); const a = c.createGain(); a.gain.setValueAtTime(.0001, t); a.gain.exponentialRampToValueAtTime(g, t + .005); a.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(a); a.connect(this.out); o.start(t); o.stop(t + dur + .05); },
  swish(p = 1) { this.noise(.16 + .08 * p, 'bandpass', 700, 3800, 1.4, .18 * p); },
  whirl() { this.noise(.28, 'bandpass', 500, 2600, 1.3, .16); this.noise(.22, 'bandpass', 2600, 800, 1.6, .14, .14); },
  clang(bright) { const fs = bright ? [1560, 2290, 3170, 4210, 5630] : [1180, 1735, 2410, 3220]; fs.forEach((f, i) => this.tone(f * rand(.97, 1.03), (bright ? 1.2 : .5) / (1 + i * .4), .12 / (1 + i * .5))); this.noise(.05, 'highpass', 3000, 6000, .7, .3); if (bright) { this.tone(1318, 1, .06, 'sine', 0, .03); this.tone(1975, .9, .05, 'sine', 0, .06); } },
  scrape(v = 1) { this.noise(.11 + .06 * v, 'bandpass', 4200, 1700, 2.2, .05 + .06 * v); this.tone(2650 * rand(.96, 1.04), .1, .012 * v, 'sawtooth', 2350); }, // fer contre fer qui glisse
  beatTac() { this.tone(2400 * rand(.97, 1.03), .09, .1, 'triangle', 1800); this.noise(.025, 'highpass', 4000, 7000, .8, .22); },
  clatter() { [0, .07, .16].forEach((d, i) => { this.tone(1900 * rand(.9, 1.1), .12, .05 / (1 + i), 'triangle', 1200, d); this.noise(.04, 'bandpass', 3000, 1500, 1.5, .1 / (1 + i), d); }); }, // la rapière tombe sur le sol
  tick() { [2100, 3300].forEach((f, i) => this.tone(f * rand(.97, 1.03), .18, .06 / (1 + i))); this.noise(.03, 'highpass', 3500, 6000, .7, .15); },
  crack() { this.tone(240, .3, .25, 'square', 90); this.noise(.25, 'bandpass', 1800, 400, .9, .45); this.clang(false); },
  hit(heavy) { this.tone(heavy ? 110 : 150, .22, .5, 'sine', 45); this.noise(.12, 'lowpass', 1400, 300, .8, .35); },
  whiff() { this.noise(.22, 'bandpass', 1400, 500, 1.1, .07); },
  stamp() { this.tone(90, .12, .35, 'sine', 50); this.noise(.06, 'lowpass', 500, 200, .7, .2); },
  dash() { this.noise(.12, 'lowpass', 900, 300, .7, .12); },
  step() { this.noise(.05, 'lowpass', 600, 250, .7, .035); },
  riposte() { this.swish(1.4); this.tone(784, .25, .05, 'triangle', 0, .02); },
  bell() { this.tone(660, .7, .08, 'triangle'); this.tone(990, .6, .05, 'triangle', 0, .05); },
  ding() { this.tone(1046, .35, .07, 'triangle'); this.tone(1568, .4, .05, 'triangle', 0, .08); },
  whistle() { for (let i = 0; i < 3; i++) this.tone(2550, .16, .07, 'sine', 2850, i * .2); }, // sifflet du guet
  thunder() { this.noise(2.2, 'lowpass', 260, 50, .7, .55); this.noise(1.2, 'lowpass', 600, 90, .8, .3, .15); },
  rain(on) { // pluie continue (bruit filtré en boucle)
    const c = this.ctx; if (!c) return;
    if (on && !this.rainNode && CFG.sfx) { const s = c.createBufferSource(); s.buffer = this.nb; s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = .5; const a = c.createGain(); a.gain.value = .05; s.connect(f); f.connect(a); a.connect(this.out); s.start(); this.rainNode = s; }
    else if (!on && this.rainNode) { try { this.rainNode.stop(); } catch (e) { } this.rainNode = null; }
  },
  fanfare(win) { (win ? [392, 494, 587, 784] : [392, 370, 311, 262]).forEach((f, i) => { this.tone(f, .7, .08, 'triangle', 0, i * .16); }); },
};

// =============================== squelette 2D et poses ===============================
// Angles en degrés depuis l'avant (0 = vers l'adversaire), positifs vers le haut.
// a1/a2/a3 : bras armé (bras, avant-bras, lame) ; b1/b2 : bras libre ; ff/bf : pieds avant/arrière (px depuis le repère) ; fl/bl : levée des pieds
// tw : rotation des épaules (+ = épaule armée projetée vers l'adversaire, − = effacée) · ro : rotation du poignet (+ supination, − pronation / quarte)
// bz : la lame sort du plan du profil (degrés) — moulinet au-dessus de la tête ; la longueur projetée devient L·cos(bz)
const KEYS = ['px', 'py', 'torso', 'head', 'a1', 'a2', 'a3', 'b1', 'b2', 'ff', 'bf', 'fl', 'bl', 'tw', 'ro', 'bz'];
const ANG = ['a1', 'a2', 'a3', 'b1', 'b2'];
const P = (o = {}) => Object.assign({ px: 0, py: 84, torso: 5, head: 0, a1: -38, a2: 4, a3: 9, b1: 150, b2: 100, ff: 36, bf: -34, fl: 0, bl: 0, tw: 0, ro: 0, bz: 0 }, o);
// limites articulaires : flexion du coude (a2 − a1) et du poignet (a3 − a2), en degrés
const LIMITS = { elbow: [-40, 165], wrist: [-125, 125] };
const POSES = {
  // gardes (Capo Ferro, librement adaptées à la vue de profil)
  g_ext: P(),                                                                                          // Terza : main à hauteur de poitrine, pointe en ligne
  g_haute: P({ px: -2, torso: -4, a1: 55, a2: 75, a3: -28, b1: 160, b2: 110 }),                        // Prima : main haute, pointe plongeante
  g_int: P({ torso: 9, a1: -48, a2: 14, a3: 24, b1: -20, b2: 30 }),                                    // Quarta : main tournée, lame croisée, main libre devant
  g_basse: P({ px: 2, py: 78, torso: 14, a1: -72, a2: -28, a3: 4, b1: 140, b2: 120, ff: 40, bf: -38 }), // Bassa : main basse, pointe vers le ventre
  // estocade directe
  jabW: P({ px: -4, py: 83, torso: 2, a1: -55, a2: 18, a3: 8 }),
  jabA: P({ px: 20, py: 80, torso: 16, a1: 2, a2: 1, a3: 0, b1: 205, b2: 195, ff: 64, bf: -36, tw: 12 }),
  jabC: P({ px: -6, py: 81, torso: 0, a1: -58, a2: 20, a3: 10, tw: -6 }), // armé : genoux qui se chargent, main qui recule d'un rien
  // fente : la jambe avant part, la jambe arrière pousse et reste tendue
  fenteW: P({ px: -8, py: 81, torso: -4, a1: -52, a2: 12, a3: 6, ff: 38, bf: -38 }),
  fenteA: P({ px: 40, py: 62, torso: 24, head: -6, a1: 3, a2: 1, a3: -1, b1: 215, b2: 212, ff: 110, bf: -30, tw: 16 }),
  fenteC: P({ px: -10, py: 79, torso: -6, a1: -54, a2: 14, a3: 8, ff: 38, bf: -38, tw: -8 }),                       // compression sur la jambe arrière avant la détente
  fenteR: P({ px: 14, py: 76, torso: 8, head: -2, a1: -2, a2: 2, a3: 2, b1: 190, b2: 170, ff: 72, bf: -34, tw: 6 }), // retour de fente : les jambes d'abord, le bras reste devant
  // estocade basse
  bassaW: P({ px: -4, py: 79, torso: 4, a1: -60, a2: -6, a3: 2 }),
  bassaA: P({ px: 26, py: 68, torso: 28, a1: -24, a2: -20, a3: -20, b1: 205, b2: 200, ff: 76, bf: -38, tw: 10, ro: -20 }),
  bassaC: P({ px: -6, py: 79, torso: 6, a1: -64, a2: -8, a3: 6, tw: -6 }),
  // dégagement : la pointe plonge sous la lame adverse puis remonte de l'autre côté
  dgDip: P({ px: -2, py: 82, torso: 2, a1: -50, a2: -8, a3: -32, ro: -40 }),
  dgW: P({ px: -6, py: 82, torso: 6, a1: -58, a2: 14, a3: 10, b1: -10, b2: 40, ro: -60, tw: -4 }),
  dgA: P({ px: 20, py: 79, torso: 18, a1: -6, a2: -4, a3: -7, b1: 205, b2: 195, ff: 64, bf: -36, ro: -45, tw: 10 }),
  // imbroccata : la main monte, la pointe décrit une courbe haute puis plonge vers le visage
  cR: P({ px: -4, py: 83, torso: -2, a1: 30, a2: 58, a3: 50, ro: 30, tw: -6 }),
  cW: P({ px: -8, py: 82, torso: -6, a1: 62, a2: 58, a3: -8, b1: 150, b2: 100, ro: 50, tw: -8 }),
  cA: P({ px: 22, py: 78, torso: 18, a1: 40, a2: 22, a3: -10, b1: 205, b2: 195, ff: 66, bf: -36, ro: 30, tw: 10 }),
  // attaque composée : menace, cavazione sous la lame, conclusion
  cmT: P({ px: 8, py: 82, torso: 8, a1: -18, a2: 5, a3: 3, ff: 42 }),
  cmDip: P({ px: 2, py: 82, torso: 6, a1: -34, a2: -14, a3: -36, ff: 42 }),
  cmW: P({ px: -2, py: 82, torso: 6, a1: -44, a2: 10, a3: 2, ff: 40 }),
  // fente lourde : demi-cercle au-dessus de la tête, puis la fente
  hWind: P({ px: -12, py: 80, torso: -10, a1: 95, a2: 140, a3: 172, b1: 205, b2: 210, ff: 30, bf: -40, fl: 3 }),
  hMid: P({ px: 10, py: 78, torso: 6, a1: 70, a2: 75, a3: 85, ff: 60, bf: -40 }),
  hEnd: P({ px: 40, py: 66, torso: 24, a1: 4, a2: -2, a3: -6, b1: 210, b2: 200, ff: 104, bf: -26 }),
  // riposte : bras d'abord, corps ensuite
  rA: P({ px: 26, py: 80, torso: 18, a1: 3, a2: 1, a3: -1, b1: 205, b2: 195, ff: 70, bf: -36, tw: 12 }),
  // feinte : menace + appel du pied avant
  g_line: P({ px: 4, torso: 8, a1: -6, a2: -2, a3: -3 }), // la línea recta de la destreza : bras tendu, pointe sur l'adversaire
  tajoW: P({ px: -6, py: 82, torso: -4, a1: 68, a2: 84, a3: 70, b1: 170, b2: 140 }),
  tajoA: P({ px: 22, py: 79, torso: 18, a1: 6, a2: -24, a3: -46, b1: 205, b2: 195, ff: 64, bf: -36 }),
  clawW: P({ px: -6, py: 82, torso: -8, a1: -40, a2: 10, a3: 20, b1: 175, b2: 210, ff: 34 }),
  clawA: P({ px: 22, py: 79, torso: 20, a1: -50, a2: 10, a3: 30, b1: -4, b2: -14, ff: 66, bf: -36 }),
  beatW: P({ px: -2, torso: 2, a1: -40, a2: 14, a3: 28 }),
  beatA: P({ px: 6, torso: 8, a1: -30, a2: 2, a3: -14, ff: 40, ro: -25, tw: 4 }),
  lieW: P({ px: -4, torso: 6, a1: -50, a2: 20, a3: 18, b1: -10, b2: 40 }),
  lieA: P({ px: 24, py: 78, torso: 20, a1: 6, a2: 4, a3: -4, b1: 205, b2: 195, ff: 68, bf: -36, tw: 10, ro: -30 }),
  beaten: P({ px: -6, torso: -6, a1: -70, a2: -40, a3: -50 }),
  feintJab: P({ px: 8, py: 82, torso: 8, a1: -20, a2: 6, a3: 4, ff: 44, fl: 0, tw: 8 }),
  dashF: P({ px: 10, py: 81, torso: 10, a1: -34, a2: 6, a3: 10, ff: 40, bf: -30 }),
  dashB: P({ px: -12, py: 83, torso: -8, a1: -40, a2: 8, a3: 14, ff: 30, bf: -40 }),
  parried: P({ px: -14, py: 82, torso: -14, a1: 62, a2: 115, a3: 132, b1: 190, b2: 160, ff: 30, bf: -44 }),
  parriedLow: P({ px: -14, py: 80, torso: -10, a1: -80, a2: -110, a3: -135, b1: 190, b2: 160, ff: 30, bf: -44 }),
  clash: P({ px: -8, py: 82, torso: -6, a1: 20, a2: 50, a3: 60, ff: 32, bf: -38 }),
  hit: P({ px: -14, py: 80, torso: -20, head: -18, a1: -78, a2: -62, a3: -45, b1: 120, b2: 60, ff: 30, bf: -40 }),
  broken: P({ px: -8, py: 76, torso: -12, head: -10, a1: 40, a2: 90, a3: 120, b1: 200, b2: 170, ff: 26, bf: -46 }),
  ko: P({ px: -30, py: 22, torso: -82, head: -20, a1: -150, a2: -160, a3: -170, b1: 160, b2: 150, ff: 50, bf: -40 }),
  // esquives : passe sous la lame (corps plongé, main libre au sol, pointe vers le ventre) et volte (pivot, buste effacé, pointe en ligne)
  esqSotto: P({ px: 14, py: 46, torso: 34, head: -14, a1: -14, a2: -6, a3: 2, b1: -104, b2: -96, ff: 72, bf: -46, tw: -10 }),
  esqVolte: P({ px: -24, py: 78, torso: -22, head: 12, a1: -4, a2: 0, a3: 0, b1: 215, b2: 200, ff: 30, bf: -88, tw: -34 }),
  stumble: P({ px: -6, py: 74, torso: 16, head: -10, a1: -70, a2: -40, a3: -30, b1: 120, b2: 60, ff: 30, bf: -48, tw: -18 }),
  win: P({ px: 0, py: 86, torso: 0, a1: 55, a2: 100, a3: 92, b1: 200, b2: 190, ff: 22, bf: -26 }),
};
const ACTIVE_POSE = { ext: 'jabA', int: 'dgA', haute: 'cA', basse: 'bassaA' };
const lerpPose = (a, b, t) => { const o = {}; for (const k of KEYS) o[k] = lerp(a[k], b[k], t); return o; };
// angles ramenés dans un tour (sécurité : jamais de tour complet à rebours quand un état en interrompt un autre)
const normPose = p => { for (const k of ANG) if (Math.abs(p[k]) > 270) p[k] = wrap180(p[k]); return p; };
// articulations interpolées (rendu entre deux pas de simulation)
const lerpJ = (a, b, t) => { if (typeof b === 'number') return a + (b - a) * t; if (Array.isArray(b)) return b.map((v, i) => a[i] + (v - a[i]) * t); const o = {}; for (const k in b) o[k] = a[k] === undefined ? b[k] : lerpJ(a[k], b[k], t); return o; };
const addPose = (a, o) => { const r = Object.assign({}, a); for (const k in o) r[k] += o[k]; return r; };
// piste d'animation : [[temps, pose, courbe], …] — interpolation entre images clés
function sampleTrack(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) { const u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]); return lerpPose(a[1], b[1], (b[2] || ease)(u)); }
  }
  return keys[keys.length - 1][1];
}

// =============================== fente lourde : moulinet au-dessus de la tête, puis coup final ===============================
// La pointe décrit un tour complet sur un cône incliné de HEAVY_E au-dessus de la tête (la lame sort du plan du profil : bz),
// le poignet tourne et la main reste au-dessus du front : le fer adverse est chassé de la ligne haute. Puis la lame repasse
// par-dessus la tête et s'abat en avant pendant que la fente part. Les phases sont des fractions de wu/act/rec : mêmes durées
// relatives quel que soit le rythme du combattant ; la fenêtre de contact (wu → wu+act) ne commence qu'à la fin du moulinet.
const HEAVY_E = 22;
const HEAVY = {
  dip: P({ px: -5, py: 81, torso: 2, a1: -56, a2: 18, a3: 6, tw: -6, ro: 0 }),                                                  // compression : genoux fléchis, main ramenée (comme l'estocade)
  over: P({ px: -10, py: 80, torso: -8, head: 4, a1: 80, a2: 96, a3: 158, b1: 205, b2: 212, ff: 34, bf: -40, tw: -14, ro: 30 }),  // main au-dessus du front, lame vers l'arrière
  load: P({ px: -4, py: 79, torso: -4, head: 2, a1: 84, a2: 100, a3: 158, b1: 200, b2: 205, ff: 40, bf: -40, fl: 4, tw: -18, ro: 0 }), // fin du tour : appui sur la jambe arrière, pied avant prêt à partir
  end: P({ px: 40, py: 66, torso: 24, head: -4, a1: 4, a2: -2, a3: -6, b1: 210, b2: 200, ff: 104, bf: -26, tw: 16, ro: 0 }),      // coup porté, fente
  follow: P({ px: 41, py: 64, torso: 27, head: -6, a1: 0, a2: -6, a3: -14, b1: 212, b2: 202, ff: 104, bf: -26, tw: 18, ro: 0 }),  // le poids continue : la lame plonge un peu, le corps reste exposé
  rec: P({ px: 12, py: 77, torso: 10, head: -2, a1: -14, a2: 2, a3: 2, b1: 175, b2: 140, ff: 60, bf: -32, tw: 6 }),             // on se relève de la fente, le bras reste devant
};
function heavyPhases(m) { const wu = m.wu, tB = wu + m.act; return { d1: wu * .3, d2: wu * .62, tL: wu + m.act * .15, tS: wu + m.act * .8, tB, tH: tB + .08, tC: tB + m.rec }; }
function heavyPose(m, t) {
  const h = heavyPhases(m), H = HEAVY;
  if (t <= h.d1) return lerpPose(m.B, H.dip, ease(t / h.d1));                                   // 1. préparation
  if (t <= h.d2) { const u = (t - h.d1) / (h.d2 - h.d1), o = lerpPose(H.dip, H.over, ease(u)); // 2. montée de la lame : la pointe passe par le haut vers l'arrière
    o.a3 = lerp(H.dip.a3, 180 - HEAVY_E, ease(u)); return o; }
  if (t <= h.tL) { const u = (t - h.d2) / (h.tL - h.d2), g = lerp(u, ease(u), .45), ph = (180 + 360 * g) * DEG, E = HEAVY_E * DEG; // 3. rotation circulaire
    const o = lerpPose(H.over, H.load, ease(u)), cx = Math.cos(ph) * Math.cos(E), sz = Math.sin(ph) * Math.cos(E);
    o.a3 = Math.atan2(Math.sin(E), cx) / DEG; o.bz = Math.asin(clamp(sz, -1, 1)) / DEG; o.ro = 55 * Math.sin(ph);
    o.a1 += 5 * Math.sin(ph); o.a2 += 7 * Math.sin(ph + .6); o.px += 2 * Math.cos(ph); return o; }   // la main suit le tour (petit cercle du poignet)
  if (t <= h.tS) { const u = (t - h.tL) / (h.tS - h.tL); // 4. accélération finale : la lame repasse par-dessus la tête et s'abat
    const o = lerpPose(H.load, H.end, outC(u)), arm = ease(clamp(u * 1.1, 0, 1));
    for (const k of ['a1', 'a2', 'b1', 'b2']) o[k] = lerp(H.load[k], H.end[k], arm);
    o.a3 = 180 - lerp(HEAVY_E, 180 - H.end.a3, Math.pow(u, 1.7)); o.fl = H.load.fl * (1 - u); return o; }
  if (t <= h.tH) return lerpPose(H.end, H.follow, outC((t - h.tS) / (h.tH - h.tS)));             // 5. impact : le poids passe à travers
  const u = (t - h.tH) / Math.max(.01, h.tC - h.tH);                                            // 6. récupération et exposition
  return u < .55 ? lerpPose(H.follow, H.rec, inOut(u / .55)) : lerpPose(H.rec, POSES.g_ext, ease((u - .55) / .45));
}
const LOOKS = {
  player: { name: 'Vous', stock: '#d6c7a6', glove: '#5a3a22', coat: '#7a1a24', coat2: '#4a0f16', trim: '#d8b25e', hose: '#1d1416', boot: '#2b1a12', skin: '#d9a684', hair: '#2a1a10', hat: '#141014', plume: '#efe4c8', cape: '#161214', beard: 'pointed', blade: '#e9eff5' },
  debutant: { name: 'Bastiano', stock: '#8a7a5e', coat: '#7d5b2c', coat2: '#4f3a1e', trim: '#a8946a', hose: '#3b2f22', boot: '#2a1c12', skin: '#e3b596', hair: '#6b4a2a', hat: '#3a2a1a', plume: null, cape: null, beard: 'none', blade: '#d8dde2' },
  duelliste: { name: 'Ser Ottavio', stock: '#3c4a3e', coat: '#1d4a3e', coat2: '#11302a', trim: '#d0ad62', hose: '#1e2420', boot: '#2e1d12', skin: '#c99a78', hair: '#3e2818', hat: '#1c1a14', plume: '#b2302a', cape: '#3a1418', beard: 'moustache', blade: '#e4ebf2' },
  maitre: { name: 'Maestro Ferrante', stock: '#2c2c34', glove: '#1e1a18', coat: '#17171c', coat2: '#0c0c10', trim: '#c4c9d2', hose: '#111114', boot: '#1a1410', skin: '#c8957a', hair: '#9a948a', hat: '#0d0d10', plume: '#e8e4dc', cape: '#0c0c10', beard: 'full', blade: '#e9eff5' },
  training: { name: 'Mannequin', stock: '#6a6050', coat: '#5b5146', coat2: '#3d362f', trim: '#8f8370', hose: '#3b3329', boot: '#2a2119', skin: '#cfae8c', hair: '#4a3a2a', hat: null, plume: null, cape: null, beard: 'none', blade: '#cfd5da' },
};

// =============================== combattant ===============================
const FREE = ['idle', 'walk', 'guard'];
const REACT = ['hit', 'parried', 'broken', 'clash', 'recoil', 'beaten'];
class Fighter {
  constructor(isPlayer, look) { this.isPlayer = isPlayer; this.look = look; this.slow = 1; this.rapier = null; this.resetStats(); this.reset(isPlayer ? 300 : 660); }
  resetStats() { this.stats = { hits: 0, perfect: 0, blocks: 0, ripostes: 0, heavy: 0, feints: 0, whiffs: 0, attacks: 0 }; }
  reset(x) {
    this.x = x; this.vx = 0; this.kb = 0; this.dir = this.opp ? (this.opp.x > x ? 1 : -1) : (this.isPlayer ? 1 : -1);
    this.hp = 100; this.hpShow = 100; this.state = 'idle'; this.t = 0; this.dur = 0;
    this.pose = Object.assign({}, POSES.g_ext); this.walkPh = 0;
    this.guarding = false; this.gline = 'ext'; this.prevG = false; this.prevLine = 'ext'; this.pressT = -9; this.lastEdge = -9; this.perfectOk = false;
    this.move = null; this.buf = null; this.dashBuf = null; this.dash = null; this.trail = []; this.lastFeint = -9; this.flash = 0; this.moveId = 0;
    this.intent = { dx: 0, act: null, dash: 0, guard: false, gline: 'ext', holdAtk: false, rip: false, esq: false }; this.ripOffer = null;
    this.feet = { f: { x: x + this.dir * 36, lift: 0, st: null }, b: { x: x - this.dir * 34, lift: 0, st: null } };
    this.breath = 1; this.wounds = { bras: 0, jambe: 0, torse: 0 }; this.marks = []; this.disarmed = false; // blessures localisées (coups critiques) et taches de sang sur le costume
    this.J = null; this.prevJ = null; this.esq = null; this.esqBuf = null; this.ghosts = []; this.stance = null; this.cineTrack = null; this.hatOff = false; this.winT = null; this.parriedLow = false; this.lastBeatT = -9; this.lastBeatOkT = -9; this.lastBeatenT = -9; this.lastLiedT = -9; this.engaged = false;
  }
  get busy() { return !FREE.includes(this.state); }
  // blessé : vie sous 30 % (boiterie légère, garde plus basse) ; limp = jambe blessée ou faiblesse
  get weak() { return this.hp < 30 && this.state !== 'ko'; }
  get winded() { return CFG.breath && this.breath < BREATH_LOW; }
  spend(k) { if (CFG.breath) this.breath = Math.max(0, this.breath - (BREATH_COST[k] || 0)); }
  // acculé : moins de 45 px entre son dos et le bord du terrain
  get cornered() { return this.dir > 0 ? this.x - 50 < 45 : (W - 50) - this.x < 45; }
  get limp() { return Math.min(1, (this.wounds ? this.wounds.jambe : 0) + (this.weak ? .45 : 0)); }
  get attacking() { return this.state === 'attack'; }
  phase() { const m = this.move; if (!m) return null; return this.t < m.wu ? 'prep' : this.t <= m.wu + m.act ? 'exec' : 'rec'; }
  setState(s, dur = 0) { this.state = s; this.t = 0; this.dur = dur; if (s !== 'attack') this.move = null; if (s !== 'dash') this.dash = null; normPose(this.pose); }
  dist() { return Math.abs(this.opp.x - this.x); }

  // ---- possibilités d'action (annulations comprises) ----
  canAct() {
    const S = this.state;
    if (FREE.includes(S)) return true;
    if (S === 'feint') return this.t > .06;
    if (S === 'attack' && this.move.kind === 'beat' && this.move.beatOk) return this.t > this.move.wu + this.move.act; // battement réussi : l'attaque enchaîne aussitôt
    if (S === 'dash') return this.t > this.dash.dur * (this.dash.s > 0 ? .5 : .75); // entrée explosive, ou contre-attaque en fin de retraite
    return false;
  }
  canGuard() {
    const S = this.state;
    if (FREE.includes(S) || S === 'block') return true;
    if (S === 'feint') return this.t > .04;
    if (S === 'attack') { const m = this.move; return m.kind === 'pending' || (m.contact && this.t > m.wu + m.act + m.rec * .5); } // la garde annule une charge
    return false;
  }
  canDash(s) {
    const S = this.state;
    if (s < 0 && this.cornered) { if (this.isPlayer && typeof G !== 'undefined' && G.time - (this.cornerMsgT || -9) > 1.5) { this.cornerMsgT = G.time; G.say('Acculé !', [this.x, GROUND - 230], '#f0a48c', 18); } return false; } // dos au mur : pas de retraite rapide
    if (FREE.includes(S)) return true;
    if (S === 'beaten') return s < 0 && this.t > .08; // lame battue : rompre reste possible
    if (S === 'feint') return this.t > .06;
    if (S === 'attack' && s < 0) { const m = this.move, M = MOVES[m.kind]; if (m.whiffed && !M.light) return false; return this.t > m.wu + m.act + m.rec * .45; }
    return false;
  }

  // ---- démarrage des coups ----
  startMove(kind, t0 = 0) {
    const M = MOVES[kind], now = G.time, B = normPose(Object.assign({}, this.pose)), G0 = POSES.g_ext;
    const light = kind !== 'heavy' && kind !== 'riposte', fer = !!M.fer;
    // après une feinte, l'attaque part presque sans préparation ; après un battement réussi aussi ; après une garde réussie, la riposte manuelle est vive
    const quick = light && !fer && now - this.lastBeatT < BEAT_MEMORY ? BEAT_BONUS : light && now - this.lastFeint < FEINT_MEMORY ? FEINT_BONUS : light && now - (this.lastBlockT || -9) < .32 ? .7 : 1;
    if (quick === BEAT_BONUS) this.lastBeatT = -9;
    const W8 = this.wounds || {}, sl = (kind === 'riposte' ? 1 : this.slow * (1 + .08 * (W8.bras || 0)) * (this.winded ? 1.15 : 1) * (now - (this.dominatedT || -9) < 1.1 ? 1.2 : 1)) * (this.rapier ? this.rapier.speed : 1); // essoufflé : préparation 15 % plus lente
    if (!t0) this.spend(kind); // bras blessé : préparation plus lente (8 %)
    const m = { kind, id: ++this.moveId, start: now - t0, wu: Math.max(M.wu * quick * sl, t0 ? t0 + .05 : 0), act: M.act, rec: M.rec, lunge: M.lunge, back: M.back || 0, line: M.line, dmg: Math.round(M.dmg * (this.rapier ? this.rapier.power : 1)), lDone: 0, bDone: 0, done: false, recMul: 1 + .08 * (W8.torse || 0), contact: false, whiffed: false, quick: quick < 1, d0: this.opp && this.opp.x !== undefined ? this.dist() : 0 };
    if (G.weather === 'rain' && kind !== 'riposte') m.lunge *= 1.12; // pavés mouillés : la fente glisse plus loin
    m.rec *= m.recMul; // flanc touché : récupération plus lente (8 %)
    const wu = m.wu, tB = wu + m.act, tC = tB + m.rec;
    switch (kind) {
      // chaque coup : anticipation (armé, compression) → déclenchement → exécution (inchangée : mêmes images de contact) → poursuite → retour en garde
      case 'jab': m.keys = [[0, B], [wu * .55, POSES.jabC], [wu, POSES.jabW], [tB, POSES.jabA, outC], [tB + m.rec * .22, addPose(POSES.jabA, { torso: 3, head: -2, a3: -3, tw: 4 })], [tC - m.rec * .2, addPose(G0, { px: -3, py: -1, a3: 5 }), inOut], [tC, G0]]; break;
      case 'fente': m.keys = [[0, B], [wu * .5, POSES.fenteC], [wu, Object.assign({}, POSES.fenteW, { fl: 5 })], [tB, POSES.fenteA, outC], [tB + m.rec * .3, addPose(POSES.fenteA, { torso: 2, py: -1, tw: 2 })], [tB + m.rec * .68, POSES.fenteR, inOut], [tC, G0, inOut]]; break;
      case 'bassa': m.keys = [[0, B], [wu * .5, POSES.bassaC], [wu, POSES.bassaW], [tB, POSES.bassaA, outC], [tB + m.rec * .25, addPose(POSES.bassaA, { torso: 2, py: -1, a3: -3 })], [tC, G0, inOut]]; break;
      case 'degage': m.keys = [[0, B], [wu * .45, POSES.dgDip], [wu, POSES.dgW], [tB, POSES.dgA, outC], [tB + m.rec * .22, addPose(POSES.dgA, { torso: 2, a3: -3 })], [tC, G0, inOut]]; break;
      case 'circ': m.keys = [[0, B], [wu * .4, POSES.cR], [wu, POSES.cW], [tB, POSES.cA, outC], [tB + m.rec * .25, addPose(POSES.cA, { torso: 3, a3: -4, py: -1 })], [tC, G0, inOut]]; break;
      case 'tajo': m.keys = [[0, B], [wu, POSES.tajoW], [tB, POSES.tajoA, outC], [tB + m.rec * .25, addPose(POSES.tajoA, { a3: -8, a2: -4 })], [tC, G0, inOut]]; break;
      case 'griffe': m.keys = [[0, B], [wu, POSES.clawW], [tB, POSES.clawA, outC], [tC, G0, inOut]]; Snd.whirl(); break;
      case 'beat': m.keys = [[0, B], [wu, POSES.beatW], [tB, POSES.beatA, outC], [tB + m.rec * .35, addPose(POSES.beatA, { a3: 4, ro: 10 }), backOut], [tC, G0, inOut]]; this.stats.beats = (this.stats.beats || 0) + 1; break;
      case 'lie': if (this.engaged && !t0) { m.wu *= .85; } { const w2 = m.wu, b2 = w2 + m.act; m.keys = [[0, B], [w2 * .5, POSES.lieW], [w2, lerpPose(POSES.lieW, POSES.lieA, .25)], [b2, POSES.lieA, outC], [b2 + m.rec, G0, inOut]]; } this.stats.lies = (this.stats.lies || 0) + 1; Snd.tick(); break;
      case 'heavy': if (t0) this.spend('heavy'); m.B = B; m.fn = t => heavyPose(m, t); m.keys = [[0, B], [tC, G0]]; this.stats.heavy++; Snd.whirl(); break;
      case 'riposte': m.lunge = clamp(this.dist() - REACH.riposte + 45, 0, 170); m.keys = [[0, B], [wu, lerpPose(B, POSES.rA, .2)], [tB, POSES.rA, outC], [tB + m.rec * .3, addPose(POSES.rA, { torso: 2, a3: -3, tw: 4 })], [tC, G0, inOut]]; this.stats.ripostes++; Snd.riposte(); break;
      case 'compo': // menace dehors ; le changement de ligne est décidé au moment de la cavazione
        m.switchAt = .12 * quick * sl; m.wu = m.switchAt + .2; m.keys = [[0, B], [m.switchAt, POSES.cmT], [m.wu + 1, POSES.cmT]]; break;
    }
    if (kind !== 'riposte' && kind !== 'beat') this.stats.attacks++; this.stats['k_' + kind] = (this.stats['k_' + kind] || 0) + 1;
    if (t0 > 0 && kind !== 'heavy') this.spend(kind);
    if (t0 > 0) { // la préparation a déjà commencé pendant l'appui : on reprend depuis la pose actuelle
      m.keys = [[t0, B]].concat(m.keys.slice(1).filter(k => k[0] > t0 + .01));
      if (kind === 'compo') m.switchAt = Math.max(m.switchAt, t0);
    }
    this.buf = null; this.guarding = false; this.setState('attack'); this.move = m; this.t = t0;
    this.lastAttack = { kind, t: now };
  }
  // l'attaque composée : la pointe passe sous la lame et conclut dans la ligne que la garde adverse laisse ouverte
  doSwitch() {
    const m = this.move, d = this.opp; m.switched = true;
    m.line = d.guarding || d.state === 'guard' ? OPEN[d.gline] : (d.gline === 'int' ? 'ext' : 'int');
    const t = this.t; m.wu = t + .2; const tB = m.wu + m.act, tC = tB + m.rec;
    m.keys = [[t, Object.assign({}, this.pose)], [t + .1, POSES.cmDip], [m.wu, POSES.cmW], [tB, POSES[ACTIVE_POSE[m.line]], outC], [tC, POSES.g_ext]];
  }
  toCompo() { // Attaque puis Feinte pendant la préparation d'une estocade
    const m = this.move; m.kind = 'compo'; m.dmg = Math.round(MOVES.compo.dmg * (this.rapier ? this.rapier.power : 1)); m.lunge = MOVES.compo.lunge; m.rec = MOVES.compo.rec; this.doSwitch();
  }
  // Attaque appuyée : la préparation commence tout de suite ; relâchée tôt → le coup choisi, maintenue → fente lourde
  startPending(want) {
    const B = normPose(Object.assign({}, this.pose)), M = MOVES.heavy, sl = this.slow * (this.rapier ? this.rapier.speed : 1);
    this.buf = null; this.guarding = false; this.setState('attack');
    // jusqu'à 0,12 s : la même préparation que l'estocade (un appui bref reste une estocade) ; au-delà : la montée de lame de la fente lourde
    const hm = { wu: Math.max(M.wu * sl, HOLD_HEAVY + .05), act: M.act, rec: M.rec, B: POSES.jabW }, pk = [[0, B], [.12, POSES.jabW]];
    this.move = { kind: 'pending', want, id: ++this.moveId, start: G.time, wu: 99, act: 0, rec: 0, lunge: 0, back: 0, dmg: 0, keys: pk, fn: t => t <= .12 ? sampleTrack(pk, t) : heavyPose(hm, t), done: true };
  }
  tryRiposte() {
    const o = this.ripOffer, now = G.time; if (!o || now > o.end || this.state === 'ko' || this.state === 'hit') return false;
    const el = now - o.t0, perfect = el >= RIP_PERFECT[0] && el <= RIP_PERFECT[1]; this.ripOffer = null;
    this.guarding = false; this.startMove('riposte'); this.move.dmg = Math.round((perfect ? RIP_DMG_PERFECT : RIP_DMG) * (this.rapier ? this.rapier.power : 1)); this.move.perfect = perfect;
    if (perfect) { this.stats.ripPerfect = (this.stats.ripPerfect || 0) + 1; G.say('Riposte parfaite !', [this.x, GROUND - 236], '#ffd76a', 24); G.slowT = Math.max(G.slowT, .18); G.zoom = Math.max(G.zoom, .05); Snd.ding(); }
    else G.say(el < RIP_PERFECT[0] ? 'Riposte (trop tôt)' : 'Riposte (tard)', [this.x, GROUND - 236], '#e6dcc4', 18);
    G.event('riposte', { a: this, perfect, el }); return true;
  }
  feint() { this.spend('feint'); this.guarding = false; this.setState('feint', FEINT_DUR); this.lastFeint = G.time; this.stats.feints++; Snd.stamp(); this.feintId = (this.feintId || 0) + 1; }
  startDash(s) {
    const fwd = s > 0; this.guarding = false; this.spend('dash');
    this.stats[fwd ? 'dashF' : 'dashB'] = (this.stats[fwd ? 'dashF' : 'dashB'] || 0) + 1; this.setState('dash', fwd ? .25 : .27); this.dash = { s, dist: (fwd ? 82 : 96) * (1 - .12 * (this.wounds.jambe || 0)) * (this.isPlayer && Run.has('pied') ? 1.3 : 1) * (G.weather === 'rain' ? 1.12 : 1) * (this.isPlayer && typeof curHero === 'function' ? curHero().dash : 1), dur: fwd ? .2 : .22, done: 0 }; Snd.dash();
  }

  // ---- esquive (bouton Esquive) : passe sous la lame contre les attaques hautes et en ligne, volte contre la fente et l'estocade basse ----
  canEsq() {
    const S = this.state;
    if (FREE.includes(S) || S === 'block') return true;
    if (S === 'feint') return this.t > .06;
    if (S === 'attack') return this.move.kind === 'pending';
    if (S === 'dash') return this.t > this.dash.dur * .6;
    return false;
  }
  startEsquive() {
    const o = this.opp, om = o.state === 'attack' && o.move && o.move.kind !== 'pending' ? o.move : null;
    const kind = om && (['fente', 'bassa'].includes(om.kind) || om.line === 'basse') ? 'volte' : 'sotto';
    this.spend('esq'); this.guarding = false; this.setState('esquive', ESQ.dur); this.esq = { kind, dodged: null, perfect: false, moved: 0 };
    this.stats.esq = (this.stats.esq || 0) + 1; this.ghosts = []; Snd.dash();
    if (typeof Cloth !== 'undefined') Cloth.kick(this, kind === 'sotto' ? -this.dir * 240 : this.dir * 160, kind === 'sotto' ? -300 : -200);
  }

  // geste joué d'un bloc : piste de poses [[t, pose, easing?], …]
  playTrack(track, dur) { this.guarding = false; this.setState('cine', dur); this.cineTrack = track; }

  // ---- mise à jour ----
  update(dt) {
    const it = this.intent, o = this.opp, now = G.time;
    this.t += dt; this.flash = Math.max(0, this.flash - dt);
    if (this.state !== 'ko') this.dir = o.x > this.x ? 1 : -1;
    // fronts de garde : appui, relâchement ou changement de ligne. Une parade parfaite n'est possible que si
    // l'appui (ou le changement de ligne) qui a formé la garde suit le précédent de plus de CFG.mash secondes.
    const g = !!it.guard;
    if (g !== this.prevG) {
      if (g) { this.perfectOk = now - this.lastEdge > CFG.mash; this.pressT = now; }
      this.lastEdge = now;
    }
    this.prevG = g;
    // tampons d'entrée (0,16 s) : une commande donnée juste avant la fin d'une action n'est pas perdue
    if (it.act) { this.buf = { act: it.act, t: now }; it.act = null; }
    if (this.buf && now - this.buf.t > .16) this.buf = null;
    if (it.dash) { this.dashBuf = { s: it.dash, t: now }; it.dash = 0; }
    if (it.esq) { this.esqBuf = { t: now }; it.esq = false; }
    if (this.esqBuf && now - this.esqBuf.t > .14) this.esqBuf = null;
    if (this.dashBuf && now - this.dashBuf.t > .14) this.dashBuf = null;
    if (this.buf && this.buf.act === 'feint' && this.state === 'attack' && this.move.kind === 'pending') { this.startMove('jab', this.t); this.buf = { act: 'feint', t: now }; }
    if (this.buf && this.buf.act === 'feint' && this.state === 'attack' && this.move.kind === 'jab' && this.t < this.move.wu - .02) { this.toCompo(); this.buf = null; }
    // bouton Riposte : seulement pendant l'offre qui suit une parade parfaite
    if (this.ripOffer && now > this.ripOffer.end) this.ripOffer = null;
    if (it.rip) { it.rip = false; this.tryRiposte(); }
    if (this.buf && this.canAct()) { const a = this.buf.act; this.buf = null; if (a === 'feint') this.feint(); else if (a.startsWith('p:')) { if (it.holdAtk) this.startPending(a.slice(2)); else this.startMove(a.slice(2)); } else this.startMove(a); }
    else if (this.esqBuf && this.canEsq()) { this.startEsquive(); this.esqBuf = null; this.buf = null; }
    else if (this.dashBuf && this.canDash(this.dashBuf.s)) { this.startDash(this.dashBuf.s); this.dashBuf = null; }
    // garde
    if (g && this.state !== 'guard' && this.state !== 'block' && this.canGuard()) this.setState('guard');
    else if (!g && this.state === 'guard') this.setState('idle');
    this.guarding = g && (this.state === 'guard' || this.state === 'block');
    // déplacement libre
    let tv = 0;
    if (this.state === 'idle' || this.state === 'walk') {
      tv = it.dx * (it.dx * this.dir > 0 ? 180 : 165) * (1 - .12 * (this.wounds.jambe || 0) - (this.weak ? .04 : 0)); // jambe blessée : pas plus courts
      if (Math.abs(tv) > 4 && this.state === 'idle') this.setState('walk'); else if (Math.abs(tv) <= 4 && this.state === 'walk') this.setState('idle');
    }
    if (tv * this.dir < 0 && this.cornered) tv *= .3; // dos au mur : on ne recule presque plus
    if (this.engaged && tv * this.dir > 0) tv *= .12; // fer engagé : pousser presse la lame adverse, on n'avance presque pas
    // souffle : se reprend à distance et en garde, presque pas pendant l'effort
    if (CFG.breath && this.state !== 'ko') { const far = this.dist() > REACH.jab + 40, S0 = this.state, r = S0 === 'attack' || S0 === 'dash' ? .25 : S0 === 'guard' || S0 === 'block' ? 1.2 : FREE.includes(S0) ? (far ? 1.6 : 1) : .6; this.breath = Math.min(1, this.breath + BREATH_REGEN * r * dt * (this.weak ? .8 : 1)); }
    this.vx = lerp(this.vx, tv, 1 - Math.exp(-16 * dt));
    if (this.state === 'idle' || this.state === 'walk') this.x += this.vx * dt;
    this.x += this.kb * dt; this.kb *= Math.exp(-9 * dt); if (Math.abs(this.kb) < 2) this.kb = 0;
    // états temporisés
    const m = this.move;
    switch (this.state) {
      case 'attack': {
        if (m.kind === 'pending') { if (!it.holdAtk) this.startMove(m.want, this.t); else if (this.t >= HOLD_HEAVY) this.startMove('heavy', this.t); break; }
        if (m.kind === 'compo' && !m.switched && this.t >= m.switchAt) this.doSwitch();
        const tA = m.wu, tB = tA + m.act, tC = tB + m.rec;
        if (this.t >= tA && this.t - dt < tA) Snd.swish(m.kind === 'heavy' || m.kind === 'fente' ? 1.3 : 1);
        if (m.lunge && this.t > tA * .5 && this.t < tB + .03) {
          const p = clamp((this.t - tA * .5) / (tB + .03 - tA * .5), 0, 1), tg = m.lunge * outC(p);
          const step = Math.min(tg - m.lDone, Math.max(0, this.dist() - LUNGE_STOP)); this.x += this.dir * step; m.lDone = tg;
        }
        if (m.back && this.t > tB + m.rec * .45) { const p = clamp((this.t - tB - m.rec * .45) / (m.rec * .55), 0, 1), tg = m.lDone * m.back * ease(p); this.x -= this.dir * (tg - m.bDone); m.bDone = tg; }
        if ((m.kind === 'fente' || m.kind === 'heavy' || m.kind === 'bassa') && !m.retreat && this.t > tB + .06 && this.t < tB + m.rec * .6 && it.dx * this.dir < 0) { // reprise de garde en arrière : on se remet en garde en reculant, plus vite
          m.retreat = true; const cut = m.rec * .25; m.rec -= cut; m.keys[m.keys.length - 1][0] -= cut; m.back = Math.max(m.back || 0, .6); if (this.isPlayer) G.say('Reprise en arrière', [this.x, GROUND - 230], '#cfe4ff', 15); }
        if (this.t > tB + .05 && !m.done) { m.done = true; m.whiffed = true; this.spend('whiff'); const wh = MOVES[m.kind].whiff || 0; if (wh) { m.rec += wh; m.keys[m.keys.length - 1][0] += wh; } G.onWhiff(this); }
        if (this.t >= tA + m.act + m.rec) this.setState(it.guard ? 'guard' : 'idle');
        break;
      }
      case 'dash': {
        const D = this.dash, u = clamp(this.t / D.dur, 0, 1), tg = D.dist * outC(u);
        let step = tg - D.done; D.done = tg; if (D.s > 0) step = Math.min(step, Math.max(0, this.dist() - MINDIST));
        this.x += this.dir * D.s * step;
        if (this.t >= this.dur) this.setState(it.guard ? 'guard' : 'idle');
        break;
      }
      case 'esquive': { // le corps sort de la ligne : en avant sous la lame, ou un pas de côté en arrière
        const E = this.esq, u = clamp((this.t - ESQ.a) / (ESQ.b - ESQ.a), 0, 1), tg = (E.kind === 'sotto' ? 16 : -22) * outC(u);
        let step = tg - E.moved; E.moved = tg; if (step > 0) step = Math.min(step, Math.max(0, this.dist() - MINDIST)); this.x += this.dir * step;
        if (this.t >= this.dur) { if (E.dodged) this.setState(it.guard ? 'guard' : 'idle'); else { this.spend('whiff'); this.setState('stumble', ESQ.fail); if (this.isPlayer) G.say('Esquive dans le vide', [this.x, GROUND - 230], '#f0a48c', 18); G.event('esqWhiff', { a: this }); } }
        break;
      }
      case 'stumble': if (this.t >= this.dur) this.setState(it.guard ? 'guard' : 'idle'); break;
      case 'cine': if (this.t >= this.dur) this.setState('idle'); break; // geste de mise en scène (salut, révérence…)
      case 'feint': case 'hit': case 'parried': case 'clash': case 'recoil': case 'broken': case 'block': case 'beaten':
        if (this.t >= this.dur) this.setState(it.guard ? 'guard' : 'idle');
        break;
    }
    this.pose = this.animate(dt);
    this.updateFeet(dt);
    this.prevJ = this.J; this.J = this.joints();
    if (typeof Cloth !== 'undefined') Cloth.step(this, dt);
    if (this.state === 'esquive' && this.t <= ESQ.b + .06) { if (!this.ghosts.length || G.time - this.ghosts[0].t >= 1 / 30) { this.ghosts.unshift({ J: this.J, t: G.time }); if (this.ghosts.length > 3) this.ghosts.pop(); } } // silhouettes fantômes
    this.trail.unshift([this.J.wr[0], this.J.wr[1], this.J.tip[0], this.J.tip[1]]); if (this.trail.length > 9) this.trail.pop();
  }

  // ---- animation : pose cible selon l'état, puis amortissement vers la cible ----
  guardPose(line) { return POSES['g_' + line]; }
  // garde qui suit la lame adverse : la hauteur de sa pointe fait glisser la garde de Terza vers Prima (haut) ou Bassa (bas),
  // vers Quarta contre une attaque par le dedans ; la lame s'oriente vers la pointe qui arrive
  trackGuard() {
    const o = this.opp, oj = o.J, m = o.move, chestY = GROUND - 140;
    const atk = o.state === 'attack' && m && m.kind !== 'pending';
    const T = oj ? oj.tip : null, uTip = T ? clamp((chestY - T[1]) / 70, -1.2, 1.2) : 0, LH = { haute: 1, ext: 0, int: 0, basse: -1 };
    const ph = atk ? o.phase() : null, uLine = atk && m.line ? (m.kind === 'heavy' ? 1 : LH[m.line]) : 0;
    const u = !atk ? clamp(uTip, -.4, .4) : ph === 'prep' ? lerp(uLine, uTip, .35) : lerp(uLine, uTip, .6); // pendant la préparation on lit la ligne visée, à l'exécution on suit la pointe
    let base = u >= 0 ? lerpPose(POSES.g_ext, POSES.g_haute, ease(clamp(u, 0, 1))) : lerpPose(POSES.g_ext, POSES.g_basse, ease(clamp(-u, 0, 1)));
    if (atk && m.line === 'int') base = lerpPose(base, POSES.g_int, .7);
    this.gline = u > .5 ? 'haute' : u < -.5 ? 'basse' : atk && m.line === 'int' ? 'int' : 'ext';
    if (T && atk) { const J = this.joints(base, false), ang = Math.atan2(-(T[1] - J.wr[1]), (T[0] - J.wr[0]) * this.dir) / DEG; base = Object.assign({}, base, { a3: base.a3 + clamp((ang - base.a3) * .3, -22, 22) }); }
    return base;
  }
  threatLine() { const o = this.opp, m = o.move; return o.state === 'attack' && m && m.line && m.kind !== 'pending' && m.kind !== 'heavy' ? m.line : 'ext'; } // la lame va au-devant de la menace
  // réactions : poses qui évoluent dans le temps (choc → déséquilibre → rattrapage → retour en garde), u = t / durée
  reactPose(S, t) {
    const u = this.dur ? clamp(t / this.dur, 0, 1) : 1, G0 = POSES.g_ext, back = (p, from) => u < from ? p : lerpPose(p, G0, ease((u - from) / (1 - from)));
    const damp = (f, w) => Math.sin(t * f) * Math.exp(-t * w);
    switch (S) {
      case 'parried': { // déséquilibre après une parade parfaite : lame chassée, bras jetés, poids rejeté en arrière, pied avant décollé
        const P0 = this.parriedLow ? POSES.parriedLow : POSES.parried, k0 = clamp(t / .1, 0, 1);
        const p = addPose(P0, { torso: -6 * (1 - k0) + 5 * damp(14, 4), px: -4 * Math.sin(Math.PI * clamp(t / .3, 0, 1)), py: -4 * Math.sin(Math.PI * clamp(t / .35, 0, 1)), head: 6 * damp(12, 6), a3: 10 * damp(22, 7), b1: 10 * Math.sin(Math.PI * clamp(t / .3, 0, 1)), tw: -16, fl: 9 * Math.sin(Math.PI * clamp(t / .28, 0, 1)) });
        return back(p, .62);
      }
      case 'broken': { // garde brisée : la lame est rabattue, les genoux plient, on titube en arrière
        const knees = Math.sin(Math.PI * clamp(t / .42, 0, 1));
        const p = addPose(POSES.broken, { py: -8 * knees, torso: -4 * knees + 4 * damp(16, 3.5), head: -8 * Math.exp(-t * 8), a3: 14 * damp(26, 6), a1: 6 * damp(18, 5), tw: -18, bl: 6 * Math.sin(Math.PI * clamp((t - .1) / .22, 0, 1)) });
        return back(p, .66);
      }
      case 'hit': { const Z = this.hitZone, zo = Z === 'bras' ? { a1: -16, a2: -34, a3: -46, tw: -8 } : Z === 'jambe' ? { py: -13, torso: 16, head: -2, ff: -8 } : Z === 'torse' ? { torso: 22, head: 6 } : {}; // la réaction suit la zone touchée
        const p0 = addPose(POSES.hit, zo); if (Z === 'torse') { p0.b1 = -40; p0.b2 = 30; } const p = addPose(p0, { torso: -6 * Math.exp(-t * 14), head: -6 * Math.exp(-t * 10), py: -3 * Math.sin(Math.PI * clamp(t / .3, 0, 1)), tw: -10 }); return back(p, .6); }
      case 'clash': case 'recoil': { const p = addPose(POSES.clash, { a3: 9 * damp(48, 9), a2: 3 * damp(48, 9), px: -3 * Math.sin(Math.PI * clamp(t / .2, 0, 1)), tw: -6 }); return back(p, .55); }
      case 'beaten': { const p = addPose(POSES.beaten, { a3: 10 * damp(40, 8), torso: -3 * Math.exp(-t * 10), tw: -8 }); return back(p, .6); }
    }
    return null;
  }
  animate(dt) {
    const S = this.state, t = this.t, m = this.move; let tgt, k = 18;
    const tm = G.time + (this.isPlayer ? 0 : 1.7);
    // vie au repos : respiration, petits transferts de poids, pointe qui cherche (pas des pieds : voir updateFeet)
    const life = { a1: Math.sin(tm * 1.7) * 2, a3: Math.sin(tm * 3.1) * 3 + Math.sin(tm * 1.3) * 2, px: Math.sin(tm * 1.1) * 2.5, py: Math.sin(tm * 2.2) * .8, torso: Math.sin(tm * 1.6) * .8, tw: Math.sin(tm * .9) * 2 };
    const close = clamp((215 - this.dist()) / 100, 0, 1); // de près, la pointe se relève et la main recule : les lames s'engagent
    const F = this.feet, bob = F ? (F.f.lift + F.b.lift) * .35 : 0; // un pas : léger fléchissement pendant que le pied voyage
    switch (S) {
      case 'cine': tgt = sampleTrack(this.cineTrack, t); k = 14; break;
      case 'idle': if (!this.stance && G.state === 'fight' && this.idleStyle) { const ph = (G.time + (this.isPlayer ? 0 : 2.7)) % 5.5; if (ph < 1) { const s = Math.sin(Math.PI * ph), IS = this.idleStyle; // un tic de caractère, toutes les 5 s environ
          const o = IS === 'colosse' ? { tw: 10 * s, py: -2 * s, torso: -3 * s, b1: 12 * s } : IS === 'vif' ? { a3: 40 * Math.sin(Math.PI * 2 * ph) * s, ro: 30 * s } : IS === 'gascon' ? { b1: 60 * s, b2: 80 * s, head: -4 * s } : IS === 'ombre' ? { head: -6 * s, a3: -6 * s } : IS === 'diestro' ? { a1: 4 * s, torso: -2 * s } : { head: 5 * s, py: 1.5 * s, torso: 2 * s };
          tgt = addPose(this.arch === 'destreza' ? POSES.g_line : POSES.g_ext, Object.assign({}, life, o)); k = 10; break; } }
        if (this.stance && POSES[this.stance]) { tgt = addPose(POSES[this.stance], { py: life.py, torso: life.torso, a3: life.a3 * .3, tw: life.tw * .5 }); k = 8; break; }
        tgt = addPose(this.arch === 'destreza' ? POSES.g_line : POSES.g_ext, { ...life, a3: life.a3 + close * 26, a1: life.a1 - close * 10, py: life.py - bob }); k = 12; break;
      case 'walk': if (this.stance && POSES[this.stance]) { tgt = addPose(POSES[this.stance], { py: -1.5 - bob, torso: 2 }); k = 10; break; } { // pas d'approche : buste en avant, pointe qui menace ; pas de retraite : buste en arrière, lame qui couvre plus haut
        const fw = this.vx * this.dir > 0;
        tgt = addPose(this.arch === 'destreza' ? POSES.g_line : POSES.g_ext, fw ? { a3: life.a3 * .5 + close * 26 - 3, py: -1.5 - bob, torso: 4, px: 3, tw: 3 } : { a3: life.a3 * .5 + close * 26 + 6, a1: 4, py: -2 - bob, torso: -4, px: -4, head: 2, tw: -4 }); k = 14; break;
      }
      case 'guard': { const gp = this.trackGuard(); tgt = addPose(gp, { a3: life.a3 * .4 + (this.gline === 'ext' ? close * 18 : 0), px: life.px * .4, py: -bob, tw: -4 }); k = this.opp.state === 'attack' ? 42 : 30; break; }
      case 'block': { const sh = Math.exp(-t * 22); tgt = addPose(this.trackGuard(), { px: -10, torso: -7, a3: 8 + 12 * sh, a2: 4 * sh, py: -3 * Math.sin(Math.PI * clamp(t / Math.max(.05, this.dur), 0, 1)), tw: -6 }); k = 34; break; } // le choc remonte dans le poignet, les genoux l'absorbent
      case 'dash': { // compression → détente → réception amortie
        const D = this.dash, u = clamp(t / D.dur, 0, 1), fwd = D.s > 0, P0 = fwd ? POSES.dashF : POSES.dashB;
        const pre = 1 - clamp(u / .18, 0, 1), land = clamp((u - .7) / .3, 0, 1) * (1 - clamp((t - D.dur) / .06, 0, 1));
        tgt = addPose(P0, fwd ? { py: -3 * pre - 3 * Math.sin(Math.PI * land), fl: 8 * Math.sin(Math.PI * clamp((u - .1) / .6, 0, 1)), a1: 4 * clamp(u / .4, 0, 1), tw: 6 } : { py: -3 * pre - 3 * Math.sin(Math.PI * land), bl: 7 * Math.sin(Math.PI * clamp((u - .05) / .55, 0, 1)), a3: 6, tw: -8 });
        k = 26; break;
      }
      case 'feint': { const u = t / this.dur; tgt = u < .4 ? lerpPose(POSES.g_ext, POSES.feintJab, ease(u / .4)) : lerpPose(POSES.feintJab, POSES.g_ext, ease((u - .4) / .6)); tgt = Object.assign({}, tgt, { fl: u < .3 ? Math.sin(u / .3 * Math.PI) * 9 : 0, py: tgt.py - (u > .3 && u < .6 ? 2 * Math.sin((u - .3) / .3 * Math.PI) : 0) }); k = 34; break; } // appel du pied, puis les genoux absorbent
      case 'attack': {
        tgt = m.fn ? m.fn(t) : sampleTrack(m.keys, t); const ph = this.phase();
        if (m.fn && t > (m.kind === 'pending' ? .12 : heavyPhases(m).d1)) k = t < m.wu + m.act + .08 ? 120 : 30; // moulinet : suivi serré de la trajectoire
        else k = ph === 'exec' || (ph === 'rec' && t < m.wu + m.act + .05) ? 85 : ph === 'prep' ? 34 : 16;
        break;
      }
      case 'esquive': { const E = this.esq, P0 = E.kind === 'sotto' ? POSES.esqSotto : POSES.esqVolte, end = ESQ.b + .08;
        tgt = t < ESQ.a ? addPose(POSES.g_ext, { py: -5, torso: -3, tw: -4 }) : t < end ? P0 : lerpPose(P0, POSES.g_ext, ease(clamp((t - end) / (this.dur - end), 0, 1)));
        k = t < ESQ.b ? 46 : 14; break; }
      case 'stumble': { const w = Math.sin(Math.PI * clamp(t / this.dur, 0, 1)); tgt = addPose(POSES.stumble, { py: -4 * w, torso: 3 * Math.sin(t * 18) * (1 - t / this.dur), bl: 6 * w }); k = 20; break; }
      case 'parried': case 'broken': case 'hit': case 'clash': case 'recoil': case 'beaten': tgt = this.reactPose(S, t); k = S === 'hit' ? 30 : S === 'beaten' ? 40 : 26; break;
      case 'ko': { // coup de grâce : la main lâche la rapière, l'autre se porte à la blessure, on tombe à genoux, puis au sol
        const kneel = P({ px: -8, py: 50, torso: 16, head: -16, a1: -98, a2: -104, a3: -110, b1: -48, b2: 14, ff: 30, bf: -36, tw: -10 });
        if (this.koStyle === 'genou') { tgt = addPose(kneel, { head: -24 - 4 * Math.min(1, t), torso: 22, py: -4 }); k = 10; break; } // jambe touchée : il reste à genoux, tête basse
        if (this.koStyle === 'arriere') { const st = P({ px: -26, py: 74, torso: -26, head: -20, a1: -110, a2: -120, a3: -140, b1: 170, b2: 150, ff: 40, bf: -60, tw: -16 }); // il recule en titubant, puis tombe à la renverse
          tgt = t < .45 ? st : lerpPose(st, POSES.ko, ease((t - .45) / .5)); k = t < .45 ? 14 : 9; break; }
        tgt = t < .7 ? kneel : lerpPose(kneel, POSES.ko, ease((t - .7) / .6)); k = t < .7 ? 12 : 8; break; }
      case 'win': tgt = POSES.win; k = 6; break;
      default: tgt = POSES.g_ext;
    }
    // blessures : pointe plus basse (bras), buste plié et main libre au flanc (torse), poids hors de la jambe blessée et boiterie (jambe, faiblesse)
    if (this.wounds && S !== 'ko' && S !== 'win') { const Wd = this.wounds, lm = this.limp, free = FREE.includes(S);
      const o2 = {}; if (Wd.bras && free) { o2.a1 = -6 * Wd.bras; o2.a3 = -9 * Wd.bras; }
      if (Wd.torse && free) { o2.torso = 5 * Wd.torse; o2.head = -3 * Wd.torse; o2.b1 = (-46 - tgt.b1) * .8 * Wd.torse; o2.b2 = (12 - tgt.b2) * .8 * Wd.torse; }
      if (lm && free) { o2.px = (o2.px || 0) - 3 * lm; o2.py = -1.2 * lm - (F ? F.b.lift * 1.3 * lm : 0); o2.torso = (o2.torso || 0) + (F ? F.b.lift * .5 * lm : 0); }
      if (this.winded && free) { o2.py = (o2.py || 0) + Math.sin(G.time * 5) * 1.6 - 1; o2.torso = (o2.torso || 0) + 3; o2.a3 = (o2.a3 || 0) - 5; } // essoufflé : souffle court, pointe qui tombe
      if (this.weak && free) { o2.a3 = (o2.a3 || 0) - 4; o2.py = (o2.py || 0) + Math.sin(G.time * 3.4) * 1.2 - .8; o2.torso = (o2.torso || 0) + 2; } // souffle court
      tgt = addPose(tgt, o2); }
    // geste de parade ample : la lame chasse le fer adverse en un arc, puis revient
    if (this.sweep) { const u = (G.time - this.sweep.t0) / this.sweep.dur; if (u >= 1 || !['guard', 'block', 'idle', 'walk'].includes(S)) this.sweep = null; else { const s = Math.sin(Math.PI * u) * this.sweep.amp * this.sweep.dir; tgt = addPose(tgt, { a3: s, a2: s * .5, a1: s * .25, px: -Math.abs(s) * .12, torso: -Math.abs(s) * .08, tw: -Math.abs(s) * .1 }); k = Math.max(k, 48); } }
    const o = {}, a = 1 - Math.exp(-k * dt);
    for (const key of KEYS) o[key] = lerp(this.pose[key], tgt[key], a);
    // réactions : la vitesse angulaire du bras et de la lame est bornée (pas de rotation instantanée quand un choc interrompt un geste)
    if (REACT.includes(S)) for (const key of ['a1', 'a2', 'a3']) { const mx = 1500 * dt, dv = o[key] - this.pose[key]; if (Math.abs(dv) > mx) o[key] = this.pose[key] + Math.sign(dv) * mx; }
    // limites articulaires : le coude ne se retourne pas (flexion bornée) ; hors attaque, le poignet non plus
    const el = o.a2 - o.a1; if (el < LIMITS.elbow[0]) o.a2 = o.a1 + LIMITS.elbow[0]; else if (el > LIMITS.elbow[1]) o.a2 = o.a1 + LIMITS.elbow[1];
    if (S !== 'attack') { const wr = o.a3 - o.a2; if (wr < LIMITS.wrist[0]) o.a3 = o.a2 + LIMITS.wrist[0]; else if (wr > LIMITS.wrist[1]) o.a3 = o.a2 + LIMITS.wrist[1]; }
    return o;
  }

  // ---- pieds : posés au sol, ils ne glissent pas ; un pied à la fois se déplace par un vrai pas ----
  updateFeet(dt) {
    const d = this.dir, p = this.pose, F = this.feet, S = this.state;
    const lead = S === 'walk' || S === 'idle' ? this.vx * .1 : 0;
    const des = { f: this.x + d * p.ff + lead, b: this.x + d * p.bf + lead };
    const lunging = S === 'attack' && this.t < this.move.wu + this.move.act + .06 && this.move.lunge > 30;
    for (const k of ['f', 'b']) {
      const ft = F[k];
      if (ft.st) { ft.st.u += dt / ft.st.dur; const u = Math.min(1, ft.st.u); ft.x = lerp(ft.st.from, des[k], ease(u)); ft.lift = Math.sin(Math.PI * u) * ft.st.h; if (u >= 1) { ft.st = null; ft.lift = 0; if (this.isPlayer || G.state !== 'menu') Snd.step(); } }
    }
    if (lunging) { F.f.st = null; F.f.x = lerp(F.f.x, des.f, 1 - Math.exp(-40 * dt)); F.f.lift = 0; }
    else if (S !== 'ko') {
      const order = this.vx * d >= 0 && S !== 'dash' || (S === 'dash' && this.dash.s > 0) ? ['f', 'b'] : ['b', 'f'];
      const thr = S === 'idle' ? 7 : S === 'dash' ? 6 : 11;
      for (const k of order) {
        const ft = F[k], other = F[k === 'f' ? 'b' : 'f'], gap = Math.abs(ft.x - des[k]);
        if (!ft.st && !other.st && gap > thr) ft.st = { from: ft.x, u: 0, dur: clamp(gap / 520, .07, .15), h: clamp(gap * .2, 2, 9) };
      }
    }
    // la jambe ne s'allonge pas au-delà de sa longueur : le pied planté est tiré (poussée de la jambe arrière)
    const gx = this.x + p.px * d, hy = GROUND - p.py + 4;
    for (const k of ['f', 'b']) {
      const ft = F[k], hx = gx + (k === 'f' ? 4 : -4) * d, dy = (GROUND - 4 - ft.lift - (k === 'f' ? p.fl : p.bl)) - hy;
      const max = Math.sqrt(Math.max(0, 88 * 88 - dy * dy)); if (Math.abs(ft.x - hx) > max) ft.x = hx + Math.sign(ft.x - hx) * max;
    }
    // le pied avant reste devant le pied arrière
    if ((F.f.x - F.b.x) * d < 14) { F.f.x = F.b.x + d * 14; }
  }

  // ---- cinématique directe : positions des articulations (coordonnées écran) ----
  joints(p = this.pose, useFeet = true) {
    const d = this.dir, gx = this.x + p.px * d, gy = GROUND - p.py;
    const v = (ang, len) => [Math.cos(ang * DEG) * len * d, -Math.sin(ang * DEG) * len];
    const tor = p.torso * DEG; const neck = [gx + Math.sin(tor) * 58 * d, gy - Math.cos(tor) * 58];
    const head = [neck[0] + Math.sin(tor + p.head * DEG) * 16 * d, neck[1] - Math.cos(tor + p.head * DEG) * 16];
    const sh = [neck[0] + d * 3, neck[1] + 6], bsh = [neck[0] - d * 5, neck[1] + 8];
    const e1 = v(p.a1, 31), el = [sh[0] + e1[0], sh[1] + e1[1]]; const e2 = v(p.a2, 28), wr = [el[0] + e2[0], el[1] + e2[1]];
    const e3 = v(p.a3, (this.rapier ? this.rapier.len : 112) * Math.cos((p.bz || 0) * DEG)), tip = [wr[0] + e3[0], wr[1] + e3[1]];
    const f1 = v(p.b1, 30), bel = [bsh[0] + f1[0], bsh[1] + f1[1]]; const f2 = v(p.b2, 26), bwr = [bel[0] + f2[0], bel[1] + f2[1]];
    const F = useFeet && this.feet;
    const leg = (fx, lift, side, ft) => { // IK à deux os, genou vers l'avant
      const hip = [gx + side * d * 4, gy + 4], foot = [ft ? ft.x : this.x + fx * d, GROUND - 4 - lift - (ft ? ft.lift : 0)];
      const dx = foot[0] - hip[0], dy = foot[1] - hip[1]; const L = Math.max(1e-3, Math.hypot(dx, dy)); const S = 45; const Lc = Math.min(L, 2 * S - .5);
      const mx = hip[0] + dx / L * Lc / 2, my = hip[1] + dy / L * Lc / 2, h = Math.sqrt(Math.max(0, S * S - Lc * Lc / 4));
      let nx = -dy / L, ny = dx / L; if (nx * d < 0) { nx = -nx; ny = -ny; }
      return { hip, knee: [mx + nx * h, my + ny * h], foot: [hip[0] + dx / L * Lc, hip[1] + dy / L * Lc] };
    };
    return { gx, gy, neck, head, sh, el, wr, tip, bsh, bel, bwr, fl: leg(p.ff, p.fl, 1, F && F.f), bl: leg(p.bf, p.bl, -1, F && F.b) };
  }
  // zones de touche : tronc, tête, cuisse et jambe avant (capsules)
  hurt() { const j = this.J || this.joints(); return [[[j.gx, j.gy + 6], j.neck, 18], [j.head, j.head, 13], [j.fl.hip, j.fl.knee, 10], [j.fl.knee, j.fl.foot, 8]]; }
}

// portée de chaque coup (distance entre les deux combattants à laquelle la pointe atteint le tronc adverse)
const REACH = {};
function computeReach() {
  const f = new Fighter(true, LOOKS.player); f.x = 0; f.dir = 1; f.opp = { x: 1000 };
  for (const [k, pose] of [['jab', 'jabA'], ['fente', 'fenteA'], ['bassa', 'bassaA'], ['degage', 'dgA'], ['circ', 'cA'], ['heavy', 'hEnd'], ['compo', 'dgA'], ['riposte', 'rA'], ['lie', 'lieA']]) {
    REACH[k] = f.joints(POSES[pose], false).tip[0] + (MOVES[k].lunge || 0) + 16 + (k === 'bassa' ? 30 : 0); // l'estocade basse atteint d'abord la jambe avant
  }
  REACH.tajo = f.joints(POSES.tajoA, false).tip[0] + MOVES.tajo.lunge + 16;
  REACH.griffe = f.joints(POSES.clawA, false).bwr[0] + MOVES.griffe.lunge + 14 + 16; // la main libre, prolongée des griffes
  REACH.beat = Math.round((REACH.jab + REACH.fente) / 2); // le battement cherche la lame adverse, plus loin que le corps
}
// bandes de distance
const BAND_NAME = { engage: 'Engagement', estoc: 'Portée d\'estocade', menace: 'Distance de menace', hors: 'Hors de mesure' };
function band(d) { return d <= 175 ? 'engage' : d <= REACH.jab ? 'estoc' : d <= REACH.fente ? 'menace' : 'hors'; }

// géométrie : distance entre segments
function segDist(p1, p2, q1, q2) {
  const ux = p2[0] - p1[0], uy = p2[1] - p1[1], vx = q2[0] - q1[0], vy = q2[1] - q1[1], wx = p1[0] - q1[0], wy = p1[1] - q1[1];
  const a = ux * ux + uy * uy, b = ux * vx + uy * vy, c = vx * vx + vy * vy, d = ux * wx + uy * wy, e = vx * wx + vy * wy, D = a * c - b * b;
  let sc, tc;
  if (a < 1e-9 && c < 1e-9) { sc = 0; tc = 0; }
  else if (a < 1e-9) { sc = 0; tc = clamp(e / c, 0, 1); }
  else if (c < 1e-9) { tc = 0; sc = clamp(-d / a, 0, 1); }
  else { sc = D < 1e-9 ? 0 : clamp((b * e - c * d) / D, 0, 1); tc = clamp((b * sc + e) / c, 0, 1); sc = clamp((b * tc - d) / a, 0, 1); }
  const px = p1[0] + sc * ux, py = p1[1] + sc * uy, qx = q1[0] + tc * vx, qy = q1[1] + tc * vy;
  return { d: Math.hypot(px - qx, py - qy), p: [px, py] };
}
