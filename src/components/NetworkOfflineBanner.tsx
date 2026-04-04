import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { networkOfflineVisual } from '@/constants/infraAlertsVisual';
import { spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';

type Props = { visible: boolean };

/** Bannière discrète en tête d’app si pas de réseau (distinct des erreurs Firestore). */
export function NetworkOfflineBanner({ visible }: Props) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <View
      style={[styles.bar, { paddingTop: Math.max(insets.top, spacing.sm) }]}
      accessibilityRole="alert"
      accessibilityLabel="Pas de connexion réseau"
    >
      <Text style={[typography.caption, styles.title]}>Pas de connexion</Text>
      <Text style={styles.body}>
        Vérifiez le Wi‑Fi ou les données mobiles. Les commandes en ligne seront possibles dès le retour du
        réseau.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: networkOfflineVisual.barBg,
    borderBottomWidth: 1,
    borderBottomColor: networkOfflineVisual.barBorderBottom,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: FONT.bold,
    color: WC.gold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  body: {
    color: networkOfflineVisual.bodyText,
    fontSize: 12,
    lineHeight: 17,
  },
});
