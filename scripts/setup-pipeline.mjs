/**
 * Enchaîne les tâches de mise en route dans un ordre logique :
 * 1. Dépendances npm
 * 2. .env depuis env.example si absent
 * 3. Syntaxe du proxy assistant (Node)
 * 4. release:gate (preflight → security:check → verify → release:check)
 *
 * Usage : npm run setup:pipeline
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, args, label, opts = {}) {
  console.log(`\n${'═'.repeat(56)}\n  ${label}\n${'═'.repeat(56)}\n`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: opts.shell ?? true,
    env: { ...process.env },
  });
  if (r.status !== 0) {
    console.error(`\n[setup-pipeline] Échec : ${label}\n`);
    process.exit(r.status ?? 1);
  }
}

run('npm', ['install'], '1 — Dépendances (npm install)');

if (!existsSync(join(root, '.env'))) {
  run('node', ['scripts/setup-env.mjs'], '2 — Fichier .env (création depuis env.example)');
} else {
  console.log(`\n${'═'.repeat(56)}\n  2 — .env déjà présent (setup-env ignoré)\n${'═'.repeat(56)}\n`);
}

run('node', ['--check', 'server/assistant-chat.mjs'], '3 — Vérification syntaxe server/assistant-chat.mjs', {
  shell: false,
});

run('npm', ['run', 'release:gate'], '4 — release:gate (preflight → security → verify → release:check)');

console.log(`\n${'═'.repeat(56)}\n  Terminé — prochaines étapes manuelles :\n  • Renseigner .env (OPENAI_API_KEY, liens Revolut, etc.)\n  • npm run assistant:server  puis  npm run start:assistant\n  • eas login && npm run build:apk:assistant  (APK Copilote)\n${'═'.repeat(56)}\n`);
