import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { DeliveryFlowGuide } from '@/components/DeliveryFlowGuide';
import { FirstPinChangeForm } from '@/components/FirstPinChangeForm';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { OrderLinesPreview } from '@/components/OrderLinesPreview';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { getAppVariant } from '@/constants/appVariant';
import { AUTONOMOUS_PACE_PRESETS } from '@/constants/autonomousDelivery';
import { DEFAULT_ROLE_PIN } from '@/constants/devicePin';
import { isDeliveryOpen } from '@/constants/hours';
import { gerantDashboardVisual } from '@/constants/gerantDashboardVisual';
import { typography } from '@/constants/typography';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { colors, elevation, radius, spacing, surface } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import type { Order } from '@/stores/useHuskoStore';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatEuro } from '@/utils/formatEuro';
import { hapticLight } from '@/utils/haptics';
import { postSessionA64698Ingest } from '@/utils/debugIngestRuntime';
import { openSiblingApp } from '@/utils/siblingApps';

function GerantOrderActions({
  order,
  onActionError,
}: {
  order: Order;
  onActionError: (message: string) => void;
}) {
  const transitionOrder = useHuskoStore((s) => s.transitionOrder);

  if (order.status === 'pending') {
    return (
      <PrimaryButton
        title="Valider · en préparation"
        variant="ghost"
        style={styles.actionFull}
        onPress={() => {
          const ok = transitionOrder(order.id, 'preparing', 'gerant');
          if (!ok) {
            onActionError('La commande doit être « en attente » pour être validée.');
          }
          else hapticLight();
        }}
      />
    );
  }
  if (order.status === 'preparing') {
    return (
      <PrimaryButton
        title="Transmettre au livreur"
        variant="ghost"
        style={styles.actionFull}
        onPress={() => {
          const ok = transitionOrder(order.id, 'awaiting_livreur', 'gerant');
          if (!ok) {
            onActionError('La commande doit être « en préparation » avant transmission au livreur.');
          }
          else hapticLight();
        }}
      />
    );
  }
  return (
    <Text variant="bodySmall" style={typography.caption}>
      {order.status === 'awaiting_livreur'
        ? 'En attente du livreur (app Livreur : « Prendre en charge »).'
        : order.status === 'on_way'
          ? 'Livreur en route — il confirme la livraison dans son app pour clôturer.'
          : '—'}
    </Text>
  );
}

export default function GerantDashboardScreen() {
  const supportDebugEnabled =
    __DEV__ || process.env.EXPO_PUBLIC_HUSKO_DEBUG_BOOT === '1';
  const variant = getAppVariant();
  const orders = useHuskoStore((s) => s.orders);
  const autonomousDemoEnabled = useHuskoStore((s) => s.autonomousDemoEnabled);
  const autonomousPacePreset = useHuskoStore((s) => s.autonomousPacePreset);
  const managerPin = useHuskoStore((s) => s.managerPin);
  const gerantPinOnboarded = useHuskoStore((s) => s.gerantPinOnboarded);
  const completeGerantPinSetup = useHuskoStore((s) => s.completeGerantPinSetup);
  const remoteServiceAccepting = useHuskoStore((s) => s.remoteServiceAccepting);
  const pushRemoteServiceAccepting = useHuskoStore((s) => s.pushRemoteServiceAccepting);

  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [snack, setSnack] = useState('');
  const [serviceBusy, setServiceBusy] = useState(false);

  useEffect(() => {
    if (!supportDebugEnabled) return;
    // #region agent log
    postSessionA64698Ingest({
      location: 'app/gerant/index.tsx:GerantDashboardScreen',
      message: 'dashboard state',
      data: {
        variant,
        siblingBlockVisible: variant === 'gerant',
        unlocked,
      },
      runId: 'pre',
      hypothesisId: 'H3',
    });
    console.warn(
      '[HUSKO_DEBUG_a64698_H3]',
      JSON.stringify({
        variant,
        siblingBlockVisible: variant === 'gerant',
        unlocked,
      })
    );
    // #endregion
  }, [supportDebugEnabled, variant, unlocked]);

  const live = useMemo(
    () => orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled'),
    [orders]
  );

  function unlock() {
    if (pin === managerPin) setUnlocked(true);
    else setSnack('Code incorrect');
  }

  if (!unlocked) {
    return (
      <WestCoastBackground>
        <SafeAreaView style={styles.lockRoot} edges={['bottom']}>
          <View style={styles.lockCard}>
            <BrandMark compact />
            <Text style={typography.title}>Gérant</Text>
            <Text style={[typography.bodyMuted, styles.lockHint]}>
              {!gerantPinOnboarded
                ? `Première ouverture : code ${DEFAULT_ROLE_PIN}, puis vous définirez le vôtre.`
                : 'Saisissez votre code gérant.'}
            </Text>
            <TextInput
              mode="outlined"
              value={pin}
              onChangeText={setPin}
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              placeholderTextColor={colors.textMuted}
              textColor={colors.text}
              outlineColor={colors.borderSubtle}
              activeOutlineColor={colors.accent}
              style={styles.input}
            />
            <PrimaryButton title="Continuer" onPress={unlock} />
          </View>
          <Snackbar visible={snack.length > 0} onDismiss={() => setSnack('')} duration={3000}>
            {snack}
          </Snackbar>
        </SafeAreaView>
      </WestCoastBackground>
    );
  }

  if (!gerantPinOnboarded) {
    return (
      <WestCoastBackground>
        <SafeAreaView style={styles.setupRoot} edges={['bottom']}>
          <FirstPinChangeForm
            title="Sécurité gérant"
            subtitle="Choisissez un nouveau code à 4–8 chiffres (différent du code d’installation)."
            onSubmit={(newPin) => {
              completeGerantPinSetup(newPin);
              hapticLight();
            }}
          />
        </SafeAreaView>
      </WestCoastBackground>
    );
  }

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {autonomousDemoEnabled ? (
            <View style={styles.autoBanner}>
              <Text style={styles.autoBannerTitle}>Mode autonome actif</Text>
              <Text style={[typography.bodyMuted, styles.autoBannerText]}>
                Rythme : {AUTONOMOUS_PACE_PRESETS[autonomousPacePreset].label}. Les étapes passent
                seules jusqu’à livraison — gardez cet écran ou l’app en arrière-plan selon l’OS.
              </Text>
            </View>
          ) : (
            <DeliveryFlowGuide />
          )}

          <View style={styles.servicePanel}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Prise de commandes (app client)
            </Text>
            {!isRemoteSyncEnabled() ? (
              <Text style={[typography.bodyMuted, styles.serviceHint]}>
                Sans liaison en ligne, l’app client suit uniquement le créneau local (lun–sam 20h–00h).
                Activez la synchronisation pour piloter ouverture et fermeture à distance.
              </Text>
            ) : (
              <>
                <Text style={[typography.bodyMuted, styles.serviceHint]}>
                  {remoteServiceAccepting === null
                    ? `Aucune consigne publiée : créneau automatique lun–sam 20h–00h. Maintenant (horaire local) : ${
                        isDeliveryOpen() ? 'ouvert' : 'fermé'
                      }.`
                    : remoteServiceAccepting
                      ? 'État publié : ouvert — les clients peuvent valider une commande.'
                      : 'État publié : fermé — les clients ne peuvent pas valider de commande.'}
                </Text>
                <View style={styles.serviceActions}>
                  <PrimaryButton
                    title={serviceBusy ? 'Publication…' : 'Ouvrir la prise de commandes'}
                    style={styles.serviceBtn}
                    disabled={serviceBusy}
                    onPress={() => {
                      setServiceBusy(true);
                      void pushRemoteServiceAccepting(true)
                        .then(() => setSnack('Prise de commandes ouverte.'))
                        .catch(() => setSnack('Échec de mise à jour — vérifiez le réseau.'))
                        .finally(() => setServiceBusy(false));
                    }}
                  />
                  <PrimaryButton
                    title={serviceBusy ? 'Publication…' : 'Clôturer le service'}
                    variant="ghost"
                    style={styles.serviceBtn}
                    disabled={serviceBusy}
                    onPress={() => {
                      setServiceBusy(true);
                      void pushRemoteServiceAccepting(false)
                        .then(() => setSnack('Service clôturé côté client.'))
                        .catch(() => setSnack('Échec de mise à jour — vérifiez le réseau.'))
                        .finally(() => setServiceBusy(false));
                    }}
                  />
                </View>
              </>
            )}
          </View>

          <View style={[surface.neonPanel, styles.links]}>
            <Link href="/gerant/historique" asChild>
              <PrimaryButton title="Historique" variant="ghost" style={styles.linkBtn} />
            </Link>
            <Link href="/gerant/reglages" asChild>
              <PrimaryButton title="Réglages" variant="ghost" style={styles.linkBtn} />
            </Link>
            <Link href="/gerant/distribution" asChild>
              <PrimaryButton title="Distribution QR & liens d’installation" style={styles.linkBtn} />
            </Link>
          </View>

          {variant === 'all' ? (
            <View style={styles.hubModeHint}>
              <Text style={[typography.bodyMuted, styles.siblingHint]}>
                Mode multi-espaces : ouvrez d’abord l’espace concerné depuis l’accueil principal pour
                retrouver les actions Client ou Livreur. Les commandes, réglages et la distribution
                restent disponibles ici.
              </Text>
            </View>
          ) : null}

          {variant === 'gerant' ? (
            <View style={styles.siblingBox}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Applications liées (Client & Livreur)
              </Text>
              <Text style={[typography.bodyMuted, styles.siblingHint]}>
                {isRemoteSyncEnabled()
                  ? 'Synchronisation active : commandes et livreur sont partagés entre appareils. Ouvrez Client ou Livreur depuis ici.'
                  : 'Ouvrez Client et Livreur depuis ici. Sans synchronisation, chaque téléphone garde ses données en local.'}
              </Text>
              <PrimaryButton
                title="Ouvrir Husko Client"
                variant="ghost"
                style={styles.linkBtn}
                onPress={() => openSiblingApp('client')}
              />
              <PrimaryButton
                title="Ouvrir Husko Livreur"
                variant="ghost"
                style={styles.linkBtn}
                onPress={() => openSiblingApp('livreur')}
              />
            </View>
          ) : null}

          <Text style={styles.sectionTitle} accessibilityRole="header">
            Commandes actives · {live.length}
          </Text>
          {live.length === 0 ? (
            <Text style={typography.bodyMuted}>Aucune commande.</Text>
          ) : (
            live.map((o) => (
              <Card key={o.id} mode="elevated" style={styles.card}>
                <Card.Content style={styles.cardInner}>
                  <Text variant="bodySmall" style={typography.mono}>
                    {o.id}
                  </Text>
                  <View style={styles.rowBadge}>
                    <StatusBadge status={o.status} />
                  </View>
                  <Text variant="bodyMedium" style={typography.body}>
                    {o.addressLabel}
                  </Text>
                  <OrderLinesPreview lines={o.lines} />
                  <Text variant="bodySmall" style={[typography.caption, styles.meta]}>
                    {formatEuro(o.total)}
                  </Text>
                  <View style={styles.actions}>
                    <GerantOrderActions
                      order={o}
                      onActionError={(msg) => setSnack(`Action impossible — ${msg}`)}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
        <Snackbar visible={snack.length > 0} onDismiss={() => setSnack('')} duration={4000}>
          {snack}
        </Snackbar>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  lockRoot: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  lockCard: {
    backgroundColor: gerantDashboardVisual.lockCardBg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    padding: spacing.xl,
    gap: spacing.md,
  },
  lockHint: { textAlign: 'center' },
  setupRoot: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  root: { flex: 1, backgroundColor: 'transparent', padding: spacing.md },
  input: {
    backgroundColor: colors.bg,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  scroll: { paddingBottom: spacing.xl },
  servicePanel: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: gerantDashboardVisual.panelBg,
    gap: spacing.sm,
    ...elevation.card,
  },
  serviceHint: { fontSize: 13, lineHeight: 19 },
  serviceActions: { gap: spacing.sm, marginTop: spacing.xs },
  serviceBtn: { width: '100%' },
  autoBanner: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: gerantDashboardVisual.panelBg,
  },
  autoBannerTitle: {
    ...typography.section,
    fontSize: 13,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    textTransform: 'none',
    color: colors.gold,
  },
  autoBannerText: { fontSize: 13, lineHeight: 19 },
  links: { gap: spacing.sm, marginBottom: spacing.lg, padding: spacing.md },
  linkBtn: { width: '100%' },
  hubModeHint: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: WC.neonCyanDim,
    backgroundColor: gerantDashboardVisual.panelBg,
  },
  siblingBox: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: gerantDashboardVisual.panelBg,
    gap: spacing.sm,
    ...elevation.card,
  },
  siblingHint: { marginBottom: spacing.xs },
  sectionTitle: {
    ...wcSectionLabel,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  meta: { marginTop: spacing.xs },
  card: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderGlow,
    marginBottom: spacing.md,
    ...elevation.card,
  },
  cardInner: { gap: spacing.xs },
  rowBadge: { marginVertical: spacing.sm },
  actions: { marginTop: spacing.md },
  actionFull: { width: '100%' },
});
