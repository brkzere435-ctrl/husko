---
name: Bug / réparation
about: Signaler un problème avec des preuves pour la boucle autonome
title: ''
labels: ''
---

## Symptôme

(écran, crash, message d’erreur, profil APK concerné)

## Preuves (obligatoire pour aller vite)

- [ ] Sortie de `npm run release:ready` (copier/coller si échec) ou « OK »
- [ ] Extraits `[HuskoDebug]` depuis Metro **ou** extrait `adb logcat` si APK téléphone
- [ ] Branche / commit : `git rev-parse --short HEAD`

## Contexte

- Expo Go / émulateur / APK installé ?
- Firebase / Maps : configuré sur l’appareil ou build de test ?

Voir aussi : `docs/reparation-autonomie.md`.
