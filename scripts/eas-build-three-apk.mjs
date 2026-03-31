/**
 * Enchaîne 3 builds EAS Android : gérant, client, livreur (scripts npm build:apk:*).
 * Usage : node scripts/eas-build-three-apk.mjs
 */
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const scripts = ['build:apk:gerant', 'build:apk:client', 'build:apk:livreur'];

for (const s of scripts) {
  const r = spawnSync('npm', ['run', s], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  if (r.status !== 0) {
    console.error(`Échec: npm run ${s} (code ${r.status ?? 1}).`);
    process.exit(r.status ?? 1);
  }
}

console.log('OK — 3 builds EAS enchaînés (gérant, client, livreur).');
