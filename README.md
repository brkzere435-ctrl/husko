# Husko By Night

Application **Expo** : commande (menu, panier, suivi), **livreur** (carte + position), **gérant** (commandes, historique, réglages). Thème sombre rouge / or, interface lisible et boutons larges (confort tactile).

**Démarrage :** `npm install` → `npx expo start`

**Builds installables (APK Android, IPA iOS, web, Cloud Run) :** **`DEPLOIEMENT.md`**

**Gate avant release :** `npm run release:gate` (4 étapes locales). **Prêt pour EAS (gate + dépôt strict + prebuild) :** `npm run release:ready`. **Suite cloud (checklist + `eas whoami`) :** `npm run release:next`.

**Réparation / diagnostic (boucle, preuves, mode Agent) :** [`docs/reparation-autonomie.md`](docs/reparation-autonomie.md).

**CI GitHub :** `release:gate` sur chaque push/PR (voir [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
