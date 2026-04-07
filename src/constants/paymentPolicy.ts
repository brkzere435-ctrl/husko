/**
 * Direction produit : règlement par carte bancaire uniquement (pas d’espèces au livreur).
 * L’intégration du prestataire de paiement dans l’app est à brancher (PSP, conformité PCI).
 */
export const PAYMENT_NOTICE_SHORT =
  'Paiement par carte bancaire — pas d’espèces au livreur dans le flux prévu.';

export const PAYMENT_NOTICE_LONG =
  'Le règlement prévu est exclusivement par carte bancaire (prestataire à intégrer). Aucun paiement en espèces au livreur dans le périmètre cible.';
