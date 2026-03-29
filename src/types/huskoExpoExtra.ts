/**
 * Contenu de `Constants.expoConfig.extra`, défini dans `app.config.js`.
 * Utiliser `readHuskoExpoExtra()` pour lire ces champs dans l’app.
 */
export type HuskoExpoExtra = {
  /** expo-router */
  router: { origin: boolean };
  /** Valeur de `EXPO_PUBLIC_APP_VARIANT` au moment du build */
  appVariant: string;
  /** EAS : identifiant du projet Expo */
  eas: { projectId: string };
  distributionClientApkUrl: string;
  distributionLivreurApkUrl: string;
  distributionGerantApkUrl: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  /** true si la clé Android Maps du build n’est pas un placeholder */
  mapsAndroidKeyOk: boolean;
  /** true si la clé iOS Maps du build n’est pas un placeholder */
  mapsIosKeyOk: boolean;
  /** URL du backend assistant (HTTPS), sans clé secrète */
  assistantApiUrl: string;
  /** Liens Revolut (publics), injectés au build depuis EXPO_PUBLIC_REVOLUT_PAY_* */
  revolutPayEssentiel: string;
  revolutPayPro: string;
  revolutPayPremium: string;
};
