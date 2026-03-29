/**
 * Affiche la matrice de builds EAS (Android APK + iOS) pour les trois rôles + hub.
 * Prérequis : npm i -g eas-cli && eas login && eas init (projectId)
 */
const rows = [
  ['Hub / test', 'apk', 'android', 'build:android'],
  ['Gérant', 'apk-gerant', 'android', 'build:apk:gerant'],
  ['Client', 'apk-client', 'android', 'build:apk:client'],
  ['Livreur', 'apk-livreur', 'android', 'build:apk:livreur'],
  ['Copilote', 'apk-assistant', 'android', 'build:apk:assistant'],
  ['—', '—', '—', '—'],
  ['Hub iOS', 'ios-internal', 'ios', 'build:ios'],
  ['Gérant iOS', 'ios-gerant', 'ios', 'build:ios:gerant'],
  ['Client iOS', 'ios-client', 'ios', 'build:ios:client'],
  ['Livreur iOS', 'ios-livreur', 'ios', 'build:ios:livreur'],
  ['Copilote iOS', 'ios-assistant', 'ios', 'build:ios:assistant'],
];

console.log('\n[Husko] Matrice EAS — définir secrets EXPO_PUBLIC_* (Firebase, Maps) avant build cloud.\n');
console.log('Rôle'.padEnd(14), 'Profil'.padEnd(16), 'Plateforme'.padEnd(10), 'npm run');
for (const [label, profile, plat, script] of rows) {
  console.log(label.padEnd(14), profile.padEnd(16), plat.padEnd(10), script);
}
console.log('Trois APK (séquentiel) : npm run build:apk:all');
console.log('\nCommande directe : npx eas build -p <android|ios> --profile <profil> --non-interactive\n');
