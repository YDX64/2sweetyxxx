import { supabase } from '@/integrations/supabase/client';

export interface LikeInfo {
  id: string;
  user_id: string;
  target_user_id: string;
  created_at: string;
  direction: string;
  is_super_like: boolean;
  liker_profile: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    bio: string;
    location: string;
    distance?: number;
  };
}

export interface WhoLikesYouResult {
  success: boolean;
  message: string;
  likes?: LikeInfo[];
  totalCount?: number;
  hasAccess?: boolean;
}

export interface LikeStats {
  totalLikes: number;
  superLikes: number;
  regularLikes: number;
  todayLikes: number;
  hasAccess: boolean;
  subscriptionRequired?: string;
}

class SeeWhoLikesYouService {
  
  // Check if user has access to see who likes them
  async hasAccess(userId: string): Promise<{ hasAccess: boolean; reason?: string; tier?: string }> {
    try {
      // Get both subscription_tier and role to match frontend logic
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, role')
        .eq('id', userId)
        .single();

      // Also check subscribers table for active subscription
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', userId)
        .single();

      // Determine tier using same logic as useSubscription hook
      let tier: 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin' = profile?.role || 'registered';
      
      // Check if has active subscription in subscribers table
      if (subscriber && subscriber.subscribed) {
        tier = (subscriber.subscription_tier as typeof tier) || tier;
        
        // Check if subscription is still valid
        if (subscriber.subscription_end) {
          const endDate = new Date(subscriber.subscription_end);
          const now = new Date();
          if (endDate <= now) {
            tier = 'registered';
          }
        }
      } else if (profile?.role && ['silver', 'gold', 'platinum', 'admin', 'moderator'].includes(profile.role)) {
        tier = profile.role;
      } else if (profile?.subscription_tier && profile.subscription_tier !== 'registered') {
        tier = profile.subscription_tier as typeof tier;
      }

      const hasAccess = this.getTierAccess(tier);

      if (!hasAccess) {
        return {
          hasAccess: false,
          reason: 'See Who Likes You feature requires Silver membership or higher',
          tier
        };
      }

      return { hasAccess: true, tier };
    } catch (error) {
      console.error('Access check failed:', error);
      return { hasAccess: false, reason: 'Error checking access' };
    }
  }

  // Get users who liked the current user
  async getWhoLikesYou(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<WhoLikesYouResult> {
    try {
      // Check access first
      const accessCheck = await this.hasAccess(userId);
      if (!accessCheck.hasAccess) {
        return {
          success: false,
          message: accessCheck.reason || 'Erişim reddedildi',
          hasAccess: false
        };
      }

      // Get user's location for distance calculation
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', userId)
        .single();

      // Get all right swipes (likes) targeting this user
      const { data: likes, error: likesError } = await supabase
        .from('swipes')
        .select(`
          id,
          user_id,
          target_user_id,
          created_at,
          direction
        `)
        .eq('target_user_id', userId)
        .eq('direction', 'right')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (likesError) {
        console.error('Likes query error:', likesError);
        return { success: false, message: 'Failed to fetch likes' };
      }

      if (!likes || likes.length === 0) {
        return {
          success: true,
          message: 'Henüz beğeni bulunamadı',
          likes: [],
          totalCount: 0,
          hasAccess: true
        };
      }

      // Get super likes separately
      const { data: superLikes } = await supabase
        .from('super_likes')
        .select('user_id, target_user_id, created_at')
        .eq('target_user_id', userId);

      const superLikeUserIds = new Set(superLikes?.map(sl => sl.user_id) || []);

      // Get profile information for all users who liked
      const likerIds = likes.map(like => like.user_id);
      
      const { data: likerProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, name, age, photos, bio, location, 
          latitude, longitude, is_banned
        `)
        .in('id', likerIds)
        .eq('is_banned', false);

      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        return { success: false, message: 'Failed to fetch liker profiles' };
      }

      // Combine likes with profile information
      const likesWithProfiles = likes
        .map(like => {
          const profile = likerProfiles?.find(p => p.id === like.user_id);
          if (!profile) return null;

          // Calculate distance if both have coordinates
          let distance: number | undefined;
          if (userProfile?.latitude && userProfile?.longitude &&
              profile.latitude && profile.longitude) {
            distance = this.calculateDistance(
              userProfile.latitude,
              userProfile.longitude,
              profile.latitude,
              profile.longitude
            );
          }

          return {
            id: like.id,
            user_id: like.user_id,
            target_user_id: like.target_user_id,
            created_at: like.created_at,
            direction: like.direction,
            is_super_like: superLikeUserIds.has(like.user_id),
            liker_profile: {
              id: profile.id,
              name: profile.name || 'Unknown',
              age: profile.age || 0,
              photos: profile.photos || [],
              bio: profile.bio || '',
              location: profile.location || '',
              distance
            }
          } as LikeInfo;
        })
        .filter((like): like is LikeInfo => like !== null);

      // Sort: super likes first, then by date
      likesWithProfiles.sort((a, b) => {
        if (a.is_super_like && !b.is_super_like) return -1;
        if (!a.is_super_like && b.is_super_like) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Track feature usage
      await this.trackFeatureUsage(userId);

      return {
        success: true,
        message: `Found ${likesWithProfiles.length} people who liked you`,
        likes: likesWithProfiles,
        totalCount: likesWithProfiles.length,
        hasAccess: true
      };

    } catch (error) {
      console.error('See who likes you service error:', error);
      return { success: false, message: 'Service error occurred' };
    }
  }

  // Get like statistics for user
  async getLikeStats(userId: string): Promise<LikeStats> {
    try {
      const accessCheck = await this.hasAccess(userId);
      
      if (!accessCheck.hasAccess) {
        return {
          totalLikes: 0,
          superLikes: 0,
          regularLikes: 0,
          todayLikes: 0,
          hasAccess: false,
          subscriptionRequired: accessCheck.reason
        };
      }

      // Get total likes count
      const { data: totalLikes, error: totalError } = await supabase
        .from('swipes')
        .select('id', { count: 'exact' })
        .eq('target_user_id', userId)
        .eq('direction', 'right');

      // Get super likes count
      const { data: superLikes, error: superError } = await supabase
        .from('super_likes')
        .select('id', { count: 'exact' })
        .eq('target_user_id', userId);

      // Get today's likes
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayLikes, error: todayError } = await supabase
        .from('swipes')
        .select('id', { count: 'exact' })
        .eq('target_user_id', userId)
        .eq('direction', 'right')
        .gte('created_at', today.toISOString());

      if (totalError || superError || todayError) {
        console.error('Stats query error:', { totalError, superError, todayError });
      }

      const totalLikesCount = totalLikes?.length || 0;
      const superLikesCount = superLikes?.length || 0;
      const regularLikesCount = totalLikesCount - superLikesCount;
      const todayLikesCount = todayLikes?.length || 0;

      return {
        totalLikes: totalLikesCount,
        superLikes: superLikesCount,
        regularLikes: regularLikesCount,
        todayLikes: todayLikesCount,
        hasAccess: true
      };

    } catch (error) {
      console.error('Get like stats failed:', error);
      return {
        totalLikes: 0,
        superLikes: 0,
        regularLikes: 0,
        todayLikes: 0,
        hasAccess: false,
        subscriptionRequired: 'Error getting stats'
      };
    }
  }

  // Like someone back (mutual like/match)
  async likeBack(userId: string, targetUserId: string): Promise<{ success: boolean; isMatch: boolean; message: string }> {
    try {
      // Check if user has already liked this person
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .single();

      if (existingSwipe) {
        return { 
          success: false, 
          isMatch: false, 
          message: 'You have already swiped on this person' 
        };
      }

      // Create the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          direction: 'right'
        });

      if (swipeError) {
        console.error('Like back swipe error:', swipeError);
        return { success: false, isMatch: false, message: 'Failed to like back' };
      }

      // Check if this creates a match
      const { data: theirSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('target_user_id', userId)
        .eq('direction', 'right')
        .single();

      if (theirSwipe) {
        // It's a match! Create match record
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: userId,
            user2_id: targetUserId
          });

        if (matchError) {
          console.error('Match creation error:', matchError);
          // Swipe was successful but match creation failed
          return { 
            success: true, 
            isMatch: false, 
            message: 'Liked back successfully, but match creation failed' 
          };
        }

        return { 
          success: true, 
          isMatch: true, 
          message: 'It\'s a match! 🎉' 
        };
      }

      return { 
        success: true, 
        isMatch: false, 
        message: 'Liked back successfully' 
      };

    } catch (error) {
      console.error('Like back failed:', error);
      return { success: false, isMatch: false, message: 'Like back operation failed' };
    }
  }

  // Remove someone from the likes list (pass/ignore)
  async dismissLike(userId: string, likerId: string): Promise<{ success: boolean; message: string }> {
    try {
      // We don't actually delete the like, just mark it as "dismissed"
      // For now, we could add the liker to a hidden/dismissed list
      // This could be implemented with a user_dismissals table
      
      console.log(`User ${userId} dismissed like from ${likerId}`);
      
      // In a full implementation, we would:
      // 1. Add to dismissed_likes table
      // 2. Not show this liker in future "who likes you" results
      
      return { 
        success: true, 
        message: 'Like dismissed successfully' 
      };
    } catch (error) {
      console.error('Dismiss like failed:', error);
      return { success: false, message: 'Failed to dismiss like' };
    }
  }

  // Check subscription tier access
  private getTierAccess(tier: string): boolean {
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

  // Calculate distance between coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Track feature usage using database function
  private async trackFeatureUsage(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_feature_usage', {
        p_user_id: userId,
        p_feature_name: 'see_who_likes_you'
      });

      if (error) {
        console.error('Feature usage tracking error:', error);
      }
    } catch (error) {
      console.error('Feature usage tracking failed:', error);
    }
  }

  // Get analytics for admin panel
  async getFeatureAnalytics(startDate: Date, endDate: Date) {
    try {
      // Placeholder for analytics
      return {
        totalUsage: 0,
        usageByTier: {},
        averageLikesPerUser: 0,
        conversionRate: 0 // likes that resulted in matches
      };
    } catch (error) {
      console.error('Get feature analytics failed:', error);
      return null;
    }
  }
}

export const seeWhoLikesYouService = new SeeWhoLikesYouService();