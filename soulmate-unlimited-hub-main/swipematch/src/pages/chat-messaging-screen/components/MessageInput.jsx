import React, { useRef } from 'react';
import Icon from '../../../components/AppIcon';
import EmojiPicker from './EmojiPicker';

const MessageInput = ({
  value,
  onChange,
  onSend,
  onPhotoUpload,
  onEmojiToggle,
  isLoading,
  showEmojiPicker,
  onEmojiSelect
}) => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend(value.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-4">
            <EmojiPicker onEmojiSelect={onEmojiSelect} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Photo Upload Button */}
          <button
            type="button"
            onClick={handlePhotoClick}
            className="flex-shrink-0 p-3 rounded-full text-text-secondary hover:text-primary hover:bg-primary/10 transition-smooth"
            aria-label="Upload photo"
          >
            <Icon name="Camera" size={20} />
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoUpload}
            className="hidden"
          />

          {/* Message Input Container */}
          <div className="flex-1 relative">
            <div className="flex items-end bg-background border border-border rounded-2xl overflow-hidden">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  adjustTextareaHeight(e);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-transparent border-none outline-none resize-none font-body text-text-primary placeholder-text-secondary min-h-[48px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />
              
              {/* Emoji Button */}
              <button
                type="button"
                onClick={onEmojiToggle}
                className={`p-3 text-text-secondary hover:text-primary transition-smooth ${
                  showEmojiPicker ? 'text-primary bg-primary/10' : ''
                }`}
                aria-label="Add emoji"
              >
                <Icon name="Smile" size={20} />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center hover:shadow-warm-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Icon name="Send" size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;