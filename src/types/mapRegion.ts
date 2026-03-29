/** Région carte (identique à `Region` de react-native-maps, sans dépendance native sur le web). */
export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
