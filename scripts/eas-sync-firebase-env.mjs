/**
 * Pousse EXPO_PUBLIC_FIREBASE_* depuis .env vers EAS (production + preview), scope projet.
 * Les builds Android (apk-assistant, apk-gerant, apk-livreur, apk-client, apk-unified)
 * utilisent ces variables au build si configurées dans EAS — une seule source Firebase suffit.
 * Prérequis : eas login, projet lié. Usage : npm run eas:sync:firebase
 */
import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

function parseEnvFile() {
  if (!existsSync(envPath)) {
    console.error('[Husko] .env introuvable');
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

const KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

function pushVar(name, value) {
  if (!value || String(value).includes('REMPLACEZ')) {
    console.warn(`[Husko] Skip ${name} (vide ou placeholder)`);
    return;
  }
  const args = [
    'eas-cli',
    'env:create',
    '--name',
    name,
    '--value',
    value,
    '--environment',
    'production',
    '--environment',
    'preview',
    '--scope',
    'project',
    '--visibility',
    'sensitive',
    '--non-interactive',
    '--force',
  ];
  const r = spawnSync('npx', args, { cwd: root, encoding: 'utf8', shell: true });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) {
    console.error(`[Husko] Échec pour ${name} (code ${r.status})`);
    process.exit(r.status ?? 1);
  }
  console.log(`[Husko] OK — ${name} (production + preview)`);
}

const env = parseEnvFile();
console.log('[Husko] Sync Firebase → EAS …\n');
for (const k of KEYS) {
  pushVar(k, env[k]);
}
console.log('\n[Husko] Terminé. Prochain build EAS embarquera les variables Firebase publiques.');
