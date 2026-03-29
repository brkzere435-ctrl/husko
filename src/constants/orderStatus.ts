import type { OrderStatus } from '@/stores/useHuskoStore';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente gérant',
  preparing: 'En préparation',
  awaiting_livreur: 'Prêt pour le livreur',
  on_way: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
