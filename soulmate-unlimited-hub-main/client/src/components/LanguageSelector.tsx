import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { Language } from "@/types/language";
import { FlagIcon } from "@/components/ui/flag-icon";

const languages: { code: Language; name: string; shortName: string; flag: string }[] = [
  { code: 'tr', name: 'Türkçe', shortName: 'TR', flag: '🇹🇷' },
  { code: 'en', name: 'English', shortName: 'EN', flag: '🇺🇸' },
  { code: 'sv', name: 'Svenska', shortName: 'SV', flag: '🇸🇪' },
  { code: 'es', name: 'Español', shortName: 'ES', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', shortName: 'FR', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', shortName: 'DE', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', shortName: 'IT', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', shortName: 'PT', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', shortName: 'RU', flag: '🇷🇺' },
  { code: 'zh', name: '中文', shortName: 'ZH', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', shortName: 'JA', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', shortName: 'KO', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', shortName: 'AR', flag: '🇸🇦' },
  { code: 'nl', name: 'Nederlands', shortName: 'NL', flag: '🇳🇱' },
  { code: 'da', name: 'Dansk', shortName: 'DA', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', shortName: 'FI', flag: '🇫🇮' },
  { code: 'no', name: 'Norsk', shortName: 'NO', flag: '🇳🇴' },
  { code: 'hi', name: 'हिन्दी', shortName: 'HI', flag: '🇮🇳' },
  { code: 'vi', name: 'Tiếng Việt', shortName: 'VI', flag: '🇻🇳' },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  
  // Default olarak İngilizce kullan eğer mevcut dil bulunamazsa
  const currentLanguage = languages.find(lang => lang.code === language) || languages.find(lang => lang.code === 'en') || languages[1];

  return (
    <Select value={language || 'en'} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger className="w-auto min-w-[70px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg h-8 px-3 outline-none focus:outline-none focus:ring-2 focus:ring-pink-500/20">
        <div className="flex items-center space-x-1.5">
          <FlagIcon code={currentLanguage.code} className="w-5 h-3.5" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentLanguage.shortName}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="min-w-[180px]">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
            <div className="flex items-center space-x-3">
              <FlagIcon code={lang.code} className="w-5 h-3.5" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                {lang.shortName}
              </span>
              <span className="text-sm">{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
