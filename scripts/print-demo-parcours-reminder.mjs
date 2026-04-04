/**
 * Rappel recette manuelle : PRODUCT_DELIVERABLE (APK réel, pas seul Expo Go).
 * Voir src/constants/productDirection.ts et docs/parcours-demo-firebase.md
 */
const lines = [
  'Parcours démo (PRODUCT_DELIVERABLE) — validation humaine sur APK installé :',
  '  1. Client : menu → panier → valider commande (synchro cloud si configurée).',
  '  2. Gérant : commande visible, changement de statut.',
  '  3. Livreur : prise en charge / livraison si périmètre démo.',
  '  4. Client : suivi cohérent avec Firestore.',
  'Réf. : src/constants/productDirection.ts · docs/parcours-demo-firebase.md',
];
console.log(lines.join('\n'));
