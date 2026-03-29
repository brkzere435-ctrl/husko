/**
 * Génère les PNG des QR (gérant, client, livreur) depuis distribution.defaults.json
 * Couleurs distinctes par rôle (or / vert / bleu).
 */
import { mkdirSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import QRCode from 'qrcode';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const defaultsPath = join(root, 'distribution.defaults.json');

/** dark (modules QR) + light (fond) par rôle */
const ROLE_QR = {
  gerant: { dark: '#f0d050', light: '#1a0808' },
  client: { dark: '#4ade80', light: '#0a1a12' },
  livreur: { dark: '#60a5fa', light: '#0c1424' },
};

if (!existsSync(defaultsPath)) {
  console.error('Fichier introuvable : distribution.defaults.json');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(defaultsPath, 'utf8'));
const outDir = join(root, 'assets', 'distribution-qr');
mkdirSync(outDir, { recursive: true });

const entries = Object.entries(raw).filter(([k]) => !k.startsWith('_'));

for (const [name, url] of entries) {
  if (typeof url !== 'string' || !url.startsWith('http')) {
    console.warn(`Ignoré : ${name}`);
    continue;
  }
  const colors = ROLE_QR[name] ?? ROLE_QR.gerant;
  const out = join(outDir, `${name}.png`);
  await QRCode.toFile(out, url, {
    width: 512,
    margin: 2,
    color: {
      dark: colors.dark,
      light: colors.light,
    },
  });
  console.log('OK', out);
}

console.log('\nTerminé. Fichiers dans assets/distribution-qr/ (gerant.png, client.png, livreur.png)');
