import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { WestCoastBackground } from '@/components/westcoast/WestCoastBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { appScreenVisual } from '@/constants/appScreenVisual';
import { ASSISTANT_MAX_MESSAGE_CHARS } from '@/constants/assistantLimits';
import { ASSISTANT_PROMPT_HINTS } from '@/constants/assistantPromptHints';
import { FONT } from '@/constants/fonts';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';
import { colors, radius, spacing } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { WC } from '@/constants/westCoastTheme';
import { sendAssistantMessage } from '@/services/assistantChat';
import { useAssistantStore, type ChatMessage } from '@/stores/useAssistantStore';

export default function AssistantChatScreen() {
  const tier = useAssistantStore((s) => s.tier);
  const messages = useAssistantStore((s) => s.messages);
  const appendMessages = useAssistantStore((s) => s.appendMessages);
  const clearChat = useAssistantStore((s) => s.clearChat);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollEnd = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  const runAssistant = useCallback(
    async (history: ChatMessage[]) => {
      setBusy(true);
      try {
        const reply = await sendAssistantMessage(history, tier);
        appendMessages({ role: 'assistant', content: reply });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        appendMessages({
          role: 'assistant',
          content: `Erreur : ${msg}. Vérifie le réseau et EXPO_PUBLIC_ASSISTANT_API_URL.`,
        });
      } finally {
        setBusy(false);
        requestAnimationFrame(scrollEnd);
      }
    },
    [tier, appendMessages, scrollEnd],
  );

  async function onSend() {
    const t = input.trim();
    if (!t || busy) return;
    const userMsg: ChatMessage = { role: 'user', content: t };
    const next: ChatMessage[] = [...messages, userMsg];
    appendMessages(userMsg);
    setInput('');
    await runAssistant(next);
  }

  async function onHint(h: string) {
    if (busy) return;
    const userMsg: ChatMessage = { role: 'user', content: h };
    const next: ChatMessage[] = [...messages, userMsg];
    appendMessages(userMsg);
    await runAssistant(next);
  }

  const planLabel = tier
    ? SUBSCRIPTION_PLANS.find((p) => p.id === tier)?.name ?? tier
    : '—';

  return (
    <WestCoastBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.thread}
          contentContainerStyle={styles.threadContent}
          onContentSizeChange={scrollEnd}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyLine}>Écris ou choisis une suggestion.</Text>
              <Text style={styles.hintLabel}>En un clic</Text>
              {ASSISTANT_PROMPT_HINTS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => onHint(h)}
                  disabled={busy}
                  style={({ pressed }) => [styles.hintChip, pressed && styles.hintChipPressed]}
                >
                  <Text style={styles.hintChipTxt}>{h}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          {messages.map((m, i) => (
            <View
              key={`${i}-${m.role}-${m.content.slice(0, 24)}`}
              style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}
            >
              <Text style={styles.bubbleRole}>{m.role === 'user' ? 'Vous' : 'Copilote'}</Text>
              <Text style={styles.bubbleText}>{m.content}</Text>
            </View>
          ))}
          {busy ? (
            <View style={styles.rowBusy}>
              <ActivityIndicator color={WC.gold} />
              <Text style={styles.busyTxt}>…</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.composer}>
          <Text style={styles.meta}>{planLabel}</Text>
          <TextInput
            mode="outlined"
            value={input}
            onChangeText={setInput}
            placeholder="Message…"
            placeholderTextColor={colors.textMuted}
            textColor={colors.text}
            outlineColor={colors.borderSubtle}
            activeOutlineColor={colors.accent}
            style={styles.input}
            multiline
            maxLength={ASSISTANT_MAX_MESSAGE_CHARS}
            editable={!busy}
            onSubmitEditing={onSend}
          />
          <View style={styles.row}>
            <PrimaryButton title="Envoyer" onPress={onSend} disabled={busy} style={styles.send} />
            <PrimaryButton title="Effacer" variant="ghost" onPress={clearChat} disabled={busy} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </WestCoastBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  thread: { flex: 1 },
  threadContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  emptyBlock: { gap: spacing.sm },
  emptyLine: { ...typography.bodyMuted, fontSize: 15 },
  hintLabel: {
    ...typography.caption,
    fontFamily: FONT.bold,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  hintChip: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  hintChipPressed: { borderColor: WC.gold },
  hintChipTxt: { ...typography.body, fontSize: 14, color: colors.text },
  bubble: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    maxWidth: '92%',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    borderColor: colors.borderGlow,
    backgroundColor: appScreenVisual.goldTint08,
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  bubbleRole: {
    ...typography.caption,
    fontFamily: FONT.bold,
    fontWeight: '800',
    color: WC.gold,
    marginBottom: 4,
  },
  bubbleText: { ...typography.body, color: colors.text },
  rowBusy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  busyTxt: { ...typography.caption, color: colors.textMuted },
  composer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.mapOverlay,
  },
  meta: {
    ...typography.caption,
    fontFamily: FONT.medium,
    color: colors.textMuted,
    fontWeight: '700',
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.glass,
  },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  send: { flex: 1, minWidth: 0 },
});
