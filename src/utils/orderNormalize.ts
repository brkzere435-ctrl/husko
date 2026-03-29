import type { MenuCategory, MenuItem } from '@/constants/menu';
import { MENU } from '@/constants/menu';
import type { Order, OrderLine, OrderStatus } from '@/stores/useHuskoStore';

export function normalizeOrderStatus(raw: unknown): OrderStatus {
  const s = String(raw);
  if (s === 'accepted') return 'preparing';
  if (
    s === 'pending' ||
    s === 'preparing' ||
    s === 'awaiting_livreur' ||
    s === 'on_way' ||
    s === 'delivered' ||
    s === 'cancelled'
  ) {
    return s;
  }
  return 'pending';
}

function coerceCategory(raw: unknown): MenuCategory {
  const s = String(raw);
  const allowed: MenuCategory[] = [
    'smash',
    'frites',
    'baguette',
    'sandwich',
    'four',
    'dessert',
    'boisson',
  ];
  return (allowed.includes(s as MenuCategory) ? s : 'sandwich') as MenuCategory;
}

function itemFromMenuOrPayload(item: Record<string, unknown>): MenuItem | null {
  const id = typeof item.id === 'string' ? item.id : '';
  if (!id) return null;
  const fromMenu = MENU.find((m) => m.id === id);
  if (fromMenu) return fromMenu;
  const name = typeof item.name === 'string' ? item.name : 'Article';
  const price = typeof item.price === 'number' && Number.isFinite(item.price) ? item.price : 0;
  const description = typeof item.description === 'string' ? item.description : undefined;
  return {
    id,
    category: coerceCategory(item.category),
    name,
    price,
    description,
  };
}

/** Rend une commande Firestore exploitable par l’UI (statuts legacy, lignes partielles). */
export function coerceOrderFromRemote(data: unknown): Order | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const id = typeof d.id === 'string' ? d.id : null;
  if (!id) return null;

  const createdAt =
    typeof d.createdAt === 'number' && Number.isFinite(d.createdAt) ? d.createdAt : Date.now();
  const status = normalizeOrderStatus(d.status);

  const linesRaw = Array.isArray(d.lines) ? d.lines : [];
  const lines: OrderLine[] = [];
  for (const row of linesRaw) {
    if (!row || typeof row !== 'object') continue;
    const line = row as Record<string, unknown>;
    const qtyRaw = line.qty;
    const qty = typeof qtyRaw === 'number' && qtyRaw > 0 ? Math.min(99, Math.floor(qtyRaw)) : 1;
    const itemRaw = line.item;
    if (!itemRaw || typeof itemRaw !== 'object') continue;
    const item = itemFromMenuOrPayload(itemRaw as Record<string, unknown>);
    if (item) lines.push({ item, qty });
  }

  const total =
    typeof d.total === 'number' && Number.isFinite(d.total)
      ? d.total
      : lines.reduce((a, l) => a + l.item.price * l.qty, 0);

  const addressLabel = typeof d.addressLabel === 'string' ? d.addressLabel : '—';
  const destLat =
    typeof d.destLat === 'number' && Number.isFinite(d.destLat) ? d.destLat : 47.4739;
  const destLng =
    typeof d.destLng === 'number' && Number.isFinite(d.destLng) ? d.destLng : -0.5517;

  return {
    id,
    createdAt,
    status,
    lines,
    total,
    addressLabel,
    destLat,
    destLng,
  };
}
