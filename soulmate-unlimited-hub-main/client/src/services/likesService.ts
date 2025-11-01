import { supabase } from '@/integrations/supabase/client';
import { ProfileWithSubscription, LikeNotificationCallback, MatchNotificationCallback, ProfileUpdateData } from '@/types/common';

export interface LikeAction {
  id: string;
  user_id: string;
  target_user_id: string;
  direction: 'left' | 'right';
  created_at: string;
  is_super_like?: boolean;
}

export interface LikeResult {
  success: boolean;
  message: string;
  isMatch?: boolean;
  matchId?: string;
}

export interface LikeStats {
  dailyLikesUsed: number;
  maxDailyLikes: number;
  remainingLikes: number;
  superLikesUsed: number;
  maxSuperLikes: number;
  canLike: boolean;
  canSuperLike: boolean;
}

export interface UserLike {
  id: string;
  target_user_id: string;
  direction: 'left' | 'right';
  created_at: string;
  is_super_like: boolean;
  target_profile: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    bio: string;
    location: string;
  };
}

class LikesService {
  
  // Like a user (swipe right)
  async likeUser(userId: string, targetUserId: string, isSuperLike: boolean = false): Promise<LikeResult> {
    try {
      if (import.meta.env.DEV) {
        console.log('[LikesService] Starting likeUser:', { userId, targetUserId, isSuperLike });
      }
      
      // Check auth session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (import.meta.env.DEV) {
        console.log('[LikesService] Auth session check:', { 
          hasSession: !!session,
          sessionError,
          userId: session?.user?.id,
          accessTokenLength: session?.access_token?.length 
        });
      }
      
      if (!session || sessionError) {
        console.error('[LikesService] No valid session:', sessionError);
        
        // Try to refresh the session
        if (import.meta.env.DEV) {
          console.log('[LikesService] Attempting to refresh session...');
        }
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshedSession || refreshError) {
          console.error('[LikesService] Session refresh failed:', refreshError);
          return {
            success: false,
            message: 'Kullanıcı oturumu geçersiz. Lütfen tekrar giriş yapın.'
          };
        }
        
        if (import.meta.env.DEV) {
          console.log('[LikesService] Session refreshed successfully');
        }
      }
      
      // Validate input parameters
      if (!userId || !targetUserId) {
        return {
          success: false,
          message: 'Geçersiz kullanıcı bilgileri'
        };
      }

      if (userId === targetUserId) {
        return {
          success: false,
          message: 'Kendinizi beğenemezsiniz'
        };
      }

      // Check if user can like
      const stats = await this.getLikeStats(userId);
      
      if (!stats.canLike && !isSuperLike) {
        return {
          success: false,
          message: 'Günlük beğeni limitiniz doldu'
        };
      }

      if (isSuperLike && !stats.canSuperLike) {
        return {
          success: false,
          message: 'Süper beğeni limitiniz doldu'
        };
      }

      // Check if already swiped
      const { data: existingSwipe, error: checkError } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing swipe:', checkError);
        return {
          success: false,
          message: 'Beğeni kontrolü yapılamadı'
        };
      }

      if (existingSwipe) {
        return {
          success: false,
          message: 'Bu kullanıcıyı zaten değerlendirdiniz'
        };
      }

      // Use transaction-like approach for data consistency
      let swipeCreated = false;
      let superLikeCreated = false;
      let matchCreated = false;
      let matchId: string | undefined;

      try {
        // Create swipe record with enhanced error logging
        if (import.meta.env.DEV) {
          console.log('[LikesService] Creating swipe:', { userId, targetUserId, direction: 'right' });
        }
        
        const { error: swipeError } = await supabase
          .from('swipes')
          .insert({
            user_id: userId,
            target_user_id: targetUserId,
            direction: 'right'
          });

        if (swipeError) {
          console.error('[LikesService] Swipe creation error:', {
            error: swipeError,
            code: swipeError.code,
            message: swipeError.message,
            details: swipeError.details,
            hint: swipeError.hint
          });
          
          // Log detailed swipe creation error
          import('@/services/logService').then(({ logService }) => {
            logService.error('DATABASE', 'Swipe creation failed', {
              error: swipeError.message,
              code: swipeError.code,
              details: swipeError.details,
              hint: swipeError.hint,
              swipeData: {
                user_id: userId,
                target_user_id: targetUserId,
                direction: 'right'
              },
              isRLSError: swipeError.message?.includes('RLS') || swipeError.message?.includes('policy'),
              isConstraintError: swipeError.message?.includes('constraint'),
              isDuplicateError: swipeError.message?.includes('duplicate') || swipeError.message?.includes('already exists'),
              isPolicyError: swipeError.message?.includes('insufficient privilege'),
              timestamp: new Date().toISOString()
            });
          });
          
          return {
            success: false,
            message: 'Beğeni kaydedilemedi: ' + (swipeError.message || 'Bilinmeyen hata')
          };
        }
        swipeCreated = true;

        // Create super like record if needed
        if (isSuperLike) {
          const { error: superLikeError } = await supabase
            .from('super_likes')
            .insert({
              user_id: userId,
              target_user_id: targetUserId
            });

          if (superLikeError) {
            console.error('Super like creation error:', superLikeError);
            
            // Log detailed SuperLike creation error
            import('@/services/logService').then(({ logService }) => {
              logService.error('DATABASE', 'SuperLike creation failed', {
                error: superLikeError.message,
                code: superLikeError.code,
                details: superLikeError.details,
                hint: superLikeError.hint,
                superLikeData: {
                  user_id: userId,
                  target_user_id: targetUserId
                },
                isRLSError: superLikeError.message?.includes('RLS') || superLikeError.message?.includes('policy'),
                isConstraintError: superLikeError.message?.includes('constraint'),
                isDuplicateError: superLikeError.message?.includes('duplicate') || superLikeError.message?.includes('already exists'),
                isPolicyError: superLikeError.message?.includes('insufficient privilege'),
                isConflictError: superLikeError.code === '23505',
                timestamp: new Date().toISOString()
              });
            });
            
            // Don't fail the entire operation for super like error
          } else {
            superLikeCreated = true;
          }
        }

        // Update daily counters
        await this.updateDailyCounters(userId, isSuperLike && superLikeCreated);

        // Check for match
        const { data: theirSwipe, error: matchCheckError } = await supabase
          .from('swipes')
          .select('id')
          .eq('user_id', targetUserId)
          .eq('target_user_id', userId)
          .eq('direction', 'right')
          .maybeSingle();

        if (matchCheckError) {
          console.error('Match check error:', matchCheckError);
          // Continue without match check
        } else if (theirSwipe) {
          // It's a match!
          const { data: match, error: matchError } = await supabase
            .from('matches')
            .insert({
              user1_id: userId,
              user2_id: targetUserId
            })
            .select()
            .single();

          if (matchError) {
            console.error('Match creation error:', matchError);
            // Don't fail the like operation if match creation fails
          } else {
            matchCreated = true;
            matchId = match.id;
          }
        }

        // Track feature usage (non-critical)
        try {
          await this.trackFeatureUsage(userId, isSuperLike ? 'super_like' : 'like');
        } catch (trackingError) {
          console.warn('Feature usage tracking failed:', trackingError);
          // Don't fail the operation for tracking errors
        }

        // Return success result
        if (matchCreated) {
          return {
            success: true,
            isMatch: true,
            message: 'Eşleştiniz! 🎉',
            matchId: matchId
          };
        }

        return {
          success: true,
          message: isSuperLike && superLikeCreated ? 'Süper beğeni gönderildi! 💫' : 'Beğenildi! ❤️'
        };

      } catch (operationError) {
        console.error('Like operation error:', operationError);
        return {
          success: false,
          message: 'Beğeni işlemi sırasında hata oluştu'
        };
      }

    } catch (error) {
      console.error('Like user error:', error);
      return {
        success: false,
        message: 'Beğeni işlemi başarısız oldu'
      };
    }
  }

  // Dislike a user (swipe left)
  async dislikeUser(userId: string, targetUserId: string): Promise<LikeResult> {
    try {
      // Check if already swiped
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();

      if (existingSwipe) {
        return {
          success: false,
          message: 'Bu kullanıcıyı zaten değerlendirdiniz'
        };
      }

      // Create swipe record
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          direction: 'left'
        });

      if (swipeError) {
        console.error('Dislike creation error:', swipeError);
        return {
          success: false,
          message: 'Değerlendirme kaydedilemedi'
        };
      }

      return {
        success: true,
        message: 'Geçildi'
      };

    } catch (error) {
      console.error('Dislike user error:', error);
      return {
        success: false,
        message: 'İşlem başarısız oldu'
      };
    }
  }

  // Get user's like statistics
  async getLikeStats(userId: string): Promise<LikeStats> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, daily_likes_used, daily_super_likes_used')
        .eq('id', userId)
        .single();

      if (!profile) {
        return {
          dailyLikesUsed: 0,
          maxDailyLikes: 0,
          remainingLikes: 0,
          superLikesUsed: 0,
          maxSuperLikes: 0,
          canLike: false,
          canSuperLike: false
        };
      }

      const tier = profile.subscription_tier || 'registered';
      const limits = this.getLimitsForTier(tier);
      
      const dailyLikes = profile.daily_likes_used || 0;
      const superLikes = profile.daily_super_likes_used || 0;

      return {
        dailyLikesUsed: dailyLikes,
        maxDailyLikes: limits.dailyLikes,
        remainingLikes: Math.max(0, limits.dailyLikes - dailyLikes),
        superLikesUsed: superLikes,
        maxSuperLikes: limits.dailySuperLikes,
        canLike: dailyLikes < limits.dailyLikes,
        canSuperLike: superLikes < limits.dailySuperLikes
      };

    } catch (error) {
      console.error('Get like stats error:', error);
      return {
        dailyLikesUsed: 0,
        maxDailyLikes: 0,
        remainingLikes: 0,
        superLikesUsed: 0,
        maxSuperLikes: 0,
        canLike: false,
        canSuperLike: false
      };
    }
  }

  // Get user's like history
  async getLikeHistory(userId: string, limit: number = 20, offset: number = 0): Promise<UserLike[]> {
    try {
      const { data: likes, error } = await supabase
        .from('swipes')
        .select(`
          id,
          target_user_id,
          direction,
          created_at,
          target_profile:profiles!swipes_target_user_id_fkey(
            id, name, age, photos, bio, location
          )
        `)
        .eq('user_id', userId)
        .eq('direction', 'right')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Get like history error:', error);
        return [];
      }

      // Get super likes separately
      const { data: superLikes } = await supabase
        .from('super_likes')
        .select('target_user_id')
        .eq('user_id', userId);

      const superLikeIds = new Set(superLikes?.map(sl => sl.target_user_id) || []);

      return (likes || []).map(like => ({
        id: like.id,
        target_user_id: like.target_user_id,
        direction: like.direction as 'left' | 'right',
        created_at: like.created_at,
        is_super_like: superLikeIds.has(like.target_user_id),
        target_profile: {
          id: (like.target_profile as ProfileWithSubscription).id,
          name: (like.target_profile as ProfileWithSubscription).name || 'İsimsiz',
          age: (like.target_profile as ProfileWithSubscription).age || 0,
          photos: (like.target_profile as ProfileWithSubscription).photos || [],
          bio: (like.target_profile as ProfileWithSubscription).bio || '',
          location: (like.target_profile as ProfileWithSubscription).location || ''
        }
      }));

    } catch (error) {
      console.error('Get like history error:', error);
      return [];
    }
  }

  // Update daily counters
  private async updateDailyCounters(userId: string, isSuperLike: boolean): Promise<void> {
    try {
      // Get current values first
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_likes_used, daily_super_likes_used')
        .eq('id', userId)
        .single();

      if (!profile) return;

      const updates: ProfileUpdateData = {
        daily_likes_used: (profile.daily_likes_used || 0) + 1
      };

      if (isSuperLike) {
        updates.daily_super_likes_used = (profile.daily_super_likes_used || 0) + 1;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Update daily counters error:', error);
      }
    } catch (error) {
      console.error('Update daily counters failed:', error);
    }
  }

  // Get limits for subscription tier
  private getLimitsForTier(tier: string) {
    switch (tier) {
      case 'registered':
        return { dailyLikes: 10, dailySuperLikes: 0 };
      case 'silver':
        return { dailyLikes: 50, dailySuperLikes: 5 };
      case 'gold':
        return { dailyLikes: 999, dailySuperLikes: 5 };
      case 'platinum':
        return { dailyLikes: 999, dailySuperLikes: 999 };
      case 'admin':
        return { dailyLikes: 999, dailySuperLikes: 999 };
      default:
        return { dailyLikes: 10, dailySuperLikes: 0 };
    }
  }

  // Track feature usage
  private async trackFeatureUsage(userId: string, featureName: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_feature_usage', {
        p_user_id: userId,
        p_feature_name: featureName
      });

      if (error) {
        console.error('Feature usage tracking error:', error);
      }
    } catch (error) {
      console.error('Feature usage tracking failed:', error);
    }
  }

  // Subscribe to new likes notifications
  subscribeToLikeNotifications(userId: string, callback: LikeNotificationCallback) {
    return supabase
      .channel(`like_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `target_user_id=eq.${userId}&&direction=eq.right`
        },
        (payload) => {
          callback(payload.new as { id: string; user_id: string; target_user_id: string; created_at: string; });
        }
      )
      .subscribe();
  }

  // Subscribe to match notifications
  subscribeToMatchNotifications(userId: string, callback: MatchNotificationCallback) {
    return supabase
      .channel(`match_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as { id: string; user1_id: string; user2_id: string; created_at: string; });
        }
      )
      .subscribe();
  }
}

export const likesService = new LikesService();