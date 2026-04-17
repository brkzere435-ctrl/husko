#!/usr/bin/env node
/**
 * Redirige le port 7887 du téléphone vers le PC (ingest Cursor debug).
 * Usage : téléphone en USB, puis `npm run debug:ingest:reverse`
 * Ensuite dans .env : EXPO_PUBLIC_DEBUG_INGEST_URL=http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42
 */
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const adb = join(repoRoot, 'tools', 'platform-tools', 'adb.exe');
const PORT = '7887';

if (!existsSync(adb)) {
  console.error('[Husko] adb introuvable. Lancez : npm run tools:platform-tools');
  process.exit(1);
}

try {
  execFileSync(adb, ['reverse', `tcp:${PORT}`, `tcp:${PORT}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  console.log(`[Husko] adb reverse tcp:${PORT} tcp:${PORT} — OK`);
  console.log('[Husko] Dans .env (puis redémarrer Metro) :');
  console.log(
    '  EXPO_PUBLIC_DEBUG_INGEST_URL=http://127.0.0.1:7887/ingest/454edf30-5b80-46d0-acc5-a07a792b6f42'
  );
  console.log('  EXPO_PUBLIC_DEBUG_SESSION_ID=a47b9d');
} catch (e) {
  console.error('[Husko] adb reverse a échoué (appareil USB + débogage activé ?) :', e.message);
  process.exit(1);
}
