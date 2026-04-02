import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Sur Android, les `Marker` avec enfants personnalisés ne snapshotent pas toujours si
 * `tracksViewChanges` reste à false — l’icône peut rester invisible. On force un court
 * intervalle à true après chaque `resetKey` (ex. position livreur), puis on repasse à false.
 */
export function useTracksViewChangesForCustomMarker(resetKey: string | number): boolean {
  const [tracks, setTracks] = useState(Platform.OS === 'android');

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    setTracks(true);
    const t = setTimeout(() => setTracks(false), 1500);
    return () => clearTimeout(t);
  }, [resetKey]);

  return Platform.OS === 'android' ? tracks : false;
}
