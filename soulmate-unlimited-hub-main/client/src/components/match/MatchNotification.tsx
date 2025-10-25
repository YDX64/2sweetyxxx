
import { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";
import { ProfileWithDistance } from "@/types/profile";
import { useLanguage } from "@/hooks/useLanguage";

interface MatchNotificationProps {
  user: ProfileWithDistance;
  onClose: () => void;
  onViewMatch?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const MatchNotification = ({ 
  user, 
  onClose, 
  onViewMatch, 
  autoHide = true,
  duration = 5000 
}: MatchNotificationProps) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto hide
    if (autoHide) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 200);
  };

  const handleViewMatch = () => {
    onViewMatch?.();
    handleClose();
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible && !isLeaving 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl shadow-2xl p-4 max-w-sm w-80 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-red-600/20 animate-pulse" />
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Content */}
        <div className="relative">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                <img 
                  src={user.photos?.[0] || "https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=400&h=600&fit=crop&crop=face"}
                  alt={user.name || 'Match'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white fill-current" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-1 mb-1">
                <span className="text-lg">💕</span>
                <h4 className="font-bold text-sm">{t('newMatch')}</h4>
              </div>
              <p className="text-white/90 text-xs">
                {t('youMatchedWith')} {user.name || 'Anonim'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleViewMatch}
            className="w-full bg-white/20 backdrop-blur-sm rounded-lg py-2 px-3 text-xs font-medium hover:bg-white/30 transition-colors"
          >
            {t('viewMatch')}
          </button>
        </div>

        {/* Progress Bar */}
        {autoHide && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white/60 transition-all duration-100"
              style={{
                width: isLeaving ? '0%' : '100%',
                transitionDuration: isLeaving ? '200ms' : `${duration}ms`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
