import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatList } from '@/components/chat/ChatList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { NavigationBar } from '@/components/NavigationBar';
import { Tables } from '@/integrations/supabase/types';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';

type Profile = Tables<'profiles'>;

// Modern Context7 pattern: Type-safe router state
interface RouterState {
  conversationId?: string;
  otherUser?: Profile;
}

export const MessagesPage = () => {
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUser: Profile;
  } | null>(null);

  // Router state'ten gelen konuşma bilgilerini kontrol et
  useEffect(() => {
    const state = location.state as RouterState | null;
    if (state?.conversationId && state?.otherUser) {
      setSelectedConversation({
        id: state.conversationId,
        otherUser: state.otherUser
      });
    }
  }, [location.state]);

  // Manage body overflow when chat interface is open/closed
  useEffect(() => {
    let originalOverflow: string | null = null;

    if (selectedConversation) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      // Restore to original or default if originalOverflow was not set (e.g. initial load with no chat open)
      document.body.style.overflow = originalOverflow || '';
    }

    // Cleanup function to restore overflow when component unmounts or before effect runs again
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [selectedConversation]);

  const handleSelectConversation = (conversationId: string, otherUser: Profile) => {
    setSelectedConversation({ id: conversationId, otherUser });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  // Chat açıksa tam ekran görünüm
  if (selectedConversation) {
    return (
      <ChatInterface
        conversationId={selectedConversation.id}
        otherUser={selectedConversation.otherUser}
        onBack={handleBackToList}
      />
    );
  }

  // Chat listesi için normal layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-2 py-2 flex-1 pb-20">
        <Card className="max-w-4xl mx-auto h-[calc(100vh-120px)] overflow-hidden dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
          <div className="p-6 h-full overflow-y-auto">
            <ChatList onSelectConversation={handleSelectConversation} />
          </div>
        </Card>
      </main>
      
      <NavigationBar />
    </div>
  );
};
