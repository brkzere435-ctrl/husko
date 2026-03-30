import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { typography } from '@/constants/typography';
import { colors, spacing } from '@/constants/theme';
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
      <View style={[styles.alerts, style]}>
        {!remote ? (
          <Text style={[typography.caption, styles.warn]}>
            Liaison cloud inactive : commandes et position restent sur cet appareil. Voir env.example.
          </Text>
        ) : null}
        {showMapsLine ? (
          <Text style={[typography.caption, styles.warn, !remote && styles.gap]}>
            Carte : clés Google Maps manquantes dans ce build — configurez EXPO_PUBLIC_GOOGLE_MAPS_* puis
            rebuild.
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.settings, style]}>
      <Text style={[typography.caption, styles.hint]}>
        {remote
          ? 'Liaison cloud Firebase active : commandes et livreur synchronisés entre appareils (APK unifié hub ou apps mono-rôle).'
          : 'Sans Firebase (voir env.example + DEPLOIEMENT.md), les données restent sur cet appareil.'}
      </Text>
      {showMapsLine ? (
        <Text style={[typography.caption, styles.hint]}>
          Carte Google : définir EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY / IOS dans .env ou secrets EAS,
          puis refaire un build natif.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  settings: { gap: spacing.md },
  hint: { color: colors.textMuted },
  alerts: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.mapOverlay },
  warn: { color: colors.goldDim, fontSize: 12, lineHeight: 17 },
  gap: { marginTop: spacing.xs },
});
