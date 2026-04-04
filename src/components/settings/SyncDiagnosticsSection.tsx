import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { syncDiagnosticsToneVisual } from '@/constants/infraAlertsVisual';
import { typography } from '@/constants/typography';
import { colors, spacing } from '@/constants/theme';
import { debugFirebaseProjectId, isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatCloudSyncErrorForUser } from '@/utils/cloudSyncUserMessage';

/**
 * Diagnostic synchro Firestore (plan : interpréter H1–H4 sans Metro).
 * Visible dans Réglages client / gérant lorsque Firebase est actif dans le build.
 */
export function SyncDiagnosticsSection() {
  const cloudSyncWriteError = useHuskoStore((s) => s.cloudSyncWriteError);
  const cloudSyncListenError = useHuskoStore((s) => s.cloudSyncListenError);
  const ordersSyncDebug = useHuskoStore((s) => s.ordersSyncDebug);
  const remote = isRemoteSyncEnabled();
  const projectId = debugFirebaseProjectId();
  const [copied, setCopied] = useState(false);

  async function copyReport() {
    const payload = {
      generatedAt: new Date().toISOString(),
      projectId: projectId ?? null,
      cloudSyncWriteError: cloudSyncWriteError ?? null,
      cloudSyncListenError: cloudSyncListenError ?? null,
      ordersSyncDebug: ordersSyncDebug ?? null,
      hint:
        'Comparer avec la console Firebase → Firestore → orders (document HK-… au moment de la commande).',
    };
    await Clipboard.setStringAsync(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!remote) {
    return (
      <SettingsSection
        title="Diagnostic synchro"
        subtitle="Réservé aux installations avec service en ligne activé."
      >
        <Text style={[typography.caption, styles.muted]}>
          Cette version n’affiche pas les détails de synchronisation entre appareils. Utilisez le build
          fourni par l’équipe pour un test multi-téléphones.
        </Text>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Diagnostic synchro"
      subtitle="État technique pour le support. Les clients voient un message court en cas de problème réseau."
    >
      <Text style={styles.mono}>projectId · {projectId ?? '—'}</Text>
      {cloudSyncWriteError ? (
        <View style={styles.errBlock}>
          <Text style={[typography.caption, styles.err]} selectable>
            Écriture (affichage app) : {formatCloudSyncErrorForUser(cloudSyncWriteError) ?? '—'}
          </Text>
          <Text style={[styles.mono, styles.monoMuted]} selectable>
            Détail technique : {cloudSyncWriteError}
          </Text>
        </View>
      ) : (
        <Text style={[typography.caption, styles.ok]}>Écriture : aucune erreur signalée</Text>
      )}
      {cloudSyncListenError ? (
        <View style={styles.errBlock}>
          <Text style={[typography.caption, styles.err]} selectable>
            Réception (affichage app) : {formatCloudSyncErrorForUser(cloudSyncListenError) ?? '—'}
          </Text>
          <Text style={[styles.mono, styles.monoMuted]} selectable>
            Détail technique : {cloudSyncListenError}
          </Text>
        </View>
      ) : (
        <Text style={[typography.caption, styles.ok]}>Réception : aucune erreur signalée</Text>
      )}
      {ordersSyncDebug ? (
        <View style={styles.block}>
          <Text style={[typography.caption, styles.label]}>Dernier snapshot + fusion</Text>
          <Text style={styles.mono} selectable>
            snap docs Firestore : {ordersSyncDebug.snapDocCount} · parsés (OK) :{' '}
            {ordersSyncDebug.coercedCount}
          </Text>
          <Text style={styles.mono} selectable>
            fusion remote / local / merged : {ordersSyncDebug.lastMerge.remoteN} ·{' '}
            {ordersSyncDebug.lastMerge.localN} · {ordersSyncDebug.lastMerge.mergedN}
          </Text>
          <Text style={[typography.caption, styles.muted]} selectable>
            ids (échantillon) : {ordersSyncDebug.sampleIds.length ? ordersSyncDebug.sampleIds.join(', ') : '—'}
          </Text>
          <Text style={[typography.caption, styles.muted]}>
            Mis à jour : {new Date(ordersSyncDebug.updatedAt).toLocaleString()}
          </Text>
        </View>
      ) : (
        <Text style={[typography.caption, styles.muted]}>
          Pas encore de snapshot `orders` reçu sur cet appareil (ouverture récente).
        </Text>
      )}
      <PrimaryButton
        title={copied ? 'Rapport copié' : 'Copier le rapport (JSON)'}
        variant="ghost"
        onPress={() => void copyReport()}
        style={styles.copyBtn}
      />
      <Text style={[typography.caption, styles.muted]}>
        Collez le rapport pour le support (inclut le détail technique).
      </Text>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  mono: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  muted: { color: colors.textMuted, lineHeight: 18 },
  ok: { color: syncDiagnosticsToneVisual.ok, marginBottom: spacing.xs },
  err: { color: syncDiagnosticsToneVisual.err, marginBottom: spacing.xs },
  label: { fontWeight: '800', marginBottom: 4, color: colors.goldDim },
  block: { marginTop: spacing.sm, gap: 4 },
  copyBtn: { marginTop: spacing.md },
  errBlock: { marginBottom: spacing.xs, gap: 4 },
  monoMuted: { color: colors.textMuted, fontSize: 10, marginBottom: spacing.xs },
});
