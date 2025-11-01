
import { supabase } from '@/integrations/supabase/client';
import { SuperLike } from '@/types/common';

export const swipeService = {
  async swipeUser(userId: string, targetUserId: string, direction: 'left' | 'right', isSuperLike: boolean = false): Promise<boolean> {
    try {
      // Check auth session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('[swipeService] Auth session check:', { 
        hasSession: !!session,
        sessionError,
        userId: session?.user?.id
      });
      
      if (!session || sessionError) {
        console.error('[swipeService] No valid session, attempting refresh:', sessionError);
        
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshedSession || refreshError) {
          console.error('[swipeService] Session refresh failed:', refreshError);
          return false;
        }
        
        console.log('[swipeService] Session refreshed successfully');
      }

      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          direction,
          is_super_like: isSuperLike
        });

      if (swipeError) {
        console.error('[swipeService] Error inserting swipe:', swipeError);
        console.error('[swipeService] Swipe details:', { 
          error: swipeError,
          code: swipeError.code,
          message: swipeError.message,
          details: swipeError.details,
          hint: swipeError.hint,
          swipeData: {
            user_id: userId,
            target_user_id: targetUserId,
            direction,
            is_super_like: isSuperLike
          }
        });
        throw swipeError;
      }
      
      // If it's a super like, also record in super_likes table
      if (isSuperLike && direction === 'right') {
        await supabase
          .from('super_likes')
          .insert({
            user_id: userId,
            target_user_id: targetUserId
          });
      }
      
      // Send notification for like (not super like, handled separately)
      if (direction === 'right' && !isSuperLike) {
        try {
          await this.createLikeNotification(userId, targetUserId);
        } catch (notificationError) {
          console.warn('Failed to create like notification:', notificationError);
          // Don't fail the swipe if notification fails
        }
      }
      
      // Check for match if it's a right swipe
      if (direction === 'right') {
        // Check for both regular swipes and super likes from the target user
        const [{ data: otherUserSwipe }, { data: otherUserSuperLike }] = await Promise.all([
          supabase
            .from('swipes')
            .select('*')
            .eq('user_id', targetUserId)
            .eq('target_user_id', userId)
            .eq('direction', 'right')
            .maybeSingle(),
          supabase
            .from('super_likes')
            .select('*')
            .eq('user_id', targetUserId)
            .eq('target_user_id', userId)
            .maybeSingle()
        ]);
        
        if (otherUserSwipe || otherUserSuperLike) {
          // It's a match! Create match record
          const { data: matchData } = await supabase
            .from('matches')
            .insert({
              user1_id: userId,
              user2_id: targetUserId
            })
            .select()
            .single();
          
          // Send match notifications to both users
          if (matchData) {
            try {
              await Promise.all([
                this.createMatchNotification(userId, targetUserId, matchData.id),
                this.createMatchNotification(targetUserId, userId, matchData.id)
              ]);
            } catch (notificationError) {
              console.warn('Failed to create match notifications:', notificationError);
            }
          }
          
          return true; // Return true if it's a match
        }
      }
      
      return true; // Return true for successful swipe (even if no match)
    } catch (error) {
      console.error('Error swiping user:', error);
      throw error; // Throw error instead of returning false
    }
  },

  async superLikeUser(userId: string, targetUserId: string): Promise<boolean> {
    try {
      console.log('[SwipeService] SuperLike attempt:', { userId, targetUserId });
      
      // Use a transaction-like approach to ensure data consistency
      let superLikeData: { id: string; user_id: string; target_user_id: string; created_at: string } | null = null;
      let swipeData: { id: string; user_id: string; target_user_id: string; direction: string; created_at: string } | null = null;
      
      // First record in super_likes table directly
      const { data: superLikeResult, error: superLikeError } = await supabase
        .from('super_likes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId
        })
        .select()
        .single();
      
      if (superLikeError) {
        console.error('[SwipeService] SuperLike insert error:', superLikeError);
        return false;
      }
      
      superLikeData = superLikeResult;
      console.log('[SwipeService] SuperLike recorded:', superLikeData);
      
      // Also record as a right swipe in swipes table
      const { data: swipeResult, error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          direction: 'right'
        })
        .select()
        .single();
      
      if (swipeError) {
        console.error('[SwipeService] Swipe record error, rolling back SuperLike:', swipeError);
        // Rollback: Delete the super_like record
        await supabase
          .from('super_likes')
          .delete()
          .eq('id', superLikeData.id);
        return false;
      }
      
      swipeData = swipeResult;
      console.log('[SwipeService] Swipe recorded:', swipeData);
      
      // Check for match - look for both regular swipes and super likes from the target user
      const [{ data: otherUserSwipe }, { data: otherUserSuperLike }] = await Promise.all([
        supabase
          .from('swipes')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('target_user_id', userId)
          .eq('direction', 'right')
          .maybeSingle(),
        supabase
          .from('super_likes')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('target_user_id', userId)
          .maybeSingle()
      ]);
      
      let isMatch = false;
      
      if (otherUserSwipe || otherUserSuperLike) {
        console.log('[SwipeService] Match detected! Creating match record');
        
        // It's a match! Create match record
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: userId,
            user2_id: targetUserId
          })
          .select()
          .single();
        
        if (matchError) {
          console.error('[SwipeService] Match creation error:', matchError);
        } else {
          console.log('[SwipeService] Match created:', matchData);
          isMatch = true;
          
          // Send match notifications to both users
          try {
            await Promise.all([
              this.createMatchNotification(userId, targetUserId, matchData.id),
              this.createMatchNotification(targetUserId, userId, matchData.id)
            ]);
          } catch (notificationError) {
            console.warn('[SwipeService] Match notification error:', notificationError);
          }
        }
      }
      
      // Send super like notification (non-blocking)
      try {
        await this.createSuperLikeNotification(userId, targetUserId);
        console.log('[SwipeService] SuperLike notification sent successfully');
      } catch (notificationError) {
        console.warn('[SwipeService] SuperLike notification error (non-blocking):', notificationError);
        // Don't fail the SuperLike operation due to notification errors
      }
      
      console.log('[SwipeService] SuperLike complete - isMatch:', isMatch);
      return isMatch;
    } catch (error) {
      console.error('[SwipeService] SuperLike error:', error);
      return false;
    }
  },

  async getSuperLikesReceived(userId: string): Promise<SuperLike[]> {
    try {
      const { data, error } = await supabase
        .from('super_likes')
        .select(`
          *,
          sender:profiles(
            id,
            name,
            photos,
            age,
            bio,
            location,
            subscription_tier,
            created_at,
            updated_at
          )
        `)
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match SuperLike interface
      const transformedData = data?.map(item => ({
        ...item,
        sender: item.sender ? {
          id: item.sender.id,
          name: item.sender.name || '',
          age: item.sender.age || 0,
          photos: item.sender.photos || [],
          bio: item.sender.bio || '',
          location: item.sender.location || '',
          subscription_tier: item.sender.subscription_tier || '',
          created_at: item.sender.created_at || '',
          updated_at: item.sender.updated_at || ''
        } : undefined
      })) || [];
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching super likes:', error);
      return [];
    }
  },

  async getSuperLikesSent(userId: string): Promise<SuperLike[]> {
    try {
      const { data, error } = await supabase
        .from('super_likes')
        .select(`
          *,
          recipient:profiles(
            id,
            name,
            photos,
            age,
            bio,
            location,
            subscription_tier,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match SuperLike interface
      const transformedData = data?.map(item => ({
        ...item,
        recipient: item.recipient ? {
          id: item.recipient.id,
          name: item.recipient.name || '',
          age: item.recipient.age || 0,
          photos: item.recipient.photos || [],
          bio: item.recipient.bio || '',
          location: item.recipient.location || '',
          subscription_tier: item.recipient.subscription_tier || '',
          created_at: item.recipient.created_at || '',
          updated_at: item.recipient.updated_at || ''
        } : undefined
      })) || [];
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching sent super likes:', error);
      return [];
    }
  },

  // Check if user has super liked someone
  async hasSuperLiked(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('super_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking super like status:', error);
      return false;
    }
  },

  // Helper methods for creating notifications
  async createLikeNotification(likerId: string, targetUserId: string): Promise<void> {
    try {
      // Notifications table doesn't exist - commenting out for now
      // const { error } = await supabase
      //   .from('notifications')
      //   .insert({
      //     user_id: targetUserId,
      //     type: 'like',
      //     title: 'New Like!',
      //     message: 'Someone liked you!',
      //     related_user_id: likerId,
      //     is_read: false
      //   });
      
      // if (error) {
      //   console.error('Failed to create like notification:', error);
      // }
    } catch (error) {
      console.error('Error creating like notification:', error);
    }
  },

  async createSuperLikeNotification(likerId: string, targetUserId: string): Promise<void> {
    try {
      // Notifications table doesn't exist - commenting out for now
      // const { error } = await supabase
      //   .from('notifications')
      //   .insert({
      //     user_id: targetUserId,
      //     type: 'super_like',
      //     title: 'Super Like!',
      //     message: 'Someone super liked you!',
      //     related_user_id: likerId,
      //     is_read: false
      //   });
      
      // if (error) {
      //   console.error('Failed to create super like notification:', error);
      // }
    } catch (error) {
      console.error('Error creating super like notification:', error);
    }
  },

  async createMatchNotification(userId: string, matchedUserId: string, matchId: string): Promise<void> {
    try {
      // Notifications table doesn't exist - commenting out for now
      // const { error } = await supabase
      //   .from('notifications')
      //   .insert({
      //     user_id: userId,
      //     type: 'match',
      //     title: 'New Match!',
      //     message: 'You have a new match!',
      //     related_user_id: matchedUserId,
      //     related_match_id: matchId,
      //     is_read: false
      //   });
      
      // if (error) {
      //   console.error('Failed to create match notification:', error);
      // }
    } catch (error) {
      console.error('Error creating match notification:', error);
    }
  }
};
