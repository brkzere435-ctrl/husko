# Architecture d’exécution Husko (Expo / React Native)

## Stack UI et rendu

| Couche | Technologie |
|--------|-------------|
| Navigation | Expo Router (fichiers sous `app/`) |
| UI | React Native (`View`, `Text`, `StyleSheet`), React Native Paper (composants ponctuels) |
| Listes performantes | `@shopify/flash-list` : menu client (`app/client/index.tsx`), historique client (`app/client/historique.tsx`), historique gérant (`app/gerant/historique.tsx`) |
| Animations | `react-native-reanimated` |
| Images | `expo-image` |
| Thème produit | `src/constants/theme.ts`, `westCoastTheme.ts` |

## Moteur JS et New Architecture

- **Hermes** : moteur JavaScript utilisé par défaut avec les toolchains Expo / React Native récents pour Android et iOS. Pas de bascule JSC en production dans la config standard Husko.
- **New Architecture** : activée via `newArchEnabled: true` dans `app.config.js` (Fabric, interop avec les modules natifs). **Tout changement impose un nouveau build natif** (`eas build`), pas seulement un OTA.

## Réseau et hors-ligne

- `@react-native-community/netinfo` : bannière « Pas de connexion » en tête d’app (`NetworkOfflineBanner`, `app/_layout.tsx`).
- Firestore : synchro commandes ; retries ciblés sur l’écriture `orders` (`remotePushOrder` dans `firebaseRemote.ts`).

## Skia (optionnel)

Le rendu **principal** de l’app reste en **React Native classique**. La dépendance **`@shopify/react-native-skia`** est présente au dépôt pour des usages **ponctuels** (canvas 2D, effets GPU). **Ne pas** migrer toute l’UI vers Skia : n’ajouter des `<Canvas>` que là où le besoin est validé (HUD, graphiques, effets non réalisables en RN seul). Nouveau build natif après ajout / mise à jour de Skia.

## Erreurs techniques utilisateur

- Écran unifié : route **`/feedback/technical`** (`app/feedback/technical.tsx`), ouvert via `openTechnicalFeedback()` (`src/navigation/openTechnicalFeedback.ts`).
- **ErrorBoundary** racine propose un accès « Détail technique » vers cet écran.
- **Pastille synchro** (erreur cloud) : appui long → même écran (`SyncStatusPill`).
- **Panier client** : si l’envoi Firestore échoue après validation, le dialogue « Envoi incomplet » propose **Détail technique** (message utilisateur + erreur brute côté store).
- **Livreur** (`LivreurOrderPanel`) : si une transition de statut est refusée (machine d’état), dialogue **Détail technique** avec identifiants commande / statut pour le support.

## Références

- Direction produit : `src/constants/productDirection.ts`
- Déploiement / EAS : `DEPLOIEMENT.md`
