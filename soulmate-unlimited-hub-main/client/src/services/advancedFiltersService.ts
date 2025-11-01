import { supabase } from '@/integrations/supabase/client';

export interface AdvancedFilters {
  // Basic filters
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  
  // Premium filters
  education?: string[];
  occupation?: string[];
  height?: {
    min?: number;
    max?: number;
  };
  drinking?: string[];
  smoking?: string[];
  exercise?: string[];
  religion?: string[];
  children?: string[];
  relationship_type?: string[];
  zodiac_sign?: string[];
  languages?: string[];
  interests?: string[];
  
  // Advanced settings
  verified_only?: boolean;
  recent_activity_only?: boolean; // Active in last 7 days
  has_photos_minimum?: number; // At least X photos
}

export interface FilterResult {
  success: boolean;
  message: string;
  filteredProfiles?: ProfileWithDistance[];
  totalCount?: number;
  appliedFilters?: AdvancedFilters;
}

export interface FilterStats {
  hasAccess: boolean;
  reason?: string;
  availableFilters: string[];
  currentFilters: AdvancedFilters;
  subscriptionTier?: string;
}

export interface ProfileWithDistance {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location: string;
  education?: string;
  occupation?: string;
  height?: number;
  drinking?: string;
  smoking?: string;
  exercise?: string;
  religion?: string;
  children?: string;
  relationship_type?: string;
  zodiac_sign?: string;
  languages?: string[];
  interests?: string[];
  distance?: number;
  last_active?: string;
  is_verified?: boolean;
}

class AdvancedFiltersService {
  
  // Check if user has access to advanced filters
  async hasFilterAccess(userId: string): Promise<{ hasAccess: boolean; reason?: string; tier?: string }> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      const tier = profile?.subscription_tier || 'registered';
      const hasAccess = this.getTierFilterAccess(tier);

      if (!hasAccess) {
        return {
          hasAccess: false,
          reason: 'Advanced filters require Silver membership or higher',
          tier
        };
      }

      return { hasAccess: true, tier };
    } catch (error) {
      console.error('Filter access check failed:', error);
      return { hasAccess: false, reason: 'Error checking filter access' };
    }
  }

  // Apply advanced filters to find matching profiles
  async applyFilters(
    userId: string, 
    filters: AdvancedFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<FilterResult> {
    try {
      // Check access
      const accessCheck = await this.hasFilterAccess(userId);
      if (!accessCheck.hasAccess) {
        return {
          success: false,
          message: accessCheck.reason || 'No filter access'
        };
      }

      // Get user's basic preferences for fallback
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get user's location for distance calculations
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('latitude, longitude, gender, interested_in')
        .eq('id', userId)
        .single();

      if (!userProfile) {
        return { success: false, message: 'User profile not found' };
      }

      // Build the query with filters
      let query = supabase
        .from('profiles')
        .select(`
          id, name, age, bio, photos, location, 
          education, occupation, height, drinking, smoking, 
          exercise, religion, children, relationship_type, 
          zodiac_sign, languages, interests, updated_at,
          latitude, longitude, verified
        `)
        .neq('id', userId) // Exclude self
        .eq('is_banned', false); // Only active users

      // Apply gender preference
      if (userProfile.interested_in && userProfile.interested_in !== 'both') {
        const targetGender = userProfile.interested_in === 'men' ? 'male' : 'female';
        query = query.eq('gender', targetGender);
      }

      // Apply age filters
      const minAge = filters.minAge || userPrefs?.min_age || 18;
      const maxAge = filters.maxAge || userPrefs?.max_age || 99;
      query = query.gte('age', minAge).lte('age', maxAge);

      // Apply education filter (Premium)
      if (filters.education && filters.education.length > 0) {
        query = query.in('education', filters.education);
      }

      // Apply occupation filter (Premium)
      if (filters.occupation && filters.occupation.length > 0) {
        query = query.in('occupation', filters.occupation);
      }

      // Apply height filter (Premium)
      if (filters.height) {
        if (filters.height.min) {
          query = query.gte('height', filters.height.min);
        }
        if (filters.height.max) {
          query = query.lte('height', filters.height.max);
        }
      }

      // Apply lifestyle filters (Premium)
      if (filters.drinking && filters.drinking.length > 0) {
        query = query.in('drinking', filters.drinking);
      }

      if (filters.smoking && filters.smoking.length > 0) {
        query = query.in('smoking', filters.smoking);
      }

      if (filters.exercise && filters.exercise.length > 0) {
        query = query.in('exercise', filters.exercise);
      }

      if (filters.religion && filters.religion.length > 0) {
        query = query.in('religion', filters.religion);
      }

      if (filters.children && filters.children.length > 0) {
        query = query.in('children', filters.children);
      }

      if (filters.relationship_type && filters.relationship_type.length > 0) {
        query = query.in('relationship_type', filters.relationship_type);
      }

      if (filters.zodiac_sign && filters.zodiac_sign.length > 0) {
        query = query.in('zodiac_sign', filters.zodiac_sign);
      }

      // Apply recent activity filter (Platinum)
      if (filters.recent_activity_only && accessCheck.tier === 'platinum') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('updated_at', sevenDaysAgo.toISOString());
      }

      // Execute query with pagination
      query = query.range(offset, offset + limit - 1);

      const { data: profiles, error } = await query;

      if (error) {
        console.error('Advanced filter query error:', error);
        return { success: false, message: 'Filter query failed' };
      }

      // Post-process filters that require client-side filtering
      let filteredProfiles = profiles || [];

      // Distance filter (requires calculation)
      if (filters.maxDistance && userProfile.latitude && userProfile.longitude) {
        filteredProfiles = filteredProfiles.filter(profile => {
          if (!profile.latitude || !profile.longitude) return false;
          
          const distance = this.calculateDistance(
            userProfile.latitude!,
            userProfile.longitude!,
            profile.latitude,
            profile.longitude
          );
          
          return distance <= filters.maxDistance!;
        });
      }

      // Languages filter (array intersection)
      if (filters.languages && filters.languages.length > 0) {
        filteredProfiles = filteredProfiles.filter(profile => {
          if (!profile.languages || !Array.isArray(profile.languages)) return false;
          
          return filters.languages!.some(lang =>
            profile.languages!.includes(lang)
          );
        });
      }

      // Interests filter (array intersection)
      if (filters.interests && filters.interests.length > 0) {
        filteredProfiles = filteredProfiles.filter(profile => {
          if (!profile.interests || !Array.isArray(profile.interests)) return false;
          
          return filters.interests!.some(interest =>
            profile.interests!.includes(interest)
          );
        });
      }

      // Photos minimum filter
      if (filters.has_photos_minimum) {
        filteredProfiles = filteredProfiles.filter(profile => {
          const photoCount = profile.photos ? profile.photos.length : 0;
          return photoCount >= filters.has_photos_minimum!;
        });
      }

      // Save filter usage for analytics
      await this.trackFilterUsage(userId, filters);

      // Convert to ProfileWithDistance format
      const profilesWithDistance = filteredProfiles.map(profile => ({
        id: profile.id,
        name: profile.name || 'İsimsiz',
        age: profile.age || 0,
        bio: profile.bio || '',
        photos: profile.photos || [],
        location: profile.location || '',
        education: profile.education || undefined,
        occupation: profile.occupation || undefined,
        height: profile.height || undefined,
        drinking: profile.drinking || undefined,
        smoking: profile.smoking || undefined,
        exercise: profile.exercise || undefined,
        religion: profile.religion || undefined,
        children: profile.children || undefined,
        relationship_type: profile.relationship_type || undefined,
        zodiac_sign: profile.zodiac_sign || undefined,
        languages: profile.languages || undefined,
        interests: profile.interests || undefined,
        distance: userProfile.latitude && userProfile.longitude &&
                 profile.latitude && profile.longitude ?
                 this.calculateDistance(
                   userProfile.latitude,
                   userProfile.longitude,
                   profile.latitude,
                   profile.longitude
                 ) : undefined,
        last_active: profile.updated_at || undefined,
        is_verified: profile.verified || false
      }));

      // Track filter usage
      await this.trackFilterUsage(userId, filters);

      return {
        success: true,
        message: `${profilesWithDistance.length} profil filtrelere uydu`,
        filteredProfiles: profilesWithDistance,
        totalCount: profilesWithDistance.length,
        appliedFilters: filters
      };

    } catch (error) {
      console.error('Advanced filters service error:', error);
      return { success: false, message: 'Filter operation failed' };
    }
  }

  // Get available filter options based on subscription tier
  async getAvailableFilters(userId: string): Promise<FilterStats> {
    try {
      const accessCheck = await this.hasFilterAccess(userId);
      
      if (!accessCheck.hasAccess) {
        return {
          hasAccess: false,
          reason: accessCheck.reason,
          availableFilters: ['age', 'distance'], // Basic filters only
          currentFilters: {}
        };
      }

      const tier = accessCheck.tier!;
      const availableFilters = this.getFiltersForTier(tier);

      // Get user's current filter preferences
      const currentFilters = await this.getUserFilterPreferences(userId);

      return {
        hasAccess: true,
        availableFilters,
        currentFilters
      };

    } catch (error) {
      console.error('Get available filters failed:', error);
      return {
        hasAccess: false,
        reason: 'Error getting available filters',
        availableFilters: [],
        currentFilters: {}
      };
    }
  }

  // Save user's filter preferences
  async saveFilterPreferences(userId: string, filters: AdvancedFilters): Promise<boolean> {
    try {
      // Store in user_preferences table with JSON field
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          // Store advanced filters in a JSON field (would need to add this column)
          // For now, just update the basic preferences
          min_age: filters.minAge,
          max_age: filters.maxAge,
          max_distance: filters.maxDistance,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Save filter preferences error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Save filter preferences failed:', error);
      return false;
    }
  }

  // Get user's saved filter preferences
  private async getUserFilterPreferences(userId: string): Promise<AdvancedFilters> {
    try {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!prefs) return {};

      return {
        minAge: prefs.min_age || undefined,
        maxAge: prefs.max_age || undefined,
        maxDistance: prefs.max_distance || undefined
        // Add other advanced filters when we have a proper storage solution
      };
    } catch (error) {
      console.error('Get user filter preferences failed:', error);
      return {};
    }
  }

  // Check subscription tier filter access
  private getTierFilterAccess(tier: string): boolean {
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

  // Get available filters based on tier
  private getFiltersForTier(tier: string): string[] {
    const basicFilters = ['age', 'distance'];
    const silverFilters = [
      ...basicFilters,
      'education', 'occupation', 'height', 'drinking', 'smoking', 
      'exercise', 'religion', 'children', 'relationship_type'
    ];
    const platinumFilters = [
      ...silverFilters,
      'zodiac_sign', 'languages', 'interests', 'recent_activity', 'photo_count'
    ];

    switch (tier) {
      case 'registered':
        return basicFilters;
      case 'silver':
        return silverFilters;
      case 'gold':
      case 'platinum':
      case 'admin':
        return platinumFilters;
      default:
        return basicFilters;
    }
  }

  // Calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Track filter usage for analytics using feature_usage_logs
  private async trackFilterUsage(userId: string, filters: AdvancedFilters): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_feature_usage', {
        p_user_id: userId,
        p_feature_name: 'advanced_filters'
      });

      if (error) {
        console.error('Filter usage tracking error:', error);
      }

      // Also log to user_activities for detailed tracking
      const { error: activityError } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'advanced_filters_used',
          activity_data: {
            filters_applied: Object.keys(filters),
            filter_count: Object.keys(filters).length,
            timestamp: new Date().toISOString()
          }
        });

      if (activityError) {
        console.error('Activity logging error:', activityError);
      }
    } catch (error) {
      console.error('Filter usage tracking failed:', error);
    }
  }

  // Get filter analytics for admin panel
  async getFilterAnalytics(startDate: Date, endDate: Date) {
    try {
      // Placeholder for filter usage analytics
      return {
        totalFilterUsage: 0,
        mostUsedFilters: {},
        filtersByTier: {},
        averageFiltersPerUser: 0
      };
    } catch (error) {
      console.error('Get filter analytics failed:', error);
      return null;
    }
  }
}

export const advancedFiltersService = new AdvancedFiltersService();