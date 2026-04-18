/**
 * Installe les APK Husko depuis dist/ sur l’appareil USB (un par un, ordre stable).
 *
 * Prérequis :
 *   - Débogage USB + autorisation PC
 *   - APK déjà dans dist/ : npm run apk:download:roles | apk:download:all
 *
 * Usage :
 *   node scripts/install-distribution-apks.mjs           → gérant, client, livreur
 *   node scripts/install-distribution-apks.mjs full      → + assistant + hub unifié
 *
 * Un seul téléphone recommandé. Si plusieurs : ANDROID_SERIAL=R3CN30… avant la commande.
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

const FILES = {
  unified: 'Husko-ByNight-unified-latest.apk',
  assistant: 'Husko-Copilote-latest.apk',
  client: 'Husko-Client-latest.apk',
  gerant: 'Husko-Gerant-latest.apk',
  livreur: 'Husko-Livreur-latest.apk',
};

/** Ordre métier : gérant → client → livreur, puis outils. */
const ORDER_ROLES = ['gerant', 'client', 'livreur'];
const ORDER_FULL = ['gerant', 'client', 'livreur', 'assistant', 'unified'];

function findAdb() {
  const repoAdb = join(ROOT, 'tools', 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
  if (existsSync(repoAdb)) return repoAdb;
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

function main() {
  const mode = (process.argv[2] || 'roles').toLowerCase();
  const order = mode === 'full' ? ORDER_FULL : ORDER_ROLES;

  const adb = findAdb();
  if (!adb) {
    console.error('[Husko] adb introuvable. npm run tools:platform-tools ou Android SDK.');
    process.exit(2);
  }

  const devices = spawnSync(adb, ['devices'], { encoding: 'utf8' });
  console.log(devices.stdout || '');
  const lines = (devices.stdout || '').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('List'));
  const ready = lines.filter((l) => /\tdevice$/.test(l));
  if (ready.length === 0) {
    console.error('[Husko] Aucun appareil. Branche le S25+, active le débogage USB.');
    process.exit(3);
  }

  let serial = (process.env.ANDROID_SERIAL || '').trim();
  if (!serial) {
    if (ready.length > 1) {
      serial = ready[0].split(/\s+/)[0];
      console.warn(`[Husko] Plusieurs appareils — installation sur ${serial}`);
      console.warn('[Husko] Pour en choisir un autre : $env:ANDROID_SERIAL="ID" (PowerShell)');
    } else {
      serial = ready[0].split(/\s+/)[0];
    }
  }

  const adbPrefix = serial ? [adb, '-s', serial] : [adb];

  let failed = false;
  for (const key of order) {
    const name = FILES[key];
    if (!name) continue;
    const apk = join(ROOT, 'dist', name);
    if (!existsSync(apk)) {
      console.error(`[Husko] Manquant : ${apk}`);
      console.error(`[Husko] Lance : npm run apk:download:${key}   (ou apk:download:roles | apk:download:all)`);
      failed = true;
      continue;
    }
    console.log(`\n[Husko] ─── Installation ${key} : ${name} ───`);
    const r = spawnSync(adbPrefix[0], [...adbPrefix.slice(1), 'install', '-r', apk], {
      stdio: 'inherit',
    });
    if (r.status !== 0) {
      console.error(`[Husko] Échec install ${key} (code ${r.status})`);
      failed = true;
    }
  }

  if (failed) {
    process.exit(1);
  }
  console.log('\n[Husko] Toutes les installations demandées sont passées sur le téléphone.');
}

main();
