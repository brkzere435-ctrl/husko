const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Évite l’avertissement EAS/Metro : « Unknown option watcher.unstable_workerThreads »
if (config.watcher && Object.prototype.hasOwnProperty.call(config.watcher, 'unstable_workerThreads')) {
  delete config.watcher.unstable_workerThreads;
  if (Object.keys(config.watcher).length === 0) {
    delete config.watcher;
  }
}

module.exports = config;
