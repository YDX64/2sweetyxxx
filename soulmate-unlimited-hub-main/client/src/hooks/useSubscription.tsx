import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { SubscriptionStatus, SubscriptionTier, TIER_FEATURES } from '@/types/subscription';
import { subscriptionSyncService, SubscriptionUpdate } from '@/services/subscriptionSyncService';

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  console.log(t('debug.subscription.expectedKeys'), Object.keys(TIER_FEATURES));
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: 'registered',
    subscription_end: null,
    loading: true,
    features: TIER_FEATURES.registered
  });

  const [usageLimits, setUsageLimits] = useState({
    dailyLikesUsed: 0,
    dailySuperLikesUsed: 0,
    dailyBoostsUsed: 0,
    monthlyBoostsUsed: 0,
    dailyLikesLimit: 10,
    dailySuperLikesLimit: 1,
    dailyBoostsLimit: 0,
    monthlyBoostsLimit: 0
  });

  const checkSubscription = async (forceRefresh = false) => {
    if (!user) {
      setSubscriptionStatus({
        subscribed: false,
        subscription_tier: 'registered',
        subscription_end: null,
        loading: false,
        features: TIER_FEATURES.registered
      });
      return;
    }

    try {
      console.log(t('debug.subscription.checkingStatus'), { forceRefresh });
      
      // Force fresh data by using timestamp in query
      const timestamp = forceRefresh ? `?t=${Date.now()}` : '';
      
      // Get user profile data including subscription_end
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, subscription_status, subscription_tier, subscription_expires_at, daily_likes_used, daily_super_likes_used, daily_boosts_used')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error(t('debug.subscription.profileNotFound'), profileError);
        throw new Error('Profile not found');
      }

      console.log(t('debug.subscription.profileData'), profile);

      // Get subscriber data
      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log(t('debug.subscription.subscriberData'), subscriber);

      // Determine subscription status - prioritize profiles table data
      let subscriptionTier = profile.subscription_tier || 'registered';
      let subscribed = false;
      let subscriptionEnd = profile.subscription_expires_at;
      let source = 'profiles';

      // Admin and moderator users are separate from subscription system
      if (profile.role && ['admin', 'moderator'].includes(profile.role)) {
        subscribed = true;
        subscriptionTier = profile.role; // Use role as tier for admin/moderator
        subscriptionEnd = null; // Admin/moderator don't have subscription end dates
        source = 'admin_role';
      } else if (profile.subscription_tier && ['silver', 'gold', 'platinum'].includes(profile.subscription_tier) && profile.subscription_status === 'active') {
        // Regular subscription users (silver, gold, platinum) - must have active status
        subscribed = true;
        subscriptionTier = profile.subscription_tier;
        subscriptionEnd = profile.subscription_expires_at;
        source = 'profiles_subscription';
        
        // Check if subscription is still valid
        if (subscriptionEnd) {
          const endDate = new Date(subscriptionEnd);
          const now = new Date();
          if (endDate <= now) {
            subscribed = false;
            subscriptionTier = 'registered';
            source = 'expired';
          }
        }
      } else if (subscriber && subscriber.subscribed) {
        // Fallback to subscribers table if profile data incomplete
        const subscriberTier = subscriber.subscription_tier as SubscriptionTier;
        subscriptionTier = subscriberTier || subscriptionTier;
        subscribed = true;
        subscriptionEnd = subscriber.subscription_end;
        source = 'subscribers';
        
        // Check if subscription is still valid
        if (subscriptionEnd) {
          const endDate = new Date(subscriptionEnd);
          const now = new Date();
          if (endDate <= now) {
            subscribed = false;
            subscriptionTier = 'registered';
            source = 'expired';
          }
        }
      }

      console.log(t('debug.subscription.checkResult'), {
        subscription_tier: subscriptionTier,
        subscribed: subscribed,
        subscription_end: subscriptionEnd || null,
        source: source
      });
      
      // Tier belirle - default olarak registered
      const tier: SubscriptionTier = (subscriptionTier as SubscriptionTier) || 'registered';
      const isSubscribed = tier !== 'registered';
      
      console.log(t('debug.subscription.finalTierValue'), tier);
      console.log(t('debug.subscription.isSubscribed'), isSubscribed);
      
      // Get current usage limits from profile
      if (profile) {
        const features = TIER_FEATURES[tier];
        setUsageLimits({
          dailyLikesUsed: profile.daily_likes_used || 0,
          dailySuperLikesUsed: profile.daily_super_likes_used || 0,
          dailyBoostsUsed: profile.daily_boosts_used || 0,
          monthlyBoostsUsed: 0, // Not tracked in profile currently
          dailyLikesLimit: features.dailyLikes,
          dailySuperLikesLimit: features.dailySuperlikes,
          dailyBoostsLimit: 0, // Boosts are monthly, not daily
          monthlyBoostsLimit: features.monthlyBoosts
        });
      } else {
        // Fallback to tier features
        const features = TIER_FEATURES[tier];
        setUsageLimits({
          dailyLikesUsed: 0,
          dailySuperLikesUsed: 0,
          dailyBoostsUsed: 0,
          monthlyBoostsUsed: 0,
          dailyLikesLimit: features.dailyLikes,
          dailySuperLikesLimit: features.dailySuperlikes,
          dailyBoostsLimit: 0, // Boosts are monthly, not daily
          monthlyBoostsLimit: features.monthlyBoosts
        });
      }
      
      setSubscriptionStatus({
        subscribed: isSubscribed,
        subscription_tier: tier,
        subscription_end: subscriptionEnd || null,
        loading: false,
        features: TIER_FEATURES[tier]
      });
    } catch (error) {
      console.error(t('debug.subscription.failedToCheck'), error);
      setSubscriptionStatus({
        subscribed: false,
        subscription_tier: 'registered',
        subscription_end: null,
        loading: false,
        features: TIER_FEATURES.registered
      });
    }
  };

  const createCheckout = async (plan: string, billing: 'monthly' | 'yearly') => {
    if (!user) {
      toast({
        title: t('authenticationRequired'),
        description: t('loginRequiredForPayment'),
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(t('debug.subscription.creatingCheckout'), { plan, billing });
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, billing }
      });

      if (error) {
        console.error(t('debug.subscription.checkoutError'), error);
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(t('checkoutUrlError'));
      }
    } catch (error) {
      console.error(t('debug.subscription.failedToCreateCheckout'), error);
      toast({
        title: t('paymentError'),
        description: t('paymentSessionError'),
        variant: "destructive"
      });
    }
  };

  const manageSubscription = async () => {
    if (!user) {
      toast({
        title: t('authenticationRequired'),
        description: t('loginRequiredForManagement'),
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(t('debug.subscription.openingPortal'));
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          return_url: window.location.origin + '/settings'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('portalCouldNotOpen'));
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(t('portalUrlError'));
      }
    } catch (error) {
      console.error(t('debug.subscription.failedToOpenPortal'), error);
      toast({
        title: t('portalError'),
        description: t('customerPortalError'),
        variant: "destructive"
      });
    }
  };

  // Özellik kontrol fonksiyonları
  const hasFeature = (feature: keyof typeof TIER_FEATURES.registered) => {
    return subscriptionStatus.features[feature];
  };

  const canPerformAction = (action: 'like' | 'superlike' | 'boost' | 'message') => {
    const features = subscriptionStatus.features;
    
    switch (action) {
      case 'like':
        return features.dailyLikes > 0; // Günlük like kontrolü ayrıca yapılmalı
      case 'superlike':
        return features.dailySuperlikes > 0; // Günlük superlike kontrolü ayrıca yapılmalı
      case 'boost':
        return features.monthlyBoosts > 0; // Aylık boost kontrolü ayrıca yapılmalı
      case 'message':
        return features.unlimitedMessages || true; // Mesaj limiti ayrıca kontrol edilmeli
      default:
        return false;
    }
  };

  const isAdmin = () => {
    return subscriptionStatus.subscription_tier === 'admin';
  };

  const isPremiumUser = () => {
    const tier = subscriptionStatus.subscription_tier;
    console.log(t('debug.subscription.currentTier'), tier);
    console.log(t('debug.subscription.subscriptionStatus'), subscriptionStatus);
    
    // Separate admin/moderator from subscription tiers
    const subscriptionTiers = ['silver', 'gold', 'platinum'];
    const adminTiers = ['admin', 'moderator'];
    const allPremiumTiers = [...subscriptionTiers, ...adminTiers];
    const result = tier && allPremiumTiers.includes(tier);
    
    console.log(t('debug.subscription.subscriptionTiers'), subscriptionTiers);
    console.log(t('debug.subscription.adminTiers'), adminTiers);
    console.log(t('debug.subscription.isPremiumResult'), result);
    
    return result;
  };

  // Handle real-time subscription updates
  const handleSubscriptionUpdate = useCallback((update: SubscriptionUpdate) => {
    console.log('📡 Real-time subscription update received:', update);

    // Update subscription status
    if (update.profile || update.subscription) {
      const profile = update.profile;
      const subscriber = update.subscription;

      let subscriptionTier = profile?.role || subscriptionStatus.subscription_tier || 'registered';
      let subscribed = false;
      let subscriptionEnd = null;

      // Check subscriber data first
      if (subscriber && subscriber.subscribed) {
        subscriptionTier = subscriber.subscription_tier as SubscriptionTier || subscriptionTier;
        subscribed = true;
        subscriptionEnd = subscriber.subscription_end;
        
        // Check if subscription is still valid
        if (subscriptionEnd) {
          const endDate = new Date(subscriptionEnd);
          const now = new Date();
          if (endDate <= now) {
            subscribed = false;
            subscriptionTier = 'registered';
          }
        }
      } else if (profile?.role && ['silver', 'gold', 'platinum', 'admin', 'moderator'].includes(profile.role)) {
        subscribed = true;
        subscriptionTier = profile.role;
      }

      const tier: SubscriptionTier = subscriptionTier || 'registered';
      const isSubscribed = tier !== 'registered';

      setSubscriptionStatus({
        subscribed: isSubscribed,
        subscription_tier: tier,
        subscription_end: subscriptionEnd || null,
        loading: false,
        features: TIER_FEATURES[tier]
      });
    }

    // Update usage limits
    if (update.usageLimits) {
      const tier = subscriptionStatus.subscription_tier;
      const features = TIER_FEATURES[tier];
      
      setUsageLimits({
        dailyLikesUsed: update.usageLimits.dailyLikesUsed || 0,
        dailySuperLikesUsed: update.usageLimits.dailySuperLikesUsed || 0,
        dailyBoostsUsed: update.usageLimits.dailyBoostsUsed || 0,
        monthlyBoostsUsed: update.usageLimits.monthlyBoostsUsed || 0,
        dailyLikesLimit: features.dailyLikes,
        dailySuperLikesLimit: features.dailySuperlikes,
        dailyBoostsLimit: 0, // Boosts are monthly, not daily
        monthlyBoostsLimit: features.monthlyBoosts
      });
    }
  }, [subscriptionStatus.subscription_tier]);

  // Initialize real-time sync when user is available
  useEffect(() => {
    if (!user) return;

    // Initialize sync service
    subscriptionSyncService.initialize(user.id);

    // Subscribe to updates
    const unsubscribe = subscriptionSyncService.subscribe(handleSubscriptionUpdate);

    // Initial check
    checkSubscription();

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [user, handleSubscriptionUpdate]);

  // Force refresh subscription data
  const refreshSubscription = async () => {
    await checkSubscription(true);
    if (user) {
      await subscriptionSyncService.forceRefresh();
    }
  };

  return {
    ...subscriptionStatus,
    usageLimits,
    createCheckout,
    manageSubscription,
    checkSubscription: refreshSubscription, // Use refreshSubscription for better sync
    hasFeature,
    canPerformAction,
    isAdmin,
    isPremiumUser,
    isConnected: subscriptionSyncService.getConnectionStatus(),
    remainingLikes: usageLimits.dailyLikesLimit - usageLimits.dailyLikesUsed,
    remainingSuperLikes: usageLimits.dailySuperLikesLimit - usageLimits.dailySuperLikesUsed,
    remainingDailyBoosts: usageLimits.dailyBoostsLimit - usageLimits.dailyBoostsUsed,
    remainingMonthlyBoosts: usageLimits.monthlyBoostsLimit - usageLimits.monthlyBoostsUsed
  };
};
