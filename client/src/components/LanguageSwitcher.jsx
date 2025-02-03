import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    // Update document direction
    document.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLanguage}
        className="w-9 px-0 relative"
        title={i18n.language === 'en' ? t('common.switchToHebrew') : t('common.switchToEnglish')}
      >
        <Globe className="h-4 w-4" />
        <span className="sr-only">
          {i18n.language === 'en' ? t('common.switchToHebrew') : t('common.switchToEnglish')}
        </span>
      </Button>
    </div>
  );
} 