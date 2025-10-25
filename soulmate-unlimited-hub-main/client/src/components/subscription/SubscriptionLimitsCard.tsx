import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Star, Zap, Crown } from "lucide-react";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useLanguage } from "@/hooks/useLanguage";

interface SubscriptionLimitsCardProps {
  onUpgradeClick?: () => void;
}

export function SubscriptionLimitsCard({ onUpgradeClick }: SubscriptionLimitsCardProps) {
  const { tier, usage, remaining, canPerform, recommendedUpgrade, loading } = useSubscriptionLimits();
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Free': return 'bg-muted text-muted-foreground border-border';
      case 'Silver': return 'bg-muted text-muted-foreground border-border';
      case 'Gold': return 'bg-yellow-50 dark:bg-gray-800/80 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-gray-600/50';
      case 'Platinum': return 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Silver': return <Star className="w-4 h-4" />;
      case 'Gold': return <Crown className="w-4 h-4" />;
      case 'Platinum': return <Zap className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getLikesProgress = () => {
    if (tier.limits.dailyLikes >= 999) return 100; // Unlimited
    return ((tier.limits.dailyLikes - remaining.likes) / tier.limits.dailyLikes) * 100;
  };

  const getSuperLikesProgress = () => {
    if (tier.limits.dailySuperLikes >= 999) return 100; // Unlimited
    return ((tier.limits.dailySuperLikes - remaining.superLikes) / tier.limits.dailySuperLikes) * 100;
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
            {getTierIcon(tier.name)}
            {tier.name} {t('subscription.limits.plan')}
          </CardTitle>
          <Badge className={getTierColor(tier.name)}>
            {tier.name === 'Free' ? t('subscription.tiers.free') : `$${tier.price}/month`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Daily Likes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-muted-foreground">{t('subscription.limits.dailyLikes')}</span>
            </div>
            <span className={`font-medium ${!canPerform.like ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {tier.limits.dailyLikes >= 999 ? t('subscription.limits.unlimited') : `${remaining.likes}/${tier.limits.dailyLikes} ${t('subscription.limits.remaining')}`}
            </span>
          </div>
          {tier.limits.dailyLikes < 999 && (
            <Progress 
              value={getLikesProgress()} 
              className={`h-2 ${!canPerform.like ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          )}
          {!canPerform.like && (
            <p className="text-xs text-red-600 dark:text-red-400">{t('subscription.limits.dailyLikeLimitReached')}</p>
          )}
        </div>

        {/* Super Likes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">{t('subscription.limits.superLikes')}</span>
            </div>
            <span className={`font-medium ${!canPerform.superLike ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {tier.limits.dailySuperLikes >= 999 ? t('subscription.limits.unlimited') : `${remaining.superLikes}/${tier.limits.dailySuperLikes} ${t('subscription.limits.remaining')}`}
            </span>
          </div>
          {tier.limits.dailySuperLikes < 999 && (
            <Progress 
              value={getSuperLikesProgress()} 
              className={`h-2 ${!canPerform.superLike ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          )}
          {!canPerform.superLike && (
            <p className="text-xs text-red-600 dark:text-red-400">{t('subscription.limits.dailySuperLikeLimitReached')}</p>
          )}
        </div>

        {/* Boosts (if available) */}
        {tier.limits.dailyBoosts > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-muted-foreground">{t('subscription.limits.dailyBoosts')}</span>
              </div>
              <span className={`font-medium ${!canPerform.boost ? 'text-red-600' : 'text-gray-900'}`}>
                {tier.limits.dailyBoosts >= 999 ? t('subscription.limits.unlimited') : `${remaining.boosts}/${tier.limits.dailyBoosts} ${t('subscription.limits.remaining')}`}
              </span>
            </div>
            {tier.limits.dailyBoosts < 999 && (
              <Progress 
                value={((tier.limits.dailyBoosts - remaining.boosts) / tier.limits.dailyBoosts) * 100} 
                className={`h-2 ${!canPerform.boost ? 'bg-red-100' : 'bg-gray-200'}`}
              />
            )}
          </div>
        )}

        {/* Upgrade Recommendation */}
        {recommendedUpgrade && (!canPerform.like || !canPerform.superLike) && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('subscription.limits.upgradeMessage')}
            </div>
            <Button 
              onClick={onUpgradeClick}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-0 shadow-md"
              size="sm"
            >
              {t('subscription.limits.upgradeTo')} {recommendedUpgrade.charAt(0).toUpperCase() + recommendedUpgrade.slice(1)}
            </Button>
          </div>
        )}

        {/* Feature Access */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('subscription.limits.currentFeatures')}</div>
          <div className="flex flex-wrap gap-1">
            {tier.features.slice(0, 3).map((feature, index) => {
              return (
                <Badge key={index} variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                  {typeof feature === 'string'
                    ? t(feature)
                    : t(feature.key, { count: feature.count })
                  }
                </Badge>
              );
            })}
            {tier.features.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                +{tier.features.length - 3} {t('subscription.limits.more')}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}