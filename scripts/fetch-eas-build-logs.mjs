/**
 * One-shot: fetch EAS job log files for a build ID and print Gradle failure context.
 * Usage: node scripts/fetch-eas-build-logs.mjs <BUILD_ID>
 */
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const buildId = process.argv[2] || 'd1751a9c-0765-4fc6-bf14-a215c4375f37';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const r = spawnSync(
  'npx',
  ['eas-cli', 'build:view', buildId, '--json'],
  { cwd: root, encoding: 'utf8', shell: true, maxBuffer: 10 * 1024 * 1024 }
);
const out = r.stdout || '';
const start = out.indexOf('{');
if (start < 0) {
  console.error(out || r.stderr);
  process.exit(1);
}
const data = JSON.parse(out.slice(start));
const urls = data.logFiles || [];
const tmp = join(root, '.tmp-eas-logs');
mkdirSync(tmp, { recursive: true });

const patterns =
  /FAILURE:|What went wrong|BUILD FAILED|> Task .* FAILED|error: |R8|Missing class|Proguard|checkReleaseAarMetadata|minCompileSdk|compileSdkVersion|signingConfig|keystore/i;

for (let i = 0; i < urls.length; i++) {
  const u = urls[i];
  const path = join(tmp, `log-${i + 1}.txt`);
  const res = await fetch(u);
  if (!res.ok) {
    console.error(`Fetch ${i + 1} failed: ${res.status}`);
    continue;
  }
  const text = await res.text();
  writeFileSync(path, text, 'utf8');
  console.log(`Saved log ${i + 1} (${text.length} chars) -> ${path}`);
}

const combined = urls
  .map((_, i) => {
    try {
      return readFileSync(join(tmp, `log-${i + 1}.txt`), 'utf8');
    } catch {
      return '';
    }
  })
  .join('\n');

const lines = combined.split('\n');
const hits = [];
for (let li = 0; li < lines.length; li++) {
  if (patterns.test(lines[li])) {
    hits.push(li);
  }
}
console.log('\n--- Matched line indices ---\n', hits.slice(0, 30));

if (hits.length) {
  const from = Math.max(0, hits[hits.length - 1] - 25);
  const to = Math.min(lines.length, hits[hits.length - 1] + 45);
  console.log('\n--- Context around last match ---\n');
  console.log(lines.slice(from, to).join('\n'));
} else {
  console.log('\n(No pattern match; tail 80 lines)\n');
  console.log(lines.slice(-80).join('\n'));
}
