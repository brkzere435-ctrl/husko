/**
 * Garde-fou : les trois exports publics de productDirection.ts sont toujours présents.
 * Usage : npm run verify:product-direction (intégré à npm run verify).
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fp = join(root, 'src', 'constants', 'productDirection.ts');

const MARKERS = [
  'export const PRODUCT_DIRECTION',
  'export const PRODUCT_DEFINITION_OF_DONE',
  'export const PRODUCT_DELIVERABLE',
];

if (!existsSync(fp)) {
  console.error('[Husko check-product-direction] Fichier manquant :', fp);
  process.exit(1);
}

const src = readFileSync(fp, 'utf8');
const missing = MARKERS.filter((m) => !src.includes(m));
if (missing.length > 0) {
  console.error('[Husko check-product-direction] Marqueurs manquants dans productDirection.ts :');
  for (const m of missing) console.error('  •', m);
  process.exit(1);
}

console.log('[Husko] productDirection exports OK');
