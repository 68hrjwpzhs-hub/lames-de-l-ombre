// =============================== mode Histoire : « Le Registre écarlate » (10 chapitres, 3 actes) ===============================
// Intrigue, personnages et dialogues originaux (seuls Richelieu, l'édit de 1626 et les lieux sont historiques).
// Un chapitre = une scène d'ouverture, un choix éventuel, un ou plusieurs duels (avec une condition spéciale qui donne une étoile),
// une scène de fin, des récompenses. Progression sauvegardée dans Save.data.story.
const SPK = {
  narr: { name: '', col: '#3a3024' }, lacombe: { name: 'Maître Lacombe', col: '#6a5a3a' }, tancrede: { name: 'Frère Tancrède', col: '#5a4632' },
  vaucelles: { name: 'Hugues de Vaucelles', col: '#1a2440' }, isaure: { name: 'Isaure de Mirande', col: '#3a1a40' }, bastien: { name: 'Bastien d\'Armagnac', col: '#7a4a1a' },
  alvaro: { name: 'Dom Álvaro Teixeira', col: '#2a2420' }, corvin: { name: 'Corvin', col: '#1a1a1e' }, mathurin: { name: 'Mathurin Brise-Garde', col: '#5a3a1a' },
  voleur: { name: 'Le voleur', col: '#3a2a3a' }, mousquetaire: { name: 'Le mousquetaire', col: '#2a3a7a' }, gaspar: { name: 'Don Gaspar de Lerín', col: '#2a2420' },
  ombeline: { name: 'Ombeline Vasseur', col: '#2a2a4a' }, rouvray: { name: 'Capitaine de Rouvray', col: '#8a1a1e' }, drac: { name: 'Le drac', col: '#4f6a4a' },
  brevannes: { name: 'Le marquis de Brévannes', col: '#4a3418' }, ecaille: { name: 'Le Chevalier d\'Écaille', col: '#1e3a2e' },
};
// adversaires propres à l'histoire (les autres viennent de la Nuit de Paris)
const sfoe = name => { for (const t of RUN_TIERS) for (const f of t.foes) if (f.name === name) return f; return null; };
const STORY_FOES = {
  bastiano: { name: 'Bastiano', level: 'debutant', tweak: { slow: 1.9, aggr: .3 }, rapier: 'garnison', look: () => Object.assign({}, LOOKS.debutant) },
  pietro: { name: 'Pietro le Tanneur', level: 'debutant', tweak: { slow: 1.65 }, rapier: 'garnison', look: () => mk('debutant', { style: 'paysan', coat: '#8a6a4a', coat2: '#4a3a2a', hose: '#4a3a2a', hatType: 'beret', beard: 'full' }) },
  gaspar: { name: 'Don Gaspar de Lerín', level: 'maitre', arch: 'destreza', tweak: { slow: 1.55, fer: .45 }, rapier: 'tolede', look: () => mk('maitre', { coat: '#2a2420', coat2: '#14100e', trim: '#c8a050', plume: '#e8e4da', beard: 'pointed', cape: '#14100e' }) },
  ombeline: { name: 'Ombeline Vasseur', level: 'duelliste', sig: 'lanterne', tweak: { react: .19, perfect: .45, feint: .55, slow: 1.5 }, rapier: 'milanaise', look: () => mk('duelliste', { style: 'dame', body: 'f', coat: '#2a2a4a', coat2: '#14142a', hose: '#14142a', hairStyle: 'chignon', beard: 'none', hair: '#c8a060' }) },
  rouvray: { name: 'Capitaine de Rouvray', level: 'maitre', tweak: { slow: 1.5 }, rapier: 'pappenheimer', look: () => mk('maitre', { coat: '#8a1a1e', coat2: '#5a0e12', trim: '#d8b25e', plume: '#e8e4da', cape: '#5a0e12', beard: 'full' }) },
  brevannes: { name: 'Le marquis de Brévannes', level: 'maitre', sig: 'horloger', tweak: { slow: 1.45, stopHit: .45, bait: .3, dashBack: .55, aggr: .35, retreatAfter: .7 }, rapier: 'venitienne', look: () => mk('maitre', { coat: '#4a3418', coat2: '#2a1c0c', trim: '#d8b25e', plume: '#2a1c0c', beard: 'moustache', hair: '#9a948a', cape: '#1a120a' }) },
  ecaille: { name: 'Le Chevalier d\'Écaille', level: 'maitre', arch: 'drac', sig: 'ecaille', tweak: { slow: 1.22, perfect: .55, react: .17, fer: .32, derob: .7 }, rapier: 'ferrara', look: () => (RUN_TIERS[RUN_TIERS.length - 1].foes[0].look()) },
};
// leçons : chaque chapitre met en avant une mécanique ; le défi de la leçon donne la 3e étoile
const LESSONS = {
  ch01: { name: 'Parade et riposte', tip: 'Levez la garde quand la pointe rougeoie, puis Attaque devient Riposte.', label: 'Riposter au moins une fois', ok: s => (s.ripostes || 0) >= 1 },
  ch02: { name: 'Esquive', tip: 'Esquive au dernier instant : sous la lame contre l\'estocade, volte contre la fente.', label: '2 esquives réussies', ok: s => (s.esqOk || 0) >= 2 },
  ch03: { name: 'Riposte', tip: 'Une parade parfaite ouvre la riposte : frappez quand l\'anneau épouse le cercle doré.', label: '2 ripostes', ok: s => (s.ripostes || 0) >= 2 },
  ch04: { name: 'Le fer', tip: '→ + Feinte bat sa lame, ↓ + Feinte la domine. Contre son fer : ← + Attaque.', label: 'Placer une prise de fer (↓ + Feinte)', ok: s => (s.k_lie || 0) >= 1 },
  ch05: { name: 'La feinte', tip: 'Feintez pour lui faire lever la garde trop tôt, puis attaquez aussitôt.', label: '3 feintes', ok: s => (s.feints || 0) >= 3 },
  ch06: { name: 'Esquive parfaite', tip: 'Partez en esquive juste quand sa lame part : ralenti et riposte assurée.', label: 'Une esquive parfaite', ok: s => (s.esqPerfect || 0) >= 1 },
  ch07: { name: 'Contre les griffes', tip: 'Les griffes brisent la garde : esquivez-les, ou rompez.', label: '2 esquives réussies', ok: s => (s.esqOk || 0) >= 2 },
  ch08: { name: 'Le contretemps', tip: 'Frappez pendant sa préparation : c\'est un coup d\'arrêt, et une blessure.', label: 'Un coup d\'arrêt', ok: s => (s.stopHits || 0) >= 1 },
  ch09: { name: 'Tenir la nuit', tip: 'La vie revient à peine : parez plutôt que d\'échanger des touches.', label: 'Une parade parfaite au dernier duel', ok: s => (s.perfect || 0) >= 1 },
  ch10: { name: 'Le dernier duel', tip: 'Ses écailles luisent avant la griffe : esquivez ou parez au dernier moment.', label: 'Une esquive réussie contre le Chevalier', ok: s => (s.esqOk || 0) >= 1 },
};
const foeOf = k => STORY_FOES[k] || sfoe(k);
const L_ = (who, txt) => ({ who, txt });
const STORY = [
  { id: 'ch01', act: 'Acte I · Le vol', title: 'La Leçon du Vieux Loup', venue: 'salle', hero: 'vaucelles',
    intro: [L_('narr', 'Paris, 1633. Le duel est puni de mort. Rue de la Ferronnerie, une salle d\'armes s\'éveille sous un ciel de plomb.'),
      L_('lacombe', 'Six heures sonnent, Vaucelles. Votre recrue est en retard, ou bien elle est morte. Les deux se valent.'),
      L_('vaucelles', 'Ni l\'un ni l\'autre. Elle est derrière vous depuis le cinquième coup.'),
      L_('lacombe', 'Bon. Au moins, elle sait marcher sans bruit. Voyons si elle sait se tenir.'),
      L_('vaucelles', 'En garde. Le pied avant d\'abord, toujours. Celui qui recule du talon finit sur le dos.'),
      L_('lacombe', 'Et l\'édit de Son Éminence, capitaine ? Le duel est puni de mort.'),
      L_('vaucelles', 'Ceci n\'est pas un duel, maître. C\'est une leçon. Les leçons n\'ont jamais tué personne.'),
      L_('lacombe', 'Les miennes, si. Bastiano, Pietro : en piste, et ne ménagez pas le Loup.')],
    fights: [{ foe: 'bastiano', wins: 1 }, { foe: 'pietro', wins: 1 }], goal: { type: 'win', label: 'Gagner les deux assauts' },
    outro: [L_('narr', 'Sur le seuil, un capucin trempé de pluie tient un billet scellé de cire pourpre.'),
      L_('tancrede', 'Capitaine. Son Éminence vous prie de cesser vos leçons.'),
      L_('vaucelles', 'Son Éminence ne prie jamais. Qu\'a-t-on perdu ?'),
      L_('tancrede', 'Le Registre écarlate. Vos six noms, et sa signature au bas de chaque page.'),
      L_('lacombe', 'Six noms… Je n\'ai rien entendu. Je suis vieux, et sourd quand il le faut.'),
      L_('vaucelles', 'Rappelez-les tous. Ce soir, l\'Ombre sort.')],
    rewards: { ecus: 40 } },
  { id: 'ch02', act: 'Acte I · Le vol', title: 'Le Voleur des toits', venue: 'loggia', hero: 'isaure',
    intro: [L_('narr', 'Le soir même, sur les toits de l\'île de la Cité. Une silhouette court d\'une cheminée à l\'autre, un rouleau sous le bras.'),
      L_('isaure', 'Encore trois toits et il atteint la Seine. Personne ne court plus vite que moi sur l\'ardoise.'),
      L_('voleur', 'Le Registre ? Je ne fais que le porter, ma belle. Celui qui paie est bien plus dangereux que moi.'),
      L_('isaure', 'Alors tu vas me dire son nom. Avant que le guet ne t\'entende hurler.'),
      L_('narr', 'En bas, des lanternes s\'allument. Le guet a entendu les tuiles tomber.')],
    fights: [{ foe: 'Spadassin du Marais', wins: 1, guet: true, timer: 45 }], goal: { type: 'beforeGuet', label: 'Vaincre avant l\'arrivée du guet (45 s)' },
    outro: [L_('voleur', 'Assez ! Un marquis… un homme qui collectionne les horloges. Il m\'a payé en louis neufs.'),
      L_('isaure', 'Et le Registre ?'),
      L_('voleur', 'Déjà vendu, page par page. Demain, sur le Pont-Neuf, une page doit faire couler le sang du roi.'),
      L_('narr', 'Le sifflet du guet retentit. Isaure disparaît dans l\'ombre d\'une lucarne.')],
    rewards: { botte: 'pied', ecus: 40 } },
  { id: 'ch03', act: 'Acte I · Le vol', title: 'Rouge contre Bleu', venue: 'nuit', hero: 'bastien',
    intro: [L_('narr', 'Le Pont-Neuf, de nuit. Un mousquetaire du roi attend, une page arrachée à la main : on lui a dit qu\'un garde du Cardinal y avait écrit l\'insulte.'),
      L_('bastien', 'Moi qui voulais porter la casaque bleue… me voilà à la croiser, et pour un mensonge.'),
      L_('mousquetaire', 'Un rouge, ici ? Tire l\'épée, chien du Cardinal. Ta page dit que mon capitaine est un lâche.'),
      L_('bastien', 'Ma page dit surtout qu\'on veut un mort ce soir. Je ne te le donnerai pas.')],
    choice: { prompt: 'Le mousquetaire vous toise.', options: [{ id: 'provoquer', label: 'Le provoquer', desc: 'Il attaque davantage ; vous avez la Riposte sanglante pour ce duel.' }, { id: 'saluer', label: 'Le saluer', desc: 'Il se calme ; le guet tarde de 10 s.' }] },
    fights: [{ foe: 'Mousquetaire du roi', wins: 2, guet: true, timer: 60 }], goal: { type: 'all', of: [{ stat: 'perfect', op: '>=', v: 3 }, { stat: 'crits', op: '<=', v: 0 }], label: '3 parades parfaites, aucune blessure grave infligée' },
    outro: [L_('mousquetaire', 'Vous auriez pu me saigner trois fois. Pourquoi ?'),
      L_('bastien', 'Parce qu\'un mousquetaire mort, demain, c\'était la guerre des casaques. Quelqu\'un la veut. Pas moi.'),
      L_('mousquetaire', 'Alors gardez cette page. Je ne l\'ai jamais lue.'),
      L_('narr', 'Au bas de la page, une signature : « A. de B. », et le dessin minutieux d\'un rouage d\'horloge.')],
    rewards: { rapier: 'tolede', ecus: 60 } },
  { id: 'ch04', act: 'Acte II · La traque', title: 'Le Cercle et la Ligne', venue: 'salle', hero: 'alvaro',
    intro: [L_('narr', 'Une salle d\'armes espagnole, près du Louvre. Un cercle mystérieux est tracé au sol, à la manière de Madrid.'),
      L_('gaspar', 'Álvaro. Toujours la línea recta, comme à l\'académie ? Moi, j\'ai appris à vendre ce que je trouve.'),
      L_('alvaro', 'Tu as acheté une page du Registre, Gaspar. Rends-la, et je t\'épargne la leçon.'),
      L_('gaspar', 'Une page contre une touche. Mais d\'abord, bats mon élève. Le compás ne se discute pas, il se démontre.')],
    fights: [{ foe: 'Diestro de Séville', wins: 1 }, { foe: 'gaspar', wins: 2 }], goal: { type: 'stat', stat: 'beatOk', op: '>=', v: 2, label: '2 battements réussis (→ + Feinte)' },
    outro: [L_('gaspar', 'Tu bats le fer comme un forgeron, Álvaro. C\'est vulgaire… et efficace.'),
      L_('alvaro', 'La page.'),
      L_('gaspar', 'La voici. Celui qui me l\'a vendue parle de Notre-Dame et des cloches. Et il a des amis aux écailles grises.')],
    rewards: { botte: 'etourdir', ecus: 70 } },
  { id: 'ch05', act: 'Acte II · La traque', title: 'La Lanterne', venue: 'nuit', hero: 'isaure',
    intro: [L_('narr', 'Pont-Neuf, minuit. Une femme attend sous la statue du roi Henri, une lanterne à la main.'),
      L_('ombeline', 'Isaure. Dix ans, et tu portes toujours tes couteaux à la cheville.'),
      L_('isaure', 'Ombeline. Tu as choisi l\'or du marquis, j\'ai choisi le Cardinal. On a toutes deux menti.'),
      L_('ombeline', 'Regarde bien ma lanterne, petite sœur. Elle ne ment jamais, elle.'),
      L_('narr', 'Astuce : la lanterne d\'Ombeline se lève avant une vraie attaque et reste basse pendant ses feintes.')],
    fights: [{ foe: 'ombeline', wins: 2 }], goal: { type: 'noRoundLost', label: 'Gagner sans perdre de manche' },
    outroChoice: { prompt: 'Ombeline est à terre, la lanterne brisée.', options: [{ id: 'epargner', label: 'L\'épargner', desc: 'Elle vous devra une dette : elle vous aidera au chapitre 9 (+20 de vie de départ).' }, { id: 'livrer', label: 'La livrer au Cardinal', desc: '+100 écus de récompense.' }] },
    outro: [L_('ombeline', 'Le marquis s\'appelle Anselme de Brévannes. Il veut la disgrâce du Cardinal, pas sa mort. Il trouve ça plus élégant.'),
      L_('isaure', 'Et toi, que veux-tu ?'),
      L_('ombeline', 'Moi ? Revoir la lumière du jour. Tu as fait ton choix ; vis avec.')],
    rewards: { rapier: 'milanaise', botte: 'riposte', ecus: 60 } },
  { id: 'ch06', act: 'Acte II · La traque', title: 'Sous les fenêtres de Son Éminence', venue: 'cloitre', hero: 'mathurin',
    intro: [L_('narr', 'La cour du Palais-Cardinal, à l\'heure de la relève. Une poterne entrouverte donne sur la rue des Bons-Enfants.'),
      L_('mathurin', 'Rouvray. J\'ai servi sous toi dix ans. Tu ouvres la porte du Cardinal à des dracs ?'),
      L_('rouvray', 'J\'ouvre la porte à l\'avenir, Brise-Garde. Le marquis paie mieux que Son Éminence, et il paie en avance.'),
      L_('mathurin', 'Alors je vais te rembourser. En coups.')],
    fights: [{ foe: 'Lieutenant des gardes', wins: 1 }, { foe: 'rouvray', wins: 2 }], goal: { type: 'flag', flag: 'breaks', op: '>=', v: 2, label: 'Briser la garde adverse 2 fois (Attaque maintenue)' },
    outro: [L_('rouvray', 'Tu frappes toujours comme un bélier, Mathurin…'),
      L_('mathurin', 'Et toi, tu mens toujours comme un capitaine. Qui attend derrière la poterne ?'),
      L_('rouvray', 'La Confrérie de l\'Écaille grise. Ils montent par les toits, cette nuit même.')],
    rewards: { rapier: 'pappenheimer', ecus: 80 } },
  { id: 'ch07', act: 'Acte II · La traque', title: 'Le Sang-froid du drac', venue: 'loggia', hero: 'corvin',
    intro: [L_('narr', 'Les toits, sous la lune. Des ombres trop larges pour des hommes se faufilent entre les cheminées.'),
      L_('corvin', 'Des dracs. Ils ont la peau dure et les griffes qui brisent la garde. Mais leurs jambes sont celles de tout le monde.'),
      L_('drac', 'Une lame de l\'Ombre, seule ? La Confrérie paiera bien ta tête, humain.'),
      L_('corvin', 'Je ne suis pas tout à fait seul. Je suis accompagné de mon sang-froid.')],
    fights: [{ foe: 'Drac des bas-fonds', wins: 1 }, { foe: 'Drac mercenaire', wins: 1 }], goal: { type: 'flag', flag: 'legWound', op: '>=', v: 1, label: 'Blesser un drac à la jambe (coup critique : riposte parfaite ou coup d\'arrêt)' },
    outro: [L_('drac', 'Le Chevalier… t\'arrachera le cœur… sous les cloches.'),
      L_('corvin', 'Les cloches de Notre-Dame. Il reste une page, et j\'ai bien peur de savoir quel nom elle porte.'),
      L_('narr', 'Sur la dernière page du Registre, Corvin le sait, est écrit son vrai nom.')],
    rewards: { botte: 'botte', ecus: 80 } },
  { id: 'ch08', act: 'Acte III · Les cloches', title: 'L\'Horloger', venue: 'cloitre', hero: 'vaucelles',
    intro: [L_('narr', 'Le Palais-Cardinal, de nuit. Le marquis de Brévannes attend au milieu de la cour, une montre ouverte à la main.'),
      L_('brevannes', 'Capitaine de Vaucelles. Vous avez onze secondes de retard. Les vieux loups perdent le sens de l\'heure.'),
      L_('vaucelles', 'Et les horlogers perdent souvent le sens du ridicule. Le Registre, marquis.'),
      L_('brevannes', 'Venez le prendre. Mais je vous préviens : j\'attaque toujours au moment où vous commencez.'),
      L_('narr', 'Astuce : un tic-tac précède ses coups d\'arrêt. Ne vous jetez pas sur ses appâts : faites-le venir, puis punissez.')],
    fights: [{ foe: 'brevannes', wins: 2 }], goal: { type: 'stat', stat: 'whiffs', op: '<=', v: 3, label: 'Vaincre avec 3 attaques manquées au plus' },
    outro: [L_('brevannes', 'Remarquable. Vous avez attendu. Personne n\'attend jamais.'),
      L_('vaucelles', 'Le Registre.'),
      L_('brevannes', 'Il est déjà ailleurs, capitaine. À l\'aube, sous les cloches de Notre-Dame. Bonne nuit.'),
      L_('narr', 'Une fumée, un bruit de rouage : le marquis a disparu par une trappe. Il reste quelques heures avant l\'aube.')],
    rewards: { botte: 'sangfroid', ecus: 90 } },
  { id: 'ch09', act: 'Acte III · Les cloches', title: 'La Nuit des sept lames', venue: 'nuit', hero: null, chain: true,
    intro: [L_('tancrede', 'Le marquis fuit vers Notre-Dame. Trois routes : le Pont-Neuf, les toits, la cour du Palais. Il faut les tenir toutes avant l\'aube.'),
      L_('vaucelles', 'Alors une seule lame les tiendra toutes. Choisissez la vôtre, et ne vous arrêtez pas.'),
      L_('narr', 'Trois duels d\'une manche, enchaînés. La vie ne revient qu\'en partie entre deux.')],
    fights: [{ foe: 'Garde du Cardinal', wins: 1, venue: 'nuit' }, { foe: 'Spadassin espagnol', wins: 1, venue: 'loggia' }, { foe: 'Drac mercenaire', wins: 1, venue: 'cloitre' }], goal: { type: 'hpLeft', v: 30, label: 'Finir la nuit avec plus de 30 de vie' },
    outro: [L_('narr', 'À l\'aube, les trois routes sont tenues. Au loin, le premier coup de cloche de Notre-Dame.'),
      L_('tancrede', 'Il est entré dans la cathédrale. Le Chevalier d\'Écaille l\'attend avec le Registre.')],
    rewards: { rapier: 'venitienne', ecus: 150 } },
  { id: 'ch10', act: 'Acte III · Les cloches', title: 'Les Cloches de Notre-Dame', venue: 'eglise', hero: null,
    intro: [L_('narr', 'Notre-Dame, à l\'aube. Les cierges brûlent par centaines. Devant l\'autel, un drac en armure tient le Registre écarlate.'),
      L_('ecaille', 'Une lame de l\'Ombre. Le marquis voulait la disgrâce du Cardinal. Moi, je veux que Paris brûle et que la France s\'agenouille.'),
      L_('ecaille', 'Le Registre est sur l\'autel. Viens le prendre, si tes jambes te portent jusque-là.'),
      L_('narr', 'Astuce : ses écailles luisent avant chaque coup de griffe. La garde tenue ne l\'arrête pas : parez au dernier moment, ou rompez.')],
    fights: [{ foe: 'ecaille', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites contre le Chevalier' },
    outroChoice: { prompt: 'Le Registre écarlate est entre vos mains. Frère Tancrède tend la main.', options: [{ id: 'rendre', label: 'Le rendre au Cardinal', desc: 'Les lames restent à son service.' }, { id: 'bruler', label: 'Le brûler dans les cierges', desc: 'Plus personne ne connaîtra vos noms. Pas même lui.' }] },
    outro: [L_('ecaille', 'Les cloches… sonnent pour toi, lame…'),
      L_('tancrede', 'Le Registre, je vous prie. Son Éminence attend.')],
    endings: {
      rendre: [L_('tancrede', 'Son Éminence vous remercie. Il garde le Registre… et vos noms. Il saura toujours où vous trouver.'), L_('vaucelles', 'C\'est le prix de l\'Ombre. Nous l\'avons toujours su.'), L_('narr', 'Fin. Les six lames servent encore. Le Cardinal, lui, n\'oublie rien.')],
      bruler: [L_('narr', 'Les pages s\'enroulent dans les flammes des cierges. Six noms montent en fumée vers les voûtes.'), L_('tancrede', 'Son Éminence sera… contrariée. Mais je n\'ai rien vu. Je suis capucin : je baisse souvent les yeux.'), L_('narr', 'Fin. Les six lames sont libres. Et peut-être, demain, se battront-elles encore pour lui. Par choix.')] },
    rewards: { rapier: 'ferrara', ecus: 200 } },
];

const Story = {
  cur: null, hero: null, flags: {}, choiceMods: null,
  data() { const d = Save.data; if (!d.story) d.story = { done: {}, boons: [], boonEquipped: null, choices: {}, ending: null }; return d.story; },
  unlocked(i) { if (STORY[i].side) return !!this.data().done.ch10; return i === 0 || !!this.data().done[STORY[i - 1].id]; },
  filt(lines) { const S = this.data(); return lines.filter(l => !l.cond || l.cond(S)); }, // répliques qui dépendent de vos choix
  init() {
    // héros imposé par le chapitre (sinon le héros choisi)
    const curHero0 = curHero; curHero = function () { return Story.hero && (G.mode === 'story' || G.state === 'scene') && HEROES[Story.hero] ? HEROES[Story.hero] : curHero0(); };
    $('goStory').addEventListener('click', () => { Snd.init(); Music.play('menu'); this.showList(); });
    $('storyBack').addEventListener('click', () => G.show('menu'));
    $('scene').addEventListener('pointerdown', e => { if (e.target.closest('button')) return; e.preventDefault(); this.next(); });
    $('sceneSkip').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); this.skip(); });
    addEventListener('keydown', e => { if (G.state !== 'scene') return; if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') { e.preventDefault(); this.next(); } else if (e.code === 'Escape') this.skip(); });
    $('seGo').addEventListener('click', () => this.afterEnd('go')); $('seRetry').addEventListener('click', () => this.afterEnd('retry')); $('seList').addEventListener('click', () => this.afterEnd('list'));
    // les avantages de l'histoire (bottes) jouent aussi en Histoire et dans la Nuit de Paris
    const has0 = Run.has.bind(Run); Run.has = id => has0(id) || ((G.mode === 'story' || G.mode === 'run') && Story.data().boonEquipped === id) || (G.mode === 'story' && Story.choiceMods && Story.choiceMods.boon === id);
    const ev0 = G.event.bind(G); G.event = (type, info) => { ev0(type, info); this.onEvent(type, info); };
  },
  // ---- écran des chapitres ----
  showList() {
    const S = this.data(), box = $('storyList'); box.innerHTML = '';
    let act = '';
    STORY.forEach((c, i) => {
      if (c.act !== act) { act = c.act; const h = document.createElement('div'); h.className = 'eyebrow'; h.textContent = act; box.appendChild(h); }
      const d = S.done[c.id], open = this.unlocked(i), b = document.createElement('button'); b.className = 'opt chap'; b.disabled = !open;
      const hero = c.hero ? HEROES[c.hero].name.split(',')[0] : 'Héros au choix';
      b.innerHTML = `<b>${i + 1}. ${c.title}</b><span>${open ? hero + ' · ' + VENUES[c.venue].name + (LESSONS[c.id] ? ' · leçon : ' + LESSONS[c.id].name : '') : 'Verrouillé'}</span><i class="stars">${d ? '★'.repeat(d.stars) + '☆'.repeat(3 - d.stars) : open ? 'Nouveau' : ''}</i>`;
      b.addEventListener('click', () => this.play(i)); box.appendChild(b);
    });
    // bottes secrètes : une seule portée à la fois
    const bb = $('storyBottes'); bb.innerHTML = '';
    if (!S.boons.length) bb.innerHTML = '<span class="keys">Aucune botte secrète pour l\'instant : les chapitres en enseignent.</span>';
    for (const k of S.boons) { const o = document.createElement('button'); o.className = 'opt small'; o.setAttribute('aria-pressed', S.boonEquipped === k); o.title = BOONS[k].desc; o.innerHTML = `<b>${BOONS[k].name}</b><span>${BOONS[k].desc}</span>`; o.addEventListener('click', () => { S.boonEquipped = S.boonEquipped === k ? null : k; Save.persist(); this.showList(); }); bb.appendChild(o); }
    $('storyEnding').textContent = S.ending ? (S.ending === 'bruler' ? 'Votre fin : le Registre a brûlé.' : 'Votre fin : le Registre est rendu au Cardinal.') : '';
    G.show('story');
  },
  // ---- déroulé d'un chapitre ----
  play(i) {
    const c = STORY[i]; this.hero = c.hero; this.flags = { breaks: 0, legWound: 0 }; this.choiceMods = null;
    this.cur = { i, c, fight: 0, phase: 'intro', lines: this.filt(c.intro), k: 0, hp: null, grades: [], wonAll: true };
    this.stage(c.venue, null); Cine.begin(c.id, 'intro');
    Cine.title = { act: c.act.split(' · ')[0], n: i + 1, title: c.title, t0: performance.now() }; $('scene').hidden = true; $('sceneChoices').innerHTML = ''; this.cur.titling = true; Snd.bell();
    clearTimeout(this.titleT); this.titleT = setTimeout(() => this.endTitle(), 2300);
  },
  endTitle() { const c = this.cur; clearTimeout(this.titleT); if (!c || !c.titling) return; c.titling = false; Cine.title = null; this.showLine(); },
  stage(venue, foeKey) { // le décor et les deux duellistes en fond de scène
    G.mode = 'story'; G.venue = venue; G.fixedVenue = venue; G.state = 'scene'; G.show(null); $('touch').hidden = true; G.banner = null;
    applyAvatar(); const f = foeOf(foeKey || this.cur.c.fights[0].foe); if (f) { G.e.look = Object.assign({}, f.look(), { name: f.name }); G.e.arch = f.arch || null; }
    G.p.reset(330); G.e.reset(630); G.clearIntent(G.p); G.clearIntent(G.e); G.weather = 'clear'; G.guet = false; Music.play('menu');
  },
  showLine() {
    const c = this.cur, l = c.lines[c.k], sp = SPK[l.who] || SPK.narr, box = $('scene');
    box.hidden = false; $('sceneChoices').innerHTML = ''; $('sceneTap').hidden = false;
    const bub = Cine.line(c.k, l); box.classList.toggle('bub', !!bub); box.classList.toggle('narr', !bub && !sp.name);
    $('sceneName').textContent = sp.name; $('sceneCrest').textContent = sp.name ? sp.name.replace(/^(Maître|Frère|Don|Dom|Le marquis de|Le|Capitaine de)\s+/i, '').charAt(0) : '';
    $('sceneCrest').style.background = sp.col; $('sceneCrest').hidden = !sp.name; $('sceneText').textContent = l.txt; $('sceneText').classList.toggle('narr', !sp.name);
    $('sceneEye').textContent = `${c.c.act} · Chapitre ${c.i + 1} : ${c.c.title}`;
  },
  next() { const c = this.cur; if (!c || G.state !== 'scene' || c.choosing) return; if (c.titling) return this.endTitle(); if (!Cine.revealed()) return Cine.reveal(); Snd.tick(); c.k++; if (c.k < c.lines.length) this.showLine(); else this.endLines(); },
  skip() { const c = this.cur; if (!c || G.state !== 'scene' || c.choosing) return; if (c.titling) { c.titling = false; Cine.title = null; } c.k = c.lines.length; this.endLines(); },
  endLines() {
    const c = this.cur;
    if (c.phase === 'intro') { if (c.c.choice && !c.chosen) return this.ask(c.c.choice, id => { this.data().choices[c.c.id] = id; this.choiceMods = c.c.id === 'ch03' ? (id === 'provoquer' ? { aggr: .2, boon: 'riposte' } : { aggr: -.1, guet: 10 }) : null; this.fight(); }); return this.fight(); }
    if (c.phase === 'outro') { if (c.c.outroChoice && !c.chosenEnd) return this.ask(c.c.outroChoice, id => { c.chosenEnd = id; this.data().choices[c.c.id] = id; if (c.c.endings) { c.lines = this.filt(c.c.endings[id]); c.k = 0; Cine.begin(c.c.id, id); this.showLine(); } else this.finish(); }); return this.finish(); }
  },
  ask(ch, cb) {
    const c = this.cur; c.choosing = true; $('scene').classList.remove('bub'); Cine.bubble = null; $('sceneTap').hidden = true; $('sceneName').textContent = ''; $('sceneCrest').hidden = true; $('sceneText').textContent = ch.prompt; $('sceneText').classList.add('narr');
    const box = $('sceneChoices'); box.innerHTML = '';
    for (const o of ch.options) { const b = document.createElement('button'); b.className = 'btn'; b.innerHTML = `${o.label}<small>${o.desc}</small>`; b.addEventListener('click', e => { e.stopPropagation(); c.choosing = false; c.chosen = true; Snd.ding(); cb(o.id); }); box.appendChild(b); }
  },
  fight() {
    const c = this.cur, F = c.c.fights[c.fight], f = foeOf(F.foe), venue = F.venue || c.c.venue; c.phase = 'fight'; $('scene').hidden = true; Cine.end();
    const tw = Object.assign({}, f.tweak, this.choiceMods && this.choiceMods.aggr ? { aggr: (f.tweak && f.tweak.aggr || .5) + this.choiceMods.aggr } : {});
    // nuit enchaînée : la vie ne revient qu'en partie ; sans l'aide d'Ombeline (livrée au chapitre 5), on part entamé
    const hp = !c.c.chain ? null : c.fight === 0 ? (this.data().choices.ch05 === 'livrer' ? 80 : 100) : Math.min(100, c.hp + 35);
    G.storyGuet = !!F.guet; G.storyTimer = F.guet ? (F.timer || 60) + (this.choiceMods && this.choiceMods.guet || 0) : 999;
    G.startMatch({ mode: 'story', venue, wins: F.wins || 2, hp, opp: { name: f.name, level: f.level, tweak: tw, arch: f.arch, rapier: f.rapier, look: f.look(), sig: f.sig, boss: { gaspar: 'fer', rouvray: 'force', brevannes: 'temps', ecaille: 'griffe', ombeline: 'feinte' }[F.foe] || null } });
    const Ls = LESSONS[c.c.id]; this.lesson = Ls ? { L: Ls, t0: performance.now() } : null;
    G.banner = { text: c.c.title, sub: `${f.name}${c.c.fights.length > 1 ? ` · duel ${c.fight + 1}/${c.c.fights.length}` : ''}${c.c.goal && c.c.goal.label ? ' · ' + c.c.goal.label : ''}`, t: 0, dur: 2.4 };
  },
  onEvent(type, info) {
    if (G.mode !== 'story' || !info) return;
    if (type === 'break' && info.a && info.a.isPlayer) this.flags.breaks++;
    if (type === 'hit' && info.a && info.a.isPlayer && info.zone === 'jambe') this.flags.legWound++;
  },
  // appelé par G.afterRound quand le duel est joué
  onFightEnd(won) {
    Manuscrit.onMatchEnd(won);
    const c = this.cur; if (!c) return; const s = G.p.stats, gr = duelGrade(s, (s.taken || 0) / Math.max(1, G.wins[0] + G.wins[1]), won); c.grades.push(gr.g); c.hp = G.p.hp;
    Music.play(won ? 'victoire' : 'defaite');
    if (!won) return this.endScreen(false);
    if (c.fight + 1 < c.c.fights.length) { c.fight++; return this.endScreen(true, true); }
    c.goalOk = this.goalMet(c.c.goal, c); const Ls = LESSONS[c.c.id]; c.lessonOk = !!(Ls && Ls.ok(G.p.stats)); this.endScreen(true, false);
  },
  goalMet(g, c) {
    if (!g) return true; const s = G.p.stats, cmp = (a, op, v) => op === '>=' ? a >= v : op === '<=' ? a <= v : a === v;
    switch (g.type) {
      case 'win': return true;
      case 'stat': return cmp(s[g.stat] || 0, g.op, g.v);
      case 'flag': return cmp(this.flags[g.flag] || 0, g.op, g.v);
      case 'beforeGuet': return G.endWhy !== 'Le guet !';
      case 'noRoundLost': return G.wins[1] === 0;
      case 'hpLeft': return G.p.hp > g.v;
      case 'all': return g.of.every(x => this.goalMet(Object.assign({ type: 'stat' }, x), c));
    }
    return true;
  },
  endScreen(won, more) {
    const c = this.cur; G.state = 'over'; c.next = !won ? 'retry' : more ? 'fight' : 'outro';
    $('seEye').textContent = `Chapitre ${c.i + 1} · ${c.c.title}`; $('seTitle').textContent = won ? (more ? 'Duel gagné' : 'Chapitre réussi') : 'Défaite';
    const goal = c.c.goal;
    $('seGoal').textContent = !won ? 'Le chapitre reprend à ce duel.' : more ? `Duel suivant : ${foeOf(c.c.fights[c.fight].foe).name}` : goal ? `${c.goalOk ? '✓' : '✗'} ${goal.label}` + (LESSONS[c.c.id] ? `  ·  ${c.lessonOk ? '✓' : '✗'} Leçon : ${LESSONS[c.c.id].label}` : '') + (c.goalOk && c.lessonOk ? '' : ' (rejouez le duel pour les étoiles manquées)') : '';
    $('seGo').hidden = !won; $('seGo').textContent = more ? 'Duel suivant' : 'Continuer';
    $('seRetry').hidden = more; $('seRetry').textContent = won ? 'Rejouer le duel' : 'Réessayer';
    G.show('storyEnd');
  },
  afterEnd(a) {
    const c = this.cur; if (!c) return G.show('menu');
    if (a === 'list') { Cine.end(); this.cur = null; this.hero = null; G.toMenu(); return this.showList(); }
    if (a === 'retry') { if (c.c.chain) { c.fight = 0; c.hp = null; } c.goalOk = undefined; c.grades = []; this.flags = { breaks: 0, legWound: 0 }; return this.fight(); }
    if (c.next === 'fight') return this.fight();
    c.phase = 'outro'; c.lines = this.filt(c.c.outro); c.k = 0; this.stage(c.c.venue, c.c.fights[c.c.fights.length - 1].foe); Cine.begin(c.c.id, 'outro'); this.showLine(); // scène de fin
  },
  finish() {
    const c = this.cur, S = this.data(), R = c.c.rewards || {}, out = [];
    const grade = c.grades[c.grades.length - 1] || 'C', stars = 1 + (c.goalOk ? 1 : 0) + (c.lessonOk ? 1 : 0), prev = S.done[c.c.id];
    S.done[c.c.id] = { stars: Math.max(stars, prev ? prev.stars : 0), grade };
    if (!prev) { // récompenses la première fois seulement
      if (R.ecus) { Save.data.ecus += R.ecus; out.push(`+${R.ecus} écus`); }
      if (R.rapier && RAPIERS[R.rapier]) { if (!Save.data.owned.includes(R.rapier)) { Save.data.owned.push(R.rapier); out.push(RAPIERS[R.rapier].name); } else { Save.data.ecus += 50; out.push('+50 écus (rapière déjà possédée)'); } }
      if (R.botte && !S.boons.includes(R.botte)) { S.boons.push(R.botte); if (!S.boonEquipped) S.boonEquipped = R.botte; out.push('botte secrète : ' + BOONS[R.botte].name); }
      if (c.c.id === 'ch05' && c.chosenEnd === 'livrer') { Save.data.ecus += 100; out.push('+100 écus'); }
    }
    if (c.c.id === 'ch10') S.ending = c.chosenEnd || 'rendre';
    Codex.onChapter(c.c.id);
    Save.persist(); $('scene').hidden = true; Cine.end(); this.cur = null; this.hero = null; G.toMenu(); this.showList();
    const n = $('storyNote'); n.textContent = `Chapitre ${c.i + 1} terminé · ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}${out.length ? ' · ' + out.join(' · ') : ''}`;
  },
  // carte de leçon, sous le bandeau, au début de chaque duel du mode Histoire
  drawLesson(g, u) {
    const l = this.lesson; if (!l || G.mode !== 'story' || !(G.state === 'fight' || G.state === 'round')) return; if (G.banner || CutIn.cur) { l.t0 = performance.now(); return; } const t = (performance.now() - l.t0) / 1000; /* attend la fin du bandeau */ if (t > 9) { this.lesson = null; return; }
    const a = Math.min(1, t / .4, (9 - t) / .6), w = 520 * Math.min(u, 1.2), x = W / 2 - w / 2, y = 92 * u; g.save(); g.globalAlpha = a;
    g.fillStyle = 'rgba(12,9,8,.82)'; g.fillRect(x, y, w, 48 * u); g.fillStyle = '#d8b25e'; g.fillRect(x, y, 3 * u, 48 * u);
    g.textAlign = 'left'; g.font = `800 ${Math.round(11 * u)}px "Alegreya Sans", sans-serif`; g.fillStyle = '#d8b25e'; g.fillText(('Leçon · ' + l.L.name + ' · défi : ' + l.L.label).toUpperCase(), x + 12 * u, y + 16 * u);
    g.font = `600 ${Math.round(13 * u)}px "Alegreya Sans", sans-serif`; g.fillStyle = '#f2e2b8'; const lines = wrapLines(g, l.L.tip, w - 24 * u); lines.slice(0, 2).forEach((s2, i) => g.fillText(s2, x + 12 * u, y + 33 * u + i * 15 * u));
    g.restore();
  },
  // signes des adversaires signature, dessinés dans le décor (repère monde)
  drawSig(g) {
    const e = G.e; if (!e.sig || !e.J || G.state === 'menu') return; const j = e.J, atk = e.state === 'attack' && e.move && e.move.kind !== 'pending' && e.phase() === 'prep';
    if (e.sig === 'lanterne') { const up = atk ? 1 : 0, x = j.bwr[0], y = j.bwr[1] + 6 - up * 26; this.lanUp = lerp(this.lanUp || 0, up, .25); const yy = j.bwr[1] + 6 - this.lanUp * 26;
      g.strokeStyle = '#3a2a1a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, j.bwr[1]); g.lineTo(x, yy - 6); g.stroke(); glow(g, x, yy, 26, 'rgba(255,190,90,A)', .55 + this.lanUp * .35);
      g.fillStyle = '#2a1e12'; g.fillRect(x - 5, yy - 6, 10, 12); g.fillStyle = '#ffd27a'; g.fillRect(x - 3, yy - 4, 6, 8); void y; }
    if (e.sig === 'ecaille' && e.state === 'attack' && e.move && e.move.kind === 'griffe' && e.phase() === 'prep') glow(g, j.neck[0], (j.neck[1] + j.gy) / 2, 60, 'rgba(120,255,160,A)', .45 + .2 * Math.sin(G.time * 30));
  },
  step() {
    const e = G.e; if (G.mode !== 'story' || e.sig !== 'horloger' || G.state !== 'fight') return;
    if (e.state === 'attack' && e.move && e.move.id !== this.tickId && e.move.kind !== 'pending') { this.tickId = e.move.id; if (G.p.state === 'attack' || e.move.kind === 'jab') { Snd.tick(); setTimeout(() => Snd.tick(), 110); } } // tic-tac avant ses coups d'arrêt
  },
};
