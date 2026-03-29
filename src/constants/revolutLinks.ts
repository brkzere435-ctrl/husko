import type { SubscriptionTierId } from '@/constants/subscriptionPlans';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

/**
 * Liens Revolut (publics). Références explicites à EXPO_PUBLIC_* pour que Metro les inline au build ;
 * repli sur `extra` (expo-constants) si besoin.
 */
export function revolutPayUrlForTier(id: SubscriptionTierId): string {
  const e = readHuskoExpoExtra();
  const fromEnvEssentiel = process.env.EXPO_PUBLIC_REVOLUT_PAY_ESSENTIEL?.trim() || '';
  const fromEnvPro = process.env.EXPO_PUBLIC_REVOLUT_PAY_PRO?.trim() || '';
  const fromEnvPremium = process.env.EXPO_PUBLIC_REVOLUT_PAY_PREMIUM?.trim() || '';
  switch (id) {
    case 'essentiel':
      return fromEnvEssentiel || e.revolutPayEssentiel?.trim() || '';
    case 'pro':
      return fromEnvPro || e.revolutPayPro?.trim() || '';
    case 'premium':
      return fromEnvPremium || e.revolutPayPremium?.trim() || '';
    default:
      return '';
  }
}
