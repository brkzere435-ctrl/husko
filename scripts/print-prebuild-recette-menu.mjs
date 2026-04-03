/**
 * Rappel recette humaine avant EAS (menu → détail → panier sur build réel).
 * Ne remplace pas un test manuel ; s’affiche dans la sortie CI si appelé.
 */
const lines = [
  'Prebuild recette menu (checklist) :',
  '  1. APK installé ou dev client sur appareil réel (pas seul Expo Go si le parcours natif compte).',
  '  2. Menu : grille, photos, titres/prix lisibles.',
  '  3. Détail produit : fiche, ajout au panier.',
  '  4. Panier : article présent, total cohérent.',
  'Réf. : RELEASE_CHECKLIST.md, docs/parcours-demo-firebase.md.',
];
console.log(lines.join('\n'));
