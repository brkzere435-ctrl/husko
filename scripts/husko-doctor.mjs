/**
 * Husko Doctor — lie style (UI) et fonctionnalité (flux, données, builds).
 * Usage : npm run husko:doctor
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function gitShortSha(root) {
  if (!existsSync(join(root, '.git'))) return null;
  const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  });
  const s = (r.stdout ?? '').trim();
  return r.status === 0 && s ? s : null;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(step, args) {
  const r = spawnSync(npmCmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  const code = r.status ?? 1;
  if (code !== 0) {
    console.error(`\n[Husko Doctor] Échec à l’étape : ${step} (code ${code})\n`);
    process.exit(code);
  }
}

function has(p) {
  return existsSync(join(root, p));
}

const sha = gitShortSha(root);
console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║  HUSKO DOCTOR — Style & fonctionnalité (apps livraison / dark UI)      ║
╚══════════════════════════════════════════════════════════════════════════╝
${sha ? `Commit Git : ${sha}\n` : ''}`);

console.log(`Référentiel — ce qui doit rester aligné :

  STYLE (perception)
  • Fond sombre + texte clair (theme.ts / West Coast) — lisibilité nocturne, marque.
  • Hiérarchie : titres section (néon cyan WC) → corps → hints muted.
  • Zones sûres : SafeAreaView + dock / cartes qui ne masquent pas l’action principale.
  • Carte : tuiles Google si clés OK ; sinon fallback radar (comportement prévu, pas un « bug »).

  FONCTIONNALITÉ (métier)
  • APK unifié (eas profile apk-unified, canal hub) : hub avec tous les rôles ; APK mono-rôle : VariantGate force un seul espace.
  • Flux commande : pending → preparing → awaiting_livreur → on_way → delivered (ou annulé).
  • Données : Firebase = multi-téléphones ; sans Firebase = local seulement (comportement attendu).
  • Mises à jour : eas update = JS ; nouvelles clés natives / plugins = nouveau eas build.

  PÉRIMÈTRE FICHIERS (repères)
  • Thème global : src/constants/theme.ts, westCoastTheme.ts, typography.ts
  • Fonds WC : src/components/westcoast/WestCoastBackground.tsx
  • Navigation racine : app/_layout.tsx — ne pas multiplier les Stack.Screen sans besoin Expo Router.
  • Config build : app.config.js, eas.json, .env (non versionné)

  CLI (souvent confondu)
  • APK unique : npm run build:apk:unified ; tout l’écosystème : npm run build:apk:all (5 builds) ou build:apk:mono (3). OTA : eas:update:hub, eas:update:assistant, etc. Toujours « npm run … », jamais « npm build:… » seul.

Fichiers clés présents :`);
const checks = [
  ['app/client/index.tsx', 'Menu client'],
  ['app/gerant/index.tsx', 'Dashboard gérant'],
  ['app/livreur/index.tsx', 'Écran livreur'],
  ['src/stores/useHuskoStore.ts', 'État commandes / panier'],
  ['src/services/firebaseRemote.ts', 'Sync cloud'],
];
for (const [path, label] of checks) {
  console.log(`  ${has(path) ? '✓' : '✗'} ${path} — ${label}`);
}
console.log('');

console.log('── Vérifications automatisées ──\n');

run('security:check', ['run', 'security:check']);
run('release:check', ['run', 'release:check']);
run('validate:expo', ['run', 'validate:expo']);

console.log('\n── TypeScript ──\n');
const tsc = spawnSync('npx', ['tsc', '--noEmit'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if ((tsc.status ?? 1) !== 0) {
  console.error('\n[Husko Doctor] tsc a échoué.\n');
  process.exit(tsc.status ?? 1);
}

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║  OK — Style et fonctionnalité : garde-fous techniques passés.            ║
║  Prochain pas : test manuel par variante (client / livreur / gérant).    ║
╚══════════════════════════════════════════════════════════════════════════╝
`);
process.exit(0);
