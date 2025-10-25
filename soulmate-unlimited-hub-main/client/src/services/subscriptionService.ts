import { supabase } from '@/integrations/supabase/client';
import { subscriptionSyncService } from './subscriptionSyncService';
import { ProfileUpdateData } from '@/types/common';

export type SubscriptionTier = 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin';

export interface UserSubscription {
  id?: string;
  userId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  tier: SubscriptionTier;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export const SUBSCRIPTION_TIERS = [
  {
    name: 'silver',
    displayName: 'Silver',
    price: 9.99,
    interval: 'month' as const,
    stripePriceId: import.meta.env.VITE_STRIPE_SILVER_PRICE_ID || 'price_silver_monthly',
    features: [
      '❤️ 50 Daily Likes',
      '⭐ 5 Super Likes per day',
      '🎯 Advanced Filters',
      '👀 See Who Likes You',
      '🚀 1 Boost per month',
      '⏮️ Rewind',
      '📞 Voice Calls'
    ]
  },
  {
    name: 'gold',
    displayName: 'Gold',
    price: 19.99,
    interval: 'month' as const,
    stripePriceId: import.meta.env.VITE_STRIPE_GOLD_PRICE_ID || 'price_gold_monthly',
    features: [
      '💖 100 Daily Likes',
      '⭐ 10 Super Likes per day',
      '🚀 3 Boosts per month',
      '👻 Invisible Browsing',
      '🌍 Passport',
      '📞 HD Video Calls',
      '🎯 All Silver Features'
    ]
  },
  {
    name: 'platinum',
    displayName: 'Platinum',
    price: 29.99,
    interval: 'month' as const,
    stripePriceId: import.meta.env.VITE_STRIPE_PLATINUM_PRICE_ID || 'price_platinum_monthly',
    features: [
      '💎 Unlimited Likes',
      '⭐ 25 Super Likes per day',
      '🚀 10 Boosts per month',
      '📊 Profile Analytics',
      '👑 VIP Matching',
      '🌐 Multi-language Translation',
      '🔥 All Gold Features'
    ]
  }
];

export interface SubscriptionLimits {
  dailyLikes: number;
  dailySuperlikes: number;
  monthlyBoosts: number; // Fixed: Boosts are monthly, not daily
  seeWhoLikesYou: boolean;
  advancedFilters: boolean;
  voiceCalls: boolean;
  videoCalls: boolean;
  passportFeature: boolean;
  invisibleBrowsing: boolean;
  multiLanguageChat: boolean;
  rewindFeature: boolean;
}

export interface DailyUsage {
  likesUsed: number;
  superlikesUsed: number;
  boostsUsed: number;
  lastResetDate: string;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  remainingUses?: number;
  upgradeRequired?: boolean;
  suggestedTier?: string;
}

const TIER_LIMITS: Record<string, SubscriptionLimits> = {
  registered: {
    dailyLikes: 10, // Slightly increased for base free tier
    dailySuperlikes: 1,
    monthlyBoosts: 0, // Fixed: Monthly boosts
    seeWhoLikesYou: false,
    advancedFilters: false,
    voiceCalls: false,
    videoCalls: false,
    passportFeature: false,
    invisibleBrowsing: false,
    multiLanguageChat: false,
    rewindFeature: false
  },
  silver: {
    dailyLikes: 50,
    dailySuperlikes: 5,
    monthlyBoosts: 1, // Fixed: Monthly boosts
    seeWhoLikesYou: true,
    advancedFilters: true,
    voiceCalls: true,
    videoCalls: false,
    passportFeature: false,
    invisibleBrowsing: false,
    multiLanguageChat: false,
    rewindFeature: true
  },
  gold: {
    dailyLikes: 100,
    dailySuperlikes: 10,
    monthlyBoosts: 3, // Fixed: Monthly boosts
    seeWhoLikesYou: true,
    advancedFilters: true,
    voiceCalls: true,
    videoCalls: true,
    passportFeature: true,
    invisibleBrowsing: true,
    multiLanguageChat: false,
    rewindFeature: true
  },
  moderator: {
    dailyLikes: 999,
    dailySuperlikes: 999,
    monthlyBoosts: 999, // Fixed: Monthly boosts
    seeWhoLikesYou: true,
    advancedFilters: true,
    voiceCalls: true,
    videoCalls: true,
    passportFeature: true,
    invisibleBrowsing: true,
    multiLanguageChat: true,
    rewindFeature: true
  },
  platinum: {
    dailyLikes: 999, // Unlimited
    dailySuperlikes: 25,
    monthlyBoosts: 10, // Fixed: Monthly boosts
    seeWhoLikesYou: true,
    advancedFilters: true,
    voiceCalls: true,
    videoCalls: true,
    passportFeature: true,
    invisibleBrowsing: true,
    multiLanguageChat: true,
    rewindFeature: true
  },
  admin: {
    dailyLikes: 999,
    dailySuperlikes: 999,
    monthlyBoosts: 999, // Fixed: Monthly boosts
    seeWhoLikesYou: true,
    advancedFilters: true,
    voiceCalls: true,
    videoCalls: true,
    passportFeature: true,
    invisibleBrowsing: true,
    multiLanguageChat: true,
    rewindFeature: true
  }
};

class SubscriptionService {
  async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .eq('subscribed', true)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id || '',
        status: data.subscribed ? 'active' : 'canceled',
        tier: (data.subscription_tier || 'registered') as SubscriptionTier,
        currentPeriodEnd: data.subscription_end || undefined,
        cancelAtPeriodEnd: false
      };
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }

  async syncSubscriptionWithRole(userId: string, subscription: {
    status: string;
    tier: string;
    role: string;
    endDate: string;
    email?: string;
  }): Promise<void> {
    try {
      // Update the user's role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: subscription.role,
          subscription_tier: subscription.tier,
          subscription_status: subscription.status,
          subscription_expires_at: subscription.endDate
        } as ProfileUpdateData)
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        throw profileError;
      }

      // Update or create subscription record
      await supabase
        .from('subscribers')
        .upsert({
          user_id: userId,
          email: subscription.email || '',
          subscribed: subscription.status === 'active',
          subscription_tier: subscription.tier,
          subscription_end: subscription.endDate,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error syncing subscription with role:', error);
      throw error;
    }
  }

  async checkAndRecordLike(userId: string, userRole: string): Promise<LimitCheckResult> {
    const limits = TIER_LIMITS[userRole] || TIER_LIMITS.registered;
    
    try {
      // Use raw SQL query to handle custom columns
      const { data: profile, error } = await supabase.rpc('get_user_usage', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user usage:', error);
        // Fallback to basic check without usage tracking
        return { allowed: true };
      }

      const usage = profile && typeof profile === 'object' && !Array.isArray(profile)
        ? profile as any
        : { daily_likes_used: 0, last_like_reset_date: null };
      
      // Check if we need to reset daily counter
      const today = new Date().toISOString().split('T')[0];
      const lastReset = usage?.last_like_reset_date?.split('T')[0];
      
      let currentUsage = usage?.daily_likes_used || 0;
      
      if (lastReset !== today) {
        // Reset counter for new day
        currentUsage = 0;
        await this.resetDailyCounters(userId);
      }

      // Check limits
      if (limits.dailyLikes !== 999 && currentUsage >= limits.dailyLikes) {
        return {
          allowed: false,
          reason: 'limit.daily.likes',
          remainingUses: 0,
          upgradeRequired: true,
          suggestedTier: userRole === 'registered' ? 'silver' : userRole === 'silver' ? 'gold' : 'platinum'
        };
      }

      // Record usage
      await this.incrementLikes(userId, currentUsage + 1);

      const remaining = limits.dailyLikes === 999 ? 999 : limits.dailyLikes - (currentUsage + 1);
      
      // Broadcast usage update to other tabs/devices
      await subscriptionSyncService.broadcastUsageUpdate({
        dailyLikesUsed: currentUsage + 1,
        lastUsageResetDate: today
      });
      
      return {
        allowed: true,
        remainingUses: remaining
      };
    } catch (error) {
      console.error('Subscription check error:', error);
      // Allow action on error to prevent blocking users
      return { allowed: true };
    }
  }

  async checkAndRecordSuperLike(userId: string, userRole: string): Promise<LimitCheckResult> {
    const limits = TIER_LIMITS[userRole] || TIER_LIMITS.registered;
    
    try {
      const { data: profile, error } = await supabase.rpc('get_user_usage', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user usage:', error);
        return { allowed: true };
      }

      const usage = profile && typeof profile === 'object' && !Array.isArray(profile)
        ? profile as any
        : { daily_super_likes_used: 0, last_like_reset_date: null };
      
      // Check if we need to reset daily counter
      const today = new Date().toISOString().split('T')[0];
      const lastReset = usage?.last_like_reset_date?.split('T')[0];
      
      let currentUsage = usage.daily_super_likes_used || 0;
      
      if (lastReset !== today) {
        currentUsage = 0;
        await this.resetDailyCounters(userId);
      }

      // Check limits
      if (limits.dailySuperlikes !== 999 && currentUsage >= limits.dailySuperlikes) {
        return {
          allowed: false,
          reason: 'limit.daily.superLikes',
          remainingUses: 0,
          upgradeRequired: true,
          suggestedTier: 'platinum'
        };
      }

      // Record usage
      await this.incrementSuperLikes(userId, currentUsage + 1);

      const remaining = limits.dailySuperlikes === 999 ? 999 : limits.dailySuperlikes - (currentUsage + 1);
      
      // Broadcast usage update to other tabs/devices
      await subscriptionSyncService.broadcastUsageUpdate({
        dailySuperLikesUsed: currentUsage + 1,
        lastUsageResetDate: today
      });
      
      return {
        allowed: true,
        remainingUses: remaining
      };
    } catch (error) {
      console.error('Subscription check error:', error);
      return { allowed: true };
    }
  }

  async checkFeatureAccess(userRole: string, feature: keyof SubscriptionLimits): Promise<LimitCheckResult> {
    const limits = TIER_LIMITS[userRole] || TIER_LIMITS.registered;
    const hasAccess = limits[feature];

    if (typeof hasAccess === 'boolean' && !hasAccess) {
      const featureToTierMap = {
        seeWhoLikesYou: 'silver',
        advancedFilters: 'silver',
        voiceCalls: 'silver',
        videoCalls: 'gold',
        passportFeature: 'gold',
        invisibleBrowsing: 'gold',
        multiLanguageChat: 'platinum',
        rewindFeature: 'silver'
      };

      return {
        allowed: false,
        reason: 'feature.requires.premium',
        upgradeRequired: true,
        suggestedTier: featureToTierMap[feature as keyof typeof featureToTierMap] || 'silver'
      };
    }

    return { allowed: true };
  }

  getTierLimits(userRole: string): SubscriptionLimits {
    return TIER_LIMITS[userRole] || TIER_LIMITS.registered;
  }

  private async resetDailyCounters(userId: string): Promise<void> {
    const today = new Date().toISOString();
    
    try {
      await supabase.rpc('reset_daily_usage');
    } catch (error) {
      console.error('Error resetting daily counters:', error);
    }
  }

  private async incrementLikes(userId: string, newCount: number): Promise<void> {
    try {
      await supabase.rpc('increment_likes', {
        p_user_id: userId
      });
    } catch (error) {
      console.error('Error incrementing likes:', error);
    }
  }

  private async incrementSuperLikes(userId: string, newCount: number): Promise<void> {
    try {
      // Update super likes directly since there's no increment_super_likes RPC function
      await supabase
        .from('profiles')
        .update({ 
          daily_super_likes_used: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error incrementing super likes:', error);
    }
  }

  async checkAndRecordBoost(userId: string, userRole: string): Promise<LimitCheckResult> {
    const limits = TIER_LIMITS[userRole] || TIER_LIMITS.registered;
    
    try {
      const { data: profile, error } = await supabase.rpc('get_user_usage', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user usage:', error);
        return { allowed: true };
      }

      const usage = profile && typeof profile === 'object' && !Array.isArray(profile)
        ? profile as any
        : { 
          daily_boosts_used: 0,
          last_like_reset_date: null
        };
      
      // Check if we need to reset monthly counter
      const today = new Date();
      const currentMonth = today.toISOString().substring(0, 7); // YYYY-MM
      const lastResetMonth = usage.last_like_reset_date?.substring(0, 7);
      
      let monthlyUsage = usage.daily_boosts_used || 0;
      
      // Reset monthly counter if needed
      if (lastResetMonth !== currentMonth) {
        monthlyUsage = 0;
      }

      // Check monthly limits (boosts are monthly, not daily)
      if (limits.monthlyBoosts !== 999 && monthlyUsage >= limits.monthlyBoosts) {
        return {
          allowed: false,
          reason: 'limit.monthly.boosts',
          remainingUses: 0,
          upgradeRequired: true,
          suggestedTier: userRole === 'registered' ? 'silver' : userRole === 'silver' ? 'gold' : 'platinum'
        };
      }

      // Update boost usage directly in profiles table
      const { error: boostError } = await supabase
        .from('profiles')
        .update({
          monthly_boosts_used: monthlyUsage + 1,
          last_boost_reset_date: currentMonth,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (boostError) {
        console.error('Error incrementing boosts:', boostError);
        return {
          allowed: false,
          reason: 'error.boost_increment',
          remainingUses: 0
        };
      }

      // Broadcast usage update to other tabs/devices
      await subscriptionSyncService.broadcastUsageUpdate({
        monthlyBoostsUsed: monthlyUsage + 1,
        lastBoostResetDate: currentMonth
      });

      // Create boost record
      const boostDuration = 30; // 30 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + boostDuration);
      
      // Boost is now tracked in the profiles table
      await supabase
        .from('profiles')
        .update({
          boost_active_until: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      const remaining = limits.monthlyBoosts === 999 ? 999 : limits.monthlyBoosts - (monthlyUsage + 1);
      
      return {
        allowed: true,
        remainingUses: remaining
      };
    } catch (error) {
      console.error('Boost check error:', error);
      return { allowed: true };
    }
  }

  async getActiveBoost(userId: string): Promise<{isActive: boolean, expiresAt?: string}> {
    try {
      // Check if user has an active boost by looking at boost_active_until in profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('daily_boosts_used')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return { isActive: false };
      }

      // For now, boosts are not tracked with expiry in the database
      // This would need a separate boost tracking system
      return { isActive: false };
    } catch (error) {
      console.error('Error checking active boost:', error);
      return { isActive: false };
    }
  }

  async createStripeCheckout(priceId: string, successUrl: string, cancelUrl: string): Promise<{ url?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          priceId,
          successUrl,
          cancelUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create Stripe checkout:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();