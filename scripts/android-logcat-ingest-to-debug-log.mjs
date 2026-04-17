#!/usr/bin/env node
/**
 * Lit le logcat Android, extrait les lignes `[agent-debug] {...}` (session a47b9d) et les ajoute
 * en NDJSON dans `debug-a47b9d.log` à la racine du dépôt — preuve runtime sans HTTP vers le PC.
 *
 * Prérequis : appareil USB + débogage, même adb que `npm run debug:ingest:reverse`.
 * Usage : terminal 1 → `npm run debug:ingest:logcat` ; terminal 2 → reproduire le flux GPS livreur.
 * Arrêt : Ctrl+C, ou `--duration 45` pour arrêter après N secondes (pratique en CI / script).
 */
import { spawn } from 'child_process';
import { appendFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const LOG_FILE = join(repoRoot, 'debug-a47b9d.log');
const adb = join(repoRoot, 'tools', 'platform-tools', 'adb.exe');
const SESSION = 'a47b9d';
const PREFIX = '[agent-debug] ';

const durationArg = process.argv.findIndex((a) => a === '--duration');
const durationSec =
  durationArg >= 0 && process.argv[durationArg + 1]
    ? Math.max(1, parseInt(process.argv[durationArg + 1], 10) || 0)
    : 0;

if (!existsSync(adb)) {
  console.error('[Husko] adb introuvable. Lancez : npm run tools:platform-tools');
  process.exit(1);
}

function tryAppendNdjson(line) {
  const marker = `"sessionId":"${SESSION}"`;
  if (!line.includes(marker)) return;
  let jsonPart = '';
  const prefixed = line.indexOf(PREFIX);
  if (prefixed !== -1) {
    jsonPart = line.slice(prefixed + PREFIX.length).trim();
  } else {
    const brace = line.indexOf('{');
    if (brace === -1) return;
    jsonPart = line.slice(brace).trim();
  }
  if (!jsonPart.startsWith('{')) return;
  try {
    const obj = JSON.parse(jsonPart);
    appendFileSync(LOG_FILE, `${JSON.stringify(obj)}\n`, 'utf8');
    process.stdout.write('.');
  } catch {
    // ligne tronquée ou bruit
  }
}

console.log(`[Husko] Écriture NDJSON → ${LOG_FILE}`);
if (durationSec > 0) {
  console.log(`[Husko] Durée limitée : ${durationSec}s puis arrêt.\n`);
} else {
  console.log('[Husko] Lancez la repro GPS sur l’appareil (Ctrl+C pour arrêter).\n');
}

const child = spawn(adb, ['logcat', '-v', 'brief'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

child.stdout.setEncoding('utf8');
child.stderr.setEncoding('utf8');

let buf = '';
child.stdout.on('data', (chunk) => {
  buf += chunk;
  const lines = buf.split(/\r?\n/);
  buf = lines.pop() ?? '';
  for (const line of lines) tryAppendNdjson(line);
});

child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

child.on('error', (e) => {
  console.error('[Husko] logcat:', e.message);
  process.exit(1);
});

let durationTimer;
if (durationSec > 0) {
  durationTimer = setTimeout(() => {
    child.kill('SIGTERM');
    console.log(`\n[Husko] Arrêt après ${durationSec}s.`);
  }, durationSec * 1000);
}

child.on('close', (code) => {
  if (durationTimer) clearTimeout(durationTimer);
  process.exit(code ?? 0);
});
