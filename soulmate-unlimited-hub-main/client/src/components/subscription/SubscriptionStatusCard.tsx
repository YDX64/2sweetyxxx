import React, { useState } from 'react';
import { RefreshCw, Crown, Sparkles, Zap, Star, Gem, Calendar, AlertCircle, CheckCircle, Clock, XCircle, Settings, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getTierTextColorClass, getTierBadgeStyle } from '@/utils/tierUtils';
import { SubscriptionTier, TIER_INFO, TIER_FEATURES } from '@/types/subscription';

export const SubscriptionStatusCard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end,
    loading,
    features,
    manageSubscription,
    checkSubscription
  } = useSubscription();
  
  const [refreshing, setRefreshing] = useState(false);

  const getTierIcon = (tier: string | null) => {
    const colorClass = tier ? getTierTextColorClass(tier as SubscriptionTier) : 'text-gray-400';
    switch (tier) {
      case 'platinum':
        return <Sparkles className={`w-6 h-6 ${colorClass}`} />;
      case 'gold':
        return <Crown className={`w-6 h-6 ${colorClass}`} />;
      case 'silver':
        return <Star className={`w-6 h-6 ${colorClass}`} />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };


  const handleRefresh = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierInfo = subscription_tier ? TIER_INFO[subscription_tier] : null;
  const tierFeatures = subscription_tier ? TIER_FEATURES[subscription_tier] : TIER_FEATURES.registered;

  const calculateDaysRemaining = () => {
    if (!subscription_end) return null;
    const endDate = new Date(subscription_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${tierInfo?.bgGradient || 'from-gray-100 to-gray-200'} opacity-10`} />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTierIcon(subscription_tier)}
            <div>
              <CardTitle className="text-xl">
                {t('subscription.status.title')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <Clock className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Current Tier Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {t('subscription.status.currentPlan')}:
            </span>
            <Badge className={getTierBadgeStyle(subscription_tier)}>
              {subscription_tier ? t(`subscription.tiers.${subscription_tier}`) : t('subscription.tiers.free')}
            </Badge>
          </div>
          {subscribed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Subscription End Date */}
        {subscription_end && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('subscription.status.validUntil')}:
              </span>
              <span className="font-medium">
                {format(new Date(subscription_end), 'dd MMMM yyyy', { locale: tr })}
              </span>
            </div>
            {daysRemaining !== null && (
              <>
                <Progress 
                  value={Math.min((daysRemaining / 30) * 100, 100)} 
                  className="h-2"
                />
                <p className="text-xs text-center text-muted-foreground">
                  {daysRemaining > 0 
                    ? t('subscription.status.daysRemaining', { days: daysRemaining })
                    : t('subscription.status.expired')
                  }
                </p>
              </>
            )}
          </div>
        )}

        {/* Feature Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            {t('subscription.status.features')}:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{t('features.dailyLikes', { count: tierFeatures.dailyLikes })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span>{t('features.dailySuperlikes', { count: tierFeatures.dailySuperlikes })}</span>
            </div>
            {tierFeatures.monthlyBoosts > 0 && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span>{t('features.monthlyBoosts', { count: tierFeatures.monthlyBoosts })}</span>
              </div>
            )}
            {tierFeatures.seeWhoLikesYou && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t('feature.seeWhoLikesYou')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {subscribed ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={manageSubscription}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('subscription.manage')}
              </Button>
              <Button
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/upgrade'}
              >
                <Crown className="w-4 h-4 mr-2" />
                {t('subscription.upgrade')}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={() => window.location.href = '/upgrade'}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {t('subscription.subscribenow')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};