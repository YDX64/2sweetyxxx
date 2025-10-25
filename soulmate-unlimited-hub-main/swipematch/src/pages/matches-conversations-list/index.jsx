import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';

import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import NewMatchesCarousel from './components/NewMatchesCarousel';
import ConversationsList from './components/ConversationsList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/EmptyState';

const MatchesConversationsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState([]);

  // Mock data for new matches
  const newMatches = [
    {
      id: 1,
      name: "Emma",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      age: 28,
      isOnline: true,
      matchedAt: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 2,
      name: "Sarah",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=400&h=400&fit=crop&crop=face",
      age: 25,
      isOnline: false,
      matchedAt: new Date(Date.now() - 7200000) // 2 hours ago
    },
    {
      id: 3,
      name: "Jessica",
      avatar: "https://images.pixabay.com/photo/2016/11/29/13/14/attractive-1868817_1280.jpg?w=400&h=400&fit=crop&crop=face",
      age: 30,
      isOnline: true,
      matchedAt: new Date(Date.now() - 10800000) // 3 hours ago
    },
    {
      id: 4,
      name: "Ashley",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      age: 27,
      isOnline: false,
      matchedAt: new Date(Date.now() - 14400000) // 4 hours ago
    },
    {
      id: 5,
      name: "Rachel",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=400&h=400&fit=crop&crop=face",
      age: 26,
      isOnline: true,
      matchedAt: new Date(Date.now() - 18000000) // 5 hours ago
    }
  ];

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      matchId: 1,
      name: "Emma",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      lastMessage: "Hey! Thanks for the match. How\'s your day going?",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      unreadCount: 2,
      isOnline: true,
      isTyping: false
    },
    {
      id: 2,
      matchId: 6,
      name: "Olivia",
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=400&h=400&fit=crop&crop=face",
      lastMessage: "That sounds amazing! I\'d love to hear more about your travels.",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      unreadCount: 0,
      isOnline: false,
      isTyping: false
    },
    {
      id: 3,
      matchId: 7,
      name: "Sophia",
      avatar: "https://images.pixabay.com/photo/2017/05/31/04/59/beautiful-2358414_1280.jpg?w=400&h=400&fit=crop&crop=face",
      lastMessage: "You: Looking forward to our coffee date tomorrow!",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      unreadCount: 0,
      isOnline: true,
      isTyping: false
    },
    {
      id: 4,
      matchId: 8,
      name: "Madison",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      lastMessage: "Haha, that\'s so funny! 😂",
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      unreadCount: 1,
      isOnline: false,
      isTyping: false
    },
    {
      id: 5,
      matchId: 9,
      name: "Isabella",
      avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?w=400&h=400&fit=crop&crop=face",
      lastMessage: "What kind of music do you like?",
      timestamp: new Date(Date.now() - 21600000), // 6 hours ago
      unreadCount: 0,
      isOnline: false,
      isTyping: false
    },
    {
      id: 6,
      matchId: 10,
      name: "Mia",
      avatar: "https://images.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg?w=400&h=400&fit=crop&crop=face",
      lastMessage: "You: Thanks for the recommendation!",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      unreadCount: 0,
      isOnline: false,
      isTyping: false
    }
  ];

  useEffect(() => {
    // Filter conversations based on search query
    const filtered = conversations.filter(conversation =>
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleNewMatchClick = (match) => {
    // Navigate to chat with conversation starter modal
    navigate('/chat-messaging-screen', { 
      state: { 
        matchProfile: match,
        isNewMatch: true 
      } 
    });
  };

  const handleConversationClick = (conversation) => {
    navigate('/chat-messaging-screen', { 
      state: { 
        matchProfile: {
          id: conversation.matchId,
          name: conversation.name,
          avatar: conversation.avatar,
          isOnline: conversation.isOnline
        }
      } 
    });
  };

  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-header">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-text-primary">
                Matches
              </h1>
              <p className="text-sm font-body text-text-secondary">
                {newMatches.length} new matches • {totalUnreadCount} unread messages
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-smooth"
              aria-label="Refresh matches and messages"
            >
              <Icon 
                name="RefreshCw" 
                size={20} 
                className={isRefreshing ? 'animate-spin' : ''} 
              />
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pb-24 md:pb-8">
        {/* New Matches Section */}
        {newMatches.length > 0 && (
          <section className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-text-primary">
                New Matches
              </h2>
              <span className="text-sm font-caption text-text-secondary">
                {newMatches.length} new
              </span>
            </div>
            
            <NewMatchesCarousel 
              matches={newMatches}
              onMatchClick={handleNewMatchClick}
            />
          </section>
        )}

        {/* Messages Section */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Messages
            </h2>
            {totalUnreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-caption font-medium px-2 py-1 rounded-full">
                {totalUnreadCount} unread
              </span>
            )}
          </div>

          {filteredConversations.length > 0 ? (
            <ConversationsList 
              conversations={filteredConversations}
              onConversationClick={handleConversationClick}
            />
          ) : searchQuery ? (
            <EmptyState 
              type="search"
              title="No conversations found"
              description={`No conversations match "${searchQuery}"`}
              actionText="Clear search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            <EmptyState 
              type="messages"
              title="No messages yet"
              description="Start a conversation with your matches to see them here"
              actionText="Discover people"
              onAction={() => navigate('/profile-discovery-swipe-screen')}
            />
          )}
        </section>

        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-surface border border-border rounded-full px-4 py-2 shadow-warm-md z-notification">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-body text-text-primary">Refreshing...</span>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomTabNavigation />
    </div>
  );
};

export default MatchesConversationsList;