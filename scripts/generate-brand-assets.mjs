/**
 * Génère icon.png, adaptive-icon.png, splash.png, notification-icon.png,
 * et branding/client-boot-hero.png.
 * Direction : coucher de soleil LA, palmiers, rendu lisse (dégradés nombreux, courbes, pas de skyline en blocs).
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

/** Ciel multi-stops — transitions douces (évite le rendu « 16 bits »). */
const SKY_STOPS = `
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="12%" stop-color="#4c1d95"/>
      <stop offset="28%" stop-color="#9d174d"/>
      <stop offset="44%" stop-color="#ea580c"/>
      <stop offset="58%" stop-color="#f97316"/>
      <stop offset="72%" stop-color="#c2410c"/>
      <stop offset="88%" stop-color="#431407"/>
      <stop offset="100%" stop-color="#0c0a09"/>`;

/** Silhouette palmier centrée sur (0,0) — tronc vers le bas (y+). */
function palmSilhouetteLocal(s) {
  const trunkW = Math.max(14, Math.round(s * 0.018));
  const trunkH = Math.round(s * 0.38);
  const rx = Math.round(s * 0.11);
  const ry = Math.round(s * 0.024);
  const frondRot = [-58, -32, -8, 14, 38, 62];
  return `
    <g fill="#0f0508">
      <rect x="${-trunkW / 2}" y="0" width="${trunkW}" height="${trunkH}" rx="${Math.round(trunkW / 2)}" />
      <g transform="translate(0,8)">
        ${frondRot
          .map(
            (deg) =>
              `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" transform="rotate(${deg})" />`
          )
          .join('\n        ')}
      </g>
    </g>`;
}

/** Deux palmiers : gauche / droite (miroir propre autour de l’axe local). */
function palmPair(s, leftX, rightX, baseY) {
  const inner = palmSilhouetteLocal(s);
  return `
  <g opacity="0.92">
    <g transform="translate(${leftX},${baseY})">${inner}</g>
    <g transform="translate(${rightX},${baseY}) scale(-1, 1)">${inner}</g>
  </g>`;
}

/** Bande d’horizon brouillard (courbe douce) — paths seuls ; gradient dans le bloc <defs> parent. */
function horizonFogPaths(s) {
  const y0 = Math.round(s * 0.62);
  const y1 = Math.round(s * 0.72);
  return `
  <path d="M 0 ${y0} Q ${Math.round(s * 0.25)} ${Math.round(y0 - s * 0.02)} ${Math.round(s * 0.5)} ${y0}
    Q ${Math.round(s * 0.75)} ${Math.round(y0 + s * 0.015)} ${s} ${Math.round(y0 - s * 0.01)}
    L ${s} ${s} L 0 ${s} Z" fill="url(#horizonMist)"/>
  <path d="M 0 ${y1} Q ${Math.round(s * 0.33)} ${Math.round(y1 - 8)} ${Math.round(s * 0.67)} ${y1} Q ${s} ${y1 + 6} ${s} ${y1 + 20} L ${s} ${s} L 0 ${s} Z" fill="#080304" opacity="0.75"/>`;
}

function iconSvg(size, titlePx, subPx) {
  const s = size;
  const cx = s / 2;
  const sunR = Math.round(s * 0.13);
  const sunCy = Math.round(s * 0.39);
  const sunGlowR = Math.round(s * 0.28);
  const leftPalmX = Math.round(s * 0.13);
  const rightPalmX = Math.round(s * 0.87);
  const palmBase = Math.round(s * 0.52);
  return `
<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="geometricPrecision">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">${SKY_STOPS}
    </linearGradient>
    <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fffefb"/>
      <stop offset="22%" stop-color="#fef3c7"/>
      <stop offset="48%" stop-color="#fcd34d"/>
      <stop offset="78%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <radialGradient id="sunCore" cx="50%" cy="42%" r="50%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="45%" stop-color="#fdba74"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </radialGradient>
    <radialGradient id="sunBloom" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#fb923c" stop-opacity="0.5"/>
      <stop offset="45%" stop-color="#f97316" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0"/>
    </radialGradient>
    <filter id="sunSoft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="${Math.max(3, Math.round(s * 0.012))}" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="titleDepth" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="${Math.max(2, Math.round(s * 0.004))}" stdDeviation="${Math.max(4, Math.round(s * 0.01))}" flood-color="#1c0a0c" flood-opacity="0.55"/>
    </filter>
    <linearGradient id="horizonMist" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a0a0c" stop-opacity="0"/>
      <stop offset="50%" stop-color="#140608" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0a0304" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <circle cx="${cx}" cy="${sunCy}" r="${sunGlowR}" fill="url(#sunBloom)"/>
  <circle cx="${cx}" cy="${sunCy}" r="${Math.round(sunR * 1.35)}" fill="url(#sunBloom)" opacity="0.45"/>
  <circle cx="${cx}" cy="${sunCy}" r="${sunR}" fill="url(#sunCore)" filter="url(#sunSoft)" opacity="0.98"/>
  ${horizonFogPaths(s)}
  ${palmPair(s, leftPalmX, rightPalmX, palmBase)}
  <text x="50%" y="40%" text-anchor="middle" dominant-baseline="middle"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="${titlePx}" font-weight="800"
    letter-spacing="${Math.round(titlePx * 0.04)}"
    fill="url(#chrome)" filter="url(#titleDepth)">HUSKO</text>
  <text x="50%" y="48%" text-anchor="middle" dominant-baseline="middle"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="${subPx}" font-weight="500"
    letter-spacing="${Math.round(subPx * 0.42)}"
    fill="rgba(255, 247, 237, 0.88)">BY NIGHT</text>
</svg>`;
}

function notificationSvg(size) {
  const s = size;
  const h = Math.round(s * 0.42);
  return `
<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="geometricPrecision">
  <defs>
    <linearGradient id="nbg" x1="0%" y1="0%" x2="0%" y2="100%">${SKY_STOPS}
    </linearGradient>
    <filter id="nhalo">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#0c0a09" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" rx="${Math.round(s * 0.14)}" fill="url(#nbg)"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="${h}" font-weight="800"
    fill="#fffefb" filter="url(#nhalo)">H</text>
</svg>`;
}

async function writePng(svg, outName, size) {
  const buf = Buffer.from(svg);
  await sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toFile(join(assets, outName));
}

function bootHeroSvg(w, h) {
  const sunCx = Math.round(w * 0.5);
  const sunCy = Math.round(h * 0.36);
  const sunR = Math.round(Math.min(w, h) * 0.16);
  const bloomR = Math.round(Math.min(w, h) * 0.32);
  const leftPx = Math.round(w * 0.12);
  const rightPx = Math.round(w * 0.88);
  const palmBase = Math.round(h * 0.5);
  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="geometricPrecision">
  <defs>
    <linearGradient id="bhSky" x1="0%" y1="0%" x2="0%" y2="100%">${SKY_STOPS}
    </linearGradient>
    <radialGradient id="bhSun" cx="50%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="50%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </radialGradient>
    <radialGradient id="bhBloom" cx="50%" cy="36%" r="70%">
      <stop offset="0%" stop-color="#fb923c" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0"/>
    </radialGradient>
    <filter id="bhGlow" x="-35%" y="-35%" width="170%" height="170%">
      <feGaussianBlur stdDeviation="28" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="bhVignette" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#120404" stop-opacity="0"/>
      <stop offset="70%" stop-color="#120404" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0a0203" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bhSky)"/>
  <circle cx="${sunCx}" cy="${sunCy}" r="${bloomR}" fill="url(#bhBloom)"/>
  <circle cx="${sunCx}" cy="${sunCy}" r="${sunR}" fill="url(#bhSun)" opacity="0.88" filter="url(#bhGlow)"/>
  <path d="M 0 ${Math.round(h * 0.58)} Q ${Math.round(w * 0.5)} ${Math.round(h * 0.54)} ${w} ${Math.round(h * 0.59)} L ${w} ${h} L 0 ${h} Z" fill="#0a0304" opacity="0.5"/>
  <g opacity="0.85" fill="#0c0406">
    <g transform="translate(${leftPx},${palmBase})">${palmSilhouetteLocal(Math.min(w, h)).replace(/#0f0508/g, '#0c0406')}</g>
    <g transform="translate(${rightPx},${palmBase}) scale(-1, 1)">${palmSilhouetteLocal(Math.min(w, h)).replace(/#0f0508/g, '#0c0406')}</g>
  </g>
  <rect width="100%" height="100%" fill="url(#bhVignette)"/>
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
  const t = 108;
  const sub = 24;
  await writePng(iconSvg(1024, t, sub), 'icon.png', 1024);
  await writePng(iconSvg(1024, t, sub), 'adaptive-icon.png', 1024);
  await writePng(iconSvg(1024, t, sub), 'splash.png', 1024);
  await writePng(notificationSvg(256), 'notification-icon.png', 256);
  await writeBootHeroPng(1080, 1920);
  console.log(
    'OK — icon / adaptive / splash / notification + branding/client-boot-hero (coucher de soleil lisse + palmiers)'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
