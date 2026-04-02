# Husko By Night

Application **Expo** : commande (menu, panier, suivi), **livreur** (carte + position), **gérant** (commandes, historique, réglages). Thème sombre rouge / or, interface lisible et boutons larges (confort tactile).

**Démarrage :** `npm install` → `npx expo start`

**Builds installables (APK Android, IPA iOS, web, Cloud Run) :** **`DEPLOIEMENT.md`**

**Télécharger le dernier APK client déjà buildé sur EAS (sans l’UI web) :** `eas login` puis **`npm run apk:get:client`** → fichier **`dist/Husko-Client-latest.apk`** (idem gérant / hub : `apk:get:gerant`, `apk:get:unified` ; ou `apk:download:*`). Nécessite un build **Finished** pour le profil concerné.

**Gate avant release :** `npm run release:gate` (4 étapes locales). **Prêt pour EAS (gate + dépôt strict + prebuild) :** `npm run release:ready`. **Suite cloud (checklist + `eas whoami`) :** `npm run release:next`.

**Réparation / diagnostic (boucle, preuves, mode Agent) :** [`docs/reparation-autonomie.md`](docs/reparation-autonomie.md).

**Debug runtime sur téléphone / APK (Metro, LAN, tunnel, logcat) :** [`docs/debug-mobile.md`](docs/debug-mobile.md).

**Vérifier une APK unifiée (variante `all`, canal `hub`, build natif) :** [`docs/verification-apk-unified.md`](docs/verification-apk-unified.md).

**Briefing client (notifications locales vs Firestore, synchro client–gérant) :** [`docs/briefing-rdv-client-notifications.md`](docs/briefing-rdv-client-notifications.md).

**CI GitHub :** `release:gate` sur chaque push/PR (voir [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
