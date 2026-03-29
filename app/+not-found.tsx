import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <HuskoBackground>
      <View style={styles.root}>
        <Text style={typography.body}>Page introuvable.</Text>
        <Link href="/" asChild>
          <PrimaryButton title="Accueil" />
        </Link>
      </View>
    </HuskoBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
