import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { OtaUpdateSection } from '@/components/OtaUpdateSection';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AUTONOMOUS_PACE_ORDER, AUTONOMOUS_PACE_PRESETS } from '@/constants/autonomousDelivery';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { useHuskoStore } from '@/stores/useHuskoStore';

export default function ReglagesScreen() {
  const managerPin = useHuskoStore((s) => s.managerPin);
  const setManagerPin = useHuskoStore((s) => s.setManagerPin);
  const notificationsEnabled = useHuskoStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useHuskoStore((s) => s.setNotificationsEnabled);
  const autonomousDemoEnabled = useHuskoStore((s) => s.autonomousDemoEnabled);
  const setAutonomousDemoEnabled = useHuskoStore((s) => s.setAutonomousDemoEnabled);
  const autonomousPacePreset = useHuskoStore((s) => s.autonomousPacePreset);
  const setAutonomousPacePreset = useHuskoStore((s) => s.setAutonomousPacePreset);

  const [pin, setPin] = useState(managerPin);

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <Text style={[wcSectionLabel, styles.sectionFirst]}>Mode autonome (démo)</Text>
        <Text style={[typography.bodyMuted, styles.autoHint]}>
          Avance seul les commandes jusqu’à « Livrée » (l’app gérant doit rester ouverte). Choisissez le
          rythme entre chaque étape.
        </Text>
        <View style={styles.row}>
          <Text style={typography.body}>Activer</Text>
          <Switch
            value={autonomousDemoEnabled}
            onValueChange={setAutonomousDemoEnabled}
            trackColor={{ false: '#333', true: colors.accentDim }}
          />
        </View>
        {AUTONOMOUS_PACE_ORDER.map((id) => {
          const p = AUTONOMOUS_PACE_PRESETS[id];
          const selected = autonomousPacePreset === id;
          return (
            <Pressable
              key={id}
              onPress={() => setAutonomousPacePreset(id)}
              style={[styles.presetRow, selected && styles.presetRowOn]}
            >
              <Text style={[typography.body, selected && styles.presetLabelOn]}>{p.label}</Text>
              <Text style={typography.caption}>{p.hint}</Text>
            </Pressable>
          );
        })}
        {isRemoteSyncEnabled() ? (
          <Text style={[typography.caption, styles.syncEta]}>
            Avec Firebase, le client voit le temps estimé aligné sur ce rythme.
          </Text>
        ) : (
          <Text style={[typography.caption, styles.syncEta]}>
            Sans Firebase, le minuteur tourne sur cet appareil ; le client ne reçoit pas l’ETA auto.
          </Text>
        )}

        <Text style={[wcSectionLabel, styles.sectionSpaced]}>PIN gérant</Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <PrimaryButton title="Enregistrer" onPress={() => setManagerPin(pin)} />

        <View style={styles.row}>
          <Text style={typography.body}>Notifications locales</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#333', true: colors.accentDim }}
          />
        </View>

        <Text style={[typography.caption, styles.pinNote]}>
          Vous pouvez changer le code gérant ici à tout moment (déjà obligatoire à la 1ʳᵉ connexion).
        </Text>
        <OtaUpdateSection />
        <DeploymentHints mode="settings" style={styles.hintBlock} />
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent', padding: spacing.md, gap: spacing.md },
  sectionFirst: { marginBottom: spacing.sm },
  autoHint: { marginBottom: spacing.xs },
  presetRow: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: colors.cardElevated,
    marginTop: spacing.sm,
    opacity: 1,
  },
  presetRowOn: {
    borderColor: WC.neonCyan,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  presetLabelOn: { color: colors.gold, fontWeight: '800' },
  syncEta: { marginTop: spacing.sm, color: colors.textMuted },
  sectionSpaced: { marginTop: spacing.lg },
  input: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  pinNote: { marginTop: spacing.md, color: colors.textMuted },
  hintBlock: { marginTop: spacing.lg },
});
