import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { memo, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { DeploymentHints } from '@/components/DeploymentHints';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getDistributionApkUrls } from '@/constants/distribution';
import { DISTRIBUTION_QR_IMAGES } from '@/constants/distributionQrAssets';
import {
  DISTRIBUTION_ROLE_STYLE,
  type DistributionTabKey,
} from '@/constants/distributionRoles';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { colors, elevation, radius, spacing, surface } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';
import { VENUE_LEGAL_LINE } from '@/constants/venue';
import { getAppVariant } from '@/constants/appVariant';

function urlForTab(
  tab: DistributionTabKey,
  urls: ReturnType<typeof getDistributionApkUrls>
): string {
  switch (tab) {
    case 'unified':
      return urls.unified;
    case 'assistant':
      return urls.assistant;
    case 'gerant':
      return urls.gerant;
    case 'client':
      return urls.client;
    case 'livreur':
      return urls.livreur;
  }
}

function apkTitle(tab: DistributionTabKey): string {
  switch (tab) {
    case 'unified':
      return 'APK unifié (hub)';
    case 'assistant':
      return 'APK Copilote';
    case 'gerant':
      return 'APK Gérant';
    case 'client':
      return 'APK Client';
    case 'livreur':
      return 'APK Livreur';
  }
}

function apkHint(tab: DistributionTabKey): string {
  switch (tab) {
    case 'unified':
      return 'QR cyan · une seule app : client, livreur, gérant, Copilote (profil EAS apk-unified, OTA canal hub). Sur la page Expo, touchez Installer.';
    case 'assistant':
      return 'QR magenta · application Copilote seule (profil apk-assistant).';
    case 'gerant':
      return 'QR or · pour le gérant (validation & cette page distribution).';
    case 'client':
      return 'QR vert · pour les clients (commandes). Page Expo puis « Install ».';
    case 'livreur':
      return 'QR bleu · pour les livreurs (carte & courses).';
  }
}

function hasDistributionPng(tab: DistributionTabKey): tab is 'gerant' | 'client' | 'livreur' {
  return tab === 'gerant' || tab === 'client' || tab === 'livreur';
}

function tabActiveBg(t: DistributionTabKey): string {
  switch (t) {
    case 'unified':
      return 'rgba(34, 211, 238, 0.12)';
    case 'assistant':
      return 'rgba(232, 121, 249, 0.1)';
    case 'gerant':
      return 'rgba(240, 208, 80, 0.12)';
    case 'client':
      return 'rgba(74, 222, 128, 0.1)';
    case 'livreur':
      return 'rgba(96, 165, 250, 0.1)';
  }
}

const DistributionRoleTab = memo(function DistributionRoleTab({
  role,
  selected,
  onSelect,
  label,
  emoji,
  hint,
}: {
  role: DistributionTabKey;
  selected: DistributionTabKey;
  onSelect: (r: DistributionTabKey) => void;
  label: string;
  emoji: string;
  hint: string;
}) {
  const on = selected === role;
  const s = DISTRIBUTION_ROLE_STYLE[role];
  return (
    <Pressable
      onPress={() => onSelect(role)}
      style={[
        styles.tab,
        on && styles.tabOn,
        on && { borderColor: s.accent, backgroundColor: tabActiveBg(role) },
      ]}
    >
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text
        style={[styles.tabTxt, on && (role === 'gerant' ? styles.tabTxtOn : { color: s.accent })]}
      >
        {label}
      </Text>
      <Text style={styles.tabHint}>{hint}</Text>
    </Pressable>
  );
});

export default function DistributionScreen() {
  const { width: screenW } = useWindowDimensions();
  const qrFrameSide = useMemo(
    () => Math.max(160, Math.min(280, Math.floor(screenW - spacing.md * 2))),
    [screenW]
  );
  const qrPngSide = Math.max(120, qrFrameSide - 20);
  const qrVectorSize = Math.max(120, Math.min(200, qrFrameSide - spacing.md * 2));

  const urls = useMemo(() => getDistributionApkUrls(), []);
  const { client, livreur, gerant, unified, assistant } = urls;
  /** APK gérant seul : pas de QR hub unifié ni Copilote (rôles déjà couverts ailleurs). */
  const isGerantDedicatedApk = getAppVariant() === 'gerant';
  const [tab, setTab] = useState<DistributionTabKey>(() =>
    isGerantDedicatedApk ? 'gerant' : 'unified'
  );
  const [dialog, setDialog] = useState<{ title: string; body: string } | null>(null);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    if (!isGerantDedicatedApk) return;
    if (tab === 'unified' || tab === 'assistant') setTab('gerant');
  }, [isGerantDedicatedApk, tab]);

  const activeUrl = urlForTab(tab, urls);
  const roleStyle = DISTRIBUTION_ROLE_STYLE[tab];
  const title = apkTitle(tab);
  const hint = apkHint(tab);

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
          <Text style={typography.title}>Distribution</Text>
          <Text style={[wcSectionLabel, styles.kicker]}>
            {isGerantDedicatedApk ? 'QR & liens (gérant · client · livreur)' : 'QR & liens (unifié + mono-rôles)'}
          </Text>
          <Text style={[typography.bodyMuted, styles.intro]}>
            {isGerantDedicatedApk ? (
              <>
                Cette app <Text style={styles.em}>gérant</Text> sert aux QR <Text style={styles.em}>or / vert / bleu</Text>{' '}
                uniquement (pas hub unifié ni Copilote). Les QR ouvrent la{' '}
                <Text style={styles.em}>page Expo</Text> : sur le téléphone, utilisez le bouton d’installation sur
                cette page (le navigateur ne télécharge pas un fichier .apk directement). Fichiers{' '}
                <Text style={styles.mono}>.apk</Text> sur PC :{' '}
                <Text style={styles.mono}>npm run apk:download:gerant</Text>, client, livreur ou all.
              </>
            ) : (
              <>
                Couleurs : cyan = APK unique (hub), magenta = Copilote, puis or / vert / bleu pour les APK
                dédiés. Les QR ouvrent la <Text style={styles.em}>page Expo</Text> : sur le téléphone, utilisez le
                bouton d’installation (pas de téléchargement direct du .apk dans le navigateur). Fichiers{' '}
                <Text style={styles.mono}>.apk</Text> sur PC :{' '}
                <Text style={styles.mono}>npm run apk:download:unified</Text>,{' '}
                <Text style={styles.mono}>npm run apk:download:assistant</Text>, ou client / gerant / livreur / all.
              </>
            )}
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

          <View style={[surface.neonPanel, styles.tabRows]}>
            <View style={styles.tabRow}>
              <DistributionRoleTab
                role="unified"
                selected={tab}
                onSelect={setTab}
                label="Unifié"
                emoji="◆"
                hint="cyan"
              />
              <DistributionRoleTab
                role="assistant"
                selected={tab}
                onSelect={setTab}
                label="Copilote"
                emoji="◆"
                hint="magenta"
              />
            </View>
            <View style={styles.tabRow}>
              <DistributionRoleTab
                role="gerant"
                selected={tab}
                onSelect={setTab}
                label="Gérant"
                emoji="◆"
                hint="or"
              />
              <DistributionRoleTab
                role="client"
                selected={tab}
                onSelect={setTab}
                label="Client"
                emoji="●"
                hint="vert"
              />
              <DistributionRoleTab
                role="livreur"
                selected={tab}
                onSelect={setTab}
                label="Livreur"
                emoji="▲"
                hint="bleu"
              />
            </View>
          </View>

          <View style={[surface.elevated, styles.card, { borderColor: roleStyle.accent, borderWidth: 2 }]}>
            <View style={[styles.roleBanner, { backgroundColor: roleStyle.bannerBg }]}>
              <Text style={[styles.roleBannerText, { color: roleStyle.accent }]}>{roleStyle.label}</Text>
              <Text style={styles.roleBannerSub}>{title}</Text>
            </View>
            <Text style={[typography.bodyMuted, styles.hint]}>{hint}</Text>

            {activeUrl ? (
              <View style={styles.qrWrap}>
                {hasDistributionPng(tab) ? (
                  <>
                    <Text style={styles.qrFileLabel}>
                      PNG haute définition · assets/distribution-qr/{tab}.png
                    </Text>
                    <View
                      style={[
                        styles.pngFrame,
                        { width: qrFrameSide, height: qrFrameSide, borderColor: roleStyle.accent },
                      ]}
                    >
                      <Image
                        source={DISTRIBUTION_QR_IMAGES[tab]}
                        style={{ width: qrPngSide, height: qrPngSide }}
                        resizeMode="contain"
                        accessibilityLabel={`QR installation ${roleStyle.shortLabel}`}
                      />
                    </View>
                  </>
                ) : null}
                <View style={[styles.qrInner, { borderColor: roleStyle.accent }]}>
                  <QRCode
                    value={activeUrl}
                    size={qrVectorSize}
                    backgroundColor={colors.cardElevated}
                    color={roleStyle.qrDark}
                  />
                </View>
                <Text style={styles.qrVectorHint}>
                  {hasDistributionPng(tab)
                    ? 'Même URL que le PNG (couleur = rôle)'
                    : 'QR vectoriel — générez aussi le PNG avec npm run qr:generate une fois l’URL renseignée.'}
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
            <Text style={styles.bothTitle}>Tous les liens (ne pas mélanger les QR)</Text>
            {!isGerantDedicatedApk ? (
              <>
                <QrSummary
                  label="Unifié hub (cyan)"
                  url={unified}
                  accent={DISTRIBUTION_ROLE_STYLE.unified.accent}
                />
                <QrSummary
                  label="Copilote (magenta)"
                  url={assistant}
                  accent={DISTRIBUTION_ROLE_STYLE.assistant.accent}
                />
              </>
            ) : null}
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
  'Renseignez les URLs dans distribution.defaults.json (unified, assistant, gerant, client, livreur) ou EXPO_PUBLIC_DISTRIBUTION_*_APK_URL, puis npm run qr:generate et rebuild apk-gerant.';

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
    borderColor: 'rgba(74, 222, 128, 0.35)',
    backgroundColor: 'rgba(20, 50, 35, 0.35)',
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
  tabRows: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
    padding: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.22)',
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
  },
  tabOn: {
    ...elevation.card,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  tabEmoji: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  tabTxt: {
    fontFamily: FONT.bold,
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  tabTxtOn: { color: colors.gold },
  tabHint: {
    fontFamily: FONT.medium,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
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
