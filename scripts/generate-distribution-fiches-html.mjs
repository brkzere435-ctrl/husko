/**
 * Fiches imprimables (gérant) : logo textuel + QR + URL par APK.
 * Sortie : distribution-fiches.html à la racine du dépôt.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import QRCode from 'qrcode';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const defaultsPath = join(root, 'distribution.defaults.json');

if (!existsSync(defaultsPath)) {
  console.error('distribution.defaults.json introuvable');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(defaultsPath, 'utf8'));
const entries = Object.entries(raw).filter(([k]) => !k.startsWith('_'));

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ROLE_QR = {
  unified: { dark: '#22d3ee', light: '#081a1c', title: 'UNIFIÉ (cyan)', border: 'rgba(34, 211, 238, 0.5)' },
  assistant: { dark: '#e879f9', light: '#1a0c18', title: 'COPILOTE (magenta)', border: 'rgba(232, 121, 249, 0.5)' },
  gerant: { dark: '#f0d050', light: '#1a0808', title: 'GÉRANT (or)', border: 'rgba(240, 208, 80, 0.55)' },
  client: { dark: '#4ade80', light: '#0a1a12', title: 'CLIENT (vert)', border: 'rgba(74, 222, 128, 0.55)' },
  livreur: { dark: '#60a5fa', light: '#0c1424', title: 'LIVREUR (bleu)', border: 'rgba(96, 165, 250, 0.55)' },
};

const cards = [];
for (const [key, url] of entries) {
  if (typeof url !== 'string' || !url.startsWith('http')) continue;
  const role = ROLE_QR[key] ?? ROLE_QR.gerant;
  const label =
    key === 'unified'
      ? 'APK unifié (hub) — page Expo'
      : key === 'assistant'
        ? 'APK Copilote — page Expo'
        : key === 'gerant'
          ? 'APK Gérant — page Expo'
          : key === 'client'
            ? 'APK Client — page Expo'
            : key === 'livreur'
              ? 'APK Livreur — page Expo'
              : key;
  const dataUrl = await QRCode.toDataURL(url, {
    width: 320,
    margin: 2,
    color: { dark: role.dark, light: role.light },
  });
  cards.push({ key, label, url, dataUrl, role });
}

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Husko — Fiches distribution APK</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, Segoe UI, Roboto, sans-serif;
      background: #0f0606;
      color: #f5e6dc;
      padding: 24px;
    }
    h1 {
      font-size: 1.5rem;
      color: #f0d050;
      margin: 0 0 8px;
    }
    .sub {
      color: #b8a090;
      font-size: 0.95rem;
      max-width: 720px;
      margin-bottom: 28px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
    .card {
      border: 1px solid rgba(240, 208, 80, 0.35);
      border-radius: 16px;
      padding: 20px;
      background: rgba(26, 8, 8, 0.85);
      break-inside: avoid;
    }
    .card h2 {
      margin: 0 0 12px;
      font-size: 1.1rem;
      color: #f0d050;
    }
    .qr {
      display: block;
      width: 100%;
      max-width: 280px;
      height: auto;
      margin: 0 auto 16px;
      border-radius: 8px;
    }
    .url {
      font-size: 11px;
      word-break: break-all;
      color: #c9b8a8;
      line-height: 1.4;
    }
    .brand {
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #f0d050;
      margin-bottom: 4px;
    }
    .role-tag {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      margin-bottom: 8px;
    }
    @media print {
      body { background: #fff; color: #111; }
      .card { border-color: #333; background: #fff; }
      .card h2, .brand, h1 { color: #111; }
      .sub { color: #444; }
      .url { color: #222; }
    }
  </style>
</head>
<body>
  <div class="brand">HUSKO</div>
  <h1>Distribution APK — sandwicherie</h1>
  <p class="sub">
    QR <strong>cyan / magenta / or / vert / bleu</strong> : ne pas intervertir. Chaque QR ouvre la page Expo (installation sur téléphone).
    Fichier <code>.apk</code> sur PC : <code>npm run apk:download:all</code> (ou unified / assistant). Mettez à jour
    <code>distribution.defaults.json</code> puis <code>npm run distribution:fiches</code>.
  </p>
  <div class="grid">
${cards
  .map(
    (c) => `    <section class="card" style="border-color:${esc(c.role.border)}">
      <div class="role-tag" style="color:${esc(c.role.dark)}">${esc(c.role.title)}</div>
      <h2>${esc(c.label)}</h2>
      <img class="qr" alt="QR ${esc(c.label)}" src="${c.dataUrl}" />
      <p class="url">${esc(c.url)}</p>
    </section>`
  )
  .join('\n')}
  </div>
</body>
</html>
`;

const out = join(root, 'distribution-fiches.html');
writeFileSync(out, html, 'utf8');
console.log('OK', out);
