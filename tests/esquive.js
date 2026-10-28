// esquive : passe sous la lame / volte, riposte sur le bouton Attaque, esquive dans le vide, IA, bouton au toucher (iPhone 13)
const { open } = require('./lib'); const fs = require('fs');
const res = []; const ok = (name, cond, detail) => { res.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); };
(async () => {
  const { b, pg, errs } = await open({ device: 'iPhone 13 landscape' }); await pg.waitForTimeout(500);
  await pg.addScriptTag({ content: fs.readFileSync(__dirname + '/harness.js', 'utf8') });
  const r = await pg.evaluate(async () => {
    const o = {};
    const dodgeVs = (dist, kind, lead) => { T.setup(dist); const b0 = G.p.breath; G.e.intent.act = kind; T.stepUntil(() => G.e.state === 'attack' && G.e.move.kind === kind && G.e.t >= G.e.move.wu - lead, 200); G.p.intent.esq = true; T.stepN(1);
      const k = G.p.esq && G.p.esq.kind; T.stepUntil(() => T.types().length, 120); const out = { ev: T.types(), kind: k, hp: G.p.hp, offer: !!G.p.ripOffer, perfect: G.p.esq && G.p.esq.perfect, dodged: G.e.move && G.e.move.dodged, breath: +(b0 - G.p.breath).toFixed(2) };
      T.stepN(40); out.after = G.p.hp; out.whiffed = T.types().includes('whiff') || (G.e.move ? !!G.e.move.whiffed : 'fini'); return out; };
    // 1. estocade : on passe sous la lame
    o.sotto = dodgeVs(225, 'jab', .08);
    // 2. fente : volte
    o.volte = dodgeVs(300, 'fente', .08);
    // 3. estocade basse : volte
    o.bassa = dodgeVs(230, 'bassa', .08);
    // 4. après l'esquive, Attaque devient Riposte et touche
    T.setup(225); G.e.intent.act = 'jab'; T.stepUntil(() => G.e.state === 'attack' && G.e.t >= G.e.move.wu - .08, 200); G.p.intent.esq = true; T.stepUntil(() => G.p.ripOffer, 120);
    T.stepN(18); T.inputOn = true; Input.pressed.attack = true; T.stepN(1); T.inputOn = false; o.rip = { st: G.p.state, kind: G.p.move && G.p.move.kind }; T.ev = []; T.stepUntil(() => T.types().length, 150); o.rip.ev = T.types(); o.rip.ehp = G.e.hp;
    // 5. esquive dans le vide : on trébuche, souffle perdu
    T.setup(400); const b1 = G.p.breath; G.p.intent.esq = true; T.stepN(1); o.vide = { st0: G.p.state }; T.stepUntil(() => G.p.state === 'stumble', 120); o.vide.st1 = G.p.state; o.vide.cost = +(b1 - G.p.breath).toFixed(2); T.stepN(60); o.vide.st2 = G.p.state;
    // 6. trop tôt : la fenêtre est passée quand la lame arrive → touché
    T.setup(225); G.e.intent.act = 'fente'; T.stepN(1); G.p.intent.esq = true; T.stepUntil(() => T.types().length, 200); o.tot = { ev: T.types()[0], hp: G.p.hp };
    // 7. on ne peut pas esquiver en pleine attaque, ni pendant une touche reçue
    T.setup(400); G.p.startMove('jab'); T.stepN(25); G.p.intent.esq = true; T.stepN(2); o.busy = G.p.state;
    // 8. l'IA (maître) esquive parfois, et punit l'esquive dans le vide
    G.silent = true; let esqAI = 0, esqOk = 0; for (let k = 0; k < 3; k++) { const m = T.botMatch('fentes', 'maitre', 60); esqAI += G.e.stats.esq || 0; esqOk += G.e.stats.esqOk || 0; } o.ai = { esqAI, esqOk };
    // 9. un joueur qui esquive sans arrêt perd contre le duelliste
    T.bots.esquiveur = (f, dt) => { const it = f.intent; it.dx = f.dist() > 240 ? f.dir : 0; it.esq = Math.random() < .08; if (f.ripOffer) it.rip = true; };
    let w = 0, l = 0; for (let k = 0; k < 4; k++) { const m = T.botMatch('esquiveur', 'duelliste', 120); w += m.wins[0]; l += m.wins[1]; } o.spam = { w, l };
    // 10. boutons : Esquive à la place de Riposte, anneau de timing sur Attaque
    G.startMatch(); G.state = 'fight'; G.banner = null; G.show(null); G.ai = { think() {}, onEvent() {} }; G.timer = 999; G.p.x = 300; G.e.x = 700; T.inputOn = true;
    await new Promise(r => setTimeout(r, 120));
    const be = $('bEsq'), q = be.getBoundingClientRect(); o.btn = { rip: !!$('bRip'), ring: !!$('bAtk').querySelector('#ripRing'), vis: getComputedStyle(be).opacity, inScreen: q.right <= innerWidth && q.bottom <= innerHeight && q.left > 0 && q.top > 0 };
    o.btn.overlap = ['bAtk', 'bGuard', 'bFeint', 'bPause'].filter(id => { const r2 = $(id).getBoundingClientRect(); return !(q.right < r2.left || q.left > r2.right || q.bottom < r2.top || q.top > r2.bottom); });
    be.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, pointerType: 'touch', clientX: q.left + 20, clientY: q.top + 20, bubbles: true }));
    be.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: q.left + 20, clientY: q.top + 20, bubbles: true }));
    await new Promise(r => setTimeout(r, 80)); o.btn.st = G.p.state;
    G.p.ripOffer = { t0: G.time, end: G.time + 10 }; await new Promise(r => setTimeout(r, 120)); o.btn.atkRip = $('bAtk').classList.contains('rip'); o.btn.ringShown = getComputedStyle($('ripRing')).display !== 'none';
    return o;
  });
  console.log(JSON.stringify(r));
  ok('estocade esquivée en passant sous la lame (aucune touche, offre de riposte)', r.sotto.kind === 'sotto' && r.sotto.ev[0] === 'esquive' && r.sotto.hp === 100 && r.sotto.offer && r.sotto.after === 100, r.sotto);
  ok('fente esquivée en volte', r.volte.kind === 'volte' && r.volte.ev[0] === 'esquive' && r.volte.after === 100, r.volte);
  ok('estocade basse esquivée en volte', r.bassa.kind === 'volte' && r.bassa.ev[0] === 'esquive' && r.bassa.after === 100, r.bassa);
  ok('l\'esquive coûte du souffle (0,14)', Math.abs(r.sotto.breath - .14) < .03, r.sotto.breath);
  ok('après l\'esquive, Attaque déclenche la riposte qui touche', r.rip.kind === 'riposte' && r.rip.ev[0] === 'hit' && r.rip.ehp < 100, r.rip);
  ok('esquive dans le vide : on trébuche puis on se remet', r.vide.st0 === 'esquive' && r.vide.st1 === 'stumble' && r.vide.cost > .14 && ['idle', 'guard'].includes(r.vide.st2), r.vide);
  ok('esquive trop tôt : la lame arrive après la fenêtre et touche', r.tot.ev === 'hit' && r.tot.hp < 100, r.tot);
  ok('pas d\'esquive en pleine attaque', r.busy === 'attack', r.busy);
  ok('l\'IA maître esquive parfois', r.ai.esqAI > 0 && r.ai.esqOk > 0, r.ai);
  ok('esquiver sans arrêt ne gagne pas', r.spam.w < r.spam.l, r.spam);
  ok('bouton Esquive visible à la place de Riposte, sans chevauchement', !r.btn.rip && r.btn.vis === '1' && r.btn.inScreen && r.btn.overlap.length === 0, r.btn);
  ok('le bouton Esquive déclenche l\'esquive', r.btn.st === 'esquive' || r.btn.st === 'stumble', r.btn.st);
  ok('pendant l\'offre, Attaque devient Riposte avec l\'anneau', r.btn.ring && r.btn.atkRip && r.btn.ringShown, r.btn);
  await pg.evaluate(() => { T.setup(225); G.venue = 'salle'; G.p.ripOffer = { t0: G.time - .15, end: G.time + .3 }; G.render(1 / 60); });
  await pg.screenshot({ path: __dirname + '/out/esq_btn.png' });
  console.log(errs.length ? 'ERREURS ' + JSON.stringify(errs) : 'aucune erreur'); console.log(`${res.filter(Boolean).length}/${res.length} tests réussis`); await b.close();
})();
