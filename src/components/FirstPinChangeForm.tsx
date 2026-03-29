import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { DEFAULT_ROLE_PIN, isPinValidFormat } from '@/constants/devicePin';
import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  title: string;
  subtitle: string;
  onSubmit: (newPin: string) => void;
};

export function FirstPinChangeForm({ title, subtitle, onSubmit }: Props) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  function save() {
    const p1 = a.trim();
    const p2 = b.trim();
    if (!isPinValidFormat(p1)) {
      Alert.alert('Code invalide', 'Utilisez 4 à 8 chiffres.');
      return;
    }
    if (p1 !== p2) {
      Alert.alert('Confirmation', 'Les deux codes ne correspondent pas.');
      return;
    }
    if (p1 === DEFAULT_ROLE_PIN) {
      Alert.alert('Sécurité', 'Choisissez un code différent du code par défaut d’installation.');
      return;
    }
    onSubmit(p1);
  }

  return (
    <View style={styles.card}>
      <Text style={typography.title}>{title}</Text>
      <Text style={[typography.bodyMuted, styles.sub]}>{subtitle}</Text>
      <TextInput
        value={a}
        onChangeText={setA}
        placeholder="Nouveau code"
        keyboardType="number-pad"
        secureTextEntry
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={b}
        onChangeText={setB}
        placeholder="Confirmer"
        keyboardType="number-pad"
        secureTextEntry
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <PrimaryButton title="Enregistrer mon code" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
    gap: spacing.md,
  },
  sub: { textAlign: 'center' },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.md,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
});
