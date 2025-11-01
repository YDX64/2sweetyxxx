import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translationService } from '@/services/translationService';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'messages'>;

interface TranslatedMessageProps {
  message: Message;
  targetLanguage: string;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}

export const TranslatedMessage = ({
  message,
  targetLanguage,
  showTranslation,
  onToggleTranslation
}: TranslatedMessageProps) => {
  const { t } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadTranslation = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Detect source language
      const sourceLanguage = translationService.detectLanguage(message.content);
      
      // Translate message
      const translated = await translationService.translateMessage(
        message.id,
        message.content,
        sourceLanguage,
        targetLanguage
      );
      
      setTranslatedText(translated);
    } catch (err) {
      console.error('Translation error:', err);
      setError(t('translationError'));
    } finally {
      setLoading(false);
    }
  }, [message.id, message.content, targetLanguage, t]);

  useEffect(() => {
    if (showTranslation && !translatedText) {
      loadTranslation();
    }
  }, [showTranslation, translatedText, loadTranslation]);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleTranslation}
        className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 h-auto"
      >
        <Languages className="w-3 h-3 mr-1" />
        {showTranslation ? t('hideTranslation') : t('showTranslation')}
      </Button>

      {showTranslation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-400">
          {loading ? (
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('translating')}
            </div>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          ) : (
            <div className="text-blue-800 dark:text-blue-200 text-sm">
              <div className="font-medium text-xs text-blue-600 dark:text-blue-400 mb-1">
                {t('translation')}:
              </div>
              {translatedText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
