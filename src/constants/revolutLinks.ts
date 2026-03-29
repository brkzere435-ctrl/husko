import type { SubscriptionTierId } from '@/constants/subscriptionPlans';

/**
 * Liens de paiement Revolut (Payment link Merchant, checkout hébergé, etc.).
 * Crée-les depuis Revolut Business / Developer ; ne mets pas de secrets ici.
 */
export function revolutPayUrlForTier(id: SubscriptionTierId): string {
  const key =
    id === 'essentiel'
      ? 'EXPO_PUBLIC_REVOLUT_PAY_ESSENTIEL'
      : id === 'pro'
        ? 'EXPO_PUBLIC_REVOLUT_PAY_PRO'
        : 'EXPO_PUBLIC_REVOLUT_PAY_PREMIUM';
  const v = process.env[key]?.trim();
  return v ?? '';
}
