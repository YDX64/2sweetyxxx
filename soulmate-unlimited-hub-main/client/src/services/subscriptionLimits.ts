import { supabase } from '@/integrations/supabase/client';
import { TIER_FEATURES, type SubscriptionTier } from '@/types/subscription';
import { ProfileUpdateData } from '@/types/common';

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  remainingUses?: number;
  upgradeRequired?: boolean;
  suggestedTier?: string;
}

class SubscriptionLimitsService {
  async checkAndRecordLike(userId: string, userRole: string): Promise<LimitCheckResult> {
    const tier = this.mapRoleToTier(userRole);
    const features = TIER_FEATURES[tier];
    
    // Get current usage
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_swipes, last_swipe_reset')
      .eq('id', userId)
      .single();

    if (!profile) {
      return { allowed: false, reason: 'User not found' };
    }

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    const lastReset = profile.last_swipe_reset?.split('T')[0];
    
    let currentUsage = profile.daily_swipes || 0;
    
    if (lastReset !== today) {
      // Reset counter for new day
      currentUsage = 0;
      await supabase
        .from('profiles')
        .update({
          daily_swipes: 0,
          last_swipe_reset: today
        } as ProfileUpdateData)
        .eq('id', userId);
    }

    // Check limits
    if (features.dailyLikes !== 999 && currentUsage >= features.dailyLikes) {
      return {
        allowed: false,
        reason: 'Daily like limit reached',
        remainingUses: 0,
        upgradeRequired: true,
        suggestedTier: tier === 'registered' ? 'silver' : 'gold'
      };
    }

    // Record usage
    await supabase
      .from('profiles')
      .update({
        daily_swipes: currentUsage + 1
      } as ProfileUpdateData)
      .eq('id', userId);

    const remaining = features.dailyLikes === 999 ? 999 : features.dailyLikes - (currentUsage + 1);
    
    return {
      allowed: true,
      remainingUses: remaining
    };
  }

  async checkAndRecordSuperLike(userId: string, userRole: string): Promise<LimitCheckResult> {
    const tier = this.mapRoleToTier(userRole);
    const features = TIER_FEATURES[tier];
    
    // Get current usage
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_super_likes, last_super_like_reset')
      .eq('id', userId)
      .single();

    if (!profile) {
      return { allowed: false, reason: 'User not found' };
    }

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    const lastReset = profile.last_super_like_reset?.split('T')[0];
    
    let currentUsage = profile.daily_super_likes || 0;
    
    if (lastReset !== today) {
      // Reset counter for new day
      currentUsage = 0;
      await supabase
        .from('profiles')
        .update({
          daily_super_likes: 0,
          last_super_like_reset: today
        } as ProfileUpdateData)
        .eq('id', userId);
    }

    // Check limits
    if (features.dailySuperlikes !== 999 && currentUsage >= features.dailySuperlikes) {
      return {
        allowed: false,
        reason: 'Daily super like limit reached',
        remainingUses: 0,
        upgradeRequired: true,
        suggestedTier: 'platinum'
      };
    }

    // Record usage
    await supabase
      .from('profiles')
      .update({
        daily_super_likes: currentUsage + 1
      } as ProfileUpdateData)
      .eq('id', userId);

    const remaining = features.dailySuperlikes === 999 ? 999 : features.dailySuperlikes - (currentUsage + 1);
    
    return {
      allowed: true,
      remainingUses: remaining
    };
  }

  async checkFeatureAccess(userRole: string, feature: keyof typeof TIER_FEATURES.registered): Promise<LimitCheckResult> {
    const tier = this.mapRoleToTier(userRole);
    const features = TIER_FEATURES[tier];
    const hasAccess = features[feature];

    if (!hasAccess) {
      const featureToTierMap = {
        seeWhoLikesYou: 'silver',
        advancedFilters: 'silver',
        voiceCalls: 'silver',
        videoCalls: 'silver',
        passportFeature: 'gold',
        invisibleBrowsing: 'gold',
        multiLanguageChat: 'platinum',
        rewindFeature: 'silver'
      };

      return {
        allowed: false,
        reason: `Feature requires premium subscription`,
        upgradeRequired: true,
        suggestedTier: featureToTierMap[feature as keyof typeof featureToTierMap] || 'silver'
      };
    }

    return { allowed: true };
  }

  async getRemainingLikes(userId: string, userRole: string): Promise<number> {
    const tier = this.mapRoleToTier(userRole);
    const features = TIER_FEATURES[tier];
    
    if (features.dailyLikes === 999) return 999;

    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_swipes, last_swipe_reset')
      .eq('id', userId)
      .single();

    if (!profile) return 0;

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    const lastReset = profile.last_swipe_reset?.split('T')[0];
    
    if (lastReset !== today) {
      return features.dailyLikes;
    }

    return Math.max(0, features.dailyLikes - (profile.daily_swipes || 0));
  }

  async getRemainingSuperLikes(userId: string, userRole: string): Promise<number> {
    const tier = this.mapRoleToTier(userRole);
    const features = TIER_FEATURES[tier];
    
    if (features.dailySuperlikes === 999) return 999;

    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_super_likes, last_swipe_reset')
      .eq('id', userId)
      .single();

    if (!profile) return 0;

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    const lastReset = profile.last_swipe_reset?.split('T')[0];
    
    if (lastReset !== today) {
      return features.dailySuperlikes;
    }

    return Math.max(0, features.dailySuperlikes - (profile.daily_super_likes || 0));
  }

  private mapRoleToTier(role: string): SubscriptionTier {
    const roleToTierMap: Record<string, SubscriptionTier> = {
      'registered': 'registered',
      'silver': 'silver',
      'gold': 'gold',
      'platinum': 'platinum',
      'admin': 'admin',
      'moderator': 'moderator'
    };
    
    return roleToTierMap[role] || 'registered';
  }

  async checkCanLike(userId: string, userRole: string): Promise<LimitCheckResult> {
    const tier = this.mapRoleToTier(userRole);
    const features = TIER_FEATURES[tier];
    
    // Get current usage
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_swipes, last_swipe_reset')
      .eq('id', userId)
      .single();

    if (!profile) {
      return { allowed: false, reason: 'User not found' };
    }

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    const lastReset = profile.last_swipe_reset?.split('T')[0];
    
    let currentUsage = profile.daily_swipes || 0;
    
    if (lastReset !== today) {
      // Reset counter for new day
      currentUsage = 0;
    }

    // Check limits
    if (features.dailyLikes !== 999 && currentUsage >= features.dailyLikes) {
      return {
        allowed: false,
        reason: 'Daily like limit reached',
        remainingUses: 0,
        upgradeRequired: true,
        suggestedTier: tier === 'registered' ? 'silver' : 'gold'
      };
    }

    const remaining = features.dailyLikes === 999 ? 999 : features.dailyLikes - currentUsage;
    
    return {
      allowed: true,
      remainingUses: remaining
    };
  }

  async checkCanSuperLike(userId: string, userRole: string): Promise<LimitCheckResult> {
    console.log('[subscriptionLimits] checkCanSuperLike - userRole:', userRole);
    const tier = this.mapRoleToTier(userRole);
    console.log('[subscriptionLimits] Mapped tier:', tier);
    const features = TIER_FEATURES[tier];
    console.log('[subscriptionLimits] Tier features:', features);
    
    // Get current usage
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('daily_super_likes, last_super_like_reset')
      .eq('id', userId)
      .single();
    
    console.log('[subscriptionLimits] Profile data:', profile, 'Error:', profileError);

    if (!profile || profileError) {
      console.error('[subscriptionLimits] Profile not found or error:', profileError);
      return { allowed: false, reason: 'User profile not accessible' };
    }

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    const lastReset = profile.last_super_like_reset?.split('T')[0];
    
    let currentUsage = profile.daily_super_likes || 0;
    
    if (lastReset !== today) {
      // Reset counter for new day
      currentUsage = 0;
    }

    // Check limits
    if (features.dailySuperlikes !== 999 && currentUsage >= features.dailySuperlikes) {
      return {
        allowed: false,
        reason: 'Daily super like limit reached',
        remainingUses: 0,
        upgradeRequired: true,
        suggestedTier: 'platinum'
      };
    }

    const remaining = features.dailySuperlikes === 999 ? 999 : features.dailySuperlikes - currentUsage;
    
    return {
      allowed: true,
      remainingUses: remaining
    };
  }

  getTierFeatures(userRole: string) {
    const tier = this.mapRoleToTier(userRole);
    return TIER_FEATURES[tier];
  }
}

export const subscriptionLimits = new SubscriptionLimitsService();