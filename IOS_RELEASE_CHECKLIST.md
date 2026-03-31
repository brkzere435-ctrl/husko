# Checklist release Husko — iOS

À utiliser **après** la validation Android / Maps si tu cibles l’App Store ou des builds internes iOS. Détail général : [DEPLOIEMENT.md](DEPLOIEMENT.md). Checklist Android + partagée : [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## 1. Prérequis

- Compte **Apple Developer** (programme payant pour distribution App Store / TestFlight).
- Compte [expo.dev](https://expo.dev), projet EAS lié au dépôt (`eas login`, `eas.json`).
- Certificats et profils de provisioning gérés par EAS lors du premier build iOS (suivre les invites `eas build` si besoin).

## 2. Identifiants de bundle (iOS)

Chaque variante d’app a un **`iosBundle`** dans [`app.config.js`](app.config.js) :

| Variante | Bundle identifier |
|----------|-------------------|
| Hub / unifié (`all`) | `com.husko.bynight` |
| Client | `com.husko.bynight.client` |
| Gérant | `com.husko.bynight.gerant` |
| Livreur | `com.husko.bynight.livreur` |
| Copilote | `com.husko.copilot` |

Pour **Google Maps** : dans Google Cloud Console, restreindre la clé **iOS** (Maps SDK for iOS) par **identifiant de bundle** — ajouter chaque bundle correspondant aux builds que tu publies.

## 3. Variables d’environnement

- `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` dans le `.env` (voir [env.example](env.example)).
- Aligner **EAS** : `npm run eas:sync:maps` (pousse Android **et** iOS depuis le `.env`, voir [scripts/eas-sync-maps-env.mjs](scripts/eas-sync-maps-env.mjs)).

## 4. Builds iOS (EAS)

Profils définis dans [`eas.json`](eas.json). Commandes utiles dans [`package.json`](package.json) :

| Commande | Profil EAS | Usage typique |
|----------|------------|----------------|
| `npm run build:ios` | `ios-internal` | Build simulateur (développement) |
| `npm run build:ios:client` | `ios-client` | Appareil réel, variante client |
| `npm run build:ios:gerant` | `ios-gerant` | Variante gérant |
| `npm run build:ios:livreur` | `ios-livreur` | Variante livreur (carte) |
| `npm run build:ios:assistant` | `ios-assistant` | Copilote |

Exemple manuel : `eas build -p ios --profile ios-client --non-interactive` (si tu préfères la CLI directe).

## 5. Après changement de clé ou restriction Maps (iOS)

1. **Rebuild** iOS : une **OTA** (`eas update`) ne suffit pas pour injecter une nouvelle clé native Maps.
2. Installer le build sur **simulateur** ou **appareil** et ouvrir un écran avec carte (livreur, suivi).
3. Confirmer que `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` est bien sur EAS : `npm run eas:sync:maps` après mise à jour du `.env`.

**Carte vide ou tuiles manquantes ?**

- Vérifier que le **bundle** de l’app installée est **autorisé** pour la clé iOS dans Google Cloud.
- Vérifier que **Maps SDK for iOS** est activé et la **facturation** du projet GCP est active.

## 6. Distribution

- **TestFlight** : build signé distribution → upload via EAS / App Store Connect (voir flux Expo « Submit to App Store » si configuré).
- **Installation interne** : builds ad hoc / enterprise selon ton compte Apple (hors scope détaillé ici ; voir [DEPLOIEMENT.md](DEPLOIEMENT.md) et documentation Expo).

**Synthèse** : bundles + clé Maps iOS + sync EAS + `eas build -p ios` puis test sur un écran carte.
