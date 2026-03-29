import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Order } from '@/stores/useHuskoStore';

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

/** Nouvelle commande → notification gérant */
export async function notifyGerantNewOrder(order: Order) {
  await schedule('Husko · Gérant', `Nouvelle commande ${order.id} — ${order.total.toFixed(2)} €`);
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
