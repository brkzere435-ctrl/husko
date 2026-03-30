/**
 * Vue d’ensemble avant build / publication : Maps, Firebase, EAS (sans afficher de secrets).
 * Usage : npm run release:check
 */
import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const expoCli = join(root, 'node_modules', 'expo', 'bin', 'cli');

function parseEnvFile() {
  const envPath = join(root, '.env');
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

function hasRealKey(v) {
  const s = String(v ?? '').trim();
  return s.length > 0 && !s.includes('REMPLACEZ');
}

const hasGitMeta = existsSync(join(root, '.git'));
const envForExpo = { ...process.env };
if (!hasGitMeta && process.env.EAS_NO_VCS === undefined) {
  envForExpo.EAS_NO_VCS = '1';
}

const r = spawnSync(process.execPath, [expoCli, 'config', '--json'], {
  cwd: root,
  encoding: 'utf8',
  env: envForExpo,
});

let cfg;
try {
  cfg = JSON.parse(r.stdout || '{}');
} catch {
  cfg = {};
}

const env = parseEnvFile();
const localAndroid = hasRealKey(env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY);
const localIos = hasRealKey(env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY);
const mapsOk = cfg.extra?.mapsAndroidKeyOk === true && cfg.extra?.mapsIosKeyOk === true;
const fbOk = hasRealKey(env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) && hasRealKey(env.EXPO_PUBLIC_FIREBASE_API_KEY);
const pid = cfg.extra?.eas?.projectId ?? '(manquant)';

console.log('\n[Husko — release:check]\n');
console.log('Parcours EAS (ordre conseillé) :');
console.log('  1. eas login');
console.log('  2. npm run eas:credentials   — keystores / certificats Apple & Android');
console.log('  3. npm run eas:sync:maps     — clés Maps → EAS (production + preview)');
console.log('  4. npm run eas:prebuild      — release:check + validate:expo (avant eas build)');
console.log('  5. npm run build:apk:unified — APK tout-en-un (hub) ; ou build:apk:all (5 APK) / build:apk:mono (3)');
console.log('  6. npm run eas:update:hub     — ou eas:update:client / gerant / livreur / assistant');
console.log('  Raccourci : npm run release:doctor — security:check + eas:prebuild (avant une release sérieuse)');
console.log('');
console.log('EAS projectId :', pid);
console.log('Bundle / slug :', cfg.slug, '|', cfg.name);
console.log('');
console.log('Google Maps (.env local)     : Android', localAndroid ? 'renseigné' : 'vide / placeholder');
console.log('                             : iOS    ', localIos ? 'renseigné' : 'vide / placeholder');
console.log('expo config (clés réelles)   :', mapsOk ? 'OK (tuiles Maps possibles au build)' : 'NON — fallback radar GTA en app si build sans vraie clé');
console.log('Firebase (.env)              :', fbOk ? 'min. OK (sync multi-appareils possible)' : 'incomplet — données locales seules');
console.log('');
console.log('OTA vs build natif :');
console.log('  • eas update = bundle JS uniquement (pas de nouvelles clés natives).');
console.log('  • Nouvelles clés Maps / changement plugin natif / bump deps natives → eas build obligatoire.');
console.log('  • Aligner les variables EAS sur production ET preview si tu utilises les deux profils.');
console.log('');
if (!mapsOk || !fbOk) {
  console.log('À faire :');
  if (!mapsOk) {
    console.log('  • Coller EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY et _IOS dans .env');
    console.log('  • Même paire dans expo.dev → Environment variables (build)');
    console.log('  • Activer Maps SDK for Android + iOS sur Google Cloud');
    console.log('  • Relancer un eas build (pas seulement eas update)');
  }
  if (!fbOk) {
    console.log('  • Renseigner EXPO_PUBLIC_FIREBASE_* pour commandes / livreur synchronisés');
  }
  console.log('');
}
console.log('Commandes utiles :');
console.log('  npm run release:doctor         — security:check + eas:prebuild (avant release sérieuse)');
console.log('  npm run husko:doctor           — audit style + fonction (security, release, expo, tsc)');
console.log('  npm run security:check         — .env + avertissement si dépôt « sale »');
console.log('  npm run security:check:strict  — échoue si dépôt sale (comme release:doctor)');
console.log('  npm run eas:prebuild           — même chose que l’étape 4 (gate avant build)');
console.log('  npm run eas:sync:maps:verify    — sync Maps puis release:check');
console.log('  npm run preflight              — détail .env');
console.log('  npm run verify                 — tsc + lint + validate:expo');
console.log('  npm run build:apk:unified      — APK unique hub (canal OTA hub)');
console.log('  npm run build:apk:all          — 5 builds EAS (unified → assistant → 3 roles)');
console.log('  npm run eas:update:hub         — OTA JS APK unifie ; eas:update:* pour chaque canal');
console.log('');
process.exit(0);
