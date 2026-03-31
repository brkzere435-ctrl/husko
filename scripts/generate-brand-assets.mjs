/**
 * Génère icon.png, adaptive-icon.png, splash.png, notification-icon.png (West Coast néon HUSKO).
 * Nécessite : npm install sharp --save-dev
 */
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assets = join(root, 'assets');

mkdirSync(assets, { recursive: true });

/** Icône + adaptive : fond sombre + HUSKO cyan (lisible sur launcher). */
function iconSvg(size, fontSize) {
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#120404"/>
      <stop offset="55%" stop-color="#1a0a0a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900"
    fill="#22d3ee" filter="url(#glow)">HUSKO</text>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900"
    fill="#22d3ee">HUSKO</text>
  <line x1="22%" y1="68%" x2="78%" y2="68%" stroke="#fde68a" stroke-opacity="0.35" stroke-width="3"/>
</svg>`;
}

/** Splash : même identité, typo un peu plus petite pour respirer avec contain. */
function splashSvg(size) {
  return iconSvg(size, Math.round(size * 0.11));
}

/** Icône notification Android : blanc sur transparent (silhouette lisible). */
function notificationSvg(size) {
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${Math.round(size * 0.42)}" font-weight="900"
    fill="#ffffff">H</text>
</svg>`;
}

async function writePng(svg, outName, size) {
  const buf = Buffer.from(svg);
  await sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toFile(join(assets, outName));
}

async function main() {
  await writePng(iconSvg(1024, 128), 'icon.png', 1024);
  await writePng(iconSvg(1024, 128), 'adaptive-icon.png', 1024);
  await writePng(splashSvg(1024), 'splash.png', 1024);
  await writePng(notificationSvg(256), 'notification-icon.png', 256);
  console.log('OK — assets générés dans assets/ (icon, adaptive-icon, splash, notification-icon)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
