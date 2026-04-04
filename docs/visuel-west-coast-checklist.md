# Checklist visuel West Coast (GTA, Cadillac, photos menu)

Ce document explique **où** le rendu « néon / HUD / Cadillac » est implémenté et **pourquoi** il peut manquer sur un APK de test.

## 1. Mini-carte « GTA » (contour néon, bandeau « LONG BEACH · CADILLAC SUIVI », radar)

- **Composants** : [`src/components/GTAHudFrame.tsx`](../src/components/GTAHudFrame.tsx) (cadre HUD) + [`src/components/GTAMiniMap.tsx`](../src/components/GTAMiniMap.tsx) (carte Google **ou** radar de secours [`GTAMiniMapFallbackInterior`](../src/components/GTAMiniMapFallbackInterior.tsx)).
- **Détection clé Maps** : [`src/utils/mapsBuildInfo.ts`](../src/utils/mapsBuildInfo.ts) lit `extra.mapsAndroidKeyOk` / `mapsIosKeyOk` depuis [`app.config.js`](../app.config.js) (pas de sous-chaîne `REMPLACEZ` dans la clé injectée au build).
- **Si la clé Android/iOS manque au build** : l’app utilise le **mode radar** (fond sombre + repères) **dans le même cadre GTA** — tu dois quand même voir le contour néon et le bandeau. Si tu ne vois **rien**, vérifie que tu es sur un écran qui affiche `GTAMiniMap` (ex. [`app/client/panier.tsx`](../app/client/panier.tsx), [`app/client/suivi.tsx`](../app/client/suivi.tsx) selon statut de commande).
- **Si la clé est présente mais tuiles grises** : problème **Google Cloud** (API Maps SDK activée, facturation, restrictions de clé par package `com.husko.*` / SHA-1). Un **`eas update` JS ne corrige pas** les clés natives : il faut [`npm run eas:sync:maps`](../DEPLOIEMENT.md) puis **rebuild** l’APK / iOS. Voir [DEPLOIEMENT.md — Google Maps](../DEPLOIEMENT.md).

## 2. Titre « Suivi Cadillac · mode GTA »

- Affiché sur [`app/client/suivi.tsx`](../app/client/suivi.tsx) uniquement lorsque la commande est **« En route »** (`status === 'on_way'`) : c’est le suivi live avec position livreur. Avant cette étape, tu peux voir un **aperçu trajet** avec un autre libellé (« Aperçu du trajet »).

## 3. Photos des sandwichs / articles

- **Source** : fichiers PNG sous `assets/menu/` mappés dans [`src/constants/menuImages.ts`](../src/constants/menuImages.ts) (requires statiques). Toutes les lignes du [`MENU`](../src/constants/menu.ts) ont une entrée image.
- **Affichage** : [`src/components/westcoast/MenuItemVisual.tsx`](../src/components/westcoast/MenuItemVisual.tsx). En cas d’échec de décodage, repli automatique sur dégradé + icône (comportement préférable à une case vide).
- Les images sont dans le **bundle JS / assets** ; un OTA les met à jour comme le reste du JS. Si tu ne vois que des icônes : vérifier un **build récent** et le bon **canal** EAS Update.

## 4. Réglages à vérifier (ordre recommandé)

1. `npm run firebase:env:check` et `npm run eas:sync:firebase` / `eas:sync:maps` avant les builds (voir [DEPLOIEMENT.md](../DEPLOIEMENT.md)).
2. **Rebuild natif** après ajout ou correction des clés Maps (pas seulement OTA).
3. Sur l’app : écran **App & mises à jour** (client) ou **Réglages** — les [`DeploymentHints`](../src/components/DeploymentHints.tsx) indiquent liaison Firebase et clés Maps manquantes dans le build.
4. Pour comparer au rendu attendu : **APK installé** ou build release, pas seulement Expo Go avec Metro sur le PC (réseau / cache).

## Voir aussi

- [docs/design-tokens-reference.md](design-tokens-reference.md) — tableau tokens couleur / typo / assets / Maps.
- [docs/parcours-demo-firebase.md](parcours-demo-firebase.md) — synchro commandes et matrice de builds.
- [DEPLOIEMENT.md](../DEPLOIEMENT.md) — détail EAS, Firebase, Maps.
