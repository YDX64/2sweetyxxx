
import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Star, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationData {
  message: string;
  type: 'match' | 'message' | 'like' | 'general';
}

export const NotificationPopup = () => {
  const [notifications, setNotifications] = useState<(NotificationData & { id: string })[]>([]);

  useEffect(() => {
    const handleShowNotification = (event: CustomEvent<NotificationData>) => {
      const newNotification = {
        ...event.detail,
        id: Date.now().toString()
      };
      
      setNotifications(prev => [...prev, newNotification]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    window.addEventListener('showNotification', handleShowNotification as EventListener);
    
    return () => {
      window.removeEventListener('showNotification', handleShowNotification as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'match':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'message':
        return 'bg-gradient-to-r from-blue-500 to-purple-500';
      case 'like':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <>
      {/* CSS Animation */}
      <style>
        {`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          .progress-bar {
            animation: shrink 5s linear forwards;
          }
        `}
      </style>
      
      <div className="fixed bottom-4 right-4 md:bottom-4 pb-20 md:pb-0 z-[95] space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ease-out ${
              index === 0 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
            }`}
            style={{ zIndex: 50 - index }}
          >
            <div className={`${getGradient(notification.type)} text-white rounded-lg shadow-lg p-4 max-w-sm relative overflow-hidden`}>
              {/* Background pattern */}
              <div className="absolute inset-0 bg-white/10 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
              </div>
              
              {/* Content */}
              <div className="relative flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-5">
                    {notification.message}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 h-6 w-6 p-0 hover:bg-white/20 text-white/80 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div className="h-full bg-white/40 progress-bar" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
