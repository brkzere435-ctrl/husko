/**
 * Affiche project_id et les package_name Android depuis google-services.json (sans clés API).
 * Compare aux 5 applicationId Husko attendus (voir app.config.js / DEPLOIEMENT.md).
 *
 *   node scripts/check-google-services.mjs
 *   node scripts/check-google-services.mjs --strict   — exit 1 si paquet manquant ou fichier absent
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'google-services.json');

/** Aligné sur app.config.js (VARIANTS + DEFAULT_VARIANT). */
const EXPECTED_PACKAGES = [
  'com.husko.bynight',
  'com.husko.bynight.client',
  'com.husko.bynight.gerant',
  'com.husko.bynight.livreur',
  'com.husko.copilot',
];

const strict = process.argv.includes('--strict');

function main() {
  console.log('\n[Husko — google-services:check]\n');

  if (!existsSync(path)) {
    console.log('Fichier google-services.json introuvable à la racine du dépôt.');
    console.log('Télécharge-le depuis Firebase Console après avoir ajouté les apps Android.\n');
    if (strict) process.exit(1);
    process.exit(0);
  }

  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.log('JSON invalide :', e.message || e, '\n');
    process.exit(1);
  }

  const projectId = data.project_info?.project_id ?? '(manquant)';
  const clients = Array.isArray(data.client) ? data.client : [];
  const packages = clients
    .map((c) => c?.client_info?.android_client_info?.package_name)
    .filter(Boolean);

  console.log('project_id :', projectId);
  console.log('packages   :', packages.length ? packages.join(', ') : '(aucun)');
  console.log('');

  const set = new Set(packages);
  const missing = EXPECTED_PACKAGES.filter((p) => !set.has(p));
  const extra = packages.filter((p) => !EXPECTED_PACKAGES.includes(p));

  if (missing.length === 0) {
    console.log('Les 5 applicationId Husko sont présents dans le fichier.');
    if (extra.length) {
      console.log('Autres paquets dans le fichier (ignorés pour le statut) : ' + extra.join(', '));
    }
    console.log('');
    process.exit(0);
  }

  if (missing.length) {
    console.log('Manquants (attendus pour les APK Husko) :');
    for (const p of missing) console.log(`  - ${p}`);
    console.log('');
  }
  if (extra.length) {
    console.log('Présents mais non listés comme requis Husko (info) :');
    for (const p of extra) console.log(`  - ${p}`);
    console.log('');
  }

  if (!strict && missing.length) {
    console.log('Astuce : ajoute chaque app Android dans Firebase, puis remplace google-services.json.');
    console.log('Option --strict : faire échouer la commande si incomplet.\n');
    process.exit(0);
  }

  if (strict && missing.length) {
    process.exit(1);
  }

  process.exit(0);
}

main();
