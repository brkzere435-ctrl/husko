import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { DeploymentHints } from '@/components/DeploymentHints';
import { OtaUpdateSection } from '@/components/OtaUpdateSection';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SettingsSection, SettingsSwitchRow } from '@/components/settings/SettingsSection';
import { SyncDiagnosticsSection } from '@/components/settings/SyncDiagnosticsSection';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { AUTONOMOUS_PACE_ORDER, AUTONOMOUS_PACE_PRESETS } from '@/constants/autonomousDelivery';
import { getAppVariant } from '@/constants/appVariant';
import { gerantDashboardVisual } from '@/constants/gerantDashboardVisual';
import { FONT } from '@/constants/fonts';
import { isDeliveryOpen } from '@/constants/hours';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { interpretGerantFieldDiagnostic } from '@/utils/interpretGerantFieldDiagnostic';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';
import { hapticLight } from '@/utils/haptics';

/** Outils support visibles uniquement en mode debug/support. */
function FieldDiagnosticsSection() {
  const { width, height } = useWindowDimensions();
  const payload = useMemo(
    () => ({
      hypothesisId: 'H1-field',
      applicationId: Application.applicationId ?? null,
      resolvedVariant: getAppVariant(),
      extraAppVariant: readHuskoExpoExtra().appVariant,
      screen: { w: Math.round(width), h: Math.round(height) },
    }),
    [width, height]
  );
  const display = useMemo(() => JSON.stringify(payload, null, 2), [payload]);
  const interpretation = useMemo(() => interpretGerantFieldDiagnostic(payload), [payload]);
  const interpColor =
    interpretation.severity === 'error'
      ? colors.posterRed
      : interpretation.severity === 'warn'
        ? colors.gold
        : colors.textMuted;

  return (
    <SettingsSection
      title="Diagnostic terrain"
      subtitle="Bloc réservé au support technique."
    >
      <Text style={{ fontSize: 11, fontFamily: FONT.bold, color: interpColor, marginBottom: spacing.xs }}>
        Synthèse ({interpretation.severity})
      </Text>
      {interpretation.lines.map((line, i) => (
        <Text
          key={i}
          style={{ fontSize: 12, lineHeight: 18, color: colors.textMuted, marginBottom: spacing.xs }}
        >
          {line}
        </Text>
      ))}
      <Text
        selectable
        style={{ fontFamily: 'monospace', fontSize: 11, color: colors.textMuted, lineHeight: 16 }}
      >
        {display}
      </Text>
      <PrimaryButton
        title="Copier JSON diagnostic"
        variant="ghost"
        onPress={() => {
          const line = JSON.stringify({ ...payload, ts: Date.now() });
          void Clipboard.setStringAsync(line).then(() => hapticLight());
        }}
      />
    </SettingsSection>
  );
}

export default function ReglagesScreen() {
  const managerPin = useHuskoStore((s) => s.managerPin);
  const setManagerPin = useHuskoStore((s) => s.setManagerPin);
  const notificationsEnabled = useHuskoStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useHuskoStore((s) => s.setNotificationsEnabled);
  const autonomousDemoEnabled = useHuskoStore((s) => s.autonomousDemoEnabled);
  const setAutonomousDemoEnabled = useHuskoStore((s) => s.setAutonomousDemoEnabled);
  const autonomousPacePreset = useHuskoStore((s) => s.autonomousPacePreset);
  const setAutonomousPacePreset = useHuskoStore((s) => s.setAutonomousPacePreset);
  const remoteServiceAccepting = useHuskoStore((s) => s.remoteServiceAccepting);

  const [pin, setPin] = useState(managerPin);

  const showFieldDiagnostics = process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1';
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a64698'},body:JSON.stringify({sessionId:'a64698',runId:'run-verify-ota',hypothesisId:'H22',location:'app/gerant/reglages.tsx:mounted',message:'gerant settings mounted',data:{codeSignature:'gerant-settings-live-v2',showFieldDiagnostics,serviceState:remoteServiceAccepting,syncState:isRemoteSyncEnabled()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [showFieldDiagnostics, remoteServiceAccepting]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a64698'},body:JSON.stringify({sessionId:'a64698',runId:'run-nochange',hypothesisId:'H3',location:'app/gerant/reglages.tsx:render-signature',message:'gerant settings signature',data:{codeSignature:'gerant-settings-live-v1',showFieldDiagnostics,serviceState:remoteServiceAccepting,isRemoteSyncEnabled:isRemoteSyncEnabled()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [showFieldDiagnostics, remoteServiceAccepting]);

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle} accessibilityRole="header">
            Réglages gérant
          </Text>
          <Text style={[typography.bodyMuted, styles.screenSubtitle]}>
            Mode démo, sécurité et notifications — tout au même endroit.
          </Text>

          <SettingsSection
            title="Service en direct"
            subtitle="Vue rapide de l’ouverture des commandes et de la synchronisation."
          >
            <View style={styles.statusRow}>
              <Text style={typography.body}>Prise de commandes</Text>
              <Text
                style={[
                  typography.body,
                  remoteServiceAccepting === false ? styles.statusOff : styles.statusOn,
                ]}
              >
                {remoteServiceAccepting === null
                  ? isDeliveryOpen() ? 'Ouvert (horaire)' : 'Fermé (horaire)'
                  : remoteServiceAccepting ? 'Ouvert' : 'Fermé'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={typography.body}>Synchronisation</Text>
              <Text style={[typography.body, isRemoteSyncEnabled() ? styles.statusOn : styles.statusOff]}>
                {isRemoteSyncEnabled() ? 'Active' : 'Locale'}
              </Text>
            </View>
            <Text style={[typography.caption, styles.statusHint]}>
              Pour changer l’état d’ouverture, utilisez les boutons en haut de l’accueil gérant.
            </Text>
          </SettingsSection>

          <SettingsSection
            title="Raccourcis"
            subtitle="Accès rapide aux écrans métier sans repasser par l’accueil."
          >
            <Link href="/gerant/historique" asChild>
              <Pressable
                style={({ pressed }) => [styles.shortcut, pressed && styles.shortcutPressed]}
                accessibilityRole="button"
                accessibilityLabel="Ouvrir l’historique des commandes"
              >
                <Text style={styles.shortcutTitle}>Historique</Text>
                <Text style={typography.caption}>Commandes passées et statuts</Text>
              </Pressable>
            </Link>
            <Link href="/gerant/distribution" asChild>
              <Pressable
                style={({ pressed }) => [styles.shortcut, pressed && styles.shortcutPressed]}
                accessibilityRole="button"
                accessibilityLabel="Ouvrir la distribution QR"
              >
                <Text style={styles.shortcutTitle}>Distribution QR</Text>
                <Text style={typography.caption}>Partage des liens d’installation de l’équipe</Text>
              </Pressable>
            </Link>
          </SettingsSection>

          <SettingsSection
            title="Mode autonome (démo)"
            subtitle="Avance seul les commandes jusqu’à « Livrée » (l’app gérant doit rester ouverte). Choisissez le rythme entre chaque étape."
          >
            <SettingsSwitchRow
              label="Activer le mode autonome"
              value={autonomousDemoEnabled}
              onValueChange={setAutonomousDemoEnabled}
            />
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
                Avec la synchronisation active, le client voit le temps estimé aligné sur ce rythme.
              </Text>
            ) : (
              <Text style={[typography.caption, styles.syncEta]}>
                Sans synchronisation active, le minuteur tourne sur cet appareil ; le client ne reçoit pas l’ETA
                auto.
              </Text>
            )}
          </SettingsSection>

          <SettingsSection title="PIN gérant" subtitle="Code pour déverrouiller l’app gérant.">
            <TextInput
              mode="outlined"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              placeholderTextColor={colors.textMuted}
              textColor={colors.text}
              outlineColor={colors.border}
              activeOutlineColor={colors.accent}
              style={styles.input}
            />
            <PrimaryButton title="Enregistrer le PIN" onPress={() => setManagerPin(pin)} />
            <Text style={[typography.caption, styles.pinNote]}>
              Vous pouvez changer le code ici à tout moment (déjà obligatoire à la 1ʳᵉ connexion).
            </Text>
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            subtitle="Alertes locales pour nouvelles commandes et étapes (selon les événements Husko)."
          >
            <SettingsSwitchRow
              label="Notifications locales"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              hint="Désactiver si vous préférez uniquement les alertes dans l’app ouverte."
            />
          </SettingsSection>

          {showFieldDiagnostics ? <FieldDiagnosticsSection /> : null}
          <SyncDiagnosticsSection />
          <OtaUpdateSection />
          <DeploymentHints mode="settings" style={styles.hintBlock} />
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
    letterSpacing: 0.5,
  },
  screenSubtitle: { marginBottom: spacing.sm, lineHeight: 20 },
  shortcut: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: gerantDashboardVisual.reglagesShortcutBg,
    gap: spacing.xs,
  },
  shortcutPressed: { opacity: 0.85 },
  shortcutTitle: { ...typography.body, fontFamily: FONT.bold, fontWeight: '800', color: WC.gold },
  presetRow: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: colors.cardElevated,
    marginTop: spacing.xs,
  },
  presetRowOn: {
    borderColor: WC.neonCyan,
    backgroundColor: gerantDashboardVisual.reglagesPresetSelectedBg,
  },
  presetLabelOn: { color: colors.gold, fontFamily: FONT.bold, fontWeight: '800' },
  syncEta: { marginTop: spacing.sm, color: colors.textMuted, lineHeight: 18 },
  input: {
    marginTop: spacing.xs,
    backgroundColor: colors.cardElevated,
  },
  pinNote: { marginTop: spacing.sm, color: colors.textMuted, lineHeight: 18 },
  hintBlock: { marginTop: spacing.sm },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusOn: { color: WC.neonCyan, fontFamily: FONT.bold, fontWeight: '800' },
  statusOff: { color: colors.textMuted, fontFamily: FONT.medium, fontWeight: '700' },
  statusHint: { marginTop: spacing.xs, color: colors.textMuted, lineHeight: 18 },
});
