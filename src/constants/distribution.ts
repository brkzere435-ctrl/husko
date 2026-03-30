import { readHuskoExpoExtra } from '@/utils/readHuskoExpoExtra';

export type DistributionUrls = {
  client: string;
  livreur: string;
  gerant: string;
  unified: string;
  assistant: string;
};

/** URLs encodées dans les QR (Expo install), depuis app.config / variables d’environnement. */
export function getDistributionApkUrls(): DistributionUrls {
  const e = readHuskoExpoExtra();
  return {
    client: (e.distributionClientApkUrl ?? '').trim(),
    livreur: (e.distributionLivreurApkUrl ?? '').trim(),
    gerant: (e.distributionGerantApkUrl ?? '').trim(),
    unified: (e.distributionUnifiedApkUrl ?? '').trim(),
    assistant: (e.distributionAssistantApkUrl ?? '').trim(),
  };
}
