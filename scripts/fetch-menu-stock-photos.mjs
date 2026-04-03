/**
 * Télécharge des photos réelles distinctes (Lorem Flickr — images Flickr sous licence CC)
 * et écrit assets/menu/<id>.png (recadrage carré 800px).
 *
 * Usage : node scripts/fetch-menu-stock-photos.mjs
 * Nécessite : sharp, réseau (suivre les redirections 302).
 *
 * Pour des photos maison du restaurant : remplacer les fichiers à la main (mêmes noms).
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'assets', 'menu');

const SIZE = 800;

/** Tag + lock unique par id (lock fixe = image stable entre les runs). */
const MENU_LOREM = {
  'smash-1': ['burger', 21001],
  'smash-2': ['burger', 21002],
  'smash-3': ['burger', 41003],
  'smash-4': ['burger', 41004],
  'frites-s': ['frenchfries', 22001],
  'frites-m': ['fries', 22002],
  'frites-l': ['potato', 22003],
  'bag-poulet': ['sandwich', 23001],
  'bag-kebab': ['kebab', 23002],
  'bag-steak': ['sub', 23003],
  'bag-smash': ['baguette', 23004],
  'sand-pita-poulet': ['pita', 24001],
  'sand-pita-steak': ['shawarma', 24002],
  'sand-pita-kebab': ['gyro', 24003],
  'sand-wrap-poulet': ['wrap', 25001],
  'sand-wrap-kebab': ['burrito', 25002],
  'sand-wrap-steak': ['tortilla', 25003],
  'four-kebab': ['toast', 26001],
  'four-poulet': ['panini', 26002],
  'four-steak': ['grilled', 26003],
  'des-daim': ['cake', 27001],
  'des-tiramisu': ['tiramisu', 27002],
  'des-mystere': ['dessert', 27003],
  'bois-eau': ['water', 28001],
  'bois-capri': ['juice', 28002],
  'bois-canette': ['soda', 28003],
  'bois-50': ['bottle', 28004],
};

const UA = 'Mozilla/5.0 (compatible; HuskoMenuFetch/1.0)';

function buildUrl(tag, lock) {
  const enc = encodeURIComponent(tag);
  return `https://loremflickr.com/${SIZE}/${SIZE}/${enc}?lock=${lock}`;
}

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/jpeg,image/png,image/webp,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Nouvelles tentatives + backoff léger (502/500 Lorem Flickr ponctuels). */
async function downloadBufferRetry(url, attempts = 5) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      const buf = await downloadBuffer(url);
      if (buf.length < 800) {
        throw new Error(`réponse trop petite (${buf.length} o)`);
      }
      return buf;
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw last;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const argvIds = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const allKeys = Object.keys(MENU_LOREM);
  const ids =
    argvIds.length > 0
      ? argvIds.filter((id) => {
          if (!MENU_LOREM[id]) {
            console.error(`fetch-menu-stock-photos: id inconnu : ${id}`);
            process.exit(1);
          }
          return true;
        })
      : allKeys;
  let ok = 0;
  for (const id of ids) {
    const [tag, lock] = MENU_LOREM[id];
    const url = buildUrl(tag, lock);
    const dest = join(outDir, `${id}.png`);
    process.stdout.write(`${id} (${tag})… `);
    try {
      const buf = await downloadBufferRetry(url);
      await sharp(buf)
        .resize(SIZE, SIZE, { fit: 'cover', position: 'attention' })
        .png({ compressionLevel: 9 })
        .toFile(dest);
      console.log('OK');
      ok++;
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
    }
  }
  console.log(`\nTerminé : ${ok}/${ids.length} fichiers sous assets/menu/`);
  if (ok < ids.length) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
