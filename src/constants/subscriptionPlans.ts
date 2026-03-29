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
    features: ['Réponses courtes, usage régulier modéré', 'Idées et rédaction simple'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceEur: 100,
    tagline: 'Cadence soutenue',
    features: ['Contexte plus long, structuration', 'Quota serveur plus large'],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceEur: 180,
    tagline: 'Pleine fonctionnalité',
    features: ['Profondeur max, priorité côté API', 'Idééal pour conception et itérations longues'],
  },
];

export function planById(id: SubscriptionTierId): SubscriptionPlan {
  const p = SUBSCRIPTION_PLANS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown plan: ${id}`);
  return p;
}
