/**
 * Contrôles basiques avant release : .env jamais versionné, dépôt propre pour requireCommit.
 * Usage :
 *   npm run security:check        — avertit si l’arbre Git est « sale »
 *   npm run security:check:strict — échoue si sale (aligné sur eas.json requireCommit)
 *   HUSKO_SKIP_DIRTY_GIT=1        — contourne le blocage strict (urgence seulement)
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const strict =
  argv.includes('--strict') || process.env.HUSKO_SECURITY_STRICT === '1';
const skipDirtyGit = process.env.HUSKO_SKIP_DIRTY_GIT === '1';

function git(args) {
  const r = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return { status: r.status ?? 1, stdout: (r.stdout ?? '').trim(), stderr: (r.stderr ?? '').trim() };
}

console.log('\n[Husko — security:check]\n');

if (!existsSync(join(root, '.git'))) {
  console.warn(
    'Pas de dépôt Git à la racine — OK pour dev local. Pour EAS avec archive Git, clone un dépôt avec historique.\n'
  );
  process.exit(0);
}

const tracked = git(['ls-files', '--', '.env']);
if (tracked.stdout) {
  console.error(
    '[BLOQUANT] Le fichier .env est suivi par Git. Retire-le du dépôt :\n' +
      '  git rm --cached .env\n' +
      '  puis commit. Garde .env uniquement en local (déjà dans .gitignore).\n'
  );
  process.exit(1);
}

const porcelain = git(['status', '--porcelain']);
const dirty = Boolean(porcelain.stdout);

if (dirty) {
  const risk =
    'Risque : avec requireCommit, EAS envoie un snapshot Git — les fichiers non commités ' +
    'ne sont souvent pas dans le build. Tu peux livrer un APK sans tes derniers changements, ' +
    'ou voir le build échouer.';

  if (strict && !skipDirtyGit) {
    console.error('[BLOQUANT] Arbre Git non propre.\n');
    console.error(risk);
    console.error(
      '\n  → git add -A && git commit -m "…"\n' +
        '  → puis relance npm run release:doctor\n' +
        '  Urgence seulement : HUSKO_SKIP_DIRTY_GIT=1 npm run security:check:strict\n'
    );
    process.exit(1);
  }

  if (strict && skipDirtyGit) {
    console.warn('[HUSKO_SKIP_DIRTY_GIT] Contournement actif — uniquement en urgence.\n');
    console.warn(risk + '\n');
  } else {
    console.warn('[ATTENTION] Dépot non commité (modifs locales).\n');
    console.warn(risk);
    console.warn(
      '  eas build peut refuser (requireCommit) — commit ou stash avant le build.\n'
    );
  }
} else {
  console.log('Git : arbre de travail propre (aligné avec ce qu’EAS embarquera).\n');
}

console.log(
  'Rappel : ne jamais committer de clés API. Restreindre les clés Maps dans Google Cloud (paquets Android / bundles iOS).\n'
);
process.exit(0);
