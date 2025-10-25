import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Image from '../../components/AppImage';
import ChatHeader from '../../components/ui/ChatHeader';
import MessageBubble from './components/MessageBubble';
import MessageInput from './components/MessageInput';
import PhotoViewer from './components/PhotoViewer';


const ChatMessagingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock match profile data
  const matchProfile = {
    id: 2,
    name: "Emma Wilson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    age: 28,
    isOnline: true,
    lastSeen: new Date()
  };

  // Mock messages data
  const mockMessages = [
    {
      id: 1,
      senderId: 2,
      senderName: "Emma Wilson",
      content: "Hey! Thanks for the match! 😊",
      timestamp: new Date(Date.now() - 86400000),
      type: "text",
      status: "read"
    },
    {
      id: 2,
      senderId: 1,
      senderName: "You",
      content: "Hi Emma! Great to match with you too. How\'s your day going?",
      timestamp: new Date(Date.now() - 82800000),
      type: "text",
      status: "read"
    },
    {
      id: 3,
      senderId: 2,
      senderName: "Emma Wilson",
      content: "It\'s been wonderful! Just finished a morning hike. I saw in your profile that you love outdoor activities too?",
      timestamp: new Date(Date.now() - 79200000),
      type: "text",
      status: "read"
    },
    {
      id: 4,
      senderId: 1,
      senderName: "You",
      content: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
      timestamp: new Date(Date.now() - 75600000),
      type: "photo",
      status: "read",
      caption: "This is from my last hiking trip! Amazing view, right?"
    },
    {
      id: 5,
      senderId: 2,
      senderName: "Emma Wilson",
      content: "Wow! That\'s absolutely stunning! 😍 Where was this taken?",
      timestamp: new Date(Date.now() - 72000000),
      type: "text",
      status: "read"
    },
    {
      id: 6,
      senderId: 1,
      senderName: "You",
      content: "That\'s from Mount Washington. The sunrise was incredible that morning. We should plan a hike together sometime!",
      timestamp: new Date(Date.now() - 68400000),
      type: "text",
      status: "read"
    },
    {
      id: 7,
      senderId: 2,
      senderName: "Emma Wilson",
      content: "I\'d love that! I know some great trails around here. Are you free this weekend?",
      timestamp: new Date(Date.now() - 64800000),
      type: "text",
      status: "delivered"
    },
    {
      id: 8,
      senderId: 1,
      senderName: "You",
      content: "Perfect! Saturday morning works great for me. Should we meet at 8 AM?",
      timestamp: new Date(Date.now() - 3600000),
      type: "text",
      status: "sent"
    }
  ];

  useEffect(() => {
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate typing indicator
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content, type = 'text', caption = '') => {
    if (!content.trim() && type === 'text') return;

    setIsLoading(true);
    const newMsg = {
      id: messages.length + 1,
      senderId: 1,
      senderName: "You",
      content: content,
      timestamp: new Date(),
      type: type,
      status: "sending",
      caption: caption
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMsg.id 
            ? { ...msg, status: "sent" }
            : msg
        )
      );
      setIsLoading(false);

      // Simulate typing response
      setTimeout(() => {
        setIsTyping(true);
      }, 1000);
    }, 1000);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSendMessage(e.target.result, 'photo');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatMessageDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: now.getFullYear() !== messageDate.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;

    messages.forEach(message => {
      const messageDate = formatMessageDate(message.timestamp);
      
      if (messageDate !== currentDate) {
        groups.push({
          type: 'date-separator',
          date: messageDate,
          timestamp: message.timestamp
        });
        currentDate = messageDate;
      }
      
      groups.push(message);
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <ChatHeader 
        matchProfile={matchProfile}
        isTyping={isTyping}
        isOnline={matchProfile.isOnline}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pt-20 pb-24 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {groupedMessages.map((item, index) => {
            if (item.type === 'date-separator') {
              return (
                <div key={`date-${index}`} className="flex justify-center my-6">
                  <div className="bg-background border border-border rounded-full px-4 py-2">
                    <span className="text-sm font-caption text-text-secondary">
                      {item.date}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <MessageBubble
                key={item.id}
                message={item}
                isOwn={item.senderId === 1}
                onPhotoClick={setSelectedPhoto}
              />
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <Image
                src={matchProfile.avatar}
                alt={matchProfile.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 max-w-xs shadow-warm-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
        onPhotoUpload={handlePhotoUpload}
        onEmojiToggle={() => setShowEmojiPicker(!showEmojiPicker)}
        isLoading={isLoading}
        showEmojiPicker={showEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
      />

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default ChatMessagingScreen;