import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SwipeResult {
  success: boolean;
  message: string;
  isMatch?: boolean;
  matchId?: string;
}

export interface SwipeConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Shared swipe service for both web and mobile platforms
 * Uses the same database and logic for consistency
 */
export class SharedSwipeService {
  private supabase: SupabaseClient;

  constructor(config: SwipeConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  /**
   * Like a user (swipe right) - unified logic for web and mobile
   */
  async likeUser(userId: string, targetUserId: string, isSuperLike: boolean = false): Promise<SwipeResult> {
    try {
      // Check auth session
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      if (!session || sessionError) {
        return {
          success: false,
          message: 'User session invalid'
        };
      }

      // Validate parameters
      if (!userId || !targetUserId || userId === targetUserId) {
        return {
          success: false,
          message: 'Invalid user parameters'
        };
      }

      // Check if already swiped
      const { data: existingSwipe, error: checkError } = await this.supabase
        .from('swipes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();

      if (checkError) {
        return {
          success: false,
          message: 'Failed to check swipe status'
        };
      }

      if (existingSwipe) {
        return {
          success: false,
          message: 'Already swiped on this user'
        };
      }

      // Create swipe record
      const { error: swipeError } = await this.supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          direction: 'right'
        });

      if (swipeError) {
        return {
          success: false,
          message: 'Failed to record like: ' + (swipeError.message || 'Unknown error')
        };
      }

      // Create super like record if needed
      if (isSuperLike) {
        const { error: superLikeError } = await this.supabase
          .from('super_likes')
          .insert({
            user_id: userId,
            target_user_id: targetUserId
          });

        if (superLikeError) {
          // Don't fail the entire operation for super like error
        }
      }

      // Check for match
      const { data: theirSwipe, error: matchCheckError } = await this.supabase
        .from('swipes')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('target_user_id', userId)
        .eq('direction', 'right')
        .maybeSingle();

      if (matchCheckError) {
        // Continue without match check
      } else if (theirSwipe) {
        // It's a match!
        const { data: match, error: matchError } = await this.supabase
          .from('matches')
          .insert({
            user1_id: userId,
            user2_id: targetUserId
          })
          .select()
          .single();

        if (!matchError && match) {
          return {
            success: true,
            isMatch: true,
            message: 'It\'s a match! 🎉',
            matchId: match.id
          };
        }
      }

      return {
        success: true,
        message: isSuperLike ? 'Super like sent! 💫' : 'Liked! ❤️'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Like operation failed'
      };
    }
  }

  /**
   * Pass a user (swipe left) - unified logic for web and mobile
   */
  async passUser(userId: string, targetUserId: string): Promise<SwipeResult> {
    try {
      // Check auth session
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      if (!session || sessionError) {
        return {
          success: false,
          message: 'User session invalid'
        };
      }

      // Check if already swiped
      const { data: existingSwipe } = await this.supabase
        .from('swipes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();

      if (existingSwipe) {
        return {
          success: false,
          message: 'Already swiped on this user'
        };
      }

      // Create swipe record
      const { error: swipeError } = await this.supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          direction: 'left'
        });

      if (swipeError) {
        return {
          success: false,
          message: 'Failed to record pass'
        };
      }

      return {
        success: true,
        message: 'Passed'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Pass operation failed'
      };
    }
  }

  /**
   * Subscribe to real-time swipe notifications
   * Works for both web and mobile platforms
   */
  subscribeToSwipeNotifications(userId: string, callback: (swipe: any) => void) {
    return this.supabase
      .channel(`swipe_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `target_user_id=eq.${userId}&&direction=eq.right`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }

  /**
   * Subscribe to real-time match notifications
   * Works for both web and mobile platforms
   */
  subscribeToMatchNotifications(userId: string, callback: (match: any) => void) {
    return this.supabase
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
          callback(payload.new);
        }
      )
      .subscribe();
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }
}

// Factory function for easy initialization
export const createSharedSwipeService = (config: SwipeConfig): SharedSwipeService => {
  return new SharedSwipeService(config);
};