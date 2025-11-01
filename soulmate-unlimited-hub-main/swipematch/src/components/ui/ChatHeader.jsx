import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';

const ChatHeader = ({ matchProfile, isTyping = false, isOnline = false }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleBack = () => {
    navigate('/matches-conversations-list');
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleVideoCall = () => {
    // Video call functionality
    console.log('Starting video call...');
  };

  const handleVoiceCall = () => {
    // Voice call functionality
    console.log('Starting voice call...');
  };

  const handleBlock = () => {
    // Block user functionality
    console.log('Blocking user...');
    setShowMenu(false);
  };

  const handleReport = () => {
    // Report user functionality
    console.log('Reporting user...');
    setShowMenu(false);
  };

  const handleUnmatch = () => {
    // Unmatch functionality
    console.log('Unmatching...');
    setShowMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-chat-header">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-smooth"
          aria-label="Go back"
        >
          <Icon name="ArrowLeft" size={24} />
        </button>

        {/* Profile Info */}
        <div className="flex items-center space-x-3 flex-1 mx-4">
          <div className="relative">
            <Image
              src={matchProfile?.avatar || '/assets/images/no_image.png'}
              alt={matchProfile?.name || 'Profile'}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-surface rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-semibold text-text-primary truncate">
              {matchProfile?.name || 'Unknown User'}
            </h1>
            {isTyping ? (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm font-caption text-text-secondary">typing...</span>
              </div>
            ) : (
              <p className="text-sm font-caption text-text-secondary">
                {isOnline ? 'Online' : 'Last seen recently'}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVoiceCall}
            className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-smooth"
            aria-label="Voice call"
          >
            <Icon name="Phone" size={20} />
          </button>
          
          <button
            onClick={handleVideoCall}
            className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-smooth"
            aria-label="Video call"
          >
            <Icon name="Video" size={20} />
          </button>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-smooth"
              aria-label="More options"
            >
              <Icon name="MoreVertical" size={20} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-warm-lg z-dropdown animate-slide-up">
                <div className="py-2">
                  <button
                    onClick={() => navigate('/profile-creation-edit-screen')}
                    className="w-full px-4 py-2 text-left text-text-primary hover:bg-background transition-smooth flex items-center space-x-3"
                  >
                    <Icon name="User" size={16} />
                    <span className="font-body">View Profile</span>
                  </button>
                  
                  <button
                    onClick={handleBlock}
                    className="w-full px-4 py-2 text-left text-warning hover:bg-warning/10 transition-smooth flex items-center space-x-3"
                  >
                    <Icon name="UserX" size={16} />
                    <span className="font-body">Block User</span>
                  </button>
                  
                  <button
                    onClick={handleReport}
                    className="w-full px-4 py-2 text-left text-error hover:bg-error/10 transition-smooth flex items-center space-x-3"
                  >
                    <Icon name="Flag" size={16} />
                    <span className="font-body">Report User</span>
                  </button>
                  
                  <div className="border-t border-border my-2"></div>
                  
                  <button
                    onClick={handleUnmatch}
                    className="w-full px-4 py-2 text-left text-error hover:bg-error/10 transition-smooth flex items-center space-x-3"
                  >
                    <Icon name="HeartOff" size={16} />
                    <span className="font-body">Unmatch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </header>
  );
};

export default ChatHeader;