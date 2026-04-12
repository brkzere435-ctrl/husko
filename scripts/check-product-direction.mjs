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

/** Alignement plan « reprise qualité » : livrable prioritaire = gérant (ne pas dériver silencieusement). */
const INVARIANTS = [
  {
    id: 'distributionFocus.roles.gerant',
    ok: () => /distributionFocus:\s*\{[\s\S]*?roles:\s*\[\s*'gerant'\s*\]/m.test(src),
  },
  {
    id: 'PRODUCT_DELIVERABLE.easApkProfile',
    ok: () => /easApkProfile:\s*'apk-gerant'/.test(src),
  },
  {
    id: 'apkPro.roleScripts.gerant',
    ok: () => /roleScripts:\s*\[\s*'build:apk:gerant'\s*\]/.test(src),
  },
];

const broken = INVARIANTS.filter((x) => !x.ok());
if (broken.length > 0) {
  console.error('[Husko check-product-direction] Invariants produit rompus (priorité gérant / apk-gerant) :');
  for (const b of broken) console.error('  •', b.id);
  process.exit(1);
}

console.log('[Husko] productDirection exports OK + invariants livrable gérant');
