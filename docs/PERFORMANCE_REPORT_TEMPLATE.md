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

## Méthode (à tenir identique entre mesures)

- **Menu client** : ouvrir l’écran menu, scroller du haut en bas en ~10 s, noter jank ressenti (0–5).
- **Cold start** : temps jusqu’à écran interactif (chronomètre ou `adb logcat` / Android Studio).
- **Mémoire** : Android Studio Profiler ou `adb shell dumpsys meminfo <package>` après 2 min d’usage.
- **Optionnel** : React DevTools (profiler) sur build dev, scénario fixe.

## Métriques

| Métrique | Avant | Après | Commentaire |
|----------|-------|-------|---------------|
| Cold start (s) | | | |
| Scroll menu (jank subjectif 0–5) | | | |
| RAM après usage (Mo) | | | |
| Taille APK (Mo) | | | |

## Hypothèses / changements testés

- (ex. `newArchEnabled: true`, optimisation FlashList, images, etc.)

## Conclusion

- Gains validés : oui / partiel / non
- Prochaines étapes : voir `docs/ROADMAP_TECHNIQUE.md`
