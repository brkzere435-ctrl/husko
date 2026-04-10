# Audit UX/UI Husko — P0/P1/P2

## P0 (bloquant release)

- `app/gerant/reglages.tsx` — Masquage des outils support en production (`Diagnostic terrain` uniquement si `EXPO_PUBLIC_HUSKO_DEBUG_BOOT=1`).
- `src/components/settings/SyncDiagnosticsSection.tsx` — Section technique masquée en production.
- `src/components/OtaUpdateSection.tsx` — Bloc OTA technique masqué en production.
- `src/components/DeploymentHints.tsx` — Avertissements infra masqués en production.
- `app/index.tsx` — Détails techniques (`APK`, `Bundle JS`) masqués en production.

## P1 (important, non bloquant immédiat)

- `app/gerant/index.tsx` — Wording simplifié (suppression des références Firestore/APK, messages orientés métier).
- `app/client/(tabs)/panier.tsx` — Dialog cloud reformulé en langage utilisateur final; wording test moins technique.
- `app/livreur/reglages.tsx` — Wording synchronisation simplifié (suppression mention Firebase).
- `app/gerant/reglages.tsx` — Wording synchronisation simplifié.
- `app/gerant/distribution.tsx` — Texte d’aide allégé (suppression commandes techniques côté surface utilisateur).

## P2 (améliorations de finition)

- `app/client/reglages.tsx` — Sous-titre simplifié, plus orienté usage.
- `app/livreur/reglages.tsx` — Sous-titre simplifié.
- `app/gerant/reglages.tsx` — Sous-titre et libellé raccourci distribution simplifiés.
- `app/gerant/index.tsx` — Message hub réécrit en langage opérationnel.

## Écrans audités

- Client: `app/client/(tabs)/menu.tsx`, `app/client/(tabs)/panier.tsx`, `app/client/suivi.tsx`, `app/client/reglages.tsx`, `app/client/historique.tsx`
- Livreur: `app/livreur/index.tsx`, `app/livreur/reglages.tsx`
- Gérant: `app/gerant/index.tsx`, `app/gerant/historique.tsx`, `app/gerant/distribution.tsx`, `app/gerant/reglages.tsx`

## Gate qualité attendu avant relivraison

- `npm run verify` doit être vert.
- Aucun bloc support/debug visible en parcours normal.
- Parcours de démonstration validé sur les 3 rôles (client/livreur/gérant).
