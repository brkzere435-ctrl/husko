/**
 * Copie env.example → .env si .env est absent (ne remplace pas un fichier existant).
 */
import { copyFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'env.example');
const dest = join(root, '.env');

if (!existsSync(src)) {
  console.error('Fichier introuvable : env.example');
  process.exit(1);
}

if (existsSync(dest)) {
  console.log('.env existe déjà — aucune modification.');
  process.exit(0);
}

copyFileSync(src, dest);
console.log('Créé .env à partir de env.example — renseignez les clés.');
