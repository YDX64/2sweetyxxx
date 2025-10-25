import { supabase } from '@/integrations/supabase/client';
import type { ProfileViewInterface } from '@/types/database';
import { ProfileView, ProfileWithSubscription, ViewAnalytics } from '@/types/common';
import { Database } from '@/types/supabase';

export interface ProfileViewStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  uniqueViewers: number;
  averageViewsPerDay: number;
  topViewingHours: number[];
  viewsByLocation: Record<string, number>;
}

export interface ViewerProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  location: string;
  subscription_tier: string;
  viewed_at: string;
  view_count: number;
  distance?: number;
}

export interface ProfileViewResult {
  success: boolean;
  message: string;
  stats?: ProfileViewStats;
  viewers?: ViewerProfile[];
  hasAccess?: boolean;
}

class ProfileViewsService {
  
  // Track a profile view
  async trackProfileView(
    viewerId: string, 
    viewedId: string, 
    isPremiumView: boolean = false
  ): Promise<boolean> {
    try {
      // Don't track self-views
      if (viewerId === viewedId) {
        return false;
      }

      // Check if already viewed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingView } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewer_id', viewerId)
        .eq('viewed_id', viewedId)
        .eq('view_date', today)
        .maybeSingle();

      if (existingView) {
        // Update existing view timestamp
        const { error } = await supabase
          .from('profile_views')
          .update({ 
            viewed_at: new Date().toISOString(),
            is_premium_view: isPremiumView
          })
          .eq('id', existingView.id);

        return !error;
      }

      // Create new view record
      const { error } = await supabase
        .from('profile_views')
        .insert({
          viewer_id: viewerId,
          viewed_id: viewedId,
          is_premium_view: isPremiumView,
          view_date: today
        });

      if (error) {
        console.error('Track profile view error:', error);
        return false;
      }

      // Track in user activities
      await supabase
        .from('user_activities')
        .insert({
          user_id: viewerId,
          activity_type: 'profile_view',
          activity_data: {
            viewed_user_id: viewedId,
            is_premium_view: isPremiumView,
            timestamp: new Date().toISOString()
          }
        });

      return true;
    } catch (error) {
      console.error('Track profile view failed:', error);
      return false;
    }
  }

  // Get profile view statistics
  async getProfileViewStats(userId: string): Promise<ProfileViewResult> {
    try {
      // Check if user has access to view stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      const tier = profile?.subscription_tier || 'registered';
      const hasAccess = this.getTierAccess(tier);

      if (!hasAccess) {
        return {
          success: false,
          message: 'Profil görüntüleme istatistikleri için Silver üyelik gerekli',
          hasAccess: false
        };
      }

      // Get view statistics
      const stats = await this.calculateViewStats(userId);

      return {
        success: true,
        message: 'İstatistikler başarıyla alındı',
        stats,
        hasAccess: true
      };

    } catch (error) {
      console.error('Get profile view stats error:', error);
      return {
        success: false,
        message: 'İstatistikler alınırken hata oluştu'
      };
    }
  }

  // Get detailed viewers list
  async getProfileViewers(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ProfileViewResult> {
    try {
      // Check access
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, latitude, longitude')
        .eq('id', userId)
        .single();

      const tier = profile?.subscription_tier || 'registered';
      const hasAccess = this.getTierAccess(tier);

      if (!hasAccess) {
        return {
          success: false,
          message: 'Profil ziyaretçilerini görmek için Silver üyelik gerekli',
          hasAccess: false
        };
      }

      // Get viewers with their profiles
      const { data: views, error } = await supabase
        .from('profile_views')
        .select(`
          viewer_id,
          viewed_at,
          viewer_profile:profiles!profile_views_viewer_id_fkey(
            id, name, age, photos, location, subscription_tier,
            latitude, longitude, is_banned
          )
        `)
        .eq('viewed_id', userId)
        .order('viewed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Get viewers error:', error);
        return {
          success: false,
          message: 'Ziyaretçiler alınırken hata oluştu'
        };
      }

      // Process viewers and calculate view counts
      const viewerCounts = await this.getViewerCounts(userId);
      
      const viewers = (views || [])
        .filter(view => {
          const viewerProfile = view.viewer_profile as Database['public']['Tables']['profiles']['Row'];
          return viewerProfile && !viewerProfile.is_banned;
        })
        .map(view => {
          const viewerProfile = view.viewer_profile as Database['public']['Tables']['profiles']['Row'];
          
          // Calculate distance if coordinates available
          let distance: number | undefined;
          if (profile?.latitude && profile?.longitude &&
              viewerProfile.latitude && viewerProfile.longitude) {
            distance = this.calculateDistance(
              profile.latitude,
              profile.longitude,
              viewerProfile.latitude,
              viewerProfile.longitude
            );
          }

          return {
            id: viewerProfile.id,
            name: viewerProfile.name || 'İsimsiz',
            age: viewerProfile.age || 0,
            photos: viewerProfile.photos || [],
            location: viewerProfile.location || '',
            subscription_tier: viewerProfile.subscription_tier || 'registered',
            viewed_at: view.viewed_at,
            view_count: viewerCounts[view.viewer_id] || 1,
            distance
          } as ViewerProfile;
        });

      // Track feature usage
      await this.trackFeatureUsage(userId);

      return {
        success: true,
        message: `${viewers.length} ziyaretçi bulundu`,
        viewers,
        hasAccess: true
      };

    } catch (error) {
      console.error('Get profile viewers error:', error);
      return {
        success: false,
        message: 'Ziyaretçiler alınırken hata oluştu'
      };
    }
  }

  // Calculate comprehensive view statistics
  private async calculateViewStats(userId: string): Promise<ProfileViewStats> {
    try {
      // Base queries for different time periods
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);

      // Get all views for the user
      const { data: allViews } = await supabase
        .from('profile_views')
        .select(`
          viewed_at,
          viewer_id,
          viewer_profile:profiles!profile_views_viewer_id_fkey(location)
        `)
        .eq('viewed_id', userId);

      // Calculate basic stats
      const totalViews = allViews?.length || 0;
      const todayViews = allViews?.filter(v => 
        new Date(v.viewed_at) >= today
      ).length || 0;
      
      const weekViews = allViews?.filter(v => 
        new Date(v.viewed_at) >= weekAgo
      ).length || 0;
      
      const monthViews = allViews?.filter(v => 
        new Date(v.viewed_at) >= monthAgo
      ).length || 0;

      // Unique viewers
      const uniqueViewers = new Set(allViews?.map(v => v.viewer_id) || []).size;

      // Average views per day (last 30 days)
      const averageViewsPerDay = monthViews / 30;

      // Top viewing hours
      const hourCounts: Record<number, number> = {};
      allViews?.forEach(view => {
        const hour = new Date(view.viewed_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const topViewingHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([hour]) => parseInt(hour));

      // Views by location
      const viewsByLocation: Record<string, number> = {};
      allViews?.forEach(view => {
        const location = (view.viewer_profile as ProfileWithSubscription)?.location || 'Bilinmeyen';
        const city = location.split(',')[0].trim(); // Get city part
        viewsByLocation[city] = (viewsByLocation[city] || 0) + 1;
      });

      return {
        totalViews,
        todayViews,
        weekViews,
        monthViews,
        uniqueViewers,
        averageViewsPerDay,
        topViewingHours,
        viewsByLocation
      };

    } catch (error) {
      console.error('Calculate view stats error:', error);
      return {
        totalViews: 0,
        todayViews: 0,
        weekViews: 0,
        monthViews: 0,
        uniqueViewers: 0,
        averageViewsPerDay: 0,
        topViewingHours: [],
        viewsByLocation: {}
      };
    }
  }

  // Get view counts per viewer
  private async getViewerCounts(userId: string): Promise<Record<string, number>> {
    try {
      const { data: views } = await supabase
        .from('profile_views')
        .select('viewer_id')
        .eq('viewed_id', userId);

      const counts: Record<string, number> = {};
      views?.forEach(view => {
        counts[view.viewer_id] = (counts[view.viewer_id] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Get viewer counts error:', error);
      return {};
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

  // Track feature usage
  private async trackFeatureUsage(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_feature_usage', {
        p_user_id: userId,
        p_feature_name: 'profile_views_analytics'
      });

      if (error) {
        console.error('Feature usage tracking error:', error);
      }
    } catch (error) {
      console.error('Feature usage tracking failed:', error);
    }
  }

  // Subscribe to new profile view notifications
  subscribeToViewNotifications(userId: string, callback: (view: ProfileViewInterface) => void) {
    return supabase
      .channel(`view_notifications:${userId}`)
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
  async getViewAnalytics(startDate: Date, endDate: Date) {
    try {
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
        viewsByViewerTier: {} as Record<string, number>,
        viewsByViewedTier: {} as Record<string, number>,
        uniqueViewers: new Set(views?.map(v => (v.viewer as ProfileWithSubscription)?.id) || []).size,
        uniqueViewed: new Set(views?.map(v => (v.viewed as ProfileWithSubscription)?.id) || []).size,
        averageViewsPerUser: 0,
        viewsByHour: {} as Record<number, number>
      };

      // Group by tiers
      views?.forEach(view => {
        const viewerTier = (view.viewer as ProfileWithSubscription)?.subscription_tier || 'registered';
        const viewedTier = (view.viewed as ProfileWithSubscription)?.subscription_tier || 'registered';
        const hour = new Date(view.viewed_at).getHours();
        
        analytics.viewsByViewerTier[viewerTier] = (analytics.viewsByViewerTier[viewerTier] || 0) + 1;
        analytics.viewsByViewedTier[viewedTier] = (analytics.viewsByViewedTier[viewedTier] || 0) + 1;
        analytics.viewsByHour[hour] = (analytics.viewsByHour[hour] || 0) + 1;
      });

      analytics.averageViewsPerUser = analytics.uniqueViewed > 0 
        ? analytics.totalViews / analytics.uniqueViewed 
        : 0;

      return analytics;
    } catch (error) {
      console.error('Get view analytics failed:', error);
      return null;
    }
  }
}

export const profileViewsService = new ProfileViewsService();