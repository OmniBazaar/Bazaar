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
  } catch (error) {
    console.warn(`Failed to load messages for locale ${locale}, falling back to English`);
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
  // Try to get from browser extension storage first
  // Then fallback to browser language
  const browserLang = navigator.language.split('-')[0] as SupportedLocale;
  
  if (SUPPORTED_LOCALES.includes(browserLang)) {
    return browserLang;
  }
  
  return DEFAULT_LOCALE;
}

// Save user's locale preference
export async function saveUserLocale(locale: SupportedLocale): Promise<void> {
  try {
    await chrome.storage.local.set({ locale });
  } catch (error) {
    console.error('Failed to save locale preference:', error);
  }
}

// Load user's locale preference
export async function loadUserLocale(): Promise<SupportedLocale> {
  try {
    const result = await chrome.storage.local.get(['locale']);
    const savedLocale = result.locale as SupportedLocale;
    
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
      return savedLocale;
    }
  } catch (error) {
    console.error('Failed to load locale preference:', error);
  }
  
  return getUserLocale();
} 