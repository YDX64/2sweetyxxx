import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { chatService } from '@/services/chatService';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, Phone, Video, Search, Sparkles, HeartOff, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type Conversation = Tables<'conversations'>;
type Profile = Tables<'profiles'>;
type Match = Tables<'matches'> & {
  otherUser: Profile;
};

interface ConversationWithProfiles extends Conversation {
  participant1: Profile;
  participant2: Profile;
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
  };
  unreadCount?: number;
  isTyping?: boolean;
}

interface ChatListProps {
  onSelectConversation: (conversationId: string, otherUser: Profile) => void;
}

// Conversation Item Component
const ConversationItem = ({ 
  conversation, 
  currentUserId,
  onClick,
  onUnmatch,
  onBlock 
}: { 
  conversation: ConversationWithProfiles;
  currentUserId: string;
  onClick: () => void;
  onUnmatch?: () => void;
  onBlock?: () => void;
}) => {
  const { t } = useLanguage();
  const [showActions, setShowActions] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  const otherUser = conversation.participant1_id === currentUserId 
    ? conversation.participant2 
    : conversation.participant1;
    
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setShowActions(true);
    },
    onSwipedRight: () => {
      setShowActions(false);
    },
    onSwiping: (eventData) => {
      setSwipeOffset(Math.max(-100, Math.min(0, eventData.deltaX)));
    },
    onSwiped: () => {
      setSwipeOffset(0);
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
  });
    
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return t('now');
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };
  
  const isOnline = false; // TODO: Implement online status tracking
  
  return (
    <motion.div
      {...handlers}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      style={{ x: swipeOffset }}
      className="relative touch-pan-y"
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200",
          "hover:shadow-md dark:hover:shadow-lg",
          "border-l-4",
          conversation.unreadCount && conversation.unreadCount > 0 
            ? "border-l-pink-500" 
            : "border-l-transparent"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/30 to-red-500/30"></div>
                <img
                  src={otherUser.photos?.[0] || '/placeholder.svg'}
                  alt={otherUser.name || 'User'}
                  className="absolute inset-0.5 w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Online Status */}
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {otherUser.name || t('unknownUser')}
                </h3>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {conversation.lastMessage ? formatTime(conversation.lastMessage.created_at) : ''}
                  </span>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <Badge className="bg-pink-500 text-white min-w-[20px] h-5 px-1">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-sm truncate flex-1",
                  conversation.unreadCount && conversation.unreadCount > 0
                    ? "text-gray-900 dark:text-gray-100 font-medium"
                    : "text-gray-600 dark:text-gray-400",
                  conversation.lastMessage?.sender_id === currentUserId && "text-gray-600 dark:text-gray-400"
                )}>
                  {conversation.lastMessage?.sender_id === currentUserId && t('you') + ': '}
                  {conversation.lastMessage?.content || t('newMatchGreeting')}
                </p>
                
                {/* Typing Indicator */}
                {conversation.isTyping && (
                  <div className="flex items-center space-x-1 ml-2">
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
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  // Phone call functionality
                }}
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-purple-600 dark:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                  // Video call functionality
                }}
              >
                <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Swipe Actions */}
      <AnimatePresence>
        {showActions && onUnmatch && onBlock && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute right-0 top-0 bottom-0 flex items-center bg-red-50 dark:bg-red-900/20 rounded-r-lg px-2"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onUnmatch();
                setShowActions(false);
              }}
            >
              <HeartOff className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onBlock();
                setShowActions(false);
              }}
            >
              <UserX className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const ChatList = ({ onSelectConversation }: ChatListProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationWithProfiles[]>([]);
  const [newMatches, setNewMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadData();
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    await Promise.all([
      loadConversations(),
      loadNewMatches()
    ]);
    setLoading(false);
  };

  const loadConversations = async () => {
    if (!user) return;
    
    const data = await chatService.getConversations(user.id);
    
    // Get last message and unread count for each conversation
    const conversationsWithDetails: ConversationWithProfiles[] = await Promise.all(
      data.map(async (conv) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        // TODO: Add is_read field to messages table to track unread messages
        const count = 0;
          
        const lastMessage = messages?.[0] ? {
          content: messages[0].content,
          created_at: messages[0].created_at,
          sender_id: messages[0].sender_id,
          is_read: false
        } : undefined;
          
        return {
          ...conv,
          lastMessage,
          unreadCount: count || 0
        } as unknown as ConversationWithProfiles;
      })
    );
    
    setConversations(conversationsWithDetails);
  };

  const loadNewMatches = async () => {
    if (!user) return;
    
    // Get ALL matches that don't have any messages yet
    const { data: matchesData } = await supabase
      .from('matches')
      .select(`
        *,
        user1_profile:profiles!matches_user1_id_fkey(*),
        user2_profile:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
      
    if (matchesData) {
      // Filter matches that don't have conversations yet
      const matchesWithoutConversations = [];
      
      for (const match of matchesData) {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        
        // Check if conversation exists
        const { data: conversationData } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`)
          .maybeSingle();
          
        // If no conversation exists, it's a new match
        if (!conversationData) {
          matchesWithoutConversations.push({
            ...match,
            otherUser: match.user1_id === user.id ? match.user2_profile : match.user1_profile
          });
        }
      }
      
      setNewMatches(matchesWithoutConversations as Match[]);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;
    
    // Subscribe to new matches
    const matchesSubscription = supabase
      .channel(`new-matches-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        },
        () => {
          loadNewMatches();
        }
      )
      .subscribe();
      
    // Subscribe to messages
    const messagesSubscription = supabase
      .channel(`messages-list-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();
      
    return () => {
      matchesSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  };

  const getOtherUser = (conversation: ConversationWithProfiles): Profile => {
    return conversation.participant1_id === user?.id 
      ? conversation.participant2 
      : conversation.participant1;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return t('now');
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participant1_id === user?.id
      ? conv.participant2
      : conv.participant1;
    return otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalUnreadCount = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

  const handleUnmatch = async (conversationId: string) => {
    // Implement unmatch functionality
    console.log('Unmatch:', conversationId);
  };

  const handleBlock = async (conversationId: string) => {
    // Implement block functionality
    console.log('Block:', conversationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">{t('loading')}</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="w-16 h-16 text-pink-300 dark:text-pink-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t('noMessagesYetTitle')}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noMessagesYetDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('messages')}</h2>
            {totalUnreadCount > 0 && (
              <Badge className="bg-pink-500 text-white">
                {totalUnreadCount} {t('unread')}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={t('searchConversations')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* New Matches Carousel */}
      {newMatches.length > 0 && (
        <div className="mb-6 -mx-4 px-4 py-4 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t('newMatches')}
              </h3>
            </div>
            <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white border-0">
              {newMatches.length} {t('new')}
            </Badge>
          </div>
          
          <div 
            ref={carouselRef}
            className="overflow-x-auto scrollbar-hide -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex space-x-4 pb-2">
              {newMatches.map((match) => (
                <motion.button
                  key={match.id}
                  onClick={() => {
                    // Create conversation and navigate
                    chatService.getOrCreateConversation(user?.id || '', match.otherUser.id).then(conv => {
                      if (conv) {
                        onSelectConversation(conv.id, match.otherUser);
                      }
                    });
                  }}
                  className="flex-shrink-0 text-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative mb-2">
                    {/* Gradient Border Container */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-red-500 group-hover:shadow-xl transition-all duration-300"></div>
                      <div className="absolute inset-0.5 rounded-full bg-white dark:bg-gray-900"></div>
                      <img
                        src={match.otherUser.photos?.[0] || '/placeholder.svg'}
                        alt={match.otherUser.name || 'User'}
                        className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Online Status */}
                    {false && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                    
                    {/* New Match Badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="w-20 md:w-24">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate group-hover:text-pink-500 transition-colors">
                      {match.otherUser.name}
                    </p>
                    {match.otherUser.age && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {match.otherUser.age} {t('age').toLowerCase()}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Conversations List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              currentUserId={user?.id || ''}
              onClick={() => onSelectConversation(conversation.id, getOtherUser(conversation))}
              onUnmatch={() => handleUnmatch(conversation.id)}
              onBlock={() => handleBlock(conversation.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
