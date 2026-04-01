/**
 * Verifie les 6 EXPO_PUBLIC_FIREBASE_* dans .env (sans afficher les valeurs).
 * Usage :
 *   node scripts/check-firebase-env.mjs          — exit 0, detail des manques
 *   node scripts/check-firebase-env.mjs --strict — exit 1 si une cle manque (CI / avant eas build)
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

const KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

function parseEnvFile() {
  if (!existsSync(envPath)) return {};
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

function ok(v) {
  const s = String(v ?? '').trim();
  return s.length > 0 && !s.includes('REMPLACEZ');
}

const strict = process.argv.includes('--strict');
const env = parseEnvFile();
const missing = KEYS.filter((k) => !ok(env[k]));

console.log('\n[Husko — firebase:env:check]\n');

if (!existsSync(envPath)) {
  console.log('Fichier .env introuvable — copie : npm run setup:env');
  console.log('');
  process.exit(strict ? 1 : 0);
}

for (const k of KEYS) {
  if (ok(env[k])) {
    console.log(`  OK   ${k}`);
    continue;
  }
  const emptyInFile = Object.prototype.hasOwnProperty.call(env, k) && String(env[k] ?? '').trim() === '';
  console.log(
    emptyInFile
      ? `  MANQ ${k}  (cle presente, valeur vide apres =)`
      : `  MANQ ${k}`,
  );
}

console.log('');

if (missing.length === 0) {
  console.log('Firebase (.env) : complet — npm run eas:sync:firebase puis eas build.');
  console.log('');
  process.exit(0);
}

console.log(`Firebase (.env) : incomplet (${missing.length} variable(s)) — sync multi-appareils impossible dans l'APK.`);
console.log('  Renseigner env.example vers .env puis : npm run eas:sync:firebase');
console.log('');

if (strict) {
  process.exit(1);
}
process.exit(0);
