/**
 * Vérifie que chaque entrée de MENU_IMAGES dans menuImages.ts pointe vers un fichier existant.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const menuImagesPath = path.join(root, 'src', 'constants', 'menuImages.ts');
const menuPath = path.join(root, 'src', 'constants', 'menu.ts');

const src = fs.readFileSync(menuImagesPath, 'utf8');
const menuSrc = fs.readFileSync(menuPath, 'utf8');

const requireRe = /'([^']+)':\s*require\('([^']+)'\)/g;
const menuImagesDir = path.dirname(menuImagesPath);
const idsFromImages = [];
const missing = [];
let m;
while ((m = requireRe.exec(src)) !== null) {
  const id = m[1];
  const rel = m[2];
  idsFromImages.push(id);
  const abs = path.resolve(menuImagesDir, rel);
  if (!fs.existsSync(abs)) {
    missing.push({ id, rel, abs });
  }
}

const idFromMenuRe = /\bid:\s*'([^']+)'/g;
const menuIds = new Set();
while ((m = idFromMenuRe.exec(menuSrc)) !== null) {
  menuIds.add(m[1]);
}

const extraInImages = idsFromImages.filter((id) => !menuIds.has(id));
const menuWithoutImage = [...menuIds].filter((id) => !idsFromImages.includes(id));

if (missing.length) {
  console.error('verify-menu-assets: fichiers manquants pour menuImages.ts:');
  for (const row of missing) {
    console.error(`  - ${row.id} -> ${row.rel}`);
  }
  process.exit(1);
}

if (extraInImages.length) {
  console.error('verify-menu-assets: ids dans menuImages.ts absents de menu.ts:', extraInImages.join(', '));
  process.exit(1);
}

// Couverture optionnelle : tous les plats du menu ont une photo (comportement produit actuel).
if (menuWithoutImage.length) {
  console.error(
    'verify-menu-assets: entrées menu.ts sans ligne dans menuImages.ts:',
    menuWithoutImage.join(', '),
  );
  process.exit(1);
}

console.log(`verify-menu-assets: OK (${idsFromImages.length} fichiers menu).`);
