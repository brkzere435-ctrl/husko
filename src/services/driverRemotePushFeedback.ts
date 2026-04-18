/**
 * Feedback UI quand l'écriture Firestore `meta/driver` échoue (permissions, réseau, règles).
 * Évite le silence total si le GPS local marche mais le client ne voit rien.
 */
type Listener = () => void;

const listeners = new Set<Listener>();
let lastError: string | null = null;
/** Dernière écriture `meta/driver` réussie (ms), pour l’UI livreur. */
let lastSuccessAt: number | null = null;

function emit(): void {
  for (const l of listeners) l();
}

export function subscribeDriverRemotePush(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDriverRemotePushErrorSnapshot(): string | null {
  return lastError;
}

export function getDriverRemotePushLastSuccessAtSnapshot(): number | null {
  return lastSuccessAt;
}


export function markDriverRemotePushOk(): void {
  lastSuccessAt = Date.now();
  const hadErr = lastError !== null;
  if (hadErr) lastError = null;
  emit();
}

export function markDriverRemotePushFailed(err: unknown): void {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : 'Erreur inconnue (Firestore)';
  if (lastError === msg) return;
  lastError = msg;
  emit();
}
