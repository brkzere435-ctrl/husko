/** Textes côté client — ton chaleureux et rassurant. */

/** Intro plein écran au 1er lancement client (`ClientBootOverlay`) — durée max. avant passage auto au menu. */
export const CLIENT_BOOT_DURATION_MS = 1600;

/** Texte discret — l’utilisateur peut aussi appuyer pour zapper sans attendre. */
export const CLIENT_BOOT_SKIP_HINT = 'Appuyer pour continuer';

export const CLIENT_PHONE_DISPLAY = '06 29 39 74 30';
export const CLIENT_PHONE_TEL = '+33629397430';

/** Panier : commande acceptée même fermé — livraison selon horaires réels. */
export const outsideDeliveryHoursBanner =
  'Vous pouvez commander maintenant : le gérant valide sous 30 min max. Sinon la commande est annulée automatiquement. Livraison habituelle lun–sam 20h–00h.';

export const clientStrings = {
  menuHint: 'Touchez un plat pour l’ajouter au panier.',
  /** Aligné flyers : chaque ligne du menu a une photo dans l’app. */
  trustLine: 'Photos des plats · Paiement à la livraison · Suivi en temps réel',
  /** Ambiance West Coast (sunset LA / lowrider) — lieu : Angers. */
  westCoastMood: 'Crépuscule californien · lowrider · Angers by night',
  openNow: 'Créneau livraison ouvert',
  closedNow: 'Hors créneau livraison — commandes toujours possibles',
  panierIntro:
    'Vérifiez votre adresse : le livreur s’y rendra avec votre commande. Le restaurant vous confirme la préparation.',
  panierEmptyTitle: 'Votre panier est vide',
  panierEmptyBody: 'Retournez au menu pour choisir vos plats préférés.',
  orderSentTitle: 'Merci, c’est parti !',
  orderSentMessage: (ref: string) =>
    `Votre commande ${ref} est bien arrivée au restaurant. Vous pouvez suivre chaque étape dans l’onglet Suivi.`,
  suiviEmptyTitle: 'Aucune commande en cours',
  suiviEmptyBody: 'Quand vous validez une commande depuis le panier, son suivi apparaît ici.',
  suiviMerciTitle: 'Bon appétit !',
  suiviMerciBody: 'Votre dernière commande est indiquée comme livrée. Merci de votre confiance.',
  suiviNewOrder: 'Nouvelle commande',
  suiviGoMenu: 'Voir le menu',
  suiviCancelledTitle: 'Commande annulée',
  suiviCancelledBody: (ref: string) =>
    `Pas de validation gérant dans les 30 minutes — ${ref}. Tu peux recommander depuis le menu.`,
  historiqueTitle: 'Mes commandes',
  historiqueEmpty: 'Aucune commande terminée pour l’instant. Les livraisons et annulations apparaîtront ici.',
  historiqueLink: 'Mes commandes passées',
  cloudCheckoutBlockedTitle: 'Liaison cloud requise',
  cloudCheckoutBlockedBody:
    'Sans Firebase configuré dans l’app (variables EAS + nouveau build), votre commande ne part pas au restaurant. Consultez App & mises à jour ou env.example.',
} as const;
