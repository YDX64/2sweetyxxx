import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import sv from './locales/sv.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import tr from './locales/tr.json';
import nl from './locales/nl.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import no from './locales/no.json';
import hi from './locales/hi.json';
import vi from './locales/vi.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  sv: { translation: sv },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  tr: { translation: tr },
  nl: { translation: nl },
  da: { translation: da },
  fi: { translation: fi },
  no: { translation: no },
  hi: { translation: hi },
  vi: { translation: vi },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      // Detection order: first check localStorage, then browser language
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache the language in localStorage
      caches: ['localStorage'],
      
      // localStorage key for storing language preference
      lookupLocalStorage: 'i18nextLng',
      
      // Convert detected language codes to our supported languages
      convertDetectedLanguage: (lng) => {
        // Handle language variants (e.g., 'en-US' -> 'en')
        const primaryLang = lng.split('-')[0];
        
        // Check if we support this language
        if (primaryLang in resources) {
          return primaryLang;
        }
        
        // Special handling for Chinese variants
        if (lng.startsWith('zh')) {
          return 'zh';
        }
        
        // Norwegian variants
        if (lng.startsWith('nb') || lng.startsWith('nn')) {
          return 'no';
        }
        
        return lng;
      },
    },
    
    // Supported languages
    supportedLngs: Object.keys(resources),
    
    // Don't load languages we don't support
    load: 'languageOnly',
    
    // Automatically set dir attribute for RTL languages
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
  });

// Set document direction for RTL languages
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Set initial direction
const initialLang = i18n.language || 'en';
document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = initialLang;

export default i18n;
