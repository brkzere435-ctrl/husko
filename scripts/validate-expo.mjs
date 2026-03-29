/**
 * Vérifie que `app.config.js` se charge et produit un JSON Expo valide (slug, extra.eas).
 * Usage : npm run validate:expo (intégré à npm run verify).
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const expoCli = join(root, 'node_modules', 'expo', 'bin', 'cli');

/** Avec depot Git : ne pas forcer EAS_NO_VCS (aligne validate:expo sur eas build / requireCommit). */
const hasGitMeta = existsSync(join(root, '.git'));
const envForExpo = { ...process.env };
if (!hasGitMeta && process.env.EAS_NO_VCS === undefined) {
  envForExpo.EAS_NO_VCS = '1';
}

const r = spawnSync(process.execPath, [expoCli, 'config', '--json'], {
  cwd: root,
  encoding: 'utf8',
  env: envForExpo,
});

if (r.status !== 0) {
  console.error('[Husko validate:expo] échec expo config');
  if (r.stderr) console.error(r.stderr);
  if (r.stdout) console.error(r.stdout);
  process.exit(r.status ?? 1);
}

let cfg;
try {
  cfg = JSON.parse(r.stdout);
} catch {
  console.error('[Husko validate:expo] JSON invalide');
  process.exit(1);
}

if (!cfg.name || !cfg.slug) {
  console.error('[Husko validate:expo] name ou slug manquant');
  process.exit(1);
}

if (!cfg.extra?.eas?.projectId) {
  console.error('[Husko validate:expo] extra.eas.projectId manquant (EAS ne pourra pas lier le build)');
  process.exit(1);
}

console.log('[Husko validate:expo] OK —', cfg.name, '/', cfg.slug, '| EAS projectId présent');
