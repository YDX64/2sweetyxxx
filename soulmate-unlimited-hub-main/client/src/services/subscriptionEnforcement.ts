import { supabase } from '@/integrations/supabase/client';
import { TIER_FEATURES, type SubscriptionTier } from '@/types/subscription';
import { ProfileUpdateData } from '@/types/common';

export interface DailyUsage {
  likesUsed: number;
  superLikesUsed: number;
  boostsUsed: number;
  lastResetDate: string;
}

export interface ActionResult {
  allowed: boolean;
  reason?: string;
  remainingUses?: number;
  upgradeRequired?: boolean;
  suggestedTier?: string;
}

class SubscriptionEnforcementService {
  private userTier: SubscriptionTier = 'registered';
  private dailyUsage: DailyUsage = {
    likesUsed: 0,
    superLikesUsed: 0,
    boostsUsed: 0,
    lastResetDate: new Date().toISOString().split('T')[0]
  };

  async initialize(userId: string): Promise<void> {
    try {
      // Get user's subscription tier and usage data - now checking both fields
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, subscription_tier, daily_likes_used, daily_super_likes_used, daily_boosts_used, last_like_reset_date')
        .eq('id', userId)
        .single();

      if (profile) {
        // Use subscription_tier as primary source, fallback to role
        const tierFromProfile = profile.subscription_tier || profile.role || 'registered';
        
        // Map to ensure valid tier
        const validTiers: SubscriptionTier[] = ['registered', 'silver', 'gold', 'platinum', 'admin'];
        this.userTier = validTiers.includes(tierFromProfile as SubscriptionTier) 
          ? tierFromProfile as SubscriptionTier 
          : 'registered';
        
        // Log mismatches for debugging
        if (profile.subscription_tier && profile.role && profile.subscription_tier !== profile.role) {
          console.warn('Tier mismatch detected:', {
            subscription_tier: profile.subscription_tier,
            role: profile.role,
            userId
          });
        }
        
        // Check if we need to reset daily counts
        const today = new Date().toISOString().split('T')[0];
        const lastReset = profile.last_like_reset_date?.split('T')[0];
        
        if (lastReset !== today) {
          // Reset daily counters
          await this.resetDailyCounters(userId);
          this.dailyUsage = {
            likesUsed: 0,
            superLikesUsed: 0,
            boostsUsed: 0,
            lastResetDate: today
          };
        } else {
          this.dailyUsage = {
            likesUsed: profile.daily_likes_used || 0,
            superLikesUsed: profile.daily_super_likes_used || 0,
            boostsUsed: profile.daily_boosts_used || 0,
            lastResetDate: lastReset || today
          };
        }
      }
    } catch (error) {
      console.error('Failed to initialize subscription enforcement:', error);
    }
  }

  private async resetDailyCounters(userId: string): Promise<void> {
    const today = new Date().toISOString();
    
    await supabase
      .from('profiles')
      .update({
        daily_likes_used: 0,
        daily_super_likes_used: 0,
        daily_boosts_used: 0,
        last_like_reset_date: today
      } as ProfileUpdateData)
      .eq('id', userId);
  }

  async canPerformLike(): Promise<ActionResult> {
    const features = TIER_FEATURES[this.userTier];
    const remaining = features.dailyLikes - this.dailyUsage.likesUsed;

    if (features.dailyLikes === 999) {
      return { allowed: true, remainingUses: 999 };
    }

    if (remaining <= 0) {
      return {
        allowed: false,
        reason: 'limit.daily.likes',
        remainingUses: 0,
        upgradeRequired: true,
        suggestedTier: this.userTier === 'registered' ? 'silver' : 'gold'
      };
    }

    return { allowed: true, remainingUses: remaining };
  }

  async canPerformSuperLike(): Promise<ActionResult> {
    const features = TIER_FEATURES[this.userTier];
    const remaining = features.dailySuperlikes - this.dailyUsage.superLikesUsed;

    if (features.dailySuperlikes === 999) {
      return { allowed: true, remainingUses: 999 };
    }

    if (remaining <= 0) {
      return {
        allowed: false,
        reason: 'limit.daily.superLikes',
        remainingUses: 0,
        upgradeRequired: true,
        suggestedTier: this.userTier === 'registered' ? 'silver' : 'platinum'
      };
    }

    return { allowed: true, remainingUses: remaining };
  }

  async canPerformBoost(): Promise<ActionResult> {
    const features = TIER_FEATURES[this.userTier];
    const remaining = features.monthlyBoosts - this.dailyUsage.boostsUsed;

    if (features.monthlyBoosts === 999) {
      return { allowed: true, remainingUses: 999 };
    }

    if (remaining <= 0) {
      return {
        allowed: false,
        reason: 'limit.monthly.boosts',
        remainingUses: 0,
        upgradeRequired: true,
        suggestedTier: 'platinum'
      };
    }

    return { allowed: true, remainingUses: remaining };
  }

  async canAccessFeature(feature: keyof typeof TIER_FEATURES.registered): Promise<ActionResult> {
    const features = TIER_FEATURES[this.userTier];
    const hasAccess = features[feature];

    if (!hasAccess) {
      const suggestedTiers = {
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
        reason: `feature.requires.${suggestedTiers[feature as keyof typeof suggestedTiers] || 'gold'}`,
        upgradeRequired: true,
        suggestedTier: suggestedTiers[feature as keyof typeof suggestedTiers] || 'silver'
      };
    }

    return { allowed: true };
  }

  async recordLikeUsage(userId: string): Promise<void> {
    this.dailyUsage.likesUsed++;
    
    await supabase
      .from('profiles')
      .update({ daily_likes_used: this.dailyUsage.likesUsed })
      .eq('id', userId);
  }

  async recordSuperLikeUsage(userId: string): Promise<void> {
    this.dailyUsage.superLikesUsed++;
    
    await supabase
      .from('profiles')
      .update({ daily_super_likes_used: this.dailyUsage.superLikesUsed })
      .eq('id', userId);
  }

  async recordBoostUsage(userId: string): Promise<void> {
    this.dailyUsage.boostsUsed++;
    
    await supabase
      .from('profiles')
      .update({ daily_boosts_used: this.dailyUsage.boostsUsed })
      .eq('id', userId);
  }

  getDailyUsage(): DailyUsage {
    return { ...this.dailyUsage };
  }

  getUserTier(): SubscriptionTier {
    return this.userTier;
  }

  getUserFeatures() {
    return TIER_FEATURES[this.userTier];
  }

  getRemainingLikes(): number {
    const features = TIER_FEATURES[this.userTier];
    if (features.dailyLikes === 999) return 999;
    return Math.max(0, features.dailyLikes - this.dailyUsage.likesUsed);
  }

  getRemainingSuperLikes(): number {
    const features = TIER_FEATURES[this.userTier];
    if (features.dailySuperlikes === 999) return 999;
    return Math.max(0, features.dailySuperlikes - this.dailyUsage.superLikesUsed);
  }

  getRemainingBoosts(): number {
    const features = TIER_FEATURES[this.userTier];
    if (features.monthlyBoosts === 999) return 999;
    return Math.max(0, features.monthlyBoosts - this.dailyUsage.boostsUsed);
  }
}

// Singleton instance
export const subscriptionEnforcement = new SubscriptionEnforcementService();