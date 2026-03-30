/**
 * Phase après release:ready — ne remplace pas eas build ; ordre logique + vérif session Expo.
 * Usage : npm run release:next
 */
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

console.log(`
[Husko] Phase cloud — après npm run release:ready (ordre à respecter)

  1. eas login              (ou npm run eas:login — si déjà connecté, étape ignorée)
  2. npm run eas:credentials   (keystore / certificats si premier build ou rotation)
  3. npm run eas:sync:maps     (pousser EXPO_PUBLIC_GOOGLE_MAPS_* du .env vers EAS)
  4. npm run build:apk:unified — APK hub (ou build:android / build:apk:all, etc.)
  5. Après build : mettre à jour les URLs dans distribution.defaults.json puis npm run qr:generate

Vérification session Expo (eas whoami) :
`);

const r = spawnSync('npx', ['eas', 'whoami'], {
  cwd: root,
  shell: true,
  stdio: 'inherit',
});

if ((r.status ?? 1) !== 0) {
  console.error('\n[Husko] Pas de session Expo active — lancez : npm run eas:login\n');
  process.exit(1);
}

console.log('\n[Husko] Session OK — vous pouvez enchaîner avec eas:sync:maps puis le build voulu.\n');
process.exit(0);
