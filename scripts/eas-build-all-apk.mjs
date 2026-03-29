/**
 * Enchaine les builds EAS Android (gerant, client, livreur) — meme base, package distinct.
 * Utilise le binaire `eas` du projet (devDependency eas-cli), pas un eas global aleatoire.
 *
 * Usage : npm run build:apk:all
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const easBin =
  process.platform === 'win32'
    ? join(root, 'node_modules', '.bin', 'eas.cmd')
    : join(root, 'node_modules', '.bin', 'eas');

if (!existsSync(easBin)) {
  console.error('[Husko] eas introuvable. Lance : npm install');
  process.exit(1);
}

const profiles = ['apk-gerant', 'apk-client', 'apk-livreur'];

const buildEnv = {
  ...process.env,
  EAS_BUILD_NO_EXPO_GO_WARNING: process.env.EAS_BUILD_NO_EXPO_GO_WARNING ?? 'true',
};

console.log('\n[Husko] Lancement sequentiel de', profiles.length, 'builds EAS Android.\n');

for (const profile of profiles) {
  console.log('-> Profil', profile, '...\n');
  const r = spawnSync(easBin, ['build', '-p', 'android', '--profile', profile, '--non-interactive'], {
    stdio: 'inherit',
    env: buildEnv,
    cwd: root,
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) {
    console.error('\nEchec sur le profil', profile, '(code', r.status, ')');
    process.exit(r.status ?? 1);
  }
}

console.log('\nOK — Builds soumis. Telecharge les APK sur https://expo.dev (onglet Builds du projet).\n');
