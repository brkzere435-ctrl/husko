import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getAppVariant } from '@/constants/appVariant';
import type { Order } from '@/stores/useHuskoStore';
import { formatEuro } from '@/utils/formatEuro';

function canNotify() {
  return Platform.OS !== 'web';
}

export function configureNotificationHandler() {
  if (!canNotify()) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function schedule(title: string, body: string) {
  if (!canNotify()) return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: s2 } = await Notifications.requestPermissionsAsync();
    if (s2 !== 'granted') return;
  }
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

/**
 * EAS Update : notification locale avant reload — sans redemander la permission
 * (évite une popup système pendant un téléchargement silencieux).
 * @returns true si une notification a été planifiée (délai conseillé avant reload).
 */
export async function notifyAppUpdateReady(): Promise<boolean> {
  if (!canNotify()) return false;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Husko · Mise à jour',
      body: 'Nouvelle version installée. L’application redémarre…',
      sound: true,
      data: { huskoType: 'app_update' },
    },
    trigger: null,
  });
  return true;
}

/** Nouvelle commande : notif locale dans l’app qui appelle `placeOrder` (souvent le client) — pas un push vers l’APK gérant. */
export async function notifyGerantNewOrder(order: Order) {
  const variant = getAppVariant();
  const totalLbl = formatEuro(order.total);
  if (variant === 'client') {
    await schedule(
      'Husko · Commande envoyée',
      `Commande ${order.id} — ${totalLbl}. Le restaurant la reçoit par synchronisation (Firebase).`
    );
    return;
  }
  if (variant === 'all') {
    await schedule(
      'Husko · Nouvelle commande',
      `${order.id} — ${totalLbl}. Ouvrez l’espace gérant pour valider.`
    );
    return;
  }
  await schedule('Husko · Gérant', `Nouvelle commande ${order.id} — ${totalLbl}`);
}

/** Gérant a validé → client */
export async function notifyClientPreparing(orderId: string) {
  await schedule('Husko · Votre commande', `En cours de préparation — ${orderId}`);
}

/** Prêt pour le livreur */
export async function notifyLivreurPickupReady(orderId: string) {
  await schedule('Husko · Livreur', `Course prête à récupérer — ${orderId}`);
}

/** Livreur en route → client */
export async function notifyClientOnTheWay(orderId: string) {
  await schedule('Husko · Livraison', `Votre livreur est en route — suivez-le sur la carte (${orderId})`);
}

/** Livrée → gérant + client */
export async function notifyGerantDelivered(order: Order) {
  await schedule('Husko · Gérant', `Commande ${order.id} livrée — ajoutée à l’historique`);
}

export async function notifyClientDelivered(orderId: string) {
  await schedule('Husko · Livré', `Commande ${orderId} livrée. Bon appétit !`);
}

/** Aucune validation gérant dans les 30 minutes → annulation automatique */
export async function notifyClientOrderCancelledTimeout(orderId: string) {
  await schedule(
    'Husko · Commande annulée',
    `Pas de validation sous 30 min — commande ${orderId} annulée. Réessayez ou appelez le restaurant.`
  );
}

/**
 * Quand une autre appareil (gérant / livreur) met à jour le statut via Firestore, le téléphone
 * local ne passait pas par `applyOrderTransition` — les notifs locales ne partaient pas.
 * Compare l’état précédent et fusionné pour rejouer les mêmes messages que sur transition locale.
 */
export async function notifyRemoteOrderStatusDiff(
  previousOrders: Order[],
  nextOrders: Order[],
  notificationsEnabled: boolean
): Promise<void> {
  if (!notificationsEnabled) return;
  const variant = getAppVariant();
  const prevById = new Map(previousOrders.map((o) => [o.id, o]));

  for (const order of nextOrders) {
    const before = prevById.get(order.id);
    if (!before || before.status === order.status) continue;
    const prev = before.status;
    const next = order.status;
    try {
      if (variant === 'client' || variant === 'all') {
        if (prev === 'pending' && next === 'preparing') {
          await notifyClientPreparing(order.id);
        } else if (prev === 'awaiting_livreur' && next === 'on_way') {
          await notifyClientOnTheWay(order.id);
        } else if (prev === 'on_way' && next === 'delivered') {
          await notifyClientDelivered(order.id);
        }
      }
      if (variant === 'livreur' || variant === 'all') {
        if (prev === 'preparing' && next === 'awaiting_livreur') {
          await notifyLivreurPickupReady(order.id);
        }
      }
      if (variant === 'gerant' || variant === 'all') {
        if (prev === 'on_way' && next === 'delivered') {
          await notifyGerantDelivered(order);
        }
      }
    } catch {
      /* idem transition locale */
    }
  }
}
