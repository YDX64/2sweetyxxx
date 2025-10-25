import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useEffect } from "react";

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
];

export const AdminLanguageSelector = () => {
  const { i18n } = useTranslation();

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('admin-language');
    if (savedLang && languages.some(lang => lang.code === savedLang)) {
      i18n.changeLanguage(savedLang);
    } else {
      // Default olarak İngilizce ayarla
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('admin-language', langCode);
  };

  // Default olarak İngilizce kullan eğer mevcut dil bulunamazsa
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages.find(lang => lang.code === 'en') || languages[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          <Globe className="w-4 h-4 mr-2" />
          <span className="mr-1">{currentLanguage.flag}</span>
          {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-700">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`text-gray-300 hover:bg-gray-700 ${
              i18n.language === lang.code ? 'bg-gray-700' : ''
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
