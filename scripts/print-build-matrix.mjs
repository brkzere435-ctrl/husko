/**
 * Affiche la matrice de builds EAS (Android APK + iOS) : hub unifié, rôles, Copilote.
 * Prerequis : npm install && eas login && eas init (projectId) — eas-cli est en devDependency
 */
const rows = [
  ['Hub APK unique', 'apk-unified', 'android', 'build:apk:unified'],
  ['Gérant', 'apk-gerant', 'android', 'build:apk:gerant'],
  ['Client', 'apk-client', 'android', 'build:apk:client'],
  ['Livreur', 'apk-livreur', 'android', 'build:apk:livreur'],
  ['Copilote', 'apk-assistant', 'android', 'build:apk:assistant'],
  ['---', '---', '---', '---'],
  ['Hub iOS', 'ios-internal', 'ios', 'build:ios'],
  ['Gérant iOS', 'ios-gerant', 'ios', 'build:ios:gerant'],
  ['Client iOS', 'ios-client', 'ios', 'build:ios:client'],
  ['Livreur iOS', 'ios-livreur', 'ios', 'build:ios:livreur'],
  ['Copilote iOS', 'ios-assistant', 'ios', 'build:ios:assistant'],
];

console.log('\n[Husko] Matrice EAS - definir secrets EXPO_PUBLIC_* (Firebase, Maps) avant build cloud.\n');
console.log('Rôle'.padEnd(14), 'Profil'.padEnd(16), 'Plateforme'.padEnd(10), 'npm run');
for (const [label, profile, plat, script] of rows) {
  console.log(label.padEnd(14), profile.padEnd(16), plat.padEnd(10), script);
}
console.log('APK unique (canal hub) : npm run build:apk:unified');
console.log(
  'Cinq APK séquentiels : npm run build:apk:all   |   trois mono-rôle (gérant+client+livreur) : npm run build:apk:three   |   alias : npm run build:apk:mono'
);
console.log('\nCommande directe (apres npm install) : eas build -p <android|ios> --profile <profil> --non-interactive\n');
