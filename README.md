# Les Lames de l'Ombre

Duels à la rapière dans le Paris de 1633, avec une touche de fantastique. Jeu web en 2D (Canvas), pensé pour l'iPhone en paysage et installable comme une application (PWA).

Version 1.8.0.

## Contenu du jeu

- **Combat**
  - Estocade, fente, coups bas et hauts, feintes, battements, prise de fer.
  - Parade au dernier instant puis riposte (le bouton Attaque devient Riposte), esquive (passe sous la lame ou volte).
  - Liement des lames et domination du fer, reprise en arrière.
  - Souffle, blessures localisées, finales automatiques propres à chaque personnage.
- **Mode Histoire « Le Registre écarlate »** : 10 chapitres mis en scène, avec bulles, figurants et choix qui pèsent, plus 6 récits personnels.
- **Nuit de Paris** (enchaînement de duels), tournois, entraînement guidé et initiation.
- **Bibliothèque**
  - Le carnet du maître d'armes : encyclopédie historique, avec la légende du jeu séparée des faits.
  - Le manuscrit du duelliste : planches gravées des techniques maîtrisées, pages des adversaires, surnom.
- **Accessibilité** : texte plus grand, gros boutons, signal de parade lisible sans les couleurs, mode gaucher.

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
| `tools/` | `pwa_build.py` construit la version installable ; `publish.sh` la place à la racine pour GitHub Pages. |
| `tests/` | Tests automatisés avec Playwright (`npm i` puis `node tests/suite.js`). |
| `notes/` | Notes de conception et journal des versions. |

## Droits

Personnages, intrigue et dialogues sont originaux. Seuls les faits et personnages historiques cités (Richelieu, l'édit de 1626, les lieux de Paris, les traités d'escrime) relèvent de l'histoire. Aucune licence n'est encore précisée : tous droits réservés tant qu'aucune licence n'est ajoutée.
