Android SDK Platform-Tools (adb, fastboot) — installation locale dans ce dossier.

  npm run tools:platform-tools

Crée : tools/platform-tools/ (ignoré par Git — voir .gitignore)

Ensuite, pour la session PowerShell courante :

  $env:PATH = "$(Resolve-Path .)/tools/platform-tools;$env:PATH"
  adb devices

Ou ajoutez tools/platform-tools au PATH utilisateur Windows une fois pour toutes.

Téléchargement officiel : https://developer.android.com/tools/releases/platform-tools

---
Débogage sans fil (Android 11+) : Paramètres → Options développeurs → Débogage sans fil ;
appairer avec adb pair IP:PORT puis adb connect IP:PORT (ports affichés sur le téléphone).

Hub « Choisir un espace » : il faut l’APK unifié (package com.husko.bynight), pas seulement les APK
gérant / client / livreur. Vérifier sur l’appareil (ADB USB ou sans fil) :

  npm run adb:husko

(Script Node : scripts/adb-husko-status.mjs)

Flux complet (PC + téléphone branché ou sans fil) :
  npm run apk:download:unified
  npm run apk:install:unified
  npm run adb:husko
(l’install utilise tools/platform-tools/adb.exe du dépôt si présent.)

Sinon : URL « unified » dans distribution.defaults.json, puis installer l’APK à la main.
