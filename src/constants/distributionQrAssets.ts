import type { ImageSourcePropType } from 'react-native';

/** PNG générés par `npm run qr:generate` dans `assets/distribution-qr/`. */
export const DISTRIBUTION_QR_IMAGES: Record<
  'gerant' | 'client' | 'livreur',
  ImageSourcePropType
> = {
  gerant: require('../../assets/distribution-qr/gerant.png'),
  client: require('../../assets/distribution-qr/client.png'),
  livreur: require('../../assets/distribution-qr/livreur.png'),
};
