import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Heart, Star, Zap, Crown } from "lucide-react";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { TIER_FEATURES } from "@/types/subscription";

export const SubscriptionLimitsCard = () => {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const subscriptionState = useSubscriptionLimits();
  const { tier, usage, remaining } = subscriptionState;
  const tierFeatures = userRole ? TIER_FEATURES[userRole as keyof typeof TIER_FEATURES] : TIER_FEATURES.registered;

  const remainingLikes = remaining.likes;
  const remainingSuperLikes = remaining.superLikes;

  const likesProgress = tier.limits.dailyLikes === 999 
    ? 0 
    : (usage.daily_likes_used / tier.limits.dailyLikes) * 100;

  const superLikesProgress = tier.limits.dailySuperLikes === 999 
    ? 0 
    : (usage.daily_super_likes_used / tier.limits.dailySuperLikes) * 100;

  const getTierColor = (role: string) => {
    switch (role) {
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getTierIcon = (role: string) => {
    switch (role) {
      case 'platinum': return <Crown className="w-4 h-4" />;
      case 'gold': return <Star className="w-4 h-4" />;
      case 'silver': return <Zap className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t('dailyLimits')}
          </CardTitle>
          <Badge className={getTierColor(userRole || 'registered')}>
            <div className="flex items-center gap-1">
              {getTierIcon(userRole || 'registered')}
              {userRole?.toUpperCase() || 'FREE'}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Daily Likes */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">{t('dailyLikes')}</span>
            </div>
            <span className="text-sm text-gray-600">
              {tier.limits.dailyLikes === 999 ? '∞' : `${remainingLikes}/${tier.limits.dailyLikes}`}
            </span>
          </div>
          {tier.limits.dailyLikes !== 999 && (
            <Progress value={likesProgress} className="h-2" />
          )}
        </div>

        {/* Daily Super Likes */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{t('superLikes')}</span>
            </div>
            <span className="text-sm text-gray-600">
              {tier.limits.dailySuperLikes === 999 ? '∞' : `${remainingSuperLikes}/${tier.limits.dailySuperLikes}`}
            </span>
          </div>
          {tier.limits.dailySuperLikes !== 999 && (
            <Progress value={superLikesProgress} className="h-2" />
          )}
        </div>

        {/* Premium Features */}
        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-2">{t('premiumFeatures')}</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${tierFeatures.seeWhoLikesYou ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${tierFeatures.seeWhoLikesYou ? 'bg-green-500' : 'bg-gray-300'}`} />
              {t('seeWhoLikesYou')}
            </div>
            <div className={`flex items-center gap-1 ${tierFeatures.advancedFilters ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${tierFeatures.advancedFilters ? 'bg-green-500' : 'bg-gray-300'}`} />
              {t('advancedFilters')}
            </div>
            <div className={`flex items-center gap-1 ${tierFeatures.voiceCalls ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${tierFeatures.voiceCalls ? 'bg-green-500' : 'bg-gray-300'}`} />
              {t('voiceCalls')}
            </div>
            <div className={`flex items-center gap-1 ${tierFeatures.videoCalls ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${tierFeatures.videoCalls ? 'bg-green-500' : 'bg-gray-300'}`} />
              {t('videoCalls')}
            </div>
          </div>
        </div>

        {/* Upgrade Button for non-premium users */}
        {userRole === 'registered' && (
          <Button 
            onClick={() => window.location.href = '/upgrades'} 
            className="w-full mt-4"
            variant="default"
          >
            <Crown className="w-4 h-4 mr-2" />
            {t('upgradeToPremium')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};