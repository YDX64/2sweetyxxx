import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  Profile, 
  FilterOptions, 
  ProfileWithDistance,
  ExtendedProfile,
  ExtendedProfileUpdate 
} from '@/types/profile';
import { profileService } from '@/services/profileService';
import { swipeService } from '@/services/swipeService';
import { likesService } from '@/services/likesService';
import { filterProfiles } from '@/utils/profileUtils';
import { supabase } from '@/integrations/supabase/client';
import { getErrorDetails } from '@/types/common';

export function useProfiles() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { preferences } = useUserPreferences();
  const [profiles, setProfiles] = useState<ProfileWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});

  // Memoize fetchUserProfile to prevent recreating on every render
  const fetchUserProfile = useCallback(async () => {
    if (!user) {
      console.log(t('debug.profiles.noUser'));
      setLoading(false);
      return;
    }
    
    console.log(t('debug.profiles.startingFetch'), user.id, user.email);
    
    // Set a timeout for the entire profile fetch operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 8000); // 8 second timeout
    });
    
    try {
      // Add detailed logging for debugging
      console.log(t('debug.profiles.callingService'));
      
      // Race between profile service call and timeout
      const data = await Promise.race([
        profileService.fetchUserProfile(user.id),
        timeoutPromise
      ]);
      
      console.log(t('debug.profiles.serviceReturned'), {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        data
      });
      
      if (data) {
        setUserProfile(data as Profile);
        console.log(t('debug.profiles.profileLoaded'));
        setLoading(false);
        return;
      }
      
      console.error(t('debug.profiles.profileNotFound'));
      
      // Check if profile exists but query failed
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      console.log(t('debug.profiles.directCheck'), {
        hasExisting: !!existingProfile,
        checkError,
        existingProfile
      });
      
      if (existingProfile) {
        console.log(t('debug.profiles.profileExists'));
        setUserProfile(existingProfile);
        setLoading(false);
        return;
      }
      
      // Create a default profile if none exists
      console.log(t('debug.profiles.creatingNew'));
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (createError) {
        console.error(t('debug.profiles.createError'), {
          error: createError,
          code: createError.code,
          message: createError.message,
          details: createError.details
        });
        setLoading(false);
      } else if (newProfile) {
        console.log(t('debug.profiles.createSuccess'), newProfile);
        setUserProfile(newProfile);
        setLoading(false);
      } else {
        console.error(t('debug.profiles.noProfileCreated'));
        setLoading(false);
      }
      
    } catch (error) {
      console.error(t('debug.profiles.fetchError'), error);
      console.error(t('debug.profiles.errorDetails'), getErrorDetails(error));
      setLoading(false); // Always stop loading on error
    }
  }, [user]);

  // Enhanced profile fetching with sexual orientation compatibility
  const fetchProfiles = useCallback(async (filters?: FilterOptions) => {
    if (!user || !userProfile) {
      console.log(t('debug.profiles.cannotFetch'));
      return;
    }
    
    const appliedFilters = filters || currentFilters;
    setLoading(true);
    
    // Convert null values to undefined for preference handling
    const normalizedPreferences = preferences ? {
      min_age: preferences.min_age ?? undefined,
      max_age: preferences.max_age ?? undefined,
      max_distance: preferences.max_distance ?? undefined,
      show_me: preferences.show_me ?? undefined
    } : undefined;
    
    try {
      // Apply age filters from preferences or filters (with defaults)
      const minAge = appliedFilters.ageRange?.[0] || preferences?.min_age || 18;
      const maxAge = appliedFilters.ageRange?.[1] || preferences?.max_age || 50;
      
      const filtersWithAge = {
        ...appliedFilters,
        ageRange: [minAge, maxAge] as [number, number]
      };

      // Add user location if available
      if (userProfile.latitude && userProfile.longitude) {
        filtersWithAge.userLocation = {
          latitude: userProfile.latitude,
          longitude: userProfile.longitude
        };
      }

      // Add sexual orientation and preference data to filters
      if (userProfile.sexual_orientation) {
        filtersWithAge.sexualOrientation = userProfile.sexual_orientation;
      }
      
      if (userProfile.interested_in) {
        filtersWithAge.interestedIn = userProfile.interested_in;
      }
      
      console.log(t('debug.profiles.fetchingWithFilters'), filtersWithAge);
      console.log(t('debug.profiles.orientationData'), {
        sexual_orientation: userProfile.sexual_orientation,
        interested_in: userProfile.interested_in,
        gender: userProfile.gender
      });
      
      // Use the enhanced compatibility-aware fetching
      const rawProfiles = await profileService.fetchProfilesWithCompatibilityCheck(user.id, filtersWithAge);
      const filteredProfiles = filterProfiles(rawProfiles, appliedFilters, normalizedPreferences);
      
      console.log(t('debug.profiles.foundProfiles', { raw: rawProfiles.length, filtered: filteredProfiles.length }));
      setProfiles(filteredProfiles);
      setCurrentFilters(appliedFilters);
    } catch (error) {
      console.error(t('debug.profiles.fetchProfilesError'), error);
      
      // Fallback to legacy method if smart matching fails
      console.log(t('debug.profiles.fallbackToLegacy'));
      try {
        const legacyFilters = {
          ...appliedFilters,
          ageRange: [appliedFilters.ageRange?.[0] || preferences?.min_age || 18,
                     appliedFilters.ageRange?.[1] || preferences?.max_age || 100] as [number, number]
        };
        
        const rawProfiles = await profileService.fetchProfiles(user.id, legacyFilters);
        const filteredProfiles = filterProfiles(rawProfiles, appliedFilters, normalizedPreferences);
        
        console.log(t('debug.profiles.fallbackFound', { raw: rawProfiles.length, filtered: filteredProfiles.length }));
        setProfiles(filteredProfiles);
        setCurrentFilters(appliedFilters);
      } catch (fallbackError) {
        console.error(t('debug.profiles.fallbackError'), fallbackError);
      }
    }
    
    setLoading(false);
  }, [user?.id, userProfile?.id, preferences?.min_age, preferences?.max_age, t]); // Only depend on specific values

  // Only fetch user profile when user changes
  useEffect(() => {
    if (!user) {
      console.log(t('debug.profiles.noUserReset'));
      setUserProfile(null);
      setLoading(false);
      return;
    }

    // Only fetch if we don't have a profile yet
    if (!userProfile) {
      console.log(t('debug.profiles.userEffectTriggered'), {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email
      });
      
      setLoading(true);
      fetchUserProfile();
    }
  }, [user?.id]); // Only depend on user.id to prevent unnecessary refetches

  // Only fetch profiles when user profile is loaded
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    console.log(t('debug.profiles.profileFetchEffect'), {
      hasUser: !!user,
      hasUserProfile: !!userProfile,
      hasPreferences: !!preferences,
      userId: user?.id,
      userProfile,
      preferences
    });
    
    // Fetch profiles even without preferences (will use defaults)
    if (user && userProfile && isMounted) {
      console.log(t('debug.profiles.userProfileAvailable'));
      fetchProfiles().catch(error => {
        console.error(t('debug.profiles.errorFetchingProfiles'), error);
        if (isMounted) {
          setLoading(false);
        }
      });
    } else if (user && !userProfile && isMounted) {
      console.log(t('debug.profiles.userExistsNoProfile'));
      console.log(t('debug.profiles.userId'), user.id);
      console.log(t('debug.profiles.userEmail'), user.email);
      
      // Don't keep loading indefinitely - set a timeout
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.log(t('debug.profiles.profileLoadingTimeout'));
          console.log(t('debug.profiles.fetchFailedTooLong'));
          setLoading(false);
        }
      }, 3000); // Reduced to 3 seconds
    } else if (!user && isMounted) {
      console.log(t('debug.profiles.noUserStoppingLoading'));
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user?.id, userProfile?.id, preferences?.min_age, preferences?.max_age]); // Only depend on specific values to prevent unnecessary refetches

  // Modern TypeScript pattern: Type-safe profile updates with extended fields
  const updateProfile = async (updates: ExtendedProfileUpdate) => {
    if (!user) {
      console.error(t('debug.profiles.noUserUpdate'));
      return false;
    }
    
    console.log(t('debug.profiles.updatingProfile'), updates);
    
    try {
      const success = await profileService.updateProfile(user.id, updates);
      console.log(t('debug.profiles.updateServiceResult'), success);
      
      if (success) {
        // Modern pattern: Type-safe state update
        setUserProfile(prev => prev ? { ...prev, ...updates } : null);
        console.log(t('debug.profiles.profileStateUpdated'));
        
        // Refetch user profile to ensure consistency
        await fetchUserProfile();
        
        // Trigger a manual refresh of any subscribed components
        // This ensures all components see the latest data
        const broadcastResult = await supabase
          .channel('profile-updates')
          .send({
            type: 'broadcast',
            event: 'profile-updated',
            payload: { userId: user.id }
          });
          
        if (!broadcastResult) {
          console.warn(t('debug.profiles.broadcastFailed'), broadcastResult);
        }
      } else {
        console.error(t('debug.profiles.updateFailed'));
      }
      
      return success;
    } catch (error) {
      console.error(t('debug.profiles.updateError'), error);
      return false;
    }
  };

  const swipeUser = async (targetUserId: string, direction: 'left' | 'right') => {
    if (!user) return false;
    
    let isMatch = false;
    
    if (direction === 'right') {
      // Use likesService for right swipes (likes) with proper validation
      const likeResult = await likesService.likeUser(user.id, targetUserId, false);
      
      if (!likeResult.success) {
        console.error('Like failed:', likeResult.message);
        // Don't remove profile if like failed due to validation
        return false;
      }
      
      isMatch = likeResult.isMatch || false;
    } else {
      // Use swipeService for left swipes (passes) - no validation needed
      isMatch = await swipeService.swipeUser(user.id, targetUserId, direction, false);
    }
    
    // Remove swiped user from current profiles only on success
    setProfiles(prev => prev.filter(p => p.id !== targetUserId));
    
    return isMatch;
  };

  const superLikeUser = async (targetUserId: string) => {
    if (!user) return false;
    
    console.log('[useProfiles] SuperLike attempt for user:', targetUserId);
    
    // Use likesService for super likes with proper validation
    const superLikeResult = await likesService.likeUser(user.id, targetUserId, true);
    console.log('[useProfiles] SuperLike result:', superLikeResult);
    
    if (!superLikeResult.success) {
      console.error('SuperLike failed:', superLikeResult.message);
      // Don't remove profile if super like failed due to validation
      return false;
    }
    
    const isMatch = superLikeResult.isMatch || false;
    
    // Remove the profile after successful SuperLike
    console.log('[useProfiles] Removing swiped profile from list');
    setProfiles(prev => prev.filter(p => p.id !== targetUserId));
    
    return isMatch;
  };

  const refetchProfiles = useCallback((filters?: FilterOptions) => {
    fetchProfiles(filters);
  }, [fetchProfiles]);

  // Force refresh with cache invalidation for rewind operations
  const forceRefreshProfiles = useCallback(() => {
    // Clear any potential local state cache
    setProfiles([]);
    
    // Trigger fresh fetch with a small delay for Supabase consistency
    setTimeout(() => {
      fetchProfiles(currentFilters);
    }, 300);
  }, [fetchProfiles, currentFilters]);

  return {
    profiles,
    setProfiles, // Export setProfiles for direct profile manipulation (e.g., rewind)
    userProfile,
    loading,
    updateProfile,
    swipeUser,
    superLikeUser,
    refetchProfiles: forceRefreshProfiles // Use force refresh by default
  };
}
