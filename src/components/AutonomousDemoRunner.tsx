import { useEffect } from 'react';

import { AUTONOMOUS_PACE_PRESETS } from '@/constants/autonomousDelivery';
import { useHuskoStore } from '@/stores/useHuskoStore';

/**
 * Tant que le mode autonome est actif (réglages gérant), avance une étape du flux
 * à chaque intervalle — jusqu’à livraison complète. À monter uniquement sur la pile gérant.
 */
export function AutonomousDemoRunner() {
  const enabled = useHuskoStore((s) => s.autonomousDemoEnabled);
  const preset = useHuskoStore((s) => s.autonomousPacePreset);
  const stepMs = AUTONOMOUS_PACE_PRESETS[preset].stepMs;

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      useHuskoStore.getState().demoAdvanceNextOrder();
    }, stepMs);
    return () => clearInterval(id);
  }, [enabled, stepMs]);

  return null;
}
