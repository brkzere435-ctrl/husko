/**
 * Liaison locale / production : l’app Copilote envoie POST { messages, tier } → réponse { reply }.
 *
 * Variables (serveur uniquement) :
 *   OPENAI_API_KEY       — obligatoire pour de vraies réponses
 *   OPENAI_MODEL         — défaut gpt-4o-mini
 *   ASSISTANT_PORT       — défaut 8787 (ou PORT si défini)
 *   ASSISTANT_API_BEARER — optionnel ; si défini, exige Authorization: Bearer <même valeur>
 *   OPENAI_MODEL_ESSENTIEL / OPENAI_MODEL_PRO / OPENAI_MODEL_PREMIUM — surcharge par forfait (sinon OPENAI_MODEL ou gpt-4o-mini)
 *
 * App (.env dev) :
 *   EXPO_PUBLIC_ASSISTANT_API_URL=http://<IP_LAN>:8787/chat
 *   EXPO_PUBLIC_ASSISTANT_API_TOKEN=<même secret que ASSISTANT_API_BEARER si tu l’utilises>
 *
 * Écoute 0.0.0.0 pour téléphone sur le même Wi‑Fi. Émulateur Android : souvent http://10.0.2.2:8787/chat
 */
import { existsSync, readFileSync } from 'node:fs';
import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Charge la racine `.env` sans dépendance (ne remplace pas une variable déjà définie dans le shell). */
function loadRootDotEnv() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const p = join(root, '.env');
  if (!existsSync(p)) return;
  const text = readFileSync(p, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadRootDotEnv();

const PORT = Number(process.env.ASSISTANT_PORT || process.env.PORT || 8787);
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const MODEL_DEFAULT = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const BEARER = process.env.ASSISTANT_API_BEARER?.trim();

/** Modèle OpenAI selon le forfait (verbosité / coût calibrables côté serveur). */
function resolveModelForTier(tier) {
  const ess = process.env.OPENAI_MODEL_ESSENTIEL?.trim();
  const pro = process.env.OPENAI_MODEL_PRO?.trim();
  const prem = process.env.OPENAI_MODEL_PREMIUM?.trim();
  if (tier === 'premium') return prem || pro || MODEL_DEFAULT;
  if (tier === 'pro') return pro || MODEL_DEFAULT;
  if (tier === 'essentiel') return ess || MODEL_DEFAULT;
  return MODEL_DEFAULT;
}

function tierSampling(tier) {
  if (tier === 'premium') return { max_tokens: 4096, temperature: 0.72 };
  if (tier === 'pro') return { max_tokens: 2800, temperature: 0.65 };
  if (tier === 'essentiel') return { max_tokens: 1400, temperature: 0.58 };
  return { max_tokens: 2200, temperature: 0.64 };
}

function buildSystemPrompt(tier, locale) {
  const lang =
    locale === 'en'
      ? 'Réponds en anglais si la question est en anglais ; sinon en français.'
      : 'Réponds en français par défaut, sauf si l’utilisateur écrit clairement dans une autre langue.';
  const depth =
    tier === 'premium'
      ? 'Profondeur : élevée — analyse fine, alternatives, risques, synthèse exploitable.'
      : tier === 'pro'
        ? 'Profondeur : intermédiaire — structuré, exemples quand utile, sans remplissage.'
        : tier === 'essentiel'
          ? 'Profondeur : essentielle — réponses courtes et directes, listes si pertinent.'
          : 'Profondeur : adaptée au sujet — reste utile sans verbosité inutile.';
  return `Tu es Husko Copilote, assistant pour clarifier, concevoir et décider (ex. restauration, livraison, exploitation nocturne, et sujets généraux pro).

${lang}
${depth}
Style : précision, honnêteté intellectuelle. Si une information manque, dis-le et indique quoi vérifier.
Raisonnement : sur les sujets complexes, structure implicitement (cadrage → options → recommandation).
Limites : pas d’aide à l’illégal ; pas de données personnelles inventées ; pas d’accès Internet ni aux systèmes de l’utilisateur hors ce qu’il écrit ici.
Forfait signalé par l’app : ${tier ?? 'non précisé'} — calibre la longueur, pas l’intégrité des réponses.`;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '*';
  const baseH = { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, baseH);
    res.end();
    return;
  }

  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `http://${host}`);
  const pathOk = url.pathname === '/chat' || url.pathname === '/';

  if (req.method !== 'POST' || !pathOk) {
    res.writeHead(404, baseH);
    res.end(JSON.stringify({ reply: 'Utilise POST /chat avec { "messages": [...], "tier": "premium" }.' }));
    return;
  }

  if (BEARER) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${BEARER}`) {
      res.writeHead(401, baseH);
      res.end(JSON.stringify({ reply: 'Non autorisé (Bearer).' }));
      return;
    }
  }

  const body = await readJsonBody(req);
  if (!body || !Array.isArray(body.messages)) {
    res.writeHead(400, baseH);
    res.end(JSON.stringify({ reply: 'JSON invalide : messages[] requis.' }));
    return;
  }

  if (!OPENAI_KEY) {
    res.writeHead(200, baseH);
    res.end(
      JSON.stringify({
        reply:
          'Le serveur n’a pas OPENAI_API_KEY. Exporte la variable puis relance : npm run assistant:server',
      }),
    );
    return;
  }

  const tier = body.tier ?? null;
  const locale = typeof body.locale === 'string' ? body.locale : 'fr';
  const model = resolveModelForTier(tier);
  const { max_tokens, temperature } = tierSampling(tier);

  const openaiMessages = [
    {
      role: 'system',
      content: buildSystemPrompt(tier, locale),
    },
    ...body.messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content ?? ''),
    })),
  ];

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 90_000);
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        max_tokens,
        temperature,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      const err = data?.error?.message || JSON.stringify(data).slice(0, 500);
      res.writeHead(200, baseH);
      res.end(JSON.stringify({ reply: `Erreur OpenAI : ${err}` }));
      return;
    }
    const reply = data.choices?.[0]?.message?.content ?? '';
    res.writeHead(200, baseH);
    res.end(JSON.stringify({ reply }));
  } catch (e) {
    const errMsg = e?.name === 'AbortError' ? 'OpenAI : délai dépassé (90 s).' : `Erreur réseau : ${e?.message || String(e)}`;
    res.writeHead(200, baseH);
    res.end(JSON.stringify({ reply: errMsg }));
  } finally {
    clearTimeout(to);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[husko assistant-chat] POST http://0.0.0.0:${PORT}/chat`);
});
