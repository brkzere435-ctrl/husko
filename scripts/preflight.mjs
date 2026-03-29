/**
 * Vérifie .env (si présent) : Firebase, Maps, distribution — sans dépendance dotenv.
 * Sortie 0 toujours (avertissements seulement) pour ne pas casser les clones vides.
 * Ordre : charger .env → Firebase → Maps → distribution → rappels EAS / Firebase CLI.
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env');

const PLACEHOLDER = 'REMPLACEZ';

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

const env = parseEnvFile();

console.log('\n[Husko preflight]\n');

if (!existsSync(envPath)) {
  console.log('• Aucun .env — copie : npm run setup:env');
} else {
  console.log('• Fichier .env trouvé');
}

const fbOk =
  !emptyOrPlaceholder(env.EXPO_PUBLIC_FIREBASE_API_KEY) &&
  !emptyOrPlaceholder(env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
console.log(fbOk ? '• Firebase (min.) : OK (apiKey + projectId)' : '• Firebase : incomplet → liaison locale seule');

const mapsOk =
  !emptyOrPlaceholder(env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY) &&
  !emptyOrPlaceholder(env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY);
console.log(mapsOk ? '• Google Maps : clés Android + iOS renseignées' : '• Google Maps : clés manquantes ou placeholders');

const dist =
  env.EXPO_PUBLIC_DISTRIBUTION_GERANT_APK_URL ||
  env.EXPO_PUBLIC_DISTRIBUTION_CLIENT_APK_URL ||
  env.EXPO_PUBLIC_DISTRIBUTION_LIVREUR_APK_URL;
console.log(
  dist
    ? '• Distribution : au moins une URL EXPO_PUBLIC_DISTRIBUTION_*'
    : '• Distribution : utiliser distribution.defaults.json ou EXPO_PUBLIC_DISTRIBUTION_* après build EAS'
);

const easId = env.EXPO_PUBLIC_EAS_PROJECT_ID;
console.log(
  easId && String(easId).trim()
    ? '• EAS : EXPO_PUBLIC_EAS_PROJECT_ID renseigné (extra.eas.projectId au build)'
    : '• EAS : après npm run eas:init, copier l’UUID du projet dans .env → EXPO_PUBLIC_EAS_PROJECT_ID'
);

console.log('\nRappels :');
console.log('  npm run validate:expo — vérifie que app.config.js se charge (Expo JSON)');
console.log('  eas secret:create — mêmes noms EXPO_PUBLIC_* que dans env.example');
console.log('  firebase login && firebase use --add && npm run firebase:deploy:rules');
console.log('  npm run apk:client — build cloud APK « Husko Client » seul');
console.log('  npm run qr:generate — après mise à jour des URLs');
if (process.platform === 'win32') {
  console.log(
    '  Windows : si eas build échoue en « Prepare project » (tar), lance le workflow GitHub'
  );
  console.log('    « EAS APK Client » (.github/workflows) avec le secret EXPO_TOKEN, ou eas depuis WSL.');
}
console.log('');
