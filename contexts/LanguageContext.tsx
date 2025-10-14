import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, supportedLanguages, type Language } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  supportedLanguages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('auraLanguage') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else {
        const browserLang = navigator.language.split('-')[0] as Language;
        if(translations[browserLang]) {
            setLanguageState(browserLang);
        }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    if (translations[lang]) {
        localStorage.setItem('auraLanguage', lang);
        setLanguageState(lang);
    }
  };

  const t = useCallback((key: string): string => {
    const keyTyped = key as keyof typeof translations['en'];
    return translations[language]?.[keyTyped] || translations['en'][keyTyped] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
