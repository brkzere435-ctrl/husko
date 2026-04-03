# Parcours démo Husko — Firebase, builds, OTA

Guide opérationnel pour une **démonstration reproductible** (client → gérant → livreur) avec synchro **Firestore**. Complète [DEPLOIEMENT.md](../DEPLOIEMENT.md) (détail des prérequis) et [IOS_RELEASE_CHECKLIST.md](../IOS_RELEASE_CHECKLIST.md) pour iOS. **Rendu visuel** (HUD GTA, Cadillac, photos menu, clés Maps) : [visuel-west-coast-checklist.md](visuel-west-coast-checklist.md).

## Rappel

Sans `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_API_KEY` et le reste des `EXPO_PUBLIC_FIREBASE_*` **injectés dans chaque build** utilisé pour la démo, les commandes restent **locales** : le gérant ne les voit pas. La logique est dans [`src/services/firebaseRemote.ts`](../src/services/firebaseRemote.ts).

Sur l’UI, la pastille **Cloud / Local** ([`SyncStatusPill`](../src/components/SyncStatusPill.tsx)) indique si la liaison Firebase est active dans **ce** build.

---

## Choix de démo (deux axes)

| Axe | Option A (recommandée terrain) | Option B |
|-----|-------------------------------|----------|
| **Distribution** | **Hub unifié** : un APK, menu d’entrée Commander / Gérant / Livreur | **APK séparés** : un téléphone (ou compte) par rôle |
| **Livreur** | **Android** : APK livreur | **iOS** : build iOS (pas de fichier `.apk` sur iPhone) |

**APK ≠ iOS** : un fichier `.apk` s’installe uniquement sur Android. Pour un livreur sur iPhone, utiliser `npm run build:ios:livreur` et la distribution Apple (voir `IOS_RELEASE_CHECKLIST.md`).

---

## Matrice des builds (profils EAS)

Profils définis dans [`eas.json`](../eas.json). Commandes depuis [`package.json`](../package.json).

| Rôle / usage | Profil EAS | `EXPO_PUBLIC_APP_VARIANT` | Canal EAS Update | Commande build Android | Commande build iOS |
|--------------|------------|---------------------------|------------------|------------------------|-------------------|
| Hub (tout-en-un) | `apk-unified` | `all` | `hub` | `npm run build:apk:unified` ou `npm run build:android` | — (pas de hub iOS dédié dans les scripts courants) |
| Client seul | `apk-client` | `client` | `client` | `npm run build:apk:client` | `npm run build:ios:client` |
| Gérant seul | `apk-gerant` | `gerant` | `gerant` | `npm run build:apk:gerant` | `npm run build:ios:gerant` |
| Livreur | `apk-livreur` | `livreur` | `livreur` | `npm run build:apk:livreur` | `npm run build:ios:livreur` |
| Copilote | `apk-assistant` | `assistant` | `assistant` | `npm run build:apk:assistant` | `npm run build:ios:assistant` |

Packages Android (`applicationId`) : voir le tableau dans [DEPLOIEMENT.md — Liaison directe](../DEPLOIEMENT.md) (section *Paquets Husko*).

---

## Checklist Firebase (avant de promettre la synchro)

1. **Secrets EAS** alignés sur le `.env` : `npm run eas:sync:firebase` (mêmes clés pour **tous** les profils utilisés en démo).
2. **Règles Firestore** : `npm run firebase:deploy:rules` — vérifier [`firestore.rules`](../firestore.rules) (collection `orders`, etc.).
3. **Contrôle local** : `npm run firebase:env:check` ; en CI stricte : `npm run firebase:env:check:strict`.
4. **Rebuild** les APK / iOS **après** avoir corrigé les clés si un build a été fait sans Firebase complet.

### Validation « preuve sans débat »

1. Côté **client** : valider une commande jusqu’au bout.
2. Dans la **console Firebase** → Firestore : un document `orders/{orderId}` doit apparaître au moment de la validation.
3. Côté **gérant** : la commande doit apparaître dans l’app (listener sur le même projet Firebase).
4. Si la console **ne** montre **pas** le document, le problème n’est pas « l’UI gérant » en premier : c’est push client, règles, ou config embarquée.

---

## OTA (EAS Update) — canaux et scripts

Les builds ci-dessus écoutent chacun un **canal** (colonne *Canal*). Pour pousser **uniquement du JS** (sans changement natif) :

| Canal | Script npm | Variante bundle |
|-------|------------|-----------------|
| `hub` | `npm run eas:update:hub` | `EXPO_PUBLIC_APP_VARIANT=all` |
| `client` | `npm run eas:update:client` | `client` |
| `gerant` | `npm run eas:update:gerant` | `gerant` |
| `livreur` | `npm run eas:update:livreur` | `livreur` |
| `assistant` | `npm run eas:update:assistant` | `assistant` |

Les scripts utilisent `--environment production` et `--non-interactive` (voir `package.json`). **Rebuild natif** obligatoire si tu touches : plugins Expo, `app.config.js` / natif, icônes, splash, **clés Maps** (voir [DEPLOIEMENT.md — carte grise / Maps](../DEPLOIEMENT.md)).

---

## Liens de distribution et QR

Après un **nouveau** build dont tu veux partager l’URL (page Expo install) :

1. Mettre à jour les UUID d’URL dans [`distribution.defaults.json`](../distribution.defaults.json) (ex. `unified`, `client`, `gerant`, `livreur`).
2. Régénérer les QR : `npm run qr:generate` (voir aussi [DEPLOIEMENT.md](../DEPLOIEMENT.md) — chemins express et fiches).

---

## Scénario démo minimal (ordre)

1. Préparer les builds (hub et/ou mono-rôles) avec Firebase synchronisé ; optionnel iOS livreur si testeur iPhone.
2. Client : commande validée.
3. Vérifier Firestore (console) puis gérant.
4. Livreur : même projet Firebase ; vérifier le flux commande / carte selon l’écran livreur.

Pour une démo **simple** avec un seul fichier à envoyer : **APK hub** (`build:apk:unified`) + Firebase + OTA sur le canal `hub` si besoin de JS récent.
