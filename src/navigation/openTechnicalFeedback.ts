import { router } from 'expo-router';

import type { TechnicalFeedbackPayload } from '@/stores/technicalFeedbackStore';
import { useTechnicalFeedbackStore } from '@/stores/technicalFeedbackStore';

/**
 * Ouvre l’écran de feedback technique (message utilisateur + détail optionnel).
 * À utiliser pour erreurs réseau / synchro / exceptions non gérées côté UI.
 */
export function openTechnicalFeedback(p: TechnicalFeedbackPayload): void {
  useTechnicalFeedbackStore.getState().setPayload(p);
  router.push('/feedback/technical');
}
