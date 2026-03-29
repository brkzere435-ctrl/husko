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

export function isDeliveryOpen(now = new Date()): boolean {
  const day = now.getDay();
  if (day === 0) return false;
  const h = now.getHours();
  const m = now.getMinutes();
  const minutes = h * 60 + m;
  const start = 20 * 60;
  const end = 24 * 60;
  return minutes >= start && minutes < end;
}

/** Message alerte quand le client commande hors créneau. */
export function deliveryClosedAlertMessage(): string {
  return `Les livraisons sont assurées ${SURE_DELIVERY_DAYS}, ${SURE_DELIVERY_WINDOW}. Revenez dans ce créneau pour commander.`;
}
