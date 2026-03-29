export type DistributionTabKey = 'client' | 'livreur' | 'gerant';

/** Couleurs QR / onglets — repère visuel fort (gérant ≠ client ≠ livreur). */
export const DISTRIBUTION_ROLE_STYLE: Record<
  DistributionTabKey,
  { label: string; shortLabel: string; qrDark: string; accent: string; bannerBg: string }
> = {
  gerant: {
    label: 'GÉRANT',
    shortLabel: 'Gérant',
    qrDark: '#f0d050',
    accent: '#f2d45c',
    bannerBg: 'rgba(240, 208, 80, 0.22)',
  },
  client: {
    label: 'CLIENT',
    shortLabel: 'Client',
    qrDark: '#4ade80',
    accent: '#4ade80',
    bannerBg: 'rgba(74, 222, 128, 0.2)',
  },
  livreur: {
    label: 'LIVREUR',
    shortLabel: 'Livreur',
    qrDark: '#60a5fa',
    accent: '#60a5fa',
    bannerBg: 'rgba(96, 165, 250, 0.22)',
  },
};
