import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OtaUpdateSection } from '@/components/OtaUpdateSection';
import { SettingsSection, SettingsSwitchRow } from '@/components/settings/SettingsSection';
import { SyncDiagnosticsSection } from '@/components/settings/SyncDiagnosticsSection';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { appScreenVisual } from '@/constants/appScreenVisual';
import {
  CLIENT_PHONE_DISPLAY,
  CLIENT_PHONE_TEL,
  clientStrings,
} from '@/constants/clientExperience';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { VENUE_TAGLINE_CLIENT } from '@/constants/venue';
import { WC } from '@/constants/westCoastTheme';
import { useHuskoStore } from '@/stores/useHuskoStore';

export default function ClientReglagesScreen() {
  const notificationsEnabled = useHuskoStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useHuskoStore((s) => s.setNotificationsEnabled);

  return (
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle} accessibilityRole="header">
            Réglages
          </Text>
          <Text style={[typography.bodyMuted, styles.screenSubtitle]}>
            Notifications, contact et informations sur l’app — tout au même endroit.
          </Text>

          <SettingsSection title="Établissement" subtitle={VENUE_TAGLINE_CLIENT}>
            <View style={styles.heroInner}>
              <Text style={styles.brand}>Husko</Text>
              <Text style={[typography.caption, styles.heroHint]}>
                Application client — commandes et suivi de livraison.
              </Text>
            </View>
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            subtitle="Alertes locales quand votre commande avance (préparation, en route, livrée)."
          >
            <SettingsSwitchRow
              label="Recevoir les notifications"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              hint="Vous pouvez les couper ici si vous préférez uniquement consulter l’écran de suivi."
            />
          </SettingsSection>

          <SettingsSection
            title="Contact"
            subtitle="Une question sur votre commande ou le service ? Appelez-nous."
          >
            <Pressable
              onPress={() => void Linking.openURL(`tel:${CLIENT_PHONE_TEL}`)}
              style={({ pressed }) => [styles.phoneBtn, pressed && styles.phoneBtnPressed]}
              accessibilityRole="link"
              accessibilityLabel={`Appeler le ${CLIENT_PHONE_DISPLAY}`}
            >
              <Text style={styles.phoneBtnText}>{CLIENT_PHONE_DISPLAY}</Text>
              <Text style={[typography.caption, styles.phoneSub]}>Snap HUSKOBYNIGHT</Text>
            </Pressable>
          </SettingsSection>

          <SettingsSection
            title={clientStrings.historiqueTitle}
            subtitle="Livraisons terminées et annulations sur cet appareil."
          >
            <Link href="/client/historique" asChild>
              <PrimaryButton title={clientStrings.historiqueLink} variant="ghost" />
            </Link>
          </SettingsSection>

          <SyncDiagnosticsSection />
          <OtaUpdateSection />
          <DeploymentHints mode="settings" mapsRelevant={false} style={styles.hint} />
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
  heroInner: { gap: spacing.xs },
  brand: {
    ...typography.title,
    fontFamily: FONT.bold,
    color: WC.white,
    letterSpacing: 4,
  },
  heroHint: { color: colors.textMuted, lineHeight: 18 },
  phoneBtn: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: WC.neonCyanDim,
    backgroundColor: appScreenVisual.overlay035,
    gap: spacing.xs,
  },
  phoneBtnPressed: { opacity: 0.88 },
  phoneBtnText: {
    ...typography.body,
    fontFamily: FONT.bold,
    fontWeight: '800',
    color: WC.gold,
  },
  phoneSub: { color: colors.textMuted },
  hint: { marginTop: spacing.sm },
});
