# Brief UI/UX — Husko (freelance / photos)

Ce document sert de **courte base commune** pour un freelance UI/UX mobile et pour le **recadrage des photos menu**. La stack applicative est **Expo + React Native** (un seul dépôt) ; les maquettes servent de **référence UX**, pas d’une seconde base de code.

## Direction visuelle (obligatoire)

- **Design system** : tokens **West Coast / Lowrider** — ne pas inventer une palette par écran.
  - `src/constants/theme.ts`
  - `src/constants/westCoastTheme.ts`
- **Produit** : fil unique décrit dans `src/constants/productDirection.ts`.

## Écrans prioritaires (parcours client)

| Zone | Route / entrée | Objectif UX |
|------|------------------|-------------|
| Accueil / menu | `app/client/index.tsx` | Hiérarchie claire, catégories, CTA commande |
| Panier | `app/client/panier.tsx` | Récap, zone livraison, validation |
| Suivi commande | flux client associé au suivi (écrans sous `app/client/`) | États lisibles, pas d’ambiguïté |
| Hub / variantes | selon `npm run start:hub` / profils | Cohérence avec le client si budget limité |

Lister les **composants réutilisables** dans `src/components/` (dont `westcoast/`) pour éviter des maquettes inapplicables.

## Photos menu — convention fichiers

Chaque plat / boisson a un **`id` stable** dans `src/constants/menu.ts`. Le fichier image correspondant est :

`assets/menu/<id>.png`

Le mapping `id` → `require(...)` est dans `src/constants/menuImages.ts`. Pour **remplacer** une photo : garder le **même nom de fichier** (même `id`), PNG recommandé ; pas besoin de toucher au code si le nom ne change pas.

### Liste des `id` à photographier ou à exporter (1 fichier = 1 ligne)

| `id` | Nom affiché (réf.) |
|------|-------------------|
| smash-1 | Smash simple |
| smash-2 | Smash double |
| smash-3 | Smash triple |
| smash-4 | Smash quadruple |
| frites-s | Frites chargées S |
| frites-m | Frites chargées M |
| frites-l | Frites chargées L |
| bag-poulet | Baguetta poulet |
| bag-kebab | Baguetta kebab |
| bag-steak | Baguetta steak |
| bag-smash | Baguetta Smash B |
| sand-pita-poulet | Sandwich poulet (pita) |
| sand-pita-steak | Sandwich steak (pita) |
| sand-pita-kebab | Sandwich kebab (pita) |
| sand-wrap-poulet | Wrap poulet |
| sand-wrap-kebab | Wrap kebab |
| sand-wrap-steak | Wrap steak |
| four-kebab | Au four kebab |
| four-poulet | Au four poulet |
| four-steak | Au four steak |
| des-daim | Daim |
| des-tiramisu | Tiramisu |
| des-mystere | Dessert mystère |
| bois-eau | Eau |
| bois-capri | Capri-Sun |
| bois-canette | Canette |
| bois-50 | Bouteille 50cl |

**Livrable photo** : cadrage et lumière **homogènes** entre les items. **Ratio source conseillé : 1:1** (carré), sujet centré, marge ~10 % sur les bords — l’app affiche en carré avec recadrage (`cover`). Export **900–1200 px** de côté, PNG sRGB. Détail : en-tête de `src/constants/menuImages.ts`.

## Branding plein écran (optionnel)

- Fonds / splash : `assets/branding/` — voir `src/constants/brandingAssets.ts` pour les références utilisées dans l’app.

## Après livraison des assets

- **Menu (fichiers + ids)** : `npm run verify:menu-assets` — présence des PNG et alignement `menu.ts` ↔ `menuImages.ts`.
- **Menu (pas de doublons massifs)** : `npm run assets:menu:verify` — inclut `verify:menu-assets` + contrôle de diversité des tailles (gate « pro »).
- **CI locale complète** : `npm run verify`.
- **Release / gate menu strict** : `npm run verify:menu-visual-pro:strict` ou `npm run release:gate:pro` — voir [`RELEASE_CHECKLIST.md`](../RELEASE_CHECKLIST.md) § Photos menu et [`docs/client-menu-assets.md`](client-menu-assets.md).
- Build APK : `DEPLOIEMENT.md` et `npm run build:apk:unified:queue`.

## Documents liés (même vérité, angles différents)

| Document | Rôle |
|----------|------|
| [`src/constants/menuImages.ts`](../src/constants/menuImages.ts) | Liste technique `require` + grille export |
| [`docs/client-menu-assets.md`](client-menu-assets.md) | Bundling, scripts stock/flyers, alerte placeholders |
| [`docs/design-tokens-reference.md`](design-tokens-reference.md) | Tokens + rappel photos / brand |
| [`docs/visuel-west-coast-checklist.md`](visuel-west-coast-checklist.md) | GTA / Maps / photos dans l’app |
| [`assets/menu/README.txt`](../assets/menu/README.txt) | Raccourci dossier `assets/menu/` |
