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

const FB_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];
const fbMissing = FB_KEYS.filter((k) => emptyOrPlaceholder(env[k]));
const fbOk = fbMissing.length === 0;
const fbMin =
  !emptyOrPlaceholder(env.EXPO_PUBLIC_FIREBASE_API_KEY) &&
  !emptyOrPlaceholder(env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
if (fbOk) {
  console.log('• Firebase : OK (6 clés) — npm run eas:sync:firebase avant eas build cloud');
} else if (fbMin) {
  console.log(
    `• Firebase : partiel (${fbMissing.length} manquante(s)) — sync fragile ; compléter les 6 clés`
  );
} else {
  console.log('• Firebase : incomplet → liaison locale seule (panier bloqué sans cloud dans l’app)');
}

const mapsOk =
  !emptyOrPlaceholder(env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY) &&
  !emptyOrPlaceholder(env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY);
console.log(mapsOk ? '• Google Maps : clés Android + iOS renseignées' : '• Google Maps : clés manquantes ou placeholders');

const dist =
  env.EXPO_PUBLIC_DISTRIBUTION_UNIFIED_APK_URL ||
  env.EXPO_PUBLIC_DISTRIBUTION_ASSISTANT_APK_URL ||
  env.EXPO_PUBLIC_DISTRIBUTION_GERANT_APK_URL ||
  env.EXPO_PUBLIC_DISTRIBUTION_CLIENT_APK_URL ||
  env.EXPO_PUBLIC_DISTRIBUTION_LIVREUR_APK_URL;
console.log(
  dist
    ? '• Distribution : au moins une URL EXPO_PUBLIC_DISTRIBUTION_*'
    : '• Distribution : utiliser distribution.defaults.json ou EXPO_PUBLIC_DISTRIBUTION_* apres build EAS'
);

const assistantUrl = env.EXPO_PUBLIC_ASSISTANT_API_URL;
const openaiServer = env.OPENAI_API_KEY;
console.log(
  assistantUrl && String(assistantUrl).trim()
    ? '• Copilote : EXPO_PUBLIC_ASSISTANT_API_URL renseigne (pense a npm run assistant:server en local)'
    : '• Copilote : EXPO_PUBLIC_ASSISTANT_API_URL vide — chat sans backend jusqu’a URL + serveur proxy'
);
console.log(
  openaiServer && String(openaiServer).trim()
    ? '• Copilote : OPENAI_API_KEY presente dans .env (uniquement pour la machine qui lance assistant:server)'
    : '• Copilote : OPENAI_API_KEY absente — le proxy repondra sans vraie reponse IA tant que la cle n’est pas sur le serveur'
);

const easId = env.EXPO_PUBLIC_EAS_PROJECT_ID;
console.log(
  easId && String(easId).trim()
    ? '• EAS : EXPO_PUBLIC_EAS_PROJECT_ID renseigne (extra.eas.projectId au build)'
    : '• EAS : apres npm run eas:init, copier UUID projet dans .env -> EXPO_PUBLIC_EAS_PROJECT_ID'
);

console.log('\nRappels :');
console.log('  RELEASE_CHECKLIST.md - ordre release (Maps, Firebase, OTA vs build)');
console.log('  IOS_RELEASE_CHECKLIST.md - bundles iOS, Maps iOS, eas build -p ios');
console.log('  npm run release:gate - preflight + security:check + verify + release:check');
console.log('  npm run release:ready - release:gate puis release:doctor (strict + eas:prebuild)');
console.log('  npm run release:next - checklist phase cloud + eas whoami');
console.log('  npm run chantiers:check - Maps + Firebase + PNG menu + rappels OTA/build');
console.log('  npm run husko:doctor - audit style + fonction + security + tsc');
console.log('  npm run validate:expo - verifie que app.config.js se charge (Expo JSON)');
console.log('  eas secret:create - memes noms EXPO_PUBLIC_* que dans env.example');
console.log('  firebase login && firebase use --add && npm run firebase:deploy:rules');
console.log('  npm run ship:gerant - build cloud APK gérant (clean:cache + EAS --clear-cache)');
console.log('  npm run apk:download:last - telecharge le dernier APK unifie');
console.log('  npm run apk:install:device -- unified - installe en USB (adb)');
console.log('  npm run qr:generate - apres mise a jour des URLs');
if (process.platform === 'win32') {
  console.log('  Windows / EAS : Git committe + eas.json requireCommit + npm run eas:version (eas-cli local).');
  console.log('  Si erreur tar Prepare project persiste : workflow GitHub EAS APK Client + secret EXPO_TOKEN.');
}
console.log('');
