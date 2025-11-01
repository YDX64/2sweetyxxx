import React from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '@/types/language';
import { LanguageContext } from './createLanguageContext';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const value = {
    language: i18n.language as Language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
