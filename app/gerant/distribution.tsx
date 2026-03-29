import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
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

import { BrandMark } from '@/components/BrandMark';
import { DeploymentHints } from '@/components/DeploymentHints';
import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getDistributionApkUrls } from '@/constants/distribution';
import { DISTRIBUTION_QR_IMAGES } from '@/constants/distributionQrAssets';
import {
  DISTRIBUTION_ROLE_STYLE,
  type DistributionTabKey,
} from '@/constants/distributionRoles';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing, surface } from '@/constants/theme';
import { VENUE_LEGAL_LINE } from '@/constants/venue';

export default function DistributionScreen() {
  const { client, livreur, gerant } = useMemo(() => getDistributionApkUrls(), []);
  const [tab, setTab] = useState<DistributionTabKey>('gerant');

  const activeUrl =
    tab === 'client' ? client : tab === 'livreur' ? livreur : gerant;
  const roleStyle = DISTRIBUTION_ROLE_STYLE[tab];
  const title =
    tab === 'client' ? 'APK Client' : tab === 'livreur' ? 'APK Livreur' : 'APK Gérant';
  const hint =
    tab === 'client'
      ? 'QR vert · pour les clients (commandes sandwicherie). Ouvre la page Expo puis « Install ».'
      : tab === 'livreur'
        ? 'QR bleu · pour les livreurs (carte & courses).'
        : 'QR or · pour le gérant (validation & cette page distribution).';

  function copyUrl() {
    if (!activeUrl) {
      Alert.alert('Lien non configuré', configHelp);
      return;
    }
    Clipboard.setStringAsync(activeUrl).then(() =>
      Alert.alert('Copié', 'Le lien a été copié dans le presse-papiers.')
    );
  }

  function openInstallPage() {
    if (!activeUrl) {
      Alert.alert('Lien non configuré', configHelp);
      return;
    }
    Linking.openURL(activeUrl).catch(() =>
      Alert.alert('Ouverture impossible', 'Copiez le lien ou ouvrez-le dans Chrome.')
    );
  }

  return (
    <HuskoBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <BrandMark tagline={VENUE_LEGAL_LINE} />
          <Text style={typography.title}>Distribution</Text>
          <Text style={[typography.section, styles.kicker]}>QR & liens (3 rôles distincts)</Text>
          <Text style={[typography.bodyMuted, styles.intro]}>
            Chaque onglet a une couleur : or = gérant, vert = client, bleu = livreur. Les QR ouvrent la{' '}
            <Text style={styles.em}>page Expo</Text> (installation fiable sur téléphone). Pour récupérer le fichier{' '}
            <Text style={styles.mono}>.apk</Text> sur PC :{' '}
            <Text style={styles.mono}>npm run apk:download:client</Text> (ou gerant / livreur / all).
          </Text>

          <DeploymentHints mode="alerts" mapsRelevant={false} style={styles.infra} />

          <View style={styles.tabs}>
            <Pressable
              onPress={() => setTab('gerant')}
              style={[
                styles.tab,
                tab === 'gerant' && styles.tabOn,
                tab === 'gerant' && {
                  borderColor: DISTRIBUTION_ROLE_STYLE.gerant.accent,
                  backgroundColor: 'rgba(240, 208, 80, 0.12)',
                },
              ]}
            >
              <Text style={[styles.tabEmoji]}>◆</Text>
              <Text style={[styles.tabTxt, tab === 'gerant' && styles.tabTxtOn]}>Gérant</Text>
              <Text style={styles.tabHint}>or</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('client')}
              style={[
                styles.tab,
                tab === 'client' && styles.tabOn,
                tab === 'client' && {
                  borderColor: DISTRIBUTION_ROLE_STYLE.client.accent,
                  backgroundColor: 'rgba(74, 222, 128, 0.1)',
                },
              ]}
            >
              <Text style={[styles.tabEmoji]}>●</Text>
              <Text style={[styles.tabTxt, tab === 'client' && { color: DISTRIBUTION_ROLE_STYLE.client.accent }]}>
                Client
              </Text>
              <Text style={styles.tabHint}>vert</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('livreur')}
              style={[
                styles.tab,
                tab === 'livreur' && styles.tabOn,
                tab === 'livreur' && {
                  borderColor: DISTRIBUTION_ROLE_STYLE.livreur.accent,
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                },
              ]}
            >
              <Text style={[styles.tabEmoji]}>▲</Text>
              <Text style={[styles.tabTxt, tab === 'livreur' && { color: DISTRIBUTION_ROLE_STYLE.livreur.accent }]}>
                Livreur
              </Text>
              <Text style={styles.tabHint}>bleu</Text>
            </Pressable>
          </View>

          <View style={[surface.elevated, styles.card, { borderColor: roleStyle.accent, borderWidth: 2 }]}>
            <View style={[styles.roleBanner, { backgroundColor: roleStyle.bannerBg }]}>
              <Text style={[styles.roleBannerText, { color: roleStyle.accent }]}>{roleStyle.label}</Text>
              <Text style={styles.roleBannerSub}>{title}</Text>
            </View>
            <Text style={[typography.bodyMuted, styles.hint]}>{hint}</Text>

            {activeUrl ? (
              <View style={styles.qrWrap}>
                <Text style={styles.qrFileLabel}>PNG haute définition · assets/distribution-qr/{tab}.png</Text>
                <View style={[styles.pngFrame, { borderColor: roleStyle.accent }]}>
                  <Image
                    source={DISTRIBUTION_QR_IMAGES[tab]}
                    style={styles.qrPng}
                    resizeMode="contain"
                    accessibilityLabel={`QR installation ${roleStyle.shortLabel}`}
                  />
                </View>
                <View style={[styles.qrInner, { borderColor: roleStyle.accent }]}>
                  <QRCode
                    value={activeUrl}
                    size={200}
                    backgroundColor={colors.cardElevated}
                    color={roleStyle.qrDark}
                  />
                </View>
                <Text style={styles.qrVectorHint}>Même URL que le PNG (couleur = rôle)</Text>
                <Text style={styles.url} selectable>
                  {activeUrl}
                </Text>
                <PrimaryButton
                  title="Ouvrir la page d’installation (Expo)"
                  onPress={openInstallPage}
                  style={styles.btn}
                />
                <PrimaryButton title="Copier le lien" variant="ghost" onPress={copyUrl} style={styles.btnGhost} />
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={typography.bodyMuted}>{configHelp}</Text>
              </View>
            )}
          </View>

          <View style={styles.both}>
            <Text style={styles.bothTitle}>Les trois liens (ne pas mélanger les QR)</Text>
            <QrSummary
              label="Gérant (or)"
              url={gerant}
              accent={DISTRIBUTION_ROLE_STYLE.gerant.accent}
            />
            <QrSummary
              label="Client (vert)"
              url={client}
              accent={DISTRIBUTION_ROLE_STYLE.client.accent}
            />
            <QrSummary
              label="Livreur (bleu)"
              url={livreur}
              accent={DISTRIBUTION_ROLE_STYLE.livreur.accent}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </HuskoBackground>
  );
}

const configHelp =
  'Renseignez les clés gerant / client / livreur dans distribution.defaults.json (ou variables EXPO_PUBLIC_DISTRIBUTION_*), puis npm run qr:generate et rebuild apk-gerant.';

function QrSummary({
  label,
  url,
  accent,
}: {
  label: string;
  url: string;
  accent: string;
}) {
  return (
    <View style={[styles.summaryRow, { borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: spacing.sm }]}>
      <Text style={[styles.summaryLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.summaryUrl} numberOfLines={4} selectable>
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
  em: { fontWeight: '700', color: colors.goldDim },
  infra: { marginBottom: spacing.md },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgLift,
    alignItems: 'center',
  },
  tabOn: {
    ...elevation.card,
  },
  tabEmoji: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  tabTxt: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  tabTxtOn: { color: colors.gold },
  tabHint: { fontSize: 9, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  roleBanner: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  roleBannerText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  roleBannerSub: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
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
    borderWidth: 2,
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
    borderWidth: 2,
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
    fontSize: 10,
    textAlign: 'center',
  },
  btn: { marginTop: spacing.md, width: '100%' },
  btnGhost: { marginTop: spacing.sm, width: '100%' },
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
  summaryLabel: { fontWeight: '800', marginBottom: 4 },
  summaryUrl: { color: colors.text, fontSize: 11 },
  mono: { fontFamily: 'monospace', fontSize: 11, color: colors.goldDim },
});
