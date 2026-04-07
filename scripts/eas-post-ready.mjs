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
│ Priorité : npm run ship:gerant  (clean:cache + secrets + apk-gerant EAS  │
│            avec --clear-cache)   ·  sans attendre : ship:gerant:queue    │
│ Après build : distribution:sync-eas-urls → apk:download:gerant → QR    │
│ Hub / autres rôles : hors fil par défaut (ship:hub si besoin explicite) │
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
