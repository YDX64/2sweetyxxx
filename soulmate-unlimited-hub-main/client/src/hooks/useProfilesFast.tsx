import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileWithDistance } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { calculateDistance } from '@/utils/location';

interface Filters {
  ageRange?: [number, number];
  distance?: number;
  gender?: string;
  userLocation?: { latitude: number; longitude: number };
}

export function useProfilesFast() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({
    ageRange: [18, 50],
    distance: 50,
    gender: 'everyone'
  });

  // Fetch user profile with React Query - optimized for egress reduction
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, gender, interested_in, latitude, longitude, age, subscription_tier')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15, // 15 minutes (increased for longer caching)
    gcTime: 1000 * 60 * 60, // 1 hour (profile data changes infrequently)
  });

  // Fetch profiles with React Query
  const { data: profiles = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['profiles', user?.id, filters],
    queryFn: async () => {
      if (!user || !userProfile) return [];
      
      console.log('🚀 Fetching profiles with fast method...');
      
      // Get swiped users to exclude
      const { data: swipedUsers } = await supabase
        .from('swipes')
        .select('target_user_id')
        .eq('user_id', user.id);
        
      const swipedUserIds = swipedUsers?.map(s => s.target_user_id) || [];
      
      // Build query - optimized SELECT for egress reduction
      let query = supabase
        .from('profiles')
        .select('id, name, age, gender, interested_in, bio, interests, location, latitude, longitude, subscription_tier, is_banned, created_at')
        .neq('id', user.id)
        .eq('is_banned', false)
        .order('created_at', { ascending: false })
        .limit(25); // Reduced from 50 to 25 for egress optimization
      
      // Exclude swiped users if any
      if (swipedUserIds.length > 0) {
        query = query.not('id', 'in', `(${swipedUserIds.map(id => `'${id}'`).join(',')})`);
      }
      
      // Apply age filter
      if (filters.ageRange) {
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1]);
      }
      
      // Apply gender filter based on user preferences
      if (userProfile?.interested_in && userProfile.interested_in !== 'both') {
        const genderMap: Record<string, string> = {
          'men': 'male',
          'women': 'female',
          'male': 'male',
          'female': 'female',
          'both': 'both'
        };
        const targetGender = genderMap[userProfile.interested_in] || userProfile.interested_in;
        if (targetGender !== 'both') {
          query = query.eq('gender', targetGender);
        }
      }
      
      const { data: profilesData, error } = await query;
      
      if (error) {
        console.error('Error fetching profiles:', error);
        console.error('Query details:', { 
          swipedUserIds: swipedUserIds.length,
          filters,
          userProfile
        });
        throw error;
      }
      
      console.log('Profiles fetched:', profilesData?.length || 0);
      
      // Calculate distances if location available
      let profilesWithDistance = profilesData || [];
      
      if (filters.userLocation || (userProfile?.latitude && userProfile?.longitude)) {
        const userLat = filters.userLocation?.latitude || userProfile.latitude;
        const userLng = filters.userLocation?.longitude || userProfile.longitude;
        
        profilesWithDistance = profilesData
          .map(profile => {
            const distance = profile.latitude && profile.longitude && userLat && userLng
              ? calculateDistance(userLat, userLng, Number(profile.latitude), Number(profile.longitude))
              : null;
            
            return {
              ...profile,
              distance
            } as ProfileWithDistance;
          })
          .filter(profile => {
            if (!profile.distance) return true;
            return profile.distance <= (filters.distance || 50);
          })
          .sort((a, b) => {
            if (!a.distance || !b.distance) return 0;
            return a.distance - b.distance;
          });
      }
      
      console.log(`✅ Found ${profilesWithDistance.length} profiles`);
      return profilesWithDistance;
    },
    enabled: !!user && !!userProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes (increased from 2)
    gcTime: 1000 * 60 * 20, // 20 minutes (increased from 5)
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    refetchInterval: false, // No automatic polling
  });

  // Swipe function
  const swipeUser = useCallback(async (targetUserId: string, direction: 'left' | 'right') => {
    if (!user) return false;
    
    try {
      // Record swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_user_id: targetUserId,
          direction
        });
        
      if (swipeError) throw swipeError;
      
      // Check for match if it's a like
      if (direction === 'right') {
        const { data: reciprocalSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('target_user_id', user.id)
          .eq('direction', 'right')
          .maybeSingle();
          
        if (reciprocalSwipe) {
          // Create match
          await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: targetUserId
            });
            
          return true; // It's a match!
        }
      }
      
      // Remove from local cache immediately
      queryClient.setQueryData(['profiles', user.id, filters], (old: ProfileWithDistance[] = []) => 
        old.filter(p => p.id !== targetUserId)
      );
      
      return false;
    } catch (error) {
      console.error('Error swiping:', error);
      return false;
    }
  }, [user, queryClient, filters]);

  // Super like function
  const superLikeUser = useCallback(async (targetUserId: string) => {
    if (!user) return false;
    
    try {
      await supabase
        .from('super_likes')
        .insert({
          user_id: user.id,
          target_user_id: targetUserId
        });
        
      // Also record as a like
      await swipeUser(targetUserId, 'right');
      
      return true;
    } catch (error) {
      console.error('Error super liking:', error);
      return false;
    }
  }, [user, swipeUser]);

  // Force refresh: cache invalidate + refetch
  const forceRefreshProfiles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] });
    setTimeout(() => {
      refetch();
    }, 300); // Supabase eventual consistency için küçük bir gecikme
  }, [queryClient, user?.id, refetch]);

  const refetchProfiles = useCallback((newFilters?: Filters) => {
    if (newFilters) {
      setFilters(newFilters);
    }
    refetch();
  }, [refetch]);

  return {
    profiles,
    userProfile,
    loading,
    swipeUser,
    superLikeUser,
    refetchProfiles: forceRefreshProfiles,
    updateProfile: async () => true // Placeholder
  };
}