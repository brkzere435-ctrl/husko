/**
 * Commit local de sauvegarde (checkpoint) — évite de perdre le travail non poussé.
 * Usage : npm run checkpoint -- "fix(scope): description"
 *         npm run checkpoint -- --push "chore: message"  (commit + push)
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function git(args, allowFail = false) {
  const r = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (!allowFail && r.status !== 0) {
    const err = (r.stderr || r.stdout || '').trim();
    console.error(err || `git ${args.join(' ')} a échoué (code ${r.status}).`);
    process.exit(r.status ?? 1);
  }
  return r;
}

const raw = process.argv.slice(2);
const push = raw.includes('--push');
const msgParts = raw.filter((a) => a !== '--push');
const customMessage = msgParts.join(' ').trim();

git(['rev-parse', '--git-dir']);

const st = git(['status', '--porcelain'], true);
if (st.status !== 0) {
  process.exit(st.status ?? 1);
}
if (!st.stdout.trim()) {
  console.log('checkpoint: rien à committer (working tree clean).');
  process.exit(0);
}

git(['add', '-A']);

const empty = git(['diff', '--cached', '--quiet'], true);
if (empty.status === 0) {
  console.log('checkpoint: rien à committer après add (fichiers ignorés ou inchangés).');
  process.exit(0);
}

const when = new Date().toISOString().replace(/[:.]/g, '-');
const message = customMessage || `chore: checkpoint ${when}`;

const c = git(['commit', '-m', message], true);
if (c.status !== 0) {
  console.error((c.stderr || c.stdout || '').trim() || 'git commit a échoué.');
  process.exit(c.status ?? 1);
}

console.log(`checkpoint: commit créé — ${message}`);

if (push) {
  const p = git(['push'], true);
  if (p.status !== 0) {
    console.error((p.stderr || p.stdout || '').trim() || 'git push a échoué.');
    process.exit(p.status ?? 1);
  }
  console.log('checkpoint: push effectué.');
}
