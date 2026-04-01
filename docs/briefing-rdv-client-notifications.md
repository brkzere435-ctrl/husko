# Briefing — rendez-vous client (notifications / synchro client–gérant)

Document de préparation : expliquer ce qui a été corrigé, comment l’app fonctionne réellement, et les limites honnêtes. La procédure technique détaillée reste dans [`DEPLOIEMENT.md`](../DEPLOIEMENT.md).

---

## 1. Contexte

**Problème perçu** : après une commande, une notification parlait de « gérant » alors que c’était le téléphone / l’**APK client** qui affichait l’alerte ; au tap, **le même APK** s’ouvrait.

**Comportement réel** : ce n’était pas une « mauvaise app installée ». Les alertes concernées passent par des **notifications locales** (`expo-notifications`), émises **dans l’app qui exécute le code** au moment de la commande (souvent le client). Le titre « pour le gérant » décrivait un **rôle métier**, pas l’application qui recevait la notif.

---

## 2. Ce qui a été corrigé en produit

Les textes de **`notifyGerantNewOrder`** s’adaptent à la **variante d’app** (`getAppVariant()` dans [`src/constants/appVariant.ts`](../src/constants/appVariant.ts)) :

| Variante | Comportement |
|----------|----------------|
| **`client`** | Titre du type « Husko · Commande envoyée », message indiquant que le restaurant reçoit la commande **via la synchro Firebase** (plus de faux « Husko · Gérant » sur l’APK client). |
| **`all`** (hub / APK unifié) | Titre « Husko · Nouvelle commande », message invitant à ouvrir **l’espace gérant** dans la même installation. |
| **Autres** (`gerant`, `livreur`, `assistant`) | Comportement inchangé côté libellé historique « Husko · Gérant » + détail commande, là où c’est pertinent. |

Fichiers : [`src/services/orderNotifications.ts`](../src/services/orderNotifications.ts), déclenché depuis [`src/stores/useHuskoStore.ts`](../src/stores/useHuskoStore.ts) (`placeOrder`).

---

## 3. Où c’est dans le code (références rapides)

| Sujet | Fichier |
|-------|---------|
| Textes et logique des notifications | [`src/services/orderNotifications.ts`](../src/services/orderNotifications.ts) |
| Passage de commande + appel notif | [`src/stores/useHuskoStore.ts`](../src/stores/useHuskoStore.ts) (`placeOrder`) |
| Écriture commande + abonnement liste (Firestore) | [`src/services/firebaseRemote.ts`](../src/services/firebaseRemote.ts) ; abonnement global dans [`app/_layout.tsx`](../app/_layout.tsx) (`subscribeToRemoteOrders`) |

---

## 4. « Visuel » côté utilisateur

Il n’y a **pas d’écran Husko** dédié à ce message : l’utilisateur voit une **notification système** (tiroir / bannière Android ou iOS). Le texte affiché est celui défini dans le code ci-dessus.

---

## 5. Architecture à expliquer (crédibilité)

| Mécanisme | Rôle |
|-----------|------|
| **Notification locale** (`scheduleNotificationAsync`) | Rappel sur **l’app qui exécute le code** au moment de l’action. **Ne remplace pas** une alerte sur un **autre** téléphone ou un **autre** APK. |
| **Firestore** (`remotePushOrder` + `subscribeToRemoteOrders`) | Permet au **gérant sur un autre appareil** de **voir la commande dans la liste**, **si** le même projet Firebase et les mêmes clés sont présents dans les builds. |

---

## 6. Sécurité (message professionnel, bref)

- Les **secrets** (Firebase, Maps, etc.) ne doivent **pas** être commités ; le projet s’appuie sur **`.env`**, **EAS**, et des scripts (`firebase:env:check`, `security:check`, etc. — voir [`package.json`](../package.json) et [`DEPLOIEMENT.md`](../DEPLOIEMENT.md)).
- Les **règles Firestore** ([`firestore.rules`](../firestore.rules), déploiement documenté) déterminent qui lit/écrit la collection `orders` : à **durcir en production** au-delà d’un mode démo ouvert.

---

## 7. Limite honnête (si le client demande une notif sur le téléphone du gérant)

Sans **push serveur** (FCM + backend ou Cloud Functions) ciblant l’APK gérant sur un **autre** appareil, **aucune** notification ne peut sonner **spécifiquement** sur le téléphone du gérant à partir du seul client.

La **liste des commandes à jour** sur l’app gérant repose sur **Firebase** (même projet, règles OK, réseau) + **listener** dans l’app, pas sur le libellé des notifs locales côté client.

---

## 8. Phrase de clôture possible

> Les notifications que vous voyiez venaient du bon APK mais avec un libellé trompeur ; nous l’avons corrigé. La commande côté cuisine repose sur la synchro cloud ; pour faire sonner un second téléphone dédié au gérant, il faudrait un chantier push dédié (FCM / backend).

---

## 9. Checklist démo (avant le rendez-vous)

1. Vérifier que **Firebase** est actif sur les builds utilisés (`npm run firebase:env:check` avant build si besoin).
2. **Client** : passer une commande de test.
3. **Gérant** (autre appareil ou espace gérant selon votre installation) : confirmer que la commande apparaît dans la **liste** (synchro Firestore).
4. Détail ops (secrets identiques client/gérant, règles, diagnostic) : section **Liaison directe entre appareils (Firebase)** et checklist associée dans [`DEPLOIEMENT.md`](../DEPLOIEMENT.md).
