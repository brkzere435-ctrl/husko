/** Textes côté client — ton chaleureux et rassurant. */
export const CLIENT_PHONE_DISPLAY = '06 29 39 74 30';
export const CLIENT_PHONE_TEL = '+33629397430';

export const clientStrings = {
  menuHint: 'Touchez un plat pour l’ajouter au panier.',
  trustLine: 'Paiement à la livraison · Suivi en temps réel',
  openNow: 'Ouvert aux commandes',
  closedNow: 'Fermé pour le moment — repassez aux horaires affichés',
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
} as const;
