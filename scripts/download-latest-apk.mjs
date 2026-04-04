/**
 * Télécharge le dernier build EAS Android terminé pour un profil donné.
 * Raccourci npm : npm run apk:get:client | apk:get:gerant | apk:get:unified
 * Usage :
 *   node scripts/download-latest-apk.mjs client
 *   node scripts/download-latest-apk.mjs gerant
 *   node scripts/download-latest-apk.mjs livreur
 *   node scripts/download-latest-apk.mjs unified
 *   node scripts/download-latest-apk.mjs all
 *
 * Sortie : dist/Husko-{Client|Gerant|Livreur}-latest.apk (gitignore)
 * Prérequis : eas login (ou EXPO_TOKEN en CI), même compte que les builds.
 */
import { mkdirSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

const VARIANTS = {
  unified: { profile: 'apk-unified', file: 'Husko-ByNight-unified-latest.apk' },
  /** Dev client : même base native que apk-unified (Gradle aligné), + expo-dev-client. */
  development: { profile: 'development-husko', file: 'Husko-DevClient-hub-latest.apk' },
  assistant: { profile: 'apk-assistant', file: 'Husko-Copilote-latest.apk' },
  client: { profile: 'apk-client', file: 'Husko-Client-latest.apk' },
  gerant: { profile: 'apk-gerant', file: 'Husko-Gerant-latest.apk' },
  livreur: { profile: 'apk-livreur', file: 'Husko-Livreur-latest.apk' },
};

function runEasBuildList(profile) {
  const cmd = [
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
  ].join(' ');
  try {
    // stdio: ne pas laisser stderr du child sur la console (PowerShell affiche une erreur pour les messages EAS type « update available »).
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
      shell: true,
      env: { ...process.env, EAS_BUILD_NO_EXPO_GO_WARNING: 'true' },
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (e) {
    const errText = [e.stderr, e.stdout].filter(Boolean).join('\n').trim();
    throw new Error(
      errText ||
        `eas build:list a échoué (profil ${profile}). Vérifiez « eas login » ou EXPO_TOKEN, puis qu’un build Android « finished » existe pour ce profil.`
    );
  }
}

async function downloadUrl(url, dest) {
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      mkdirSync(join(ROOT, 'dist'), { recursive: true });
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(dest, buf);
      return;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`${lastErr?.message || lastErr} — ${url}`);
}

async function downloadOne(key) {
  const v = VARIANTS[key];
  if (!v)
    throw new Error(
      `Profil inconnu : ${key} (unified | development | assistant | client | gerant | livreur | all)`
    );

  const raw = runEasBuildList(v.profile);
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    throw new Error(
      `Réponse « eas build:list » invalide (pas du JSON). Aperçu : ${raw.slice(0, 200)}…`
    );
  }
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(
      `Aucun build Android terminé pour le profil « ${v.profile} ». Lancez : npm run build:apk:unified (ou npm run build:dev:android pour le dev client) — ou attendez la fin du build sur expo.dev.`
    );
  }
  const build = arr[0];
  if (!build?.artifacts?.applicationArchiveUrl) {
    throw new Error(
      `Build ${v.profile} sans URL d’artefact (statut ou artefacts indisponibles). Vérifiez le build sur expo.dev.`
    );
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
  const arg = (process.argv[2] || 'unified').toLowerCase();

  if (arg === 'all') {
    for (const key of Object.keys(VARIANTS)) {
      await downloadOne(key);
    }
    console.log('[Husko] Tous les APK (unifié + rôles) sont dans le dossier dist/');
    console.log(
      '[Husko] Transfert téléphone : USB, cloud, ou npm run apk:install:device -- <unified|assistant|client|gerant|livreur>'
    );
    return;
  }

  if (!VARIANTS[arg]) {
    console.error(
      'Usage : node scripts/download-latest-apk.mjs [ unified | development | assistant | client | gerant | livreur | all ]'
    );
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
