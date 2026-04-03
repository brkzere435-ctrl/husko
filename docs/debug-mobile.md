# Debug runtime sur mobile (Husko / Expo)

## Pourquoi `localhost` depuis l’APK ne rejoint pas ton PC

Sur un **téléphone**, `127.0.0.1` désigne **l’appareil lui-même**, pas la machine qui lance Metro. Une requête HTTP vers `http://127.0.0.1:…` vers un serveur sur le poste de dev **ne sort pas** vers le PC. Ce n’est pas un bug Husko : c’est le loopback.

**Exception** : émulateur Android sur la même machine (souvent `10.0.2.2` pour joindre le host).

**Production** : l’app utilise **Firebase (Firestore)** et les clés `EXPO_PUBLIC_FIREBASE_*` injectées au build — pas de dépendance à un serveur local pour les commandes ou la synchro cloud.

## Complétude — éviter de passer à côté d’une erreur

| Source | Ce qu’elle attrape |
|--------|---------------------|
| **Terminal Metro** | Échecs de bundle, erreurs React/JS au chargement. |
| **Console F12 (web)** | Erreurs runtime du bundle web. |
| **`npm run verify`** | Régression TypeScript / lint / règles projet. |
| **`adb logcat`** | Crashs natifs ou logs sur **APK** sans Metro (voir ci-dessous). |

### Ne pas confondre

[`src/utils/debugProbe.ts`](../src/utils/debugProbe.ts) : sondes boot optionnelles (port **7781** / `EXPO_PUBLIC_DEBUG_INGEST_URL`), désactivées sauf flag explicite — distinct de tout outil d’éditeur.

## Pistes pratiques

### 1. `console.log` + Metro (développement)

- `npm run start:client` (ou `start:gerant`, `start:hub`, etc.) — voir `package.json`.
- Les logs JS apparaissent dans le **terminal Metro**.

**Limite** : ne s’applique pas à un **APK EAS** utilisé sans bundler.

### 2. Réseau : LAN ou tunnel

- `npm run start:lan` — même Wi‑Fi que le téléphone.
- `npm run start:tunnel` — si le LAN est bloqué.

Objectif : charger le JS depuis le PC **sans** pointer `localhost` depuis l’appareil.

### 3. Logs natifs Android (APK sans Metro)

- `adb logcat` ou Android Studio **Logcat**.

### 4. Logger distant (production)

Sentry ou endpoint HTTPS dédié — hors scope du debug local.

## Synthèse

| Contexte | Approche |
|----------|----------|
| Dev avec Metro | `console.log` → terminal Metro ; `start:lan` / `start:tunnel` |
| APK EAS sans Metro | `adb logcat` ; captures d’écran |
| Données commandes / multi-appareils | Firestore (`EXPO_PUBLIC_FIREBASE_*`), voir `DEPLOIEMENT.md` |

## Signaler un bug UI

Capture (ou courte vidéo) avec l’écran et le chemin de navigation.
