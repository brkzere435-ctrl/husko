export type MenuCategory =
  | 'smash'
  | 'frites'
  | 'baguette'
  | 'sandwich'
  | 'four'
  | 'dessert'
  | 'boisson';

export type MenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  price: number;
  description?: string;
};

export const MENU: MenuItem[] = [
  {
    id: 'smash-1',
    category: 'smash',
    name: 'Smash simple',
    price: 8,
    description: 'Inclus frites & boisson',
  },
  {
    id: 'smash-2',
    category: 'smash',
    name: 'Smash double',
    price: 11,
    description: 'Inclus frites & boisson',
  },
  {
    id: 'smash-3',
    category: 'smash',
    name: 'Smash triple',
    price: 14,
    description: 'Inclus frites & boisson',
  },
  {
    id: 'smash-4',
    category: 'smash',
    name: 'Smash quadruple',
    price: 16,
    description: 'Inclus frites & boisson',
  },
  {
    id: 'frites-s',
    category: 'frites',
    name: 'Frites chargées S',
    price: 12,
    description: 'Viande au choix · sauces au choix',
  },
  {
    id: 'frites-m',
    category: 'frites',
    name: 'Frites chargées M',
    price: 15,
    description: 'Viande au choix · sauces au choix',
  },
  {
    id: 'frites-l',
    category: 'frites',
    name: 'Frites chargées L',
    price: 17,
    description: 'Viande au choix · sauces au choix',
  },
  { id: 'bag-poulet', category: 'baguette', name: 'Baguetta poulet', price: 14 },
  { id: 'bag-kebab', category: 'baguette', name: 'Baguetta kebab', price: 13 },
  { id: 'bag-steak', category: 'baguette', name: 'Baguetta steak', price: 12 },
  { id: 'bag-smash', category: 'baguette', name: 'Baguetta Smash B', price: 12 },
  { id: 'sand-pita-poulet', category: 'sandwich', name: 'Sandwich poulet (pita)', price: 13 },
  { id: 'sand-pita-steak', category: 'sandwich', name: 'Sandwich steak (pita)', price: 10 },
  { id: 'sand-pita-kebab', category: 'sandwich', name: 'Sandwich kebab (pita)', price: 10 },
  { id: 'sand-wrap-poulet', category: 'sandwich', name: 'Wrap poulet', price: 14 },
  { id: 'sand-wrap-kebab', category: 'sandwich', name: 'Wrap kebab', price: 11 },
  { id: 'sand-wrap-steak', category: 'sandwich', name: 'Wrap steak', price: 11 },
  { id: 'four-kebab', category: 'four', name: 'Au four kebab', price: 13 },
  { id: 'four-poulet', category: 'four', name: 'Au four poulet', price: 14 },
  { id: 'four-steak', category: 'four', name: 'Au four steak', price: 13 },
  { id: 'des-daim', category: 'dessert', name: 'Daim', price: 4 },
  { id: 'des-tiramisu', category: 'dessert', name: 'Tiramisu', price: 4 },
  { id: 'des-mystere', category: 'dessert', name: 'Dessert mystère', price: 4 },
  { id: 'bois-eau', category: 'boisson', name: 'Eau', price: 1 },
  { id: 'bois-capri', category: 'boisson', name: 'Capri-Sun', price: 1 },
  { id: 'bois-canette', category: 'boisson', name: 'Canette', price: 2 },
  { id: 'bois-50', category: 'boisson', name: 'Bouteille 50cl', price: 3 },
];

/** Libellés alignés sur les flyers (Husko By Night / kebab). */
export const CATEGORY_LABEL: Record<MenuCategory, string> = {
  smash: 'SMASH',
  frites: 'FRITES CHARGÉES',
  baguette: 'BAGUETTA',
  sandwich: 'SANDWICHES · WRAPS',
  four: 'SANDWICH AU FOUR',
  dessert: 'DESSERTS',
  boisson: 'BOISSONS',
};
