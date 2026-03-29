import Constants from 'expo-constants';

export type DistributionUrls = { client: string; livreur: string; gerant: string };

/** URLs encodées dans les QR (APK Client, Livreur, Gérant), depuis app.config / variables d’environnement. */
export function getDistributionApkUrls(): DistributionUrls {
  const e = Constants.expoConfig?.extra as
    | {
        distributionClientApkUrl?: string;
        distributionLivreurApkUrl?: string;
        distributionGerantApkUrl?: string;
      }
    | undefined;
  return {
    client: (e?.distributionClientApkUrl ?? '').trim(),
    livreur: (e?.distributionLivreurApkUrl ?? '').trim(),
    gerant: (e?.distributionGerantApkUrl ?? '').trim(),
  };
}
