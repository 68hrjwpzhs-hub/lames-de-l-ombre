// =============================== 3.0 · sprint 30 : Livre III « Le Cercle de Madrid » (8 chapitres, 2 actes) ===============================
// Intrigue, personnages et dialogues originaux. Faits historiques cités : la Plaza Mayor (achevée en 1619), l'Alcázar royal de Madrid,
// l'école de la destreza (Carranza, Pacheco de Narváez). Le Cercle de fer, la Tisserande et leurs gens sont inventés.
// Le Livre III s'ouvre après le Livre II. Sa fin dépend du choix fait sur la Plaza Mayor (accepter ou refuser l'aide de la Tisserande).
Object.assign(SPK, {
  passeur: { name: 'Le passeur navarrais', col: '#4a3a2a' }, tisserande: { name: 'Doña Leonor, la Tisserande', col: '#3a1a2a' }, alguacil: { name: 'L\'alguazil', col: '#2a2a3a' },
  prevot: { name: 'Le prévôt du Cercle', col: '#3a3a3a' }, coupejarret: { name: 'Le coupe-jarret', col: '#3a2a2a' }, elvira: { name: 'Doña Elvira, maestra', col: '#4a2a1a' },
  sergent: { name: 'Le sergent de la garde', col: '#5a1a1e' }, maestre: { name: 'Le Maestre du Cercle de fer', col: '#1a1a1a' },
});
Object.assign(STORY_FOES, {
  passeur: { name: 'Le passeur navarrais', level: 'duelliste', tweak: { slow: 1.55, aggr: .55 }, rapier: 'garnison', offhand: 'cape', look: () => mk('duelliste', { style: 'paysan', coat: '#6a4a2a', coat2: '#3a2a18', hose: '#3a2a18', hatType: 'beret', hat: '#2a2a3a', beard: 'full', hair: '#2a1a10', cape: '#3a2a18', plume: null }) },
  alguacil: { name: 'L\'alguazil', level: 'maitre', arch: 'destreza', tweak: { slow: 1.55, fer: .35 }, rapier: 'tolede', offhand: 'rondache', look: () => mk('maitre', { coat: '#2a2a3a', coat2: '#14141e', hose: '#14141e', beard: 'pointed', hair: '#14100c', cape: '#14141e', plume: null, hatType: 'feutre', hat: '#14141e' }) },
  prevot: { name: 'Le prévôt du Cercle', level: 'maitre', arch: 'destreza', tweak: { slow: 1.45, fer: .45, derob: .5 }, rapier: 'tolede', offhand: 'dague', look: () => mk('maitre', { coat: '#3a3a3a', coat2: '#1e1e1e', hose: '#1e1e1e', beard: 'pointed', hair: '#4a4a4a', cape: '#1e1e1e', plume: '#8a8a8a' }) },
  coupejarret: { name: 'Le coupe-jarret', level: 'duelliste', tweak: { slow: 1.5, aggr: .7, feint: .4 }, rapier: 'garnison', offhand: 'dague', look: () => mk('duelliste', { style: 'rodeur', coat: '#3a2a2a', coat2: '#1e1414', hose: '#1e1414', hatType: 'capuche', hat: '#1e1414', beard: 'none', plume: null, cape: '#1e1414' }) },
  elvira: { name: 'Doña Elvira, maestra', level: 'maitre', arch: 'destreza', tweak: { slow: 1.4, fer: .4, perfect: .45 }, rapier: 'tolede', offhand: null, boss: 'fer', look: () => mk('maitre', { style: 'dame', body: 'f', coat: '#4a2a1a', coat2: '#24140c', hose: '#24140c', hairStyle: 'chignon', hair: '#c8c0b0', beard: 'none', cape: null, plume: '#e8e4dc' }) },
  sergent: { name: 'Le sergent de la garde', level: 'duelliste', tweak: { slow: 1.45, aggr: .55 }, rapier: 'pappenheimer', offhand: 'rondache', look: () => mk('duelliste', { coat: '#5a1a1e', coat2: '#2e0c0e', hose: '#2e0c0e', beard: 'full', hatType: 'feutre', hat: '#1a1214', cape: '#2e0c0e', plume: '#e8c46a' }) },
  maestre: { name: 'Le Maestre du Cercle de fer', level: 'maitre', arch: 'destreza', tweak: { slow: 1.3, fer: .5, derob: .65, perfect: .5, react: .17 }, rapier: 'ferrara', offhand: 'rondache', boss: 'fer', look: () => mk('maitre', { coat: '#1a1a1a', coat2: '#0a0a0a', hose: '#0a0a0a', trim: '#8a8f98', beard: 'pointed', hair: '#8a8a8a', cape: '#0a0a0a', plume: '#3a3a3a', hatType: 'feutre', hat: '#0a0a0a' }) },
  tisserande: { name: 'Doña Leonor, la Tisserande', level: 'maitre', tweak: { slow: 1.3, feint: .55, esq: .25, stopHit: .3, bait: .3 }, rapier: 'venitienne', offhand: 'dague', boss: 'feinte', look: () => mk('maitre', { style: 'dame', body: 'f', coat: '#3a1a2a', coat2: '#1e0c16', hose: '#1e0c16', hairStyle: 'long', hair: '#14100c', beard: 'none', cape: '#1e0c16', plume: '#c8202a' }) },
});
const ACT6 = 'Livre III · Acte VI · Le chemin d\'Espagne', ACT7 = 'Livre III · Acte VII · Le cercle de Madrid';
const aidee = S => S.choices.c02 === 'accepter', seule = S => S.choices.c02 !== 'accepter';
STORY.push(
  { id: 'c01', book: 3, act: ACT6, title: 'La Venta du col', venue: 'auberge', hero: 'bastien',
    intro: [L_('narr', 'Automne 1634. Une lettre de Madrid est arrivée chez Lacombe : l\'académie de Maestro Íñigo va fermer. Un « Cercle de fer » rachète les maîtres de la ville, un par un.'),
      L_('bastien', 'Les Pyrénées en novembre, la neige aux genoux, et une venta où le vin a le goût du goudron. Álvaro, tu me dois une fière chandelle.'),
      L_('passeur', 'Le col est à moi, Gascon. On le passe avec trois écus, ou on ne le passe pas.'),
      L_('bastien', 'Trois écus ? Je n\'en ai que deux, et une lame. Choisis.'),
      L_('narr', 'Astuce : sa cape emmêle votre lame quand il esquive. Estocades courtes, puis riposte.')],
    fights: [{ foe: 'passeur', wins: 2 }], goal: { type: 'stat', stat: 'ripostes', op: '>=', v: 2, label: '2 ripostes' },
    outro: [L_('passeur', 'Passez. Mais à Madrid, méfiez-vous des gens qui tracent des cercles par terre.'), L_('bastien', 'C\'est bien pour eux qu\'on y va.')], rewards: { ecus: 150 } },
  { id: 'c02', book: 3, act: ACT6, title: 'La Plaza Mayor', venue: 'plaza', hero: 'isaure',
    intro: [L_('narr', 'Madrid. La Plaza Mayor, achevée quinze ans plus tôt, est le cœur bruyant de la ville : marchés, fêtes, et parfois des exécutions.'),
      L_('tisserande', 'Isaure de Mirande. On dit à la cour de Madrid que vous savez lire une lettre à l\'envers à travers une bougie.'),
      L_('isaure', 'Et l\'on dit à Paris que vous tissez des intrigues avec les fils des autres, doña Leonor.'),
      L_('alguacil', 'Doña Leonor, cette Française pose trop de questions sur le Cercle. Je l\'emmène ?'),
      L_('narr', 'Astuce : l\'alguazil tient le bras tendu et une rondache. Dérobez-vous à son fer (← + Attaque).')],
    fights: [{ foe: 'alguacil', wins: 2 }], goal: { type: 'stat', stat: 'esqOk', op: '>=', v: 2, label: '2 esquives réussies' },
    outroChoice: { prompt: 'La Tisserande vous offre son aide : elle connaît les portes de l\'Alcázar.', options: [{ id: 'accepter', label: 'Accepter son aide', desc: 'Les portes s\'ouvriront plus vite. Mais à quel prix ?' }, { id: 'refuser', label: 'Refuser', desc: 'Vous resterez seuls, et libres de vos choix.' }] },
    outro: [L_('tisserande', 'Le Cercle de fer veut devenir la seule école de Madrid. Et ses maîtres serviront qui le paiera.'), L_('isaure', 'Comme vous, alors.')], rewards: { ecus: 150 } },
  { id: 'c03', book: 3, act: ACT6, title: 'L\'Académie du cercle', venue: 'academia', hero: 'alvaro',
    intro: [L_('narr', 'L\'académie de Maestro Íñigo, près de la calle Mayor. Le grand cercle est peint au sol, comme dans les traités de Carranza.'),
      L_('alvaro', 'Les murs sont vides, maestro. Où sont vos élèves ?'),
      L_('prevot', 'Chez nous, Portugais. Le Cercle de fer paie les leçons, et les élèves suivent l\'argent. Votre maître n\'a plus que sa géométrie.'),
      L_('alvaro', 'La géométrie suffit. Prends le cercle, prévôt : je te montre où il commence.'),
      L_('narr', 'Astuce : il cherche votre fer. Poussez quand les lames se touchent, ou dérobez-vous.')],
    fights: [{ foe: 'prevot', wins: 2 }], goal: { type: 'stat', stat: 'dominate', op: '>=', v: 1, label: 'Dominer son fer une fois' },
    outro: [L_('prevot', 'Le Maestre vous attendra à l\'Alcázar. Il dit que la destreza appartient au roi, pas aux maîtres pauvres.'), L_('alvaro', 'La destreza appartient à qui la comprend.')], rewards: { ecus: 160 } },
  { id: 'c04', book: 3, act: ACT6, title: 'Les ruelles de Lavapiés', venue: 'plaza', hero: 'corvin', chain: true,
    intro: [L_('narr', 'La nuit, sous les arcades désertes. Quelqu\'un suit les six lames depuis leur arrivée à Madrid.'),
      L_('corvin', 'Deux ombres derrière nous depuis la calle de Toledo. Je n\'aime pas qu\'on me copie.'),
      L_('coupejarret', 'Le Cercle paie bien pour une lame française. Il paie double pour l\'Ombre.'),
      L_('narr', 'Deux duels d\'une manche, enchaînés. La vie ne revient qu\'en partie entre les deux.')],
    fights: [{ foe: 'coupejarret', wins: 1 }, { foe: 'alguacil', wins: 1 }], goal: { type: 'hpLeft', v: 40, label: 'Finir avec plus de 40 de vie' },
    outro: [L_('coupejarret', 'La dame en noir… c\'est elle qui nous a dit où vous trouver.'), L_('corvin', 'La Tisserande. Elle tisse dans les deux sens.')], rewards: { ecus: 160 } },
  { id: 'c05', book: 3, act: ACT7, title: 'La Leçon de doña Elvira', venue: 'academia', hero: 'vaucelles',
    intro: [L_('narr', 'Une vieille maîtresse d\'armes refuse de vendre son école au Cercle. Elle accepte de recevoir un capitaine français, à une condition.'),
      L_('elvira', 'Un vieux loup de France. Vous parez comme on ferme une porte, capitaine. Ici, on ne ferme rien : on fait tourner le monde autour de soi.'),
      L_('vaucelles', 'À mon âge, madame, le monde tourne bien assez tout seul.'),
      L_('elvira', 'Alors apprenez à tourner avec lui. Touchez-moi deux fois, et je vous dirai comment entrer à l\'Alcázar.'),
      L_('narr', 'Astuce : sous 50 % de vie, elle cherche votre fer. Variez les lignes.')],
    fights: [{ foe: 'elvira', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 3, label: '3 parades parfaites' },
    outro: [L_('elvira', 'Vous avez tourné. Lentement, mais vous avez tourné.'), L_('elvira', 'Le Maestre reçoit à l\'Alcázar, dans la cour des flambeaux. On y entre par les jardins, à la relève de minuit.')], rewards: { ecus: 170 } },
  { id: 'c06', book: 3, act: ACT7, title: 'Les Jardins de l\'Alcázar', venue: 'alcazar', hero: 'mathurin', chain: true, startHp: S => aidee(S) ? 100 : 85,
    intro: [L_('narr', 'Minuit, sous les murs de l\'Alcázar. Les jardins descendent vers le Manzanares.'),
      Object.assign(L_('tisserande', 'J\'ai fait ouvrir la poterne. Vous avez dix minutes avant la relève.'), { cond: aidee }),
      Object.assign(L_('narr', 'Sans aide, il faut passer par le mur du jardin. Mathurin fait la courte échelle à tout le monde, et se hisse le dernier.'), { cond: seule }),
      L_('sergent', 'Halte ! Un Français, dans les jardins du roi ? Aux armes !'),
      L_('mathurin', 'Pas besoin de crier, sergent. Je suis là, je ne bouge pas.')],
    fights: [{ foe: 'sergent', wins: 1 }, { foe: 'alguacil', wins: 1 }], goal: { type: 'stat', stat: 'gbreaks', op: '>=', v: 1, label: 'Briser une garde' },
    outro: [L_('sergent', 'La cour des flambeaux… le Maestre y donne sa leçon devant les nobles. Ce soir, la leçon, c\'est vous.'), L_('mathurin', 'Alors on n\'arrivera pas en retard.')], rewards: { ecus: 170 } },
  { id: 'c07', book: 3, act: ACT7, title: 'Le Cercle de fer', venue: 'alcazar', hero: null,
    intro: [L_('narr', 'La cour de l\'Alcázar, aux flambeaux. Des nobles en noir forment un cercle vivant autour d\'un homme en armure légère.'),
      L_('maestre', 'Les lames de l\'Ombre. On m\'a promis vos noms, et vos techniques. Je prendrai les deux.'),
      L_('alvaro', 'Notre maître disait : le cercle n\'enferme pas l\'adversaire, il enferme la peur.'),
      L_('maestre', 'Votre maître est mort pauvre. Le mien est le roi.'),
      L_('narr', 'Astuce : sa rondache tient une fente lourde par manche, et il cherche votre fer sous 50 % de vie.')],
    fights: [{ foe: 'maestre', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites contre le Maestre' },
    outro: [L_('maestre', 'Ce n\'est pas moi… qui vous ai vendus. C\'est elle. Elle vend tout le monde.'), L_('narr', 'Dans l\'ombre d\'une arcade, une robe noire se retire sans bruit.')], rewards: { ecus: 220 } },
  { id: 'c08', book: 3, act: ACT7, title: 'La Dernière Géométrie', venue: 'alcazar', hero: null,
    intro: [L_('narr', 'Sur la galerie de l\'Alcázar, la Tisserande attend, une dague à la main gauche.'),
      Object.assign(L_('tisserande', 'Vous avez accepté mon aide. Chaque porte que j\'ouvrais, je la refermais derrière vous. C\'est cela, tisser.'), { cond: aidee }),
      Object.assign(L_('tisserande', 'Vous avez refusé mon aide. Je n\'aime pas les fils qui ne se laissent pas tisser.'), { cond: seule }),
      L_('tisserande', 'Le Cercle était mon métier à tisser. Vos noms, mon dernier fil.'),
      L_('narr', 'Astuce : elle change de rythme sous 50 % de vie. Attendez la vraie attaque.')],
    fights: [{ foe: 'tisserande', wins: 2 }], goal: { type: 'stat', stat: 'esqOk', op: '>=', v: 2, label: '2 esquives réussies contre la Tisserande' },
    outro: [L_('tisserande', 'Vous ne savez pas couper un fil sans tirer sur toute la toile…'),
      Object.assign(L_('narr', 'Sans fil à tirer, la toile tombe d\'un coup. Les élèves d\'Íñigo et de doña Elvira reviennent dès le lendemain : on a vu six étrangers défendre le cercle des pauvres.'), { cond: seule }),
      Object.assign(L_('narr', 'La toile se défait lentement : les portes ouvertes par la Tisserande ont laissé des traces. Il faudra des mois pour que les académies de Madrid retrouvent leurs élèves.'), { cond: aidee }),
      L_('alvaro', 'Maestro Íñigo rouvre son académie. Il dit qu\'il gardera un cercle peint pour chacun de nous.'),
      Object.assign(L_('narr', 'Fin du Livre III. Le Cardinal reçoit un rapport de Madrid : ses lames ont fait la paix entre les écoles d\'Espagne. Il ne sait pas s\'il doit s\'en féliciter.'), { cond: S => S.choices.ch10 !== 'bruler' }),
      Object.assign(L_('narr', 'Fin du Livre III. Libres, les six lames repassent les Pyrénées au printemps. À Paris, une salle d\'armes les attend, et un cercle peint au sol.'), { cond: S => S.choices.ch10 === 'bruler' })],
    rewards: { ecus: 350 } },
);
Object.assign(LESSONS, {
  c01: { name: 'Contre la cape', tip: 'Après son esquive, sa cape emmêle votre lame : ne vous fendez pas à fond.', label: 'Une esquive réussie', ok: s => (s.esqOk || 0) >= 1 },
  c02: { name: 'Le dérobement', tip: 'Il cherche votre fer : ← + Attaque, la pointe passe sous sa lame.', label: 'Une riposte', ok: s => (s.ripostes || 0) >= 1 },
  c03: { name: 'Le liement', tip: 'Fer contre fer, maintenez → pour pousser sa lame.', label: 'Une prise de fer', ok: s => (s.k_lie || 0) >= 1 },
  c04: { name: 'Tenir la nuit', tip: 'La vie revient à peine : parez plutôt que d\'échanger des touches.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  c05: { name: 'Tourner', tip: 'Ne restez pas dans sa ligne : pas rapides, puis estocade.', label: '2 ripostes', ok: s => (s.ripostes || 0) >= 2 },
  c06: { name: 'Le bouclier', tip: 'Fente lourde contre la rondache : elle ne tient qu\'une fois par manche.', label: '2 fentes lourdes', ok: s => (s.heavy || 0) >= 2 },
  c07: { name: 'Le cercle', tip: 'Dérobez-vous à son fer, puis frappez dans le temps de sa reprise.', label: 'Un coup d\'arrêt', ok: s => (s.stopHits || 0) >= 1 },
  c08: { name: 'La patience', tip: 'Elle feinte beaucoup : levez la garde seulement quand la pointe rougeoie.', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
});
const B3_FOE = { c01: 'passeur', c02: 'alguacil', c03: 'prevot', c04: 'coupejarret', c05: 'elvira', c06: 'sergent', c07: 'maestre', c08: 'tisserande' };
NPC_LOOK.tisserande = () => STORY_FOES.tisserande.look();
for (const id in B3_FOE) {
  const c = STORY.find(x => x.id === id), fk = B3_FOE[id], who = { [fk]: 'e' }, n = c.intro.length, m = c.outro.length;
  const cast = id === 'c02' ? { tisserande: { x: 900, face: 'p', stance: 'stand' } } : {};
  if (id === 'c02') who.tisserande = 'tisserande'; if (id === 'c07') who.maestre = 'e';
  const iSteps = []; for (let k = 0; k < n; k++) iSteps.push(k === 0 ? [['cam', 520, 1.05], ['walk', 'p', 310]] : k === n - 1 ? [['cam', null], ['stance', 'p', null], ['stance', 'e', null], ['pose', 'p', 'salut']] : [['cam', k % 2 ? 620 : 340, 1.35]]);
  if (id === 'c02') iSteps[1].push(['walk', 'tisserande', 780], ['face', 'tisserande', 'p']);
  const oSteps = []; for (let k = 0; k < m; k++) oSteps.push(k === m - 1 ? [['cam', 480, 1.05], ['stance', 'e', 'stand']] : [['cam', k % 2 ? 340 : 620, 1.35]]);
  CINE[id] = { intro: { place: { p: -60, e: 650 }, cast, stance: { p: 'stand', e: 'stand' }, who, steps: iSteps }, outro: { place: { p: 330, e: 640 }, cast: id === 'c02' ? { tisserande: { x: 900, face: 'p', stance: 'stand' } } : {}, stance: { p: 'stand', e: 'kneel' }, who, steps: oSteps } };
}
CODEX.push(
  { id: 'plazamayor', cat: 'lieu', title: 'La Plaza Mayor de Madrid', hint: 'Terminer « La Plaza Mayor »', text: 'Grande place à arcades achevée en 1619 sous Philippe III, sur les plans de Juan Gómez de Mora. Marchés, fêtes, courses de taureaux et autodafés s\'y déroulent sous les balcons de fer.' },
  { id: 'alcazar', cat: 'lieu', title: 'L\'Alcázar royal de Madrid', hint: 'Terminer « Le Cercle de fer »', text: 'Ancienne forteresse devenue résidence des rois d\'Espagne. Agrandie et embellie au XVIe et au XVIIe siècle, elle brûle en 1734 ; le Palais royal actuel est bâti à son emplacement.' },
  { id: 'narvaez', cat: 'ecole', title: 'Luis Pacheco de Narváez', hint: 'Terminer « L\'Académie du cercle »', text: 'Disciple de Carranza, auteur du Libro de las grandezas de la espada (1600). Il devient dans les années 1620 maître examinateur des maîtres d\'armes du royaume : on ne pouvait enseigner sans son accord.' },
  { id: 'cercledefer', cat: 'ombre', title: 'Le Cercle de fer', hint: 'Terminer le Livre III', text: 'Une confrérie de maîtres d\'armes qui voulut acheter toutes les académies de Madrid et vendre ses épées au plus offrant. Elle obéissait, sans le savoir, à une espionne : doña Leonor, la Tisserande. Légende du jeu.' },
);
(() => { const oc = Codex.onChapter.bind(Codex); Codex.onChapter = id => { oc(id); const m = { c02: 'plazamayor', c03: 'narvaez', c07: 'alcazar', c08: 'cercledefer' }; if (m[id]) Codex.unlock(m[id]); }; })();
(() => { const sl = Story.showList.bind(Story); Story.showList = function () { sl(); const S = this.data(), el = $('storyEnding'); if (el && S.done.c08) el.textContent += (el.textContent ? ' ' : '') + (S.choices.c02 === 'accepter' ? 'Livre III : la toile de la Tisserande se défait lentement.' : 'Livre III : les écoles de Madrid retrouvent leurs élèves.'); }; })();
