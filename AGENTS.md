# Husko — guide pour agents (humains & Cursor)

Ce fichier résume **où est la vérité** et **quelles commandes** utiliser. Le détail reste dans le README et les docs pointées.

## Direction produit et technique (fil unique)

- **Source de vérité :** [`src/constants/productDirection.ts`](src/constants/productDirection.ts) — `PRODUCT_DIRECTION`, `PRODUCT_DEFINITION_OF_DONE`, `PRODUCT_DELIVERABLE`.
- **Stack :** Expo Router + React Native (ce dépôt). UI : tokens **West Coast / Lowrider** dans `src/constants/theme.ts` et `src/constants/westCoastTheme.ts`. **Pas de Flutter** dans ce dépôt (pas de `pubspec.yaml` / Dart) : pour un projet Flutter, ouvrir dans Cursor **l’autre dossier** racine qui contient `pubspec.yaml`.
- **Données multi-appareils :** Firestore (`EXPO_PUBLIC_FIREBASE_*`), `src/services/firebaseRemote.ts`, `firestore.rules`.
- **Critères « terminé » typiques :** `npm run verify` ; parcours démo sur **APK installé** ; pas de régression visuelle majeure sur l’écran prioritaire (voir le même fichier TS).

## Commandes courantes

| Action | Commande |
|--------|----------|
| Installer les deps | `npm install` |
| Lancer l’app (dev) | `npx expo start` (variantes : `npm run start:client` / `start:gerant` / `start:livreur` / `start:hub`) |
| Gate qualité (CI locale) | `npm run verify` puis éventuellement `npm run release:gate` |
| Gate + **photos menu distinctes** (pas de placeholders dupliqués) | `npm run release:gate:pro` — échoue si les PNG `assets/menu/` sont encore majoritairement identiques en taille ; sinon `verify:menu-visual-pro` / `verify:menu-visual-pro:strict` |
| Après changement d’images menu (flyer / stock) | `npm run assets:menu:verify` — présence des fichiers + diversité des tailles (pas un seul PNG dupliqué 27×) |
| APK hub (EAS), attente jusqu’à la fin | `npm run build:apk:unified` (après `eas login`, secrets — voir `DEPLOIEMENT.md`) |
| APK hub (EAS), **sans bloquer** le terminal / l’IDE (Cursor) | `npm run build:apk:unified:queue` — même build avec `--no-wait` ; suivre la fin avec `npx eas build:list --platform android --limit 5 --non-interactive` ou le dashboard Expo, puis `npm run apk:download:unified` si besoin |
| Checklist release | [`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) |
| Régénérer icônes / splash / adaptive (West Coast) | `npm run brand:assets` — écrit sous `assets/` ; **un nouveau `eas build` est obligatoire** pour mettre à jour le logo launcher (l’OTA ne change pas l’icône native). |
| Vérifier clés Firebase (.env) | `npm run firebase:env:check` — strict : `firebase:env:check:strict` |
| Pousser Firebase / Maps vers EAS | `npm run eas:sync:firebase` · `npm run eas:sync:maps` |
| Perf : lister écrans avec listes | `npm run perf:list-screens` |
| Perf : modèle de rapport (matrice appareils) | [`docs/PERFORMANCE_REPORT_TEMPLATE.md`](docs/PERFORMANCE_REPORT_TEMPLATE.md) |

Déploiement, Maps, Firebase, OTA : **[`DEPLOIEMENT.md`](DEPLOIEMENT.md)**. Parcours démo (builds, canaux, synchro) : **[`docs/parcours-demo-firebase.md`](docs/parcours-demo-firebase.md)**. Visuel West Coast (Maps, HUD, photos) : **[`docs/visuel-west-coast-checklist.md`](docs/visuel-west-coast-checklist.md)**. Architecture runtime (New Arch, Hermes, FlashList, Skia) : **[`docs/ARCHITECTURE_RUNTIME.md`](docs/ARCHITECTURE_RUNTIME.md)**. Roadmap technique : **[`docs/ROADMAP_TECHNIQUE.md`](docs/ROADMAP_TECHNIQUE.md)**. Vue utilisateur : **[`README.md`](README.md)**.

## Cursor / assistant

- Règles projet : [`.cursor/rules/husko-product-direction.mdc`](.cursor/rules/husko-product-direction.mdc), [`.cursor/rules/husko-responsive-ui.mdc`](.cursor/rules/husko-responsive-ui.mdc).
- **Phrase d’orientation utile dans le chat :** Husko = fil unique décrit dans `productDirection.ts` ; UI = tokens West Coast ; fin de tâche = `npm run verify` et pas de régression majeure sur l’écran prioritaire ; rester dans le périmètre demandé (pas de refactor hors sujet).
