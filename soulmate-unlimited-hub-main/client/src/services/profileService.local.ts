import { dbRouter } from '../../../services/database-router';
import { supabase } from '@/integrations/supabase/client';
import { 
  Profile, 
  FilterOptions, 
  ExtendedProfile, 
  ExtendedProfileUpdate 
} from '@/types/profile';

/**
 * Profile Service - Local PostgreSQL Version
 * Uses local database for all profile data
 * Only uses Supabase for authentication
 */
export const profileService = {
  // Fetch user profile from local database
  async fetchUserProfile(userId: string, retryCount = 0): Promise<ExtendedProfile | null> {
    console.log(`[profileService.local] fetchUserProfile called for userId: ${userId}, retry: ${retryCount}`);
    
    try {
      // First check auth status with Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('[profileService.local] Auth error:', sessionError);
        return null;
      }
      
      // Fetch profile from local database via API
      const response = await fetch(`/api/profiles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('[profileService.local] Profile not found');
          return null;
        }
        throw new Error(`Profile fetch failed: ${response.statusText}`);
      }
      
      const profile = await response.json();
      console.log('[profileService.local] Profile fetched successfully');
      
      return profile as ExtendedProfile;
      
    } catch (error) {
      console.error('[profileService.local] Error fetching profile:', error);
      
      // Retry logic
      if (retryCount < 3) {
        console.log(`[profileService.local] Retrying... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.fetchUserProfile(userId, retryCount + 1);
      }
      
      return null;
    }
  },

  // Update user profile in local database
  async updateProfile(userId: string, updates: ExtendedProfileUpdate): Promise<ExtendedProfile | null> {
    console.log('[profileService.local] Updating profile:', userId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session');
      
      // Filter out fields that don't exist in the database schema
      const safeUpdates = { ...updates };
      delete (safeUpdates as any).birth_date;
      delete (safeUpdates as any).onboarding_completed;
      delete (safeUpdates as any).gender_locked;
      delete (safeUpdates as any).birth_date_locked;
      
      const response = await fetch(`/api/profiles/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(safeUpdates),
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      
      const updatedProfile = await response.json();
      console.log('[profileService.local] Profile updated successfully');
      
      return updatedProfile as ExtendedProfile;
      
    } catch (error) {
      console.error('[profileService.local] Error updating profile:', error);
      throw error;
    }
  },

  // Search profiles with filters
  async searchProfiles(filters: FilterOptions, limit = 50): Promise<Profile[]> {
    console.log('[profileService.local] Searching profiles with filters:', filters);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session');
      
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      
      // Serialize filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, JSON.stringify(value));
          } else if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      const response = await fetch(`/api/profiles/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const profiles = await response.json();
      return profiles as Profile[];
      
    } catch (error) {
      console.error('[profileService.local] Error searching profiles:', error);
      return [];
    }
  },

  // Check if username is available
  async checkUsernameAvailability(username: string, currentUserId?: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      
      const response = await fetch(`/api/profiles/check-username/${username}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      const { available } = await response.json();
      return available;
      
    } catch (error) {
      console.error('[profileService.local] Error checking username:', error);
      return false;
    }
  },

  // Get profile by username
  async getProfileByUsername(username: string): Promise<Profile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const response = await fetch(`/api/profiles/username/${username}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const profile = await response.json();
      return profile as Profile;
      
    } catch (error) {
      console.error('[profileService.local] Error fetching profile by username:', error);
      return null;
    }
  },

  // Upload photos (still uses Supabase Storage)
  async uploadPhoto(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('user-photos')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
      
    } catch (error) {
      console.error('[profileService.local] Error uploading photo:', error);
      throw error;
    }
  },

  // Get random profiles for swiping
  async getRandomProfiles(userId: string, limit = 10): Promise<Profile[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const response = await fetch(`/api/profiles/random?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch random profiles: ${response.statusText}`);
      }
      
      const profiles = await response.json();
      return profiles as Profile[];
      
    } catch (error) {
      console.error('[profileService.local] Error fetching random profiles:', error);
      return [];
    }
  },

  // Update last active timestamp
  async updateLastActive(userId: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      await fetch(`/api/profiles/${userId}/last-active`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
    } catch (error) {
      console.error('[profileService.local] Error updating last active:', error);
    }
  },

  // Get user's subscription status
  async getSubscriptionStatus(userId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const response = await fetch(`/api/subscriptions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const subscription = await response.json();
      return subscription;
      
    } catch (error) {
      console.error('[profileService.local] Error fetching subscription:', error);
      return null;
    }
  },
};