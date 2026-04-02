# Husko — guide pour agents (humains & Cursor)

Ce fichier résume **où est la vérité** et **quelles commandes** utiliser. Le détail reste dans le README et les docs pointées.

## Direction produit et technique (fil unique)

- **Source de vérité :** [`src/constants/productDirection.ts`](src/constants/productDirection.ts) — `PRODUCT_DIRECTION`, `PRODUCT_DEFINITION_OF_DONE`, `PRODUCT_DELIVERABLE`.
- **Stack :** Expo Router + React Native (ce dépôt). UI : tokens **West Coast / Lowrider** dans `src/constants/theme.ts` et `src/constants/westCoastTheme.ts`.
- **Données multi-appareils :** Firestore (`EXPO_PUBLIC_FIREBASE_*`), `src/services/firebaseRemote.ts`, `firestore.rules`.
- **Critères « terminé » typiques :** `npm run verify` ; parcours démo sur **APK installé** ; pas de régression visuelle majeure sur l’écran prioritaire (voir le même fichier TS).

## Commandes courantes

| Action | Commande |
|--------|----------|
| Installer les deps | `npm install` |
| Lancer l’app (dev) | `npx expo start` (variantes : `npm run start:client` / `start:gerant` / `start:livreur` / `start:hub`) |
| Gate qualité (CI locale) | `npm run verify` puis éventuellement `npm run release:gate` |
| APK hub (EAS) | `npm run build:apk:unified` (après `eas login`, secrets — voir `DEPLOIEMENT.md`) |
| Checklist release | [`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) |
| Régénérer icônes / splash / adaptive (West Coast) | `npm run brand:assets` — écrit sous `assets/` ; **un nouveau `eas build` est obligatoire** pour mettre à jour le logo launcher (l’OTA ne change pas l’icône native). |
| Vérifier clés Firebase (.env) | `npm run firebase:env:check` — strict : `firebase:env:check:strict` |
| Pousser Firebase / Maps vers EAS | `npm run eas:sync:firebase` · `npm run eas:sync:maps` |

Déploiement, Maps, Firebase, OTA : **[`DEPLOIEMENT.md`](DEPLOIEMENT.md)**. Vue utilisateur : **[`README.md`](README.md)**.

## Cursor / assistant

- Règles projet : [`.cursor/rules/husko-product-direction.mdc`](.cursor/rules/husko-product-direction.mdc), [`.cursor/rules/husko-responsive-ui.mdc`](.cursor/rules/husko-responsive-ui.mdc).
- **Phrase d’orientation utile dans le chat :** Husko = fil unique décrit dans `productDirection.ts` ; UI = tokens West Coast ; fin de tâche = `npm run verify` et pas de régression majeure sur l’écran prioritaire ; rester dans le périmètre demandé (pas de refactor hors sujet).
