# Bilan mission perf / UX technique et roadmap

## Réalisé (extraits)

1. **New Architecture** : `newArchEnabled: true` dans `app.config.js` — rebuild natif requis pour prise en compte.
2. **Hermes** : documenté comme moteur par défaut ; pas d’option expérimentale `useHermesV1` activée (nécessiterait build RN from source).
3. **Réseau** : NetInfo + bannière hors ligne ; retries sur push commande Firestore ; UX panier « Envoi en cours » / dialogue échec synchro.
4. **Feedback erreurs** : écran `/feedback/technical` + `openTechnicalFeedback` + lien depuis `ErrorBoundary`.
5. **Profiler les écrans** : script `npm run perf:list-screens` (liste fichiers avec FlashList / FlatList / ScrollView) ; grille `docs/PERFORMANCE_REPORT_TEMPLATE.md` (dont principe **matrice multi-appareils** et synthèse agrégée).
6. **Historique gérant** : `FlashList` à la place de `FlatList` (`app/gerant/historique.tsx`).
7. **Historique client** : `ScrollView` + `map` remplacés par `FlashList` (`app/client/historique.tsx`).
8. **Pastille synchro** : appui long sur erreur → `openTechnicalFeedback` (`SyncStatusPill`).
9. **Livreur** : dialogue « Action impossible » + **Détail technique** (`LivreurOrderPanel`).
10. **Documentation** : ce fichier, `ARCHITECTURE_RUNTIME.md`, modèle de rapport perf, checklist install APK dans le template.

## Ce qui reste (recommandé)

| Priorité | Sujet | Notes |
|----------|--------|--------|
| P1 | Remplir un **PERFORMANCE_REPORT** avant/après sur APK réel | Cold start + scroll ; **matrice 3–5 appareils** (entrée / milieu / haut), pas un seul téléphone — voir principe dans `docs/PERFORMANCE_REPORT_TEMPLATE.md` |
| P2 | Migrer d’autres **FlatList** / listes scrollées vers **FlashList** si listes longues | Historique client + gérant faits ; autres écrans selon `perf:list-screens` |
| P3 | **Skia** uniquement si besoin produit (HUD, courbes) | Éviter dépendance sans usage |
| P4 | Étendre `openTechnicalFeedback` aux autres erreurs **catch** métier (ex. écrans gérant / livreur) | Panier (`pushFailed`), pastille synchro (long press), livreur (`LivreurOrderPanel` — transition refusée). Gérant : erreurs surtout **métier** (Snackbar « Action impossible ») sans détail réseau dédié ; synchro via pastille. |
| P5 | Tests automatisés perf | Detox / maestro — hors scope immédiat |
| P6 | Métriques terrain agrégées | Play Console (Android vitals : démarrage, ANR), ou Firebase Performance / équivalent après intégration — complète la matrice manuelle du template perf |

## Critère « terminé » produit

Voir `PRODUCT_DEFINITION_OF_DONE` dans `src/constants/productDirection.ts` : `npm run verify`, parcours démo sur **APK installé**.
