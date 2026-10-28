// =============================== sprint 15 : histoire épaissie, choix qui pèsent, récits personnels des six lames ===============================
// Personnages, répliques et intrigues originaux. Faits historiques cités : siège de La Rochelle (1627-1628), journée des Dupes (1630),
// exil de la reine mère Marie de Médicis aux Pays-Bas espagnols (1631), la Pomme de Pin (taverne parisienne réputée), la Croix-du-Trahoir.
Object.assign(SPK, {
  garrigue: { name: 'Sergent Garrigue', col: '#5a4a2a' }, courrier: { name: 'Le courrier de Bruxelles', col: '#2a3a4a' }, tricheur: { name: 'Le Tricheur', col: '#6a2a2a' },
  inigo: { name: 'Maestro Íñigo', col: '#2a2420' }, archiviste: { name: 'L\'Archiviste', col: '#3a3a3a' }, bretteur: { name: 'Le Bretteur du Trahoir', col: '#4a2a3a' },
});
Object.assign(STORY_FOES, {
  garrigue: { name: 'Sergent Garrigue', level: 'duelliste', tweak: { slow: 1.5, aggr: .6 }, rapier: 'pappenheimer', look: () => mk('duelliste', { coat: '#5a4a2a', coat2: '#3a2e1a', hose: '#3a2e1a', beard: 'full', hair: '#6a6258', hatType: 'beret', hat: '#3a2e1a', cape: '#2a2014' }) },
  courrier: { name: 'Le courrier de Bruxelles', level: 'duelliste', tweak: { slow: 1.45, feint: .4, dashBack: .5 }, rapier: 'milanaise', look: () => mk('duelliste', { coat: '#2a3a4a', coat2: '#16202a', hose: '#16202a', beard: 'none', cape: '#121a22', plume: '#c8c0b0' }) },
  tricheur: { name: 'Le Tricheur de la Pomme de Pin', level: 'duelliste', tweak: { slow: 1.4, feint: .55, bait: .3 }, rapier: 'garnison', look: () => mk('duelliste', { coat: '#6a2a2a', coat2: '#3a1414', hose: '#3a1414', beard: 'moustache', hair: '#1a1410', plume: '#d8b25e' }) },
  inigo: { name: 'Maestro Íñigo', level: 'maitre', arch: 'destreza', tweak: { slow: 1.4, fer: .5 }, rapier: 'tolede', look: () => mk('maitre', { coat: '#1e1a16', coat2: '#0e0c0a', hair: '#d8d4cc', beard: 'pointed', cape: '#0e0c0a', plume: null, hatType: 'feutre' }) },
  archiviste: { name: 'L\'Archiviste', level: 'maitre', sig: 'horloger', tweak: { slow: 1.45, stopHit: .4, bait: .25 }, rapier: 'venitienne', look: () => mk('maitre', { coat: '#3a3a3a', coat2: '#1e1e1e', hose: '#1e1e1e', beard: 'none', hair: '#4a4a4a', cape: '#141414', plume: '#6a6a6a' }) },
  bretteur: { name: 'Le Bretteur du Trahoir', level: 'maitre', tweak: { slow: 1.4, aggr: .7 }, rapier: 'ferrara', look: () => mk('maitre', { coat: '#4a2a3a', coat2: '#2a141e', hose: '#2a141e', beard: 'pointed', hair: '#2a1a10', cape: '#1e0e14', plume: '#c83a3a' }) },
});
// ---- répliques ajoutées aux chapitres : insérées avant la dernière réplique (la mise en scène suit) ----
const STORY_MORE = {
  ch01: { intro: [L_('vaucelles', 'J\'ai servi le roi devant La Rochelle, quatorze mois dans la boue. Le Cardinal m\'a donné autre chose à défendre que des fossés.'), L_('lacombe', 'Des noms, capitaine. Vous défendez des noms. Méfiez-vous : un nom, ça se vole.')],
    outro: [L_('tancrede', 'Son Éminence a confiance en vous, capitaine. C\'est ce qui l\'inquiète le plus.')] },
  ch02: { intro: [L_('voleur', 'Tu cours bien, pour une espionne de la reine mère. On dit qu\'elle t\'a oubliée à Bruxelles.'), L_('isaure', 'On dit beaucoup de choses sur les toits. Peu de gens les répètent en bas.')] },
  ch03: { intro: [L_('mousquetaire', 'Mon capitaine m\'a appris une chose : on ne recule jamais devant une casaque rouge.')] , outro: [L_('bastien', 'Garde ta casaque propre, l\'ami. Un jour, on se battra du même côté.')] },
  ch04: { intro: [L_('alvaro', 'Nous avions le même maître, Gaspar. Lui disait que la destreza est une géométrie, pas un commerce.'), L_('gaspar', 'Notre maître est mort pauvre, Álvaro. Moi, je compte bien mourir vieux.')] },
  ch05: { intro: [L_('isaure', 'Tu m\'as appris à lire une lame avant de lire un livre. Pourquoi le marquis ?'), L_('ombeline', 'Parce que la reine mère ne paie plus, et que le Cardinal ne paie jamais.')] },
  ch06: { intro: [L_('rouvray', 'Les gardes du Cardinal se font tuer pour un homme qui ne connaît pas leur nom. Le marquis, lui, les connaît tous.')] },
  ch07: { intro: [L_('drac', 'Vous nous chassez des égouts aux toits depuis cent ans. Ce soir, ce sont les toits qui nous appartiennent.')] , outro: [L_('corvin', 'Ils ne se battent pas pour le marquis. Ils se battent pour avoir le droit de marcher au soleil.')] },
  ch08: { intro: [L_('brevannes', 'Je ne veux pas la mort du Cardinal, capitaine. Je veux qu\'on se moque de lui. C\'est beaucoup plus long, et beaucoup plus douloureux.')] },
  ch10: { intro: [L_('ecaille', 'Le marquis voulait un scandale. Il aura une révolution. Les hommes appellent ça une trahison ; nous, une saison.')] },
};
for (const id in STORY_MORE) { const c = STORY.find(x => x.id === id), M = STORY_MORE[id]; if (!c) continue;
  for (const ph of ['intro', 'outro']) { if (!M[ph]) continue; const n = c[ph].length, at = Math.max(0, n - 1); c[ph] = c[ph].slice(0, at).concat(M[ph], c[ph].slice(at));
    const sc = CINE[id] && CINE[id][ph]; if (sc && sc.steps && sc.steps.length >= at) sc.steps.splice(at, 0, ...M[ph].map(() => [])); }
}
// ---- les choix pèsent : Ombeline épargnée (ch. 5) revient ; le mousquetaire salué (ch. 3) aussi ----
(() => {
  const c9 = STORY.find(x => x.id === 'ch09'), c10 = STORY.find(x => x.id === 'ch10');
  c9.intro.push(Object.assign(L_('ombeline', 'Je tiens le Pont-Neuf pour toi, petite sœur. Ma dette est payée, et ma lanterne est allumée.'), { cond: S => S.choices.ch05 === 'epargner' }));
  c9.intro.push(Object.assign(L_('narr', 'Ombeline n\'est pas là. Elle attend à la Bastille, sur votre parole. Le Pont-Neuf sera plus long à tenir.'), { cond: S => S.choices.ch05 === 'livrer' }));
  c9.outro.push(Object.assign(L_('mousquetaire', 'La rue Saint-Honoré est tenue. On n\'oublie pas un salut, même rouge.'), { cond: S => S.choices.ch03 === 'saluer' }));
  c10.outro.splice(1, 0, Object.assign(L_('narr', 'Sous les voûtes, une lanterne s\'allume près du portail : Ombeline a tenu parole jusqu\'au bout.'), { cond: S => S.choices.ch05 === 'epargner' }));
  const sc9 = CINE.ch09; sc9.intro.cast.ombeline = { x: 1100, face: 'p', stance: 'stand', if: S => S.choices.ch05 === 'epargner' }; sc9.intro.who.ombeline = 'ombeline';
  sc9.intro.steps[3] = [['walk', 'ombeline', 760], ['cam', 600, 1.2]];
  sc9.outro.cast.mousquetaire = { x: -80, face: 'p', stance: 'stand', if: S => S.choices.ch03 === 'saluer' }; sc9.outro.who.mousquetaire = 'mousquetaire';
  NPC_LOOK.mousquetaire = () => (typeof sfoe === 'function' && sfoe('Mousquetaire du roi') ? sfoe('Mousquetaire du roi').look() : mk('duelliste', { coat: '#2a3a7a' }));
})();
// ---- récits personnels : un par héros, ouverts quand le Registre est retrouvé ----
const L2 = L_;
STORY.push(
  { id: 'r_vaucelles', side: true, act: 'Récits des six lames', title: 'Le Fossé de La Rochelle', venue: 'nuit', hero: 'vaucelles',
    intro: [L2('narr', 'Paris, l\'hiver suivant. Un vétéran du siège de La Rochelle vend son épée au plus offrant, rue de la Mortellerie.'), L2('garrigue', 'Capitaine. Vous m\'avez laissé dans le fossé, sous la digue. Je vous ai attendu toute une nuit.'), L2('vaucelles', 'J\'ai porté trois hommes hors de ce fossé, Garrigue. Tu n\'étais pas parmi eux. Je l\'ai regretté chaque jour.'), L2('garrigue', 'Alors réglons ça comme au régiment : à la lame, et sans témoins.')],
    fights: [{ foe: 'garrigue', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 3, label: '3 parades parfaites' },
    outro: [L2('garrigue', 'Vous parez toujours comme à vingt ans. Moi, j\'ai vieilli de colère.'), L2('vaucelles', 'Viens à la salle de Lacombe demain. Il manque un sergent pour apprendre aux recrues à tomber.'), L2('narr', 'Le lendemain, à six heures, un vieux sergent attendait devant la salle d\'armes.')], rewards: { ecus: 120 } },
  { id: 'r_isaure', side: true, act: 'Récits des six lames', title: 'La Lettre de Bruxelles', venue: 'loggia', hero: 'isaure',
    intro: [L2('narr', 'Depuis sa fuite aux Pays-Bas espagnols en 1631, la reine mère écrit à ses fidèles. Une de ses lettres traverse Paris cette nuit.'), L2('isaure', 'Je reconnais ce cachet. Elle me l\'a confié, autrefois, avec sa confiance.'), L2('courrier', 'Elle parle de vous dans sa lettre, Mirande. Elle dit que vous l\'avez trahie à la journée des Dupes.'), L2('isaure', 'J\'ai choisi le roi ce jour-là. Donne-moi la lettre ; je déciderai seule de ce qu\'elle dit.')],
    fights: [{ foe: 'courrier', wins: 2 }], goal: { type: 'stat', stat: 'esqOk', op: '>=', v: 2, label: '2 esquives réussies' },
    outro: [L2('isaure', '« À ma petite aiguille, qui pique encore mon cœur. » Elle n\'a jamais su écrire autre chose que des reproches tendres.'), L2('courrier', 'Que ferez-vous de la lettre ?'), L2('isaure', 'Je la garde. Le Cardinal a assez de papiers ; moi, je n\'en ai qu\'un.')], rewards: { ecus: 120 } },
  { id: 'r_bastien', side: true, act: 'Récits des six lames', title: 'Les Dés de la Pomme de Pin', venue: 'cloitre', hero: 'bastien',
    intro: [L2('narr', 'À la Pomme de Pin, taverne de la Cité où l\'on boit, rime et joue, Bastien a perdu sa solde en trois coups de dés.'), L2('tricheur', 'Encore un double six, Gascon. La chance aime ceux qui ne savent pas compter.'), L2('bastien', 'Je compte très bien, l\'ami : tes dés ont trois faces de six. Sortons, la cour est plus honnête que ta table.')],
    fights: [{ foe: 'tricheur', wins: 2 }], goal: { type: 'stat', stat: 'feints', op: '>=', v: 3, label: '3 feintes' },
    outro: [L2('tricheur', 'Prends la bourse. Et les dés, si tu veux.'), L2('bastien', 'Garde les dés. Moi, je ne joue plus qu\'à la lame : au moins, elle ment franchement.')], rewards: { ecus: 150 } },
  { id: 'r_alvaro', side: true, act: 'Récits des six lames', title: 'Le Livre du maître', venue: 'salle', hero: 'alvaro',
    intro: [L2('narr', 'Un vieil homme arrive de Madrid avec un livre manuscrit sous le bras : le traité inachevé du maître d\'Álvaro.'), L2('inigo', 'Ton maître m\'a confié la dernière page. Elle ne se lit pas, elle se démontre.'), L2('alvaro', 'Alors démontrez, maestro. Sur le cercle, comme il nous l\'a appris.')],
    fights: [{ foe: 'inigo', wins: 2 }], goal: { type: 'stat', stat: 'beatOk', op: '>=', v: 2, label: '2 battements réussis' },
    outro: [L2('inigo', 'La dernière page disait : « Le cercle n\'enferme pas l\'adversaire. Il enferme la peur. » Tu l\'as lue sans la voir.'), L2('alvaro', 'Je l\'écrirai dans mon manuscrit, maestro. Avec votre nom à côté du sien.')], rewards: { ecus: 150 } },
  { id: 'r_corvin', side: true, act: 'Récits des six lames', title: 'Le Vrai Nom', venue: 'eglise', hero: 'corvin',
    intro: [L2('narr', 'Une page du Registre manquait encore. Celle qui porte le vrai nom de Corvin. Quelqu\'un l\'a gardée.'), L2('archiviste', 'Je classe les secrets, l\'Ombre. Le vôtre vaut plus cher que tous les autres réunis.'), L2('corvin', 'Il ne vaut rien. C\'est le nom d\'un enfant qui est mort le jour où il a pris une épée.')],
    fights: [{ foe: 'archiviste', wins: 2 }], goal: { type: 'stat', stat: 'whiffs', op: '<=', v: 3, label: '3 attaques manquées au plus' },
    outro: [L2('archiviste', 'Lisez-la au moins. Personne ne devrait oublier son nom.'), L2('corvin', 'Je l\'ai lue. Il était beau, ce nom. Qu\'il brûle avec les cierges.'), L2('narr', 'La page se recroqueville dans la flamme. L\'Ombre n\'a pas d\'autre nom que celui qu\'il s\'est donné.')], rewards: { ecus: 150 } },
  { id: 'r_mathurin', side: true, act: 'Récits des six lames', title: 'La Croix-du-Trahoir', venue: 'cloitre', hero: 'mathurin',
    intro: [L2('narr', 'À la Croix-du-Trahoir, un bretteur provoque chaque soir les jeunes recrues des gardes. Trois sont déjà à l\'Hôtel-Dieu.'), L2('bretteur', 'Encore un sergent ? Ils n\'envoient plus que des vieux, maintenant.'), L2('mathurin', 'Les vieux savent une chose que tu ignores : on ne frappe pas plus fort que le mur. On frappe juste.')],
    fights: [{ foe: 'bretteur', wins: 2 }], goal: { type: 'flag', flag: 'breaks', op: '>=', v: 1, label: 'Briser sa garde une fois' },
    outro: [L2('bretteur', 'Pas de prison ? Pas de Bastille ?'), L2('mathurin', 'Pire : demain, tu enseignes aux recrues ce que tu viens d\'apprendre. Sous mes yeux.')], rewards: { ecus: 150 } },
);
Object.assign(LESSONS, {
  r_vaucelles: { name: 'La parade du vétéran', tip: 'Garrigue frappe fort et souvent : parez au dernier instant plutôt que de tenir la garde.', label: 'Une riposte parfaite', ok: s => (s.ripPerfect || 0) >= 1 },
  r_isaure: { name: 'L\'aiguille', tip: 'Le courrier rompt beaucoup : suivez-le en pas rapide et touchez à la fin de sa retraite.', label: '2 fentes portées', ok: s => (s.k_fente || 0) >= 2 },
  r_bastien: { name: 'Lire un tricheur', tip: 'Il feinte souvent : ne levez la garde que sur la vraie attaque (la pointe rougeoie).', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  r_alvaro: { name: 'Le cercle', tip: 'Íñigo cherche votre fer : dérobez-vous (← + Attaque) ou poussez le fer quand les lames se touchent.', label: 'Dominer son fer une fois', ok: s => (s.dominate || 0) >= 1 },
  r_corvin: { name: 'La patience', tip: 'L\'Archiviste punit les attaques pressées : faites-le venir, puis coupez son temps.', label: 'Un coup d\'arrêt', ok: s => (s.stopHits || 0) >= 1 },
  r_mathurin: { name: 'Frapper juste', tip: 'Fente lourde contre sa garde tenue, puis estocade tout de suite.', label: 'Une esquive réussie', ok: s => (s.esqOk || 0) >= 1 },
});
// mise en scène des récits : mêmes principes que les chapitres (arrivée, gros plans, salut)
for (const r of ['r_vaucelles', 'r_isaure', 'r_bastien', 'r_alvaro', 'r_corvin', 'r_mathurin']) {
  const foeSpk = { r_vaucelles: 'garrigue', r_isaure: 'courrier', r_bastien: 'tricheur', r_alvaro: 'inigo', r_corvin: 'archiviste', r_mathurin: 'bretteur' }[r], who = { [foeSpk]: 'e' };
  CINE[r] = {
    intro: { place: { p: -60, e: 650 }, stance: { p: 'stand', e: 'stand' }, who, steps: [[['cam', 520, 1.05], ['walk', 'p', 310]], [['cam', 620, 1.4]], [['cam', 340, 1.35]], [['cam', null], ['stance', 'p', null], ['stance', 'e', null], ['pose', 'p', HERO_SALUT[r.slice(2)] || 'salut']]] },
    outro: { place: { p: 330, e: 640 }, stance: { p: 'stand', e: 'kneel' }, who, steps: [[['cam', 620, 1.4]], [['cam', 340, 1.35]], [['cam', 480, 1.05], ['stance', 'e', 'stand']]] },
  };
}
// lore : nouvelles entrées du carnet, ouvertes par les récits
CODEX.push(
  { id: 'larochelle', cat: 'epoque', title: 'Le siège de La Rochelle', hint: 'Terminer « Le Fossé de La Rochelle »', text: 'De 1627 à 1628, l\'armée royale assiège La Rochelle, place forte protestante. Richelieu fait barrer le port d\'une digue géante ; la ville affamée capitule en octobre 1628.' },
  { id: 'dupes', cat: 'epoque', title: 'La journée des Dupes', hint: 'Terminer « La Lettre de Bruxelles »', text: 'En novembre 1630, la reine mère Marie de Médicis croit avoir obtenu le renvoi de Richelieu. Louis XIII le maintient : elle quitte la cour, puis s\'enfuit en 1631 aux Pays-Bas espagnols.' },
  { id: 'pommedepin', cat: 'lieu', title: 'La Pomme de Pin', hint: 'Terminer « Les Dés de la Pomme de Pin »', text: 'Taverne de l\'île de la Cité, réputée depuis le XVe siècle et chantée par les poètes. On y boit, on y rime, on y joue.' },
  { id: 'trahoir', cat: 'lieu', title: 'La Croix-du-Trahoir', hint: 'Terminer « La Croix-du-Trahoir »', text: 'Carrefour de la rue Saint-Honoré marqué d\'une croix, où se trouvait une fontaine. Lieu de passage, de marché… et d\'exécutions publiques.' },
  { id: 'ombre6', cat: 'ombre', title: 'Les six lames de l\'Ombre', hint: 'Terminer un récit personnel', text: 'Six escrimeurs que le Cardinal a recrutés hors des rangs : un vétéran, une espionne, un Gascon, un maître espagnol, un homme sans nom, un sergent. Leurs vrais noms ne figuraient que dans le Registre écarlate. Légende du jeu.' },
);
(() => { const oc = Codex.onChapter.bind(Codex); Codex.onChapter = id => { oc(id); const m = { r_vaucelles: 'larochelle', r_isaure: 'dupes', r_bastien: 'pommedepin', r_mathurin: 'trahoir' }; if (m[id]) Codex.unlock(m[id]); if (/^r_/.test(id)) Codex.unlock('ombre6'); }; })();
