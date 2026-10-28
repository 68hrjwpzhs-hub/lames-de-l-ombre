# Les Lames de l'Ombre — v29 (netteté, son d'époque, matières)

**22/10/2026** — Les trois parties proposées à Nicolas, faites dans l'ordre.

## 1. Netteté
- **Lissage des bords** : MSAA ×4 dans le composeur (cible HalfFloat). Avant, l'option `antialias` du moteur ne passait pas à travers le post-traitement : il n'y avait donc aucun lissage.
- **Netteté adaptative** (principe du CAS d'AMD), dans la passe d'étalonnage (`GRADE`, uniformes `px` et `sharp` = 0,55).
- **Corps en haute définition** :
  - reconvertis depuis les FBX d'origine, textures 4096 ramenées à 2048 pour l'atlas couleur (visage et costume) et à 1024 pour les normales et les cheveux ;
  - tools/slim.py dédoublonne les images : le même atlas était répété 4 fois. Variables d'environnement : BIG, SMALL, Q.
  - Taille par corps : 6,7 à 7,9 Mo, contre 4,8 à 6 Mo avant.
- **Filtrage anisotrope** ×8 sur les textures des corps.
- **Pas fait** : KTX2 (le réseau n'était pas disponible pour l'encodeur et le transcodeur) ; netteté réservée aux personnages.

## 2. Musique et son (src/sound.js, src/music.js)
Rien n'est téléchargé : les instruments d'époque sont modélisés, et tout est original ou du domaine public.

**Instruments**
- Théorbe, clavecin et harpe : Karplus-Strong (cordes doublées, point de pincement, résonances du coffre).
- Viole de gambe : dent de scie, formants, vibrato, bruit d'archet.
- Flûte à bec, orgue positif, cornet.
- Percussions et cloches : tambour à timbre, timbales, cloche de bronze (partiels inharmoniques).

**Musique**
- Menu : thème du Cardinal (original, orgue et violes), puis variations sur la Folia (domaine public).
- Combat : tarentelle en trois couches selon la tension du duel (distance, attaques récentes, vie basse, dernière manche).
  - Couche 1 : clavecin à la salle d'armes, orgue à Notre-Dame, harpe la nuit et sur les toits, et le tambour.
  - Couche 2 : le cornet et les timbales.
  - Au coup de grâce, la musique se tait.
- Victoire : toccata pour cornets et timbales (originale). Défaite : lamento.

**Salles et bruitages**
- Réverbération calculée pour chaque lieu : Notre-Dame 3,6 s (plafonnée à 2,6 s sur iPhone), toits 0,7 s.
- Chocs d'acier par les modes d'une lame (barre libre).
- Pas sur parquet, sur pierre, ou pavés mouillés sous la pluie.
- Froissement de cape, vraie cloche de manche.

**Fonds sonores**
- Seine, fontaine et oiseaux, vent et pigeons, feu, nef et bourdon d'orgue.
- Cloches lointaines ; cris de vouivres en extérieur.

**Tests** : tests/audio.js enregistre des extraits depuis le jeu, sans erreur. Niveaux : environ −30 dB en moyenne, crêtes à −7 dB.

## 3. Matières, lumière, cape, costumes (src3d/body3d.js)
- **Attribut `cfx`** (velours, cuir, galon, peau), calculé par zone d'os dans setPeriodLook :
  - velours : reflet rasant et motif de damas ;
  - cuir : surface plus lisse ;
  - galon d'or : métallique, aux lisières du pourpoint ;
  - peau : lumière qui traverse les oreilles et le nez.
- **Liseré de lumière** sur la silhouette, propre à chaque lieu (table RIM).
- **Cape simulée** : intégration de Verlet, 165 particules, contraintes de distance. Elle évite le dos et le sol, prend le vent dehors, et traîne dans la fente.
- **Plume et cheveux longs** : ressort amorti qui suit l'accélération de la tête.
- **Costumes modélisés** :
  - basques plissées ;
  - cape à plis évasée ;
  - huit boutons dorés posés sur le buste par lancer de rayons.
  - **Pas fait** : vrais vêtements modélisés dans Blender (pourpoint, manches à crevés, bottes) ; clignement des yeux (les corps Mixamo n'ont pas de formes de visage).

## Vérifié
- Suites : 50/50, 17/17, 5/5, 11/11, 6/6, 6/6, 14/14, et animations 17/17.
- iPhone 13 émulé sans erreur : rendu ×1,5 (résolution dynamique), mémoire JS environ 110 Mo, contre 75 Mo avant.

## Non vérifié
- Un vrai iPhone 13.
- L'écoute réelle de la musique (contrôle par spectrogramme seulement).
- La version publiée en direct.

---
# v30 — rendu 3D retiré (22/10/2026)
À la demande de Nicolas, le jeu ne garde que le rendu cinéma.
- Retiré : l'option « Rendu 3D », le chemin R3D dans `G.render`, le réglage `CFG.r3d` et sa sauvegarde, le CSS associé.
- build.sh ne produit plus que `index.html`. Les sources 3D restent archivées dans `src3d/`, hors du build.
- La publication ne contient plus que la page : 102 fichiers 3D supprimés (modèles, textures, HDRI, décors).
- Tests : suites 50/50, 17/17, 5/5, 11/11, 6/6, 6/6, 14/14, animations 17/17. Démonstration et iPhone 13 émulé sans erreur.
- La musique, les bruitages, les animations et la netteté (v28-v29) sont conservés. Les matières, la cape simulée et les corps en haute définition étaient propres à la 3D : ils disparaissent avec elle.

---
# v31 — blessures, énergie du désespoir, coup de grâce (22/10/2026)
Choix de Nicolas : pas de démembrement (une rapière pique, elle ne tranche pas). À la place, des blessures localisées et un coup de grâce plus dramatique.
- **Coup critique, sans hasard**, s'il ne tue pas : riposte parfaite, coup d'arrêt (touche pendant la préparation adverse, ou pendant la charge de la fente lourde), ou touche sur une garde brisée.
  - Message « … : blessure au bras / à la jambe / au flanc ! » et court ralenti.
- **Zone de la blessure**, selon le point de touche (`G.woundZone`) :
  - jambe avant : marche et pas rapides −12 %, boiterie (le bassin plonge quand l'autre pied voyage) ;
  - bras armé : préparation des attaques +8 %, pointe plus basse ;
  - flanc : récupération +8 %, buste plié, main libre portée au flanc.
- Les blessures durent jusqu'à la fin de la manche ; la nouvelle manche les remet à zéro.
- **Taches de sang sur le costume** (`G.drawMarks`) : à l'endroit de la blessure, et plus petites pour une touche franche (au moins 10 de dégâts). Elles respectent l'option Sang.
- **Faiblesse sous 30 % de vie** : boiterie légère, garde plus basse, souffle court ; marche −4 %.
- **Énergie du désespoir** : sous 30 %, la fenêtre de parade parfaite s'élargit de 0,03 s (`DESPAIR`), pour le joueur comme pour l'IA. La lueur rouge en tient compte.
- **Coup de grâce** : la rapière tombe de la main, rebondit au sol et s'y pose à plat ; le vaincu tombe à genoux, la main à la blessure, puis au sol.
- **Tests** :
  - tests/wounds.js 9/9 ;
  - suites 50/50, 5/5, 11/11, 6/6, 6/6, 14/14, animations 17/17, démonstration sans erreur ;
  - fer 17/17 sur 5 passages, 16/17 sur 1 (un test statistique de robots contre l'IA, aléatoire).

---
# v32-33 / 1.0.0 — sprint 1 « Fondations » (23/10/2026)
Plan d'équipe : doc « Les Lames de l'Ombre — Plan de l'équipe » (claude.ai). Livrables de l'équipe (PO, story, UX, Front, Back) rédigés dans le scratchpad de session.
- **Sauvegarde** : menu → Options → Sauvegarde (`SaveIO`, progress.js).
  - Exporter, copier le code (`LDO1.<base64url>.<crc32>`), ou fichier (seulement dans la version installable).
  - Importer en deux temps (aperçu, puis confirmation) ; l'ancienne partie est gardée dans `ct2d.save.backup`.
  - Contenu : la sauvegarde, les réglages et le bilan des duels.
- **Compteur de performance** : Options → Mesure, ou `#perf` (src/perf.js).
  - Images/s, moyenne, p95, pire image, à-coups au-delà de 20 ms, pas par image, coût du rendu, définition.
  - Bouton Copier : rapport JSON.
- **Fluidité** (paint.js) :
  - toutes les passes de dessin sont limitées à la boîte de chaque personnage ;
  - vignettage et grain sont fusionnés en 4 images préparées ;
  - le régulateur juge le vrai temps entre deux images et descend ou remonte d'un palier de 0,25. Il ne coupe plus jamais le rendu cinéma, et garde le palier appris (`ct2d.kmax`) ;
  - les décors ne sont plus reconstruits en plein combat.
  - Mesure en émulation iPhone : rendu 41 ms par image contre 66, peinture finale 16 ms contre 40, soit −46 % au total.
- **Version installable 1.0.0** : `tools/pwa_build.py` → `dist/`, et `lames-de-l-ombre-1.0.0.zip` dans les Téléchargements de Nicolas.
  - Contenu : manifeste, `sw.js` (mise en cache complète, polices Google mises en cache à la première ouverture, nouvelle version proposée au menu par « Nouvelle version : mettre à jour »), icônes (écu aux trois chevrons et rapières croisées), notice LISEZMOI.md pour GitHub Pages.
  - `src/pwa.js` : `GAME_VERSION`, enregistrement du service worker seulement si le manifeste est présent (jamais sur claude.ai), `navigator.storage.persist()`.
- **Tests** :
  - tests/saveio.js 8/8 ;
  - service worker : mode avion et mise à jour vérifiés dans Chromium ;
  - toutes les suites passent, démonstration sans erreur.
- **Non vérifié** : un vrai iPhone 13 (installation, mesure réelle).

---
# v34-36 / 1.1.0 — sprints 2 à 6 (23-27/10/2026)

## Sprint 2 · Fluide
- **Interpolation** : chaque image est dessinée entre les deux derniers pas de simulation (`lerpJ`, selon `G.acc`).
- **Caméra** : tremblement lissé par des sinusoïdes au lieu d'un tirage aléatoire, et légère rotation sur les gros chocs.
- **Contre-jour à demi-définition** : essayé, aucun gain mesuré, donc retiré.
- **Images prêtes des poses stables** : pas faites.

## Sprint 3 · Lisible
- **HUD dimensionné en points d'écran** (`u = 1/échelle`, ×1,39 sur iPhone 13) :
  - blason et nom du héros, vie avec traînée, souffle ;
  - sceaux de cire pour les manches, étiquettes de blessure (BRAS, JAMBE, FLANC) ;
  - chrono en médaillon seulement si le temps compte ;
  - mesure en 4 segments, libellé affiché 1,2 s ;
  - plus de texte « FER ENGAGÉ ».
- **Marques des duellistes** (écu de garde, anneau de riposte, charge) : dessinées dans le repère de la caméra. Elles ne glissent plus quand la caméra zoome.
- **Boutons** :
  - Garde : liseré rouge et blanc pendant la fenêtre de parade, plus un tic sonore ;
  - Attaque : arc de charge de la fente lourde, et devient RIPOSTE dorée pendant l'offre (le bouton Riposte reste aussi) ;
  - Pause : 44×44 en haut à droite.
- **Options** :
  - Gaucher : commandes en miroir ;
  - Souffle : activable ou non.
- L'aide « pas rapide » ne s'affiche qu'aux 3 premiers duels.
- **IA contre le martèlement** :
  - elle retient la répétition d'un même coup, ce qui rend la garde et la parade parfaite plus probables ;
  - face à un marteleur, elle tient la garde au lieu d'attaquer dans ses estocades.
  - Résultat : robot « marteleur » contre le Duelliste, 7/30 → 0/30 (1/20 avec le souffle).

## Sprint 4 · Profond
- **Souffle** (`BREATH_COST`, `BREATH_REGEN` 0,2/s) :
  - la jauge baisse à chaque coup, coup manqué, pas rapide, feinte et garde encaissée ;
  - elle remonte surtout à distance et en garde ;
  - essoufflé (sous 30 %) : préparation des attaques +15 % ;
  - sous 8 %, la garde tenue cède (garde brisée).
- **Mur** : dos au bord (moins de 45 px), pas de retraite rapide (« Acculé ! ») et recul ×0,3.
- **Relecture** (src/replay.js) :
  - les 2 dernières secondes sont enregistrées ;
  - après une touche reçue, le bouton « Revoir » apparaît 4,5 s (touche R au clavier) ;
  - ralenti ×0,3, sans les commandes, avec une explication : contre-temps, retour en garde, garde brisée, prise de fer, pas rapide, essoufflé, feinte, garde relâchée trop tôt, pas de garde.

## Sprints 5-6 · Histoire « Le Registre écarlate » (src/story.js)
- **Contenu** : 10 chapitres en 3 actes, avec dialogues originaux.
- **Déroulé d'un chapitre** :
  - scène d'ouverture ;
  - un choix éventuel : chapitre 3 provoquer ou saluer ; chapitre 5 épargner ou livrer Ombeline ; chapitre 10 rendre ou brûler le Registre, avec deux fins ;
  - un à trois duels ;
  - une condition spéciale qui donne une étoile : avant le guet, parades parfaites, battements, sans perdre de manche, garde brisée 2 fois, jambe blessée, attaques manquées, vie restante ;
  - une scène de fin et des récompenses (rapières, écus, bottes).
- Le chapitre 9 enchaîne 3 duels, avec la vie reportée (+35 entre deux).
- **Adversaires signature** : Don Gaspar, Ombeline (sa lanterne se lève avant une vraie attaque), Capitaine de Rouvray, le marquis de Brévannes (tic-tac avant ses coups), le Chevalier d'Écaille (écailles qui luisent avant la griffe).
- **Bottes secrètes** : les avantages de la Nuit de Paris gagnés en Histoire. Une seule portée, et elle agit en Histoire et dans la Nuit de Paris. Ce ne sont pas de nouvelles techniques animées : c'est à faire.
- **Sauvegarde** : `Save.data.story` (chapitres, étoiles, choix, bottes, fin), incluse dans l'export.
- **Interface** : scènes en bandeau en bas d'écran (blason, nom, texte, Passer, choix) sur le décor du chapitre.

## Vérifié
- **Tests** : tests/replay.js 8/8, tests/story.js 10/10 (les 10 chapitres de bout en bout), et toutes les suites (50, 17, 5, 11, 6, 6, 14, 17, 9, 8).
- **Démonstration** : sans erreur.
- **Version installable** : 1.1.0 (zip dans les Téléchargements).

## v37 — Sprint 7 : décors en profondeur et effets de combat (PWA 1.2.0)
- Nouveau `src/depth.js` : décor en 3 plans (fond en parallaxe 0.8, sol à position normale, premier plan sombre flouté en parallaxe 1.32).
- Premiers plans par lieu : salle (rideau, poteau), église (pilier, candélabre), cloître (oranger, pilier), nuit (lanterne, borne et corde), loggia (cheminée, pot à feu).
- Vie des décors : fumées, oiseaux, vouivre de passage (loggia toutes les 38 s, nuit toutes les 44 s), reflets sur la Seine, brume, passants au cloître, encens à l'église, rai de soleil en salle.
- Effets : impact (0,14 s : assombrissement bref, halo, lignes de vitesse, couleur selon parade, bris de garde, blocage ou touche), étincelles en traînées, reflet qui court sur la lame toutes les 2,6 s, poussière aux fentes et aux esquives.
- Mesure (émulation iPhone) : rendu moyen environ 22 ms par image en salle et de nuit, sans erreur. Pas encore testé sur un vrai iPhone.
- Non fait : portraits en incrustation pour les bottes.

## v38 — Sprint 8 : cape en tissu, visages vivants, portraits (PWA 1.3.0)
- Nouveau `src/cloth.js`.
- Cape simulée : une ligne médiane de 7 points (Verlet, 120 Hz, dans `Fighter.update`), bords calculés de part et d'autre ; retard sur les épaules, s'envole au pas rapide et à la fente, vent selon le lieu (`CLOTH_WIND` : intérieur 0, cloître 22, nuit 48, loggia 70 ; ×1,4 sous la pluie), reste derrière le corps, au-dessus du sol, jamais au-dessus des épaules. Plis dessinés là où le tissu se courbe. Capturée dans la relecture.
- Visage (`Face`) : clignement, regard qui suit la pointe adverse, sourcils lissés, nouvelles expressions (essoufflé qui halète, blessé mâchoire serrée, sourire en coin à la feinte, yeux fermés au KO), sueur sur la tempe.
- Portraits en incrustation (`CutIn`) : bandeau de 0,9 s avec la tête du personnage en gros plan sur coup critique et coup décisif. Option « Portraits » (activée par défaut).
- Mesure (émulation iPhone) : rendu moyen 23 à 26 ms (contre environ 22 ms au sprint 7, l'écart est dans le bruit de mesure). Pas testé sur un vrai iPhone.

## v39 — Riposte sur Attaque, esquive (PWA 1.4.0)
- Le bouton Riposte est supprimé : pendant l'offre, Attaque devient « RIPOSTE » (doré, pulsation, anneau de timing dans le bouton). Clavier : J.
- Nouveau bouton Esquive à sa place (clavier I ou U). `ESQ = { a: .04, b: .22, dur: .5, fail: .34, perfect: .1 }`, coût de souffle 0,14.
  - Variante choisie selon l'attaque adverse : passe sous la lame (estocade, imbroccata, dégagement…) ou volte (fente, estocade basse, ligne basse). Pas contre rien : sans attaque, passe sous la lame.
  - Une attaque qui part pendant la fenêtre, à portée, est esquivée (`G.dodge`) : elle finit dans le vide, l'esquiveur reçoit l'offre de riposte. Esquive « parfaite » si la lame part dans les 0,1 s après la fenêtre : ralenti bref.
  - Esquive dans le vide : état `stumble` (0,34 s), souffle perdu ; l'IA le punit.
  - Rendu : poses `esqSotto`, `esqVolte`, `stumble` ; silhouettes fantômes (`G.drawGhosts`) ; élan donné à la cape (`Cloth.kick`) ; poussière.
  - IA : `esq` 0 / 0,07 / 0,13 selon le niveau, seulement si elle a le temps (> 0,09 s avant l'impact estimé) ; jamais contre la fente lourde.
- Entraînement : exercice « Esquive » ; démonstration : deux étapes (sous la lame, volte).
- Tests : `tests/esquive.js` 13/13 ; `ripbtn.js` supprimé (bouton disparu).
- Équilibre : inchangé par rapport à la v38 sur les bots. Faiblesse déjà présente avant : les fentes répétées battent l'IA « duelliste » (5-6 sur 6), à traiter.

## v40 — Sprints 9 et 10 : mise en scène, carnet, leçons, réactions, boss (PWA 1.5.0)
- **Gameplay**
  - L'IA lit les fentes répétées (`fenteT`) : volte, rupture ou parade au dernier moment, et elle ne s'avance plus dans la reprise d'un fendeur. Fente dans le vide : récupération +0,3 s (au lieu de 0,22). Bots « fentes » contre Duelliste : 0/6 (avant 5 à 6/6).
  - Bilan d'après-match (`src/bilan.js`) : % de parades parfaites, esquives, ripostes, coup subi n° 1 (`stats.takenBy`), et un conseil.
- **Mise en scène** (`src/cine.js`)
  - Acteurs : p, e, figurants (`NPC_LOOK` : Lacombe, Tancrède…) ; instructions walk, run, pose, stance, cam, face, shake, sfx.
  - Bulles de dialogue avec texte qui s'écrit, carton de chapitre façon gravure.
  - Les 10 chapitres ont leurs scènes (intro, fin, et les deux fins du chapitre 10).
  - Salut avant chaque manche selon le héros : classique, vif, gascon, diestro, ombre, colosse ; annulé au « Allez ! ».
- **Carnet du maître d'armes** (`src/codex.js`) : 29 entrées (techniques avec noms d'époque, écoles, lieux, époque, légende du jeu séparée), débloquées en jouant, sauvegardées dans `Save.data.codex`. Menu « Carnet ». Noms d'époque aussi dans l'aide.
- **Leçons** : une par chapitre (`LESSONS`), carte affichée au début des duels ; la 3e étoile vient du défi de leçon (au lieu de la note A/S).
- **Combat**
  - Réaction selon la zone touchée (bras, jambe, flanc).
  - Chute selon le coup final : à genoux (jambe), à la renverse (bras), chute (flanc).
  - Boss en deux phases (`secondWind`, sous 50 % de vie, une fois par match) : Gaspar fer, Rouvray force, Brévannes temps, Écaille griffes, Ombeline feintes, et les boss de la Nuit de Paris. Halo rouge.
  - Tic : appel du pied (poussière, petit bruit) avant le coup favori de chaque adversaire.
- **Tests** : `tests/sprint9.js` 10/10 ; toutes les suites passent. Rendu émulé iPhone : 26 à 28 ms par image (bruit de mesure possible, pas sur vrai iPhone).

## v41 — Finales automatiques (PWA 1.6.0)
- `src/finisher.js` : la touche qui gagne le match (duel libre, tournois, Histoire, Nuit de Paris ; jamais à l'entraînement ni sur une manche non décisive) lance la finale du vainqueur. État `finish`, caméra rapprochée, portrait avec le nom, désarmement, puis chute ou genou à terre, puis la suite habituelle. Un toucher la passe. Option « Finales ».
- Une finale par héros :
  - Vaucelles : La Morsure du Vieux Loup ;
  - Isaure : Le Fil de l'Aiguille ;
  - Bastien : Le Coup de dés ;
  - Álvaro : Le Cercle parfait (cercle doré au sol) ;
  - Corvin : Le Pas de l'Ombre (traverse avec fantômes) ;
  - Mathurin : Brise-Garde.
- Une finale par type d'adversaire : drac (Le Festin du drac), destreza (La Rueda), lanterne (Éblouissement), horloger (Minuit sonne), gardes et mousquetaires (Pour Son Éminence), autres (Désarmement).
- Esprit de l'édit : on domine et on désarme, pas de mise à mort.
- Tests : `tests/finisher.js` 9/9.

## v42 — Sprints 11 et 12 : fluidité, le fer (PWA 1.7.0)
- **Fluidité**
  - Rendu direct des personnages (`Paint.direct`) : plus de passes de composition hors écran. Tenue teintée par l'ambiance du lieu (`tintLook`, mise en cache), modelé par membre selon la lumière du lieu, liseré de contre-jour tracé dans `limb()` (`RIM`), ombre portée simple, sillage et reflet de pluie en tracé.
  - Par défaut sur écran tactile ; le rendu composé « cinéma » reste choisi automatiquement si l'appareil tient moins de 10,5 ms par image pendant 8 fenêtres, et abandonné au-delà de 19 ms (`ct2d.rmode`).
  - Palier « allégé » (`Paint.lite`) au-delà de 19 ms : sans plis de cape, poussière ni fantômes multiples.
  - Vignettage et grain passés en calque CSS (`#vig`) : une image plein écran de moins à dessiner.
  - Mesure en émulation iPhone (script + rastérisation) : salle 44 → 12,7 ms, cloître 14,3, loggia 15,1, nuit 16,3, église 17,2. Script seul : 25,7 → 1,5 à 1,9 ms. Pas sur un vrai iPhone.
  - Réactivité : le geste démarre au pas de simulation qui suit l'appui (≤ 8,3 ms).
- **Le fer**
  - Liement : fers engagés, les lames glissent avec étincelles et bruit d'acier (`Snd.scrape`).
  - Maintenir → pousse la lame (on n'avance presque plus) ; jauge `ferCtl` (+1,6/s, retour 0,6/s) ; à ±1 : fer dominé (`G.dominate`). Le dominé a sa prochaine préparation plus lente (×1,2 pendant 1,1 s), le dominant a l'attaque vive (bonus du battement). L'IA pousse aussi, selon son goût du fer et son adaptation.
  - Reprise en arrière : ← pendant le retour de fente (ou d'estocade basse ou de fente lourde) → récupération −25 % en reculant.
  - Sons : battement (`beatTac`), froissement (`scrape`), rapière qui tombe (`clatter`).
  - Détails : broderie au point de chaînette sur le pourpoint, galons aux poignets ; l'étincelle d'un impact éclaire brièvement les combattants proches.
  - Carnet : entrée « Le liement · legare ».
- **Tests** : `tests/sprint11.js` 12/12 ; un bot qui pousse sans arrêt perd 0/6 contre Duelliste et Maître.

## v43 — Sprints 13 à 16 (PWA 1.8.0)
- **S13 · Manuscrit du duelliste** (`src/manuscrit.js`)
  - 16 planches de techniques, gravées par le jeu lui-même : figures en sépia, papier vergé, lignes de mesure, lettres A et B.
  - Une technique est maîtrisée après N réussites en duel.
  - Pages d'adversaires : victoires et défaites, tic, coup qui a le plus coûté, conseil.
  - Signature et surnom selon le style de jeu ; bouton « S'entraîner à ce geste ». Données dans `Save.data.manus`.
  - Menu en 4 onglets (`Menu`) : Jouer, Salle d'armes, Bibliothèque, Options.
- **S14 · HUD et animations**
  - Un seul message important à la fois : l'annonce du carnet attend le bandeau, le portrait et la fiche de leçon ; la fiche de leçon attend le bandeau.
  - Jauge de souffle plus épaisse, qui pulse et indique « À bout de souffle ».
  - Narration en bandeau fin en haut de l'écran.
  - Pause : leçon en cours, « Revoir la dernière touche », liste des coups.
  - La bouche bouge pendant les répliques ; les figurants hochent la tête.
  - Tic de caractère toutes les 5 s environ, selon le style de salut (`idleStyle`).
- **S15 · Histoire** (`src/story2.js`)
  - Répliques ajoutées aux chapitres 1 à 8 et 10.
  - Les choix pèsent : Ombeline épargnée revient aux chapitres 9 et 10 (`cond`) ; le mousquetaire salué revient au 9.
  - 6 récits personnels, ouverts après le chapitre 10, chacun avec un adversaire, une mise en scène, une leçon et un défi.
  - Lore : La Rochelle, la journée des Dupes, la Pomme de Pin, la Croix-du-Trahoir, les six lames.
- **S16 · Finitions**
  - Ombre du bas du corps en rendu direct.
  - Touches peintes seulement si l'appareil a de la marge (sinon le coût de rastérisation monte de 5 ms en émulation).
  - `shade()` : cache à deux niveaux et facteur arrondi par paliers de 2 %, ce qui supprime une fuite mémoire lente. Allocations de script : environ 21 → 5 Ko par image.
  - Visages : âge (rides), balafre, nez.
  - Le chapeau du vaincu vole à la finale ; le pourpoint s'ouvre sur une blessure au flanc.
  - Finales adverses renforcées : cadran de « Minuit sonne », envol de lame et lame levée pour « Désarmement ».
  - Initiation interactive en 5 gestes au premier lancement.
  - Options : texte plus grand, gros boutons, signal de parade en forme (losange « ! ») lisible sans les couleurs.
- **Tests** : `tests/sprint13.js` 14/14. Rendu émulé : identique à la v42 en mesure comparée (la machine de test varie d'une heure à l'autre).
