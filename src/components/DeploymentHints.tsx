import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { typography } from '@/constants/typography';
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
      <View style={[styles.alerts, style]} accessibilityLabel="État technique liaison Firebase et carte">
        {!remote ? (
          <View style={styles.alertFirebase} accessibilityRole="alert">
            <Text style={[typography.caption, styles.warnTitle]}>Firebase · synchro commandes</Text>
            <Text style={[typography.caption, styles.warn]}>
              Les commandes et le suivi livreur ne sont pas envoyés vers le restaurant sur les autres
              téléphones : cet APK n’a pas les clés Firebase du projet au moment du build. Ce message ne
              concerne pas la mini-carte au-dessus ou en dessous.
            </Text>
            <Text style={[typography.caption, styles.warnMuted]}>
              Côté équipe : secrets EAS (`eas:sync:firebase`) puis rebuild — voir DEPLOIEMENT.md. Rappel
              aussi sous « App & mises à jour ».
            </Text>
          </View>
        ) : null}
        {showMapsLine ? (
          <View style={[styles.alertMaps, !remote && styles.alertGap]} accessibilityRole="alert">
            <Text style={[typography.caption, styles.warnTitle]}>Google Maps · tuiles</Text>
            <Text style={[typography.caption, styles.warn]}>
              Clés absentes ou placeholder dans ce build — `eas:sync:maps`, rebuild natif. Tuiles grises
              avec clé : API Maps SDK, facturation, restrictions SHA-1 / package dans Google Cloud.
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
          ? 'Liaison cloud Firebase active : commandes et livreur synchronisés entre appareils (APK unifié hub ou apps mono-rôle).'
          : 'Sans Firebase au build, les données restent sur cet appareil (voir DEPLOIEMENT.md et secrets EAS).'}

      </Text>
      {showMapsLine ? (
        <Text style={[typography.caption, styles.hint]}>
          Carte Google : EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY / IOS dans .env ou secrets EAS, puis build
          natif. Si la carte reste grise : vérifier API Maps SDK, facturation et restrictions de clé (package /
          SHA-1). Voir docs/visuel-west-coast-checklist.md.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  settings: { gap: spacing.md, alignSelf: 'stretch', width: '100%' },
  hint: { color: colors.textMuted, flexShrink: 1 },
  alerts: { gap: spacing.sm, alignSelf: 'stretch', width: '100%' },
  alertFirebase: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(60, 15, 15, 0.92)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(248, 113, 113, 0.95)',
    gap: spacing.xs,
  },
  alertMaps: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.mapOverlay,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(34, 211, 238, 0.55)',
    gap: spacing.xs,
  },
  alertGap: { marginTop: spacing.xs },
  warnTitle: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  warn: { color: colors.goldDim, fontSize: 12, lineHeight: 17, flexShrink: 1 },
  warnMuted: { color: colors.textMuted, fontSize: 11, lineHeight: 16, flexShrink: 1 },
});

