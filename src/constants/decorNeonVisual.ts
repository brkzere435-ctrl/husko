/**
 * Voiles néon diagonaux (3 stops) — `DECOR_PRESETS` / `WestCoastBackground`.
 * Teintes « golden hour » : pêche, rose, or (sunset LA / lowrider).
 */
export const decorNeonVisual = {
  hub: ['rgba(127, 29, 29, 0.16)', 'rgba(245, 158, 11, 0.08)', 'rgba(10, 4, 4, 0.24)'] as const,
  gerant: ['rgba(127, 29, 29, 0.18)', 'rgba(251, 146, 60, 0.08)', 'rgba(10, 4, 4, 0.22)'] as const,
  client: [
    'rgba(185, 28, 28, 0.2)',
    'rgba(250, 204, 21, 0.06)',
    'rgba(10, 4, 4, 0.24)',
  ] as const,
  livreur: ['rgba(127, 29, 29, 0.18)', 'rgba(94, 234, 212, 0.06)', 'rgba(10, 4, 4, 0.22)'] as const,
  assistant: ['transparent', 'rgba(232, 121, 249, 0.08)', 'rgba(251, 146, 60, 0.06)'] as const,
} as const;
