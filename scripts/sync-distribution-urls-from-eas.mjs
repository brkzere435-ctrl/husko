/**
 * Met à jour distribution.defaults.json avec les URLs expo.dev du **dernier** build terminé
 * par profil EAS (même source de vérité que download-latest-apk.mjs).
 * À lancer après des builds APK, avant `npm run qr:generate` — sinon les QR pointent vers d’anciens builds.
 *
 * Usage : node scripts/sync-distribution-urls-from-eas.mjs
 * Prérequis : eas login (ou EXPO_TOKEN)
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

/** Compte / projet (URL page build) — aligné sur les liens historiques du dépôt */
const EXPO_BUILD_PAGE_BASE =
  process.env.EXPO_DISTRIBUTION_BUILD_URL_BASE ||
  'https://expo.dev/accounts/brkapk/projects/husko/builds';

const PROFILE_BY_DEFAULTS_KEY = {
  unified: 'apk-unified',
  development: 'development-husko',
  assistant: 'apk-assistant',
  gerant: 'apk-gerant',
  client: 'apk-client',
  livreur: 'apk-livreur',
};

function runList(profile) {
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
    '15',
    '--json',
    '--non-interactive',
  ].join(' ');
  return execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    shell: true,
    env: { ...process.env, EAS_BUILD_NO_EXPO_GO_WARNING: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function pickNewestBuild(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const sorted = [...arr].sort(
    (a, b) => Date.parse(b.createdAt || b.updatedAt || 0) - Date.parse(a.createdAt || a.updatedAt || 0)
  );
  return sorted[0];
}

function main() {
  const path = join(ROOT, 'distribution.defaults.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const _info = raw._info;

  const out = { _info };
  for (const [key, profile] of Object.entries(PROFILE_BY_DEFAULTS_KEY)) {
    const json = runList(profile);
    let arr;
    try {
      arr = JSON.parse(json);
    } catch {
      console.warn(`[Husko] sync: JSON invalide pour ${profile}, ignoré`);
      out[key] = raw[key] ?? '';
      continue;
    }
    const build = pickNewestBuild(arr);
    if (!build?.id) {
      console.warn(`[Husko] sync: aucun build finished pour ${profile}, conserve l’ancienne valeur`);
      out[key] = raw[key] ?? '';
      continue;
    }
    const url = `${EXPO_BUILD_PAGE_BASE}/${build.id}`;
    out[key] = url;
    console.log(`[Husko] sync ${key} (${profile}) → ${build.id} appBuildVersion=${build.appBuildVersion ?? '?'}`);
  }

  writeFileSync(path, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('\n[Husko] distribution.defaults.json mis à jour. Puis : npm run qr:generate && npm run distribution:fiches');
}

main();
