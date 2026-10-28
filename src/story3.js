// =============================== 2.0 · sprint 20 : Livre II « Le Sel et la Cendre » (8 chapitres, 2 actes) ===============================
// Intrigue, personnages et dialogues originaux. Faits historiques cités : la gabelle et les faux-sauniers, la poste aux chevaux,
// la digue que Richelieu fit barrer devant La Rochelle (1627-1628). Le Prince de Sel, la Mouette noire et leurs gens sont inventés.
// La fin dépend du choix fait à Notre-Dame (Registre rendu ou brûlé) et de la Saunière (épargnée ou livrée).
Object.assign(SPK, {
  copiste: { name: 'Maître Anselin, copiste', col: '#4a4030' }, postillon: { name: 'Le postillon', col: '#5a3a1a' }, maitreposte: { name: 'Le maître de poste', col: '#6a4a2a' },
  sauniere: { name: 'La Saunière', col: '#5a5a6a' }, dracmarais: { name: 'Le drac des marais', col: '#3a5a4a' }, corsaire: { name: 'Ysaline Brac, la Corsaire', col: '#1a1a2a' },
  bosco: { name: 'Le bosco', col: '#4a3a2a' }, harponneur: { name: 'Le harponneur', col: '#2a3a4a' }, ingenieur: { name: 'L\'Ingénieur', col: '#3a3a2a' },
  sentinelle: { name: 'La sentinelle du Prince', col: '#4a4a52' }, prince: { name: 'Le Prince de Sel', col: '#c8c4b8' },
});
Object.assign(STORY_FOES, {
  copiste: { name: 'Maître Anselin', level: 'duelliste', tweak: { slow: 1.6, feint: .3, dashBack: .4 }, rapier: 'garnison', offhand: 'dague', look: () => mk('duelliste', { coat: '#4a4030', coat2: '#2a2418', hose: '#2a2418', beard: 'none', hair: '#8a8278', hatType: 'beret', hat: '#2a2418', plume: null, cape: null }) },
  postillon: { name: 'Le postillon', level: 'duelliste', tweak: { slow: 1.6, aggr: .65 }, rapier: 'garnison', offhand: null, look: () => mk('duelliste', { style: 'paysan', coat: '#7a4a1a', coat2: '#4a2a10', hose: '#3a2a1a', hatType: 'beret', hat: '#3a2a1a', beard: 'moustache', cape: null, plume: null }) },
  maitreposte: { name: 'Le maître de poste', level: 'duelliste', tweak: { slow: 1.5, aggr: .45 }, rapier: 'pappenheimer', offhand: 'rondache', look: () => mk('duelliste', { coat: '#6a4a2a', coat2: '#3a2a14', hose: '#3a2a14', beard: 'full', hair: '#5a4a3a', hatType: 'feutre', hat: '#2a1a10', plume: '#c8a050' }) },
  sauniere: { name: 'La Saunière', level: 'duelliste', tweak: { slow: 1.45, feint: .5, dashBack: .5, esq: .2 }, rapier: 'milanaise', offhand: 'cape', look: () => mk('duelliste', { style: 'dame', body: 'f', coat: '#5a5a6a', coat2: '#2e2e3a', hose: '#2e2e3a', hairStyle: 'chignon', beard: 'none', hair: '#3a2a1a', cape: '#3a3a46', plume: '#e8e4dc' }) },
  dracmarais: { name: 'Le drac des marais', level: 'maitre', arch: 'drac', tweak: { slow: 1.35 }, rapier: 'ferrara', offhand: null, look: () => Object.assign({}, RUN_TIERS[RUN_TIERS.length - 1].foes[0].look(), { coat: '#2e4a3a', coat2: '#1a2e22', skin: '#5a7a5a' }) },
  corsaire: { name: 'Ysaline Brac, la Corsaire', level: 'maitre', tweak: { slow: 1.4, feint: .45, esq: .2, aggr: .55 }, rapier: 'tolede', offhand: 'dague', boss: 'feinte', look: () => mk('maitre', { style: 'dame', body: 'f', coat: '#1a1a2a', coat2: '#0e0e18', hose: '#0e0e18', hairStyle: 'long', hair: '#7a2a14', beard: 'none', hatType: 'feutre', hat: '#121218', plume: '#c8202a', cape: '#3a0e14' }) },
  bosco: { name: 'Le bosco', level: 'duelliste', tweak: { slow: 1.5, aggr: .6 }, rapier: 'pappenheimer', offhand: 'dague', look: () => mk('duelliste', { style: 'paysan', coat: '#4a3a2a', coat2: '#2a2018', hose: '#2a2018', hairStyle: 'chauve', beard: 'full', hatType: 'aucun', cape: null, plume: null }) },
  harponneur: { name: 'Le harponneur', level: 'duelliste', tweak: { slow: 1.45, aggr: .6 }, rapier: 'garnison', offhand: null, look: () => mk('duelliste', { style: 'paysan', coat: '#2a3a4a', coat2: '#16202a', hose: '#16202a', beard: 'moustache', hatType: 'beret', hat: '#16202a', cape: null, plume: null }) },
  sentinelle: { name: 'La sentinelle du Prince', level: 'maitre', tweak: { slow: 1.5 }, rapier: 'pappenheimer', offhand: 'rondache', look: () => mk('maitre', { coat: '#4a4a52', coat2: '#2a2a30', hose: '#2a2a30', trim: '#c8c4b8', beard: 'full', cape: '#2a2a30', plume: '#c8c4b8' }) },
  ingenieur: { name: 'L\'Ingénieur', level: 'maitre', sig: 'horloger', tweak: { slow: 1.45, stopHit: .4, bait: .25 }, rapier: 'venitienne', offhand: null, look: () => mk('maitre', { coat: '#3a3a2a', coat2: '#1e1e14', hose: '#1e1e14', beard: 'pointed', hair: '#6a6258', cape: '#1e1e14', plume: null, hatType: 'feutre' }) },
  prince: { name: 'Le Prince de Sel', level: 'maitre', tweak: { slow: 1.3, perfect: .5, react: .17, fer: .3, derob: .6, stopHit: .3 }, rapier: 'ferrara', offhand: 'rondache', boss: 'temps', look: () => mk('maitre', { coat: '#d8d4c8', coat2: '#8a867a', hose: '#4a4840', trim: '#e8e4dc', beard: 'pointed', hair: '#e8e4dc', cape: '#8a867a', plume: '#f4f0e6', hatType: 'feutre', hat: '#e8e4dc' }) },
});
const ACT4 = 'Livre II · Acte IV · La route de l\'Ouest', ACT5 = 'Livre II · Acte V · Le sel et la cendre';
const rendu = S => S.choices.ch10 !== 'bruler', brule = S => S.choices.ch10 === 'bruler', LC = (l, cond) => Object.assign(l, { cond });
STORY.push(
  { id: 'b01', book: 2, act: ACT4, title: 'La Copie', venue: 'salle', hero: 'vaucelles',
    intro: [L_('narr', 'Paris, printemps 1633. Le Registre écarlate n\'est plus qu\'un souvenir. Du moins, on le croyait.'),
      L_('lacombe', 'Capitaine. Un copiste de la rue de la Parcheminerie a passé trois nuits sur le Registre avant Notre-Dame. Il en a fait une copie.'),
      LC(L_('vaucelles', 'Le Cardinal garde l\'original sous clef. Une copie, c\'est la même corde, tenue par une autre main.'), rendu),
      LC(L_('vaucelles', 'J\'ai vu ces pages brûler dans les cierges. Et voilà qu\'elles renaissent, de la main d\'un scribe.'), brule),
      L_('copiste', 'Je copie ce qu\'on me paie à copier, capitaine. Et je me défends comme on me l\'a appris : la plume à droite, la dague à gauche.'),
      L_('narr', 'Astuce : il pare de la dague. Ne restez pas sur sa parade ; variez la ligne, ou attirez-le dans le vide.')],
    fights: [{ foe: 'copiste', wins: 2 }], goal: { type: 'stat', stat: 'ripostes', op: '>=', v: 2, label: '2 ripostes' },
    outro: [L_('copiste', 'Trop tard. La copie a quitté Paris par la route d\'Orléans. Vers l\'Ouest, vers la mer.'),
      L_('vaucelles', 'Pour qui ?'), L_('copiste', 'On l\'appelle le Prince de Sel. Il paie en argent blanc, et il ne montre jamais son visage.'),
      L_('lacombe', 'Prenez la poste, capitaine. Et emmenez le Gascon : il connaît toutes les auberges entre Paris et la mer.')], rewards: { ecus: 120 } },
  { id: 'b02', book: 2, act: ACT4, title: 'L\'Auberge du Cheval-Rouge', venue: 'auberge', hero: 'bastien', chain: true,
    intro: [L_('narr', 'Sur la route de l\'Ouest, un relais de poste. On y change de chevaux, et ce soir, on y change d\'avis très vite.'),
      L_('bastien', 'Maître de poste ! Deux chevaux frais, une soupe chaude, et le nom du cavalier qui est passé avant nous avec un paquet scellé.'),
      L_('maitreposte', 'Le cavalier a payé pour qu\'on oublie son nom. Et pour qu\'on oublie le vôtre, monsieur, définitivement.'),
      L_('postillon', 'Moi d\'abord, patron. Ce Gascon m\'a pris trois écus aux dés, à Étampes.'),
      L_('narr', 'Deux duels d\'une manche, l\'un après l\'autre. La vie ne revient qu\'en partie entre les deux.')],
    fights: [{ foe: 'postillon', wins: 1 }, { foe: 'maitreposte', wins: 1 }], goal: { type: 'hpLeft', v: 40, label: 'Finir avec plus de 40 de vie' },
    outro: [L_('maitreposte', 'Le cavalier allait vers Saintes… et les marais. Il cherchait les faux-sauniers.'),
      L_('bastien', 'Les contrebandiers de sel ? Alors il nous faut quelqu\'un qui sache parler aux ombres. Isaure.')], rewards: { ecus: 130 } },
  { id: 'b03', book: 2, act: ACT4, title: 'Les Faux-Sauniers', venue: 'auberge', hero: 'isaure',
    intro: [L_('narr', 'La nuit, à la même auberge, la cave sert d\'entrepôt : sel de contrebande, échappé à la gabelle.'),
      L_('sauniere', 'Une dame de la cour dans ma cave. Vous êtes perdue, ou vous êtes du fisc ?'),
      L_('isaure', 'Ni l\'un ni l\'autre. Je cherche un paquet scellé qui voyage avec votre sel.'),
      L_('sauniere', 'Tout ce qui voyage avec mon sel m\'appartient. Prouvez-moi que vous valez la peine qu\'on vous parle.'),
      L_('narr', 'Astuce : sa cape emmêle votre lame quand elle esquive. Ne vous jetez pas à fond : estocades courtes, puis riposte.')],
    fights: [{ foe: 'sauniere', wins: 2 }], goal: { type: 'stat', stat: 'esqOk', op: '>=', v: 2, label: '2 esquives réussies' },
    outroChoice: { prompt: 'La Saunière est à votre merci. Elle sait où va le paquet.', options: [{ id: 'marchander', label: 'Marchander', desc: 'Elle part libre, et vous devra une faveur.' }, { id: 'livrer', label: 'La livrer au prévôt', desc: 'La route sera plus sûre, mais vous serez seule.' }] },
    outro: [L_('sauniere', 'Le paquet a pris la route de Saintes, puis la mer. Un navire l\'attend : la Mouette noire.'),
      L_('isaure', 'Un navire. Le Prince de Sel ne veut pas vendre la copie à Paris. Il veut la faire sortir du royaume.')], rewards: { ecus: 130 } },
  { id: 'b04', book: 2, act: ACT4, title: 'Les Toits de Saintes', venue: 'loggia', hero: 'corvin',
    intro: [L_('narr', 'Saintes, sur la Charente. Corvin suit le cavalier de toit en toit, jusqu\'à une ombre qui n\'a rien d\'humain.'),
      L_('dracmarais', 'Les dracs de Paris t\'appellent l\'Ombre. Nous, dans les marais, nous t\'appelons le Sans-Nom.'),
      L_('corvin', 'Le Registre me rendait mon nom. Une copie me le reprend. Écarte-toi.'),
      L_('dracmarais', 'Le Prince de Sel nous a promis les marais, quand il aura vendu vos noms. Je ne m\'écarterai pas.'),
      L_('narr', 'Astuce : ses griffes brisent la garde tenue. Parez au dernier moment, ou rompez.')],
    fights: [{ foe: 'dracmarais', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites' },
    outro: [L_('dracmarais', 'Le Prince… nous a menti aussi. Il ne veut pas les marais. Il veut la mer.'),
      L_('corvin', 'La Mouette noire lève l\'ancre à l\'aube. Álvaro a le pied marin ; il montera à bord.')], rewards: { ecus: 140 } },
  { id: 'b05', book: 2, act: ACT5, title: 'La Mouette noire', venue: 'navire', hero: 'alvaro',
    intro: [L_('narr', 'Au large de la côte, au crépuscule. Álvaro est monté à bord avec les tonneaux de sel.'),
      L_('corsaire', 'Un passager clandestin qui tient sa lame comme un géomètre. Les Portugais ne savent donc plus payer leur passage ?'),
      L_('alvaro', 'Je paie en vérités, capitaine. Vous transportez une copie qui vaut six vies. Rendez-la, et je descends à la prochaine côte.'),
      L_('corsaire', 'Sur mon pont, on ne descend qu\'à la mer. En garde, señor.'),
      L_('narr', 'Astuce : elle change de rythme sous 50 % de vie. Sa dague pare et frappe dans le même temps : ne restez pas dans sa mesure après une parade.')],
    fights: [{ foe: 'corsaire', wins: 2 }], goal: { type: 'stat', stat: 'whiffs', op: '<=', v: 3, label: 'Vaincre avec 3 attaques manquées au plus' },
    outro: [L_('corsaire', 'Vous vous battez comme une boussole : toujours vers le nord. Je n\'aime pas perdre, mais j\'aime encore moins le Prince.'),
      L_('corsaire', 'La copie n\'est plus à bord. Il l\'a fait porter au vieux bastion, face à la digue. Il attend un navire anglais.'),
      L_('alvaro', 'Alors il reste une nuit. Et une tempête qui arrive.')], rewards: { ecus: 160 } },
  { id: 'b06', book: 2, act: ACT5, title: 'La Tempête', venue: 'navire', hero: 'mathurin', chain: true,
    intro: [L_('narr', 'La tempête tombe sur la Mouette noire. Une partie de l\'équipage reste fidèle au Prince, et veut jeter Álvaro par-dessus bord.'),
      L_('mathurin', 'Personne ne jette mon ami à la mer. Pas tant que je tiens debout sur ce pont qui danse.'),
      L_('bosco', 'Tu tiens mal debout, le colosse. Ici, c\'est le pont qui choisit qui tombe.'),
      L_('narr', 'Deux duels d\'une manche sur le pont trempé. La vie ne revient qu\'en partie entre les deux.')],
    fights: [{ foe: 'bosco', wins: 1 }, { foe: 'harponneur', wins: 1 }], goal: { type: 'stat', stat: 'heavy', op: '>=', v: 2, label: '2 fentes lourdes' },
    outro: [L_('harponneur', 'Assez ! La mer prend tout le monde, ce soir. Le Prince, lui, nous a laissés au large.'),
      L_('mathurin', 'Alors ramenez-nous à la côte. Il nous attend au bastion, et nous n\'irons pas les mains vides.')], rewards: { ecus: 160 } },
  { id: 'b07', book: 2, act: ACT5, title: 'La Digue', venue: 'bastion', hero: null, chain: true, startHp: S => S.choices.b03 === 'marchander' ? 100 : 80,
    intro: [L_('narr', 'Face à La Rochelle, la grande digue de 1628 n\'est plus qu\'une rangée de pieux dans la vague. Le Prince a fortifié le vieux bastion.'),
      LC(L_('sauniere', 'Je vous dois une faveur. Il y a un sentier de contrebandiers sous la courtine : vous arriverez frais.'), S => S.choices.b03 === 'marchander'),
      LC(L_('narr', 'La Saunière est chez le prévôt. Il faut monter par la brèche, sous les yeux des sentinelles : vous arriverez entamé.'), S => S.choices.b03 !== 'marchander'),
      L_('ingenieur', 'J\'ai aidé à bâtir cette digue pour le roi. Le roi m\'a payé d\'un merci. Le Prince, lui, paie en argent blanc.'),
      L_('narr', 'Deux duels d\'une manche : la sentinelle, puis l\'Ingénieur. Un tic-tac précède ses coups d\'arrêt.')],
    fights: [{ foe: 'sentinelle', wins: 1 }, { foe: 'ingenieur', wins: 1 }], goal: { type: 'hpLeft', v: 30, label: 'Finir avec plus de 30 de vie' },
    outro: [L_('ingenieur', 'Il est en haut, sur le bastion. Il a la copie sur lui. Il dit qu\'il connaît vos noms mieux que vous.'),
      L_('tancrede', 'J\'ai pris le coche de Paris pour vous rejoindre. Son Éminence veut savoir une chose : qui est le Prince de Sel ?')], rewards: { ecus: 170 } },
  { id: 'b08', book: 2, act: ACT5, title: 'Le Bastion des Cendres', venue: 'bastion', hero: null,
    intro: [L_('narr', 'En haut du bastion, sous l\'orage. Un homme vêtu de blanc tient un paquet scellé contre sa poitrine.'),
      L_('prince', 'Une lame de l\'Ombre. Je vous attendais. Savez-vous ce qu\'on fait du sel ? On le jette sur les plaies.'),
      LC(L_('prince', 'Le Cardinal garde vos noms et vous croyez servir la France. Moi, je les vends à qui les paiera le plus cher.'), rendu),
      LC(L_('prince', 'Vous avez brûlé vos noms pour être libres. Je les ai fait renaître. Votre liberté m\'appartient.'), brule),
      L_('narr', 'Astuce : sa rondache tient une fente lourde par manche, et il attend votre attaque sous 50 % de vie. Faites-le venir.')],
    fights: [{ foe: 'prince', wins: 2 }], goal: { type: 'stat', stat: 'perfect', op: '>=', v: 2, label: '2 parades parfaites contre le Prince' },
    outro: [L_('prince', 'Vous ne savez même pas qui je suis…'),
      L_('narr', 'Sous le chapeau blanc, un visage que les six lames connaissent : le copiste du Palais-Cardinal, celui qui tenait le Registre à jour.'),
      LC(L_('tancrede', 'L\'original reste chez Son Éminence ; la copie retourne au feu. Le Cardinal saura qu\'un de ses scribes l\'a trahi.'), rendu),
      LC(L_('vaucelles', 'C\'est le prix de l\'Ombre, mes amis. Nous servons encore. Mais cette fois, c\'est nous qui avons tenu la plume.'), rendu),
      LC(L_('narr', 'Fin du Livre II. Les six lames rentrent à Paris, au service du Cardinal. Et Son Éminence, désormais, leur doit une faveur.'), rendu),
      LC(L_('narr', 'La copie s\'envole dans le vent de l\'orage, page après page, au-dessus de la digue. Six noms se perdent dans la mer.'), brule),
      LC(L_('corvin', 'Deux fois brûlés, deux fois libres. Je crois que je vais garder « Corvin ». Il me va bien.'), brule),
      LC(L_('narr', 'Fin du Livre II. Les six lames sont libres pour de bon. On raconte qu\'une salle d\'armes ouvrira bientôt à Paris, tenue par six maîtres sans nom.'), brule),
      LC(L_('sauniere', 'Une faveur payée. Si vous repassez par les marais, le sel sera pour moi.'), S => S.choices.b03 === 'marchander')],
    rewards: { ecus: 300 } },
);
// leçons du Livre II (troisième étoile) : la main gauche et ses parades
Object.assign(LESSONS, {
  b01: { name: 'Contre la dague', tip: 'Sa dague pare et frappe : changez de ligne (↓ ou ← + Attaque) plutôt que de répéter la même estocade.', label: 'Toucher d\'une estocade basse', ok: s => (s.k_bassa || 0) >= 1 },
  b02: { name: 'La garde tenue', tip: 'Garde maintenue : elle bloque tout sauf la fente lourde. Le maître de poste a une rondache : ses gardes coûtent peu.', label: '3 gardes tenues', ok: s => (s.blocks || 0) >= 3 },
  b03: { name: 'Contre la cape', tip: 'Après son esquive, sa cape emmêle votre lame : ne vous fendez pas à fond.', label: 'Une riposte', ok: s => (s.ripostes || 0) >= 1 },
  b04: { name: 'Les griffes', tip: 'Ses écailles luisent avant la griffe : parez au dernier moment, ou rompez.', label: 'Une esquive réussie', ok: s => (s.esqOk || 0) >= 1 },
  b05: { name: 'Le rythme', tip: 'Elle feinte beaucoup sous 50 % : attendez la vraie attaque (la pointe rougeoie).', label: 'Une parade parfaite', ok: s => (s.perfect || 0) >= 1 },
  b06: { name: 'Le pont qui danse', tip: 'Fente lourde contre une garde tenue, puis estocade tout de suite.', label: 'Briser une garde', ok: s => (s.gbreaks || 0) >= 1 },
  b07: { name: 'La patience', tip: 'L\'Ingénieur punit les attaques pressées : faites-le venir, puis coupez son temps.', label: 'Un coup d\'arrêt', ok: s => (s.stopHits || 0) >= 1 },
  b08: { name: 'Votre main gauche', tip: 'Dague, cape ou rondache : votre main gauche agit d\'elle-même sur la parade, l\'esquive et la garde.', label: 'Un coup de main gauche', ok: s => (s.dague || 0) + (s.cape || 0) + (s.rond || 0) >= 1 },
});
// mise en scène : arrivée, gros plans, salut (mêmes principes que les récits)
const B2_FOE = { b01: 'copiste', b02: 'maitreposte', b03: 'sauniere', b04: 'dracmarais', b05: 'corsaire', b06: 'bosco', b07: 'ingenieur', b08: 'prince' };
NPC_LOOK.sauniere = () => STORY_FOES.sauniere.look(); NPC_LOOK.postillon = () => STORY_FOES.postillon.look(); NPC_LOOK.corsaire = () => STORY_FOES.corsaire.look();
for (const id in B2_FOE) {
  const c = STORY.find(x => x.id === id), fk = B2_FOE[id], who = { [fk]: 'e', lacombe: 'lacombe', tancrede: 'tancrede' }, n = c.intro.length, m = c.outro.length;
  const cast = id === 'b01' ? { lacombe: { x: 860, face: 'p', stance: 'stand' } } : id === 'b02' ? { postillon: { x: 860, face: 'p', stance: 'stand' } } : id === 'b07' ? { sauniere: { x: -90, face: 'p', stance: 'stand', if: S => S.choices.b03 === 'marchander' } } : id === 'b05' ? {} : {};
  if (id === 'b02') who.postillon = 'postillon'; if (id === 'b07') who.sauniere = 'sauniere';
  const iSteps = []; for (let k = 0; k < n; k++) iSteps.push(k === 0 ? [['cam', 520, 1.05], ['walk', 'p', 310]] : k === n - 1 ? [['cam', null], ['stance', 'p', null], ['stance', 'e', null], ['pose', 'p', 'salut']] : [['cam', k % 2 ? 620 : 340, 1.35]]);
  if (id === 'b01') iSteps[1].push(['walk', 'lacombe', 520], ['face', 'lacombe', 'p']);
  if (id === 'b07') iSteps[1].push(['walk', 'sauniere', 160]);
  const oSteps = []; for (let k = 0; k < m; k++) oSteps.push(k === m - 1 ? [['cam', 480, 1.05], ['stance', 'e', 'stand']] : [['cam', k % 2 ? 340 : 620, 1.35]]);
  const oc = id === 'b07' || id === 'b08' ? { tancrede: { x: 1040, face: 'p', stance: 'monk' } } : id === 'b01' ? { lacombe: { x: 860, face: 'p', stance: 'stand' } } : {};
  if (id === 'b07') oSteps[1] && oSteps[1].push(['walk', 'tancrede', 760]);
  if (id === 'b08') { oc.sauniere = { x: -90, face: 'p', stance: 'stand', if: S => S.choices.b03 === 'marchander' }; who.sauniere = 'sauniere'; }
  CINE[id] = { intro: { place: { p: -60, e: 650 }, cast, stance: { p: 'stand', e: 'stand' }, who, steps: iSteps }, outro: { place: { p: 330, e: 640 }, cast: oc, stance: { p: 'stand', e: 'kneel' }, who, steps: oSteps } };
}
// carnet : faits d'époque et légende du Livre II
CODEX.push(
  { id: 'gabelle', cat: 'epoque', title: 'La gabelle et les faux-sauniers', hint: 'Terminer « Les Faux-Sauniers »', text: 'L\'impôt sur le sel, la gabelle, pèse très inégalement selon les provinces. Les faux-sauniers font passer le sel des pays exemptés vers les pays de grande gabelle ; pris, ils risquent les galères.' },
  { id: 'poste', cat: 'epoque', title: 'La poste aux chevaux', hint: 'Terminer « L\'Auberge du Cheval-Rouge »', text: 'Des relais placés le long des grandes routes permettent de changer de chevaux et de voyager vite. Le réseau, né à la fin du XVe siècle pour les courriers du roi, s\'ouvre peu à peu aux voyageurs.' },
  { id: 'digue', cat: 'lieu', title: 'La digue de La Rochelle', hint: 'Terminer « La Digue »', text: 'Pendant le siège de 1627-1628, Richelieu fait barrer l\'entrée du port d\'une digue d\'environ un kilomètre et demi, faite de pierres et de navires coulés, pour empêcher les secours anglais d\'atteindre la ville.' },
  { id: 'princesel', cat: 'ombre', title: 'Le Prince de Sel', hint: 'Terminer le Livre II', text: 'Un copiste du Palais-Cardinal, chargé de tenir le Registre écarlate à jour. Il en fit une copie, s\'acheta un nom de prince avec l\'argent du sel, et voulut vendre les six lames au-delà des mers. Légende du jeu.' },
);
(() => { const oc = Codex.onChapter.bind(Codex); Codex.onChapter = id => { oc(id); const m = { b02: 'poste', b03: 'gabelle', b07: 'digue', b08: 'princesel' }; if (m[id]) Codex.unlock(m[id]); }; })();
// liste des chapitres : la fin du Livre II
(() => { const sl = Story.showList.bind(Story); Story.showList = function () { sl(); const S = this.data(), el = $('storyEnding'); if (el && S.done.b08) el.textContent += (el.textContent ? ' ' : '') + (S.choices.ch10 === 'bruler' ? 'Livre II : les six lames sont libres pour de bon.' : 'Livre II : le Cardinal vous doit une faveur.'); }; })();
