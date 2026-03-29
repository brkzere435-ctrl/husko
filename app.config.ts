import type { ExpoConfig } from 'expo/config';

type Role = 'all' | 'gerant' | 'client' | 'livreur' | 'assistant';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const distributionDefaults = require('./distribution.defaults.json') as Record<string, string>;

const distUrls = {
  gerant: distributionDefaults.gerant ?? '',
  client: distributionDefaults.client ?? '',
  livreur: distributionDefaults.livreur ?? '',
};

const ROLE = (process.env.EXPO_PUBLIC_APP_VARIANT ?? 'all') as Role;

const byRole: Record<Exclude<Role, 'all'>, { name: string; slug: string; scheme: string; androidPackage: string; iosBundle: string }> = {
  gerant: {
    name: 'Husko Gérant',
    slug: 'husko-gerant',
    scheme: 'husko-gerant',
    androidPackage: 'com.husko.bynight.gerant',
    iosBundle: 'com.husko.bynight.gerant',
  },
  client: {
    name: 'Husko Client',
    slug: 'husko-client',
    scheme: 'husko-client',
    androidPackage: 'com.husko.bynight.client',
    iosBundle: 'com.husko.bynight.client',
  },
  livreur: {
    name: 'Husko Livreur',
    slug: 'husko-livreur',
    scheme: 'husko-livreur',
    androidPackage: 'com.husko.bynight.livreur',
    iosBundle: 'com.husko.bynight.livreur',
  },
  assistant: {
    name: 'Husko Copilote',
    slug: 'husko-assistant',
    scheme: 'husko-assistant',
    androidPackage: 'com.husko.copilot',
    iosBundle: 'com.husko.copilot',
  },
};

const v = ROLE === 'all' ? null : byRole[ROLE];

/** Après `eas init` : copier l’UUID du projet depuis expo.dev → Projet → ID (ou .env). Builds non interactifs sans Git : EAS_NO_VCS=1 (déjà dans les scripts npm). */
const easProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();

const googleMapsIosKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY ?? 'REMPLACEZ_PAR_CLE_API_GOOGLE_MAPS_IOS';
const googleMapsAndroidKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ?? 'REMPLACEZ_PAR_CLE_API_GOOGLE_MAPS_ANDROID';

const config: ExpoConfig = {
  name: v?.name ?? 'Husko By Night',
  slug: v?.slug ?? 'husko',
  version: '1.0.2',
  orientation: 'portrait',
  scheme: v?.scheme ?? 'husko',
  userInterfaceStyle: 'dark',
  icon: './assets/icon.png',
  splash: {
    backgroundColor: '#120404',
  },
  assetBundlePatterns: ['**/*'],
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/icon.png',
  },
  ios: {
    supportsTablet: true,
    buildNumber: '1',
    bundleIdentifier: v?.iosBundle ?? 'com.husko.bynight',
    config: {
      googleMapsApiKey: googleMapsIosKey,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Husko utilise votre position pour afficher la carte et le suivi de livraison.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Les livreurs ont besoin de la position pour la navigation et le suivi.',
    },
  },
  android: "GoogleServicesfile":./google-services.json
    versionCode: 2,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#120404',
    },
    package: v?.androidPackage ?? 'com.husko.bynight',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'POST_NOTIFICATIONS',
    ],
    config: {
      googleMaps: {
        apiKey: googleMapsAndroidKey,
      },
    },
  },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          minSdkVersion: 24,
        },
      },
    ],
    'expo-router',
    ['expo-splash-screen', { backgroundColor: '#120404' }],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Autoriser Husko à utiliser votre position pour la livraison.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#120404',
        defaultChannel: 'default',
      },
    ],
  ],
  extra: {
    router: { origin: false },
    appVariant: ROLE,
    ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
    /** Priorité : variables EXPO_PUBLIC_* puis distribution.defaults.json */
    distributionClientApkUrl:
      process.env.EXPO_PUBLIC_DISTRIBUTION_CLIENT_APK_URL || distUrls.client,
    distributionLivreurApkUrl:
      process.env.EXPO_PUBLIC_DISTRIBUTION_LIVREUR_APK_URL || distUrls.livreur,
    distributionGerantApkUrl:
      process.env.EXPO_PUBLIC_DISTRIBUTION_GERANT_APK_URL || distUrls.gerant,
    /** Firebase (Firestore) — liaison directe entre APK client / gérant / livreur */
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    /** Build-time : clés Google Maps non laissées aux placeholders (voir env.example). */
    mapsAndroidKeyOk: !googleMapsAndroidKey.includes('REMPLACEZ'),
    mapsIosKeyOk: !googleMapsIosKey.includes('REMPLACEZ'),
    /** URL HTTPS de ton backend assistant (même valeur que EXPO_PUBLIC_ASSISTANT_API_URL si tu la dupliques). */
    assistantApiUrl: process.env.EXPO_PUBLIC_ASSISTANT_API_URL ?? '',
  },
};

export default config;
