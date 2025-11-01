import { supabase } from '@/integrations/supabase/client';
import type {
  PerformRewindResponse,
  RewindActionInterface,
  SwipeActionType
} from '@/types/database';
import { ProfileWithSubscription } from '@/types/common';

export interface RewindResult {
  success: boolean;
  message: string;
  rewindId?: string;
  rewindedSwipe?: {
    target_user_id: string;
    direction: string;
    swiped_at: string;
  };
}

export interface RewindStats {
  canRewind: boolean;
  lastSwipe?: {
    target_user_id: string;
    direction: string;
    created_at: string;
  };
  reason?: string;
  hasRewindFeature: boolean;
  dailyRewindsUsed?: number;
  maxDailyRewinds?: number;
}

class RewindService {
  
  // Check if user can rewind
  async canUserRewind(userId: string): Promise<RewindStats> {
    try {
      // Check subscription tier - now properly synced with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, role')
        .eq('id', userId)
        .single();

      // Use subscription_tier as primary source, fallback to role for compatibility
      const tier = profile?.subscription_tier || profile?.role || 'registered';
      const hasFeature = this.hasTierAccess(tier);
      
      // Enhanced logging for debugging rewind issues
      console.log('[RewindService] User subscription check:', {
        userId,
        subscription_tier: profile?.subscription_tier,
        role: profile?.role,
        effective_tier: tier,
        hasRewindFeature: hasFeature
      });
      
      // Only Silver+ users can rewind
      if (!hasFeature) {
        return {
          canRewind: false,
          reason: 'Rewind özelliği Silver üyelik veya üstü gerektirir',
          hasRewindFeature: false
        };
      }

      // Get rewind limits based on tier
      // Note: Rewind usage is tracked via the perform_rewind RPC function
      const maxRewinds = this.getMaxRewindsForTier(tier);
      
      // For now, assume rewinds are unlimited for premium users
      // In a production system, you'd track this in the database
      const dailyRewinds = 0;

      // Check daily limits
      if (dailyRewinds >= maxRewinds && maxRewinds < 999) {
        return {
          canRewind: false,
          reason: `Günlük rewind limiti doldu (${dailyRewinds}/${maxRewinds})`,
          hasRewindFeature: true,
          dailyRewindsUsed: dailyRewinds,
          maxDailyRewinds: maxRewinds
        };
      }

      // Get the last swipe
      const { data: lastSwipe, error } = await supabase
        .from('swipes')
        .select('target_user_id, direction, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Last swipe query error:', error);
        return {
          canRewind: false,
          reason: 'Son swipe kontrol edilirken hata',
          hasRewindFeature: true
        };
      }

      if (!lastSwipe) {
        return {
          canRewind: false,
          reason: 'Geri alınacak yakın tarihli swipe yok',
          hasRewindFeature: true
        };
      }

      // Check if swipe is too old (24 hours)
      const swipeTime = new Date(lastSwipe.created_at);
      const now = new Date();
      const hoursSinceSwipe = (now.getTime() - swipeTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSwipe > 24) {
        return {
          canRewind: false,
          reason: 'Swipe geri alınamayacak kadar eski (max 24 saat)',
          lastSwipe,
          hasRewindFeature: true
        };
      }

      return {
        canRewind: true,
        lastSwipe,
        hasRewindFeature: true,
        dailyRewindsUsed: dailyRewinds,
        maxDailyRewinds: maxRewinds
      };

    } catch (error) {
      console.error('Can user rewind check failed:', error);
      return {
        canRewind: false,
        reason: 'Rewind izinleri kontrol edilirken hata',
        hasRewindFeature: false
      };
    }
  }

  // Get max rewinds for tier
  private getMaxRewindsForTier(tier: string): number {
    switch (tier) {
      case 'registered':
        return 0;
      case 'silver':
        return 1;
      case 'gold':
        return 3;
      case 'platinum':
        return 999; // unlimited
      case 'admin':
        return 999;
      default:
        return 0;
    }
  }

  // Perform rewind operation using database function
  async rewindLastSwipe(userId: string, targetUserId?: string): Promise<RewindResult> {
    try {
      console.log('[RewindService] Starting rewind for user:', userId, 'target:', targetUserId);
      
      // First check if rewind is possible
      const rewindCheck = await this.canUserRewind(userId);
      console.log('[RewindService] Rewind check result:', rewindCheck);
      
      if (!rewindCheck.canRewind) {
        console.log('[RewindService] Rewind blocked:', rewindCheck.reason);
        return {
          success: false,
          message: rewindCheck.reason || 'Rewind yapılamıyor'
        };
      }

      console.log('[RewindService] Rewind check passed, calling database function');

      // Target user is optional - if not provided, will rewind the last swipe

      // Use database function for rewind
      const { data, error } = await supabase.rpc('perform_rewind', {
        p_user_id: userId,
        p_target_user_id: targetUserId || ''
      });
      
      console.log('[RewindService] Database function response:', { data, error });

      if (error) {
        console.error('Rewind function error:', error);
        return {
          success: false,
          message: 'Rewind işlemi başarısız oldu'
        };
      }

      const result = data as unknown as PerformRewindResponse;
      
      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Rewind işlemi başarısız oldu'
        };
      }

      console.log('[RewindService] Rewind successful with details:', {
        rewindId: result.rewind_id,
        originalAction: result.original_action,
        targetUserId: result.target_user_id,
        notificationsDeleted: result.notifications_deleted,
        matchDeleted: result.match_deleted
      });

      return {
        success: true,
        rewindId: result.rewind_id,
        message: result.match_deleted 
          ? 'Swipe ve eşleşme başarıyla geri alındı! 🔄' 
          : 'Swipe başarıyla geri alındı! 🔄',
        rewindedSwipe: {
          target_user_id: result.target_user_id || targetUserId || '',
          direction: result.original_action || 'unknown',
          swiped_at: result.rewound_at || new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Rewind service error:', error);
      return {
        success: false,
        message: 'Rewind servisi hatası'
      };
    }
  }

  // Check if subscription tier has rewind access
  private hasTierAccess(tier: string): boolean {
    const tierLevels = {
      'registered': 0,
      'silver': 1,
      'gold': 2,
      'platinum': 3,
      'admin': 4
    };
    
    const currentLevel = tierLevels[tier as keyof typeof tierLevels] || 0;
    return currentLevel >= 1; // Silver+ required
  }

  // Get rewind statistics for user
  async getRewindStats(userId: string): Promise<RewindStats> {
    try {
      return await this.canUserRewind(userId);
    } catch (error) {
      console.error('Get rewind stats failed:', error);
      return {
        canRewind: false,
        reason: 'Rewind istatistikleri alınırken hata',
        hasRewindFeature: false
      };
    }
  }

  // Get rewind history for user
  async getRewindHistory(userId: string, limit: number = 10): Promise<RewindActionInterface[]> {
    try {
      const { data: rewinds, error } = await supabase
        .from('rewind_actions')
        .select(`
          *,
          target_profile:profiles!rewind_actions_target_user_id_fkey(
            id, name, photos
          )
        `)
        .eq('user_id', userId)
        .order('rewind_timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get rewind history error:', error);
        return [];
      }

      return (rewinds || []).map(rewind => ({
        ...rewind,
        action_type: rewind.action_type as SwipeActionType
      }));
    } catch (error) {
      console.error('Get rewind history failed:', error);
      return [];
    }
  }

  // Get rewind analytics for admin panel
  async getRewindAnalytics(startDate: Date, endDate: Date) {
    try {
      // Get rewind data from rewind_actions table
      const { data: rewinds, error } = await supabase
        .from('rewind_actions')
        .select(`
          action_type,
          rewind_timestamp,
          user_id,
          profiles!rewind_actions_user_id_fkey(subscription_tier)
        `)
        .gte('rewind_timestamp', startDate.toISOString())
        .lte('rewind_timestamp', endDate.toISOString());

      if (error) throw error;

      const analytics = {
        totalRewinds: rewinds?.length || 0,
        rewindsByTier: {} as Record<string, number>,
        rewindsByAction: {} as Record<string, number>,
        averageRewindsPerUser: 0,
        uniqueUsers: new Set(rewinds?.map(r => r.user_id) || []).size
      };

      // Group by tier and action
      rewinds?.forEach(rewind => {
        const tier = (rewind.profiles as ProfileWithSubscription)?.subscription_tier || 'registered';
        analytics.rewindsByTier[tier] = (analytics.rewindsByTier[tier] || 0) + 1;
        analytics.rewindsByAction[rewind.action_type] = (analytics.rewindsByAction[rewind.action_type] || 0) + 1;
      });

      analytics.averageRewindsPerUser = analytics.uniqueUsers > 0
        ? analytics.totalRewinds / analytics.uniqueUsers
        : 0;

      return analytics;
    } catch (error) {
      console.error('Get rewind analytics failed:', error);
      return null;
    }
  }

  // Subscribe to rewind notifications
  subscribeToRewindNotifications(userId: string, callback: (rewind: RewindActionInterface) => void) {
    return supabase
      .channel(`rewind_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rewind_actions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as RewindActionInterface);
        }
      )
      .subscribe();
  }
}

export const rewindService = new RewindService();