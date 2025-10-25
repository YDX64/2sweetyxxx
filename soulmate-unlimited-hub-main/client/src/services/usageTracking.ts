import { supabase } from '@/integrations/supabase/client';
import { FeatureUsageLogInsert, FeatureName } from '@/types/database';

export interface UsageLimits {
  dailyLikes: number;
  dailySuperlikes: number;
  dailyBoosts: number;
  dailyRewinds: number;
  maxDailyLikes: number;
  maxDailySuperlikes: number;
  maxDailyBoosts: number;
  maxDailyRewinds: number;
  canUseFeature: boolean;
}

class UsageTrackingService {
  
  // Track feature usage using the database function
  async trackUsage(
    featureName: FeatureName,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user found for usage tracking');
        return false;
      }

      // Get current subscription tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      // Use the database function
      const { error } = await supabase.rpc('track_feature_usage', {
        p_user_id: user.id,
        p_feature_name: featureName,
        p_subscription_tier: profile?.subscription_tier || 'registered'
      });

      if (error) {
        console.error('Usage tracking error:', error);
        return false;
      }

      // Also log to user_activities for detailed tracking
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: `feature_used_${featureName}`,
          activity_data: metadata || {}
        });

      return true;
    } catch (error) {
      console.error('Usage tracking failed:', error);
      return false;
    }
  }

  // Get daily usage for specific feature
  async getDailyUsage(
    userId: string,
    featureName: FeatureName,
    date?: Date
  ): Promise<number> {
    try {
      const targetDate = date || new Date();
      const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      const { data, error } = await supabase
        .from('feature_usage_logs')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('feature_name', featureName)
        .eq('usage_date', dateString)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Daily usage query error:', error);
        return 0;
      }

      return data?.usage_count || 0;
    } catch (error) {
      console.error('Get daily usage failed:', error);
      return 0;
    }
  }

  // Get monthly usage for specific feature
  async getMonthlyUsage(
    userId: string,
    featureName: FeatureName,
    date?: Date
  ): Promise<number> {
    try {
      const targetDate = date || new Date();
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      
      const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('feature_usage_logs')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('feature_name', featureName)
        .gte('usage_date', startOfMonth)
        .lte('usage_date', endOfMonth);

      if (error) {
        console.error('Monthly usage query error:', error);
        return 0;
      }

      return data?.reduce((sum, record) => sum + (record.usage_count || 0), 0) || 0;
    } catch (error) {
      console.error('Get monthly usage failed:', error);
      return 0;
    }
  }

  // Check if user can use feature based on limits
  async canUseFeature(
    userId: string,
    featureName: FeatureName,
    subscriptionTier: string
  ): Promise<boolean> {
    try {
      const today = new Date();
      
      switch (featureName) {
        case 'boost': {
          const dailyBoosts = await this.getDailyUsage(userId, 'boost', today);
          const maxBoosts = this.getDailyBoostLimitForTier(subscriptionTier);
          return dailyBoosts < maxBoosts;
        }
        
        case 'super_like': {
          const dailySuperlikes = await this.getDailyUsage(userId, 'super_like', today);
          const maxSuperlikes = this.getDailySuperlikeLimitForTier(subscriptionTier);
          return dailySuperlikes < maxSuperlikes;
        }
        
        case 'rewind': {
          const dailyRewinds = await this.getDailyUsage(userId, 'rewind', today);
          const maxRewinds = this.getDailyRewindLimitForTier(subscriptionTier);
          return dailyRewinds < maxRewinds;
        }
        
        default: {
          // For other features, check if tier has access
          return this.hasTierAccess(subscriptionTier, featureName);
        }
      }
    } catch (error) {
      console.error('Can use feature check failed:', error);
      return false;
    }
  }

  // Get comprehensive usage stats for user
  async getUserUsageStats(userId: string): Promise<UsageLimits> {
    try {
      const today = new Date();
      
      const [dailyBoosts, dailySuperlikes, dailyRewinds] = await Promise.all([
        this.getDailyUsage(userId, 'boost', today),
        this.getDailyUsage(userId, 'super_like', today),
        this.getDailyUsage(userId, 'rewind', today)
      ]);

      // Get user's subscription tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, daily_likes_used')
        .eq('id', userId)
        .single();

      const tier = profile?.subscription_tier || 'registered';
      
      return {
        dailyLikes: profile?.daily_likes_used || 0,
        dailySuperlikes: dailySuperlikes,
        dailyBoosts: dailyBoosts,
        dailyRewinds: dailyRewinds,
        maxDailyLikes: this.getDailyLikeLimitForTier(tier),
        maxDailySuperlikes: this.getDailySuperlikeLimitForTier(tier),
        maxDailyBoosts: this.getDailyBoostLimitForTier(tier),
        maxDailyRewinds: this.getDailyRewindLimitForTier(tier),
        canUseFeature: true // This will be calculated per feature
      };
    } catch (error) {
      console.error('Get usage stats failed:', error);
      return {
        dailyLikes: 0,
        dailySuperlikes: 0,
        dailyBoosts: 0,
        dailyRewinds: 0,
        maxDailyLikes: 10,
        maxDailySuperlikes: 1,
        maxDailyBoosts: 0,
        maxDailyRewinds: 0,
        canUseFeature: false
      };
    }
  }

  // Helper methods for tier limits
  private getDailyLikeLimitForTier(tier: string): number {
    switch (tier) {
      case 'free':
      case 'registered': return 10;
      case 'silver': return 50;
      case 'gold': return 100;
      case 'platinum': return 999;
      case 'admin': return 999;
      default: return 10;
    }
  }

  private getDailySuperlikeLimitForTier(tier: string): number {
    switch (tier) {
      case 'free':
      case 'registered': return 1;
      case 'silver': return 5;
      case 'gold': return 10;
      case 'platinum': return 25;
      case 'admin': return 999;
      default: return 1;
    }
  }

  private getDailyBoostLimitForTier(tier: string): number {
    switch (tier) {
      case 'free':
      case 'registered': return 0;
      case 'silver': return 1;
      case 'gold': return 3;
      case 'platinum': return 5;
      case 'admin': return 999;
      default: return 0;
    }
  }

  private getDailyRewindLimitForTier(tier: string): number {
    switch (tier) {
      case 'free':
      case 'registered': return 0;
      case 'silver': return 1;
      case 'gold': return 3;
      case 'platinum': return 999; // unlimited
      case 'admin': return 999;
      default: return 0;
    }
  }

  private hasTierAccess(tier: string, feature: FeatureName): boolean {
    const tierLevel = this.getTierLevel(tier);
    const requiredLevel = this.getRequiredLevelForFeature(feature);
    return tierLevel >= requiredLevel;
  }

  private getTierLevel(tier: string): number {
    switch (tier) {
      case 'free':
      case 'registered': return 0;
      case 'silver': return 1;
      case 'gold': return 2;
      case 'platinum': return 3;
      case 'admin': return 4;
      default: return 0;
    }
  }

  private getRequiredLevelForFeature(feature: FeatureName): number {
    switch (feature) {
      case 'super_like':
        return 0; // Available to all
      
      case 'boost':
      case 'rewind':
      case 'see_who_likes_you':
      case 'advanced_filters':
        return 1; // Silver+
      
      case 'passport':
      case 'video_profile':
      case 'read_receipts':
      case 'invisible_browsing':
        return 2; // Gold+
      
      case 'voice_call':
      case 'video_call':
      case 'translation':
        return 2; // Gold+
      
      case 'unlimited_likes':
        return 1; // Silver+
      
      default:
        return 0;
    }
  }

  // Get usage analytics for admin panel
  async getUsageAnalytics(startDate: Date, endDate: Date) {
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('feature_usage_logs')
        .select(`
          feature_name,
          subscription_tier,
          usage_count,
          usage_date
        `)
        .gte('usage_date', startDateStr)
        .lte('usage_date', endDateStr);

      if (error) throw error;

      // Group by feature name and tier
      const analytics = data?.reduce((acc, record) => {
        const key = `${record.feature_name}_${record.subscription_tier || 'unknown'}`;
        acc[key] = (acc[key] || 0) + (record.usage_count || 0);
        return acc;
      }, {} as Record<string, number>);

      return analytics || {};
    } catch (error) {
      console.error('Usage analytics failed:', error);
      return {};
    }
  }

  // Get feature usage statistics
  async getFeatureUsageStats(
    userId: string,
    featureName: FeatureName,
    days: number = 30
  ) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('feature_usage_logs')
        .select('usage_count, usage_date')
        .eq('user_id', userId)
        .eq('feature_name', featureName)
        .gte('usage_date', startDateStr)
        .lte('usage_date', endDateStr)
        .order('usage_date', { ascending: true });

      if (error) throw error;

      const totalUsage = data?.reduce((sum, record) => sum + (record.usage_count || 0), 0) || 0;
      const averageDaily = days > 0 ? totalUsage / days : 0;

      return {
        total_usage: totalUsage,
        average_daily: Math.round(averageDaily * 100) / 100,
        usage_by_date: data || []
      };
    } catch (error) {
      console.error('Feature usage stats failed:', error);
      return {
        total_usage: 0,
        average_daily: 0,
        usage_by_date: []
      };
    }
  }

  // Clean old usage logs (run periodically)
  async cleanOldUsageLogs(daysToKeep: number = 365): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from('feature_usage_logs')
        .delete()
        .lt('usage_date', cutoffDateStr);

      if (error) {
        console.error('Clean old usage logs error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Clean old usage logs failed:', error);
      return false;
    }
  }
}

export const usageTrackingService = new UsageTrackingService();