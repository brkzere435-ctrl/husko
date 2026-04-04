/**
 * Tokens visuels — distribution APK / QR (`app/gerant/distribution.tsx`).
 */
import type { DistributionTabKey } from '@/constants/distributionRoles';
import { appScreenVisual } from '@/constants/appScreenVisual';

export const gerantDistributionVisual = {
  tabDefaultBorder: 'rgba(34, 211, 238, 0.22)',
  tabDefaultBg: appScreenVisual.overlay042,
  tabSelectedBg: appScreenVisual.overlay055,
  anywhereBorder: 'rgba(74, 222, 128, 0.35)',
  anywhereBg: 'rgba(20, 50, 35, 0.35)',
  tabActiveBg: {
    unified: 'rgba(34, 211, 238, 0.12)',
    assistant: 'rgba(232, 121, 249, 0.1)',
    gerant: 'rgba(240, 208, 80, 0.12)',
    client: 'rgba(74, 222, 128, 0.1)',
    livreur: 'rgba(96, 165, 250, 0.1)',
  } as const satisfies Record<DistributionTabKey, string>,
} as const;

export function distributionTabActiveBg(tab: DistributionTabKey): string {
  return gerantDistributionVisual.tabActiveBg[tab];
}
