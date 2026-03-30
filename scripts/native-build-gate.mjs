/**
 * Portillon natif avant EAS / APK / iOS : mêmes étapes que `verify`, avec codes VULN-HUSKO-xxx.
 * Usage : npm run build:gate:native
 *
 * Politique : tout échec = vulnérabilité de chaîne de livraison à corriger avant build cloud.
 * Registre des codes : scripts/data/build-vulnerability-codes.json
 */
import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const expoCli = join(root, 'node_modules', 'expo', 'bin', 'cli');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const hasGitMeta = existsSync(join(root, '.git'));
const envForExpo = { ...process.env };
if (!hasGitMeta && process.env.EAS_NO_VCS === undefined) {
  envForExpo.EAS_NO_VCS = '1';
}

function fail(code, msg) {
  console.error(`\n[build:gate:native] ${code} — ${msg}`);
  console.error(`Voir scripts/data/build-vulnerability-codes.json\n`);
  process.exit(1);
}

console.log('\n[Husko — build:gate:native] Portillon APK / iOS (local, sans EAS cloud)\n');

// --- VULN-HUSKO-001 / 004 : expo config ---
const rCfg = spawnSync(process.execPath, [expoCli, 'config', '--json'], {
  cwd: root,
  encoding: 'utf8',
  env: envForExpo,
});
if (rCfg.status !== 0) {
  console.error(rCfg.stderr || rCfg.stdout || '');
  fail('VULN-HUSKO-001', 'expo config a échoué — configuration Expo invalide.');
}

let cfg;
try {
  cfg = JSON.parse(rCfg.stdout || '{}');
} catch {
  fail('VULN-HUSKO-001', 'Sortie expo config non JSON.');
}

if (!cfg.extra?.eas?.projectId) {
  fail('VULN-HUSKO-004', 'extra.eas.projectId manquant — projet EAS non lié.');
}

// --- VULN-HUSKO-002 : TypeScript ---
const tsc = spawnSync('npx', ['tsc', '--noEmit'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if ((tsc.status ?? 1) !== 0) {
  fail('VULN-HUSKO-002', 'TypeScript — corrigez les erreurs avant tout build natif.');
}

// --- VULN-HUSKO-003 : ESLint ---
const lint = spawnSync('npx', ['expo', 'lint'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if ((lint.status ?? 1) !== 0) {
  fail('VULN-HUSKO-003', 'ESLint — corrigez les problèmes signalés.');
}

// --- Optionnel : export Android (plus lourd) — HUSKO_GATE_EXPORT=1 ---
if (process.env.HUSKO_GATE_EXPORT === '1') {
  const outDir = join(root, '.expo-gate-export');
  const exp = spawnSync(
    'npx',
    ['expo', 'export', '--platform', 'android', '--output-dir', outDir],
    {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, CI: '1' },
    }
  );
  if ((exp.status ?? 1) !== 0) {
    fail('VULN-HUSKO-005', 'expo export Android a échoué — bundle Metro invalide.');
  }
  console.log(`Export test : ${outDir} (supprimable)\n`);
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║  OK — Portillon natif passé (config + tsc + lint).        ║
║  Prochain pas : npm run release:ready puis eas build …    ║
║  Export Metro strict : HUSKO_GATE_EXPORT=1 npm run …      ║
╚════════════════════════════════════════════════════════════╝
`);
process.exit(0);
