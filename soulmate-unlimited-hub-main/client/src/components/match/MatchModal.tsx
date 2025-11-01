
import { useState } from "react";
import { X, Heart, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileWithDistance } from "@/types/profile";
import { useLanguage } from "@/hooks/useLanguage";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface MatchModalProps {
  user: ProfileWithDistance;
  onClose: () => void;
  onStartChat?: () => void;
  onSuperLike?: () => void;
}

export const MatchModal = ({ user, onClose, onStartChat, onSuperLike }: MatchModalProps) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleStartChat = () => {
    onStartChat?.();
    handleClose();
  };

  const handleSuperLike = () => {
    onSuperLike?.();
    handleClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'bg-background/80 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
    }`}>
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {Math.random() > 0.5 ? '💕' : '⭐'}
          </div>
        ))}
      </div>

      {/* Modal Content */}
      <div className={`relative bg-gradient-to-br from-pink-500 via-red-500 to-purple-600 rounded-3xl shadow-2xl max-w-md w-full transition-all duration-300 transform ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <div className="text-6xl mb-4 animate-pulse">💕</div>
          <h2 className="text-3xl font-bold text-white mb-2 animate-bounce">
            {t('itsAMatch')}
          </h2>
          <p className="text-white/90 text-lg">
            {t('youAndUserLikedEachOther').replace('{user}', user.name || 'Anonim')}
          </p>
        </div>

        {/* User Photos */}
        <div className="flex justify-center items-center px-6 mb-6">
          <div className="flex space-x-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <OptimizedImage 
                  src={user.photos?.[0] || "https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=400&h=600&fit=crop&crop=face"}
                  alt="Your profile"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
            </div>

            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                <OptimizedImage 
                  src={user.photos?.[0] || "https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=400&h=600&fit=crop&crop=face"}
                  alt={user.name || 'Match'}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center px-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-1">
            {user.name || 'Anonim'}, {user.age || '?'}
          </h3>
          <p className="text-white/80 text-sm">
            {user.location || 'Bilinmeyen konum'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleStartChat}
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white hover:text-pink-500 transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('sendMessage')}
            </Button>
            
            <Button
              onClick={handleSuperLike}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              <Star className="w-4 h-4 mr-2" />
              {t('superLike')}
            </Button>
          </div>

          <Button
            onClick={handleClose}
            variant="ghost"
            className="w-full mt-3 text-white/80 hover:text-white hover:bg-white/10"
          >
            {t('keepSwiping')}
          </Button>
        </div>
      </div>
    </div>
  );
};
