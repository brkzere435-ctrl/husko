import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { OtaUpdateSection } from '@/components/OtaUpdateSection';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/theme';
import { VENUE_TAGLINE_CLIENT } from '@/constants/venue';
import { WC } from '@/constants/westCoastTheme';

export default function ClientReglagesScreen() {
  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.brand}>Husko</Text>
            <Text style={styles.tag}>{VENUE_TAGLINE_CLIENT}</Text>
          </View>
          <OtaUpdateSection />
          <DeploymentHints mode="settings" mapsRelevant={false} style={styles.hint} />
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  hero: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WC.neonCyanDim,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginBottom: spacing.xs,
  },
  brand: {
    ...typography.title,
    color: WC.white,
    fontWeight: '900',
    letterSpacing: 4,
  },
  tag: { ...typography.bodyMuted, marginTop: spacing.xs, color: WC.gold },
  hint: { marginTop: spacing.sm },
});
