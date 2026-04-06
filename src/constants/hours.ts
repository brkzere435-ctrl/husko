/**
 * Husko By Night — une seule formulation « heure sûre » pour toute l’app et la comm’.
 * Créneau réel : commandes / envois livreur entre 20h00 et 00h00, lundi → samedi (dimanche fermé).
 */
export const SURE_DELIVERY_WINDOW = '20h00 – 00h00';
export const SURE_DELIVERY_DAYS = 'du lundi au samedi';

/** Phrase unique affichée menu, hub, alertes « fermé ». */
export function deliveryHoursLabel(): string {
  return `Livraison ${SURE_DELIVERY_DAYS}, ${SURE_DELIVERY_WINDOW}`;
}

/** Titre court pour badges / accessibilité. */
export function deliveryHoursShort(): string {
  return `lun–sam · ${SURE_DELIVERY_WINDOW}`;
}

/**
 * Tests : ignorer le créneau 20h–00h.
 * - **Metro / Expo Go** : toujours actif (`__DEV__`) — pas besoin d’attendre demain 20h.
 * - **APK release** : uniquement si `EXPO_PUBLIC_HUSKO_TEST_ORDER_ANY_HOURS=1` au moment du `eas build`
 *   (ajouter dans `.env` + EAS Secrets, puis rebuild).
 */
export function isTestOrderAnyHoursEnabled(): boolean {
  if (typeof __DEV__ !== 'undefined' && __DEV__) return true;
  return process.env.EXPO_PUBLIC_HUSKO_TEST_ORDER_ANY_HOURS === '1';
}

export function isDeliveryOpen(now = new Date()): boolean {
  if (isTestOrderAnyHoursEnabled()) return true;
  const day = now.getDay();
  if (day === 0) return false;
  const h = now.getHours();
  const m = now.getMinutes();
  const minutes = h * 60 + m;
  const start = 20 * 60;
  const end = 24 * 60;
  return minutes >= start && minutes < end;
}

/**
 * Prise de commandes côté client : si le gérant a publié un état dans Firestore (`meta/service`),
 * il prime sur les horaires locaux. Sinon, créneau 20h–00h (lun–sam) comme avant.
 */
export function isClientOrderingAllowed(
  now: Date,
  remoteServiceAccepting: boolean | null
): boolean {
  if (isTestOrderAnyHoursEnabled()) return true;
  if (remoteServiceAccepting !== null) return remoteServiceAccepting;
  return isDeliveryOpen(now);
}

/** Message alerte quand le client commande hors créneau. */
export function deliveryClosedAlertMessage(): string {
  return `Les livraisons sont assurées ${SURE_DELIVERY_DAYS}, ${SURE_DELIVERY_WINDOW}. Revenez dans ce créneau pour commander.`;
}

/** Quand le gérant a fermé le service à distance (Firestore). */
export function serviceClosedByManagerMessage(): string {
  return 'Le restaurant a fermé la prise de commandes pour le moment. Réessayez plus tard ou appelez-nous.';
}
