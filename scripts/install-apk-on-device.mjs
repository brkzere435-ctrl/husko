/**
 * adb install -r dist/Husko-*-latest.apk (USB ou émulateur).
 * Usage : node scripts/install-apk-on-device.mjs [unified|dev|assistant|client|gerant|livreur]
 * Défaut : gerant (focus produit actuel)
 */
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

const FILES = {
  unified: 'Husko-ByNight-unified-latest.apk',
  dev: 'Husko-DevClient-hub-latest.apk',
  assistant: 'Husko-Copilote-latest.apk',
  client: 'Husko-Client-latest.apk',
  gerant: 'Husko-Gerant-latest.apk',
  livreur: 'Husko-Livreur-latest.apk',
};

const variant = (process.argv[2] || 'gerant').toLowerCase();
const name = FILES[variant];
if (!name) {
  console.error('[Husko] Usage : npm run apk:install:device -- [gerant|unified|dev|assistant|client|livreur]');
  process.exit(1);
}

const APK = join(ROOT, 'dist', name);

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
  console.error(`[Husko] APK introuvable : ${APK}`);
  console.error(`[Husko] Lance : npm run apk:download:${variant}   (ou npm run apk:download:all)`);
  process.exit(1);
}

const adb = findAdb();
if (!adb) {
  console.error(
    '[Husko] adb introuvable. Installe Android SDK Platform-Tools ou définis ANDROID_HOME, puis branche le téléphone (débogage USB).'
  );
  process.exit(2);
}

console.log(`[Husko] Installation ${variant} : ${name}\n`);
const devices = spawnSync(adb, ['devices'], { encoding: 'utf8' });
console.log(devices.stdout || devices.stderr);
const lines = (devices.stdout || '').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('List'));
const ready = lines.filter((l) => /\tdevice$/.test(l));
if (ready.length === 0) {
  console.error('[Husko] Aucun appareil en mode "device". Active le débogage USB et autorise ce PC.');
  process.exit(3);
}

const r = spawnSync(adb, ['install', '-r', APK], { stdio: 'inherit' });
process.exit(r.status ?? 1);
