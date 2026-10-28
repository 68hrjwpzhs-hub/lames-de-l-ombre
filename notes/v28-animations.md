# Les Lames de l'Ombre — v28 (animations et combat à la rapière)

**22/10/2026** — Les animations sont retravaillées selon le brief « Optimisation professionnelle des animations ». Les durées de jeu et les contacts sont inchangés. Cette note complète `claude/contre-temps-arcade-design.md`.

## Audit (src/core.js)
- Squelette 2D en angles absolus, lissage du premier ordre.
- Fente lourde en 3 images clés, sans vrai cercle.
- Réactions figées.
- Aucune limite articulaire.
- Effacement 3D constant.

## Nouvelles clés de pose
Elles n'ont aucun effet sur les contacts ni sur la portée.
- `tw` : rotation des épaules (+ = épaule armée projetée vers l'adversaire, − = effacée).
- `ro` : pronation ou supination du poignet.
- `bz` : la lame sort du plan du profil ; la longueur projetée devient L·cos(bz).

## Fente lourde (`heavyPose`, src/core.js)
Les phases sont des fractions de wu, act et rec. Avec wu = .32, act = .14 et rec = .46 :

| Phase | Temps | Mouvement |
|---|---|---|
| 1. Préparation | 0 → 0,096 s | Compression, main ramenée. Jusqu'à 0,12 s, c'est la préparation de l'estocade : un appui bref reste une estocade. |
| 2. Montée de la lame | 0,096 → 0,198 s | La main passe au-dessus du front ; la pointe monte par le haut vers l'arrière ; les épaules s'effacent (tw −14). |
| 3. Moulinet | 0,198 → 0,341 s | Un tour complet (360°) de la pointe sur un cône incliné de 22° au-dessus de la tête. La lame sort du plan du profil jusqu'à bz ±62°. Le poignet tourne (ro ±55°) ; la main décrit un petit cercle. Le poids passe sur la jambe arrière et le pied avant se lève. |
| 4. Accélération finale | 0,341 → 0,432 s | La lame repasse par-dessus la tête et s'abat (courbe u^1.7, qui accélère). Le corps part en fente (outC) et les épaules tournent vers l'avant (tw +16). |
| 5. Impact | → 0,54 s | Le poids passe à travers la cible : la lame plonge un peu. Garde brisée, étincelles, son, tremblement et arrêt sur image sont inchangés (game.js). |
| 6. Récupération et exposition | → 0,92 s (+0,20 s si le coup manque) | Les jambes se relèvent d'abord, le bras reste devant, puis retour en garde. |

- **Contacts** : la fenêtre de contact (wu → wu + act + 0,05) ne commence qu'à la fin du moulinet. `contacts()` ignore aussi la lame quand |bz| > 40°.
- **Moment du contact** : il vient du coup final, lame descendante (a3 ≈ 50°), entre 0,39 et 0,43 s selon la distance. Avant cette version : 0,42 à 0,44 s.
- **Interruption** (touché, paré, choc) : la vitesse angulaire est bornée à 1500°/s et la lame revient dans le plan. Il n'y a jamais de tour à rebours.

## Autres coups
- **Estocade** : armé (genoux, main qui recule), estoc, poursuite (épaule +), petit rebond en garde.
- **Fente** : compression sur la jambe arrière, le pied avant se lève, la fente part. Au retour, les jambes reviennent d'abord et le bras reste devant.
- **Estocade basse** : armé bas, pronation.
- **Dégagement** : la pointe plonge sous la lame, main en quarte (ro −60).
- **Imbroccata** : main haute en supination (ro +50).
- **Riposte** : le bras part d'abord, le corps suit, puis poursuite.
- **Battement** : rebond de la lame (backOut).
- **Tous les coups** : le segment d'exécution (outC) n'est pas modifié. Les temps de contact sont identiques à l'image près (tests/contact_t.js).

## Réactions qui évoluent dans le temps (`reactPose`)
- **Parade parfaite (déséquilibre)** : bras jetés, buste rejeté, pied avant décollé, oscillation amortie, retour en garde à 62 % de la durée.
- **Garde brisée** : les genoux plient (py −8), la tête part en arrière, on titube (pied arrière), la lame vibre.
- **Touche** : choc net, puis rattrapage.
- **Choc des lames et lame battue** : vibration amortie.

## Pas et mouvements
- Pas d'approche (buste en avant, pointe qui menace) et pas de retraite (buste en arrière, lame plus haute).
- Fléchissement pendant que le pied voyage.
- Pas rapides en trois temps : compression, détente avec le pied levé, réception amortie.
- Parade tenue : le choc remonte dans le poignet et les genoux l'absorbent.
- Feinte : appel du pied, puis les genoux absorbent.
- Respiration et rotation lente des épaules au repos.

## Robustesse
- **Limites articulaires** : coude entre −40° et 165° ; poignet entre −125° et 125° hors attaque.
- Normalisation des angles à chaque changement d'état.
- **Nouvelles courbes** : inC, inOut, backOut.

## 3D (src3d/body3d.js)
- L'effacement du bassin et du buste suit `tw`.
- La main tourne autour de l'axe de la lame selon `ro`.
- La pointe sort du plan selon `bz`.

## Démonstration
Deux séquences ajoutées, « Jeu de jambes » et « Garde brisée ». Comme les autres, chacune passe d'abord au ralenti ×0,35, puis à vitesse normale. Le texte de la fente lourde est mis à jour.

## Tests
- **tests/anim.js : 17/17**
  - continuité de la pointe ;
  - limites articulaires ;
  - la lame ne traverse jamais son porteur ;
  - tour de 356° au-dessus de la tête ;
  - contact par le coup final ;
  - garde brisée ;
  - anticipation des coups ;
  - pieds sans glissement ;
  - résultat identique à 30, 60, 120 et 144 im/s ;
  - durées ;
  - interruption propre ;
  - réactions vivantes ;
  - appui bref ou maintenu ;
  - pause ;
  - coût de 4 µs par combattant et par pas.
- **Suites existantes** : 50/50, 17/17, 5/5, 11/11, 6/6, 6/6, 14/14. La démonstration complète tourne sans erreur.
- **iPhone 13 émulé** : sans erreur.

## Non vérifié
- Un vrai iPhone 13.
- La version publiée en direct : l'extension Chrome n'a pas répondu.
- **Limites connues** :
  - le moulinet complet dure 0,14 s (rapide, fidèle à la durée de jeu) ;
  - en rendu 2D, la sortie de plan se lit seulement par le raccourcissement de la lame ;
  - pas de clavicule animée sur les corps Mixamo.
