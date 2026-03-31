# Réparation autonome (cadre Husko)

## Garde-fou après correctif

Exécuter sur un dépôt Git propre :

```bash
npm run release:ready
```

(`release:gate` puis `release:doctor` — voir [package.json](../package.json).)

## Capturer des preuves avant / pendant le diagnostic

| Source | Quand |
|--------|--------|
| Terminal Metro | Lignes `[HuskoDebug]` en **dev** (`npx expo start`) — chemins Expo, Maps, variante. |
| `adb logcat` | APK sur téléphone USB — crashs / erreurs natives. |
| Sortie terminal | Script qui échoue (`release:ready`, `verify`, `build:gate:native`) — copier le message complet. |

Sondes boot : actives en **__DEV__** par défaut ; en **release**, uniquement si `EXPO_PUBLIC_HUSKO_DEBUG_BOOT=1` dans `.env` / EAS (build de terrain). Voir [env.example](../env.example).

Ingest HTTP `127.0.0.1` : joignable seulement si l’app tourne sur le **même PC** que le serveur (émulateur). Sur téléphone seul, utiliser Metro ou logcat.

## Cursor : appliquer des patches

Les modifications de fichiers `.ts` / `.tsx` nécessitent le **mode Agent**. En **mode Plan**, seuls certains fichiers (ex. Markdown) sont modifiables par l’assistant.

## Boucle recommandée

1. Symptôme ou gate rouge.  
2. Capturer une trace (tableau ci‑dessus).  
3. Formuler 2–4 hypothèses.  
4. Patch minimal.  
5. `npm run release:ready`.  
6. Test manuel ciblé si UI.  
7. `git commit` / `push`.  

Désactiver les sondes debug en prod pour les utilisateurs finaux : ne pas définir `EXPO_PUBLIC_HUSKO_DEBUG_BOOT` sur les builds « store ».
