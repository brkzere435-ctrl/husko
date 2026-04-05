/**
 * Déploie firestore.rules vers le projet Firebase indiqué dans .env
 * (évite firebase use --add sur une machine neuve).
 */
import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

function parseEnvFile() {
  if (!existsSync(envPath)) {
    console.error('[Husko] Fichier .env introuvable à la racine du dépôt.');
    process.exit(1);
  }
  const raw = readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = parseEnvFile();
const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim();
if (!projectId) {
  console.error('[Husko] EXPO_PUBLIC_FIREBASE_PROJECT_ID manquant dans .env');
  process.exit(1);
}

const tokenFromFile = env.FIREBASE_TOKEN?.trim();
if (tokenFromFile && !process.env.FIREBASE_TOKEN) {
  process.env.FIREBASE_TOKEN = tokenFromFile;
}

console.log(`[Husko] Déploiement firestore:rules → projet Firebase "${projectId}" …`);

const r = spawnSync(
  'npx',
  ['--yes', 'firebase-tools@14', 'deploy', '--only', 'firestore:rules', '--project', projectId],
  { cwd: root, stdio: 'inherit', shell: true, env: process.env }
);

process.exit(r.status ?? 1);
