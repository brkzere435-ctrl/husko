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
    /** Un seul npm : gate + session Expo + sync secrets + build APK hub. Variante sans bloquer le terminal : `ship:hub:queue`. */
    hubShipScript: 'ship:hub',
    hubScript: 'build:apk:unified',
    playStoreAabScript: 'build:play:aab',
    roleScripts: ['build:apk:client', 'build:apk:gerant', 'build:apk:livreur'] as const,
    rule:
      'Chemin le plus simple : `npm run ship:hub` (release:ready + release:next + ship:apk:unified). Sinon hub seul : `build:apk:unified`. Google Play : `build:play:aab`. Toujours `ship:prepare` avant un build cloud si tu enchaînes à la main.',
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
    roles: ['client', 'gerant', 'livreur'] as const,
    rule:
      'Fluidité : priorité aux écrans et flux client / gérant / livreur (profils EAS `apk-client`, `apk-gerant`, `apk-livreur`). Mises à jour JS et assets à distance : `eas update` par canal (`client` / `gerant` / `livreur` / `hub`). Nouveau build natif EAS si changement de plugins Expo, icône, splash, ou clés Maps.',
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
      'Le parcours démo choisi fonctionne sur APK installé (pas seulement simulateur) : ex. client commande → gérant voit → livreur prend en charge → client voit le suivi.',
  },
  visualRegression: {
    rule:
      'Pas de régressions visuelles majeures sur l’écran prioritaire (menu client, suivi, ou gérant selon la priorité du moment).',
  },
  mapAndLocation: {
    rule:
      'Carte / suivi : clés Maps et permissions OK sur un appareil réel avant démo clients ; voir `DeploymentHints`, `docs/visuel-west-coast-checklist.md`, `DEPLOIEMENT.md`.',
  },
} as const;

export const PRODUCT_DELIVERABLE = {
  /** Parcours métier à valider sur APK installé */
  demoFlowId: 'client_order_gerant_livreur_track' as const,
  /** Profil EAS recommandé pour la démo multi-rôles */
  easApkProfile: 'apk-unified' as const,
  npmBuildScript: 'build:apk:unified' as const,
  summary:
    'Commande client → visible gérant → prise en charge livreur → suivi client (Firestore si configuré).',
} as const;
