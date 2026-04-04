import type { ReactNode } from 'react';
import { StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';

import { typography } from '@/constants/typography';
import { colors, radius, spacing } from '@/constants/theme';
import { WC, wcSectionLabel } from '@/constants/westCoastTheme';

type SectionProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  style?: ViewStyle;
};

/** Carte de section réglages (West Coast) — titre néon, bordure cyan. */
export function SettingsSection({ title, subtitle, children, style }: SectionProps) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={[wcSectionLabel, styles.title]}>{title}</Text> : null}
      {subtitle ? <Text style={[typography.bodyMuted, styles.subtitle]}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

type SwitchRowProps = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  hint?: string;
};

export function SettingsSwitchRow({ label, value, onValueChange, hint }: SwitchRowProps) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={[typography.body, styles.rowLabel]}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.switchTrackOff, true: colors.accentDim }}
        />
      </View>
      {hint ? (
        <Text style={[typography.caption, styles.hint]} accessibilityLiveRegion="polite">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: WC.neonCyanDim,
    backgroundColor: colors.cardElevated,
    gap: spacing.sm,
  },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.xs, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowLabel: { flex: 1, minWidth: 0 },
  hint: { marginTop: spacing.xs, color: colors.textMuted, lineHeight: 18 },
});
