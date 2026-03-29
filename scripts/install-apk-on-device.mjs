/**
 * adb install -r dist/Husko-Client-latest.apk si un appareil USB / emulateur est visible.
 * Cherche adb dans ANDROID_HOME, LOCALAPPDATA\Android\Sdk, PATH.
 */
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const APK = join(__dirname, '..', 'dist', 'Husko-Client-latest.apk');

function findAdb() {
  const env = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (env) {
    const p = join(env, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
    if (existsSync(p)) return p;
  }
  const local = join(
    process.env.LOCALAPPDATA || '',
    'Android',
    'Sdk',
    'platform-tools',
    process.platform === 'win32' ? 'adb.exe' : 'adb'
  );
  if (existsSync(local)) return local;
  const which = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['adb'], {
    encoding: 'utf8',
    shell: true,
  });
  if (which.status === 0 && which.stdout.trim()) {
    const first = which.stdout.trim().split(/\r?\n/)[0];
    if (existsSync(first)) return first;
  }
  return null;
}

if (!existsSync(APK)) {
  console.error('[Husko] APK introuvable. Lance : npm run apk:download:last');
  process.exit(1);
}

const adb = findAdb();
if (!adb) {
  console.error(
    '[Husko] adb introuvable. Installe Android SDK Platform-Tools ou definis ANDROID_HOME, puis branche le telephone (depannage USB).'
  );
  process.exit(2);
}

const devices = spawnSync(adb, ['devices'], { encoding: 'utf8' });
console.log(devices.stdout || devices.stderr);
const lines = (devices.stdout || '').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('List'));
const ready = lines.filter((l) => /\tdevice$/.test(l));
if (ready.length === 0) {
  console.error('[Husko] Aucun appareil en mode "device". Active le debogage USB et autorise ce PC.');
  process.exit(3);
}

const r = spawnSync(adb, ['install', '-r', APK], { stdio: 'inherit' });
process.exit(r.status ?? 1);
