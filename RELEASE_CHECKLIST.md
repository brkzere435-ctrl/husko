# Checklist release Husko (ordre conseillé)

Référence rapide ; détail dans [DEPLOIEMENT.md](DEPLOIEMENT.md) et [env.example](env.example). **iOS** (bundles, clé Maps, builds) : [IOS_RELEASE_CHECKLIST.md](IOS_RELEASE_CHECKLIST.md).

## 1. Machine locale

```bash
npm run chantiers:check
```

Si le `.env` est complet :

```bash
npm run eas:sync:maps
npm run eas:sync:firebase
```

Contrôle strict des 6 clés Firebase dans `.env` (optionnel, avant `eas build`) :

```bash
npm run firebase:env:check:strict
```

Si tout est **MANQ** alors que tu crois avoir rempli le `.env` : vérifier que le fichier est bien **à la racine du dépôt** (pas un sous-dossier), et que chaque ligne `EXPO_PUBLIC_FIREBASE_*=` a une **valeur non vide** après le `=` (pas seulement des espaces, pas de ligne commentée à la place de la valeur).

**Direction produit** (fil unique) : [src/constants/productDirection.ts](src/constants/productDirection.ts) — critères « terminé » dans `PRODUCT_DEFINITION_OF_DONE` : `npm run verify`, démo du parcours sur **APK installé**, pas de régression visuelle majeure sur l’écran prioritaire.

Avant une release sérieuse :

```bash
npm run release:gate
```

Raccourci (verify + checklist chantiers) :

```bash
npm run release:chantiers
```

## 2. Google Cloud (hors repo)

- Activer **Maps SDK for Android** (et iOS si besoin), facturation.
- Restreindre la clé Android : tous les packages listés par `chantiers:check` ; définitions dans `app.config.js` (`VARIANTS` + hub).
- SHA-1 du keystore EAS : `eas credentials` ou page du build Expo.

### Après changement de clé ou de restriction Maps (Android)

1. **Rebuild** un APK : une **OTA** ne suffit pas pour les clés natives.  
   Exemple : `npm run build:apk:unified` ou `npm run build:apk:client` (selon le profil utilisé).
2. **Réinstaller** l’APK sur l’appareil et ouvrir un écran avec carte (livreur, suivi avec mini-carte, etc.).
3. Vérifier que `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` est dans le `.env` **et** sur EAS :  
   `npm run eas:sync:maps` si tu n’as pas poussé la dernière valeur.

**Carte encore grise ?**

- Le **package** de l’APK installé doit correspondre à celui saisi dans Google Cloud (`com.husko.bynight` vs `.client`, etc.).
- Le **SHA-1** doit être celui du **même** build (keystore **release EAS** pour un APK release, pas le debug).

**iOS** : voir [IOS_RELEASE_CHECKLIST.md](IOS_RELEASE_CHECKLIST.md) (clé Maps iOS, bundles, `eas build -p ios`).

## 3. Firebase (hors repo)

- Renseigner les 6 `EXPO_PUBLIC_FIREBASE_*` dans `.env`, puis `npm run eas:sync:firebase`.
- **`google-services.json`** : une entrée Firebase Android par `applicationId` réel (hub, client, gérant, livreur, copilote) — voir le tableau dans [DEPLOIEMENT.md](DEPLOIEMENT.md) (section liaison Firebase).
- Règles Firestore si besoin : `npm run firebase:deploy:rules`.

## 4. Photos menu

- Fichiers `assets/menu/<id>.png` (voir [assets/menu/README.txt](assets/menu/README.txt) et `src/constants/menuImages.ts`).

## 5. Livrer

- **JS / UI uniquement** : `npm run verify` puis le bon `npm run eas:update:hub` (ou `client`, `gerant`, `livreur`, `assistant`).
- **Clés Maps, changement natif** : `npm run verify` puis `npm run build:apk:unified` ou `build:apk:client`, etc.

**Synthèse** : `.env` + Google + Firebase, sync EAS, photos menu, puis `verify` et soit **OTA** soit **rebuild APK**.
