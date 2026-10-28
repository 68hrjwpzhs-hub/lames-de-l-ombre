# Les Lames de l'Ombre — v16 (rendu cinéma)

**v16 (21/10/2026)** — Nicolas n'a pas aimé la version BD : retour à un rendu peint, poussé vers le cinéma.
- Interrupteur `ART` (figure.js) : 'cinema' par défaut, 'bd' conservé dans le code.
- En mode cinéma :
  - modelé continu des membres et du tronc ;
  - contours très discrets ;
  - ni hachures, ni contour d'encre de la silhouette, ni filtre BD des décors, ni onomatopées.
- Gardé de la v15 : caméra rapprochée, expressions des visages, doigts, plume qui ondule.
- Nouveautés cinéma :
  - **Profondeur de champ** (cineVenue) : le fond se brouille, le sol des duellistes reste net.
  - **Étalonnage** : ombres froides, hautes lumières chaudes.
  - **Flou de mouvement** : deux sillages du corps pendant l'exécution d'un coup et les pas rapides.
  - **Particules d'atmosphère** par décor : poussière dans la lumière (salle d'armes), encens (Notre-Dame), braises qui montent des lanternes (Pont-Neuf), poussière dorée (toits), pollen (Palais-Cardinal).
  - **Reflet d'objectif** anamorphique sur l'étincelle d'une parade parfaite.
  - **Grain de pellicule** animé.
- Option renommée « Rendu cinéma ».
- IA : l'Espagnol de la destreza préfère l'atajo (prise de fer) au battement.

**Coût et tests**
- Coût mesuré dans Chromium sans GPU : environ 69 ms par image. Peinture d'un décor : 0,22 à 0,31 s, une fois par décor.
- Tests : suite 50/50, fer 17/17, nuit 11/11, adversaires 6/6, ambiance 6/6, garde 5/5, héros 14/14 ; démonstration et carrière sans erreur.

---
# Les Lames de l'Ombre — v15 (patte BD)

**v15 (21/10/2026)** — Demande : un univers détaillé et des personnages vivants, « comme sortis d'une BD illustrée ou d'un film ». Choix : BD franco-belge réaliste.
- **Caméra rapprochée** (G.camera) :
  - zoom de 1,14 à 1,5 selon la distance entre les duellistes, cadrage centré sur eux sans sortir du décor, mouvement amorti ;
  - personnages à environ 60 % de la hauteur de l'écran, contre 40 % avant ;
  - décors et personnages rendus à la définition de référence ×1,4 (CAM_REF).
- **Personnages encrés** :
  - contours à l'encre (INK, INKW) sur chaque membre, tronc, tête, chapeau, cape ;
  - ombres en trois tons francs (lumière, ton local, ombre, avec un reflet au bord) ;
  - hachures d'encre du côté opposé à la lumière ;
  - contour extérieur de la silhouette, fin côté lumière et épais côté ombre.
- **Expressions** : sourcils et bouche selon l'action (concentré en garde, rageur à l'attaque, douleur touché, surprise paré ou battu, sourire de victoire), arête du nez, pli de la joue ; doigts repliés sur la poignée ; plume qui ondule.
- **Décors en cases de BD** (inkVenue) :
  - couleurs rapprochées en aplats ;
  - contours encrés (Sobel sur luminance adoucie) ;
  - hachures dans les ombres, contre-hachures dans les noirs.
  - Calculé une fois par décor : 0,33 à 0,43 s en simulation iPhone 13.
- **Onomatopées lettrées** : étoile d'impact cernée d'encre, lettrage gras italique qui jaillit puis s'efface. Parade CLANG !, touche TCHAK !, riposte SHLAK !, fente lourde TCHAAK !, garde brisée KRAK !, blocage TCHING, battement TAC !
- Option « Rendu peint » renommée « Rendu BD ». Le repli automatique (définition réduite, puis rendu simple) reste en place.

**Coût et tests**
- Coût mesuré dans Chromium sans GPU : environ 95 ms par image (le rendu logiciel surestime largement), contre 16 ms avec les personnages non encrés. Non mesuré sur un vrai iPhone.
- Tests : suite 50/50, fer 17/17, nuit 11/11, adversaires 6/6, ambiance 6/6, garde 5/5, héros 14/14 ; démonstration, carrière et bouton Riposte sans erreur.

---
# Les Lames de l'Ombre — v14 (héros jouables, nouveau titre)

**v14 (21/10/2026)** — Le jeu s'appelle désormais **Les Lames de l'Ombre** (anciennement Contre-Temps Arcade).
- Nicolas voulait jouer les personnages des Lames du Cardinal (Pierre Pevel). Œuvre protégée : à la place, six héros originaux, lames secrètes de Son Éminence.
- L'écran de personnalisation est retiré (src/creator.js) ; l'écran « Héros » (src/heroes.js) le remplace.

**Les héros** (qualités et talent)
| Héros | Qualités | Talent | Rapière |
|---|---|---|---|
| Hugues de Vaucelles, le Vieux Loup | dégâts subis −20 %, un peu lent | parade parfaite +4 vie | La Vieille Garde (puissance ×1,08, parade +0,02) |
| Isaure de Mirande, l'Aiguille | la plus vive (préparation ×0,86), pas rapides +20 %, fragile (+10 %) | riposte +6 | L'Aiguille (vive, longue, légère) |
| Bastien d'Armagnac, le Gascon | équilibré | chaque touche portée rend 3 vie | La Fortune (Tolède) |
| Dom Álvaro Teixeira, le Diestro | garde bras tendu (destreza) | parade parfaite +0,04 s | La Línea (allonge 126, la plus longue) |
| Corvin, l'Ombre | dégâts +20 %, fragile (+12 %) | première touche de chaque manche ×1,5 | La Lame noire (puissance ×1,1) |
| Mathurin Brise-Garde, le Colosse | le plus lent (×1,1), pas courts, dégâts subis −10 % | fente lourde +30 %, garde brisée −8 vie | L'Épée de guerre (puissance ×1,2) |

**Écran Héros**
- Liste des six héros, aperçu animé et barres : Résistance, Vitesse, Force, Allonge, Parade.
- Talent et rapière décrits ; bouton « Choisir ce héros ».
- Le héros donne au joueur son nom, son apparence, sa lame et sa posture.

**Lame du héros (« heros »)**
- Nouvelle entrée du marché, fournie et équipée par défaut. Une rapière achetée peut la remplacer.
- Anciennes sauvegardes : la rapière de garnison équipée devient la lame du héros ; héros par défaut, Vaucelles.

**Tests**
- tests/heroes.js 14/14 (PC et iPhone 13 simulé) : qualités mesurées de chaque héros, écran, sauvegarde, nom, lame, titre, migration.
- Les tests mécaniques utilisent un héros neutre (harnais).
- Suite 50/50, fer 17/17, nuit 11/11, adversaires 6/6, ambiance 6/6, garde 5/5, démonstration, carrière et bouton Riposte sans erreur.

---
# Contre-Temps Arcade — v13 (garde qui suit la lame, lueur rouge)

**v13 (21/10/2026)** — Garde plus réaliste et aide à la parade parfaite, à la demande de Nicolas.

**Garde qui suit la lame adverse** (Fighter.trackGuard)
- Plus de quatre positions fixes : la garde glisse en continu entre Terza (milieu), Prima (haut) et Bassa (bas) selon la hauteur de la pointe adverse, et vers Quarta contre une attaque par le dedans.
- Pendant la préparation, la garde lit la ligne visée ; pendant l'exécution, elle suit la pointe.
- La lame s'oriente en partie (±22°) vers la pointe qui arrive.
- Résultat mesuré : le poignet est 70 px plus haut contre l'imbroccata et 30 px plus bas contre l'estocade basse, comparé à l'estocade.

**Geste de parade ample**
- Parade parfaite : la lame chasse le fer en un arc d'environ 60° (0,32 s) ; on mesure 53° de débattement.
- Garde tenue : arc de 26°.

**Difficulté de la parade (anciennement Fenêtre de parade)**
- Réglages renommés Facile, Normal, Difficile.
- Fenêtre de parade parfaite du joueur : 0,32 s en Facile (avant 0,26), 0,24 s en Normal (avant 0,20), 0,14 s en Difficile (inchangée).
- Celle de l'IA reste fixée à 0,20 s (CFG.perfectAI), quel que soit le réglage du joueur.

**Lueur rouge (Facile et Normal seulement)**
- La pointe adverse rougeoie quand appuyer sur Garde donnerait une parade parfaite : faible lueur juste avant, lueur pulsée et liseré rouge sur le bout de la lame pendant la fenêtre.
- Contact estimé selon le coup : fente selon la distance de départ, fente lourde à 0,75 de l'exécution, griffes 0,72, tajo 0,40, imbroccata 0,37, composée et prise de fer 0,12, autres 0,29.
- La lueur couvre 88 % de la fenêtre, pour garder une marge.
- Les feintes ne rougeoient pas.

**Tests (tests/garde.js, 5/5)**
- Appuyer au début ou au milieu de la lueur donne une parade parfaite pour les 10 coups, en Facile et en Normal.
- À distance aléatoire : 150 sur 153 duels réussis (environ 98 %).
- La garde suit la hauteur de la pointe ; parade ample ; fenêtre de l'IA fixe.
- Suite 50/50, fer 17/17, nuit 11/11, adversaires 6/6, ambiance 6/6, bouton Riposte, démonstration et carrière sans erreur.

---
# Contre-Temps Arcade — v12 (bouton Riposte)

**v12 (21/10/2026)** — Changement de gameplay demandé par Nicolas : un 4e bouton, Riposte, qui n'apparaît qu'après une parade parfaite.

**Déclenchement**
- La parade parfaite ne riposte plus toute seule. Elle ouvre une offre de 0,45 s (RIP_WIN).
- Au tactile, le bouton doré RIPOSTE apparaît et pulse au-dessus de la GARDE ; au clavier, touche I (ou U). Hors offre, le bouton est invisible et l'appui ne fait rien.
- L'attaquant parée reste ouvert 0,62 s (0,8 s après une fente lourde), pour laisser le temps d'appuyer.

**Riposte parfaite**
- Appui dans la zone dorée : 18 dégâts, « Riposte parfaite ! », léger ralenti.
- Zone selon la fenêtre de parade : Large 0,10–0,30 s, Normale 0,12–0,26 s, Stricte 0,13–0,22 s.
- Hors zone : riposte simple, 12 dégâts, « trop tôt » ou « tard ». Après 0,45 s : rien.

**Aide au timing (Large et Normale)**
- Un anneau se resserre au-dessus du personnage et sur le bouton lui-même. Il épouse le cercle doré au milieu de la zone ; le bouton devient doré dans la zone.
- En Stricte, pas d'anneau : seule l'invite reste.

**Autres changements**
- Garde tenue : elle bloque et repousse l'attaquant, sans offre de riposte. L'Attaque qui suit reste accélérée, mais n'est plus convertie en riposte ; l'invite « J → RIPOSTE » est supprimée.
- IA : après une parade parfaite, elle appuie sur Riposte selon son niveau (chance de riposter, précision du timing).
- Démonstration, exercices, aide et note de style (+5 par riposte parfaite) mis à jour.

**Tests**
- Suite 50/50, avec la riposte au bouton : offre sans départ automatique ; parfaite à 18 en moins de 200 ms ; trop tôt et tard à 12 ; après la fenêtre ou sans parade parfaite, rien ; garde tenue sans offre.
- Bouton tactile (tests/ripbtn.js) : invisible hors offre, visible pendant, dans l'écran sans chevaucher les autres boutons ; un appui lance la riposte.
- Fer 17/17, nuit 11/11, adversaires 6/6, ambiance 6/6, démonstration et carrière sans erreur.
- Non vérifié : ressenti du timing sur un vrai iPhone.

---
# Contre-Temps Arcade — v11 (guet, pluie, drac, destreza)

**v11 (21/10/2026)** — Deuxième et troisième étapes du plan « épique et addictif ».

**Le guet** (src/ambiance.js)
- Le duel est interdit depuis l'édit de 1626. Le guet ne vient qu'en extérieur (Toits, Pont-Neuf, Palais-Cardinal), en duel libre et dans la Nuit de Paris ; jamais à l'intérieur ni en tournoi, qui sont autorisés.
- Le chrono s'affiche avec la mention « LE GUET » : 60 s en duel libre, 45 s par duel dans la Nuit.
- À 12 s : sifflet, « Le guet arrive ! », chrono qui clignote en rouge ; des gardes en casaque rouge (hallebardes, torches la nuit) approchent des deux bords.
- À 0 : fin de manche « Le guet ! », gagnée par celui qui a le meilleur rapport de vie restante.

**Pluie et orage**
- Probabilité de pluie : Pont-Neuf 50 %, Toits 30 %, Palais-Cardinal 25 %.
- Rendu : deux plans de gouttes, éclaboussures au sol, voile gris, sol mouillé, reflet des duellistes sur les pavés, son de pluie en continu.
- La nuit et au crépuscule : éclairs (flash et zébrure), puis tonnerre.
- Pavés glissants : fentes et pas rapides 12 % plus longs pour les deux duellistes. Annoncé dans la bannière de début de manche.

**Nouveaux adversaires** (ARCH dans ai.js, coups réservés aux adversaires)
- **Destreza (Espagnol)** :
  - garde « línea recta », bras tendu et pointe sur l'adversaire ;
  - nouveau coup « tajo », une taille descendante (.23/.09/.30, 10 dégâts, toute la lame touche) ;
  - prise de fer (atajo) et dérobements fréquents, contretemps ;
  - compás : il entre et sort de mesure sans cesse.
- **Drac (demi-dragon)** :
  - tête reptilienne (museau, cornes, collerette, œil jaune à pupille fendue, écailles, crocs), queue à épines animée, mains griffues ;
  - « griffes » de la main libre : brisent la garde tenue (.25/.08/.34, 11 dégâts, bond de 64 px) ;
  - écailles : −18 % de dégâts subis ; plus lent ; colle à son adversaire.
- Intégration :
  - Nuit de Paris : drac des bas-fonds, diestro de Séville, spadassin espagnol en destreza, drac mercenaire, maître de la destreza. Le Chevalier d'Écaille devient un drac.
  - Tournois : Don Rodrigo, au Grand Tournoi de Notre-Dame, passe en destreza.

**Tests**
- tests/foes.js 6/6 : griffes contre garde, portée des griffes, tajo touché ou bloqué, écailles, usage des coups.
- tests/ambiance.js 6/6 : guet seulement en extérieur, alerte, arbitrage, fente sous la pluie 96 → 108 px, éclair.
- Suite 48/48, fer 17/17, nuit 11/11, carrière, démonstration et tactile sans erreur.
- Une IA Maître à pleine vitesse finit désormais 3 nuits sur 8.
- Non vérifié : son de pluie et tonnerre à l'écoute, vrai iPhone.

---
# Contre-Temps Arcade — v10 (Nuit de Paris)

**v10 (21/10/2026)** — Première étape du plan « épique et addictif ».

**Mode Nuit de Paris (src/run.js)**
- Sept duels d'une seule traite, une manche par duel.
- La vie du joueur est reportée d'un duel à l'autre ; il regagne +35 entre deux duels.
- Les premiers adversaires ont moins de vie : 55, 65, 75, 85, 90, 100, 100.
- Adversaires tirés au sort par palier, chacun avec son lieu :
  - tire-laine, laquais ;
  - spadassin du Marais, bretteur gascon ;
  - garde du Cardinal, mousquetaire du roi ;
  - lieutenant des gardes, dame à la lanterne ;
  - spadassin espagnol, le Corbeau ;
  - maître italien, capitaine des gardes ;
  - boss : le Chevalier d'Écaille, à Notre-Dame.
- Après chaque victoire, choix d'un avantage parmi trois. Second souffle est proposé d'office si la vie est sous 50. Les 11 avantages :
  - Œil de lynx : parade parfaite +0,05 s ;
  - Riposte sanglante : ripostes +6 ;
  - Pied léger : pas rapides +30 % ;
  - Lame vive : préparation des attaques −12 % ;
  - Poigne de fer : dégâts +15 % ;
  - Cuir de buffle : dégâts subis −15 % ;
  - Battement étourdissant : lame battue ouverte +0,15 s ;
  - Sang-froid : +5 vie par parade parfaite ;
  - Botte secrète : première touche du duel doublée ;
  - Bourse du panache : écus de la nuit ×1,5 ;
  - Second souffle : +40 vie tout de suite.
- Écus :
  - par duel gagné : 15, 20, 30, 40, 55 puis 70 ;
  - +15 pour une note S, +5 pour une note A ;
  - +300 de prime si la nuit est complète.
  - Les écus restent acquis en cas de défaite. Meilleure nuit et nuits complètes sont sauvegardées.

**Note de style (S, A, B, C)**
- Calculée après chaque duel : parades parfaites, ripostes, battements réussis, dérobements, touches, coups dans le vide, vie perdue.
- Affichée sur l'écran de fin de duel et sur la progression de la nuit.

**Coup de grâce**
- À chaque touche finale : ralenti d'environ 1 s, gros plan sur le point de touche, bandes de cinéma, mention « Coup de grâce », bannière décalée.

**Tests (tests/run.js, 11/11)**
- Nuits complètes jouées par l'IA : écus crédités, vie reportée, trois avantages distincts, une note par duel.
- Effets mesurés : Poigne de fer, Botte secrète, Cuir de buffle, Pied léger.
- Profondeur atteinte par une IA Maître à pleine vitesse : duels 4 à 6, sans nuit complète sur 8 essais. C'est volontairement exigeant, à valider par un humain.
- Suite 48/48, fer 17/17, carrière et démonstration sans erreur.

---
# Contre-Temps Arcade — v9 (Paris, 1633)

**v9 (21/10/2026)** — Demande : des décors bien plus riches, en peinture réaliste « comme une peinture de la Renaissance », truffés de détails évoquant l'univers des Lames du Cardinal (Paris, 1633). Choix de Nicolas : remplacer les cinq décors italiens par des lieux parisiens. Les clés internes ne changent pas, pour garder les sauvegardes.

Nouveaux décors (src/venues.js) :
- **Toits de Paris** (clé loggia) : couchant, bancs de nuages éclairés, patrouille de vouivres et courrier monté, Notre-Dame et sa flèche, tour Saint-Jacques, Seine qui miroite, trois plans de toits dans la brume avec fenêtres allumées et fumées, toits d'ardoise, lucarne éclairée, souche de cheminée en brique, girouette en vouivre, balustrade, pigeons, gargouille, dallage.
- **Notre-Dame** (clé eglise) : rosace en mosaïque de verre à remplages, lancettes à médaillons, rayons colorés et encens, autel d'or, croix, chandeliers. Bannières rouges aux armes du Cardinal : d'argent à trois chevrons de gueules, chapeau à houppes. Piliers fasciculés, arcs brisés, triforium, fenêtres hautes, chapelles aux cierges et statues, couronnes de lumière, voûte d'ogives, dallage et pierres tombales.
- **Salle d'armes** (clé salle) : plafond à la française à poutres peintes, frise, boiseries sculptées, hautes croisées à petits bois et rideaux de velours, rayons de jour. Tapisserie (chevalier contre dragon), portraits dorés (un cardinal en rouge, un maître d'armes), râteliers, pal d'entraînement, plastron et gants, parquet avec un cercle d'escrime tracé au sol à la manière de Thibault.
- **Palais-Cardinal** (clé cloitre) : façades en pierre de taille, fenêtres à frontons, combles d'ardoise, lucarnes et cheminées. Arcades aux ancres et proues sculptées, pavillon central aux armes de Son Éminence, porte cochère et gardes en casaque rouge à croix blanche. Vouivre perchée sur le toit, passants, chaise à porteurs, orangers en caisse, pavés et caniveau.
- **Pont-Neuf** (clé nuit) : lune et nuages argentés, vouivre montée devant la lune, Grande Galerie du Louvre aux fenêtres allumées, tour de Nesle, reflets sur la Seine, barque à la lanterne, statue équestre du roi Henri, parapet, échoppes fermées, lanternes sur potence, porteur de torche, pavés mouillés.

Rendu :
- Outils de peinture (src/scenery.js) : bruit fbm, maçonnerie ombrée avec épaufrures et coulures, enduit, bois veiné, nuages cohérents à dessous sombre et bords éclairés, flou doux, touches de pinceau, verre au plomb, vouivres en vol et perchée, silhouettes, armoiries, bannières, cadres dorés.
- Finition de chaque décor : vernis ambré et craquelure discrète, en plus du lointain adouci et du grain.

Textes : Défis des toits, Coupe des salles d'armes, Joute du Palais-Cardinal, Duels du Pont-Neuf, Grand Tournoi de Notre-Dame. Marché : rue de la Ferronnerie. Menu : « Paris, 1633 · duel à la rapière ». Aucun personnage des romans n'apparaît : seuls l'époque et l'univers (vouivres, Cardinal) sont évoqués.

Coût et tests :
- Peinture d'un décor (une fois, puis cache) : 74 à 143 ms en simulation iPhone 13.
- Tests : 48/48, fer 17/17, démonstration, carrière et tactile sans erreur.
- Non vérifié : rendu et temps sur un vrai iPhone.

---
# Contre-Temps Arcade — v8 (rendu peint)

**v8 (21/10/2026)** — Demande : graphismes plus réalistes. Le photoréalisme n'est pas possible sans sprites issus de modèles 3D ou de capture de mouvement ; choix retenu : un rendu peint réaliste.
- Nouveau src/paint.js. Chaque personnage est dessiné dans un canevas à part, puis éclairé selon le décor (table LIGHTING) :
  - ombre propre côté opposé à la lumière, assombrissement vers le sol, teinte d'ambiance ;
  - glacis de lumière principale, lueur vacillante des bougies et torches proches ;
  - contre-jour (liseré clair sur le bord tourné vers la lumière) ;
  - touches de pinceau sur la silhouette, ombre portée douce couchée sur le sol selon la lumière.
- Modelé des membres : lumière, demi-teinte, ombre propre, reflet. La direction de lumière dépend du décor. Reflet spéculaire sur le cuir (bottes, brassards, pourpoint du rôdeur), plis de tissu aux coudes et aux genoux, tronc modelé et éclairé d'en haut, contours sombres très atténués.
- Visages : orbite, pommette, ombre sous la mâchoire, oreille dessinée, iris et reflet de l'œil, paupière, narine, lèvres ; mèches de cheveux. Lame : reflet d'acier qui glisse le long de la lame quand elle change d'angle.
- Décors : peints à la définition de l'écran (jusqu'à ×2, auparavant ×1 puis agrandis), lointain adouci, perspective atmosphérique, glacis coloré, grain de toile ; vignettage sur l'image entière.
- Option « Rendu peint » au menu (activée par défaut, mémorisée). Repli automatique si le rendu dépasse 14 ms par image en combat : définition réduite, puis rendu simple.
- Coût mesuré dans Chromium sans GPU (rendu logiciel, pessimiste) : environ 33 à 37 ms par image contre environ 9 ms en rendu simple. Pas mesuré sur iPhone (rendu accéléré par le GPU) : le repli automatique est là pour ça.
- Tests : 48/48 et fer 17/17, démonstration, carrière, création de personnage, tactile sans erreur. Captures des cinq décors vérifiées sur PC et iPhone 13 simulé.

---
# Contre-Temps Arcade — v7 (le jeu de lames)

**v7 (21/10/2026)** — Proposition n°1 « le fer » mise en œuvre.
- **Battement** (→ + Feinte ; au tactile, stick poussé franchement) : préparation .12 s, sans dégâts. Il chasse la lame adverse (en garde, au repos, ou dans la préparation d'une attaque, qui est annulée) : « lame battue » 0,38 s, sans garde possible, mais on peut encore rompre (double ←). L'attaque suivante dans les 0,45 s part ×0,6 et peut s'enchaîner dès la fin de l'exécution du battement. Il échoue hors de portée (≈ 300 px), trop tard (lame déjà partie), contre un dégagement ou une composée (« Dérobement ! »), et contre une lame battue depuis moins de 1,6 s (« Le fer cède ! »). Un battement manqué coûte +0,3 s de récupération.
- **Prise de fer** (↓ + Feinte) : préparation .30 s (×0,85 si le fer est engagé), 9 dégâts, avancée 40 px. Elle passe la garde tenue (une seule fois par 1,6 s : la garde s'y attend ensuite). Elle est battue par la parade au bon moment, le dérobement et la retraite. Une estocade directe (estocade, fente, estocade basse, imbroccata) qui la heurte après la moitié de sa préparation est déviée (« Opposition ! ») ; avant, c'est un contretemps qui touche. Manquée : +0,3 s.
- **Engagement** : lames croisées au repos à portée d'estocade → petit éclat au point de contact, mention « FER ENGAGÉ » sous la mesure, tic métallique.
- Pierre-feuille-ciseaux : la garde perd contre le battement, la prise de fer et la lourde ; l'attaque directe perd contre l'opposition et la parade ; le fer perd contre le dérobement et la retraite ; le dérobement perd contre la garde.
- **IA** : le Duelliste et le Maître battent la lame puis estoquent, prennent le fer contre une garde tenue, se dérobent (45 % / 55 %), rompent quand leur lame est battue, et changent de jeu face à un adversaire qui cherche le fer (moins d'attaques directes, dégagements préventifs). Le Débutant n'utilise pas le fer.
- **Entraînement** : exercice « Le fer » (objectif 5 : touches après battement ou par prise de fer, dérobements, oppositions), conseils sur les échecs. **Démonstration** : 3 nouvelles séquences (Battement puis estocade, Prise de fer, Dérobement).
- **Tests** : suite 48/48 et nouvelle suite fer 17/17. Robots parfaits à l'image près : « battement + estocade » perd 0/6 contre le Duelliste et le Maître ; « prise de fer en boucle » gagne 1/6 contre le Duelliste et 0/6 contre le Maître. Hiérarchie Maître > Duelliste > Débutant conservée. Le robot « martèlement d'estocade » bat parfois encore le Duelliste (3 à 7 sur 20, déjà le cas avant).
- Non testé : vrai iPhone, ressenti humain du timing battement → estocade.

---
## Commandes actuelles
| Commande | Action |
|---|---|
| Attaque | Estocade (.17 / .07 / .22 s, 8) |
| → + Attaque | Fente (.24 / .10 / .36, 12) |
| ↓ + Attaque | Estocade basse (.17 / .08 / .28, 8) |
| ← + Attaque | Dégagement (.22 / .08 / .26, 9) — aussi le dérobement contre le fer |
| ↑ + Attaque | Imbroccata (.30 / .09 / .34, 11) |
| Attaque puis Feinte | Attaque composée (12) |
| Feinte puis Attaque | estocade suivante ×0,55 |
| → + Feinte | Battement |
| ↓ + Feinte | Prise de fer (.30 / .10 / .30, 9) |
| Attaque maintenue | Fente lourde (.32 / .14 / .46, 18, brise la garde) |
| Garde (maintenue) | bloque ; levée ≤ 0,20 s avant la touche : parade parfaite + riposte (14) |
| Double ← / → | pas rapide |

Clavier : Q/D ou ←/→, Z/↑, S/↓, J attaque, K feinte, L ou Espace garde, Échap pause.

---
# Contre-Temps Arcade — v6 (création de personnage)

**v6 (21/10/2026)**
- Écran « Personnage » : nom (24 caractères, affiché en jeu), corps homme/femme, 5 tenues (Gentilhomme, Rôdeur, Paysan, Moine, Dame d'épée) avec palettes, couleurs (vêtement principal, secondaire, garnitures, bottes), peau, coiffure (courts, longs, queue, chignon, tonsure, rasé) et couleur, barbe, coiffe (feutre, béret, capuche, paille, tête nue) et sa couleur, plume, cape. Aperçu animé, bouton « Au hasard ». Sauvegardé avec la progression.
- Rendu par tenue (src/figure_styles.js) : pourpoint matelassé et chausses à crevés ; pourpoint de cuir lacé, mantelet, braies et hautes bottes ; chemise, gilet, culotte au genou, souliers ; bure, scapulaire, cordelière, sandales ; corsage lacé à décolleté carré et jupe. Corps féminin : taille marquée, buste, traits plus fins.
- Adversaires de tournoi habillés selon leur rôle : Pietro le Tanneur (paysan), Fra Anselmo (moine), Il Corvo (rôdeur à capuche), Donna Lucrezia (dame d'épée, remplace Lorenzo).
- Tests : 48/48, création → enregistrement → rechargement vérifiés sur PC et iPhone simulé.

---
# Contre-Temps Arcade — v5 (carrière, marché, musique, sang)

**v5 (21/10/2026)**
- Écus : duel libre (25/50/90 selon le niveau, 8 en cas de défaite) + panache (parades parfaites ×2, ripostes ×1, plafond 20).
- 5 tournois à élimination (quart, demi, finale ; deux manches gagnantes) débloqués l'un après l'autre : Loggia (gratuit, 150), Salles d'armes (40 → 320), Cloître (90 → 500), Piazza de nuit (160 → 780), Cathédrale (300 → 1500). Finale perdue : 40 % de la bourse ; demi : 15 %.
- 8 rapières (vitesse = préparation, puissance = dégâts, allonge = vraie longueur de lame, parade = fenêtre ajoutée) ; les adversaires de tournoi en portent de meilleures.
- Marché du Ponte Vecchio : cours en marche aléatoire (×0,7 à ×1,4) à chaque duel, étal variable selon la rareté, revente à 55 %, courbe des cours.
- Sauvegarde : base privée par joueur de l'artefact (capacités db + user, document data/users/<id>/save) avec copie locale de secours.
- Musique originale synthétisée (Web Audio) : pavane en ré mineur (cadence andalouse) au menu, tarentelle 6/8 en combat (tambour et doublure quand ça se tend), fanfare et lamento. Options Musique / Bruitages / Sang.
- Sang : gouttes et taches sur touches ≥ 12 ou adversaire affaibli, flaque au KO, désactivable.
- Courbe de difficulté simulée : un joueur IA « duelliste » gagne la Loggia, peine dès la Coupe ; le Grand Tournoi résiste même à l'IA Maître (≈ 1 duel sur 3).

---
# Contre-Temps Arcade — v4 (garde réactive, personnages réalistes)

**v4 (21/10/2026)** — Retour de Nicolas : la garde manquait de répondant, la riposte semblait ne pas marcher ; personnages trop « bâtons ».
- Diagnostic mesuré avec un joueur simulé (réaction 0,24 s) : contre le Duelliste, 10 touches sur 21 attaques, car l'estocade de l'IA touchait ~0,2 s après son départ, avant qu'un humain puisse réagir.
- Correctifs : préparations de l'IA plus lisibles (×1,8 / ×1,55 / ×1,35), fenêtre de parade 0,20 s (Large 0,26, Stricte 0,14), anti-martèlement 0,25 s.
- Garde tenue : la lame adverse est chassée (l'attaquant recule, ouvert 0,22 s), choc plus marqué ; Attaque dans les 0,45 s → riposte (10), invite « J → RIPOSTE ». Parade parfaite : riposte automatique (14).
- Après : même joueur simulé → Duelliste 16 parades / 3 touches sur 23 ; Maître reste exigeant (≈ 7 touches sur 26).
- IA : réponse dédiée à la fente lourde (esquive, contretemps, parade au dernier instant, sinon encaisser la garde brisée), garde sous pression, réactions tardives au niveau Débutant.
- Personnages : membres galbés ombrés, pourpoint matelassé à basques, chausses à crevés, bas, bottes à revers, mains gantées, visage de profil, chapeau à plume, cape animée, rapière à garde ouvragée (src/figure.js).

---
## v3 (garde unique, lourde maintenue, décors)

**v3 (21/10/2026)** — À la demande de Nicolas après essais : les quatre gardes par ligne étaient trop complexes.
- Une seule garde : tenue elle bloque tout sauf la fente lourde (garde brisée) ; levée ≤ 0,16 s avant la touche → parade parfaite et riposte automatique.
- Fente lourde = maintenir Attaque 0,22 s (la préparation commence à l'appui : aucun délai ajouté à un appui bref ; le demi-cercle est supprimé). Cercle de charge visible ; la garde annule une charge.
- Cinq décors : Loggia, Église, Salle d'armes, Cloître, Piazza de nuit (choix au menu, « Aléatoire » change à chaque manche), lumières qui vacillent.
- Correctif : la fente lourde (coup de taille) touche maintenant avec toute la lame ; elle ratait de près.
- Entraînement : « Lignes » remplacé par « Contre la lourde » ; « Contre la garde » devient « Briser la garde ».
- Tests : 48/48.

---
Historique v2 ci-dessous (les gardes par ligne n'existent plus).


Source : `claude/contre-temps-arcade-2d.html` (un seul fichier, Canvas 2D, 120 Hz à pas fixe). Tests : `claude/contre-temps-arcade-tests.txt` (Playwright + Chromium, harnais injecté dans la page).

## Commandes
| Commande | Coup | Ligne | Prépa / exéc. / récup. (s) | Dégâts | Notes |
|---|---|---|---|---|---|
| Attaque | Estocade | dehors | .17 / .07 / .22 (+.10 si dans le vide) | 8 | coup de base |
| → + Attaque | Fente | dehors | .24 / .10 / .36 (+.22) | 12 | avance 96 px, retour en garde ; parée : +.20 s de récupération |
| ↓ + Attaque | Estocade basse | basse | .17 / .08 / .28 (+.10) | 8 | |
| ← + Attaque | Dégagement | dedans | .22 / .08 / .26 (+.10) | 9 | la pointe passe sous la lame |
| ↑ + Attaque | Imbroccata | haute | .30 / .09 / .34 (+.08) | 11 | estoc plongeant après courbe haute |
| Attaque puis Feinte | Composée | ouverture adverse | ~.32 / .08 / .32 | 12 | change de ligne vers la ligne que la garde vue laisse ouverte |
| Feinte puis Attaque | — | — | prépa ×0,55 | — | feinte .24 s, annulable |
| ↺ (4→2→6) + Attaque | Fente lourde | haute | .32 / .14 / .46 (+.20) | 18 | brise toute garde tenue (garde brisée .78 s) ; parable parfaitement en Prima |
| Double ← / → | Pas rapide | | .22 / .20 s | | retraite possible en fin de récupération des coups légers |
| Garde (+ ↑ ← ↓) | Prima / Terza / Quarta / Bassa | | | | ne bouge pas en garde |

Couverture : chaque garde ferme sa ligne (1), couvre mal les deux voisines (garde faible : 3 dégâts, recul) et laisse la ligne opposée ouverte.
Parade parfaite : bonne ligne + appui (ou changement de ligne) ≤ fenêtre avant le contact réel de la lame (0,16 s × multiplicateur du coup, +0,03 s au tactile ; préréglages 0,22 / 0,16 / 0,11). Anti-martèlement : l'appui doit suivre le précédent front de garde de plus de 0,35 s. Riposte automatique démarrée dans l'image même. Garde normale réussie : riposte manuelle accélérée (×0,7) pendant 0,32 s.

## IA
Perception différée (débutant .34 s, duelliste .21 s, maître .18 s), estimation bruitée de l'impact, lecture de ligne probabiliste, garde d'anticipation à portée, adaptation (lignes habituelles, feintes répétées de moins en moins crues, garde tenue → ligne ouverte ou fente lourde), mesure en allers-retours, appâts, retraite après attaque, punition des coups dans le vide.

## Résultats de tests (Chromium, simulation)
- Suite mécanique : 45/45 (commandes, trajectoires distinctes, touche par la lame, 24 000 pas aléatoires sans traversée, coups simultanés, 16 cas de couverture, fenêtre de parade, martèlement, riposte < 200 ms, feinte, cas limites).
- Tactile (émulation iPhone SE, 12 mini, 13, 14 Pro Max, iPad mini en paysage) : disposition sans chevauchement ni HUD masqué, deux doigts, relâchements, perte de capture, demi-cercle au stick, double poussée, pause.
- Tournois IA (10 matchs) : maître bat duelliste 9/10, duelliste bat débutant 10/10.
- Stratégies dégénérées parfaites à l'image près : la tortue perd toujours ; fente lourde répétée perd ; martèlement d'estocade ≈ 50 % contre Duelliste, perd contre Maître ; Débutant perd contre le martèlement.
- Non testé : vrai iPhone, ressenti humain, son.


**v3 (21/10/2026)** — À la demande de Nicolas après essais : les quatre gardes par ligne étaient trop complexes.
- Une seule garde : tenue elle bloque tout sauf la fente lourde (garde brisée) ; levée ≤ 0,16 s avant la touche → parade parfaite et riposte automatique.
- Fente lourde = maintenir Attaque 0,22 s (la préparation commence à l'appui : aucun délai ajouté à un appui bref ; le demi-cercle est supprimé). Cercle de charge visible ; la garde annule une charge.
- Cinq décors : Loggia, Église, Salle d'armes, Cloître, Piazza de nuit (choix au menu, « Aléatoire » change à chaque manche), lumières qui vacillent.
- Correctif : la fente lourde (coup de taille) touche maintenant avec toute la lame ; elle ratait de près.
- Entraînement : « Lignes » remplacé par « Contre la lourde » ; « Contre la garde » devient « Briser la garde ».
- Tests : 48/48.

---
Historique v2 ci-dessous (les gardes par ligne n'existent plus).


Source : `claude/contre-temps-arcade-2d.html` (un seul fichier, Canvas 2D, 120 Hz à pas fixe). Tests : `claude/contre-temps-arcade-tests.txt` (Playwright + Chromium, harnais injecté dans la page).

## Commandes
| Commande | Coup | Ligne | Prépa / exéc. / récup. (s) | Dégâts | Notes |
|---|---|---|---|---|---|
| Attaque | Estocade | dehors | .17 / .07 / .22 (+.10 si dans le vide) | 8 | coup de base |
| → + Attaque | Fente | dehors | .24 / .10 / .36 (+.22) | 12 | avance 96 px, retour en garde ; parée : +.20 s de récupération |
| ↓ + Attaque | Estocade basse | basse | .17 / .08 / .28 (+.10) | 8 | |
| ← + Attaque | Dégagement | dedans | .22 / .08 / .26 (+.10) | 9 | la pointe passe sous la lame |
| ↑ + Attaque | Imbroccata | haute | .30 / .09 / .34 (+.08) | 11 | estoc plongeant après courbe haute |
| Attaque puis Feinte | Composée | ouverture adverse | ~.32 / .08 / .32 | 12 | change de ligne vers la ligne que la garde vue laisse ouverte |
| Feinte puis Attaque | — | — | prépa ×0,55 | — | feinte .24 s, annulable |
| ↺ (4→2→6) + Attaque | Fente lourde | haute | .32 / .14 / .46 (+.20) | 18 | brise toute garde tenue (garde brisée .78 s) ; parable parfaitement en Prima |
| Double ← / → | Pas rapide | | .22 / .20 s | | retraite possible en fin de récupération des coups légers |
| Garde (+ ↑ ← ↓) | Prima / Terza / Quarta / Bassa | | | | ne bouge pas en garde |

Couverture : chaque garde ferme sa ligne (1), couvre mal les deux voisines (garde faible : 3 dégâts, recul) et laisse la ligne opposée ouverte.
Parade parfaite : bonne ligne + appui (ou changement de ligne) ≤ fenêtre avant le contact réel de la lame (0,16 s × multiplicateur du coup, +0,03 s au tactile ; préréglages 0,22 / 0,16 / 0,11). Anti-martèlement : l'appui doit suivre le précédent front de garde de plus de 0,35 s. Riposte automatique démarrée dans l'image même. Garde normale réussie : riposte manuelle accélérée (×0,7) pendant 0,32 s.

## IA
Perception différée (débutant .34 s, duelliste .21 s, maître .18 s), estimation bruitée de l'impact, lecture de ligne probabiliste, garde d'anticipation à portée, adaptation (lignes habituelles, feintes répétées de moins en moins crues, garde tenue → ligne ouverte ou fente lourde), mesure en allers-retours, appâts, retraite après attaque, punition des coups dans le vide.

## Résultats de tests (Chromium, simulation)
- Suite mécanique : 45/45 (commandes, trajectoires distinctes, touche par la lame, 24 000 pas aléatoires sans traversée, coups simultanés, 16 cas de couverture, fenêtre de parade, martèlement, riposte < 200 ms, feinte, cas limites).
- Tactile (émulation iPhone SE, 12 mini, 13, 14 Pro Max, iPad mini en paysage) : disposition sans chevauchement ni HUD masqué, deux doigts, relâchements, perte de capture, demi-cercle au stick, double poussée, pause.
- Tournois IA (10 matchs) : maître bat duelliste 9/10, duelliste bat débutant 10/10.
- Stratégies dégénérées parfaites à l'image près : la tortue perd toujours ; fente lourde répétée perd ; martèlement d'estocade ≈ 50 % contre Duelliste, perd contre Maître ; Débutant perd contre le martèlement.
- Non testé : vrai iPhone, ressenti humain, son.
