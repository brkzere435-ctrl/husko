/**
 * Recadre les visuels produit depuis les captures flyer Husko (Snapchat) vers assets/menu/<id>.png.
 *
 * Par défaut, cherche les PNG dans le dossier Cursor workspace (assets du projet .cursor).
 * Surcharge : HUSKO_FLYER_DIR=/chemin/vers/dossier contenant les captures
 *
 * Usage : node scripts/extract-menu-from-flyers.mjs [--dry-run]
 * Puis : npm run assets:menu:verify
 */
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets', 'menu');
const SIZE = 800;
/** Recadrage trop petit = risque d’image vide ou bruit ; on refuse d’écraser. */
const MIN_CROP_EDGE = 48;

const DRY_RUN = process.argv.includes('--dry-run');

/** Dossier des captures (priorité env). `os.homedir()` pour macOS/Linux/Windows. */
const DEFAULT_FLYER_DIR =
  process.env.HUSKO_FLYER_DIR ||
  join(homedir(), '.cursor', 'projects', 'c-Users-sfgtr-OneDrive-Documents-husko', 'assets');

function boxPct(w, h, x1, y1, x2, y2) {
  const left = Math.max(0, Math.round(w * x1));
  const top = Math.max(0, Math.round(h * y1));
  const width = Math.min(w - left, Math.round(w * (x2 - x1)));
  const height = Math.min(h - top, Math.round(h * (y2 - y1)));
  return { left, top, width, height };
}

async function loadWithSize(dir, width, height, preferPatterns) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  const candidates = [];
  for (const f of files) {
    const p = join(dir, f);
    try {
      const m = await sharp(p).metadata();
      if (m.width === width && m.height === height) {
        let score = 0;
        for (const pat of preferPatterns) {
          if (f.includes(pat)) score += 10;
        }
        candidates.push({ p, score, f });
      }
    } catch {
      /* skip */
    }
  }
  candidates.sort((a, b) => b.score - a.score || a.f.localeCompare(b.f));
  return candidates[0]?.p ?? null;
}

async function assertDimensions(label, srcPath, expectW, expectH) {
  const m = await sharp(srcPath).metadata();
  const w = m.width;
  const h = m.height;
  if (w !== expectW || h !== expectH) {
    console.error(
      `[Husko] ${label} : dimensions attendues ${expectW}×${expectH}, obtenu ${w}×${h} pour :\n  ${srcPath}`
    );
    process.exit(1);
  }
}

/** Flyer « sandwichs / four / desserts / boissons » — 472×1024. */
const CROPS_472 = {
  'sand-pita-poulet': [0.02, 0.165, 0.33, 0.315],
  'sand-pita-steak': [0.34, 0.165, 0.65, 0.315],
  'sand-pita-kebab': [0.66, 0.165, 0.98, 0.315],
  'sand-wrap-poulet': [0.02, 0.318, 0.33, 0.468],
  'sand-wrap-steak': [0.34, 0.318, 0.65, 0.468],
  'sand-wrap-kebab': [0.66, 0.318, 0.98, 0.468],
  'four-kebab': [0.02, 0.505, 0.33, 0.655],
  'four-poulet': [0.34, 0.505, 0.65, 0.655],
  'four-steak': [0.66, 0.505, 0.98, 0.655],
  'des-daim': [0.02, 0.695, 0.3, 0.84],
  'des-tiramisu': [0.28, 0.695, 0.56, 0.84],
  'des-mystere': [0.52, 0.695, 0.8, 0.84],
  'bois-canette': [0.52, 0.72, 0.78, 0.88],
  'bois-capri': [0.72, 0.72, 0.98, 0.88],
};

/** Flyer SMASH + frites + baguetta — 571×1024 (recadrages indicatifs). */
const CROPS_571 = {
  'smash-1': [0.02, 0.2, 0.23, 0.37],
  'smash-2': [0.26, 0.2, 0.48, 0.37],
  'smash-3': [0.5, 0.2, 0.73, 0.37],
  'smash-4': [0.74, 0.2, 0.98, 0.37],
  /** Même visuel bucket : trois zooms sur la zone centrale des frites chargées. */
  'frites-s': [0.12, 0.395, 0.45, 0.54],
  'frites-m': [0.08, 0.38, 0.52, 0.56],
  'frites-l': [0.04, 0.36, 0.56, 0.58],
  'bag-poulet': [0.02, 0.58, 0.21, 0.76],
  'bag-kebab': [0.21, 0.58, 0.4, 0.76],
  'bag-steak': [0.4, 0.58, 0.59, 0.76],
  'bag-smash': [0.78, 0.58, 0.98, 0.76],
};

/** Eau & bouteille 50cl : pas toujours visibles sur le flyer — recadrage texte / zone boisson. */
const CROPS_472_EXTRA = {
  'bois-eau': [0.48, 0.68, 0.72, 0.78],
  'bois-50': [0.48, 0.78, 0.72, 0.88],
};

async function extractOne(srcPath, id, rect, dryRun) {
  const m = await sharp(srcPath).metadata();
  const w = m.width;
  const h = m.height;
  const [x1, y1, x2, y2] = rect;
  const { left, top, width, height } = boxPct(w, h, x1, y1, x2, y2);
  if (width < MIN_CROP_EDGE || height < MIN_CROP_EDGE) {
    console.error(
      `[Husko] Recadrage trop petit pour ${id} (${width}×${height}px) — ajuster CROPS_* dans le script.`
    );
    process.exit(1);
  }
  const dest = join(outDir, `${id}.png`);
  if (dryRun) {
    console.log(`[dry-run] ${id} ← ${left},${top} ${width}×${height} → ${dest}`);
    return;
  }
  await sharp(srcPath)
    .extract({ left, top, width, height })
    .resize(SIZE, SIZE, { fit: 'cover', position: 'attention' })
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(`OK ${id} ← ${left},${top} ${width}×${height}`);
}

async function main() {
  const dir = DEFAULT_FLYER_DIR;
  if (!existsSync(dir)) {
    console.error(`[Husko] Dossier introuvable : ${dir}`);
    console.error('Définir HUSKO_FLYER_DIR vers le dossier des captures PNG.');
    process.exit(1);
  }

  const env472 = process.env.HUSKO_FLYER_472;
  const env571 = process.env.HUSKO_FLYER_571;
  const path472 =
    env472 && existsSync(env472)
      ? env472
      : await loadWithSize(dir, 472, 1024, ['Screenshot', 'Snapchat', '111940', '111937', '111935']);
  const path571 =
    env571 && existsSync(env571)
      ? env571
      : await loadWithSize(dir, 571, 1024, ['1000116961', '1000116960', '1000116962', 'Husko_Kebab', '6961']);

  if (!path472) {
    console.error('[Husko] Aucune capture 472×1024 trouvée (menu sandwichs).');
    console.error('Indiquer HUSKO_FLYER_472=C:\\…\\capture.png ou ajouter des PNG dans HUSKO_FLYER_DIR.');
    process.exit(1);
  }
  if (!path571) {
    console.error('[Husko] Aucune capture 571×1024 trouvée (menu SMASH / frites / baguetta).');
    console.error('Indiquer HUSKO_FLYER_571=…');
    process.exit(1);
  }

  await assertDimensions('HUSKO_FLYER_472 / source 472', path472, 472, 1024);
  await assertDimensions('HUSKO_FLYER_571 / source 571', path571, 571, 1024);

  console.log(`Source 472×1024 : ${path472}`);
  console.log(`Source 571×1024 : ${path571}`);
  if (DRY_RUN) {
    console.log('Mode --dry-run : aucun fichier écrit.\n');
  } else {
    console.log('');
  }

  for (const [id, rect] of Object.entries(CROPS_472)) {
    await extractOne(path472, id, rect, DRY_RUN);
  }
  for (const [id, rect] of Object.entries(CROPS_472_EXTRA)) {
    await extractOne(path472, id, rect, DRY_RUN);
  }
  for (const [id, rect] of Object.entries(CROPS_571)) {
    await extractOne(path571, id, rect, DRY_RUN);
  }

  console.log(DRY_RUN ? '\nDry-run terminé.' : `\nTerminé — ${outDir}`);
  if (!DRY_RUN) {
    console.log('Contrôle : npm run assets:menu:verify');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
