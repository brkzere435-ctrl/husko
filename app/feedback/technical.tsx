import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { typography } from '@/constants/typography';
import { colors, spacing } from '@/constants/theme';
import { useTechnicalFeedbackStore } from '@/stores/technicalFeedbackStore';

export default function TechnicalFeedbackScreen() {
  const payload = useTechnicalFeedbackStore((s) => s.payload);
  const setPayload = useTechnicalFeedbackStore((s) => s.setPayload);

  useEffect(() => {
    if (!payload) {
      router.back();
    }
  }, [payload]);

  if (!payload) {
    return null;
  }

  const { title, body, detail } = payload;

  function close() {
    setPayload(null);
    router.back();
  }

  return (
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[typography.title, styles.title]}>{title}</Text>
          <Text style={[typography.bodyMuted, styles.body]}>{body}</Text>
          {__DEV__ && detail ? (
            <View style={styles.devBox}>
              <Text style={styles.devLabel}>Détail (dev)</Text>
              <Text selectable style={styles.devText}>
                {detail}
              </Text>
            </View>
          ) : null}
          <PrimaryButton title="Retour" onPress={close} style={styles.btn} />
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md },
  title: { marginBottom: spacing.sm },
  body: { lineHeight: 22 },
  devBox: {
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  devLabel: { color: colors.goldDim, fontSize: 11, fontWeight: '800', marginBottom: 6 },
  devText: { color: colors.textMuted, fontSize: 11, fontFamily: 'monospace' },
  btn: { marginTop: spacing.lg },
});
