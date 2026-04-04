/**
 * Tokens visuels partagés — boutons primaires, section OTA, etc.
 */
import { appScreenVisual } from '@/constants/appScreenVisual';

export const componentsVisual = {
  primaryOuterBorder: 'rgba(253, 230, 138, 0.65)',
  ghostBg: 'rgba(255, 255, 255, 0.06)',
  ghostBorder: 'rgba(94, 234, 212, 0.28)',
  otaPillDevBg: 'rgba(34, 211, 238, 0.12)',
  otaPillDevBorder: 'rgba(34, 211, 238, 0.4)',
  otaPillReleaseBg: 'rgba(253, 230, 138, 0.1)',
  otaPillReleaseBorder: 'rgba(253, 230, 138, 0.35)',
  /** Alias — même overlay que raccourcis réglages. */
  otaHintBlockBg: appScreenVisual.overlay025,
} as const;
