/**
 * Barrière "reprise qualité" :
 * - garantit le focus gérant défini dans productDirection
 * - évite les traces debug visuelles dans le suivi client
 * - vérifie les garde-fous map/GPS partagés déjà posés
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const checks = [
  {
    id: 'productDirection.focus.gerant',
    file: join(root, 'src', 'constants', 'productDirection.ts'),
    test: (src) => /distributionFocus:\s*\{[\s\S]*?roles:\s*\[\s*'gerant'\s*\]/m.test(src),
    error: "Le focus dépôt doit rester gérant-only.",
  },
  {
    id: 'gerant.screen.primary',
    file: join(root, 'app', 'gerant', 'index.tsx'),
    test: (src) => src.includes('Ouvrir la prise de commandes'),
    error: "L'écran prioritaire gérant ne contient plus l'action métier principale.",
  },
  {
    id: 'client.suivi.no-debug-banner',
    file: join(root, 'app', 'client', 'suivi.tsx'),
    test: (src) => !src.includes('DBG map:'),
    error: 'Le suivi client contient encore un bandeau debug visuel.',
  },
  {
    id: 'client.suivi.shared-map',
    file: join(root, 'app', 'client', 'suivi.tsx'),
    test: (src) => src.includes('GTAMiniMap'),
    error: 'Le suivi client doit utiliser la mini-map partagée.',
  },
  {
    id: 'livreur.gps.watchdog',
    file: join(root, 'src', 'screens', 'LivreurScreen.native.tsx'),
    test: (src) =>
      src.includes('watchPositionAsync') &&
      src.includes('setInterval(() =>') &&
      src.includes("Location.Accuracy.Highest"),
    error: 'Le watchdog GPS livreur (watch + poll) est manquant.',
  },
  {
    id: 'layout.client.driver-scope',
    file: join(root, 'app', '_layout.tsx'),
    test: (src) => src.includes("variant === 'client' && !driverOrderId"),
    error: 'Le client doit ignorer le driver global sans commande suivie.',
  },
];

const failures = [];
for (const check of checks) {
  if (!existsSync(check.file)) {
    failures.push(`${check.id}: fichier manquant (${check.file})`);
    continue;
  }
  const src = readFileSync(check.file, 'utf8');
  if (!check.test(src)) failures.push(`${check.id}: ${check.error}`);
}

const debugCaptureDir = join(root, 'debug-captures');
if (existsSync(debugCaptureDir)) {
  const stack = [debugCaptureDir];
  let hasFiles = false;
  while (stack.length > 0) {
    const cur = stack.pop();
    if (!cur) break;
    for (const entry of readdirSync(cur)) {
      const full = join(cur, entry);
      const st = statSync(full);
      if (st.isDirectory()) stack.push(full);
      else {
        hasFiles = true;
        break;
      }
    }
    if (hasFiles) break;
  }
  if (hasFiles) {
    failures.push('workspace.debug-captures: supprimer les captures de debug avant livraison.');
  }
}

if (failures.length > 0) {
  console.error('[Husko reprise-qualité] Barrière bloquante:');
  for (const failure of failures) console.error(`  • ${failure}`);
  process.exit(1);
}

console.log('[Husko] reprise qualité: barrière OK (focus gérant + map/GPS + suivi propre).');
