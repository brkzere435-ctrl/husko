/**
 * Alerte produit — visuels menu « pro ».
 * Si la majorité des PNG ont la même taille en octets, ce sont en pratique des
 * copies du même placeholder (export unique dupliqué). Le rendu à l’écran restera
 * « brut » tant qu’on ne remplace pas par de vraies photos (fichiers distincts).
 *
 * Usage :
 *   node scripts/check-menu-visual-pro.mjs           → avertissement stderr, code 0
 *   node scripts/check-menu-visual-pro.mjs --fail   → code 1 si alerte (CI / release pro)
 * Dérogation : HUSKO_ALLOW_MENU_PLACEHOLDERS=1 → toujours code 0
 */
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const menuDir = join(root, 'assets', 'menu');

const fail = process.argv.includes('--fail');
const allow = process.env.HUSKO_ALLOW_MENU_PLACEHOLDERS === '1';

function main() {
  let files = [];
  try {
    files = readdirSync(menuDir).filter((f) => f.endsWith('.png'));
  } catch {
    console.error('[Husko menu visual] Impossible de lire assets/menu/');
    process.exit(fail ? 1 : 0);
  }

  if (files.length < 2) {
    process.exit(0);
  }

  const sizes = files.map((f) => statSync(join(menuDir, f)).size);
  const bySize = new Map();
  for (const s of sizes) {
    bySize.set(s, (bySize.get(s) ?? 0) + 1);
  }
  let maxCount = 0;
  let dominantSize = 0;
  for (const [s, c] of bySize) {
    if (c > maxCount) {
      maxCount = c;
      dominantSize = s;
    }
  }
  const ratio = maxCount / files.length;
  /** Seuil : même gabarit de fichier copié pour tout le menu. */
  const PLACEHOLDER_RATIO = 0.85;

  if (ratio < PLACEHOLDER_RATIO) {
    console.log(
      `[Husko menu visual] OK — diversité de tailles de fichiers (${bySize.size} valeurs distinctes sur ${files.length} PNG).`
    );
    process.exit(0);
  }

  const msg = `
======================================================================
  ALERTE PRO — Visuels menu non différenciés (placeholders probables)
======================================================================

Constat : ${maxCount}/${files.length} PNG partagent la même taille (${dominantSize} octets).
Les vignettes « à la carte » afficheront le même rendu générique par plat tant que
chaque fichier n’est pas remplacé par une vraie photo (tailles et hashes différents).

Action : remplacer les fichiers dans assets/menu/<id>.png (mêmes noms, voir
docs/client-menu-assets.md et assets/menu/README.txt). Pas de correctif code seul.

Pour CI stricte : npm run verify:menu-visual-pro:strict
Pour ignorer temporairement : HUSKO_ALLOW_MENU_PLACEHOLDERS=1
`;

  console.error(msg);

  if (allow) {
    console.error('[Husko menu visual] HUSKO_ALLOW_MENU_PLACEHOLDERS=1 — sortie 0.\n');
    process.exit(0);
  }

  process.exit(fail ? 1 : 0);
}

main();
