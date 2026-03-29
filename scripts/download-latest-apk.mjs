/**
 * Télécharge le dernier build EAS Android terminé pour un profil donné.
 * Usage :
 *   node scripts/download-latest-apk.mjs client
 *   node scripts/download-latest-apk.mjs gerant
 *   node scripts/download-latest-apk.mjs livreur
 *   node scripts/download-latest-apk.mjs all
 *
 * Sortie : dist/Husko-{Client|Gerant|Livreur}-latest.apk (gitignore)
 * Prérequis : eas login, même compte que les builds.
 */
import { mkdirSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

const VARIANTS = {
  client: { profile: 'apk-client', file: 'Husko-Client-latest.apk' },
  gerant: { profile: 'apk-gerant', file: 'Husko-Gerant-latest.apk' },
  livreur: { profile: 'apk-livreur', file: 'Husko-Livreur-latest.apk' },
};

function runEasBuildList(profile) {
  return execSync(
    [
      'npx',
      'eas',
      'build:list',
      '--platform',
      'android',
      '-e',
      profile,
      '--status',
      'finished',
      '--limit',
      '1',
      '--json',
      '--non-interactive',
    ].join(' '),
    {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
      shell: true,
      env: { ...process.env, EAS_BUILD_NO_EXPO_GO_WARNING: 'true' },
    }
  ).trim();
}

async function downloadUrl(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  mkdirSync(join(ROOT, 'dist'), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

async function downloadOne(key) {
  const v = VARIANTS[key];
  if (!v) throw new Error(`Profil inconnu : ${key} (client | gerant | livreur | all)`);

  const raw = runEasBuildList(v.profile);
  const arr = JSON.parse(raw);
  const build = arr[0];
  if (!build?.artifacts?.applicationArchiveUrl) {
    throw new Error(`Aucun build ${v.profile} terminé avec artefact APK.`);
  }
  const url = build.artifacts.applicationArchiveUrl;
  const dest = join(ROOT, 'dist', v.file);
  console.log(`[Husko] ${key} — build ${build.id}`);
  console.log(`[Husko] ${url}`);
  console.log(`[Husko] Téléchargement → ${dest} …`);
  await downloadUrl(url, dest);
  const st = statSync(dest);
  console.log(`[Husko] OK ${(st.size / 1024 / 1024).toFixed(1)} Mo\n`);
}

async function main() {
  const arg = (process.argv[2] || 'client').toLowerCase();

  if (arg === 'all') {
    for (const key of Object.keys(VARIANTS)) {
      await downloadOne(key);
    }
    console.log('[Husko] Les trois APK sont dans le dossier dist/');
    console.log('[Husko] Transfert téléphone : USB (copier les .apk), cloud, ou npm run apk:install:device -- <client|gerant|livreur>');
    return;
  }

  if (!VARIANTS[arg]) {
    console.error('Usage : node scripts/download-latest-apk.mjs [ client | gerant | livreur | all ]');
    process.exit(1);
  }

  await downloadOne(arg);
  const dest = join(ROOT, 'dist', VARIANTS[arg].file);
  console.log(`[Husko] Fichier prêt : ${dest}`);
  console.log('[Husko] Sur le téléphone : ouvrir le .apk depuis Fichiers / Drive, ou brancher en USB et npm run apk:install:device -- ' + arg);
}

main().catch((e) => {
  console.error('[Husko]', e.message || e);
  process.exit(1);
});
