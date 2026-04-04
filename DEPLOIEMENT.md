# Déploiement Husko — Android, iOS, web, Cloud Run

Ordre : **prérequis** → **développement** → **builds mobiles** → **web / Docker** → **Cloud Run**.

Checklist release (commandes synthétiques) : [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). Checklist **iOS** (bundles, Maps, TestFlight) : [IOS_RELEASE_CHECKLIST.md](IOS_RELEASE_CHECKLIST.md). **Parcours démo** (hub vs APK mono-rôles, Firebase, OTA, iOS ≠ APK) : [docs/parcours-demo-firebase.md](docs/parcours-demo-firebase.md). **Visuel West Coast** (GTA / Maps / photos menu) : [docs/visuel-west-coast-checklist.md](docs/visuel-west-coast-checklist.md). **Briefing** (notifications / synchro client–gérant, limite push) : [docs/briefing-rdv-client-notifications.md](docs/briefing-rdv-client-notifications.md). **Direction produit** (fil unique, critères « terminé ») : [src/constants/productDirection.ts](src/constants/productDirection.ts).

### Chemin express — APK unifié hub (recommandé)

1. `npm install` · compte [expo.dev](https://expo.dev) · **`npm run eas:login`** (utilise `eas` du projet, même version que le lockfile)
2. Secrets EAS = mêmes clés que `.env` : `EXPO_PUBLIC_FIREBASE_*`, `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` (et iOS si besoin), optionnel `EXPO_PUBLIC_DISTRIBUTION_UNIFIED_APK_URL` après le 1er build.
3. `npm run validate:expo` puis **`npm run build:android`** (profil `apk-unified`, canal **hub**).
4. Sur [expo.dev](https://expo.dev) → **Builds** → télécharger l’**APK** ou en local : `npm run apk:download:last` puis `npm run apk:install:unified` (adb). Firebase pour la synchro multi-appareils : section **Liaison directe** ci‑dessous.

### Build de développement (development client) — notifications & modules natifs

**Expo Go** embarque un socle d’apps limité : des modules comme **`expo-notifications`** (canaux Android, comportement proche de la prod) peuvent **ne pas correspondre** à ton APK réel et provoquer des erreurs ou des permissions incomplètes. Pour le même JS que Metro mais avec **ton code natif** (icône notif, `POST_NOTIFICATIONS`, etc.), utilise un **development build** ([Expo dev client](https://docs.expo.dev/develop/development-builds/introduction/)).

1. Secrets EAS alignés avec `.env` (Firebase, Maps, etc.), comme pour un APK unifié.
2. **`npm run build:dev:android`** (profil `development` dans `eas.json` : `developmentClient: true`, variante **hub** `all`, canal **`development`**). Variante sans bloquer le terminal : **`npm run build:dev:android:queue`**.
3. Télécharger l’APK sur [expo.dev](https://expo.dev) → Builds → installer sur l’appareil (adb ou partage du fichier).
4. Lancer le bundler pour ce client : **`npm run start:dev`** ou **`npm run start:dev:hub`** (équivalent `expo start --dev-client`). Ouvrir le projet depuis l’app **Husko** installée (pas Expo Go).

Après changement de dépendances **natifs** (nouveau module, plugin), refaire un build `development` ou unifié.

### Chemin express — APK « Client » seul (téléphone du client)

1. Mêmes prérequis que ci‑dessus.
2. `npm run validate:expo` puis **`npm run apk:client`** (build cloud, profil `apk-client`).
3. Sur [expo.dev](https://expo.dev) → **Builds** → télécharger l’**APK** → envoyer au client (WhatsApp, Drive, lien direct). Pour la synchro commandes en direct : Firebase obligatoire (section ci‑dessous).

Toute la config Expo est dans **`app.config.js`** (y compris `extra.eas.projectId`).

### Version d’essai (un APK, téléchargement simple)

Objectif : **un seul APK** pour faire tester le menu / navigation **sans** builder les trois **APK mono-rôle** (gérant / client / livreur). Le profil **`preview`** ne fixe pas `EXPO_PUBLIC_APP_VARIANT` : l’app démarre sur le **hub** (liens Commander · Livreur · Gérant). Pour un livrable « prod » par défaut, préférer plutôt **`apk-unified`** (`npm run build:android`).

1. `npm run release:ready` (ou au minimum `release:doctor`) puis **`npm run build:apk:preview`** (build cloud Android, profil `preview` dans `eas.json`).
2. Quand le build est vert : [expo.dev](https://expo.dev) → **ton projet** → **Builds** → ouvrir le build → **Install** ou copier l’**URL de la page build** (elle s’ouvre sur le téléphone ; bouton d’installation Expo).
3. Partage ce lien par **WhatsApp, mail ou QR** (capture d’écran du QR sur la page Expo, ou `npm run qr:generate` après avoir mis l’URL dans `distribution.defaults.json` côté gérant).
4. Optionnel : dans `app.config.js`, change **`version`** (ex. `1.0.4`) pour distinguer l’essai sur l’écran « À propos » / réglages.

Pour un essai **d’une variante seule** (client, livreur, etc.), utilise plutôt `npm run build:apk:client` (ou `gerant` / `livreur` / `assistant`) comme d’habitude.

---

## 1. Prérequis

- **Node.js LTS** · `npm install` à la racine (le fichier `.npmrc` active `legacy-peer-deps` pour les paires Expo / React 19)
- **Expo Go** (SDK 55) ou **`npm run start:dev`** avec un **development build** installé : pour **notifications locales** / `expo-notifications` proches de la prod, préférer le **development build** (section *Build de développement* ci‑dessus), pas Expo Go.
- **Google Maps** (appareils réels) : définir `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` et `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` dans `.env` ou les **variables d’environnement EAS** (voir `env.example`). Sans clés valides, l’app affiche une **vue radar GTA** (sans tuiles satellite) ; avec clés valides, **tuiles Google** dans la mini-carte. Procédure détaillée : section **« Google Maps — obtenir et installer les clés »** ci‑dessous.
- **Contrôle avant build (ordre logique, sans sauter d’étape)** :
  1. **`npm run release:gate`** — `preflight` → `security:check` → `verify` → `release:check`.
  2. **`npm run release:doctor`** — `security:check:strict` (dépôt Git propre, obligatoire si `requireCommit` dans `eas.json`) → **`eas:prebuild`** (`release:check` + `validate:expo`, dernier garde-fou avant le cloud).
  - **Tout en une fois (1 + 2) :** **`npm run release:ready`** (= `release:gate` puis `release:doctor`).
  - **3. Phase cloud EAS (après `release:ready`, ordre fixe) :**
    1. `npm run eas:login` (ou `eas login`) si besoin
    2. `npm run eas:credentials` si keystore / certificats à vérifier
    3. `npm run eas:sync:maps` si les clés Maps du `.env` doivent être sur Expo
    4. `npm run eas:sync:firebase` si les `EXPO_PUBLIC_FIREBASE_*` du `.env` doivent être sur Expo (synchro client / gérant / livreur)
    5. `npm run build:apk:unified` (hub) ou autre profil (`build:matrix` pour la liste). **Depuis Cursor / IDE** qui coupe les commandes longues : `npm run build:apk:unified:queue` (`--no-wait`), puis suivre le build sur expo.dev ou `eas build:list`, et `npm run apk:download:unified` une fois terminé.
    6. Mettre à jour `distribution.defaults.json` puis `npm run qr:generate`
    7. Optionnel avant `eas build` : `npm run firebase:env:check:strict` (échoue si une clé Firebase manque dans `.env`)
    - **`npm run release:next`** affiche cette checklist et exécute `eas whoami` (échoue si pas connecté à Expo).
  - Raccourci partiel : `npm run verify:all` (= preflight + verify seulement). **`npm run husko:doctor`** — audit style + fonction + garde-fous techniques.

### Risques courants — réponses rapides

| Risque | Mitigation dans le projet |
|--------|---------------------------|
| Clé API ou `.env` commité par erreur | `.gitignore` inclut `.env` ; `npm run security:check` échoue si `.env` est suivi par Git. |
| `eas build` refusé ou **APK sans tes derniers fichiers** | EAS archive Git : le non commité part souvent pas. `npm run security:check:strict` ou `release:doctor` bloquent si l’arbre est sale ; urgence : `HUSKO_SKIP_DIRTY_GIT=1` (à éviter). |
| **`fatal: could not open '.git/COMMIT_EDITMSG'`** (Windows / OneDrive / IDE) | Le profil **`apk-unified`** n’utilise plus `autoIncrement` + commit auto : incrémente **`versionCode`** dans [`app.json`](app.json) (`expo.android.versionCode`) avant chaque nouveau build hub, puis commit. Évite le verrouillage de `.git` par le hook EAS. |
| Carte grise après « mise à jour » | Les clés Maps sont **natives** : un **`eas update` JS ne suffit pas** ; refaire un **build APK** après avoir mis les clés dans EAS. |
| Client / gérant / livreur pas synchronisés | Firebase incomplet → données locales seules ; suivre la section **Liaison directe entre appareils** ci‑dessous. |
| Perte du keystore Android | Sauvegarder ce qu’EAS ou `npm run android:keystore` génère ; sinon nouvelle signature = nouvelle app côté magasin. |
- Les dossiers `android/` et `ios/` ne sont pas versionnés : **EAS Build** régénère le natif sur les serveurs Expo.

### Liaison directe entre appareils (Firebase)

Sans configuration, les commandes restent **locales** (AsyncStorage). Pour que **client, gérant et livreur** (APK unifié hub et/ou APK par rôle) partagent les **mêmes commandes** et la **position livreur** en temps réel :

1. Créer un projet **[Firebase](https://console.firebase.google.com)** → activer **Firestore**.
2. Créer une app Web, récupérer les clés, et les mettre dans **`.env`** (`npm run setup:env` depuis `env.example`) ou dans les **secrets EAS** pour les builds.
3. Déployer les règles : `npm install`, `firebase login`, `firebase use --add` (choisir le projet), puis **`npm run firebase:deploy:rules`**. Fichiers source : **`firestore.rules`** (modèle ouvert pour tests ; à durcir en production). L’exemple **`firestore.rules.example`** reste une copie de référence.
4. Rebuild les APK : la synchro démarre dès que `EXPO_PUBLIC_FIREBASE_PROJECT_ID` et `EXPO_PUBLIC_FIREBASE_API_KEY` sont définis.

**Checklist — commandes visibles sur le téléphone gérant (APK client ≠ APK gérant)** :

- Mêmes `EXPO_PUBLIC_FIREBASE_*` injectées pour les profils EAS **client** et **gérant** (depuis un `.env` complet : `npm run eas:sync:firebase` avant les builds).
- `npm run firebase:env:check` sans erreur avant de lancer les builds concernés.
- Règles Firestore déployées (`npm run firebase:deploy:rules`) ; la collection `orders` doit être lisible/écritable selon ton modèle dans `firestore.rules`.
- Sur le téléphone **gérant** : ouvrir l’app connectée au réseau ; les commandes arrivent via le listener Firestore du root layout (`app/_layout.tsx`). Si la liste reste vide : vérifier que le **même** projet Firebase est bien embarqué dans les deux APK, puis diagnostiquer (`adb logcat`, messages d’erreur Firestore).

**`google-services.json` (Android, racine du dépôt)** — [app.config.js](app.config.js) branche ce fichier sur `android.googleServicesFile` s’il est présent. Pour que le JSON corresponde au **vrai** `applicationId` de chaque APK, enregistre dans Firebase **une app Android par package** (Paramètres du projet → Tes applications → Ajouter une application), puis remplace le fichier à la racine par celui fourni par Firebase (un même fichier peut contenir **plusieurs** blocs `client` si tu as ajouté toutes les apps au même projet).

Paquets Husko (`EXPO_PUBLIC_APP_VARIANT` / profil EAS) :

| Rôle / usage | `applicationId` Android |
|----------------|-------------------------|
| Hub unifié (`all`) | `com.husko.bynight` |
| Client | `com.husko.bynight.client` |
| Gérant | `com.husko.bynight.gerant` |
| Livreur | `com.husko.bynight.livreur` |
| Copilote | `com.husko.copilot` |

Si le fichier ne contient qu’un autre nom de paquet (ex. `com.husko.app`), les identifiants ne correspondent pas à l’APK Husko : ajoute les apps ci-dessus dans le projet Firebase et régénère le JSON. Vérification locale **sans afficher de clés** : `npm run google-services:check` (liste `project_id` + paquets ; `google-services:check:strict` pour un exit code non nul si un paquet Husko manque). La synchro **Firestore côté JS** repose surtout sur les `EXPO_PUBLIC_FIREBASE_*` ; `google-services.json` aligne surtout les attentes **natives** (p. ex. FCM / services Google liés au fichier).

Côté **app client**, le panier affiche un avertissement et désactive la validation tant que la liaison Firebase n’est pas active dans le build (évite d’envoyer une commande « locale seule » sans le dire).

Collections utilisées : `orders/{orderId}`, `meta/driver` (position du livreur).

### Google Maps — obtenir et installer les clés

> **À faire sur ton compte Google** (personne ne peut générer la clé à ta place). La facturation Google Cloud est en général **requise** pour Maps (crédit gratuit possible, voir [Google Maps Platform](https://developers.google.com/maps/documentation/android-sdk/overview)).

1. **[Google Cloud Console](https://console.cloud.google.com)** → créer ou choisir un **projet**.
2. **APIs et services** → **Bibliothèque** → activer au minimum :
   - **Maps SDK for Android** (obligatoire pour les APK Husko Android),
   - **Maps SDK for iOS** (si tu build iOS avec carte Google).
3. **APIs et services** → **Identifiants** → **Créer des identifiants** → **Clé API** :
   - **Android** : restreindre la clé au type *Applications Android* et ajouter les **noms de paquets** + empreinte SHA-1 du keystore de signature (EAS te donne le SHA-1 dans les credentials du build, ou utilise une clé **sans restriction** le temps des tests — moins sécurisé).
   - Paquets Husko : `com.husko.bynight` (APK unifié hub), `com.husko.bynight.client`, `com.husko.bynight.gerant`, `com.husko.bynight.livreur` (mono-rôle).
   - **iOS** : restreindre par identifiant de bundle `com.husko.bynight.client` (etc.) si tu sépares les clés.
4. Copier la **clé** (commence souvent par `AIza...`).

**Installation locale (Expo / dev)**

- Colle dans **`.env`** à la racine du repo :

```env
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=AIza...ta_cle_android
EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=AIza...ta_cle_ios
```

- Redémarre Metro (`npx expo start`). Vérifie : `npm run preflight` doit indiquer les clés Maps présentes.

**Builds cloud EAS (APK installés par les testeurs)**

Les variables `EXPO_PUBLIC_*` doivent être présentes **au moment du build** sur les serveurs Expo :

- [expo.dev](https://expo.dev) → **ton projet** → **Environment variables** (ou **Secrets** selon l’interface) → ajouter les **mêmes noms** que dans `.env` : `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY`, `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY`, valeur = ta clé, environnement **production** / **preview** selon ton profil `eas.json`.
- Ou en CLI (exemple, adapte à ta version d’`eas`) :

```bash
eas env:create --name EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY --value "AIza..." --environment production
```

- Puis **rebuild** l’APK : `npm run build:apk:client` (ou le profil voulu). Un simple `eas update` **ne suffit pas** pour changer une clé embarquée dans le natif : il faut un **nouveau build** si tu n’avais jamais injecté la clé.

---

## 2. Builds EAS (Android + iOS)

> **Ce qu’aucun outil ne peut faire à votre place** : ouvrir une session sur **votre** compte Expo / Google / Apple. Une fois connecté, tout le reste est automatisé par les scripts du repo.

### Checklist « première fois » (≈ 10 min)

1. Créer un compte sur [expo.dev](https://expo.dev) (gratuit possible pour builds limités).
2. Dans le dossier du projet : `npm install` (installe **`eas-cli`** en devDependency : commande locale `eas`, pas un CLI global aléatoire).
3. `eas login` — email / mot de passe **Expo** (pas le PIN gérant de l’app Husko).
4. `npm run eas:init` — lie le dossier au projet Expo. Avec un dépôt **Git** et **`requireCommit: true`** dans `eas.json`, les builds Windows sont stables (archive via `git`). L’ID projet par défaut est dans **`app.config.js`** (`DEFAULT_EAS_PROJECT_ID`) ; surcharge possible via `.env` / secret **`EXPO_PUBLIC_EAS_PROJECT_ID`** pour les builds cloud.
5. Sur [expo.dev](https://expo.dev) → votre projet → **Secrets** : ajouter les mêmes variables que dans `env.example` (`EXPO_PUBLIC_FIREBASE_*`, `EXPO_PUBLIC_GOOGLE_MAPS_*`, etc.) pour que les **builds cloud** embarquent Firebase et Maps.
6. Lancer les builds :
   - l’APK unique (hub) : `npm run build:apk:unified`
   - les 5 APK d’affilée : `npm run build:apk:all` (ou `npm run build:apk:mono` pour 3 mono-rôles)
   - ou une seule app : `npm run build:apk:client` (utilise `eas` du projet)

Les APK se téléchargent depuis la page du build sur Expo.

### Sécurité gérant / livreur (dans l’app)

- **Code par défaut à l’installation** : `4242` (gérant et livreur).
- À la **première connexion réussie**, l’app impose un **nouveau code** (4–8 chiffres, différent de `4242`).
- Les mises à jour depuis une ancienne version : pas de reblocage si le gérant avait déjà changé son code ; le livreur est considéré comme déjà configuré pour ne pas bloquer les installs existantes.

### Android — APK (installation directe)

```bash
npm run build:android
# Depuis Windows : si erreur « Prepare project » / tar, utiliser le workflow GitHub Actions « EAS APK Client » (Linux) avec EXPO_TOKEN.
```

Télécharger l’**APK** depuis le lien Expo (test interne / hors Play Store).
Transfert USB (adb) :

```bash
npm run apk:download:last
npm run apk:install:device -- unified
```

### Android — APK mono-rôle (gérant / client / livreur)

En complément de l’**APK unifié** (`apk-unified`), chaque profil mono-rôle définit `EXPO_PUBLIC_APP_VARIANT` et un `applicationId` distinct (`com.husko.bynight.gerant`, etc.) :

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
| Carte mobile grise | Clés Maps dans `.env` / secrets EAS (voir `app.config.js`) |
| Build iOS | Certificats / équipe Apple dans EAS (`eas credentials`) |
