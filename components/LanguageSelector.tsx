import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode as any);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('language')}
      >
        <Globe className="h-5 w-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-popover glass-card rounded-lg shadow-lg py-1 z-50 animate-fadeIn border border-border">
          {supportedLanguages.map(({ code, name }) => (
            <button
              key={code}
              onClick={() => handleLanguageSelect(code)}
              className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent flex items-center justify-between"
            >
              <span>{name}</span>
              {language === code && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
