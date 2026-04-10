/**
 * Analyse le JSON « Diagnostic terrain » (Réglages gérant) pour recouper
 * applicationId, variante résolue et extra — sans dépendre du réseau / NDJSON.
 */
export type GerantFieldDiagnosticPayload = {
  hypothesisId?: string;
  applicationId: string | null;
  resolvedVariant: string;
  extraAppVariant?: string;
  screen: { w: number; h: number };
  ts?: number;
};

export type GerantFieldDiagnosticInterpretation = {
  severity: 'ok' | 'warn' | 'error';
  lines: string[];
};

export function interpretGerantFieldDiagnostic(
  p: GerantFieldDiagnosticPayload
): GerantFieldDiagnosticInterpretation {
  const lines: string[] = [];
  let severity: GerantFieldDiagnosticInterpretation['severity'] = 'ok';

  const id = p.applicationId?.toLowerCase().trim() ?? '';
  const rv = p.resolvedVariant;
  const ev = p.extraAppVariant ?? '';

  if (id.includes('.gerant')) {
    if (rv !== 'gerant') {
      severity = 'error';
      lines.push(
        `Incohérence : package gérant (${id}) mais variante résolue « ${rv} » (attendu : gerant). Le bloc « Applications liées » peut être masqué sur l’accueil.`
      );
    } else {
      lines.push(
        'Cohérence : APK gérant et variante « gerant » — le bloc « Applications liées » doit s’afficher sur l’accueil.'
      );
    }
  } else if (id === 'com.husko.bynight' || id === 'com.husko.app') {
    if (rv === 'all') {
      lines.push(
        'Hub unifié : variante « all » — la section « Applications liées » est masquée sur la route gérant (comportement actuel du code).'
      );
      severity = 'warn';
    }
  } else if (!id) {
    lines.push(
      'applicationId absent (souvent web / Expo Go sans id natif) : la variante vient surtout du manifeste / extra.'
    );
    severity = 'warn';
  }

  if (ev && rv !== ev) {
    lines.push(
      `Note : extra manifeste « ${ev} » ≠ variante résolue « ${rv} » — normal si l’identité native impose la variante.`
    );
    if (severity === 'ok') severity = 'warn';
  }

  if (p.screen.w > 0 && p.screen.h > 0 && p.screen.h < 480) {
    lines.push(
      `Écran très bas (${p.screen.w}×${p.screen.h}) : si l’accueil semble « tassé », vérifier défilement et clavier.`
    );
    if (severity === 'ok') severity = 'warn';
  }

  if (lines.length === 0) {
    lines.push('Aucune anomalie évidente sur identifiants / variantes pour cette capture.');
  }

  return { severity, lines };
}
