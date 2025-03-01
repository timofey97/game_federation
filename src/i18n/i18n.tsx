import { createContext, useContext, useState, ReactNode } from 'react';
import en from './en.json';
import sl from './sl.json';

type Translations = typeof en;

const translations = {
  en,
  sl,
};

type LanguageContextType = {
  language: 'en' | 'sl';
  setLanguage: (lang: 'en' | 'sl') => void;
  t: (key: string, params?: Record<string, any>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'sl'>('en');

  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }
    
    if (typeof value === 'string' && params) {
      // Replace all occurrences of {paramName} with the actual parameter value
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      });
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
