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
| **Sauvegarde Git locale (checkpoint)** | `npm run checkpoint -- "fix(scope): description"` ; sans message : `npm run checkpoint` — voir [`.cursor/rules/husko-git-checkpoints.mdc`](.cursor/rules/husko-git-checkpoints.mdc) |
| **Livrer une APK Android gérant (chemin par défaut)** | `npm run ship:gerant` (clean cache local + gate + sync secrets + build EAS `apk-gerant` avec `--clear-cache`) |
| **Livrer une APK Android gérant (sans bloquer le terminal)** | `npm run ship:gerant:queue` puis suivi via `npx eas build:list --platform android --limit 5 --non-interactive` |
| **Livrer une APK / iOS « pro »** (hors fil gérant par défaut) | [`docs/GOLDEN_PATH.md`](docs/GOLDEN_PATH.md) — ex. `npm run ship:apk:unified` ou `ship:apk:three` |
| **Google Play — AAB** (hub, même variante `all`) | `npm run ship:play:aab` → `npm run apk:download:play` — voir [`DEPLOIEMENT.md`](DEPLOIEMENT.md) (fiche Play, politique de confidentialité) |
| Lancer l’app (dev) | `npm start` (hub / `all` par défaut — écran « Choisir un espace ») ; rôle seul : `npm run start:gerant` / `start:client` / `start:livreur` / `start:assistant` |
| Vérifier `extra.appVariant` (app.config, sans appareil) | `npm run print:app-variant` — doit afficher `all` si `EXPO_PUBLIC_APP_VARIANT` est absent ; voir aussi `env.example` |
| **ADB** : packages Husko installés (téléphone connecté) | `npm run adb:husko` — liste `com.husko.bynight` (hub) vs `…gerant` / `…client` / `…livreur` ; URL hub dans `distribution.defaults.json` |
| Gate qualité (CI locale) | `npm run verify` puis éventuellement `npm run release:gate` |
| Gate + **photos menu distinctes** (pas de placeholders dupliqués) | `npm run release:gate:pro` — échoue si les PNG `assets/menu/` sont encore majoritairement identiques en taille ; sinon `verify:menu-visual-pro` / `verify:menu-visual-pro:strict` |
| Après changement d’images menu (flyer / stock) | `npm run assets:menu:verify` — présence des fichiers + diversité des tailles (pas un seul PNG dupliqué 27×) |
| Télécharger l’APK buildée en dernier (par défaut gérant) | `npm run apk:download:last` |
| **Hub** : télécharger l’APK unifié puis installer sur appareil (ADB) | `npm run apk:download:unified` puis `npm run apk:install:unified` — voir [`tools/README.txt`](tools/README.txt) |
| APK hub (EAS), attente jusqu’à la fin | `npm run build:apk:unified` (**uniquement si besoin explicite hors fil gérant**) |
| APK hub (EAS), **sans bloquer** le terminal / l’IDE (Cursor) | `npm run build:apk:unified:queue` — même build avec `--no-wait` ; suivi comme ci-dessus |
| **Development build** Android (profil `development-husko`, même base que `apk-unified`) | `npm run build:dev:android` → `npm run apk:download:dev` → `npm run start:dev` — voir [`DEPLOIEMENT.md`](DEPLOIEMENT.md) |
| Checklist release | [`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) |
| Régénérer icônes / splash / adaptive (West Coast) | `npm run brand:assets` — écrit sous `assets/` ; **un nouveau `eas build` est obligatoire** pour mettre à jour le logo launcher (l’OTA ne change pas l’icône native). |
| Vérifier clés Firebase (.env) | `npm run firebase:env:check` — strict : `firebase:env:check:strict` |
| Pousser Firebase / Maps vers EAS | `npm run eas:sync:firebase` · `npm run eas:sync:maps` |
| Perf : lister écrans avec listes | `npm run perf:list-screens` |
| Perf : modèle de rapport (matrice appareils) | [`docs/PERFORMANCE_REPORT_TEMPLATE.md`](docs/PERFORMANCE_REPORT_TEMPLATE.md) |

Déploiement, Maps, Firebase, OTA : **[`DEPLOIEMENT.md`](DEPLOIEMENT.md)**. Parcours démo (builds, canaux, synchro) : **[`docs/parcours-demo-firebase.md`](docs/parcours-demo-firebase.md)**. Visuel West Coast (Maps, HUD, photos) : **[`docs/visuel-west-coast-checklist.md`](docs/visuel-west-coast-checklist.md)**. Briefs UI/photos menu : **[`docs/design-handoff-ui-ux.md`](docs/design-handoff-ui-ux.md)** · **[`docs/client-menu-assets.md`](docs/client-menu-assets.md)** (`menuImages.ts` = liste technique). Brief notifications client/gérant : **[`docs/briefing-rdv-client-notifications.md`](docs/briefing-rdv-client-notifications.md)**. Architecture runtime (New Arch, Hermes, FlashList, Skia) : **[`docs/ARCHITECTURE_RUNTIME.md`](docs/ARCHITECTURE_RUNTIME.md)**. Roadmap technique : **[`docs/ROADMAP_TECHNIQUE.md`](docs/ROADMAP_TECHNIQUE.md)**. Vue utilisateur : **[`README.md`](README.md)**.

## Cursor / assistant

- Règles projet : [`.cursor/rules/husko-product-direction.mdc`](.cursor/rules/husko-product-direction.mdc), [`.cursor/rules/husko-responsive-ui.mdc`](.cursor/rules/husko-responsive-ui.mdc), [`.cursor/rules/husko-git-checkpoints.mdc`](.cursor/rules/husko-git-checkpoints.mdc) (commits locaux après progression utile).
- **Builds EAS / APK :** ne pas lancer `eas build`, scripts `build:apk:*`, `build:dev:android*`, ni téléchargements d’artefacts distants **sans permission explicite** du propriétaire du dépôt (crédits et temps de build).
- **Pas de build de distribution tant que ce n’est pas prêt :** base validée (`npm run verify`), pas de défaut bloquant UI / carte GPS / synchro ; anciennes versions côté testeurs corrigées (désinstallation + nouvel install) — voir `PRODUCT_DIRECTION.clientReadinessBeforeBuild` dans `productDirection.ts`.
- **Phrase d’orientation utile dans le chat :** Husko = fil unique décrit dans `productDirection.ts` ; UI = tokens West Coast ; fin de tâche = `npm run verify` et pas de régression majeure sur l’écran prioritaire ; rester dans le périmètre demandé (pas de refactor hors sujet).
