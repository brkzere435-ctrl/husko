/**
 * Reproduction locale Gradle (alignée EAS release) + NDJSON vers debug-d8e8b9.log
 * Session debug d8e8b9 — ne pas commit si bruit ; usage ponctuel diagnostic.
 */
import { appendFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOG = join(root, 'debug-d8e8b9.log');
const SESSION = 'd8e8b9';

function log(hypothesisId, message, data = {}) {
  const line = JSON.stringify({
    sessionId: SESSION,
    hypothesisId,
    location: 'scripts/debug-gradle-eas.mjs',
    message,
    data,
    timestamp: Date.now(),
    runId: 'gradle-local',
  });
  appendFileSync(LOG, line + '\n', 'utf8');
  console.error(`[debug ${hypothesisId}] ${message}`);
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const gradlew =
  process.platform === 'win32'
    ? join(root, 'android', 'gradlew.bat')
    : join(root, 'android', 'gradlew');

log('H0', 'start', { root, platform: process.platform });

if (!existsSync(join(root, 'android'))) {
  log('H0', 'prebuild: android absent, expo prebuild --platform android');
  const pb = spawnSync(npmCmd, ['exec', '--', 'expo', 'prebuild', '--platform', 'android', '--no-install'], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, CI: '1' },
    maxBuffer: 20 * 1024 * 1024,
  });
  log('H0', 'prebuild exit', {
    status: pb.status,
    stdoutTail: (pb.stdout || '').slice(-12000),
    stderrTail: (pb.stderr || '').slice(-12000),
  });
  if ((pb.status ?? 1) !== 0) {
    log('H0', 'prebuild FAILED', {});
    process.exit(pb.status ?? 1);
  }
}

if (!existsSync(gradlew)) {
  log('H0', 'gradlew missing after prebuild', { gradlew });
  process.exit(1);
}

log('H1-H5', 'gradlew assembleRelease (release = R8/minify si activé comme EAS)', {});
const g = spawnSync(
  gradlew,
  ['assembleRelease', '--stacktrace', '--no-daemon'],
  {
    cwd: join(root, 'android'),
    encoding: 'utf8',
    shell: process.platform === 'win32',
    // Ne pas forcer -Xmx4g sur machines peu de RAM (OOM daemon) ; EAS utilise sa propre JVM.
    env: {
      ...process.env,
      CI: '1',
      GRADLE_OPTS: process.env.GRADLE_OPTS ?? '-Dorg.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=512m',
    },
    maxBuffer: 30 * 1024 * 1024,
  }
);

const out = [g.stdout, g.stderr].filter(Boolean).join('\n');
log('H1-H5', 'gradlew finished', {
  status: g.status,
  outputTail: out.slice(-25000),
});

process.exit(g.status ?? 1);
