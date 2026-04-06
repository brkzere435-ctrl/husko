/**
 * Voiles néon diagonaux (3 stops) — `DECOR_PRESETS` / `WestCoastBackground`.
 * Teintes « golden hour » : pêche, rose, or (sunset LA / lowrider).
 */
export const decorNeonVisual = {
  hub: ['transparent', 'rgba(253, 186, 116, 0.1)', 'rgba(232, 121, 249, 0.07)'] as const,
  gerant: ['transparent', 'rgba(251, 146, 60, 0.08)', 'rgba(253, 224, 71, 0.07)'] as const,
  client: [
    'rgba(185, 28, 28, 0.14)',
    'rgba(10, 4, 4, 0.22)',
    'rgba(127, 29, 29, 0.16)',
  ] as const,
  livreur: ['transparent', 'rgba(253, 186, 116, 0.09)', 'rgba(94, 234, 212, 0.08)'] as const,
  assistant: ['transparent', 'rgba(232, 121, 249, 0.08)', 'rgba(251, 146, 60, 0.06)'] as const,
} as const;
