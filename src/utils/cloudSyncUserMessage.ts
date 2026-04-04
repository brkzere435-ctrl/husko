/**
 * Transforme les messages techniques Firestore / réseau en libellés présentables côté client
 * (pas de jargon Firebase, pas de stack).
 */
export function formatCloudSyncErrorForUser(raw: string | null | undefined): string | null {
  if (raw == null || raw.trim() === '') return null;
  const m = raw.toLowerCase();

  if (
    m.includes('network') ||
    m.includes('fetch') ||
    m.includes('internet') ||
    m.includes('offline') ||
    m.includes('failed to fetch') ||
    m.includes('unavailable') ||
    m.includes('unreachable') ||
    m.includes('econnrefused') ||
    m.includes('connection') ||
    m.includes('timed out') ||
    m.includes('timeout') ||
    m.includes('deadline-exceeded')
  ) {
    return 'Connexion instable ou absente. Vérifiez le réseau (Wi‑Fi ou données) et réessayez.';
  }

  if (m.includes('permission') || m.includes('permission-denied')) {
    return 'Accès refusé par le serveur. Réessayez plus tard ou contactez le support.';
  }

  if (m.includes('quota') || m.includes('resource-exhausted')) {
    return 'Service temporairement saturé. Réessayez dans quelques minutes.';
  }

  if (m.includes('unauthenticated') || m.includes('auth')) {
    return 'Session expirée ou non autorisée. Réessayez après avoir rouvert l’application.';
  }

  return 'Synchronisation momentanément indisponible. Réessayez dans un instant.';
}
