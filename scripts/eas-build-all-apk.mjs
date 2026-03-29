/**
 * Enchaîne les builds EAS Android (gérant, client, livreur, copilote) — même base, package distinct.
 * Prérequis : eas login, eas init (projectId), secrets EAS pour EXPO_PUBLIC_* (Firebase, Maps, distribution).
 *
 * Usage : npm run build:apk:all
 * Une seule variante : npx eas-cli build -p android --profile apk-client --non-interactive
 */
import { spawnSync } from 'child_process';

const profiles = ['apk-gerant', 'apk-client', 'apk-livreur'];

console.log('\n[Husko] Lancement séquentiel de', profiles.length, 'builds EAS Android.\n');

for (const profile of profiles) {
  console.log('→ Profil', profile, '…\n');
  const r = spawnSync(
    'npx',
    ['eas', 'build', '-p', 'android', '--profile', profile, '--non-interactive'],
    { stdio: 'inherit', shell: true, env: { ...process.env, EAS_NO_VCS: '1' } }
  );
  if (r.status !== 0) {
    console.error('\nÉchec sur le profil', profile, '(code', r.status, ')');
    process.exit(r.status ?? 1);
  }
}

console.log('\n✓ Les builds ont été soumis. Récupérez les APK sur expo.dev.\n');
