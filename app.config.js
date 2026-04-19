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
  // Défaut gérant : évite de basculer implicitement sur une variante unifiée.
  const raw = process.env.EXPO_PUBLIC_APP_VARIANT ?? 'gerant';
  if (
    raw === 'gerant' ||
    raw === 'client' ||
    raw === 'livreur' ||
    raw === 'assistant' ||
    raw === 'all'
  ) {
    return raw;
  }
  return 'gerant';
}

function resolveVariant(role) {
  if (role === 'all') return DEFAULT_VARIANT;
  return VARIANTS[role];
}

function readClientApkSuffix() {
  const raw = (process.env.EXPO_PUBLIC_CLIENT_APK_SUFFIX || '').trim().toLowerCase();
  if (!raw) return '';
  const cleaned = raw.replace(/[^a-z0-9]/g, '').slice(0, 16);
  return cleaned;
}

function withClientSuffix(variant, role) {
  if (role !== 'client') return variant;
  const suffix = readClientApkSuffix();
  if (!suffix) return variant;
  return {
    ...variant,
    name: `${variant.name} ${suffix.toUpperCase()}`,
    scheme: `${variant.scheme}-${suffix}`,
    androidPackage: `${variant.androidPackage}.${suffix}`,
    iosBundle: `${variant.iosBundle}.${suffix}`,
  };
}

/** Cle vide = pas de meta-data Maps cote plugin ; on garde un placeholder pour builds EAS sans secrets. */
function envOrMapsPlaceholder(value, placeholder) {
  const t = (value ?? '').trim();
  return t || placeholder;
}

/**
 * R8 / minify sur les builds « dev client » (development, development-husko) : désactivé pour éviter des
 * échecs Gradle peu parlants sur EAS (« unknown error ») quand des libs (Firebase, Skia, etc.) manquent de rules.
 * Les profils prod / apk-unified gardent minify + shrink.
 *
 * `EAS_BUILD_PROFILE` est aussi défini explicitement dans eas.json pour ces profils, au cas où l’injection
 * EAS ne serait pas visible au moment du prebuild (sinon minify pourrait rester activé par défaut).
 */
function androidReleaseUsesMinify() {
  const p = (process.env.EAS_BUILD_PROFILE || '').trim();
  if (p === 'development' || p === 'development-husko') {
    return false;
  }
  return true;
}

function buildExtra({
  role,
  easProjectId,
  distUrls,
  googleMapsIosKey,
  googleMapsAndroidKey,
}) {
  const clientApkSuffix = readClientApkSuffix();
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
    distributionUnifiedApkUrl:
      process.env.EXPO_PUBLIC_DISTRIBUTION_UNIFIED_APK_URL || distUrls.unified,
    distributionAssistantApkUrl:
      process.env.EXPO_PUBLIC_DISTRIBUTION_ASSISTANT_APK_URL || distUrls.assistant,
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    googleAuthWebClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID ?? '',
    googleAuthAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_ANDROID_CLIENT_ID ?? '',
    googleAuthIosClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_IOS_CLIENT_ID ?? '',
    mapsAndroidKeyOk: !String(googleMapsAndroidKey).includes('REMPLACEZ'),
    mapsIosKeyOk: !String(googleMapsIosKey).includes('REMPLACEZ'),
    assistantApiUrl: process.env.EXPO_PUBLIC_ASSISTANT_API_URL ?? '',
    revolutPayEssentiel: process.env.EXPO_PUBLIC_REVOLUT_PAY_ESSENTIEL ?? '',
    revolutPayPro: process.env.EXPO_PUBLIC_REVOLUT_PAY_PRO ?? '',
    revolutPayPremium: process.env.EXPO_PUBLIC_REVOLUT_PAY_PREMIUM ?? '',
    clientApkSuffix,
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

  const enableMinifyInRelease = androidReleaseUsesMinify();

  return [
    /** Client de développement : remplace Expo Go pour modules natifs (ex. expo-notifications). */
    'expo-dev-client',
    [
      'expo-build-properties',
      {
        android: {
          // androidx.core 1.17 (expo-notifications, etc.) exige compileSdk >= 36 (EAS checkReleaseAarMetadata).
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          minSdkVersion: 24,
          kotlinVersion: '2.1.20',
          /** R8 : activé sauf profils dev client (voir androidReleaseUsesMinify). */
          enableMinifyInReleaseBuilds: enableMinifyInRelease,
          enableShrinkResourcesInReleaseBuilds: enableMinifyInRelease,
          /**
           * react-native-geolocation-service (RNFusedLocation) + Play Services Location : sans ces règles,
           * R8 peut provoquer IncompatibleClassChangeError au getCurrentPosition (crash au lancement livreur).
           */
          extraProguardRules: `
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.agontuk.RNFusedLocation.** { *; }
-keep class com.agontuk.rnfusedlocation.** { *; }
-keep class com.google.android.gms.location.** { *; }
-keep interface com.google.android.gms.location.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.tasks.** { *; }
-dontwarn com.google.android.gms.**
`.trim(),
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
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        /** Image requise : sans drawable, le merge Android échoue (splashscreen_logo introuvable — build EAS 53beb348). */
        backgroundColor: '#120404',
        image: './assets/splash.png',
        /** Écrans haute densité (ex. S25+) : logo natif un peu plus large. */
        imageWidth: 300,
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Autoriser Husko à utiliser votre position pour la livraison.',
        /** Livreur : suivi en arrière-plan — rebuild natif requis (prebuild injecte UIBackgroundModes + permissions Android). */
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-notifications',
      {
        /** Monochrome blanc sur transparent (Android). */
        icon: './assets/notification-icon.png',
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
  const v = withClientSuffix(resolveVariant(role), role);
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
    unified: distributionDefaults.unified ?? '',
    assistant: distributionDefaults.assistant ?? '',
  };

  const extra = buildExtra({
    role,
    easProjectId,
    distUrls,
    googleMapsIosKey,
    googleMapsAndroidKey,
  });

  /** HTTP vers IP LAN / localhost (ingest debug Cursor, adb reverse) : sans ça Android bloque le cleartext. */
  const debugIngestUrl = (process.env.EXPO_PUBLIC_DEBUG_INGEST_URL || '').trim();
  const allowDebugHttpToLan =
    debugIngestUrl.length > 0 && debugIngestUrl.startsWith('http://');
  /** Rebuild natif requis. Utile si l’URL ingest est ajoutée seulement après un APK sans cleartext. */
  const allowDebugHttpFlag =
    (process.env.EXPO_PUBLIC_DEBUG_ALLOW_HTTP || '').trim() === '1';
  const allowDebugHttp = allowDebugHttpToLan || allowDebugHttpFlag;

  const android = {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#120404',
    },
    /** Réduit le chevauchement clavier / champs (saisie PIN, formulaires). */
    softwareKeyboardLayoutMode: 'resize',
    package: v.androidPackage,
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'POST_NOTIFICATIONS'],
    config: {
      googleMaps: {
        apiKey: googleMapsAndroidKey,
      },
    },
    ...(allowDebugHttp ? { usesCleartextTraffic: true } : {}),
  };
  if (hasGoogleServicesJson) {
    android.googleServicesFile = GOOGLE_SERVICES_REL;
  }

  const ios = {
    supportsTablet: true,
    buildNumber: '2',
    bundleIdentifier: v.iosBundle,
    config: {
      googleMapsApiKey: googleMapsIosKey,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Husko utilise votre position pour afficher la carte et le suivi de livraison.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Les livreurs ont besoin de la position pour la navigation et le suivi.',
      ...(allowDebugHttp
        ? {
            NSAppTransportSecurity: {
              NSAllowsLocalNetworking: true,
            },
          }
        : {}),
    },
  };

  return {
    ...base,
    /** React Native New Architecture (Fabric / TurboModules). Rebuild natif (EAS) obligatoire après changement. */
    newArchEnabled: true,
    name: v.name,
    // Slug unique = même projet EAS (projectId) ; les APK se distinguent par android.package / name.
    slug: DEFAULT_VARIANT.slug,
    version: '1.0.5',
    runtimeVersion: { policy: 'appVersion' },
    updates: {
      url: `https://u.expo.dev/${DEFAULT_EAS_PROJECT_ID}`,
    },
    orientation: 'portrait',
    scheme: v.scheme,
    userInterfaceStyle: 'dark',
    /** Shell Android / iOS : même palette que le splash — finition « produit », pas barres grises par défaut. */
    androidStatusBar: {
      barStyle: 'light-content',
      backgroundColor: '#120404',
      translucent: false,
    },
    androidNavigationBar: {
      barStyle: 'light-content',
      backgroundColor: '#120404',
    },
    icon: './assets/icon.png',
    splash: {
      backgroundColor: '#120404',
      image: './assets/splash.png',
      resizeMode: 'contain',
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

