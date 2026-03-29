import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { typography } from '@/constants/typography';
import { colors, spacing, surface } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <HuskoBackground>
      <View style={styles.root}>
        <View style={[surface.glass, styles.card]}>
          <View style={styles.iconWrap}>
            <Ionicons name="compass-outline" size={40} color={colors.gold} />
          </View>
          <Text style={styles.code}>404</Text>
          <Text style={typography.title}>Page introuvable</Text>
          <Text style={[typography.bodyMuted, styles.body]}>
            Ce chemin n’existe pas dans Husko, ou le lien a expiré. Retourne à l’accueil pour choisir
            Client, Livreur, Gérant ou Assistant.
          </Text>
          <Link href="/" asChild>
            <PrimaryButton title="Retour à l’accueil" style={styles.btn} />
          </Link>
        </View>
      </View>
    </HuskoBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
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
    fontWeight: '900',
    letterSpacing: 4,
    color: colors.goldDim,
  },
  body: { textAlign: 'center', lineHeight: 22, maxWidth: 320 },
  btn: { width: '100%', marginTop: spacing.sm },
});
