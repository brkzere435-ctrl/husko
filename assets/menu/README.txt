Photos produit pour le menu client.

Référence design (couleurs, typo, Maps, rebuild) : docs/design-tokens-reference.md

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
