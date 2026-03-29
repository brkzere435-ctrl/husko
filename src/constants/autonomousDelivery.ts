import type { OrderStatus } from '@/stores/useHuskoStore';

export type AutonomousPacePresetId = 'express' | 'demo' | 'standard';

export const AUTONOMOUS_PACE_PRESETS: Record<
  AutonomousPacePresetId,
  { label: string; hint: string; stepMs: number }
> = {
  express: {
    label: 'Express (~40 s)',
    hint: '~10 s entre chaque étape',
    stepMs: 10_000,
  },
  demo: {
    label: 'Démo (~2 min)',
    hint: '~30 s entre chaque étape',
    stepMs: 30_000,
  },
  standard: {
    label: 'Standard (~8 min)',
    hint: '~2 min entre chaque étape',
    stepMs: 120_000,
  },
};

export const AUTONOMOUS_PACE_ORDER: AutonomousPacePresetId[] = ['express', 'demo', 'standard'];

/** Prochain statut dans la chaîne gérant → livreur jusqu’à livré. */
export function nextFlowStatus(current: OrderStatus): OrderStatus | null {
  switch (current) {
    case 'pending':
      return 'preparing';
    case 'preparing':
      return 'awaiting_livreur';
    case 'awaiting_livreur':
      return 'on_way';
    case 'on_way':
      return 'delivered';
    default:
      return null;
  }
}

/** Nombre de transitions restantes jusqu’à « delivered ». */
export function transitionsUntilDelivered(status: OrderStatus): number {
  if (status === 'delivered' || status === 'cancelled') return 0;
  const flow: OrderStatus[] = ['pending', 'preparing', 'awaiting_livreur', 'on_way'];
  const i = flow.indexOf(status);
  if (i < 0) return 0;
  return flow.length - i;
}

export function estimatedMsUntilDelivered(status: OrderStatus, stepMs: number): number {
  return transitionsUntilDelivered(status) * stepMs;
}

/** Texte court pour l’UI client (minutes arrondies au supérieur, min. 1). */
export function formatEtaUntilDelivery(ms: number): string {
  const min = Math.max(1, Math.ceil(ms / 60_000));
  if (min < 60) return `environ ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `environ ${h} h` : `environ ${h} h ${m} min`;
}
