import type { SubscriptionTierId } from '@/constants/subscriptionPlans';
import type { ChatMessage } from '@/stores/useAssistantStore';
import { prepareMessagesForApi } from '@/utils/assistantMessages';
import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

function assistantApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_ASSISTANT_API_URL?.trim();
  const fromExtra = readHuskoExpoExtra().assistantApiUrl?.trim();
  return fromEnv || fromExtra || '';
}

/**
 * Envoie l’historique à ton backend (HTTPS). Le backend appelle OpenAI / Anthropic / etc.
 * Ne mets jamais de clé secrète dans l’APK.
 */
export async function sendAssistantMessage(
  messages: ChatMessage[],
  tier: SubscriptionTierId | null,
): Promise<string> {
  const url = assistantApiUrl();
  if (!url) {
    return (
      'Configure EXPO_PUBLIC_ASSISTANT_API_URL (URL HTTPS de ton API) pour activer les réponses. ' +
      'Exemple de corps attendu : { "messages": [...], "tier": "essentiel"|"pro"|"premium"|null }.'
    );
  }

  const token = process.env.EXPO_PUBLIC_ASSISTANT_API_TOKEN?.trim();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 120_000);
  const payload = {
    messages: prepareMessagesForApi(messages),
    tier,
    locale: 'fr' as const,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('abort') || msg === 'Aborted')
      return 'Délai dépassé (2 min). Réessaie ou vérifie le réseau / le serveur.';
    return `Réseau : ${msg}`;
  } finally {
    clearTimeout(t);
  }

  const text = await res.text();
  if (!res.ok) {
    return `Erreur serveur (${res.status}). ${text.slice(0, 400)}`;
  }

  try {
    const data = JSON.parse(text) as { reply?: string; message?: string; content?: string };
    const reply = data.reply ?? data.message ?? data.content;
    if (typeof reply === 'string' && reply.length > 0) return reply;
  } catch {
    if (text.length > 0) return text;
  }
  return 'Réponse vide du serveur.';
}
