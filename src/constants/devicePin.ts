/** PIN usine (1ʳᵉ ouverture uniquement) — à remplacer obligatoirement après 1ʳᵉ connexion. */
export const DEFAULT_ROLE_PIN = '4242';

export function isPinValidFormat(pin: string): boolean {
  return /^\d{4,8}$/.test(pin.trim());
}
