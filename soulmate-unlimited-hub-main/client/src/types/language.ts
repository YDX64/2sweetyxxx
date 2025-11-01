export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'sv' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'tr' | 'nl' | 'da' | 'fi' | 'no' | 'hi' | 'vi';

// Modern Context7 pattern: Type-safe i18n translation options
export interface TranslationOptions {
  count?: number;
  defaultValue?: string;
  context?: string;
  replace?: Record<string, string | number>;
  interpolation?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: TranslationOptions) => string;
}
