import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { typography } from '@/constants/typography';
import { WC } from '@/constants/westCoastTheme';
import { spacing } from '@/constants/theme';

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
    backgroundColor: 'rgba(80, 25, 25, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(248, 113, 113, 0.45)',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    color: WC.gold,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  body: {
    color: 'rgba(254, 243, 199, 0.92)',
    fontSize: 12,
    lineHeight: 17,
  },
});
