/**
 * Enchaîne les builds EAS Android (gérant, client, livreur, copilote) — même base, package distinct.
 * Prérequis : eas login, eas init (projectId), secrets EAS pour EXPO_PUBLIC_* (Firebase, Maps, distribution).
 *
 * Usage : npm run build:apk:all
 * APK client seul (pour tes testeurs) : npm run apk:client
 */
import { spawnSync } from 'child_process';

const profiles = ['apk-gerant', 'apk-client', 'apk-livreur'];

const buildEnv = {
  ...process.env,
  EAS_BUILD_NO_EXPO_GO_WARNING: process.env.EAS_BUILD_NO_EXPO_GO_WARNING ?? 'true',
};

console.log('\n[Husko] Lancement séquentiel de', profiles.length, 'builds EAS Android.\n');

for (const profile of profiles) {
  console.log('→ Profil', profile, '…\n');
  const r = spawnSync(
    'npx',
    ['eas', 'build', '-p', 'android', '--profile', profile, '--non-interactive'],
    { stdio: 'inherit', shell: true, env: buildEnv }
  );
  if (r.status !== 0) {
    console.error('\nÉchec sur le profil', profile, '(code', r.status, ')');
    process.exit(r.status ?? 1);
  }
}

console.log('\n✓ Builds soumis. Télécharge les APK sur https://expo.dev (onglet Builds du projet).\n');
