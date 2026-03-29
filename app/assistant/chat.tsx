import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { HuskoBackground } from '@/components/HuskoBackground';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ASSISTANT_PROMPT_HINTS } from '@/constants/assistantPromptHints';
import { colors, radius, spacing } from '@/constants/theme';
import { typography } from '@/constants/typography';
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

  async function onSend() {
    const t = input.trim();
    if (!t || busy) return;
    const userMsg: ChatMessage = { role: 'user', content: t };
    const next: ChatMessage[] = [...messages, userMsg];
    appendMessages(userMsg);
    setInput('');
    setBusy(true);
    try {
      const reply = await sendAssistantMessage(next, tier);
      appendMessages({ role: 'assistant', content: reply });
    } finally {
      setBusy(false);
      requestAnimationFrame(scrollEnd);
    }
  }

  return (
    <HuskoBackground>
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
              <Text style={styles.emptyTitle}>Copilote</Text>
              <Text style={styles.empty}>
                Pose une question ou choisis une entrée : le serveur applique un raisonnement structuré
                et calibre la profondeur selon ton forfait.
              </Text>
              <Text style={styles.hintLabel}>Suggestions</Text>
              {ASSISTANT_PROMPT_HINTS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => setInput(h)}
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
              <Text style={styles.bubbleRole}>{m.role === 'user' ? 'Vous' : 'Assistant'}</Text>
              <Text style={styles.bubbleText}>{m.content}</Text>
            </View>
          ))}
          {busy ? (
            <View style={styles.rowBusy}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.busyTxt}>Synthèse en cours…</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.composer}>
          <Text style={styles.tierHint}>
            Forfait envoyé au serveur : {tier ?? 'aucun (null)'}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Votre message…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
              editable={!busy}
              onSubmitEditing={onSend}
            />
            <PrimaryButton title="Envoyer" onPress={onSend} disabled={busy} style={styles.send} />
          </View>
          <PrimaryButton title="Effacer la conversation" variant="ghost" onPress={clearChat} />
        </View>
      </KeyboardAvoidingView>
    </HuskoBackground>
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
  emptyBlock: { gap: spacing.md },
  emptyTitle: {
    ...typography.section,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  empty: { ...typography.bodyMuted, lineHeight: 22 },
  hintLabel: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  hintChip: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.glass,
  },
  hintChipPressed: { opacity: 0.85, borderColor: colors.gold },
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
    backgroundColor: 'rgba(240, 208, 80, 0.08)',
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    borderColor: colors.borderSubtle,
    backgroundColor: colors.glass,
  },
  bubbleRole: { ...typography.caption, fontWeight: '800', color: colors.gold, marginBottom: 4 },
  bubbleText: { ...typography.body, color: colors.text },
  rowBusy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  busyTxt: { ...typography.caption, color: colors.textMuted },
  composer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: 'rgba(18, 4, 4, 0.92)',
  },
  tierHint: { ...typography.caption, color: colors.textMuted },
  inputRow: { gap: spacing.sm },
  input: {
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  send: { width: '100%' },
});
