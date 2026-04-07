/**
 * Phase après release:ready — ne remplace pas eas build ; ordre logique + vérif session Expo.
 * Usage : npm run release:next
 */
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

console.log(`
┌ Husko — phase cloud (après release:ready) ─────────────────────────────┐
│ 1. eas login          2. eas:credentials (si besoin)                     │
│ 3. Secrets .env → EAS : ship:prepare (Maps + Firebase)                 │
│ 4. Build : ship:apk:unified  ·  tout-en-un : npm run ship:hub            │
│ 5. Après build : distribution:sync-eas-urls → apk:download:unified → QR │
└────────────────────────────────────────────────────────────────────────┘

Session Expo (eas whoami) :
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
