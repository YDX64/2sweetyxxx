import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Star, 
  Sparkles, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Settings,
  Heart,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { TIER_INFO, TIER_FEATURES } from '@/types/subscription';
import { getTierBadgeStyle, getTierTextColorClass } from '@/utils/tierUtils';
import { SubscriptionTier } from '@/types/subscription';

interface UnifiedSubscriptionCardProps {
  onUpgradeClick?: () => void;
  onManageClick?: () => void;
}

export const UnifiedSubscriptionCard: React.FC<UnifiedSubscriptionCardProps> = ({
  onUpgradeClick,
  onManageClick
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end,
    loading: subscriptionLoading,
    features,
    manageSubscription,
    checkSubscription,
    usageLimits,
    remainingLikes,
    remainingSuperLikes,
    remainingMonthlyBoosts
  } = useSubscription();
  
  
  const [refreshing, setRefreshing] = useState(false);

  const getTierIcon = (tierName: string | null) => {
    const colorClass = tierName ? getTierTextColorClass(tierName as SubscriptionTier) : 'text-gray-400 dark:text-gray-500';
    switch (tierName) {
      case 'platinum':
        return <Sparkles className={`w-6 h-6 ${colorClass}`} />;
      case 'gold':
        return <Crown className={`w-6 h-6 ${colorClass}`} />;
      case 'silver':
        return <Star className={`w-6 h-6 ${colorClass}`} />;
      default:
        return <Heart className="w-6 h-6 text-gray-400 dark:text-gray-500" />;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
  };

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    }
  };

  const handleManage = () => {
    if (onManageClick) {
      onManageClick();
    } else {
      manageSubscription();
    }
  };

  if (subscriptionLoading) {
    return (
      <Card className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierInfo = subscription_tier ? TIER_INFO[subscription_tier as keyof typeof TIER_INFO] : null;
  const tierFeatures = subscription_tier ? TIER_FEATURES[subscription_tier] : TIER_FEATURES.registered;
  const tier = { limits: tierFeatures, features: [] };
  
  const calculateDaysRemaining = () => {
    if (!subscription_end) return null;
    const endDate = new Date(subscription_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();

  // Determine recommended upgrade
  const recommendedUpgrade = (() => {
    if (subscription_tier === 'registered') return 'silver';
    if (subscription_tier === 'silver') return 'gold';
    if (subscription_tier === 'gold') return 'platinum';
    return null;
  })();

  const getLikesProgress = () => {
    if (usageLimits.dailyLikesLimit >= 999) return 0;
    return (usageLimits.dailyLikesUsed / usageLimits.dailyLikesLimit) * 100;
  };

  const getSuperLikesProgress = () => {
    if (usageLimits.dailySuperLikesLimit >= 999) return 0;
    return (usageLimits.dailySuperLikesUsed / usageLimits.dailySuperLikesLimit) * 100;
  };

  const getBoostsProgress = () => {
    if (usageLimits.monthlyBoostsLimit >= 999) return 0;
    return (usageLimits.monthlyBoostsUsed / usageLimits.monthlyBoostsLimit) * 100;
  };

  return (
    <Card className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTierIcon(subscription_tier)}
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                {subscription_tier ? t(`subscription.tiers.${subscription_tier}`) : t('subscription.tiers.registered')} {t('subscription.limits.plan')}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getTierBadgeStyle(subscription_tier)}>
              {subscription_tier === null || subscription_tier === 'registered'
                ? t('subscription.tiers.registered')
                : tierInfo?.displayName || subscription_tier
              }
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <Clock className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Subscription Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('subscription.status.currentPlan')}:
            </span>
            {subscribed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          {subscription_end && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('subscription.status.validUntil')}: {format(new Date(subscription_end), 'dd MMM yyyy', { locale: tr })}
            </span>
          )}
        </div>

        {/* Subscription End Progress */}
        {subscription_end && daysRemaining !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('subscription.status.timeRemaining')}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {daysRemaining > 0
                  ? t('subscription.status.daysRemaining', { days: daysRemaining })
                  : t('subscription.status.expired')
                }
              </span>
            </div>
            <Progress 
              value={Math.min((daysRemaining / 30) * 100, 100)} 
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
          </div>
        )}

        {/* Usage Limits */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('subscription.limits.dailyUsage')}
          </h4>
          
          {/* Daily Likes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('subscription.limits.dailyLikes')}</span>
              </div>
              <span className={`font-medium ${
                remainingLikes <= 0 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {usageLimits.dailyLikesLimit >= 999
                  ? t('subscription.limits.unlimited')
                  : `${remainingLikes}/${usageLimits.dailyLikesLimit} ${t('subscription.limits.remaining')}`
                }
              </span>
            </div>
            {usageLimits.dailyLikesLimit < 999 && (
              <Progress 
                value={getLikesProgress()} 
                className="h-2 bg-gray-100 dark:bg-gray-700"
              />
            )}
            {remainingLikes <= 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('subscription.limits.dailyLikeLimitReached')}
              </p>
            )}
          </div>

          {/* Super Likes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('subscription.limits.superLikes')}</span>
              </div>
              <span className={`font-medium ${
                remainingSuperLikes <= 0 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {usageLimits.dailySuperLikesLimit >= 999
                  ? t('subscription.limits.unlimited')
                  : `${remainingSuperLikes}/${usageLimits.dailySuperLikesLimit} ${t('subscription.limits.remaining')}`
                }
              </span>
            </div>
            {usageLimits.dailySuperLikesLimit < 999 && (
              <Progress 
                value={getSuperLikesProgress()} 
                className="h-2 bg-gray-100 dark:bg-gray-700"
              />
            )}
            {remainingSuperLikes <= 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('subscription.limits.dailySuperLikeLimitReached')}
              </p>
            )}
          </div>

          {/* Boosts (if available) */}
          {usageLimits.monthlyBoostsLimit > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">{t('subscription.limits.monthlyBoosts')}</span>
                </div>
                <span className={`font-medium ${
                  remainingMonthlyBoosts <= 0 
                    ? 'text-gray-400 dark:text-gray-500' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {usageLimits.monthlyBoostsLimit >= 999
                    ? t('subscription.limits.unlimited')
                    : `${remainingMonthlyBoosts}/${usageLimits.monthlyBoostsLimit} ${t('subscription.limits.remaining')}`
                  }
                </span>
              </div>
              {usageLimits.monthlyBoostsLimit < 999 && (
                <Progress 
                  value={getBoostsProgress()} 
                  className="h-2 bg-gray-100 dark:bg-gray-700"
                />
              )}
            </div>
          )}
        </div>

        {/* Premium Features Summary */}
        {tier.features && tier.features.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('subscription.status.features')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {tier.features.slice(0, 4).map((feature: any, index: number) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
                >
                  {typeof feature === 'string'
                    ? t(feature)
                    : t(feature.key, { count: feature.count })
                  }
                </Badge>
              ))}
              {tier.features.length > 4 && (
                <Badge 
                  variant="outline" 
                  className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
                >
                  +{tier.features.length - 4} {t('subscription.limits.more')}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-md"
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2 text-white" />
              {subscribed ? t('subscription.upgrade') : t('subscription.subscribenow')}
            </Button>
            {subscribed && (
              <Button
                onClick={handleManage}
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-white dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900"
                size="lg"
              >
                <Settings className="w-4 h-4 mr-2 text-white" />
                {t('subscription.manage')}
              </Button>
            )}
          </div>
          
          {/* Upgrade Recommendation */}
          {recommendedUpgrade && (remainingLikes <= 0 || remainingSuperLikes <= 0) && (
            <div className="mt-3 p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg border border-pink-200/50 dark:border-pink-800/30">
              <p className="text-sm text-pink-700 dark:text-pink-300 mb-2">
                {t('subscription.limits.upgradeMessage')}
              </p>
              <Button 
                onClick={handleUpgrade}
                variant="outline"
                className="w-full border-pink-300 dark:border-pink-600 text-white dark:text-white hover:bg-pink-100 dark:hover:bg-pink-900/20 hover:text-pink-700"
                size="sm"
              >
                {t('subscription.limits.upgradeTo')} {recommendedUpgrade.charAt(0).toUpperCase() + recommendedUpgrade.slice(1)}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};