import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeploymentHints } from '@/components/DeploymentHints';
import { OtaUpdateSection } from '@/components/OtaUpdateSection';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SettingsSection, SettingsSwitchRow } from '@/components/settings/SettingsSection';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import { FONT } from '@/constants/fonts';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { formatEuro } from '@/utils/formatEuro';

export default function AssistantReglagesScreen() {
  const tier = useAssistantStore((s) => s.tier);
  const clearChat = useAssistantStore((s) => s.clearChat);
  const messageCount = useAssistantStore((s) => s.messages.length);
  const notificationsEnabled = useHuskoStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useHuskoStore((s) => s.setNotificationsEnabled);
  const plan = tier ? SUBSCRIPTION_PLANS.find((p) => p.id === tier) : null;

  return (
    <WestCoastBackground>
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>App & mises à jour</Text>
          <Text style={[typography.bodyMuted, styles.screenSubtitle]}>
            Forfait, notifications système, raccourcis, historique local et canal OTA — tout au même
            endroit.
          </Text>

          <SettingsSection
            title="Copilote"
            subtitle="Assistant intégré à Husko By Night — réponses structurées, sans remplacer le gérant sur le terrain."
          >
            <View style={styles.heroInner}>
              <Text style={styles.brand}>Copilote Husko</Text>
              <Text style={[typography.caption, styles.muted]}>
                Les mises à jour JavaScript arrivent via EAS Update (canal du build) sans réinstaller
                l’APK à chaque changement de texte ou de logique.
              </Text>
            </View>
          </SettingsSection>

          <SettingsSection
            title="Forfait actuel"
            subtitle="Choix enregistré sur cet appareil. La facturation réelle dépend du flux Stripe / Revolut côté abonnement."
          >
            <View style={styles.planRow}>
              <Text style={typography.body}>Offre</Text>
              <Text style={styles.planValue}>
                {plan ? `${plan.name} · ${formatEuro(plan.priceEur)}` : '—'}
              </Text>
            </View>
            {plan ? (
              <Text style={[typography.caption, styles.muted]}>{plan.tagline}</Text>
            ) : null}
          </SettingsSection>

          <SettingsSection
            title="Raccourcis"
            subtitle="Retour rapide vers le chat et le choix de forfait."
          >
            <Link href="/assistant/chat" asChild>
              <Pressable
                style={({ pressed }) => [styles.shortcut, pressed && styles.shortcutPressed]}
                accessibilityRole="button"
                accessibilityLabel="Ouvrir le chat Copilote"
              >
                <Text style={styles.shortcutTitle}>Chat</Text>
                <Text style={typography.caption}>Poser une question au Copilote</Text>
              </Pressable>
            </Link>
            <Link href="/assistant/abonnement" asChild>
              <Pressable
                style={({ pressed }) => [styles.shortcut, pressed && styles.shortcutPressed]}
                accessibilityRole="button"
                accessibilityLabel="Ouvrir les forfaits"
              >
                <Text style={styles.shortcutTitle}>Forfaits</Text>
                <Text style={typography.caption}>Changer ou consulter l’offre</Text>
              </Pressable>
            </Link>
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            subtitle="Alertes locales (ex. avant rechargement après une mise à jour OTA). Désactiver ici évite la notification ; la mise à jour s’applique quand même."
          >
            <SettingsSwitchRow
              label="Notifications locales"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              hint="Indépendant du chat : concerne les messages système Husko sur cet appareil."
            />
          </SettingsSection>

          <SettingsSection
            title="Conversation"
            subtitle="L’historique des messages est stocké localement sur cet appareil (limité à la fin du fil pour les performances)."
          >
            <Text style={[typography.caption, styles.muted]}>
              Messages en mémoire : {messageCount}
            </Text>
            <PrimaryButton
              title="Effacer l’historique du chat"
              variant="ghost"
              onPress={clearChat}
            />
          </SettingsSection>

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
  heroInner: { gap: spacing.sm },
  brand: {
    ...typography.title,
    fontFamily: FONT.bold,
    color: WC.white,
    letterSpacing: 2,
  },
  muted: { color: colors.textMuted, lineHeight: 18 },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  planValue: {
    ...typography.body,
    fontFamily: FONT.bold,
    fontWeight: '800',
    color: WC.gold,
    flexShrink: 1,
    textAlign: 'right',
  },
  shortcut: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.25)',
    gap: spacing.xs,
  },
  shortcutPressed: { opacity: 0.85 },
  shortcutTitle: { ...typography.body, fontFamily: FONT.bold, fontWeight: '800', color: WC.gold },
  hint: { marginTop: spacing.sm },
});
