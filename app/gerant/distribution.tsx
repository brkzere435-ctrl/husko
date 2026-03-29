import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getDistributionApkUrls } from '@/constants/distribution';
import { DISTRIBUTION_QR_IMAGES } from '@/constants/distributionQrAssets';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing, surface } from '@/constants/theme';

type TabKey = 'client' | 'livreur' | 'gerant';

export default function DistributionScreen() {
  const { client, livreur, gerant } = useMemo(() => getDistributionApkUrls(), []);
  const [tab, setTab] = useState<TabKey>('gerant');

  const activeUrl =
    tab === 'client' ? client : tab === 'livreur' ? livreur : gerant;
  const title =
    tab === 'client' ? 'APK Client' : tab === 'livreur' ? 'APK Livreur' : 'APK Gérant';
  const hint =
    tab === 'client'
      ? 'À scanner par les clients pour installer Husko Client (commandes).'
      : tab === 'livreur'
        ? 'À scanner par les livreurs pour installer Husko Livreur (courses & carte).'
        : 'À scanner pour installer Husko Gérant (commandes, validation, QR distribution).';

  function copyUrl() {
    if (!activeUrl) {
      Alert.alert('Lien non configuré', configHelp);
      return;
    }
    Clipboard.setStringAsync(activeUrl).then(() =>
      Alert.alert('Copié', 'Le lien a été copié dans le presse-papiers.')
    );
  }

  return (
    <HuskoBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={typography.title}>Distribution</Text>
          <Text style={[typography.section, styles.kicker]}>QR & liens APK</Text>
          <Text style={[typography.bodyMuted, styles.intro]}>
            Trois QR distincts. Les liens par défaut viennent de{' '}
            <Text style={styles.mono}>distribution.defaults.json</Text> (modifiable). PNG haute définition :{' '}
            <Text style={styles.mono}>npm run qr:generate</Text> → dossier{' '}
            <Text style={styles.mono}>assets/distribution-qr/</Text>. Les variables{' '}
            <Text style={styles.mono}>EXPO_PUBLIC_DISTRIBUTION_*</Text> priment sur le fichier.
          </Text>

          <DeploymentHints mode="alerts" mapsRelevant={false} style={styles.infra} />

          <View style={styles.tabs}>
            <Pressable
              onPress={() => setTab('gerant')}
              style={[styles.tab, tab === 'gerant' && styles.tabOn]}
            >
              <Text style={[styles.tabTxt, tab === 'gerant' && styles.tabTxtOn]}>Gérant</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('client')}
              style={[styles.tab, tab === 'client' && styles.tabOn]}
            >
              <Text style={[styles.tabTxt, tab === 'client' && styles.tabTxtOn]}>Client</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('livreur')}
              style={[styles.tab, tab === 'livreur' && styles.tabOn]}
            >
              <Text style={[styles.tabTxt, tab === 'livreur' && styles.tabTxtOn]}>Livreur</Text>
            </Pressable>
          </View>

          <View style={[surface.elevated, styles.card]}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[typography.bodyMuted, styles.hint]}>{hint}</Text>

            {activeUrl ? (
              <View style={styles.qrWrap}>
                <Text style={styles.qrFileLabel}>QR haute définition · assets/distribution-qr/</Text>
                <View style={styles.pngFrame}>
                  <Image
                    source={DISTRIBUTION_QR_IMAGES[tab]}
                    style={styles.qrPng}
                    resizeMode="contain"
                    accessibilityLabel={`QR code installation ${title}`}
                  />
                </View>
                <View style={styles.qrInner}>
                  <QRCode
                    value={activeUrl}
                    size={200}
                    backgroundColor={colors.cardElevated}
                    color={colors.gold}
                  />
                </View>
                <Text style={styles.qrVectorHint}>Même URL que le PNG (aperçu dynamique)</Text>
                <Text style={styles.url} selectable>
                  {activeUrl}
                </Text>
                <PrimaryButton title="Copier le lien" variant="ghost" onPress={copyUrl} style={styles.btn} />
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={typography.bodyMuted}>{configHelp}</Text>
              </View>
            )}
          </View>

          <View style={styles.both}>
            <Text style={styles.bothTitle}>Aperçu des trois liens</Text>
            <QrSummary label="Gérant" url={gerant} />
            <QrSummary label="Client" url={client} />
            <QrSummary label="Livreur" url={livreur} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </HuskoBackground>
  );
}

const configHelp =
  'Renseignez les clés gerant / client / livreur dans distribution.defaults.json (ou variables EXPO_PUBLIC_DISTRIBUTION_*), puis npm run qr:generate et redémarrez Expo.';

function QrSummary({ label, url }: { label: string; url: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryUrl} numberOfLines={3} selectable>
        {url || '— non configuré —'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  kicker: { marginTop: spacing.xs, marginBottom: spacing.xs },
  intro: { marginTop: spacing.sm, marginBottom: spacing.lg },
  infra: { marginBottom: spacing.md },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgLift,
    alignItems: 'center',
  },
  tabOn: {
    borderColor: colors.borderGlow,
    backgroundColor: colors.cardElevated,
    ...elevation.card,
  },
  tabTxt: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  tabTxtOn: { color: colors.gold },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.gold,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  hint: { marginBottom: spacing.md },
  qrWrap: { alignItems: 'center' },
  qrFileLabel: {
    alignSelf: 'stretch',
    textAlign: 'center',
    color: colors.gold,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  pngFrame: {
    width: 280,
    height: 280,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPng: { width: 260, height: 260 },
  qrInner: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  qrVectorHint: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  url: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  btn: { marginTop: spacing.md, width: '100%' },
  placeholder: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgLift,
  },
  both: {
    padding: spacing.md,
    ...surface.glass,
    borderRadius: radius.lg,
  },
  bothTitle: {
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 12,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  summaryRow: { marginBottom: spacing.md },
  summaryLabel: { color: colors.gold, fontWeight: '800', marginBottom: 4 },
  summaryUrl: { color: colors.text, fontSize: 12 },
  mono: { fontFamily: 'monospace', fontSize: 11, color: colors.goldDim },
});
