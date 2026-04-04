Photos produit pour le menu client.

Référence design (couleurs, typo, Maps, rebuild) : docs/design-tokens-reference.md

Grille technique (ratio, taille export, nommage) : voir l’en-tête de src/constants/menuImages.ts
— en résumé : un fichier <id>.png par id menu.ts ; ratio 1:1 recommandé ; ~900–1200 px ; sujet centré,
  marge ~10 % ; PNG sRGB.

Briefs à jour (même contenu, angles différents) :
  - docs/design-handoff-ui-ux.md — freelance / tableau des ids / vérifs après livraison
  - docs/client-menu-assets.md — bundling, stock, flyers, placeholders
  - docs/briefing-rdv-client-notifications.md — notifications (hors photos)
  - docs/visuel-west-coast-checklist.md — rendu GTA / photos dans l’app

Jeu de photos distinctes (stock Lorem Flickr, recadrage carré) : npm run assets:menu:stock
(voir scripts/fetch-menu-stock-photos.mjs — remplacer par vos shoots pour la prod).

Photos depuis vos captures flyer (Snapchat) : npm run assets:menu:flyers
— recadre assets/menu/*.png depuis le dossier Cursor (voir scripts/extract-menu-from-flyers.mjs).
Variables optionnelles : HUSKO_FLYER_DIR, HUSKO_FLYER_472, HUSKO_FLYER_571.
Dry-run : node scripts/extract-menu-from-flyers.mjs --dry-run
Après changement d’images : npm run assets:menu:verify

Brief freelance + tableau des ids : docs/design-handoff-ui-ux.md

Nom de fichier : <id>.png où <id> est l’identifiant dans src/constants/menu.ts (ex. smash-1.png, des-daim.png).

Remplacer les fichiers sans modifier le code : mêmes noms, PNG ou WebP selon ce que Metro accepte (PNG recommandé).

Pour afficher l’icône + dégradé à la place d’une photo : retirer la ligne correspondante dans src/constants/menuImages.ts.
