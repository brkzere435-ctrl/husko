/**
 * Affichage prix France (EUR) — espaces fines, virgule décimale (usage type livraison).
 */
const eur = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Ex. 12,50 € */
export function formatEuro(amount: number): string {
  return eur.format(amount);
}

/** Montant sans symbole séparé (pour layouts qui affichent € à part). */
export function formatEuroAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
