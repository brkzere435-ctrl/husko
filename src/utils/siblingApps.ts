import { Alert, Linking } from 'react-native';

import { SIBLING_SCHEMES } from '@/constants/appVariant';

type Role = 'gerant' | 'client' | 'livreur';

function homeUrl(role: Role) {
  return `${SIBLING_SCHEMES[role]}://`;
}

const labels: Record<Role, string> = {
  gerant: 'Gérant',
  client: 'Client',
  livreur: 'Livreur',
};

/**
 * Ouvre l’app sœur installée (schémas husko-client / husko-livreur / husko-gerant).
 * Chaque APK mono-rôle a un package Android distinct ; l’APK unifié hub regroupe les rôles dans une seule app.
 */
export async function openSiblingApp(role: Role) {
  const url = homeUrl(role);
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      'Application introuvable',
      `Installez l’APK Husko ${labels[role]} sur cet appareil (build EAS apk-${role}).`
    );
  }
}
