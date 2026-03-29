import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

export type DistributionUrls = { client: string; livreur: string; gerant: string };

/** URLs encodées dans les QR (APK Client, Livreur, Gérant), depuis app.config / variables d’environnement. */
export function getDistributionApkUrls(): DistributionUrls {
  const e = readHuskoExpoExtra();
  return {
    client: (e.distributionClientApkUrl ?? '').trim(),
    livreur: (e.distributionLivreurApkUrl ?? '').trim(),
    gerant: (e.distributionGerantApkUrl ?? '').trim(),
  };
}
