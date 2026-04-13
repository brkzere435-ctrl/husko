# Reprise qualité — baseline appareil unique

Date: 2026-04-13  
Appareil: Android physique (tests ADB)  
Objectif: figer un état runtime OTA/canal/bundle + scénario de repro stable.

## Runtime OTA observé

- `gérant`
  - package: `com.husko.bynight.gerant`
  - canal: `gerant`
  - runtime: `1.0.4`
  - bundle OTA: `019d8552-8776-76ac-9e25-0ddfaa726de6`
- `client`
  - package: `com.husko.bynight.client`
  - canal: `client`
  - runtime: `1.0.4`
  - bundle OTA: `019d83fd-eb3b-7381-9acb-f638caa68308`
- `livreur`
  - package: `com.husko.bynight.livreur`
  - canal: `livreur`
  - runtime: `1.0.4`
  - bundle OTA: `019d8408-89cd-78f9-a914-9b4b93851fb3`

## Scénario de test de référence

1. `gérant` déverrouille l'app, ouvre la prise de commandes, valide puis transmet au livreur.
2. `livreur` passe en ligne, prend la course, reste sur écran principal (watch + poll GPS actifs).
3. `client` ouvre `Ma livraison` et vérifie:
   - map visible,
   - statut cohérent avec la commande suivie,
   - déplacement du véhicule en live.

## Résultat attendu pour la phase

- pas de blocage PIN empêchant le lancement de course,
- pas de suivi "global" détaché de la commande active,
- positions GPS livreur rafraîchies régulièrement en Firestore.
