import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { chatService } from '@/services/chatService';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, MoreVertical, Heart, Gift, MessageCircle, Settings, Smile, Languages, Image, Camera } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TranslationToggle } from './TranslationToggle';
import { TranslatedMessage } from './TranslatedMessage';
import { CallButtons } from './CallButtons';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

type Message = Tables<'messages'>;
type Profile = Tables<'profiles'>;
type Conversation = Tables<'conversations'>;

interface ChatInterfaceProps {
  conversationId: string;
  otherUser: Profile;
  onBack: () => void;
}

// Sık kullanılan emojiler
const POPULAR_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
  '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
  '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒',
  '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '✨', '💫', '⭐', '🌟', '💥', '💯', '🔥', '❄️', '☃️', '⛄',
  '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
  '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋'
];

export const ChatInterface = ({ conversationId, otherUser, onBack }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { hasFeature } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [showTranslationSettings, setShowTranslationSettings] = useState(false);
  const [translationStates, setTranslationStates] = useState<{[key: string]: boolean}>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const data = await chatService.getMessages(conversationId);
    // Convert from shared schema format to Supabase format
    const convertedMessages = data.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      conversation_id: msg.conversationId || msg.conversation_id,
      created_at: msg.createdAt || msg.created_at,
      sender_id: msg.senderId || msg.sender_id
    }));
    setMessages(convertedMessages);
    setLoading(false);
  }, [conversationId]);

  const loadConversation = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    loadConversation();
    
    const subscription = chatService.subscribeToMessages(conversationId, (message: any) => {
      // Convert from shared schema format to Supabase format
      const convertedMessage = {
        id: message.id,
        content: message.content,
        conversation_id: message.conversationId || message.conversation_id,
        created_at: message.createdAt || message.created_at,
        sender_id: message.senderId || message.sender_id
      };
      setMessages(prev => [...prev, convertedMessage]);
    });

    // Subscribe to typing events
    const typingChannel = supabase.channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== user?.id) {
          setOtherUserTyping(payload.isTyping);
          if (payload.isTyping) {
            setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      typingChannel.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, loadMessages, loadConversation, user?.id]); // ✅ All dependencies declared

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Önce input'u temizle

    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}/${conversationId}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('message-images')
          .upload(fileName, selectedImage);
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: t('error'),
            description: t('imageUploadFailed'),
            variant: 'destructive'
          });
          return;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('message-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
        setSelectedImage(null);
        setImagePreview(null);
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent || '📷',
          image_url: imageUrl
        });

      if (error) {
        console.error('Error sending message:', error);
        if (messageContent) setNewMessage(messageContent); // Hata varsa mesajı geri koy
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (messageContent) setNewMessage(messageContent); // Hata varsa mesajı geri koy
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing status
      supabase.channel(`typing:${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: user?.id, isTyping: true }
        });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Broadcast stop typing
      supabase.channel(`typing:${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: user?.id, isTyping: false }
        });
    }, 1000);
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Locale ayarları
    const localeMap: Record<string, string> = {
      'tr': 'tr-TR',
      'en': 'en-US',
      'de': 'de-DE'
    };
    const locale = localeMap[language] || 'tr-TR';

    // Eğer mesaj bugün atıldıysa
    if (diffInDays === 0) {
      if (diffInMinutes < 1) {
        return t('now');
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} ${t('minutesAgo')}`;
      } else if (diffInHours < 24) {
        return `${diffInHours} ${t('hoursAgo')}`;
      } else {
        return messageDate.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } else if (diffInDays === 1) {
      return t('yesterday');
    } else if (diffInDays < 7) {
      return `${diffInDays} ${t('daysAgo')}`;
    } else {
      return messageDate.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const handleTranslationToggle = async (enabled: boolean, language: string) => {
    await loadConversation();
  };

  const handleCallInitiated = (callId: string, callType: 'voice' | 'video') => {
    // Handle call logic here - could open a modal or redirect to call interface
    console.log('Call initiated:', { callId, callType });
  };

  const toggleMessageTranslation = (messageId: string) => {
    setTranslationStates(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const isUser1 = conversation?.participant1_id === user?.id;
  const translationEnabled = isUser1 
    ? conversation?.translation_enabled_by_user1 
    : conversation?.translation_enabled_by_user2;
  const userLanguage = isUser1 
    ? conversation?.user1_language || 'tr'
    : conversation?.user2_language || 'tr';
  const otherUserLanguage = isUser1 
    ? conversation?.user2_language || 'tr' 
    : conversation?.user1_language || 'tr';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header - Sabit */}
      <CardHeader className="flex-shrink-0 flex-row items-center space-y-0 space-x-4 border-b dark:border-gray-600/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm">
        <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/50 dark:text-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="relative">
          <div className="relative p-0.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full">
            <Avatar className="w-12 h-12 overflow-hidden">
              <OptimizedImage 
                src={otherUser.photos?.[0] || '/placeholder.svg'} 
                alt={otherUser.name || 'User'}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <AvatarFallback className="bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900 text-pink-600 dark:text-pink-300 font-semibold">
                {otherUser.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{otherUser.name || 'Unknown User'}</h3>
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
            {otherUserTyping ? (
              <div className="flex items-center text-pink-500">
                <span className="mr-2">{t('typing')}</span>
                <div className="flex space-x-1">
                  <motion.div 
                    className="w-1.5 h-1.5 bg-pink-500 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 bg-pink-500 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 bg-pink-500 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                {t('active')}
              </>
            )}
          </p>
        </div>

        <div className="flex space-x-1">
          <CallButtons
            conversationId={conversationId}
            receiverId={otherUser.id}
            onCallInitiated={handleCallInitiated}
          />
          
          <Button 
            variant={translationEnabled ? "default" : "outline"}
            size="sm" 
            onClick={() => setShowTranslationSettings(!showTranslationSettings)}
            className={`${
              translationEnabled 
                ? 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-200'
            }`}
            title={translationEnabled ? t('aiTranslateActive') : t('aiTranslate')}
          >
            <Languages className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTranslationSettings(!showTranslationSettings)}
            className="hover:bg-gray-50/70 dark:hover:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hover:bg-gray-50/70 dark:hover:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-200">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-gray-800/90 dark:border-gray-600/50">
              <DropdownMenuItem 
                className="dark:hover:bg-gray-700/50 dark:text-gray-200 cursor-pointer"
                onClick={() => window.open(`/profile/${otherUser.id}`, '_blank')}
              >
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                {t('viewProfile')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Translation Settings */}
      {showTranslationSettings && conversation && (
        <div className="flex-shrink-0 p-4 border-b dark:border-gray-600/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <TranslationToggle
            conversationId={conversationId}
            isUser1={isUser1}
            translationEnabled={translationEnabled || false}
            userLanguage={userLanguage}
            onTranslationToggle={handleTranslationToggle}
          />
        </div>
      )}

      {/* Messages - Kayar Alan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent min-h-0">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">{t('loadingMessages')}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>{t('sendFirstMessage')}</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;
            const shouldShowTranslation = !isOwnMessage && translationEnabled && hasFeature('multiLanguageChat');
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] space-y-2`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm break-words ${
                      isOwnMessage
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                        : 'bg-white/90 dark:bg-gray-700/90 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600/50 backdrop-blur-sm'
                    }`}
                  >
                    {/* image_url column doesn't exist in messages table */}
                    {/* {message.image_url && (
                      <div className="mb-2">
                        <img 
                          src={message.image_url} 
                          alt="Sent image" 
                          className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
                          onClick={() => window.open(message.image_url, '_blank')}
                        />
                      </div>
                    )} */}
                    {message.content && message.content !== '📷' && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-pink-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                  
                  {shouldShowTranslation && (
                    <TranslatedMessage
                      message={message}
                      targetLanguage={userLanguage}
                      showTranslation={translationStates[message.id] || false}
                      onToggleTranslation={() => toggleMessageTranslation(message.id)}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Sabit */}
      <div className="flex-shrink-0 p-4 border-t dark:border-gray-600/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg safe-bottom">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-20 w-20 object-cover rounded-lg border-2 border-pink-500"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex space-x-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            aria-label="Upload image"
          />
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-700/50"
          >
            <Image className="w-4 h-4" />
          </Button>
          
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-shrink-0 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-700/50"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 dark:bg-gray-800/95 dark:border-gray-600/50" side="top">
              <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                {POPULAR_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-8 h-8 text-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder={t('typeYourMessage')}
            className="flex-1 rounded-full border-gray-200 dark:border-gray-600/50 dark:bg-gray-700/70 dark:text-gray-100 dark:placeholder-gray-400 focus:border-pink-300 focus:ring-pink-200 dark:focus:border-pink-400 dark:focus:ring-pink-400"
            maxLength={1000}
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() && !selectedImage}
            className="flex-shrink-0 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-full w-12 h-10 p-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
