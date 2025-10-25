import { supabase } from '@/integrations/supabase/client';
import type {
  ActivateBoostResponse,
  ProfileBoostInterface,
  BoostType
} from '@/types/database';

export type { BoostType };

export interface BoostResult {
  success: boolean;
  boostId?: string;
  message: string;
  remainingBoosts?: number;
  endsAt?: string;
  durationMinutes?: number;
}

export interface BoostStats {
  dailyBoostsUsed: number; // Keep for compatibility, but this is actually monthly boosts
  maxDailyBoosts: number; // Keep for compatibility, but this is actually monthly boosts limit
  remainingBoosts: number;
  canBoost: boolean;
  subscriptionTier: string;
  activeBoost?: ProfileBoostInterface;
}

class BoostService {
  
  // Activate profile boost using direct database operations
  async activateBoost(
    boostType: BoostType = 'profile',
    durationMinutes: number = 30
  ): Promise<BoostResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'Kullanıcı doğrulanmadı' };
      }

      // First check if user can boost
      const canBoostResult = await this.canUserBoost(user.id);
      if (!canBoostResult.canBoost) {
        return {
          success: false,
          message: canBoostResult.reason || 'Boost kullanılamıyor'
        };
      }

      // Use unified direct approach (no RPC function dependency)
      return this.activateBoostDirect(user.id, boostType, durationMinutes);

    } catch (error) {
      console.error('Boost service error:', error);
      return { success: false, message: 'Boost servisi hatası' };
    }
  }

  // Direct boost activation method (unified approach)
  private async activateBoostDirect(
    userId: string,
    boostType: BoostType,
    durationMinutes: number
  ): Promise<BoostResult> {
    try {
      const endsAt = new Date();
      endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);

      // Deactivate any existing active boosts first
      await supabase
        .from('profile_boosts')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Create boost in profile_boosts table
      const { data: boost, error: boostError } = await supabase
        .from('profile_boosts')
        .insert({
          user_id: userId,
          boost_type: boostType,
          duration_minutes: durationMinutes,
          started_at: new Date().toISOString(),
          ends_at: endsAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (boostError) {
        console.error('Boost creation error:', boostError);
        return {
          success: false,
          message: 'Boost oluşturulamadı'
        };
      }

      // Update monthly boost usage in profiles table
      // monthly_boosts_used column doesn't exist - skipping this update
      // const { data: currentProfile } = await supabase
      //   .from('profiles')
      //   .select('monthly_boosts_used')
      //   .eq('id', userId)
      //   .single();
      
      // const currentMonthlyBoosts = currentProfile?.monthly_boosts_used || 0;
      
      // const { error: usageError } = await supabase
      //   .from('profiles')
      //   .update({
      //     monthly_boosts_used: currentMonthlyBoosts + 1 // Proper increment
      //   })
      //   .eq('id', userId);

      // if (usageError) {
        // Don't fail the boost activation, just log the warning
      // }

      return {
        success: true,
        boostId: boost.id,
        message: `Profilin ${durationMinutes} dakika boyunca boost edildi! 🚀`,
        remainingBoosts: await this.getRemainingBoosts(userId),
        endsAt: endsAt.toISOString(),
        durationMinutes: durationMinutes
      };
    } catch (error) {
      console.error('Boost direct activation error:', error);
      return {
        success: false,
        message: 'Boost aktivasyonu başarısız oldu'
      };
    }
  }

  // Legacy fallback method (kept for compatibility)
  private async activateBoostFallback(
    userId: string,
    boostType: BoostType,
    durationMinutes: number
  ): Promise<BoostResult> {
    return this.activateBoostDirect(userId, boostType, durationMinutes);
  }

  // Check if user can boost
  async canUserBoost(userId: string): Promise<{ canBoost: boolean; reason?: string; remainingBoosts?: number }> {
    try {
      // Validate input
      if (!userId) {
        return { canBoost: false, reason: 'invalid_user_id' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { canBoost: false, reason: 'not_authenticated' };
      }

      // Get user profile with subscription info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, daily_boosts_used')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return { canBoost: false, reason: 'profile_fetch_failed' };
      }

      if (!profile) {
        console.error('Profile not found for user:', userId);
        return { canBoost: false, reason: 'profile_not_found' };
      }

      const tier = profile.subscription_tier || 'registered';
      const limits = this.getBoostLimitsForTier(tier);
      
      // Get monthly boost usage from profile_boosts table
      const { count: boostCount } = await supabase
        .from('profile_boosts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      
      const monthlyBoosts = boostCount || 0;

      // Check if user has reached monthly limit
      if (monthlyBoosts >= limits.monthlyBoosts) {
        return {
          canBoost: false,
          reason: 'monthly_limit',
          remainingBoosts: 0
        };
      }

      // Check if user has an active boost
      const { data: activeBoost, error: activeBoostError } = await supabase
        .from('profile_boosts')
        .select('id, ends_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();

      if (activeBoostError) {
        console.error('Active boost check error:', activeBoostError);
        // Don't fail the entire check, just log the error
      }

      if (activeBoost) {
        return {
          canBoost: false,
          reason: 'active_boost_exists',
          remainingBoosts: Math.max(0, limits.monthlyBoosts - monthlyBoosts)
        };
      }

      return {
        canBoost: true,
        remainingBoosts: Math.max(0, limits.monthlyBoosts - monthlyBoosts)
      };

    } catch (error) {
      console.error('Can user boost check failed:', error);
      return { canBoost: false, reason: 'check_failed' };
    }
  }

  // Get remaining boosts for user
  async getRemainingBoosts(userId: string): Promise<number> {
    try {
      const canBoostResult = await this.canUserBoost(userId);
      return canBoostResult.remainingBoosts || 0;
    } catch (error) {
      console.error('Get remaining boosts failed:', error);
      return 0;
    }
  }

  // Get boost limits for subscription tier
  private getBoostLimitsForTier(tier: string) {
    switch (tier) {
      case 'registered':
        return { monthlyBoosts: 0, boostDuration: 0 };
      case 'silver':
        return { monthlyBoosts: 1, boostDuration: 30 };
      case 'gold':
        return { monthlyBoosts: 3, boostDuration: 60 };
      case 'platinum':
        return { monthlyBoosts: 10, boostDuration: 120 };
      case 'admin':
      case 'moderator':
        return { monthlyBoosts: 999, boostDuration: 240 };
      default:
        return { monthlyBoosts: 0, boostDuration: 0 };
    }
  }

  // Get boost statistics for user dashboard
  async getUserBoostStats(userId: string): Promise<BoostStats | null> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, subscription_tier')
        .eq('id', userId)
        .single();

      if (!profile) return null;

      // Get usage data
      const { data: usageData } = await supabase.rpc('get_user_usage', {
        p_user_id: userId
      });
      
      const usage = Array.isArray(usageData) && usageData.length > 0 ? usageData[0] : null;

      // Use subscription_tier first, then role as fallback
      const tier = profile?.subscription_tier || profile?.role || 'registered';
      const monthlyBoosts = (usage && typeof usage === 'object' && 'monthly_boosts_used' in usage) 
        ? (usage.monthly_boosts_used as number) || 0 
        : 0;
      const limits = this.getBoostLimitsForTier(tier);

      // Get active boost
      const { data: activeBoost } = await supabase
        .from('profile_boosts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();

      return {
        dailyBoostsUsed: monthlyBoosts, // Keep property name for compatibility
        maxDailyBoosts: limits.monthlyBoosts, // Keep property name for compatibility
        remainingBoosts: Math.max(0, limits.monthlyBoosts - monthlyBoosts),
        canBoost: monthlyBoosts < limits.monthlyBoosts && !activeBoost,
        subscriptionTier: tier,
        activeBoost: activeBoost ? {
          ...activeBoost,
          boost_type: activeBoost.boost_type as BoostType
        } : undefined
      };
    } catch (error) {
      console.error('Get user boost stats failed:', error);
      return null;
    }
  }

  // Get active boost for user
  async getActiveBoost(userId: string): Promise<ProfileBoostInterface | null> {
    try {
      const { data: activeBoost } = await supabase
        .from('profile_boosts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .maybeSingle();

      return activeBoost ? {
        ...activeBoost,
        boost_type: activeBoost.boost_type as BoostType
      } : null;
    } catch (error) {
      console.error('Get active boost failed:', error);
      return null;
    }
  }

  // End active boost
  async endBoost(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profile_boosts')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('End boost error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('End boost failed:', error);
      return false;
    }
  }

  // Get boost analytics for admin panel
  async getBoostAnalytics(startDate: Date, endDate: Date) {
    try {
      // Get boost usage from feature_usage_logs
      const { data: boostLogs, error } = await supabase
        .from('feature_usage_logs')
        .select('user_id, usage_count, subscription_tier')
        .eq('feature_name', 'boost')
        .gte('usage_date', startDate.toISOString().split('T')[0])
        .lte('usage_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const analytics = {
        totalBoosts: boostLogs?.reduce((sum, log) => sum + (log.usage_count || 0), 0) || 0,
        boostsByTier: {} as Record<string, number>,
        averageBoostsPerUser: 0,
        uniqueUsers: new Set(boostLogs?.map(log => log.user_id) || []).size
      };

      // Group by tier
      boostLogs?.forEach(log => {
        const tier = log.subscription_tier || 'registered';
        analytics.boostsByTier[tier] = (analytics.boostsByTier[tier] || 0) + (log.usage_count || 0);
      });

      analytics.averageBoostsPerUser = analytics.uniqueUsers > 0
        ? analytics.totalBoosts / analytics.uniqueUsers
        : 0;

      return analytics;
    } catch (error) {
      console.error('Get boost analytics failed:', error);
      return null;
    }
  }

  // Subscribe to boost notifications
  subscribeToBoostNotifications(userId: string, callback: (boost: ProfileBoostInterface) => void) {
    return supabase
      .channel(`boost_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_boosts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const boost = payload.new as any;
          if (boost) {
            callback({
              id: boost.id,
              user_id: boost.user_id,
              boost_type: boost.boost_type as BoostType,
              duration_minutes: boost.duration_minutes,
              started_at: boost.started_at,
              ends_at: boost.ends_at,
              is_active: boost.is_active,
              created_at: boost.created_at,
              updated_at: boost.updated_at || boost.created_at
            });
          }
        }
      )
      .subscribe();
  }
}

export const boostService = new BoostService();