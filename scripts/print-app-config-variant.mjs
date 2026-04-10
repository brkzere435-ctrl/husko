#!/usr/bin/env node
/**
 * Preuve locale (sans appareil) : `extra.appVariant` depuis `app.config.js`.
 * Sans argument : charge `.env` comme Expo (clés simples KEY=VAL), puis évalue app.config.
 * Usage : `node scripts/print-app-config-variant.mjs` [valeur forcée optionnelle]
 */
import { createRequire } from 'module';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
process.chdir(root);

function loadEnvFile(relPath) {
  const p = join(root, relPath);
  if (!existsSync(p)) return;
  const text = readFileSync(p, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[k] = v;
  }
}

function envLineAppVariant(relPath) {
  const p = join(root, relPath);
  if (!existsSync(p)) return '(no .env file)';
  const text = readFileSync(p, 'utf8');
  const m = text.match(/^\s*EXPO_PUBLIC_APP_VARIANT\s*=\s*(\S+)/m);
  return m ? m[1].replace(/^["']|["']$/g, '') : '(no EXPO_PUBLIC_APP_VARIANT line)';
}

const require = createRequire(import.meta.url);
const forced = process.argv[2];

delete require.cache[require.resolve('../app.config.js')];

if (forced !== undefined) {
  process.env.EXPO_PUBLIC_APP_VARIANT = forced;
  const m = require('../app.config.js')({});
  console.log(`[Husko] .env line EXPO_PUBLIC_APP_VARIANT: ${envLineAppVariant('.env')}`);
  console.log(`[Husko] extra.appVariant (forced argv=${forced}): ${m.extra?.appVariant}`);
} else {
  delete process.env.EXPO_PUBLIC_APP_VARIANT;
  loadEnvFile('.env');
  const m = require('../app.config.js')({});
  console.log(`[Husko] .env line EXPO_PUBLIC_APP_VARIANT: ${envLineAppVariant('.env')}`);
  console.log(`[Husko] process.env.EXPO_PUBLIC_APP_VARIANT after load .env: ${process.env.EXPO_PUBLIC_APP_VARIANT ?? '(unset)'}`);
  console.log(`[Husko] extra.appVariant (after .env load): ${m.extra?.appVariant}`);
  console.log(
    '[Husko] Sur appareil : si l’APK installée est mono-rôle (ex. …bynight.gerant), le package natif impose le rôle — le hub « Choisir un espace » existe sur l’APK unifié ou en dev Expo, pas sur une APK gérant/client/livreur seule.'
  );
}
