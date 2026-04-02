/**
 * Enchaîne 4 builds EAS Android : assistant (ops), gérant, livreur, client.
 * Usage : npm run build:apk:four
 * Prérequis : eas login, `npm run eas:sync:firebase` si besoin, arbre git propre
 * (eas.json requireCommit) avant le premier build.
 */
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const scripts = [
  'build:apk:assistant',
  'build:apk:gerant',
  'build:apk:livreur',
  'build:apk:client',
];

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

console.log('OK — 4 builds EAS enchaînés (assistant, gérant, livreur, client).');
