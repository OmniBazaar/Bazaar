import { createIntl, createIntlCache, IntlShape } from 'react-intl';

// Supported locales based on legacy OmniBazaar
export const SUPPORTED_LOCALES = [
  'en', // English (default)
  'es', // Spanish
  'fr', // French
  'de', // German
  'it', // Italian
  'pt', // Portuguese
  'ru', // Russian
  'zh', // Chinese
  'ja', // Japanese
  'ko', // Korean
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Create intl cache for performance
const cache = createIntlCache();

// Default locale
export const DEFAULT_LOCALE: SupportedLocale = 'en';

// Message loading function
export async function loadMessages(locale: SupportedLocale): Promise<Record<string, string>> {
  try {
    const messages = await import(`./messages/${locale}.json`);
    return messages.default;
  } catch {
    const fallbackMessages = await import('./messages/en.json');
    return fallbackMessages.default;
  }
}

// Create intl instance
export function createIntlInstance(locale: SupportedLocale, messages: Record<string, string>): IntlShape {
  return createIntl(
    {
      locale,
      messages,
      defaultLocale: DEFAULT_LOCALE,
    },
    cache
  );
}

// Get user's preferred locale
export function getUserLocale(): SupportedLocale {
  try {
    const userLanguage = navigator.language.slice(0, 2);
    return SUPPORTED_LOCALES.includes(userLanguage as SupportedLocale) 
      ? userLanguage as SupportedLocale 
      : 'en';
  } catch {
    return 'en';
  }
}

// Save user's locale preference
export async function saveUserLocale(locale: SupportedLocale): Promise<void> {
  try {
    await chrome.storage.local.set({ locale });
  } catch {
    // Failed to save locale
  }
}

// Load user's locale preference
export async function loadUserLocale(): Promise<SupportedLocale> {
  try {
    const result = await chrome.storage.local.get(['locale']);
    return result.locale ?? getUserLocale();
  } catch {
    return getUserLocale();
  }
} 