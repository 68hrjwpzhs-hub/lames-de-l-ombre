// =============================== bilan d'après-match : quelques chiffres et un conseil tiré de ce qui s'est passé ===============================
const Bilan = {
  ADVICE: {
    fente: 'Ses fentes vous ont coûté le plus. Rompez (double ←) juste avant, ou esquivez en volte, puis punissez son retour de fente.',
    heavy: 'Ses fentes lourdes brisent la garde tenue. Reculez, frappez dans sa longue préparation, ou parez au tout dernier instant.',
    jab: 'Ses estocades passent. Levez la garde juste avant la touche (la pointe rougeoie), pas en avance.',
    bassa: 'Ses estocades basses passent. Votre garde suit la pointe : levez-la au dernier moment, ou esquivez en volte.',
    degage: 'Ses dégagements contournent votre lame. Ne gardez pas trop tôt : la ligne change pendant sa préparation.',
    compo: 'Ses attaques composées vous trompent. Attendez la vraie attaque, ne mordez pas à la première menace.',
    circ: 'Ses imbroccatas plongent par le haut. Parez tard, ou passez sous la lame avec l\'esquive.',
    lie: 'Ses prises de fer passent votre garde. Dérobez-vous (← + Attaque) ou parez au moment du contact.',
    tajo: 'Ses coups de taille passent. Reculez hors de mesure ou parez au dernier instant.',
    griffe: 'Ses griffes brisent la garde. Restez hors de son allonge et punissez quand il manque.',
    riposte: 'Ses ripostes vous punissent : vos attaques sont parées. Variez le rythme, feintez, ou battez sa lame d\'abord.',
  },
  // un conseil : d'abord le coup qui a fait le plus mal, sinon l'habitude la plus coûteuse du joueur
  advice(p) {
    const s = p.stats, by = s.takenBy || {}; let top = null; for (const k in by) if (!top || by[k] > by[top]) top = k;
    if ((s.esq || 0) >= 3 && (s.esqOk || 0) / s.esq < .4) return 'Vos esquives partent trop tôt : appuyez quand la pointe adverse rougeoie, pas avant.';
    if (s.whiffs >= 4 && s.whiffs > s.hits) return 'Beaucoup d\'attaques dans le vide : attendez qu\'il entre dans votre mesure avant de partir.';
    if (top && by[top] >= 20) return this.ADVICE[top] || 'Observez le coup qui vous touche le plus et préparez sa réponse.';
    if (s.perfect === 0 && s.blocks >= 4) return 'Votre garde tenue bloque sans ouvrir de riposte : levez-la juste avant la touche pour une parade parfaite.';
    if ((s.ripostes || 0) === 0 && (s.perfect || 0) + (s.esqOk || 0) > 0) return 'Après une parade parfaite ou une esquive, Attaque devient Riposte : frappez quand l\'anneau épouse le cercle doré.';
    return 'Beau duel. Pour progresser : feintes, battements et esquives au dernier instant.';
  },
  rows(p) {
    const s = p.stats, def = (s.perfect || 0) + (s.blocks || 0) + (s.esqOk || 0), opp = p.opp ? p.opp.stats : {}, faced = (opp.attacks || 0) || 1, by = s.takenBy || {};
    let top = null; for (const k in by) if (!top || by[k] > by[top]) top = k;
    return [[Math.round(100 * Math.min(1, (s.perfect || 0) / faced)) + ' %', 'parades parfaites'], [(s.esqOk || 0) + '/' + (s.esq || 0), 'esquives'], [String(s.ripostes || 0), 'ripostes'], [top ? (MOVES[top] ? MOVES[top].name : top) : '—', 'coup subi n° 1']];
  },
  html(p) { return this.rows(p).map(([v, l]) => `<div class="b"><b>${v}</b><span>${l}</span></div>`).join('') + `<div class="tip">${this.advice(p)}</div>`; },
  show(p) { const el = $('overBilan'); if (el) el.innerHTML = this.html(p); },
};
