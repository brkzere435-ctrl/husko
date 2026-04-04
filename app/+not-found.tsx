import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { colors, spacing, surface } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';

export default function NotFoundScreen() {
  return (
    <WestCoastBackground>
      <View style={styles.root}>
        <Card mode="elevated" style={[surface.glass, styles.card]}>
          <Card.Content style={styles.cardInner}>
            <View style={styles.iconWrap}>
              <Ionicons name="compass-outline" size={40} color={colors.gold} />
            </View>
            <Text variant="labelLarge" style={styles.code}>
              404
            </Text>
            <Text variant="headlineSmall" style={typography.title}>
              Page introuvable
            </Text>
            <Text variant="bodyMedium" style={[typography.bodyMuted, styles.body]}>
              Ce chemin n’existe pas dans Husko, ou le lien a expiré. Retourne à l’accueil pour choisir
              Client, Livreur, Gérant ou Assistant.
            </Text>
            <Link href="/" asChild>
              <PrimaryButton title="Retour à l’accueil" style={styles.btn} />
            </Link>
          </Card.Content>
        </Card>
      </View>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
  },
  cardInner: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(240, 208, 80, 0.1)',
    borderWidth: 1,
    borderColor: colors.borderGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: {
    fontSize: 13,
    fontFamily: FONT.bold,
    letterSpacing: 4,
    color: colors.goldDim,
  },
  body: { textAlign: 'center', lineHeight: 22, maxWidth: 320 },
  btn: { width: '100%', marginTop: spacing.sm },
});
