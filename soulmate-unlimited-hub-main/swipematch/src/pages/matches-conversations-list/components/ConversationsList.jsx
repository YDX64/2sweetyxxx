import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ConversationsList = ({ conversations, onConversationClick }) => {
  const [swipedConversation, setSwipedConversation] = useState(null);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return timestamp.toLocaleDateString();
  };

  const handleSwipeActions = (conversationId, action) => {
    console.log(`${action} conversation:`, conversationId);
    setSwipedConversation(null);
  };

  const isOwnMessage = (message) => {
    return message.startsWith('You:');
  };

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="relative bg-surface rounded-lg border border-border hover:shadow-warm-sm transition-smooth"
        >
          {/* Swipe Actions (Mobile) */}
          {swipedConversation === conversation.id && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center bg-error/10 rounded-r-lg z-10">
              <button
                onClick={() => handleSwipeActions(conversation.id, 'unmatch')}
                className="px-4 py-2 text-error hover:bg-error/20 transition-smooth"
                aria-label="Unmatch"
              >
                <Icon name="HeartOff" size={20} />
              </button>
              <button
                onClick={() => handleSwipeActions(conversation.id, 'block')}
                className="px-4 py-2 text-error hover:bg-error/20 transition-smooth"
                aria-label="Block"
              >
                <Icon name="UserX" size={20} />
              </button>
            </div>
          )}

          {/* Conversation Item */}
          <button
            onClick={() => onConversationClick(conversation)}
            className="w-full p-4 text-left hover:bg-background/50 transition-smooth rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {/* Profile Avatar */}
              <div className="relative flex-shrink-0">
                <Image
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                
                {/* Online Status */}
                {conversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-surface rounded-full"></div>
                )}
              </div>

              {/* Conversation Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-body font-semibold text-text-primary truncate">
                    {conversation.name}
                  </h3>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs font-caption text-text-secondary">
                      {formatTimestamp(conversation.timestamp)}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs font-caption font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className={`text-sm font-body truncate flex-1 ${
                    conversation.unreadCount > 0 
                      ? 'text-text-primary font-medium' :'text-text-secondary'
                  } ${isOwnMessage(conversation.lastMessage) ? 'text-text-secondary' : ''}`}>
                    {conversation.lastMessage}
                  </p>
                  
                  {conversation.isTyping && (
                    <div className="flex items-center space-x-1 ml-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-smooth">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipeActions(conversation.id, 'unmatch');
                  }}
                  className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-smooth"
                  aria-label="Unmatch"
                >
                  <Icon name="HeartOff" size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipeActions(conversation.id, 'block');
                  }}
                  className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-smooth"
                  aria-label="Block"
                >
                  <Icon name="UserX" size={16} />
                </button>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ConversationsList;