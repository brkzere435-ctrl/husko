/**
 * Génère icon.png, adaptive-icon.png, splash.png, notification-icon.png,
 * et branding/client-boot-hero.png (fond plein écran boot client — remplaçable par un visuel HD).
 * Direction : coucher de soleil type LA / West Coast, chrome néon, pas du simple Arial.
 * Nécessite : npm install sharp --save-dev
 */
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assets = join(root, 'assets');
const branding = join(assets, 'branding');

mkdirSync(assets, { recursive: true });
mkdirSync(branding, { recursive: true });

/** Ciel + horizon — crépuscule doux (prune → corail → base chaude), aligné theme / decor. */
function iconSvg(size, titlePx, subPx) {
  const s = size;
  const cx = s / 2;
  const sunR = Math.round(s * 0.14);
  const sunCy = Math.round(s * 0.42);
  return `
<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4a3560"/>
      <stop offset="26%" stop-color="#8b5a6e"/>
      <stop offset="52%" stop-color="#e8956a"/>
      <stop offset="78%" stop-color="#b4533a"/>
      <stop offset="100%" stop-color="#1e1618"/>
    </linearGradient>
    <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="35%" stop-color="#fdba74"/>
      <stop offset="70%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <filter id="glow" x="-35%" y="-35%" width="170%" height="170%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <circle cx="${cx}" cy="${sunCy}" r="${sunR}" fill="url(#sun)" opacity="0.92" filter="url(#softGlow)"/>
  <!-- Silhouette skyline (zone safe adaptive ~centre 66 %) -->
  <g opacity="0.88" fill="#2a1f28">
    <rect x="0" y="${Math.round(s * 0.68)}" width="${Math.round(s * 0.07)}" height="${Math.round(s * 0.32)}"/>
    <rect x="${Math.round(s * 0.06)}" y="${Math.round(s * 0.62)}" width="${Math.round(s * 0.09)}" height="${Math.round(s * 0.38)}"/>
    <rect x="${Math.round(s * 0.14)}" y="${Math.round(s * 0.58)}" width="${Math.round(s * 0.11)}" height="${Math.round(s * 0.42)}"/>
    <rect x="${Math.round(s * 0.24)}" y="${Math.round(s * 0.64)}" width="${Math.round(s * 0.08)}" height="${Math.round(s * 0.36)}"/>
    <rect x="${Math.round(s * 0.31)}" y="${Math.round(s * 0.55)}" width="${Math.round(s * 0.14)}" height="${Math.round(s * 0.45)}"/>
    <rect x="${Math.round(s * 0.44)}" y="${Math.round(s * 0.6)}" width="${Math.round(s * 0.1)}" height="${Math.round(s * 0.4)}"/>
    <rect x="${Math.round(s * 0.52)}" y="${Math.round(s * 0.56)}" width="${Math.round(s * 0.12)}" height="${Math.round(s * 0.44)}"/>
    <rect x="${Math.round(s * 0.63)}" y="${Math.round(s * 0.62)}" width="${Math.round(s * 0.09)}" height="${Math.round(s * 0.38)}"/>
    <rect x="${Math.round(s * 0.71)}" y="${Math.round(s * 0.59)}" width="${Math.round(s * 0.11)}" height="${Math.round(s * 0.41)}"/>
    <rect x="${Math.round(s * 0.81)}" y="${Math.round(s * 0.66)}" width="${Math.round(s * 0.19)}" height="${Math.round(s * 0.34)}"/>
  </g>
  <line x1="18%" y1="${Math.round(s * 0.67)}" x2="82%" y2="${Math.round(s * 0.67)}" stroke="#5eead4" stroke-opacity="0.42" stroke-width="${Math.max(2, Math.round(s * 0.004))}"/>
  <text x="50%" y="44%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${titlePx}" font-weight="900"
    fill="url(#chrome)" filter="url(#glow)">HUSKO</text>
  <text x="50%" y="44%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${titlePx}" font-weight="900"
    fill="url(#chrome)">HUSKO</text>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif" font-size="${subPx}" font-weight="700"
    letter-spacing="${Math.round(subPx * 0.25)}"
    fill="#fde68a" opacity="0.95">BY NIGHT</text>
</svg>`;
}

function notificationSvg(size) {
  const s = size;
  return `
<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="nbg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4a3560"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="${Math.round(s * 0.12)}" fill="url(#nbg)"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${Math.round(s * 0.38)}" font-weight="900"
    fill="#ffffff">H</text>
</svg>`;
}

async function writePng(svg, outName, size) {
  const buf = Buffer.from(svg);
  await sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toFile(join(assets, outName));
}

/** Fond portrait 9:16 — boot client / bandeau hub (sunset + horizon). */
function bootHeroSvg(w, h) {
  const sunCx = Math.round(w * 0.5);
  const sunCy = Math.round(h * 0.38);
  const sunR = Math.round(Math.min(w, h) * 0.18);
  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bhSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5c4a72"/>
      <stop offset="28%" stop-color="#a87890"/>
      <stop offset="52%" stop-color="#f0ab7c"/>
      <stop offset="78%" stop-color="#c4713a"/>
      <stop offset="100%" stop-color="#221820"/>
    </linearGradient>
    <linearGradient id="bhSun" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>
    <filter id="bhGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="24" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bhSky)"/>
  <circle cx="${sunCx}" cy="${sunCy}" r="${sunR}" fill="url(#bhSun)" opacity="0.62" filter="url(#bhGlow)"/>
  <rect x="0" y="${Math.round(h * 0.62)}" width="${w}" height="${Math.round(h * 0.38)}" fill="#1e1618" opacity="0.42"/>
</svg>`;
}

async function writeBootHeroPng(w, h) {
  const buf = Buffer.from(bootHeroSvg(w, h));
  await sharp(buf)
    .resize(w, h)
    .png({ compressionLevel: 9 })
    .toFile(join(branding, 'client-boot-hero.png'));
}

async function main() {
  const t = 112;
  const sub = 26;
  await writePng(iconSvg(1024, t, sub), 'icon.png', 1024);
  await writePng(iconSvg(1024, t, sub), 'adaptive-icon.png', 1024);
  await writePng(iconSvg(1024, t, sub), 'splash.png', 1024);
  await writePng(notificationSvg(256), 'notification-icon.png', 256);
  await writeBootHeroPng(1080, 1920);
  console.log(
    'OK — assets West Coast : icon, adaptive-icon, splash, notification-icon, branding/client-boot-hero.png'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
