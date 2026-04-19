import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { isGoogleAuthConfigured, signInWithGoogleToken, signOutGoogleAuth } from '@/services/googleAuth';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

WebBrowser.maybeCompleteAuthSession();

export default function ClientReglagesScreen() {
  const notificationsEnabled = useHuskoStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useHuskoStore((s) => s.setNotificationsEnabled);
  const clientAuthUid = useHuskoStore((s) => s.clientAuthUid);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const extra = readHuskoExpoExtra();
  const googleConfigured = isGoogleAuthConfigured();
  const authLabel = useMemo(() => {
    if (!clientAuthUid) return 'Non connecté';
    return `Connecté (${clientAuthUid.slice(0, 8)}...)`;
  }, [clientAuthUid]);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: extra.googleAuthWebClientId || undefined,
    androidClientId: extra.googleAuthAndroidClientId || undefined,
    iosClientId: extra.googleAuthIosClientId || undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (!response) return;
    if (response.type !== 'success') {
      if (response.type === 'error') {
        setAuthError('Connexion Google refusée ou interrompue.');
      }
      return;
    }
    const idToken =
      response.params?.id_token ??
      response.authentication?.idToken ??
      response.authentication?.accessToken ??
      '';
    const accessToken = response.authentication?.accessToken;
    if (!idToken) {
      setAuthError('Token Google manquant, vérifiez la config OAuth.');
      return;
    }
    setAuthBusy(true);
    setAuthError(null);
    void signInWithGoogleToken(idToken, accessToken)
      .then(() => {
        setAuthError(null);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Échec de connexion Google.';
        setAuthError(msg);
      })
      .finally(() => {
        setAuthBusy(false);
      });
  }, [response]);

  async function handleGoogleSignIn() {
    if (!googleConfigured) {
      setAuthError('Google Auth non configuré (IDs OAuth manquants).');
      return;
    }
    if (!request) {
      setAuthError('Auth Google pas encore prête, réessayez.');
      return;
    }
    setAuthError(null);
    setAuthBusy(true);
    try {
      await promptAsync();
    } catch {
      setAuthError('Impossible d’ouvrir la connexion Google.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleGoogleSignOut() {
    setAuthBusy(true);
    try {
      await signOutGoogleAuth();
      setAuthError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Déconnexion impossible.';
      setAuthError(msg);
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <WestCoastBackground preset="client">
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle} accessibilityRole="header">
            Réglages
          </Text>
          <Text style={[typography.bodyMuted, styles.screenSubtitle]}>
            Notifications, contact et historique — tout au même endroit.
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
            title="Compte Google"
            subtitle="Connexion recommandée pour fiabiliser l’identité client et la synchro multi-appareils."
          >
            <Text style={styles.authState}>{authLabel}</Text>
            {authError ? <Text style={styles.authError}>{authError}</Text> : null}
            <View style={styles.authRow}>
              {clientAuthUid ? (
                <PrimaryButton
                  title={authBusy ? 'Déconnexion…' : 'Se déconnecter'}
                  variant="ghost"
                  onPress={handleGoogleSignOut}
                  disabled={authBusy}
                />
              ) : (
                <PrimaryButton
                  title={authBusy ? 'Connexion…' : 'Se connecter avec Google'}
                  onPress={handleGoogleSignIn}
                  disabled={authBusy || !googleConfigured}
                />
              )}
            </View>
            {!googleConfigured ? (
              <Text style={styles.authHint}>
                Admin requis: renseigner EXPO_PUBLIC_GOOGLE_AUTH_WEB/ANDROID/IOS_CLIENT_ID dans `.env`
                puis rebuild natif.
              </Text>
            ) : null}
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
  authState: {
    ...typography.body,
    color: WC.white,
    marginBottom: spacing.sm,
  },
  authError: {
    ...typography.caption,
    color: colors.posterRed,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  authHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  authRow: {
    gap: spacing.sm,
  },
  hint: { marginTop: spacing.sm },
});
