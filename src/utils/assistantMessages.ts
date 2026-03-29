import {
  ASSISTANT_MAX_MESSAGE_CHARS,
  ASSISTANT_MAX_TURNS,
} from '@/constants/assistantLimits';
import type { ChatMessage } from '@/stores/useAssistantStore';

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}\n… [tronqué]`;
}

/** Derniers tours + troncature : limite coût API et erreurs de payload. */
export function prepareMessagesForApi(messages: ChatMessage[]): ChatMessage[] {
  const slice = messages.slice(-ASSISTANT_MAX_TURNS);
  return slice.map((m) => ({
    role: m.role,
    content: clip(m.content, ASSISTANT_MAX_MESSAGE_CHARS),
  }));
}
