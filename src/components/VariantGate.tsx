import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { getAppVariant } from '@/constants/appVariant';

/**
 * Empêche d’accéder aux espaces d’une autre variante (un seul rôle par APK).
 */
export function VariantGate() {
  const variant = getAppVariant();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (variant === 'all') return;
    const first = segments[0];
    if (!first) return;
    const need = variant;
    if (first !== need) {
      router.replace(`/${need}` as '/gerant' | '/client' | '/livreur' | '/assistant');
    }
  }, [variant, segments, router]);

  return null;
}
