/**
 * Telecharge le dernier build EAS Android profil apk-client (status finished).
 * Sortie : dist/Husko-Client-latest.apk (gitignore)
 */
import { mkdirSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'dist', 'Husko-Client-latest.apk');
const EAS_RUN = join(ROOT, 'node_modules', 'eas-cli', 'bin', 'run');

function runEasJson(args) {
  try {
    return execFileSync(process.execPath, [EAS_RUN, 'build:list', ...args], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (e) {
    const stderr = e.stderr?.toString?.() || '';
    throw new Error(stderr || e.message || String(e));
  }
}

async function downloadUrl(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  mkdirSync(join(ROOT, 'dist'), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

async function main() {
  const raw = runEasJson([
    '--platform',
    'android',
    '-e',
    'apk-client',
    '--status',
    'finished',
    '--limit',
    '1',
    '--json',
    '--non-interactive',
  ]);
  const arr = JSON.parse(raw);
  const build = arr[0];
  if (!build?.artifacts?.applicationArchiveUrl) {
    throw new Error('Aucun build apk-client finished avec artefact APK.');
  }
  const url = build.artifacts.applicationArchiveUrl;
  console.log(`[Husko] Build ${build.id} -> ${url}`);
  console.log(`[Husko] Telechargement vers ${OUT} ...`);
  await downloadUrl(url, OUT);
  const st = statSync(OUT);
  console.log(`[Husko] OK ${(st.size / 1024 / 1024).toFixed(1)} Mo`);
}

main().catch((e) => {
  console.error('[Husko]', e.message || e);
  process.exit(1);
});
