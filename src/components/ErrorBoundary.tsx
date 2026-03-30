import * as Updates from 'expo-updates';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = { children: ReactNode };

type State = { hasError: boolean };

/**
 * Évite un écran blanc si une erreur React remonte jusqu’à la racine (prod).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error.message, info.componentStack);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.root} accessibilityRole="alert">
          <Text style={styles.title}>Un problème est survenu</Text>
          <Text style={styles.body}>
            Relancez l’application. Si le souci continue, mettez l’app à jour ou contactez le support.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={() => {
              void Updates.reloadAsync().catch(() => {});
            }}
            accessibilityRole="button"
            accessibilityLabel="Relancer l’application"
          >
            <Text style={styles.btnText}>Relancer</Text>
          </Pressable>
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
  btn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.borderGlow,
  },
  btnPressed: { opacity: 0.85 },
  btnText: {
    fontWeight: '800',
    color: colors.gold,
    fontSize: 16,
  },
});
