import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star, Clock, X, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { LikeInfo } from "@/services/seeWhoLikesYouService";

interface LikeCardProps {
  like: LikeInfo;
  onLikeBack: (targetUserId: string) => Promise<void>;
  onDismiss: (likerId: string) => Promise<void>;
  onMessage?: (targetUserId: string) => void;
  isLoading?: boolean;
}

export const LikeCard = ({ 
  like, 
  onLikeBack, 
  onDismiss, 
  onMessage,
  isLoading = false 
}: LikeCardProps) => {
  const { t } = useLanguage();
  const [actionLoading, setActionLoading] = useState(false);

  const handleLikeBack = async () => {
    setActionLoading(true);
    try {
      await onLikeBack(like.user_id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    setActionLoading(true);
    try {
      await onDismiss(like.user_id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(like.user_id);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return t('justNow');
    } else if (diffInHours < 24) {
      return `${diffInHours} ${t('hoursAgo')}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${t('daysAgo')}`;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-2 hover:border-pink-200 dark:hover:border-pink-800">
      <div className="relative">
        <div className="aspect-square relative">
          <img 
            src={like.liker_profile.photos?.[0] || '/placeholder.svg'} 
            alt={like.liker_profile.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
          
          {/* Super Like Badge */}
          {like.is_super_like && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{t('superLike')}</span>
            </div>
          )}
          
          {/* Distance Badge */}
          {like.liker_profile.distance && (
            <div className="absolute top-3 right-3 bg-gray-900/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
              <MapPin className="w-3 h-3 inline mr-1" />
              {like.liker_profile.distance} km
            </div>
          )}

          {/* Time Badge */}
          <div className="absolute bottom-3 left-3 bg-gray-900/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(like.created_at)}
          </div>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDismiss}
              disabled={actionLoading || isLoading}
              className="bg-gray-600/80 hover:bg-gray-700/80 text-white border-0 backdrop-blur-sm shadow-lg"
            >
              <X className="w-4 h-4" />
            </Button>
            
            {onMessage && (
              <Button
                size="sm"
                onClick={handleMessage}
                disabled={actionLoading || isLoading}
                className="bg-blue-500/80 hover:bg-blue-600/80 text-white border-0 backdrop-blur-sm shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={handleLikeBack}
              disabled={actionLoading || isLoading}
              className="bg-gradient-to-r from-pink-500/80 to-red-500/80 hover:from-pink-600/80 hover:to-red-600/80 text-white border-0 backdrop-blur-sm shadow-lg"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
              {like.liker_profile.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {like.liker_profile.age} {t('yearsOld')}
            </p>
          </div>
          
          {like.is_super_like && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Super
            </Badge>
          )}
        </div>
        
        {like.liker_profile.location && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{like.liker_profile.location}</span>
          </div>
        )}
        
        {like.liker_profile.bio && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            {like.liker_profile.bio}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleLikeBack}
            disabled={actionLoading || isLoading}
          >
            <Heart className="w-4 h-4 mr-2" />
            {actionLoading ? t('loading') : t('likeBack')}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDismiss}
            disabled={actionLoading || isLoading}
            className="border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};