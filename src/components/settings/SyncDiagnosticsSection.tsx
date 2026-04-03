import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { typography } from '@/constants/typography';
import { colors, spacing } from '@/constants/theme';
import { debugFirebaseProjectId, isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { useHuskoStore } from '@/stores/useHuskoStore';

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
        subtitle="Non disponible : ce build n’embarque pas les clés Firebase."
      >
        <Text style={[typography.caption, styles.muted]}>
          Installez un APK avec Firebase (voir DEPLOIEMENT.md) pour voir le projet et les compteurs
          listener.
        </Text>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Diagnostic synchro"
      subtitle="Comparez le projectId avec la console Firebase et l’autre téléphone. Si la console montre des documents mais que « parsés » reste bas, un document est rejeté par le parseur."
    >
      <Text style={styles.mono}>projectId · {projectId ?? '—'}</Text>
      {cloudSyncWriteError ? (
        <Text style={[typography.caption, styles.err]} selectable>
          Écriture : {cloudSyncWriteError}
        </Text>
      ) : (
        <Text style={[typography.caption, styles.ok]}>Écriture : aucune erreur signalée</Text>
      )}
      {cloudSyncListenError ? (
        <Text style={[typography.caption, styles.err]} selectable>
          Listener : {cloudSyncListenError}
        </Text>
      ) : (
        <Text style={[typography.caption, styles.ok]}>Listener : aucune erreur signalée</Text>
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
        Collez le JSON dans le chat support ou gardez-le avec une capture de la console Firebase.
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
  ok: { color: 'rgba(120, 220, 160, 0.95)', marginBottom: spacing.xs },
  err: { color: 'rgba(255, 160, 160, 0.95)', marginBottom: spacing.xs },
  label: { fontWeight: '800', marginBottom: 4, color: colors.goldDim },
  block: { marginTop: spacing.sm, gap: 4 },
  copyBtn: { marginTop: spacing.md },
});
