# Déploiement Husko — Android, iOS, web, Cloud Run

Ordre : **prérequis** → **développement** → **builds mobiles** → **web / Docker** → **Cloud Run**.

---

## 1. Prérequis

- **Node.js LTS** · `npm install` à la racine (le fichier `.npmrc` active `legacy-peer-deps` pour les paires Expo / React 19)
- **Expo Go** aligné sur **SDK 55** (mettre à jour l’app Expo Go sur le téléphone) ou émulateurs : `npx expo start`
- **Google Maps** (appareils réels) : définir `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` et `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` dans `.env` ou les **secrets EAS** (voir `env.example`). Sans clés valides, carte grise possible.
- **Contrôle avant build** : `npm run verify:all` (prévol `.env` + TypeScript + ESLint) ou `npm run verify` seul. **`npm run preflight`** affiche l’état Firebase / Maps / distribution sans modifier les fichiers.
- Les dossiers `android/` et `ios/` ne sont pas versionnés : **EAS Build** régénère le natif sur les serveurs Expo.

### Liaison directe entre appareils (Firebase)

Sans configuration, les commandes restent **locales** (AsyncStorage). Pour que **client, gérant et livreur** (trois APK) partagent les **mêmes commandes** et la **position livreur** en temps réel :

1. Créer un projet **[Firebase](https://console.firebase.google.com)** → activer **Firestore**.
2. Créer une app Web, récupérer les clés, et les mettre dans **`.env`** (`npm run setup:env` depuis `env.example`) ou dans les **secrets EAS** pour les builds.
3. Déployer les règles : `npm install`, `firebase login`, `firebase use --add` (choisir le projet), puis **`npm run firebase:deploy:rules`**. Fichiers source : **`firestore.rules`** (modèle ouvert pour tests ; à durcir en production). L’exemple **`firestore.rules.example`** reste une copie de référence.
4. Rebuild les APK : la synchro démarre dès que `EXPO_PUBLIC_FIREBASE_PROJECT_ID` et `EXPO_PUBLIC_FIREBASE_API_KEY` sont définis.

Collections utilisées : `orders/{orderId}`, `meta/driver` (position du livreur).

---

## 2. Builds EAS (Android + iOS)

> **Ce qu’aucun outil ne peut faire à votre place** : ouvrir une session sur **votre** compte Expo / Google / Apple. Une fois connecté, tout le reste est automatisé par les scripts du repo.

### Checklist « première fois » (≈ 10 min)

1. Créer un compte sur [expo.dev](https://expo.dev) (gratuit possible pour builds limités).
2. Dans le dossier du projet : `npm install` puis `npm install -g eas-cli` (ou utiliser `npx eas` sans install global).
3. `eas login` — email / mot de passe **Expo** (pas le PIN gérant de l’app Husko).
4. `npm run eas:init` — lie le dossier au projet Expo (sans Git : `EAS_NO_VCS=1` est déjà injecté). Ensuite, mettre l’**ID du projet** dans `.env` : `EXPO_PUBLIC_EAS_PROJECT_ID=<uuid>` (visible sur [expo.dev](https://expo.dev) → Projet → ID) pour que `app.config.ts` expose `extra.eas.projectId` aux builds non interactifs. **Builds cloud :** ajouter le même nom `EXPO_PUBLIC_EAS_PROJECT_ID` dans les **Secrets** Expo (le `.env` local n’est pas envoyé sur EAS).
5. Sur [expo.dev](https://expo.dev) → votre projet → **Secrets** : ajouter les mêmes variables que dans `env.example` (`EXPO_PUBLIC_FIREBASE_*`, `EXPO_PUBLIC_GOOGLE_MAPS_*`, etc.) pour que les **builds cloud** embarquent Firebase et Maps.
6. Lancer les builds :
   - les trois APK d’affilée : `npm run build:apk:all`
   - ou une seule app : `npm run build:apk:client` (équivalent `eas build` avec `EAS_NO_VCS=1`)

Les APK se téléchargent depuis la page du build sur Expo.

### Sécurité gérant / livreur (dans l’app)

- **Code par défaut à l’installation** : `4242` (gérant et livreur).
- À la **première connexion réussie**, l’app impose un **nouveau code** (4–8 chiffres, différent de `4242`).
- Les mises à jour depuis une ancienne version : pas de reblocage si le gérant avait déjà changé son code ; le livreur est considéré comme déjà configuré pour ne pas bloquer les installs existantes.

### Android — APK (installation directe)

```bash
npm run build:android
# ou (sans Git sur Windows, préférer les scripts npm qui passent EAS_NO_VCS=1)
```

Télécharger l’**APK** depuis le lien Expo (test interne / hors Play Store).

### Android — trois APK (gérant / client / livreur)

Chaque profil définit `EXPO_PUBLIC_APP_VARIANT` et un `applicationId` distinct (`com.husko.bynight.gerant`, etc.) :

```bash
npm run build:apk:gerant
npm run build:apk:client
npm run build:apk:livreur
```

Les liens de distribution / QR utilisent `distribution.defaults.json` ou les variables `EXPO_PUBLIC_DISTRIBUTION_*` au moment du build (à aligner avec les URLs des artefacts EAS).

### iOS — IPA (installation test / TestFlight)

Compte **Apple Developer** requis pour un build appareil. Puis :

```bash
npm run build:ios
# ou
eas build -p ios --profile ios-internal
```

**Note :** iOS ne produit pas d’APK ; le livrable est une **IPA** (test interne ou soumission App Store selon configuration EAS).

### Les deux plateformes en une commande

```bash
npm run build:mobile
# eas build --profile mobile --platform all
```

### Store (Play / App Store)

- Android : `eas build -p android --profile production` → **AAB**
- iOS : `eas build -p ios --profile production`

### Icônes

Remplacer `assets/icon.png` et `assets/adaptive-icon.png` par des visuels **1024×1024** avant publication.

---

## 3. Web statique + Docker

```bash
npm run export:web
npm run docker:build
docker run --rm -p 8080:8080 -e PORT=8080 husko-web
```

→ http://localhost:8080  

Sur navigateur, pas de Google Maps natif (variantes `.web`). Carte complète sur **Android / iOS**.

---

## 4. Google Cloud Run

`gcloud auth login`, projet configuré, puis :

- Bash : `./scripts/deploy-cloud-run.sh` (voir script pour `GCP_PROJECT`)
- PowerShell : `.\scripts\deploy-cloud-run.ps1 -GcpProject VOTRE_ID`

---

## 5. Règles métier

- Livraison **lun–sam 20h–00h**
- **Espèces au livreur uniquement** (pas de CB dans l’app)
- PIN gérant par défaut : **4242**

---

## 6. Dépannage

| Problème | Piste |
|----------|--------|
| QR code non détecté / illisible | Préférer `npm run start:tunnel` (réseau quelconque) ou saisir l’URL `exp://…` à la main dans Expo Go ; vérifier PC + téléphone sur le même Wi‑Fi si vous restez en LAN ; pare-feu Windows : autoriser le port **8081** pour Node |
| `export:web` échoue | Node ≥ 18, `npm install` |
| Carte mobile grise | Clés Maps dans `app.json` |
| Build iOS | Certificats / équipe Apple dans EAS (`eas credentials`) |
