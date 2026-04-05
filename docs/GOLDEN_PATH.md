# Voie « pro » — une seule chaîne (Android + iOS)

Tu ne repars **pas** d’un dépôt vide : tu repars d’un **processus** qui évite d’envoyer une APK **sans Firebase** (pastille **Local** = injouable multi-téléphones).

## Idée

- **Ton collègue n’a rien à configurer** : il installe l’APK / l’app iOS que **tu** lui donnes.
- **Toi**, avant de distribuer, tu enchaînes : **clés complètes** → **sync EAS** → **build** → test **Firestore**.

## Commandes (à lancer sur ta machine, dépôt Husko)

1. Remplir `.env` depuis `env.example` (toutes les `EXPO_PUBLIC_FIREBASE_*` + Maps si tu veux les tuiles).
2. **`npm run ship:prepare`**  
   - Vérifie le `.env` (strict) **et** pousse Firebase + Maps vers **EAS** (`eas:sync:secrets`).  
   - Échec ici = **pas la peine** de builder : tu corriges le `.env` ou la session `eas login`.
3. **`npm run firebase:deploy:rules`** (si pas déjà fait sur ce projet Firebase).
4. Choisir **un** livrable :
   - **Hub un APK** (menu + client + gérant + livreur) :  
     `npm run ship:apk:unified`
   - **Trois APK séparés** :  
     `npm run ship:apk:three`  
     ou individuellement : `ship:apk:client` · `ship:apk:gerant` · `ship:apk:livreur`
   - **iOS** (TestFlight / install interne) :  
     `ship:ios:client` / `ship:ios:gerant` / `ship:ios:livreur` (selon profils dans `eas.json`).
   - **Google Play (AAB, hub `com.husko.bynight`)** :  
     `npm run ship:play:aab` → fichier **`.aab`** à uploader dans la **Play Console** (piste interne / production selon ton compte). Téléchargement : `npm run apk:download:play` (écrit `dist/Husko-ByNight-play-latest.aab`). Même Firebase / secrets que le hub : **`ship:prepare` avant le build**.

5. Télécharger les artefacts sur [expo.dev](https://expo.dev) → **Builds**, ou scripts `apk:download:*` / `apk:download:play` pour l’AAB.
6. **Preuve** : une commande test → document dans **Firestore** `orders/{id}`. Si absent, le problème est **avant** l’UI gérant.

## Réseau (Wi‑Fi / 4G / « autre réseau »)

Une fois Firebase **dans le binaire** et **règles déployées**, le réseau de l’utilisateur **n’a pas besoin** d’être le tien : Firestore est sur Internet. Les soucis « Paris / Angers » viennent d’habitude d’**APK différents** ou d’**un** téléphone en **Local**.

## iOS vs Android

- **Android** : fichier `.apk` / lien d’installation Expo.
- **iPhone** : pas d’APK — builds **`ship:ios:*`** + distribution Apple (voir `IOS_RELEASE_CHECKLIST.md`).

## Détail

- Déploiement long : [`DEPLOIEMENT.md`](../DEPLOIEMENT.md)
- Parcours démo : [`parcours-demo-firebase.md`](parcours-demo-firebase.md)
