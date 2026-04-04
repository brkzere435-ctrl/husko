# Référence design — couleurs, typo, assets

Fil unique avec [`src/constants/productDirection.ts`](../src/constants/productDirection.ts) : pas de palette ad hoc par écran ; réutiliser les fichiers ci-dessous.

## 1. Couleurs

| Source | Rôle |
|--------|------|
| [`src/constants/theme.ts`](../src/constants/theme.ts) | `colors` (fonds `bg`, `card`, accents `accent` / `accentMid`, texte, `gold`, `gradient`), `spacing`, `radius`, `elevation`, `surface` |
| [`src/constants/westCoastTheme.ts`](../src/constants/westCoastTheme.ts) | `WC` — identité sunset : `brick`, `brickDeep`, `fire`, `neonCyan`, `gold`, ombres |
| [`src/constants/clientMenuVisual.ts`](../src/constants/clientMenuVisual.ts) | Dégradés / rgba **écran menu client** (hero, chips, rangées, dock) — dérivés de `colors` + `WC` |
| [`src/constants/paperTheme.ts`](../src/constants/paperTheme.ts) | Thème React Native Paper (aligné Husko) |

## 2. Typographie

| Source | Rôle |
|--------|------|
| [`src/constants/fonts.ts`](../src/constants/fonts.ts) | `FONT` — Oswald 400 / 500 / 700 (chargées dans `app/_layout.tsx`) |
| [`src/constants/typography.ts`](../src/constants/typography.ts) | `typography` — `display`, `heroBrand`, `title`, `body`, `price`, etc. |

## 2bis. Montants France (EUR)

| Utilitaire | Rôle |
|------------|------|
| [`src/utils/formatEuro.ts`](../src/utils/formatEuro.ts) | `formatEuro(n)` → libellé `fr-FR` type **12,50 €** (`Intl`) ; `formatEuroAmount` sans symbule séparé (fiche produit avec € à côté). À utiliser pour tout prix affiché ou dans les notifications locales. |

## 3. Carte & GPS

- Clé Maps dans le **build** : `extra.mapsAndroidKeyOk` / `mapsIosKeyOk` ([`app.config.js`](../app.config.js)) ; détection [`src/utils/mapsBuildInfo.ts`](../src/utils/mapsBuildInfo.ts).
- Avant build : `npm run eas:sync:maps` ; **rebuild APK** après changement de clé (OTA JS ne suffit pas).
- Livreur natif : [`src/screens/LivreurScreen.native.tsx`](../src/screens/LivreurScreen.native.tsx) — `expo-location` + `MapView` ; permissions foreground.
- Mini-carte client : [`src/components/GTAMiniMap.tsx`](../src/components/GTAMiniMap.tsx) — Google si clé OK, sinon radar de secours.
- Détail : [visuel-west-coast-checklist.md](visuel-west-coast-checklist.md), [DEPLOIEMENT.md](../DEPLOIEMENT.md).

## 4. Photos produit

- Fichiers : `assets/menu/<id>.png` (voir [`assets/menu/README.txt`](../assets/menu/README.txt)).
- Mapping : [`src/constants/menuImages.ts`](../src/constants/menuImages.ts) — `require` statiques.
- Remplacer les PNG **sans renommer** : mêmes noms = pas de changement de code.
- Vérif : `npm run assets:menu:verify` (après remplacement).

## 5. Logo, splash, icône lanceur

- Génération : `npm run brand:assets` → [`scripts/generate-brand-assets.mjs`](../scripts/generate-brand-assets.mjs) (icon, adaptive-icon, splash, notification, `branding/client-boot-hero.png`).
- **Nouvelle icône sur le téléphone** : obligatoire **EAS build** natif (`npm run build:apk:unified` ou profil cible) — pas seul `eas update`.

## 6. Amélioration continue du design

1. Modifier d’abord **tokens** (`theme` / `WC` / `clientMenuVisual`) plutôt que des hex dans les écrans.
2. Valider sur **APK installé** + parcours prioritaire (menu client, suivi ou gérant selon focus).
3. `npm run verify` avant commit.

**Suite logique (écrans poussés un par un) :** (1) Menu — `app/client/index.tsx` ; (2) Suivi — `app/client/suivi.tsx` ; (3) Gérant dashboard — `app/gerant/index.tsx` ; (4) **Panier** — `app/client/panier.tsx` (bannières `WC` / `typography.section`, total **Oswald**) ; (5) **Historique** — `app/client/historique.tsx` (`borderGlow`, prix via `typography.price`) ; (6) **Réglages gérant** — `app/gerant/reglages.tsx` (`FONT.bold` sur raccourcis / presets).
