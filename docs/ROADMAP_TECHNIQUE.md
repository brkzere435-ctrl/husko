# Bilan mission perf / UX technique et roadmap

## Réalisé (extraits)

1. **New Architecture** : `newArchEnabled: true` dans `app.config.js` — rebuild natif requis pour prise en compte.
2. **Hermes** : documenté comme moteur par défaut ; pas d’option expérimentale `useHermesV1` activée (nécessiterait build RN from source).
3. **Réseau** : NetInfo + bannière hors ligne ; retries sur push commande Firestore ; UX panier « Envoi en cours » / dialogue échec synchro.
4. **Feedback erreurs** : écran `/feedback/technical` + `openTechnicalFeedback` + lien depuis `ErrorBoundary`.
5. **Profiler les écrans** : script `npm run perf:list-screens` (liste fichiers avec FlashList / FlatList / ScrollView) ; grille `docs/PERFORMANCE_REPORT_TEMPLATE.md`.
6. **Documentation** : ce fichier, `ARCHITECTURE_RUNTIME.md`, modèle de rapport perf.

## Ce qui reste (recommandé)

| Priorité | Sujet | Notes |
|----------|--------|--------|
| P1 | Remplir un **PERFORMANCE_REPORT** avant/après sur APK réel | Cold start + scroll menu |
| P2 | Migrer d’autres **FlatList** vers **FlashList** si listes longues | Ex. `app/gerant/historique.tsx` |
| P3 | **Skia** uniquement si besoin produit (HUD, courbes) | Éviter dépendance sans usage |
| P4 | Étendre `openTechnicalFeedback` aux erreurs **catch** métier réseau | Centraliser messages |
| P5 | Tests automatisés perf | Detox / maestro — hors scope immédiat |

## Critère « terminé » produit

Voir `PRODUCT_DEFINITION_OF_DONE` dans `src/constants/productDirection.ts` : `npm run verify`, parcours démo sur **APK installé**.
