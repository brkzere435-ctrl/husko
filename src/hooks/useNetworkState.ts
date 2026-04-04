import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export type NetworkBannerState = {
  /** True quand aucun réseau utilisable (hors ligne ou sans accès internet). */
  showOfflineBanner: boolean;
};

/**
 * Suit la connectivité pour une bannière non bloquante (NetInfo).
 * Au démarrage, évite un flash « hors ligne » si l’état n’est pas encore connu.
 */
export function useNetworkState(): NetworkBannerState {
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const c = state.isConnected;
      const r = state.isInternetReachable;
      if (c === false) {
        setShowOfflineBanner(true);
        return;
      }
      if (c === true && r === false) {
        setShowOfflineBanner(true);
        return;
      }
      if (c === true && (r === true || r === null)) {
        setShowOfflineBanner(false);
        return;
      }
      if (c === null) {
        setShowOfflineBanner(false);
      }
    });
    return () => {
      unsub();
    };
  }, []);

  return { showOfflineBanner };
}
