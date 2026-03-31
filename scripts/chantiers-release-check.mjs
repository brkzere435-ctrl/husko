/**
 * Checklist chantiers release : Maps, Firebase, fichiers menu, rappels OTA vs build.
 * Sortie 0 ; avertissements seulement (ne casse pas les clones sans .env).
 * Usage : npm run chantiers:check
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

const PLACEHOLDER = 'REMPLACEZ';

const FIREBASE_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const ANDROID_PACKAGES_FOR_MAPS = [
  'com.husko.bynight',
  'com.husko.bynight.client',
  'com.husko.bynight.gerant',
  'com.husko.bynight.livreur',
  'com.husko.copilot',
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

function emptyOrPlaceholder(v) {
  return !v || !String(v).trim() || String(v).includes(PLACEHOLDER);
}

function hasRealKey(v) {
  const s = String(v ?? '').trim();
  return s.length > 0 && !s.includes(PLACEHOLDER);
}

function extractMenuImageIds() {
  const p = join(root, 'src', 'constants', 'menuImages.ts');
  if (!existsSync(p)) return [];
  const raw = readFileSync(p, 'utf8');
  const ids = [];
  const re = /'([^']+)':\s*require\(/g;
  let m;
  while ((m = re.exec(raw)) !== null) ids.push(m[1]);
  return ids;
}

const env = parseEnvFile();

console.log('\n[Husko chantiers:check]\n');

if (!existsSync(envPath)) {
  console.log('• Aucun .env — copie : npm run setup:env\n');
}

// --- Maps ---
const mapsAndroid = hasRealKey(env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY);
const mapsIos = hasRealKey(env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY);
console.log('1) Google Maps');
console.log(
  mapsAndroid && mapsIos
    ? '   • .env : clés Android + iOS renseignées'
    : '   • .env : clés manquantes ou placeholders → tuiles grises possibles'
);
console.log('   • Restriction clé Android : ajouter chaque package + SHA-1 keystore EAS :');
for (const pkg of ANDROID_PACKAGES_FOR_MAPS) console.log(`       - ${pkg}`);
console.log('   • Pousser vers EAS : npm run eas:sync:maps');
console.log('   • Après changement de clé : eas build (pas eas update seul)\n');

// --- Firebase ---
let fbComplete = true;
for (const k of FIREBASE_KEYS) {
  if (emptyOrPlaceholder(env[k])) fbComplete = false;
}
console.log('2) Firebase');
console.log(
  fbComplete
    ? '   • .env : les 6 EXPO_PUBLIC_FIREBASE_* sont renseignées'
    : '   • .env : incomplet — synchro multi-appareils limitée ou désactivée'
);
console.log('   • Pousser vers EAS : npm run eas:sync:firebase');
console.log('   • Règles Firestore : npm run firebase:deploy:rules (si besoin)\n');

// --- Menu assets ---
const menuIds = extractMenuImageIds();
const menuDir = join(root, 'assets', 'menu');
const missing = [];
for (const id of menuIds) {
  const fp = join(menuDir, `${id}.png`);
  if (!existsSync(fp)) missing.push(id);
}
console.log('3) Photos menu (assets/menu/<id>.png)');
if (menuIds.length === 0) {
  console.log('   • Impossible de lire les ids depuis menuImages.ts\n');
} else if (missing.length === 0) {
  console.log(`   • ${menuIds.length} fichiers attendus : présents\n`);
} else {
  console.log(`   • Manquants (${missing.length}) : ${missing.join(', ')}`);
  console.log('   • Remplacer ou ajouter les PNG (voir assets/menu/README.txt)\n');
}

// --- Release pipeline ---
console.log('4) Release');
console.log('   • Vérifs code : npm run verify');
console.log('   • Gate complet : npm run release:gate');
console.log('   • JS / assets JS uniquement → eas:update:hub | client | gerant | livreur | assistant');
console.log('   • Clés natives / plugin → eas build (profil apk-*)');
console.log('');
