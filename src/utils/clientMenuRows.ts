/**
 * Lignes plates pour FlashList (menu client) : en-têtes de catégorie + produits.
 * Évite les FlatList imbriquées et améliore le scroll sur de longs menus.
 */
import type { MenuCategory, MenuItem } from '@/constants/menu';

export type ClientMenuRow =
  | { type: 'header'; key: string; category: MenuCategory }
  | { type: 'product'; key: string; item: MenuItem };

export function buildClientMenuRows(
  sections: [MenuCategory, MenuItem[]][]
): ClientMenuRow[] {
  const out: ClientMenuRow[] = [];
  for (const [cat, items] of sections) {
    out.push({ type: 'header', key: `h-${cat}`, category: cat });
    for (const m of items) {
      out.push({ type: 'product', key: m.id, item: m });
    }
  }
  return out;
}
