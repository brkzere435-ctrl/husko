import type { Order } from '@/stores/useHuskoStore';

/**
 * Fusionne les commandes Firestore avec l’état local pour éviter d’écraser une commande
 * encore non propagée (course setDoc / latence listener).
 * Pour un même id, la version **remote** prime.
 */
export function mergeRemoteOrdersWithLocal(remote: Order[], local: Order[]): Order[] {
  const byId = new Map<string, Order>();
  for (const o of remote) {
    byId.set(o.id, o);
  }
  for (const o of local) {
    if (!byId.has(o.id)) {
      byId.set(o.id, o);
    }
  }
  return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
}
