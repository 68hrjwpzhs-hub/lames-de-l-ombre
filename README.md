# Les Lames de l'Ombre

Duels à la rapière dans le Paris de 1633, avec une touche de fantastique. Jeu web en 2D (Canvas), pensé pour l'iPhone en paysage et installable comme une application (PWA).

Version 7.0.0 « Le Tournoi du Roi » (notes : `notes/v7.0.md`, `notes/v6.0.md`, `notes/v5.0.md`, `notes/v4.0.md`, `notes/v3.0.md`, `notes/v2.0.md`). Français et anglais. Moteur WebGL (lumière, halo, reflets) avec retour automatique au rendu 2D.

## Contenu du jeu

- **Le Tournoi du Roi (7.0)** : un prologue jouable, des coups plus sensibles, six adversaires à signature, 30 épreuves à étoiles, une garde-robe et huit rapières légendaires, trois familles d'armes (épée de cour, rapière longue, sabre), le Tournoi du Roi et son générique, un journal à trois objectifs et la Renommée, une musique par ville, le Livre V « La Couronne de fer », quatre nouveaux lieux, deux héros (Oriane la Main-Gauche, Barthélemy l'Aveugle), la carrière de 1633 à 1640 et une version installable plus légère.

- **Le Royaume (6.0)** : des rivaux qui reviennent (cicatrices, titres, coups appris), un Paris vivant (heure, événements, quartiers, personnages), des conséquences (blessures durables, chirurgien, arrestation, premier sang ou outrance), trois écoles d'escrime, désarmement, pommeau, saisie et combat sur deux hauteurs, la carte d'Europe (Madrid, Venise, Londres), le Livre IV « Le Carnaval de Venise », la Nuit de Paris 2.0 (dix niveaux, chemins, pactes) et une lumière retravaillée (flambeaux, ombres, rayons, météo, palette par ville).

- **Interface 5.0** : un accueil à trois choix (Continuer, Paris, Duel rapide), la carte gravée de Paris où chaque mode est un sceau de cire, un bandeau de combat épuré. L'ancien menu reste accessible (« registre »), et l'interface classique se rétablit dans les Options.

- **Combat**
  - Estocade, fente, coups bas et hauts, feintes, battements, prise de fer.
  - Parade au dernier instant puis riposte (le bouton Attaque devient Riposte), esquive (passe sous la lame ou volte).
  - Liement des lames et domination du fer, reprise en arrière.
  - Souffle, blessures localisées, finales automatiques propres à chaque personnage.
  - Main gauche : dague, cape ou rondache, sans bouton de plus.
- **Mode Histoire**
  - « Le Registre écarlate » : 10 chapitres mis en scène, avec bulles, figurants et choix qui pèsent, plus 6 récits personnels.
  - Livre II « Le Sel et la Cendre » : 8 chapitres, 3 nouveaux décors, 2 boss et deux fins.
  - Livre III « Le Cercle de Madrid » : 8 chapitres, 3 décors madrilènes, 3 boss, fins selon vos choix.
- **Cape et épée** : décors utilisables (tabouret, tonneau, table, lustre), jauge de panache, un contre plusieurs, joute verbale avant le duel.
- **Paris** : carte des quartiers, missions du jour, réputation (honneur, crainte, faveur), déguisements, poursuites sur les toits, valet et compagne d'armes, armurier.
- **Nuit de Paris** (enchaînement de duels), tournois, **Défi du jour**, **votre école d'escrime** (élèves qui se battent à votre place), entraînement guidé et initiation.
- **Bibliothèque**
  - Le carnet du maître d'armes : encyclopédie historique, avec la légende du jeu séparée des faits.
  - Le manuscrit du duelliste : planches gravées des techniques maîtrisées, pages des adversaires, surnom.
- **Finition** : 30 succès, nouvelle partie +, mode photo, 3 emplacements de sauvegarde.
- **Commandes** : écran tactile, clavier, manette, gestes (option).
- **Accessibilité** : texte plus grand, gros boutons, signal de parade lisible sans les couleurs, mode gaucher, sous-titres des sons, mode daltonien, mouvements réduits, duel lent.

## Construire

```sh
sh tools/publish.sh            # assemble src/ et place la version installable (PWA) à la racine : index.html, manifeste, service worker, icônes
```

`sh build.sh` seul produit `index.html` sans la partie installable. Il faut Python et Pillow (`pip install pillow`).

## Publier en ligne et installer sur iPhone (GitHub Pages)

1. Sur GitHub, ouvrir **Settings → Pages**, puis choisir **Source : Deploy from a branch**, branche **main**, dossier **/ (root)**.
2. Le jeu est alors en ligne à l'adresse `https://<votre-compte>.github.io/lames-de-l-ombre/`. Chaque envoi sur `main` le met à jour.
3. Sur l'iPhone, ouvrir cette adresse dans Safari, puis Partager → **Sur l'écran d'accueil**. Les mises à jour arrivent seules ; le menu propose de recharger quand une nouvelle version est disponible.

Avec un compte GitHub gratuit, GitHub Pages ne fonctionne que pour un dépôt **public**.

## Structure

| Dossier | Contenu |
|---|---|
| `src/` | Code source : moteur, personnages, décors, IA, mode histoire, mise en scène, finales, carnet, manuscrit… L'ordre d'assemblage est dans `build.sh`. |
| `tools/` | `pwa_build.py` et `publish.sh` (version installable) ; `i18n_*.py` (anglais) ; atelier Python : `decors_render.js` + `decors_hd.py` (décors HD), `textures.py` (étoffes), `mocap.py` (vidéo → poses), `visual_check.py` (contrôle visuel). |
| `tests/` | Tests automatisés avec Playwright (`npm i` puis `node tests/suite.js`). |
| `notes/` | Notes de conception et journal des versions. |

## Droits

Personnages, intrigue et dialogues sont originaux. Seuls les faits et personnages historiques cités (Richelieu, l'édit de 1626, les lieux de Paris, les traités d'escrime) relèvent de l'histoire. Aucune licence n'est encore précisée : tous droits réservés tant qu'aucune licence n'est ajoutée.
