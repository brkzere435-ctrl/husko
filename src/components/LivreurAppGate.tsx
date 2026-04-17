import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FirstPinChangeForm } from '@/components/FirstPinChangeForm';
import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { DEFAULT_ROLE_PIN } from '@/constants/devicePin';
import { appScreenVisual } from '@/constants/appScreenVisual';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WC } from '@/constants/westCoastTheme';
import { useHuskoStore } from '@/stores/useHuskoStore';
import { hapticLight } from '@/utils/haptics';

type Props = { children: ReactNode };

/** Verrou livreur + changement obligatoire du code à la 1ʳᵉ connexion. */
export function LivreurAppGate({ children }: Props) {
  const livreurPin = useHuskoStore((s) => s.livreurPin);
  const livreurPinOnboarded = useHuskoStore((s) => s.livreurPinOnboarded);
  const completeLivreurPinSetup = useHuskoStore((s) => s.completeLivreurPinSetup);
  const setLivreurPin = useHuskoStore((s) => s.setLivreurPin);

  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [forcePinRotation, setForcePinRotation] = useState(false);
  const autoUnlockTriggeredRef = useRef(false);

  const enteredDefaultPin = pin === DEFAULT_ROLE_PIN;
  const isAcceptedPin = pin === livreurPin || enteredDefaultPin;
  const shouldShowRotationForm = !livreurPinOnboarded || forcePinRotation;

  function tryUnlock() {
    autoUnlockTriggeredRef.current = true;
    if (isAcceptedPin) {
      if (enteredDefaultPin && livreurPin !== DEFAULT_ROLE_PIN) {
        setLivreurPin(DEFAULT_ROLE_PIN);
        setForcePinRotation(true);
      }
      setUnlocked(true);
      hapticLight();
    } else {
      Alert.alert('Code incorrect');
    }
  }

  useEffect(() => {
    if (unlocked) return;
    if (autoUnlockTriggeredRef.current) return;
    if (pin.length < 4) return;
    if (!isAcceptedPin) return;
    autoUnlockTriggeredRef.current = true;
    if (enteredDefaultPin && livreurPin !== DEFAULT_ROLE_PIN) {
      setLivreurPin(DEFAULT_ROLE_PIN);
      setForcePinRotation(true);
    }
    setUnlocked(true);
    hapticLight();
  }, [enteredDefaultPin, isAcceptedPin, livreurPin, pin, setLivreurPin, unlocked]);

  if (!unlocked) {
    return (
      <WestCoastBackground>
        <SafeAreaView style={styles.lockRoot} edges={['bottom']}>
          <View style={styles.lockCard}>
            <Text style={typography.title}>Livreur</Text>
            <Text style={[typography.bodyMuted, styles.hint]}>
              {!livreurPinOnboarded
                ? `Première ouverture : code ${DEFAULT_ROLE_PIN}, puis vous choisirez le vôtre.`
                : 'Saisissez votre code livreur.'}
            </Text>
            <TextInput
              value={pin}
              onChangeText={setPin}
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <PrimaryButton title="Continuer" onPress={tryUnlock} />
          </View>
        </SafeAreaView>
      </WestCoastBackground>
    );
  }

  if (shouldShowRotationForm) {
    return (
      <WestCoastBackground>
        <SafeAreaView style={styles.setupRoot} edges={['bottom']}>
          <FirstPinChangeForm
            title="Votre code livreur"
            subtitle="Remplacez le code par défaut. 4 à 8 chiffres, différent de l’installation."
            onSubmit={(newPin) => {
              completeLivreurPinSetup(newPin);
              setForcePinRotation(false);
              hapticLight();
            }}
          />
        </SafeAreaView>
      </WestCoastBackground>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  lockRoot: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  setupRoot: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', padding: spacing.lg },
  lockCard: {
    backgroundColor: appScreenVisual.overlay045,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: WC.neonCyanDim,
    padding: spacing.xl,
    gap: spacing.md,
  },
  hint: { textAlign: 'center' },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
});
