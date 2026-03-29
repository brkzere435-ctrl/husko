/**
 * Force newArchEnabled=false dans gradle.properties (react-native-maps + EAS Android).
 * Expo SDK 55 peut ignorer app.json newArchEnabled ; ce mod s'applique au prebuild.
 */
const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAndroidNewArchOff(config) {
  return withGradleProperties(config, (c) => {
    c.modResults = c.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'newArchEnabled')
    );
    c.modResults.push({ type: 'property', key: 'newArchEnabled', value: 'false' });
    return c;
  });
};
