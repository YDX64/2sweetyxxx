import { supabase } from '@/integrations/supabase/client';
import type { ProfileViewInterface } from '@/types/database';
import { ProfileWithSubscription } from '@/types/common';

export interface GuestProfile {
  id: string;
  visitor_id: string;
  viewed_at: string;
  is_premium_view: boolean;
  visitor_profile: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    bio: string;
    location: string;
    subscription_tier: string;
    distance?: number;
  };
}

export interface GuestStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  premiumViews: number;
  hasAccess: boolean;
  subscriptionRequired?: string;
}

export interface GuestResult {
  success: boolean;
  message: string;
  guests?: GuestProfile[];
  totalCount?: number;
  hasAccess?: boolean;
}

class GuestsService {
  
  // Check if user has access to see profile visitors
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
      let tier: string = profile?.role || 'registered';
      
      // Check if has active subscription in subscribers table
      if (subscriber && subscriber.subscribed) {
        tier = subscriber.subscription_tier || tier;
        
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
        tier = profile.subscription_tier;
      }

      const hasAccess = this.getTierAccess(tier);

      if (!hasAccess) {
        return {
          hasAccess: false,
          reason: 'guestService.silverMembershipRequired',
          tier
        };
      }

      return { hasAccess: true, tier };
    } catch (error) {
      console.error('Access check failed:', error);
      return { hasAccess: false, reason: 'guestService.accessControlError' };
    }
  }

  // Get users who viewed the current user's profile
  async getProfileGuests(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<GuestResult> {
    try {
      // Check access first
      const accessCheck = await this.hasAccess(userId);
      if (!accessCheck.hasAccess) {
        return {
          success: false,
          message: accessCheck.reason || 'guestService.accessDenied',
          hasAccess: false
        };
      }

      // Get user's location for distance calculation
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', userId)
        .single();

      // Get profile views with visitor details
      const { data: views, error } = await supabase
        .from('profile_views')
        .select(`
          id,
          viewer_id,
          viewed_at,
          is_premium_view,
          visitor_profile:profiles!profile_views_viewer_id_fkey(
            id, name, age, photos, bio, location, 
            latitude, longitude, subscription_tier, is_banned
          )
        `)
        .eq('viewed_id', userId)
        .order('viewed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Profile views query error:', error);
        return { success: false, message: 'guestService.unableToRetrieveVisitors' };
      }

      if (!views || views.length === 0) {
        return {
          success: true,
          message: 'guestService.noProfileVisitorsYet',
          guests: [],
          totalCount: 0,
          hasAccess: true
        };
      }

      // Filter out banned users and convert to GuestProfile format
      const guests = views
        .filter(view => {
          const profile = view.visitor_profile;
          return profile && !profile.is_banned;
        })
        .map(view => {
          const profile = view.visitor_profile;
          
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
            id: view.id,
            visitor_id: view.viewer_id,
            viewed_at: view.viewed_at,
            is_premium_view: view.is_premium_view,
            visitor_profile: {
              id: profile.id,
              name: profile.name || 'guestService.anonymous',
              age: profile.age || 0,
              photos: profile.photos || [],
              bio: profile.bio || '',
              location: profile.location || '',
              subscription_tier: profile.subscription_tier || 'registered',
              distance
            }
          } as GuestProfile;
        });

      // Track feature usage
      await this.trackFeatureUsage(userId);

      return {
        success: true,
        message: 'guestService.profileVisitorsFound',
        guests,
        totalCount: guests.length,
        hasAccess: true
      };

    } catch (error) {
      console.error('Get profile guests error:', error);
      return { success: false, message: 'guestService.errorRetrievingVisitors' };
    }
  }

  // Get guest statistics for user
  async getGuestStats(userId: string): Promise<GuestStats> {
    try {
      const accessCheck = await this.hasAccess(userId);
      
      if (!accessCheck.hasAccess) {
        return {
          totalViews: 0,
          todayViews: 0,
          weekViews: 0,
          monthViews: 0,
          premiumViews: 0,
          hasAccess: false,
          subscriptionRequired: accessCheck.reason
        };
      }

      // Get total views count
      const { data: totalViews, error: totalError } = await supabase
        .from('profile_views')
        .select('id', { count: 'exact' })
        .eq('viewed_id', userId);

      // Get today's views
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayViews, error: todayError } = await supabase
        .from('profile_views')
        .select('id', { count: 'exact' })
        .eq('viewed_id', userId)
        .gte('viewed_at', today.toISOString());

      // Get week's views
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weekViews, error: weekError } = await supabase
        .from('profile_views')
        .select('id', { count: 'exact' })
        .eq('viewed_id', userId)
        .gte('viewed_at', weekAgo.toISOString());

      // Get month's views
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      
      const { data: monthViews, error: monthError } = await supabase
        .from('profile_views')
        .select('id', { count: 'exact' })
        .eq('viewed_id', userId)
        .gte('viewed_at', monthAgo.toISOString());

      // Get premium views count
      const { data: premiumViews, error: premiumError } = await supabase
        .from('profile_views')
        .select('id', { count: 'exact' })
        .eq('viewed_id', userId)
        .eq('is_premium_view', true);

      if (totalError || todayError || weekError || monthError || premiumError) {
        console.error('Stats query error:', { totalError, todayError, weekError, monthError, premiumError });
      }

      return {
        totalViews: totalViews?.length || 0,
        todayViews: todayViews?.length || 0,
        weekViews: weekViews?.length || 0,
        monthViews: monthViews?.length || 0,
        premiumViews: premiumViews?.length || 0,
        hasAccess: true
      };

    } catch (error) {
      console.error('Get guest stats failed:', error);
      return {
        totalViews: 0,
        todayViews: 0,
        weekViews: 0,
        monthViews: 0,
        premiumViews: 0,
        hasAccess: false,
        subscriptionRequired: 'guestService.errorRetrievingStats'
      };
    }
  }

  // Record a profile view
  async recordProfileView(viewerId: string, viewedId: string, isPremiumView: boolean = false): Promise<boolean> {
    try {
      // Don't record if viewing own profile
      if (viewerId === viewedId) {
        return false;
      }

      // Check if already viewed today (to prevent spam)
      const today = new Date().toISOString().split('T')[0];
      const { data: existingView } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewer_id', viewerId)
        .eq('viewed_id', viewedId)
        .eq('view_date', today)
        .maybeSingle();

      if (existingView) {
        // Already viewed today, just update the timestamp
        const { error } = await supabase
          .from('profile_views')
          .update({ 
            viewed_at: new Date().toISOString(),
            is_premium_view: isPremiumView || false
          })
          .eq('id', existingView.id);

        return !error;
      }

      // Create new profile view record
      const { error } = await supabase
        .from('profile_views')
        .insert({
          viewer_id: viewerId,
          viewed_id: viewedId,
          is_premium_view: isPremiumView,
          view_date: today
        });

      if (error) {
        console.error('Record profile view error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Record profile view failed:', error);
      return false;
    }
  }

  // Remove a guest from the list (hide)
  async hideGuest(userId: string, guestId: string): Promise<{ success: boolean; message: string }> {
    try {
      // For now, we don't actually delete the view record
      // Instead, we could add a "hidden_views" table for users to hide specific guests
      
      console.log(`User ${userId} hid guest ${guestId}`);
      
      // In a full implementation, we would:
      // 1. Add to hidden_views table
      // 2. Not show this guest in future getProfileGuests results
      
      return { 
        success: true, 
        message: 'guestService.visitorHidden' 
      };
    } catch (error) {
      console.error('Hide guest failed:', error);
      return { success: false, message: 'guestService.unableToHideVisitor' };
    }
  }

  // Check subscription tier access
  private getTierAccess(tier: string): boolean {
    const tierLevels = {
      'registered': 0,
      'silver': 1,
      'gold': 2,
      'platinum': 3,
      'moderator': 4,
      'admin': 5
    };
    
    const currentLevel = tierLevels[tier as keyof typeof tierLevels] || 0;
    return currentLevel >= 1; // Silver+ required (changed from Gold+)
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

  // Track feature usage
  private async trackFeatureUsage(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_feature_usage', {
        p_user_id: userId,
        p_feature_name: 'profile_visitors'
      });

      if (error) {
        console.error('Feature usage tracking error:', error);
      }
    } catch (error) {
      console.error('Feature usage tracking failed:', error);
    }
  }

  // Subscribe to new profile views notifications
  subscribeToGuestNotifications(userId: string, callback: (view: ProfileViewInterface) => void) {
    return supabase
      .channel(`guest_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_views',
          filter: `viewed_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as ProfileViewInterface);
        }
      )
      .subscribe();
  }

  // Get analytics for admin panel
  async getGuestAnalytics(startDate: Date, endDate: Date) {
    try {
      // Get profile views data
      const { data: views, error } = await supabase
        .from('profile_views')
        .select(`
          viewed_at,
          is_premium_view,
          viewer:profiles!profile_views_viewer_id_fkey(subscription_tier),
          viewed:profiles!profile_views_viewed_id_fkey(subscription_tier)
        `)
        .gte('viewed_at', startDate.toISOString())
        .lte('viewed_at', endDate.toISOString());

      if (error) throw error;

      const analytics = {
        totalViews: views?.length || 0,
        premiumViews: views?.filter(v => v.is_premium_view).length || 0,
        viewsByTier: {} as Record<string, number>,
        averageViewsPerUser: 0,
        uniqueViewers: new Set(views?.map(v => v.viewer) || []).size,
        uniqueViewed: new Set(views?.map(v => v.viewed) || []).size
      };

      // Group by viewer tier
      views?.forEach(view => {
        const tier = (view.viewer as ProfileWithSubscription)?.subscription_tier || 'registered';
        analytics.viewsByTier[tier] = (analytics.viewsByTier[tier] || 0) + 1;
      });

      analytics.averageViewsPerUser = analytics.uniqueViewed > 0 
        ? analytics.totalViews / analytics.uniqueViewed 
        : 0;

      return analytics;
    } catch (error) {
      console.error('Get guest analytics failed:', error);
      return null;
    }
  }
}

export const guestsService = new GuestsService();