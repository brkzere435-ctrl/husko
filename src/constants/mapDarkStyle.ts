/** Style carte sombre type nuit / GTA (Google Maps JSON) */
export const mapDarkStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a7a7a' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d1818' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#4a2020' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0a1520' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#241010' }],
  },
];
