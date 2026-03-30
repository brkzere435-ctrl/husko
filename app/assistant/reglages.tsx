import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { OtaUpdateSection } from '@/components/OtaUpdateSection';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/theme';

export default function AssistantReglagesScreen() {
  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={typography.section}>Copilote Husko</Text>
            <Text style={[typography.caption, styles.muted]}>
              Vérifiez les mises à jour JS sans réinstaller l’app (build EAS + canal).
            </Text>
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
  intro: { gap: spacing.xs, marginBottom: spacing.xs },
  muted: { color: '#b8a8a8', lineHeight: 18 },
  hint: { marginTop: spacing.sm },
});
