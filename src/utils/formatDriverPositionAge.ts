export function formatDriverPositionAgeFr(updatedAt: number, now = Date.now()): string {
  const ageMs = Math.max(0, now - updatedAt);
  const ageSec = Math.round(ageMs / 1000);

  if (ageSec <= 45) {
    return "a l'instant";
  }
  if (ageSec < 60) {
    return `il y a ${ageSec} s`;
  }

  const ageMin = Math.floor(ageSec / 60);
  if (ageMin < 60) {
    return ageMin === 1 ? 'il y a 1 min' : `il y a ${ageMin} min`;
  }

  const ageH = Math.floor(ageMin / 60);
  if (ageH < 24) {
    return ageH === 1 ? 'il y a 1 h' : `il y a ${ageH} h`;
  }

  const ageD = Math.floor(ageH / 24);
  return ageD === 1 ? 'il y a 1 j' : `il y a ${ageD} j`;
}
