import { supabase } from '@/integrations/supabase/client';

export interface TranslationCache {
  id: string;
  message_id: string;
  original_language: string;
  target_language: string;
  translated_content: string;
  created_at: string;
}

class TranslationService {
  // Google Translate API Alternative - Using Mymemory (free tier)
  private readonly MYMEMORY_API_BASE = 'https://api.mymemory.translated.net/get';
  
  // Language code mapping
  private readonly LANGUAGE_CODES: Record<string, string> = {
    'tr': 'tr',
    'en': 'en',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'pt': 'pt',
    'ru': 'ru',
    'zh': 'zh',
    'ja': 'ja',
    'ko': 'ko',
    'ar': 'ar',
    'da': 'da',
    'fi': 'fi',
    'no': 'no',
    'nl': 'nl',
    'sv': 'sv'
  };

  // Check cache first, then translate if not found
  async translateMessage(
    messageId: string,
    content: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<string> {
    try {
      // Check cache first
      const cached = await this.getCachedTranslation(messageId, toLanguage);
      if (cached) {
        return cached.translated_content;
      }

      // If not in cache, translate
      const translated = await this.translateText(content, fromLanguage, toLanguage);
      
      // Save to cache
      await this.saveCachedTranslation(messageId, fromLanguage, toLanguage, translated);
      
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return content; // Return original content if translation fails
    }
  }

  // Get cached translation
  private async getCachedTranslation(
    messageId: string,
    targetLanguage: string
  ): Promise<TranslationCache | null> {
    try {
      const { data, error } = await supabase
        .from('message_translations_cache')
        .select('*')
        .eq('message_id', messageId)
        .eq('target_language', targetLanguage)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  // Save translation to cache
  private async saveCachedTranslation(
    messageId: string,
    originalLanguage: string,
    targetLanguage: string,
    translatedContent: string
  ): Promise<void> {
    try {
      await supabase
        .from('message_translations_cache')
        .insert({
          message_id: messageId,
          original_language: originalLanguage,
          target_language: targetLanguage,
          translated_content: translatedContent
        });
    } catch (error) {
      console.error('Cache save error:', error);
      // Don't throw error, just log it
    }
  }

  // Translate text using free API
  private async translateText(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    try {
      // If languages are the same, return original text
      if (fromLang === toLang) {
        return text;
      }

      // Get language codes
      const fromCode = this.LANGUAGE_CODES[fromLang] || fromLang;
      const toCode = this.LANGUAGE_CODES[toLang] || toLang;

      // Build API URL
      const url = new URL(this.MYMEMORY_API_BASE);
      url.searchParams.set('q', text);
      url.searchParams.set('langpair', `${fromCode}|${toCode}`);
      url.searchParams.set('de', 'YOUR_EMAIL@domain.com'); // Optional email for better rate limits

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText;
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Translation API error:', error);
      
      // Fallback: Try alternative free service (LibreTranslate)
      return await this.translateWithLibreTranslate(text, fromLang, toLang);
    }
  }

  // Alternative translation service (LibreTranslate - free and open source)
  private async translateWithLibreTranslate(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    try {
      // LibreTranslate public instance
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: this.LANGUAGE_CODES[fromLang] || fromLang,
          target: this.LANGUAGE_CODES[toLang] || toLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate error: ${response.status}`);
      }

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('LibreTranslate error:', error);
      return text; // Return original text as fallback
    }
  }

  // Detect language of text (basic detection based on common words)
  detectLanguage(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Turkish detection
    if (this.containsTurkishWords(lowerText)) return 'tr';
    
    // English detection
    if (this.containsEnglishWords(lowerText)) return 'en';
    
    // Spanish detection
    if (this.containsSpanishWords(lowerText)) return 'es';
    
    // French detection
    if (this.containsFrenchWords(lowerText)) return 'fr';
    
    // German detection
    if (this.containsGermanWords(lowerText)) return 'de';
    
    // Default to English if can't detect
    return 'en';
  }

  private containsTurkishWords(text: string): boolean {
    const turkishWords = ['ve', 'bir', 'bu', 'da', 'de', 'için', 'ile', 'var', 'yok', 'nasıl', 'ne', 'ben', 'sen', 'o'];
    return turkishWords.some(word => text.includes(word));
  }

  private containsEnglishWords(text: string): boolean {
    const englishWords = ['the', 'and', 'is', 'are', 'was', 'were', 'have', 'has', 'this', 'that', 'you', 'i', 'me'];
    return englishWords.some(word => text.includes(word));
  }

  private containsSpanishWords(text: string): boolean {
    const spanishWords = ['el', 'la', 'y', 'es', 'en', 'un', 'una', 'que', 'de', 'para', 'con', 'tú', 'yo'];
    return spanishWords.some(word => text.includes(word));
  }

  private containsFrenchWords(text: string): boolean {
    const frenchWords = ['le', 'la', 'et', 'est', 'en', 'un', 'une', 'que', 'de', 'pour', 'avec', 'tu', 'je'];
    return frenchWords.some(word => text.includes(word));
  }

  private containsGermanWords(text: string): boolean {
    const germanWords = ['der', 'die', 'das', 'und', 'ist', 'in', 'ein', 'eine', 'dass', 'von', 'für', 'mit', 'du', 'ich'];
    return germanWords.some(word => text.includes(word));
  }

  // Enable/disable translation for conversation
  async updateConversationTranslation(
    conversationId: string,
    userId: string,
    enabled: boolean,
    language: string
  ): Promise<boolean> {
    try {
      // First get conversation to determine user position
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversationId)
        .single();

      if (fetchError) throw fetchError;

      const isUser1 = conversation.participant1_id === userId;
      const updateData = isUser1 
        ? { 
            translation_enabled_by_user1: enabled,
            user1_language: language
          }
        : { 
            translation_enabled_by_user2: enabled,
            user2_language: language
          };

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating conversation translation:', error);
      return false;
    }
  }

  // Get supported languages
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'tr', name: 'Türkçe' },
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Português' },
      { code: 'ru', name: 'Русский' },
      { code: 'zh', name: '中文' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' },
      { code: 'ar', name: 'العربية' },
      { code: 'da', name: 'Dansk' },
      { code: 'fi', name: 'Suomi' },
      { code: 'no', name: 'Norsk' },
      { code: 'nl', name: 'Nederlands' },
      { code: 'sv', name: 'Svenska' }
    ];
  }
}

export const translationService = new TranslationService();
