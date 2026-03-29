/** Lundi–samedi 20h–00h (Angers Husko By Night) */
export function isDeliveryOpen(now = new Date()): boolean {
  const day = now.getDay();
  if (day === 0) return false;
  const h = now.getHours();
  const m = now.getMinutes();
  const minutes = h * 60 + m;
  const start = 20 * 60;
  const end = 24 * 60;
  return minutes >= start && minutes < end;
}

export function deliveryHoursLabel(): string {
  return 'Livraison lun–sam, 20h00 – 00h00';
}
