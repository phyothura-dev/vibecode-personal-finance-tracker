import React, { createContext, useContext, useCallback } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Built-in Myanmar language only
  const language: Language = 'mm';

  // Clear old English language preference if stored
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('fintrack_lang', 'mm');
    } catch {
      // Ignore storage errors
    }
  }

  const setLanguage = useCallback((_lang: Language) => {
    // Built-in Myanmar language only
  }, []);

  const t = useCallback((keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    
    // First attempt to find translation in Myanmar language
    let obj: any = translations['mm'];
    let found = true;
    
    for (const key of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
        obj = obj[key];
      } else {
        found = false;
        break;
      }
    }

    // Fallback to English if key missing in Myanmar dictionary
    if (!found || typeof obj !== 'string') {
      obj = translations['en'];
      for (const key of keys) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
          obj = obj[key];
        } else {
          return keyPath;
        }
      }
    }

    if (typeof obj !== 'string') {
      return keyPath;
    }

    let text = obj;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return text;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
