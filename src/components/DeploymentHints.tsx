import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { deploymentHintsVisual } from '@/constants/infraAlertsVisual';
import { colors, radius, spacing } from '@/constants/theme';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { isMapsKeyConfiguredForPlatform } from '@/utils/mapsBuildInfo';

type Mode = 'settings' | 'alerts';

type Props = {
  mode?: Mode;
  /** Mode alerts : n’affiche l’avertissement carte que si true (ex. carte visible au suivi). */
  mapsRelevant?: boolean;
  style?: ViewStyle;
};

/**
 * Statut liaison Firebase + clés Google Maps (build).
 * - settings : toujours le paragraphe Firebase + carte si clé manquante (écran réglages).
 * - alerts : uniquement si problème (bandeau discret ailleurs).
 */
export function DeploymentHints({ mode = 'settings', mapsRelevant = true, style }: Props) {
  const remote = isRemoteSyncEnabled();
  const mapsOk = isMapsKeyConfiguredForPlatform();
  const native = Platform.OS !== 'web';
  const showMapsLine = native && !mapsOk && (mode === 'settings' || (mode === 'alerts' && mapsRelevant));

  if (mode === 'alerts') {
    if (remote && !showMapsLine) return null;
    return (
      <View style={[styles.alerts, style]} accessibilityLabel="Avertissements connexion et carte">
        {!remote ? (
          <View style={styles.alertFirebase} accessibilityRole="alert">
            <Text style={[typography.caption, styles.warnTitle]}>Commandes entre appareils</Text>
            <Text style={[typography.caption, styles.warn]}>
              La liaison avec le restaurant en ligne n’est pas active sur cette installation : les
              commandes restent sur ce téléphone. Pour un test multi-téléphones, utilisez une version
              fournie par l’équipe avec la configuration adaptée.
            </Text>
          </View>
        ) : null}
        {showMapsLine ? (
          <View style={[styles.alertMaps, !remote && styles.alertGap]} accessibilityRole="alert">
            <Text style={[typography.caption, styles.warnTitle]}>Carte</Text>
            <Text style={[typography.caption, styles.warn]}>
              Mode radar GTA (contours néon) : normal sans clé Google Maps dans le build. Tuiles
              réelles + style nuit : ajoute EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY, eas:sync:maps,
              puis rebuild APK (l’OTA JS ne suffit pas).
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.settings, style]}>
      <Text style={[typography.caption, styles.hint]}>
        {remote
          ? 'Lorsque le réseau est disponible, les commandes et le suivi peuvent être partagés entre les appareils du restaurant.'
          : 'Mode hors ligne étendu : les commandes enregistrées sur cet appareil ne sont pas envoyées aux autres téléphones.'}
      </Text>
      {showMapsLine ? (
        <Text style={[typography.caption, styles.hint]}>
          Mini-carte : mode radar GTA (contours néon) tant que la clé Google Maps n’est pas dans
          l’APK. Clé + eas:sync:maps + rebuild pour les tuiles et le style nuit.
        </Text>
      ) : null}
      {__DEV__ && !remote ? (
        <Text style={[typography.caption, styles.hintDev]}>
          [Dev] Clés cloud absentes au build — eas:sync:firebase + rebuild pour multi-appareils.
        </Text>
      ) : null}
      {__DEV__ && showMapsLine ? (
        <Text style={[typography.caption, styles.hintDev]}>
          [Dev] Clés Maps : .env / EAS, rebuild natif — restrictions SHA-1 / package.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  settings: { gap: spacing.md, alignSelf: 'stretch', width: '100%' },
  hint: { color: colors.textMuted, flexShrink: 1 },
  hintDev: { color: deploymentHintsVisual.hintDev, fontSize: 11, flexShrink: 1 },
  alerts: { gap: spacing.sm, alignSelf: 'stretch', width: '100%' },
  alertFirebase: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: deploymentHintsVisual.alertFirebaseBg,
    borderLeftWidth: 3,
    borderLeftColor: deploymentHintsVisual.alertFirebaseBorder,
    gap: spacing.xs,
  },
  alertMaps: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.mapOverlay,
    borderLeftWidth: 3,
    borderLeftColor: deploymentHintsVisual.alertMapsBorder,
    gap: spacing.xs,
  },
  alertGap: { marginTop: spacing.xs },
  warnTitle: {
    fontFamily: FONT.bold,
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  warn: { color: colors.goldDim, fontSize: 12, lineHeight: 17, flexShrink: 1 },
  warnMuted: { color: colors.textMuted, fontSize: 11, lineHeight: 16, flexShrink: 1 },
});

