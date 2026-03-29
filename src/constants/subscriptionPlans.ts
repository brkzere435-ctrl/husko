export type SubscriptionTierId = 'essentiel' | 'pro' | 'premium';

export type SubscriptionPlan = {
  id: SubscriptionTierId;
  name: string;
  priceEur: number;
  tagline: string;
  features: string[];
};

/** Forfaits côté client (50 / 100 / 180 €). Les limites réelles sont appliquées sur ton backend + webhooks de paiement. */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    priceEur: 50,
    tagline: 'Démarrage',
    features: [
      'Assistant conversationnel (modèle standard)',
      'Contexte court, idéal pour questions ponctuelles',
      'Aide rédaction et idées (usage modéré)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceEur: 100,
    tagline: 'Cadence soutenue',
    features: [
      'Tout Essentiel',
      'Contexte plus long et suivis de fil',
      'Aide structuration (docs, specs, conception)',
      'Quota élargi côté serveur (selon ton backend)',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceEur: 180,
    tagline: 'Pleine fonctionnalité',
    features: [
      'Tout Pro',
      'Priorité et limites maximales côté API',
      'Scénarios avancés (design, architecture, itérations longues)',
      'Aligné sur une offre « référence » équivalente à un forfait ~65 € / mois côté fournisseur',
    ],
  },
];

export function planById(id: SubscriptionTierId): SubscriptionPlan {
  const p = SUBSCRIPTION_PLANS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown plan: ${id}`);
  return p;
}
