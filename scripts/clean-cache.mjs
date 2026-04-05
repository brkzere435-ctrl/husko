/**
 * Supprime les dossiers de cache locaux (non versionnés) — Expo / export web / logs temp.
 * Usage : npm run clean:cache
 */
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dirs = ['.expo', 'web-build', '.expo-export-test', '.tmp-eas-logs', '.expo-shared'];

for (const d of dirs) {
  const p = join(root, d);
  if (!existsSync(p)) continue;
  try {
    rmSync(p, { recursive: true, force: true });
    console.log(`[Husko clean:cache] OK — supprimé ${d}`);
  } catch (e) {
    console.warn(`[Husko clean:cache] ${d} :`, e?.message || e);
    process.exitCode = 1;
  }
}
console.log('[Husko clean:cache] Terminé. Optionnel : npm install si node_modules suspect.');
