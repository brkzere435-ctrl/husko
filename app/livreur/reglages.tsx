import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { OtaUpdateSection } from '@/components/OtaUpdateSection';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SettingsSection, SettingsSwitchRow } from '@/components/settings/SettingsSection';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { useHuskoStore } from '@/stores/useHuskoStore';

export default function LivreurReglagesScreen() {
  const livreurPin = useHuskoStore((s) => s.livreurPin);
  const setLivreurPin = useHuskoStore((s) => s.setLivreurPin);
  const notificationsEnabled = useHuskoStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useHuskoStore((s) => s.setNotificationsEnabled);
  const livreurOnline = useHuskoStore((s) => s.livreurOnline);

  const [pin, setPin] = useState(livreurPin);

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>Réglages livreur</Text>
          <Text style={[typography.bodyMuted, styles.screenSubtitle]}>
            Code d’accès, notifications, position et mises à jour — tout au même endroit.
          </Text>

          <SettingsSection
            title="Statut"
            subtitle="La position n’est partagée avec la cuisine et le client que lorsque vous êtes en ligne."
          >
            <View style={styles.statusRow}>
              <Text style={typography.body}>En ligne (carte)</Text>
              <Text style={[typography.body, livreurOnline ? styles.on : styles.off]}>
                {livreurOnline ? 'Oui' : 'Non'}
              </Text>
            </View>
            <Text style={[typography.caption, styles.muted]}>
              Activez « En ligne » sur l’écran Carte pour transmettre votre position et recevoir les
              courses. Vous pouvez le couper à tout moment.
            </Text>
            {isRemoteSyncEnabled() ? (
              <Text style={[typography.caption, styles.muted]}>
                Firebase actif : la position peut être visible côté client selon le flux de commande.
              </Text>
            ) : (
              <Text style={[typography.caption, styles.muted]}>
                Sans Firebase, la position reste locale à cet appareil.
              </Text>
            )}
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            subtitle="Alertes quand une commande est prête à enlever ou qu’une étape vous concerne."
          >
            <SettingsSwitchRow
              label="Notifications locales"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              hint="Désactiver si vous préférez uniquement les alertes avec l’app ouverte."
            />
          </SettingsSection>

          <SettingsSection
            title="Code livreur"
            subtitle="Code pour déverrouiller l’app livreur. Modifiable ici comme pour le gérant."
          >
            <TextInput
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <PrimaryButton title="Enregistrer le code" onPress={() => setLivreurPin(pin)} />
          </SettingsSection>

          <OtaUpdateSection />
          <DeploymentHints mode="settings" style={styles.hint} />
        </ScrollView>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  screenTitle: {
    ...typography.title,
    color: WC.white,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  screenSubtitle: { marginBottom: spacing.sm, lineHeight: 20 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  on: { color: WC.neonCyan, fontWeight: '800' },
  off: { color: colors.textMuted, fontWeight: '700' },
  muted: { color: colors.textMuted, lineHeight: 18 },
  input: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    fontSize: 16,
  },
  hint: { marginTop: spacing.sm },
});
