# Rapport de performance Husko (modèle)

Ce document sert de **grille** pour mesurer les gains après changements (New Architecture, listes, images, etc.). Remplir une ligne **avant** et **après** une release ou une branche de perf.

## Contexte

| Champ | Valeur |
|--------|--------|
| Date | |
| APK / build EAS | (ID expo.dev) |
| `versionCode` Android | |
| Appareil | (modèle, Android version) |
| Variante | hub / client / gérant / livreur |

## Installation APK et contrôle build (avant les mesures)

1. **Télécharger** la dernière APK unifiée : `npm run apk:download:unified` → fichier `dist/Husko-ByNight-unified-latest.apk` (nécessite `eas login` ou `EXPO_TOKEN`).
2. **Installer** sur l’appareil (USB, débogage activé) : `npm run apk:install:unified`. Sans appareil listé par `adb devices`, l’étape est à refaire une fois le téléphone branché.
3. **Contrôle « bon build »** dans l’app : **Réglages** → section mise à jour OTA — variante **`all`**, canal **`hub`**, **Build natif (APK)** aligné sur le `versionCode` attendu pour le build installé (référence [`app.json`](../app.json) au commit du build EAS). Procédure détaillée : [`docs/verification-apk-unified.md`](verification-apk-unified.md).
4. Ensuite seulement : scénarios et tableau **Métriques** ci‑dessous (même durée / même gestuelle entre « avant » et « après »).

## Méthode (à tenir identique entre mesures)

- **Menu client** : ouvrir l’écran menu, scroller du haut en bas en ~10 s, noter jank ressenti (0–5).
- **Historique gérant** (`/gerant/historique`, liste FlashList) : scroller la liste des commandes terminées en ~10 s, noter jank (0–5), idem avant/après une optimisation liste.
- **Cold start** : temps jusqu’à écran interactif (chronomètre ou `adb logcat` / Android Studio).
- **Mémoire** : Android Studio Profiler ou `adb shell dumpsys meminfo <package_android>` après 2 min d’usage (le package dépend de l’APK ; l’APK hub unifié suit la config Expo du build, ex. `com.husko.bynight` — vérifier dans **Paramètres Android → Appli** ou `adb shell pm list packages | findstr husko` sous Windows).
- **Optionnel** : React DevTools (profiler) sur build dev, scénario fixe.

## Métriques

| Métrique | Avant | Après | Commentaire |
|----------|-------|-------|---------------|
| Cold start (s) | | | |
| Scroll menu (jank subjectif 0–5) | | | |
| Scroll historique gérant (jank 0–5) | | | |
| RAM après usage (Mo) | | | |
| Taille APK (Mo) | | | |

## Hypothèses / changements testés

- (ex. `newArchEnabled: true`, optimisation FlashList, images, etc.)

## Conclusion

- Gains validés : oui / partiel / non
- Prochaines étapes : voir `docs/ROADMAP_TECHNIQUE.md`
