/**
 * EAS Update robuste sous Windows:
 * 1) bundle local (sans clear cache forcé qui peut crasher),
 * 2) publication avec --skip-bundler.
 *
 * Usage:
 *   node scripts/eas-update-safe.mjs --channel client --message "Fix suivi"
 *   node scripts/eas-update-safe.mjs --channel livreur --platform android --environment production
 */
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

function argValue(name, fallback = '') {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

const channel = argValue('--channel');
const platform = argValue('--platform', 'android');
const environment = argValue('--environment', 'production');
const message = argValue('--message', `Husko OTA ${channel || 'unknown'} ${new Date().toISOString()}`);

if (!channel) {
  console.error('[Husko] --channel est requis.');
  process.exit(1);
}

const sharedEnv = {
  ...process.env,
  CI: '1',
  EAS_NO_VCS: process.env.EAS_NO_VCS || '1',
};

function run(cmd) {
  console.log(`\n[Husko] $ ${cmd}`);
  execSync(cmd, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: sharedEnv,
  });
}

run(`npx expo export --output-dir dist --experimental-bundle --dump-sourcemap --dump-assetmap --platform ${platform}`);
run(
  `npx eas update --skip-bundler --input-dir dist --channel ${channel} --platform ${platform} --environment ${environment} --message "${message.replace(/"/g, '\\"')}"`
);
