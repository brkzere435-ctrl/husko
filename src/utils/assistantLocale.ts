import * as Localization from 'expo-localization';

/** Code langue ISO pour le backend (prompt + ton). */
export function getAssistantRequestLocale(): 'fr' | 'en' {
  const loc = Localization.getLocales()[0];
  const code = (loc?.languageCode ?? 'fr').toLowerCase();
  return code === 'en' ? 'en' : 'fr';
}
