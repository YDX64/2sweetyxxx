/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaMoon, FaSun, FaChevronDown } from 'react-icons/fa';
import { useTheme } from '../Context/ThemeContext';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const languages = useMemo(() => [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
  ], []);

  const currentLanguage = useMemo(() =>
    languages.find(lang => lang.code === i18n.language) || languages[0],
    [i18n.language, languages]
  );

  // Initialize language from localStorage on mount
  useEffect(() => {
    const savedLang = (typeof localStorage !== 'undefined' && localStorage ? localStorage.getItem('i18nextLng') : null) ||
                      (typeof sessionStorage !== 'undefined' && sessionStorage ? sessionStorage.getItem('I18') : null);
    if (savedLang && languages.some(lang => lang.code === savedLang)) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n, languages]);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    sessionStorage.setItem('I18', langCode); // For compatibility with Header.jsx
    setIsOpen(false);
    // Force a reload to ensure translations are applied
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-3">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <FaSun className="text-yellow-400 text-xl" />
        ) : (
          <FaMoon className="text-gray-700 text-xl" />
        )}
      </button>

      {/* Language Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <FaGlobe className="text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <FaChevronDown className={`text-gray-700 dark:text-gray-300 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 max-h-96 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                  {i18n.language === lang.code && (
                    <span className="ml-auto text-pink-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
/* jshint ignore:end */