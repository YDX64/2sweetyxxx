import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Languages, Settings } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translationService } from '@/services/translationService';
import { toast } from 'sonner';

interface TranslationToggleProps {
  conversationId: string;
  isUser1: boolean;
  translationEnabled: boolean;
  userLanguage: string;
  onTranslationToggle: (enabled: boolean, language: string) => void;
}

export const TranslationToggle = ({
  conversationId,
  isUser1,
  translationEnabled,
  userLanguage,
  onTranslationToggle
}: TranslationToggleProps) => {
  const { t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(userLanguage);
  const [updating, setUpdating] = useState(false);

  const supportedLanguages = translationService.getSupportedLanguages();

  const handleToggleTranslation = async (enabled: boolean) => {
    setUpdating(true);
    
    try {
      const success = await translationService.updateConversationTranslation(
        conversationId,
        isUser1 ? 'user1' : 'user2', // This should be actual user ID
        enabled,
        selectedLanguage
      );

      if (success) {
        onTranslationToggle(enabled, selectedLanguage);
        toast.success(
          enabled 
            ? t('translationEnabled') 
            : t('translationDisabled')
        );
      } else {
        toast.error(t('translationToggleError'));
      }
    } catch (error) {
      console.error('Translation toggle error:', error);
      toast.error(t('translationToggleError'));
    } finally {
      setUpdating(false);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    
    if (translationEnabled) {
      setUpdating(true);
      try {
        const success = await translationService.updateConversationTranslation(
          conversationId,
          isUser1 ? 'user1' : 'user2', // This should be actual user ID
          true,
          newLanguage
        );

        if (success) {
          onTranslationToggle(true, newLanguage);
          toast.success(t('languageUpdated'));
        } else {
          toast.error(t('languageUpdateError'));
        }
      } catch (error) {
        console.error('Language update error:', error);
        toast.error(t('languageUpdateError'));
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {t('autoTranslation')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('autoTranslationDescription')}
            </p>
          </div>
        </div>
        <Switch
          checked={translationEnabled}
          onCheckedChange={handleToggleTranslation}
          disabled={updating}
        />
      </div>

      {translationEnabled && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('yourLanguage')}:
          </label>
          <Select
            value={selectedLanguage}
            onValueChange={handleLanguageChange}
            disabled={updating}
          >
            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              {supportedLanguages.map((lang) => (
                <SelectItem 
                  key={lang.code} 
                  value={lang.code}
                  className="dark:text-gray-200 dark:focus:bg-gray-700"
                >
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('translationLanguageNote')}
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2">
          <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('translationNote')}:</p>
            <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
              <li>• {t('translationNotePoint1')}</li>
              <li>• {t('translationNotePoint2')}</li>
              <li>• {t('translationNotePoint3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
