import { supabase } from '@/integrations/supabase/client';
import { 
  Profile, 
  FilterOptions, 
  ExtendedProfile, 
  ExtendedProfileUpdate 
} from '@/types/profile';
import { getErrorDetails } from '@/types/common';

export const profileService = {
  // Modern async pattern: Type-safe profile fetching with retry logic
  async fetchUserProfile(userId: string, retryCount = 0): Promise<ExtendedProfile | null> {
    console.log(`[profileService] fetchUserProfile called for userId: ${userId}, retry: ${retryCount}`);
    
    try {
      // First check the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log(`[profileService] Session check:`, {
        hasSession: !!session,
        sessionError,
        userId: session?.user?.id,
        requestedUserId: userId,
        isMatch: session?.user?.id === userId,
        accessToken: session?.access_token ? 'present' : 'missing'
      });
      
      if (sessionError) {
        console.error('[profileService] Session error:', sessionError);
      }
      
      // Log the actual query being made
      console.log('[profileService] Executing query: profiles.select("*").eq("id", userId).maybeSingle()');
      console.log('[profileService] Supabase URL:', supabase['rest']['url']);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('[profileService] Profile query completed');
      console.log('[profileService] Query result:', { 
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details,
        errorHint: error?.hint,
        dataId: data?.id,
        dataEmail: data?.email
      });
      
      if (error) {
        console.error('[profileService] Supabase error object:', JSON.stringify(error, null, 2));
        
        // Check for specific error types
        if (error.code === 'PGRST301') {
          console.error('[profileService] JWT error - session may be invalid');
        } else if (error.code === '42501') {
          console.error('[profileService] Permission denied - RLS policy issue');
        } else if (error.message?.includes('network') && retryCount < 3) {
          console.log(`[profileService] Network error, retrying (${retryCount + 1}/3)...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          return this.fetchUserProfile(userId, retryCount + 1);
        }
        return null;
      }
      
      if (!data) {
        console.warn('[profileService] No profile found for user:', userId);
        return null;
      }
      
      console.log('[profileService] Profile fetched successfully:', {
        id: data.id,
        email: data.email,
        name: data.name,
        hasPhoto: !!data.photos?.length
      });
      return data as ExtendedProfile;
    } catch (error) {
      console.error('[profileService] Caught exception:', error);
      console.error('[profileService] Exception details:', getErrorDetails(error));
      
      if (retryCount < 3) {
        console.log(`[profileService] Retrying after exception (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.fetchUserProfile(userId, retryCount + 1);
      }
      console.error('[profileService] Failed after all retries');
      return null;
    }
  },

  // Modern TypeScript pattern: Type-safe profile updates with extended fields
  async updateProfile(userId: string, updates: ExtendedProfileUpdate): Promise<boolean> {
    console.log('profileService: Updating profile for user:', userId);
    console.log('profileService: Extended update data:', updates);
    
    try {
      // Check if user has locked fields
      const currentProfile = await this.fetchUserProfile(userId);
      if (!currentProfile) {
        console.error('profileService: Cannot find user profile to check locks');
        return false;
      }
      
      // Create a copy of updates to modify
      const safeUpdates = { ...updates };
      
      // Note: Removed gender_locked and birth_date_locked checks since these fields 
      // don't exist in the database schema. If field locking is needed, it should be 
      // implemented with proper database fields or business logic.
      
      // Filter out fields that don't exist in the database schema
      const validUpdates = { ...safeUpdates };
      delete (validUpdates as any).birth_date;
      delete (validUpdates as any).onboarding_completed;
      delete (validUpdates as any).gender_locked;
      delete (validUpdates as any).birth_date_locked;
      
      // Log removed fields for debugging
      if ((safeUpdates as any).birth_date !== undefined) {
        console.log('profileService: Removing birth_date - field does not exist in database schema');
      }
      if ((safeUpdates as any).onboarding_completed !== undefined) {
        console.log('profileService: Removing onboarding_completed - field does not exist in database schema');
      }
      if ((safeUpdates as any).gender_locked !== undefined) {
        console.log('profileService: Removing gender_locked - field does not exist in database schema');
      }
      if ((safeUpdates as any).birth_date_locked !== undefined) {
        console.log('profileService: Removing birth_date_locked - field does not exist in database schema');
      }
      
      // Modern pattern: Include updated_at timestamp automatically
      const updateData: ExtendedProfileUpdate = {
        ...validUpdates,
        updated_at: new Date().toISOString()
      };
      
      console.log('profileService: Final update data with timestamp:', updateData);
      
      // Type-safe database update with extended fields support
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('profileService: Supabase update error:', error);
        return false;
      }
      
      console.log('profileService: Update successful, updated profile:', data);
      
      // Verify profile was updated successfully
      if (data) {
        console.log('profileService: Profile updated successfully');
      }
      
      return true;
    } catch (error) {
      console.error('profileService: Unexpected error during update:', error);
      return false;
    }
  },

  async fetchProfiles(userId: string, filters: FilterOptions = {}): Promise<Profile[]> {
    console.log('🚀 fetchProfiles FAST MODE - Direct Supabase');
    
    try {
      // Get user's swipes to exclude (simplified query)
      const { data: swipes } = await supabase
        .from('swipes')
        .select('target_user_id')
        .eq('user_id', userId);
      
      const swipedUserIds = swipes?.map(s => s.target_user_id) || [];
      
      // Get active boosts for priority ordering
      const { data: boostData } = await supabase
        .from('profile_boosts')
        .select('user_id')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString());
      const boostedUsers = new Map((boostData || []).map((b: { user_id: string }) => [b.user_id, 1]));
      
      // EGRESS OPTIMIZED: Fetch essential fields including photos
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .not('name', 'is', null)
        .limit(20);
      
      // Exclude swiped users if any
      if (swipedUserIds.length > 0) {
        query = query.not('id', 'in', `(${swipedUserIds.map(id => `'${id}'`).join(',')})`);
      }
    
      // Apply age filters using the age field instead of birth_date
      if (filters.ageRange) {
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1]);
      }

      // Apply gender filter if provided
      if (filters.gender && filters.gender !== 'everyone') {
        const genderMap: Record<string, string> = {
          'men': 'male',
          'women': 'female',
          'male': 'male',
          'female': 'female'
        };
        const targetGender = genderMap[filters.gender] || filters.gender;
        query = query.eq('gender', targetGender);
      }
      
      // Advanced filters (for Silver+ users)
      if (filters.interests && filters.interests.length > 0) {
        // Filter by common interests
        query = query.contains('interests', filters.interests);
      }
      
      if (filters.education) {
        query = query.eq('education', filters.education);
      }
      
      if (filters.occupation) {
        query = query.ilike('occupation', `%${filters.occupation}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }
      
      // Sort profiles with boosted users first
      let profiles = data || [];
      if (boostedUsers.size > 0) {
        profiles = profiles.sort((a, b) => {
          const aBoost = boostedUsers.get(a.id) || 0;
          const bBoost = boostedUsers.get(b.id) || 0;
          return bBoost - aBoost;
        });
      }
      
      // Return profiles with all photos for consistency with profile page
      const profilesWithPhotos = profiles.map(profile => ({
        ...profile,
        photos: profile.photos && profile.photos.length > 0 
          ? profile.photos // Return ALL photos, not just the first one
          : [profile.gender === 'male' 
              ? '/media/images/default_male.jpg' 
              : '/media/images/default_female.jpg'
            ]
      }));
      
      console.log(`✅ Profile query returned ${profilesWithPhotos.length} profiles with all photos`);
      return profilesWithPhotos;
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      return [];
    }
  },



  async fetchProfilesWithCompatibilityCheck(userId: string, filters: FilterOptions = {}): Promise<Profile[]> {
    const userProfile = await this.fetchUserProfile(userId);
    if (!userProfile) {
      console.error('User profile not found for compatibility matching');
      return [];
    }

    // Use smart matching service for orientation-aware filtering
    const { matchingService } = await import('./matchingService');
    const userLocation = filters.userLocation;
    
    // EGRESS OPTIMIZED: Reduced limit for compatibility matching
    return await matchingService.getSmartMatches(
      userProfile,
      userLocation,
      filters,
      20
    );
  }
};
