import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, Crown, Eye, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { GuestProfile } from "@/services/guestsService";

interface GuestCardProps {
  guest: GuestProfile;
  onLike: (targetUserId: string) => Promise<void>;
  onMessage?: (targetUserId: string) => void;
  onHide?: (guestId: string) => Promise<void>;
  isLoading?: boolean;
}

export const GuestCard = ({ 
  guest, 
  onLike, 
  onMessage, 
  onHide,
  isLoading = false 
}: GuestCardProps) => {
  const { t } = useLanguage();
  const [actionLoading, setActionLoading] = useState(false);

  const handleLike = async () => {
    setActionLoading(true);
    try {
      await onLike(guest.visitor_id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(guest.visitor_id);
    }
  };

  const handleHide = async () => {
    if (onHide) {
      setActionLoading(true);
      try {
        await onHide(guest.id);
      } finally {
        setActionLoading(false);
      }
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
      if (diffInDays === 1) {
        return t('yesterday');
      } else if (diffInDays < 7) {
        return `${diffInDays} ${t('daysAgo')}`;
      } else {
        return date.toLocaleDateString('tr-TR');
      }
    }
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'gold':
        return { label: t('guests.tiers.gold'), color: 'bg-yellow-600 text-white' };
      case 'platinum':
        return { label: t('guests.tiers.platinum'), color: 'bg-gray-700 text-white' };
      case 'silver':
        return { label: t('guests.tiers.silver'), color: 'bg-gray-400 text-white' };
      default:
        return null;
    }
  };

  const subscriptionBadge = getSubscriptionBadge(guest.visitor_profile.subscription_tier);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-2 hover:border-blue-200 dark:hover:border-blue-800">
      <div className="relative">
        <div className="aspect-square relative">
          <img
            src={guest.visitor_profile.photos?.[0] || '/placeholder.svg'}
            alt={guest.visitor_profile.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 dark:from-gray-800/60 via-transparent to-transparent" />
          
          {/* Premium visitor badge */}
          {guest.is_premium_view && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
              <Crown className="w-3.5 h-3.5" />
              <span>{t('premiumView')}</span>
            </div>
          )}
          
          {/* Subscription tier badge */}
          {subscriptionBadge && (
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${subscriptionBadge.color}`}>
              {subscriptionBadge.label}
            </div>
          )}
          
          {/* Distance badge */}
          {guest.visitor_profile.distance && (
            <div className="absolute top-12 right-3 bg-gray-900/80 dark:bg-gray-800/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
              <MapPin className="w-3 h-3 inline mr-1" />
              {guest.visitor_profile.distance} {t('guests.distanceUnit')}
            </div>
          )}

          {/* Visit time */}
          <div className="absolute bottom-3 left-3 bg-gray-900/80 dark:bg-gray-800/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(guest.viewed_at)}
          </div>

          {/* View indicator */}
          <div className="absolute bottom-3 right-3 bg-blue-500/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {t('viewed')}
          </div>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-gray-900/70 dark:bg-gray-800/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-3">
            {onHide && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleHide}
                disabled={actionLoading || isLoading}
                className="bg-gray-600/80 hover:bg-gray-700/80 text-white border-0 backdrop-blur-sm shadow-lg"
              >
                {t('hide')}
              </Button>
            )}
            
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
              onClick={handleLike}
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
              {guest.visitor_profile.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {guest.visitor_profile.age} {t('guests.yearsOld')}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Eye className="w-3 h-3 mr-1" />
              {t('visitor')}
            </Badge>
            {guest.is_premium_view && (
              <Badge className="bg-yellow-500 text-white text-xs">
                <Crown className="w-2.5 h-2.5 mr-1" />
                {t('guests.goldPlus')}
              </Badge>
            )}
          </div>
        </div>
        
        {guest.visitor_profile.location && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{guest.visitor_profile.location}</span>
            {guest.visitor_profile.distance && (
              <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {guest.visitor_profile.distance} {t('guests.distanceUnit')}
              </span>
            )}
          </div>
        )}
        
        {guest.visitor_profile.bio && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            {guest.visitor_profile.bio}
          </p>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-between">
          <span>{t('visitedOn')}: {new Date(guest.viewed_at).toLocaleDateString('tr-TR')}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(guest.viewed_at)}
          </span>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleLike}
            disabled={actionLoading || isLoading}
          >
            <Heart className="w-4 h-4 mr-2" />
            {actionLoading ? t('loading') : t('like')}
          </Button>
          
          {onMessage && (
            <Button 
              variant="outline"
              onClick={handleMessage}
              disabled={actionLoading || isLoading}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
          
          {onHide && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleHide}
              disabled={actionLoading || isLoading}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('hide')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};