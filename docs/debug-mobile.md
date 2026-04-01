# Debug runtime sur mobile (Husko / Expo)

## Pourquoi `localhost` depuis l’APK ne rejoint pas ton PC

Sur un **téléphone**, `127.0.0.1` désigne **l’appareil lui-même**, pas la machine qui lance Metro. Une requête HTTP vers `http://127.0.0.1:…` (par ex. un serveur de debug sur le poste de dev) **ne sort pas** vers le PC. Ce n’est pas un bug Husko : c’est le réseau loopback.

**Exception** : émulateur Android sur la même machine (souvent `10.0.2.2` pour joindre le host) — le comportement diffère du téléphone physique.

## Pistes pratiques

### 1. `console.log` + Metro (développement)

- Lancer le bundler avec la variante voulue, par ex. `npm run start:client` (voir `package.json`).
- Faire charger l’app depuis le **même bundle** que Metro (QR / USB selon le flux Expo).
- Les logs JS apparaissent dans le **terminal Metro** (ou l’UI Expo Dev Tools).

**Limite** : ne s’applique pas à un **APK EAS standalone** utilisé sans connexion au bundler.

### 2. Réseau : LAN ou tunnel

Scripts utiles dans `package.json` :

- `npm run start:lan` — `expo start --lan` : téléphone et PC sur le **même Wi‑Fi** (souvent le plus simple).
- `npm run start:tunnel` — `expo start --tunnel` : utile si le LAN est bloqué (firewall, réseaux isolés).

Objectif : que l’app charge le JS depuis ton PC **sans** utiliser `localhost` côté appareil.

### 3. Logs natifs Android (APK sans Metro)

Pour un build **sans** JS servi par Metro au moment du test :

- `adb logcat` filtré sur React Native / un tag applicatif, ou
- Android Studio **Logcat** avec l’appareil en USB.

Utile pour les crashs natifs ou pour vérifier si des logs JS sont encore émis (selon release vs debug).

### 4. `expo-dev-client` (optionnel)

Le dépôt n’inclut pas `expo-dev-client` par défaut. L’ajouter permet un **development build** (`expo run:android` / EAS) qui se connecte à Metro comme un flux de dev proche d’Expo Go, avec tes modules natifs. **Pas obligatoire** si LAN / tunnel + `expo start` suffisent.

### 5. Logger distant (production / APK « réel »)

Pour instrumenter un APK distribué sans PC à côté : service tiers (Sentry, etc.) ou **endpoint HTTPS** contrôlé (attention secrets, RGPD, volume). À réserver au staging / prod, pas au simple debug UI local.

## Synthèse

| Contexte | Approche |
|----------|----------|
| Dev avec Metro | `console.log` → terminal Metro ; réseau via `start:lan` ou `start:tunnel` |
| APK EAS sur téléphone sans Metro | `adb logcat` / captures d’écran ; pas d’ingest `127.0.0.1` sur le PC |
| Logs structurés hors poste local | Logger distant ou endpoint dédié |

## Signaler un bug UI

Une **capture** (ou courte vidéo) avec l’écran et le chemin (ex. À la carte → scroll) reste le signal le plus fiable quand l’appareil ne peut pas parler à ton poste de développement.
