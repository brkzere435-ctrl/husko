import type { OrderStatus } from '@/stores/useHuskoStore';

/** Étapes affichées côté client (suivi). */
export const CLIENT_TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Commande reçue' },
  { status: 'preparing', label: 'En préparation' },
  { status: 'awaiting_livreur', label: 'Attente du livreur' },
  { status: 'on_way', label: 'En livraison' },
  { status: 'delivered', label: 'Livrée' },
];

export function timelineStepIndex(current: OrderStatus): number {
  const order: OrderStatus[] = ['pending', 'preparing', 'awaiting_livreur', 'on_way', 'delivered'];
  if (current === 'cancelled') return -1;
  const i = order.indexOf(current);
  return i >= 0 ? i : 0;
}
