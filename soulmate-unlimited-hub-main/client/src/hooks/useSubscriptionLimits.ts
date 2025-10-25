import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionLimits {
  dailyLikes: number;
  dailySuperLikes: number;
  dailyBoosts: number;
  features: string[];
}

interface UserUsage {
  daily_likes_used: number;
  daily_super_likes_used: number;
  daily_boosts_used: number;
  last_like_reset_date: string;
}

interface SubscriptionState {
  tier: {
    name: string;
    role: string;
    limits: SubscriptionLimits;
    price: number;
    features: (string | { key: string; count: number })[];
  };
  usage: UserUsage;
  remaining: {
    likes: number;
    superLikes: number;
    boosts: number;
  };
  canPerform: {
    like: boolean;
    superLike: boolean;
    boost: boolean;
  };
  recommendedUpgrade: string | null;
  loading: boolean;
  error: string | null;
}

// Subscription tiers aligned with Supabase functions
const subscriptionTiers = {
  registered: {
    name: 'Free',
    role: 'registered',
    limits: { dailyLikes: 10, dailySuperLikes: 1, dailyBoosts: 0, features: ['basic_matching'] },
    price: 0,
    features: [
      'feature.basicMatching',
      { key: 'features.dailyLikes', count: 10 },
      { key: 'features.dailySuperlikes', count: 1 }
    ]
  },
  silver: {
    name: 'Silver',
    role: 'silver',
    // Limits aligned with Supabase functions (activate_boost function)
    limits: { dailyLikes: 50, dailySuperLikes: 5, dailyBoosts: 1, features: ['basic_matching', 'advanced_filters', 'disable_ads'] },
    price: 9.99,
    features: [
      'feature.basicMatching',
      { key: 'features.dailyLikes', count: 50 },
      { key: 'features.dailySuperlikes', count: 5 },
      { key: 'features.monthlyBoosts', count: 1 },
      'feature.advancedFilters',
      'features.disableAds'
    ]
  },
  gold: {
    name: 'Gold',
    role: 'gold',
    // Limits aligned with Supabase functions
    limits: { dailyLikes: 100, dailySuperLikes: 10, dailyBoosts: 3, features: ['basic_matching', 'advanced_filters', 'video_calls', 'see_who_likes_you'] },
    price: 19.99,
    features: [
      'allSilverFeatures',
      { key: 'features.dailyLikes', count: 100 },
      { key: 'features.dailySuperlikes', count: 10 },
      { key: 'features.monthlyBoosts', count: 3 },
      'feature.videoCalls',
      'feature.seeWhoLikesYou'
    ]
  },
  platinum: {
    name: 'Platinum',
    role: 'platinum',
    // Limits aligned with Supabase functions (25 boosts = nearly unlimited)
    limits: { dailyLikes: 999, dailySuperLikes: 25, dailyBoosts: 25, features: ['basic_matching', 'advanced_filters', 'video_calls', 'unlimited'] },
    price: 29.99,
    features: [
      'allGoldFeatures',
      { key: 'features.dailyLikes', count: 999 },
      { key: 'features.dailySuperlikes', count: 25 },
      { key: 'features.monthlyBoosts', count: 25 },
      'feature.unlimitedLikes',
      'feature.unlimitedMessages',
      'feature.prioritySupport',
      'feature.incognitoMode'
    ]
  }
};

export function useSubscriptionLimits(): SubscriptionState {
  const { user, userRole } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tier: subscriptionTiers.registered,
    usage: {
      daily_likes_used: 0,
      daily_super_likes_used: 0,
      daily_boosts_used: 0,
      last_like_reset_date: new Date().toISOString()
    },
    remaining: { likes: 5, superLikes: 1, boosts: 0 },
    canPerform: { like: true, superLike: true, boost: false },
    recommendedUpgrade: 'silver',
    loading: true,
    error: null
  });

  const loadRealUsageData = async (userId: string) => {
    try {
      // Query existing database structure (legacy column names)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          daily_likes_used, 
          daily_super_likes_used, 
          daily_boosts_used, 
          last_like_reset_date,
          subscription_tier
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      return {
        daily_likes_used: profile?.daily_likes_used ?? 0,
        daily_super_likes_used: profile?.daily_super_likes_used ?? 0,
        daily_boosts_used: profile?.daily_boosts_used ?? 0,
        last_like_reset_date: profile?.last_like_reset_date || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error loading real usage data:', error);
      return {
        daily_likes_used: 0,
        daily_super_likes_used: 0,
        daily_boosts_used: 0,
        last_like_reset_date: new Date().toISOString()
      };
    }
  };

  useEffect(() => {
    if (!user || !userRole) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const loadSubscriptionData = async () => {
      const userTier = subscriptionTiers[userRole as keyof typeof subscriptionTiers] || subscriptionTiers.registered;
      
      // Load real usage data from database
      const realUsage = await loadRealUsageData(user.id);

      // Check if we need to reset daily counters for new day
      const today = new Date().toISOString().split('T')[0];
      const lastReset = realUsage.last_like_reset_date?.split('T')[0];
      
      let currentUsage = realUsage;
      if (lastReset !== today) {
        // Reset counters for new day
        try {
          await supabase
            .from('profiles')
            .update({
              daily_likes_used: 0,
              daily_super_likes_used: 0,
              daily_boosts_used: 0,
              last_like_reset_date: new Date().toISOString()
            })
            .eq('id', user.id);

          currentUsage = {
            daily_likes_used: 0,
            daily_super_likes_used: 0,
            daily_boosts_used: 0,
            last_like_reset_date: new Date().toISOString()
          };
        } catch (error) {
          console.error('Error resetting daily counters:', error);
        }
      }

      const remaining = {
        likes: Math.max(0, userTier.limits.dailyLikes - currentUsage.daily_likes_used),
        superLikes: Math.max(0, userTier.limits.dailySuperLikes - currentUsage.daily_super_likes_used),
        boosts: Math.max(0, userTier.limits.dailyBoosts - currentUsage.daily_boosts_used)
      };

      const canPerform = {
        like: userTier.limits.dailyLikes >= 999 || currentUsage.daily_likes_used < userTier.limits.dailyLikes,
        superLike: userTier.limits.dailySuperLikes >= 999 || currentUsage.daily_super_likes_used < userTier.limits.dailySuperLikes,
        boost: userTier.limits.dailyBoosts >= 999 || currentUsage.daily_boosts_used < userTier.limits.dailyBoosts
      };

      const tierOrder = ['registered', 'silver', 'gold', 'platinum'];
      const currentIndex = tierOrder.indexOf(userRole);
      const recommendedUpgrade = currentIndex >= 0 && currentIndex < tierOrder.length - 1 
        ? tierOrder[currentIndex + 1] 
        : null;

      setState({
        tier: userTier,
        usage: currentUsage,
        remaining,
        canPerform,
        recommendedUpgrade,
        loading: false,
        error: null
      });
    };

    loadSubscriptionData();
  }, [user, userRole]);

  return state;
}
