/**
 * Liaison locale / production : l’app Copilote envoie POST { messages, tier } → réponse { reply }.
 *
 * Variables (serveur uniquement) :
 *   OPENAI_API_KEY       — obligatoire pour de vraies réponses
 *   OPENAI_MODEL         — défaut gpt-4o-mini
 *   ASSISTANT_PORT       — défaut 8787 (ou PORT si défini)
 *   ASSISTANT_API_BEARER — optionnel ; si défini, exige Authorization: Bearer <même valeur>
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
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const BEARER = process.env.ASSISTANT_API_BEARER?.trim();

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
  const openaiMessages = [
    {
      role: 'system',
      content: `Tu es Husko Copilote : assistant clair et concis. Forfait abonné côté app : ${tier ?? 'non précisé'}.`,
    },
    ...body.messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content ?? ''),
    })),
  ];

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: MODEL, messages: openaiMessages }),
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
    res.writeHead(200, baseH);
    res.end(JSON.stringify({ reply: `Erreur réseau : ${e?.message || String(e)}` }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[husko assistant-chat] POST http://0.0.0.0:${PORT}/chat`);
});
