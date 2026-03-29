/**
 * Configuration Expo Husko — CommonJS (stable avec le chargeur Node / Expo sur Windows).
 * Variables : voir env.example
 *
 * Variantes : EXPO_PUBLIC_APP_VARIANT = gerant | client | livreur | assistant | all
 * `app.json` (slug) est fusionné via la forme `({ config }) =>` — requis pour expo-doctor / EAS.
 */
const { existsSync, readFileSync } = require('fs');
const path = require('path');

const REPO_ROOT = __dirname;
const GOOGLE_SERVICES_REL = './google-services.json';
const GOOGLE_SERVICES_ABS = path.join(REPO_ROOT, 'google-services.json');

const VARIANTS = {
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

const DEFAULT_VARIANT = {
  name: 'Husko By Night',
  slug: 'husko',
  scheme: 'husko',
  androidPackage: 'com.husko.bynight',
  iosBundle: 'com.husko.bynight',
};

const DEFAULT_EAS_PROJECT_ID = 'b208c29f-259d-4480-a606-76abdabe9ed1';
const MAPS_IOS_PLACEHOLDER = 'REMPLACEZ_PAR_CLE_API_GOOGLE_MAPS_IOS';
const MAPS_ANDROID_PLACEHOLDER = 'REMPLACEZ_PAR_CLE_API_GOOGLE_MAPS_ANDROID';

const distributionDefaults = JSON.parse(
  readFileSync(path.join(REPO_ROOT, 'distribution.defaults.json'), 'utf8')
);

function readRole() {
  const raw = process.env.EXPO_PUBLIC_APP_VARIANT ?? 'all';
  if (
    raw === 'gerant' ||
    raw === 'client' ||
    raw === 'livreur' ||
    raw === 'assistant' ||
    raw === 'all'
  ) {
    return raw;
  }
  return 'all';
}

function resolveVariant(role) {
  if (role === 'all') return DEFAULT_VARIANT;
  return VARIANTS[role];
}

/** Cle vide = pas de meta-data Maps cote plugin ; on garde un placeholder pour builds EAS sans secrets. */
function envOrMapsPlaceholder(value, placeholder) {
  const t = (value ?? '').trim();
  return t || placeholder;
}

function buildExtra({
  role,
  easProjectId,
  distUrls,
  googleMapsIosKey,
  googleMapsAndroidKey,
}) {
  return {
    router: { origin: false },
    appVariant: role,
    eas: { projectId: easProjectId },
    distributionClientApkUrl:
      process.env.EXPO_PUBLIC_DISTRIBUTION_CLIENT_APK_URL || distUrls.client,
    distributionLivreurApkUrl:
      process.env.EXPO_PUBLIC_DISTRIBUTION_LIVREUR_APK_URL || distUrls.livreur,
    distributionGerantApkUrl:
      process.env.EXPO_PUBLIC_DISTRIBUTION_GERANT_APK_URL || distUrls.gerant,
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    mapsAndroidKeyOk: !String(googleMapsAndroidKey).includes('REMPLACEZ'),
    mapsIosKeyOk: !String(googleMapsIosKey).includes('REMPLACEZ'),
    assistantApiUrl: process.env.EXPO_PUBLIC_ASSISTANT_API_URL ?? '',
    revolutPayEssentiel: process.env.EXPO_PUBLIC_REVOLUT_PAY_ESSENTIEL ?? '',
    revolutPayPro: process.env.EXPO_PUBLIC_REVOLUT_PAY_PRO ?? '',
    revolutPayPremium: process.env.EXPO_PUBLIC_REVOLUT_PAY_PREMIUM ?? '',
  };
}

function huskoPlugins() {
  const googleMapsIosKey = envOrMapsPlaceholder(
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY,
    MAPS_IOS_PLACEHOLDER
  );
  const googleMapsAndroidKey = envOrMapsPlaceholder(
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
    MAPS_ANDROID_PLACEHOLDER
  );

  return [
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          minSdkVersion: 24,
          kotlinVersion: '2.1.20',
        },
      },
    ],
    [
      'react-native-maps',
      {
        iosGoogleMapsApiKey: googleMapsIosKey,
        androidGoogleMapsApiKey: googleMapsAndroidKey,
      },
    ],
    'expo-router',
    ['expo-splash-screen', { backgroundColor: '#120404' }],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Autoriser Husko à utiliser votre position pour la livraison.',
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
  ];
}

/**
 * @param {{ config?: import('expo/config').ExpoConfig }} ctx
 * @returns {import('expo/config').ExpoConfig}
 */
module.exports = (ctx = {}) => {
  const base = ctx.config ?? {};
  const role = readRole();
  const v = resolveVariant(role);
  const hasGoogleServicesJson = existsSync(GOOGLE_SERVICES_ABS);
  const easProjectId = (process.env.EXPO_PUBLIC_EAS_PROJECT_ID || '').trim() || DEFAULT_EAS_PROJECT_ID;
  const googleMapsIosKey = envOrMapsPlaceholder(
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY,
    MAPS_IOS_PLACEHOLDER
  );
  const googleMapsAndroidKey = envOrMapsPlaceholder(
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
    MAPS_ANDROID_PLACEHOLDER
  );

  const distUrls = {
    gerant: distributionDefaults.gerant ?? '',
    client: distributionDefaults.client ?? '',
    livreur: distributionDefaults.livreur ?? '',
  };

  const extra = buildExtra({
    role,
    easProjectId,
    distUrls,
    googleMapsIosKey,
    googleMapsAndroidKey,
  });

  const android = {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#120404',
    },
    package: v.androidPackage,
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'POST_NOTIFICATIONS'],
    config: {
      googleMaps: {
        apiKey: googleMapsAndroidKey,
      },
    },
  };
  if (hasGoogleServicesJson) {
    android.googleServicesFile = GOOGLE_SERVICES_REL;
  }

  const ios = {
    supportsTablet: true,
    buildNumber: '1',
    bundleIdentifier: v.iosBundle,
    config: {
      googleMapsApiKey: googleMapsIosKey,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Husko utilise votre position pour afficher la carte et le suivi de livraison.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Les livreurs ont besoin de la position pour la navigation et le suivi.',
    },
  };

  return {
    ...base,
    name: v.name,
    // Slug unique = même projet EAS (projectId) ; les APK se distinguent par android.package / name.
    slug: DEFAULT_VARIANT.slug,
    version: '1.0.2',
    orientation: 'portrait',
    scheme: v.scheme,
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
    ios: { ...base.ios, ...ios },
    android: { ...base.android, ...android },
    plugins: huskoPlugins(),
    extra: { ...base.extra, ...extra },
  };
};
