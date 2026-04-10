#!/usr/bin/env node
/**
 * Etat ADB + packages Husko (USB ou sans fil).
 * Usage : npm run adb:husko
 */
import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const adb = join(repoRoot, 'tools', 'platform-tools', 'adb.exe');

if (!existsSync(adb)) {
  console.error('[Husko] adb introuvable. Lancez : npm run tools:platform-tools');
  process.exit(1);
}

console.log('[Husko] Appareils ADB :');
try {
  console.log(execFileSync(adb, ['devices', '-l'], { encoding: 'utf8' }));
} catch (e) {
  console.error(String(e));
  process.exit(1);
}

let pm;
try {
  pm = execFileSync(adb, ['shell', 'pm', 'list', 'packages'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
} catch (e) {
  console.error('[Husko] adb shell pm list packages a echoue :', e.message);
  process.exit(1);
}

const lines = pm
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean);
const husko = lines.filter((l) => /husko/i.test(l));

console.log("[Husko] Packages contenant 'husko' :");
if (husko.length === 0) {
  console.error('[Husko] Aucun package husko — appareil autorise ?');
  process.exit(1);
}
for (const p of husko) {
  console.log(`  ${p}`);
}

const hasUnified = husko.some((p) => p === 'package:com.husko.bynight' || p === 'package:com.husko.app');
console.log('');
if (hasUnified) {
  console.log(
    "[Husko] OK — APK unifie (hub) detecte : l'ecran « Choisir un espace » peut s'afficher."
  );
} else {
  console.log(
    '[Husko] Aucun package hub (com.husko.bynight ou com.husko.app). APK mono-role seules = pas d\'accueil hub au lancement.'
  );
}

const distPath = join(repoRoot, 'distribution.defaults.json');
if (existsSync(distPath)) {
  try {
    const j = JSON.parse(readFileSync(distPath, 'utf8'));
    const u = j.unified;
    if (u && String(u).trim() !== '') {
      console.log('');
      console.log('[Husko] URL build hub (distribution.defaults.json) :');
      console.log(`  ${u}`);
      console.log(
        "[Husko] Telecharger l'APK depuis Expo, installer sur le telephone (coexiste avec les APK mono-role)."
      );
    }
  } catch {
    /* ignore */
  }
}

console.log('');
console.log(
  '[Husko] Builds cloud : npm run build:apk:unified (accord EAS / credits requis) ou npm run apk:download:unified si deja build.'
);
