# Husko — Réparation & livraison APK (Phase 2)

Document interne : preuves, priorités, matrice QA, carnet P1. À enrichir à chaque correctif (date + lien build / commit).

## 1. Synthèse des preuves

- **EAS `53beb348`** — Phase `RUN_GRADLEW` : `:app:processReleaseResources` FAILED — `resource drawable/splashscreen_logo … not found` ; `failed linking references`.
- **Cause** — Splash sans `image` dans la config Expo : le prebuild Android référence encore `@drawable/splashscreen_logo` dans les thèmes.
- **Correctif** — [`app.config.js`](../app.config.js) : plugin `expo-splash-screen` + bloc `splash` avec `image: './assets/icon.png'`, `resizeMode: 'contain'`, `imageWidth` sur le plugin.
- **Build vert** — EAS `01e03808-…` (profil `apk-unified`) : statut **FINISHED**, artefact `.apk` (session mars 2026).
- **Install EAS** — Échec `npm ci` si `package-lock.json` désynchronisé (ex. `expo-localization` manquant) — build `765e50fd`, phase Install dependencies.
- **Gradle local Windows** — OOM / fichier de pagination insuffisant avec heap JVM trop élevé sur machine ~3 Go (`hs_err_pid*.log`) : **ne pas généraliser à EAS**.

**Inconclus** — `expo-doctor` code 1 sur certains builds EAS (détail des checks non archivé ici). Carte Maps / Firebase / assistant : à valider sur APK avec clés EAS réelles.

## 2. Cause racine par symptôme

| Symptôme | Cause (si confirmée) | Statut |
|----------|----------------------|--------|
| Build APK rouge après modif splash | Drawable `splashscreen_logo` manquant | Confirmé |
| EAS install deps | Lockfile hors sync | Confirmé |
| Build local Gradle crash | RAM / swap machine | Confirmé (local) |
| Carte sans tuiles | Clé Maps ou restrictions GCP | À tester |
| Pas de sync commandes | Firebase désactivé ou règles | À tester |
| Copilote HS | `assistantApiUrl` / réseau | À tester |

## 3. Priorisation

- **P0** — Build EAS Android + splash avec image native : **maintenir** la config actuelle ; ne pas retirer `splash.image` sans alternative documentée.
- **P1** — Bugs métier sur APK hub : **un ticket = une preuve** (capture, logcat, étapes).
- **P2** — `expo-doctor` / `eas-cli` en devDependency, assets 1024, `distribution.defaults.json`, QR.

## 4. Ordre logique des fonctionnalités (code)

1. **Natif / config** — `app.config.js`, `app.json` (versionCode), secrets EAS.
2. **Boot** — `app/_layout.tsx` : notifications, SystemUI, splash hide, OTA, abonnements Firebase si activé.
3. **Routage** — `VariantGate` → si `appVariant !== all`, redirection vers `/<role>`.
4. **Hub** — `app/index.tsx` : liens vers client, livreur, gérant, assistant.
5. **Rôles** — `app/client/*`, `app/livreur/*`, `app/gerant/*`, `app/assistant/*`.

## 5. Matrice de test manuelle (APK hub, `EXPO_PUBLIC_APP_VARIANT=all`)

Cocher après test sur build release. Colonne « OK / KO » + note brève si KO.

| # | Parcours | Écran / fichier | Critère |
|---|----------|-----------------|--------|
| 1 | Cold start | Splash → hub | Pas d’écran blanc prolongé ; hub visible |
| 2 | Hub | `app/index.tsx` | 4 boutons : Commander, Livreur, Gérant, Copilote |
| 3 | Client | `app/client/index.tsx` | Liste / navigation catalogue |
| 4 | Client panier | `app/client/panier.tsx` | Ajout / total cohérent |
| 5 | Client suivi | `app/client/suivi.tsx` | Carte ou fallback si pas de clé Maps |
| 6 | Livreur | `app/livreur/index.tsx` | Accès carte / statuts selon spec produit |
| 7 | Gérant | `app/gerant/index.tsx` | Commandes / actions clés |
| 8 | Gérant distribution | `app/gerant/distribution.tsx` | Liens APK si configurés |
| 9 | Assistant | `app/assistant/index.tsx`, `chat.tsx` | Chat si backend joignable |
| 10 | Réglages | `*/reglages.tsx` par rôle | Pas de crash au scroll |

## 6. Carnet P1 (à remplir)

| ID | Date | Variante | Écran | Attendu | Observé | Preuve (fichier / lien) | PR / commit |
|----|------|----------|-------|---------|---------|------------------------|-------------|
| P1-001 | | | | | | | |

## 7. Vérification automatique (CI locale)

```bash
npm run verify
npm run build:gate:native
npm run release:gate    # si .env / preflight OK
```

## 8. Amélioration continue

- Instrumentation boot : `emitBootDebugProbes` retiré de `app/_layout.tsx` ; `src/utils/debugProbe.ts` supprimé (prod sans ingest local).
- Secrets EAS : Maps, Firebase, `EXPO_PUBLIC_*` pour builds production.
- Mettre à jour [`distribution.defaults.json`](../distribution.defaults.json) après chaque vague d’APK ; `npm run qr:generate`.
- Ce document : ajouter une ligne « preuve » par P1 clos.

## 9. Références builds (à jour)

- Échec splash : `https://expo.dev/accounts/brkapk/projects/husko/builds/53beb348-1ae3-4239-b1a9-61b755a21de7`
- Succès post-fix (exemple) : `https://expo.dev/accounts/brkapk/projects/husko/builds/01e03808-41f6-4dba-9347-0573b1ed3fd3`
