#!/usr/bin/env node
/**
 * Désinstalle TOUTES les apps Android dont le package contient "husko" (appareil ADB connecté).
 * Usage : npm run adb:husko:wipe -- --yes
 * Sécurité : sans --yes, le script refuse (évite un wipe accidentel).
 */
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const adb = join(repoRoot, 'tools', 'platform-tools', 'adb.exe');

if (!process.argv.includes('--yes')) {
  console.error(
    "[Husko] Refus : désinstallation destructive. Relancez : npm run adb:husko:wipe -- --yes\n" +
      "  (USB débogage + un seul appareil connecté recommandé.)"
  );
  process.exit(1);
}

if (!existsSync(adb)) {
  console.error('[Husko] adb introuvable. Lancez : npm run tools:platform-tools');
  process.exit(1);
}

let pm;
try {
  pm = execFileSync(adb, ['shell', 'pm', 'list', 'packages'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
} catch (e) {
  console.error('[Husko] pm list packages :', e.message);
  process.exit(1);
}

const pkgs = pm
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((l) => /husko/i.test(l))
  .map((l) => l.replace(/^package:/, ''));

if (pkgs.length === 0) {
  console.log("[Husko] Aucun package 'husko' sur l'appareil — déjà propre.");
  process.exit(0);
}

console.log('[Husko] Désinstallation de :');
for (const p of pkgs) console.log(`  ${p}`);

for (const p of pkgs) {
  try {
    const out = execFileSync(adb, ['uninstall', p], { encoding: 'utf8' });
    console.log(`[Husko] ${p} → ${out.trim()}`);
  } catch (e) {
    console.error(`[Husko] Échec ${p} :`, e?.message || e);
    process.exitCode = 1;
  }
}

console.log('');
console.log("[Husko] Terminé. Réinstalle UNE seule APK (client, livreur ou hub) depuis EAS / npm run apk:download:*.");
