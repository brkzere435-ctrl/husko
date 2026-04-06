import type { ImageSourcePropType } from 'react-native';

import type { MenuItem } from '@/constants/menu';

/**
 * Photos produit — source de vérité des fichiers : `assets/menu/<item.id>.png`.
 * Tarifs et libellés : alignés sur les **affiches officielles** (même grille que le menu papier / Snap).
 *
 * **Nommage** — un fichier par entrée `MenuItem.id` dans `menu.ts` (ex. `smash-1.png`, `des-daim.png`).
 * Ne pas renommer sans mettre à jour cette table et `menu.ts`.
 *
 * **Format** — PNG 8 bits sRGB (recommandé pour Metro). Remplacer le fichier sans toucher au code
 * tant que le nom reste identique. Retirer une ligne ici = pas de photo (repli dégradé + icône).
 *
 * **Grille & cadrage (réalisme)** — l’UI affiche les photos en **carré**, `contentFit="cover"` :
 * - liste : ~72×72 dp ; fiche produit : ~220×220 dp (voir `MenuItemVisual`).
 * - **Ratio source conseillé : 1:1** (carré), sujet centré ; marge de sécurité **~10 %** sur les bords
 *   (cadre néon / coins arrondis rognent légèrement).
 * - Export **900–1200 px** de côté suffit pour toutes les densités ; au-delà, gain visuel faible, APK plus lourd.
 * - Lumière cohérente (même température / même direction) entre plats d’une même catégorie si possible.
 * - Variantes **évolutives** : `frites-s` / `frites-m` / `frites-l` (portion visuelle S→L) ; `smash-1` … `smash-4` (empilement des steacks).
 *
 * **Vérifs repo** — `npm run verify:menu-assets` (fichiers + ids alignés `menu.ts`).
 * Après remplacement massif : `npm run assets:menu:verify` (diversité des tailles, pas un seul doublon).
 */
const MENU_IMAGES: Partial<Record<string, ImageSourcePropType>> = {
  'smash-1': require('../../assets/menu/smash-1.png'),
  'smash-2': require('../../assets/menu/smash-2.png'),
  'smash-3': require('../../assets/menu/smash-3.png'),
  'smash-4': require('../../assets/menu/smash-4.png'),
  'frites-s': require('../../assets/menu/frites-s.png'),
  'frites-m': require('../../assets/menu/frites-m.png'),
  'frites-l': require('../../assets/menu/frites-l.png'),
  'bag-poulet': require('../../assets/menu/bag-poulet.png'),
  'bag-kebab': require('../../assets/menu/bag-kebab.png'),
  'bag-steak': require('../../assets/menu/bag-steak.png'),
  'bag-smash': require('../../assets/menu/bag-smash.png'),
  'sand-pita-poulet': require('../../assets/menu/sand-pita-poulet.png'),
  'sand-pita-steak': require('../../assets/menu/sand-pita-steak.png'),
  'sand-pita-kebab': require('../../assets/menu/sand-pita-kebab.png'),
  'sand-wrap-poulet': require('../../assets/menu/sand-wrap-poulet.png'),
  'sand-wrap-kebab': require('../../assets/menu/sand-wrap-kebab.png'),
  'sand-wrap-steak': require('../../assets/menu/sand-wrap-steak.png'),
  'four-kebab': require('../../assets/menu/four-kebab.png'),
  'four-poulet': require('../../assets/menu/four-poulet.png'),
  'four-steak': require('../../assets/menu/four-steak.png'),
  'des-daim': require('../../assets/menu/des-daim.png'),
  'des-tiramisu': require('../../assets/menu/des-tiramisu.png'),
  'des-mystere': require('../../assets/menu/des-mystere.png'),
  'bois-eau': require('../../assets/menu/bois-eau.png'),
  'bois-capri': require('../../assets/menu/bois-capri.png'),
  'bois-canette': require('../../assets/menu/bois-canette.png'),
  'bois-50': require('../../assets/menu/bois-50.png'),
};

export function getMenuImage(item: MenuItem): ImageSourcePropType | undefined {
  return MENU_IMAGES[item.id];
}
