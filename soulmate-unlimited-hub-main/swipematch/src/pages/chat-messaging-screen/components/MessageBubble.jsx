import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MessageBubble = ({ message, isOwn, onPhotoClick }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Icon name="Clock" size={14} className="text-text-secondary" />;
      case 'sent':
        return <Icon name="Check" size={14} className="text-text-secondary" />;
      case 'delivered':
        return <Icon name="CheckCheck" size={14} className="text-text-secondary" />;
      case 'read':
        return <Icon name="CheckCheck" size={14} className="text-primary" />;
      default:
        return null;
    }
  };

  if (message.type === 'photo') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
        {!isOwn && (
          <Image
            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
          <div
            className={`relative rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-smooth ${
              isOwn 
                ? 'rounded-br-md bg-gradient-to-br from-primary to-secondary' :'rounded-bl-md bg-surface border border-border'
            }`}
            onClick={() => onPhotoClick(message.content)}
          >
            <Image
              src={message.content}
              alt="Shared photo"
              className="w-full h-48 object-cover"
            />
            
            {message.caption && (
              <div className={`p-3 ${isOwn ? 'text-white' : 'text-text-primary'}`}>
                <p className="font-body text-sm">{message.caption}</p>
              </div>
            )}
          </div>
          
          <div className={`flex items-center space-x-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs font-caption text-text-secondary">
              {formatTime(message.timestamp)}
            </span>
            {isOwn && getStatusIcon(message.status)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
      {!isOwn && (
        <Image
          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-warm-sm ${
            isOwn
              ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-md' :'bg-surface border border-border text-text-primary rounded-bl-md'
          }`}
        >
          <p className="font-body text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </div>
        
        <div className={`flex items-center space-x-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs font-caption text-text-secondary">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;