# Assets visuels — menu client

Ce document complète [`assets/menu/README.txt`](../assets/menu/README.txt) pour le plan « visuel client ».

## Bundling (Expo)

Metro résout les images via `require` dans [`src/constants/menuImages.ts`](../src/constants/menuImages.ts). La config [`app.config.js`](../app.config.js) inclut `assetBundlePatterns: ['**/*']` : tout fichier présent sous le dépôt au moment du build est embarquable.

## Fichiers attendus (`assets/menu/`)

Un PNG par entrée de `MENU_IMAGES` (même nom que l’`id` dans [`src/constants/menu.ts`](../src/constants/menu.ts)) :

| Fichier | Id produit |
|---------|------------|
| `smash-1.png` … `smash-4.png` | Smash simple → quadruple |
| `frites-s.png`, `frites-m.png`, `frites-l.png` | Frites S/M/L |
| `bag-poulet.png`, `bag-kebab.png`, `bag-steak.png`, `bag-smash.png` | Baguettes |
| `sand-pita-*.png`, `sand-wrap-*.png` | Sandwichs pita / wrap |
| `four-kebab.png`, `four-poulet.png`, `four-steak.png` | Au four |
| `des-daim.png`, `des-tiramisu.png`, `des-mystere.png` | Desserts |
| `bois-eau.png`, `bois-capri.png`, `bois-canette.png`, `bois-50.png` | Boissons |

**Remplacement sans toucher au code :** garder le nom de fichier, écraser le PNG (idéalement même dimensions, carré pour les vignettes liste).

**Jeu de photos distinctes (stock générique, réseau requis) :** `npm run assets:menu:stock` → [`scripts/fetch-menu-stock-photos.mjs`](../scripts/fetch-menu-stock-photos.mjs) (recadrage 800×800 ; remplacer ensuite par vos shoots pour la prod).

**Captures flyer / Snapchat (visuels Husko réels) :** `npm run assets:menu:flyers` → [`scripts/extract-menu-from-flyers.mjs`](../scripts/extract-menu-from-flyers.mjs) — recadre automatiquement depuis les PNG du dossier projet Cursor (`HUSKO_FLYER_DIR` ou chemin par défaut avec `os.homedir()`). Surcouche : `HUSKO_FLYER_472` / `HUSKO_FLYER_571` pour forcer un fichier source précis (dimensions **strictement** 472×1024 et 571×1024). `node scripts/extract-menu-from-flyers.mjs --dry-run` affiche les recadrages sans écrire. Ajuster les pourcentages dans le script si la mise en page flyer change.

**Contrôle rapide après import :** `npm run assets:menu:verify` (présence + `verify:menu-visual-pro`).

**Afficher uniquement dégradé + icône :** retirer la ligne correspondante dans `menuImages.ts` (voir README dans `assets/menu/`).

## Branding boot client

- Fichier : `assets/branding/client-boot-hero.png` (référence [`src/constants/brandingAssets.ts`](../src/constants/brandingAssets.ts)).
- Génération procédurale + icônes : `npm run brand:assets` → [`scripts/generate-brand-assets.mjs`](../scripts/generate-brand-assets.mjs).
- Pour un rendu pro, remplacer ce PNG par une affiche HD exportée (même nom, même emplacement).

## Alerte produit — visuels « non pro » (même image dupliquée)

`verify:menu-assets` ne vérifie que la **présence** des fichiers. Si tous les PNG ont été générés en copiant **le même export** (souvent : **même taille en octets** pour chaque fichier), la liste client affichera des vignettes **identiques** : aucun correctif layout/React ne suffit.

- Détection : `npm run verify:menu-visual-pro` (avertissement ; code 0).
- Gate release stricte (échoue tant que les fichiers ne se distinguent pas) : `npm run verify:menu-visual-pro:strict`
- Dérogation CI locale : `HUSKO_ALLOW_MENU_PLACEHOLDERS=1` (à éviter en prod).

La checklist `npm run chantiers:check` exécute aussi cette alerte après la section « photos menu ».

## Vérification rapide

- Cohérence ids : chaque `id` de `MENU` a une entrée dans `MENU_IMAGES` (sinon repli [`MenuItemVisual`](../src/components/westcoast/MenuItemVisual.tsx)).
- Après ajout de produits : ajouter l’`id` dans `menu.ts`, le fichier image et la ligne `require` dans `menuImages.ts`.
