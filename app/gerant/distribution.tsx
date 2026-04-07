import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { DeploymentHints } from '@/components/DeploymentHints';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getDistributionApkUrls } from '@/constants/distribution';
import { DISTRIBUTION_QR_IMAGES } from '@/constants/distributionQrAssets';
import { DISTRIBUTION_ROLE_STYLE } from '@/constants/distributionRoles';
import { gerantDistributionVisual } from '@/constants/gerantDistributionVisual';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { colors, radius, spacing, surface } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import { VENUE_LEGAL_LINE } from '@/constants/venue';
/** Écran distribution : APK gérant uniquement (priorité produit). */
export default function DistributionScreen() {
  const { width: screenW } = useWindowDimensions();
  const qrFrameSide = useMemo(
    () => Math.max(160, Math.min(280, Math.floor(screenW - spacing.md * 2))),
    [screenW]
  );
  const qrPngSide = Math.max(120, qrFrameSide - 20);
  const qrVectorSize = Math.max(120, Math.min(200, qrFrameSide - spacing.md * 2));

  const urls = useMemo(() => getDistributionApkUrls(), []);
  const { gerant } = urls;
  const [dialog, setDialog] = useState<{ title: string; body: string } | null>(null);
  const [snack, setSnack] = useState('');

  const activeUrl = gerant;
  const roleStyle = DISTRIBUTION_ROLE_STYLE.gerant;
  const title = 'APK Gérant';
  const hint =
    'QR or · profil EAS apk-gerant, OTA canal gerant. Ouvrez la page Expo puis Installez. Pas de hub / client / livreur sur cet écran.';

  function copyUrl() {
    if (!activeUrl) {
      setDialog({ title: 'Lien non configuré', body: configHelp });
      return;
    }
    void Clipboard.setStringAsync(activeUrl).then(() =>
      setSnack('Le lien a été copié dans le presse-papiers.')
    );
  }

  function openInstallPage() {
    if (!activeUrl) {
      setDialog({ title: 'Lien non configuré', body: configHelp });
      return;
    }
    Linking.openURL(activeUrl).catch(() =>
      setDialog({
        title: 'Ouverture impossible',
        body: 'Copiez le lien ou ouvrez-le dans Chrome.',
      })
    );
  }

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <BrandMark tagline={VENUE_LEGAL_LINE} />
          <Text style={typography.title} accessibilityRole="header">
            Distribution
          </Text>
          <Text style={[wcSectionLabel, styles.kicker]}>QR & lien · APK gérant uniquement</Text>
          <Text style={[typography.bodyMuted, styles.intro]}>
            Priorité produit : un seul livrable Android — <Text style={styles.em}>apk-gerant</Text>. Les QR ouvrent la{' '}
            <Text style={styles.em}>page Expo</Text> (bouton Installer). Fichier{' '}
            <Text style={styles.mono}>.apk</Text> sur PC : <Text style={styles.mono}>npm run apk:download:gerant</Text>{' '}
            après <Text style={styles.mono}>npm run ship:gerant</Text> ou build EAS terminé.
          </Text>

          <DeploymentHints mode="alerts" mapsRelevant={false} style={styles.infra} />

          <View style={styles.anywhereBox} accessibilityRole="text">
            <Text style={styles.anywhereTitle}>Téléchargement · n’importe où</Text>
            <Text style={[typography.bodyMuted, styles.anywhereBody]}>
              Le QR et le lien vers la page Expo fonctionnent avec la <Text style={styles.em}>données mobiles</Text> ou
              un <Text style={styles.em}>Wi‑Fi quelconque</Text> (y compris à l’étranger) : vous n’avez pas besoin d’être
              sur le même réseau qu’un PC de développement. Sur un ordinateur,{' '}
              <Text style={styles.mono}>npm run apk:download:…</Text> fonctionne partout avec Internet si le compte Expo
              est disponible (<Text style={styles.mono}>eas login</Text> ou variable{' '}
              <Text style={styles.mono}>EXPO_TOKEN</Text> pour les environnements sans fenêtre de connexion).
            </Text>
          </View>

          <View style={[surface.elevated, styles.card, { borderColor: roleStyle.accent, borderWidth: 2 }]}>
            <View style={[styles.roleBanner, { backgroundColor: roleStyle.bannerBg }]}>
              <Text style={[styles.roleBannerText, { color: roleStyle.accent }]}>{roleStyle.label}</Text>
              <Text style={styles.roleBannerSub}>{title}</Text>
            </View>
            <Text style={[typography.bodyMuted, styles.hint]}>{hint}</Text>

            {activeUrl ? (
              <View style={styles.qrWrap}>
                <>
                  <Text style={styles.qrFileLabel}>
                    PNG haute définition · assets/distribution-qr/gerant.png
                  </Text>
                  <View
                    style={[
                      styles.pngFrame,
                      { width: qrFrameSide, height: qrFrameSide, borderColor: roleStyle.accent },
                    ]}
                  >
                    <Image
                      source={DISTRIBUTION_QR_IMAGES.gerant}
                      style={{ width: qrPngSide, height: qrPngSide }}
                      resizeMode="contain"
                      accessibilityLabel={`QR installation ${roleStyle.shortLabel}`}
                    />
                  </View>
                </>
                <View style={[styles.qrInner, { borderColor: roleStyle.accent }]}>
                  <QRCode
                    value={activeUrl}
                    size={qrVectorSize}
                    backgroundColor={colors.cardElevated}
                    color={roleStyle.qrDark}
                  />
                </View>
                <Text style={styles.qrVectorHint}>
                  Même URL que le PNG (or = gérant). Sinon : npm run qr:generate après distribution:sync-eas-urls.
                </Text>
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
            <Text style={styles.bothTitle}>Lien APK gérant</Text>
            <QrSummary
              label="Gérant (or)"
              url={gerant}
              accent={DISTRIBUTION_ROLE_STYLE.gerant.accent}
            />
          </View>
        </ScrollView>
        <Portal>
          <Dialog visible={dialog !== null} onDismiss={() => setDialog(null)}>
            <Dialog.Title>{dialog?.title}</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">{dialog?.body}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialog(null)}>OK</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Snackbar visible={snack.length > 0} onDismiss={() => setSnack('')} duration={2500}>
          {snack}
        </Snackbar>
      </SafeAreaView>
    </WestCoastBackground>
  );
}

const configHelp =
  'Renseignez l’URL gérant dans distribution.defaults.json ("gerant") ou EXPO_PUBLIC_DISTRIBUTION_GERANT_APK_URL, puis npm run distribution:sync-eas-urls, npm run qr:generate, et npm run ship:gerant.';

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
  kicker: { marginTop: spacing.sm, marginBottom: spacing.sm },
  intro: { marginTop: spacing.sm, marginBottom: spacing.lg },
  em: { fontFamily: FONT.medium, fontWeight: '700', color: colors.goldDim },
  infra: { marginBottom: spacing.md },
  anywhereBox: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: gerantDistributionVisual.anywhereBorder,
    backgroundColor: gerantDistributionVisual.anywhereBg,
    alignSelf: 'stretch',
  },
  anywhereTitle: {
    fontFamily: FONT.bold,
    color: colors.gold,
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  anywhereBody: { lineHeight: 20 },
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
    fontFamily: FONT.bold,
    fontSize: 22,
    letterSpacing: 3,
  },
  roleBannerSub: {
    fontFamily: FONT.medium,
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  hint: { marginBottom: spacing.md },
  qrWrap: { alignItems: 'center' },
  qrFileLabel: {
    fontFamily: FONT.bold,
    alignSelf: 'stretch',
    textAlign: 'center',
    color: colors.gold,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  pngFrame: {
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    borderColor: colors.border,
    backgroundColor: colors.bgLift,
  },
  both: {
    padding: spacing.md,
    ...surface.glass,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
  },
  bothTitle: {
    fontFamily: FONT.bold,
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 12,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  summaryRow: { marginBottom: spacing.md },
  summaryLabel: { fontFamily: FONT.bold, fontWeight: '800', marginBottom: 4 },
  summaryUrl: { color: colors.text, fontSize: 11 },
  mono: { fontFamily: 'monospace', fontSize: 11, color: colors.goldDim },
});
