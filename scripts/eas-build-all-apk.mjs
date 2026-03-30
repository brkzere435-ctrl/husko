/**
 * Enchaîne les builds EAS Android pour tout l’écosystème Husko (ordre conseillé).
 *
 * Usage :
 *   npm run build:apk:all              — 5 profils : unifié, copilote, gérant, client, livreur
 *   npm run build:apk:all -- --mono    — 3 profils mono-rôle seulement (gérant, client, livreur)
 *
 * Utilise le binaire `eas` du projet (devDependency eas-cli).
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

const monoOnly = process.argv.includes('--mono');
const profiles = monoOnly
  ? ['apk-gerant', 'apk-client', 'apk-livreur']
  : ['apk-unified', 'apk-assistant', 'apk-gerant', 'apk-client', 'apk-livreur'];

const buildEnv = {
  ...process.env,
  EAS_BUILD_NO_EXPO_GO_WARNING: process.env.EAS_BUILD_NO_EXPO_GO_WARNING ?? 'true',
  /** Bump local versionCode + commit requis pour `eas build --non-interactive` (voir eas.json autoIncrement). */
  EAS_BUILD_AUTOCOMMIT: process.env.EAS_BUILD_AUTOCOMMIT ?? '1',
};

console.log(
  '\n[Husko] Lancement sequentiel de',
  profiles.length,
  'build(s) EAS Android',
  monoOnly ? '(mode --mono)\n' : '(ecosysteme complet)\n'
);

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

console.log(
  '\nOK — Builds soumis. Telecharge les APK sur https://expo.dev (Builds → lien Application).\n' +
    'Puis : copiez chaque URL dans distribution.defaults.json (unified, assistant, gerant, client, livreur)\n' +
    'ou secrets EAS EXPO_PUBLIC_DISTRIBUTION_* — npm run qr:generate && npm run distribution:fiches\n'
);
