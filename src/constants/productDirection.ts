/**
 * Direction produit Husko — fil unique (pas de brouillon).
 * Décisions de base et critères « terminé » ; les chemins sont relatifs à la racine du dépôt.
 */

/** Décisions non négociables pour éviter le flou (une base technique, une identité, un pipeline). */
export const PRODUCT_DIRECTION = {
  codebase: {
    stack: 'Expo Router + React Native',
    manifest: 'package.json',
    rule: 'Ce dépôt est la source du produit ; pas de deuxième base parallèle sans besoin métier explicite.',
  },
  flutterStyleSpecs: {
    rule:
      'Les instructions type « 5 étapes Flutter + maquettes » sont une référence UX et ordre d’écrans, pas une deuxième base de code — sauf projet Flutter dédié avec budget et calendrier séparés.',
  },
  visualIdentity: {
    label: 'Lowrider',
    tokenFiles: ['src/constants/theme.ts', 'src/constants/westCoastTheme.ts'] as const,
    rule:
      'Toute évolution UI réutilise ces tokens (brique / noir, accent feu, or), pas une nouvelle palette par écran.',
  },
  apkPro: {
    tooling: 'EAS Build',
    configFile: 'eas.json',
    /** Gate + clean local + session Expo + secrets + build EAS gérant avec `--clear-cache`. Sans bloquer le terminal : `ship:gerant:queue`. */
    gerantShipScript: 'ship:gerant',
    gerantBuildCleanScript: 'build:apk:gerant:clean',
    /** Hub / mono-rôles : hors focus par défaut ; réservé besoin métier explicite. */
    hubScript: 'build:apk:unified',
    playStoreAabScript: 'build:play:aab',
    roleScripts: ['build:apk:gerant'] as const,
    rule:
      'Livrable prioritaire : APK gérant uniquement — `npm run ship:gerant` (clean:cache + release:ready + release:next + ship:prepare + build `apk-gerant` avec cache EAS nettoyé). Pas de build hub / client / livreur sauf demande explicite. Google Play : `build:play:aab`.',
  },
  /** Gate qualité avant de promettre un APK « pour clients » ou de lancer un build de prod. */
  clientReadinessBeforeBuild: {
    rule:
      'Ne pas enchaîner sur un build EAS de distribution tant que la base n’est pas validée : `npm run verify` OK ; pas de défaut connu bloquant (UI West Coast, carte / GPS, synchro Firestore, pastille Cloud) ; pas de scénario où un testeur reçoit encore une ancienne version — aligner APK via `download-latest-apk.mjs`, `dist/husko-apk-manifest.json` (buildId + versionCode) et `npm run distribution:sync-eas-urls` avant QR / partage.',
  },
  multiDeviceSync: {
    backend: 'Firestore',
    envPrefix: 'EXPO_PUBLIC_FIREBASE_*',
    serviceFile: 'src/services/firebaseRemote.ts',
    rulesFile: 'firestore.rules',
    rule:
      'Même config Firebase sur les builds qui doivent synchroniser. Les notifications locales ne remplacent pas la synchro données.',
  },
  /** Parcours prioritaires + OTA ; modalités de paiement : voir `payment`. */
  distributionFocus: {
    roles: ['gerant'] as const,
    rule:
      'Focus actuel : variante et canal **gérant** (`apk-gerant`, OTA `eas:update:gerant`). Code client / livreur / hub peut rester dans le dépôt mais ne fait pas partie du chemin de livraison par défaut.',
  },
  payment: {
    rule:
      'Paiement pris en compte sur place à la livraison — espèces au livreur ; pas de CB dans l’app. Textes utilisateur : `paymentPolicy.ts`.',
  },
} as const;

/** Ce que « terminé » veut dire pour un livrable pro. */
export const PRODUCT_DEFINITION_OF_DONE = {
  verifyScript: 'npm run verify',
  verifyMeans: 'TypeScript + lint + garde-fous Expo',
  apkDemo: {
    rule:
      'APK gérant : tableau de bord commandes et pilotage sur appareil réel (pas seulement Expo Go) ; Firestore si configuré.',
  },
  visualRegression: {
    rule:
      'Pas de régression visuelle majeure sur l’écran gérant prioritaire (dashboard, distribution).',
  },
  mapAndLocation: {
    rule:
      'Carte / suivi : clés Maps et permissions OK sur un appareil réel avant démo clients ; voir `DeploymentHints`, `docs/visuel-west-coast-checklist.md`, `DEPLOIEMENT.md`.',
  },
} as const;

export const PRODUCT_DELIVERABLE = {
  /** Parcours métier à valider sur APK installé */
  demoFlowId: 'gerant_orders_firestore' as const,
  /** Profil EAS du livrable prioritaire */
  easApkProfile: 'apk-gerant' as const,
  npmBuildScript: 'ship:gerant' as const,
  summary:
    'APK gérant : tableau de bord commandes et pilotage (Firestore si configuré).',
} as const;
