import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { deploymentHintsVisual } from '@/constants/infraAlertsVisual';
import { FONT } from '@/constants/fonts';
import { colors, spacing } from '@/constants/theme';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';

type Variant = 'client' | 'gerant';

const COPY: Record<
  Variant,
  { title: string; body: string }
> = {
  client: {
    title: 'Liaison cloud inactive',
    body:
      'Cette APK n’embarque pas Firebase : les commandes restent sur ce téléphone — le gérant ne les reçoit pas. ' +
      'Sur ton PC : npm run eas:sync:firebase puis rebuild l’APK client (mêmes secrets que le .env). Voir DEPLOIEMENT.md.',
  },
  gerant: {
    title: 'Liaison cloud inactive',
    body:
      'Sans Firebase dans ce build, les commandes passées sur d’autres téléphones n’apparaissent pas ici. ' +
      'eas:sync:firebase + rebuild l’APK gérant.',
  },
};

/**
 * Bandeau pleine largeur si le build n’a pas les clés Firebase — explique pourquoi le multi-appareils « ne marche pas ».
 */
export function CloudLinkBanner({ variant }: { variant: Variant }) {
  const insets = useSafeAreaInsets();
  if (isRemoteSyncEnabled()) return null;

  const { title, body } = COPY[variant];

  return (
    <View
      style={[styles.bar, { paddingTop: Math.max(insets.top, spacing.sm) }]}
      accessibilityRole="alert"
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: deploymentHintsVisual.alertFirebaseBg,
    borderBottomWidth: 2,
    borderBottomColor: deploymentHintsVisual.alertFirebaseBorder,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.gold,
    marginBottom: 6,
  },
  body: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
    color: colors.goldDim,
  },
});
