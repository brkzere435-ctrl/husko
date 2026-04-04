import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { DEFAULT_ROLE_PIN } from '@/constants/devicePin';
import { getAppVariant } from '@/constants/appVariant';
import { AUTONOMOUS_PACE_PRESETS } from '@/constants/autonomousDelivery';
import { typography } from '@/constants/typography';
import { isRemoteSyncEnabled } from '@/services/firebaseRemote';
import { colors, elevation, radius, spacing, surface } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import type { Order } from '@/stores/useHuskoStore';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatEuro } from '@/utils/formatEuro';
import { hapticLight } from '@/utils/haptics';
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
  const variant = getAppVariant();
  const orders = useHuskoStore((s) => s.orders);
  const autonomousDemoEnabled = useHuskoStore((s) => s.autonomousDemoEnabled);
  const autonomousPacePreset = useHuskoStore((s) => s.autonomousPacePreset);
  const managerPin = useHuskoStore((s) => s.managerPin);
  const gerantPinOnboarded = useHuskoStore((s) => s.gerantPinOnboarded);
  const completeGerantPinSetup = useHuskoStore((s) => s.completeGerantPinSetup);

  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [snack, setSnack] = useState('');

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
          <View style={[surface.neonPanel, styles.links]}>
            <Link href="/gerant/historique" asChild>
              <PrimaryButton title="Historique" variant="ghost" style={styles.linkBtn} />
            </Link>
            <Link href="/gerant/reglages" asChild>
              <PrimaryButton title="Réglages" variant="ghost" style={styles.linkBtn} />
            </Link>
            <Link href="/gerant/distribution" asChild>
              <PrimaryButton title="Distribution QR & liens (tous les APK)" style={styles.linkBtn} />
            </Link>
          </View>

          {variant === 'gerant' ? (
            <View style={styles.siblingBox}>
              <Text style={styles.sectionTitle}>Applications liées (Client & Livreur)</Text>
              <Text style={[typography.bodyMuted, styles.siblingHint]}>
                {isRemoteSyncEnabled()
                  ? 'Liaison Firestore active : commandes et livreur synchronisés entre appareils (APK unifié hub ou apps Client / Livreur / Gérant). Ouvrez Client ou Livreur depuis ici.'
                  : 'APK unifié (hub) ou apps séparées : ouvrez Client et Livreur depuis ici. Sans Firebase (Réglages / env), chaque téléphone garde ses données en local.'}
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

          <Text style={styles.sectionTitle}>Commandes actives · {live.length}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
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
  autoBanner: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: 'rgba(0,0,0,0.35)',
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
  siblingBox: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    backgroundColor: 'rgba(0,0,0,0.35)',
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
