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
    hubScript: 'build:apk:unified',
    roleScripts: ['build:apk:client', 'build:apk:gerant', 'build:apk:livreur'] as const,
    rule:
      'Typiquement hub : npm run build:apk:unified ou cibles par rôle pour la démo. Pas de deuxième pipeline parallèle sans besoin métier.',
  },
  multiDeviceSync: {
    backend: 'Firestore',
    envPrefix: 'EXPO_PUBLIC_FIREBASE_*',
    serviceFile: 'src/services/firebaseRemote.ts',
    rulesFile: 'firestore.rules',
    rule:
      'Même config Firebase sur les builds qui doivent synchroniser. Les notifications locales ne remplacent pas la synchro données.',
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
