import * as Updates from 'expo-updates';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { openTechnicalFeedback } from '@/navigation/openTechnicalFeedback';

type Props = { children: ReactNode };

type State = { hasError: boolean; lastError: Error | null };

/**
 * Évite un écran blanc si une erreur React remonte jusqu’à la racine (prod).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, lastError: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, lastError: error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.root} accessibilityRole="alert">
          <Text style={styles.title}>Un problème est survenu</Text>
          <Text style={styles.body}>
            Réessayez l’écran ou relancez l’application. Si le souci continue, mettez l’app à jour ou
            contactez le support.
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              onPress={() => this.setState({ hasError: false, lastError: null })}
              accessibilityRole="button"
              accessibilityLabel="Réessayer sans quitter l’application"
            >
              <Text style={styles.btnText}>Réessayer</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
              onPress={() => {
                void Updates.reloadAsync().catch(() => {});
              }}
              accessibilityRole="button"
              accessibilityLabel="Relancer l’application"
            >
              <Text style={styles.btnSecondaryText}>Relancer</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
              onPress={() => {
                const err = this.state.lastError;
                openTechnicalFeedback({
                  title: 'Détail technique',
                  body: 'Informations destinées au support ou à l’équipe technique. En production, évitez de partager des captures contenant des données personnelles.',
                  detail: err ? `${err.name}: ${err.message}` : undefined,
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Voir le détail de l’erreur"
            >
              <Text style={styles.btnSecondaryText}>Détail technique</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  btn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  btnSecondary: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPressed: { opacity: 0.85 },
  btnText: {
    fontWeight: '800',
    color: colors.gold,
    fontSize: 16,
  },
  btnSecondaryText: {
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: 16,
  },
});
