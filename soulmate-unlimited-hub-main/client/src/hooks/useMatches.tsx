
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Tables } from '@/integrations/supabase/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type PartialProfile = {
  id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  subscription_tier: string | null;
  location: string | null;
  photos?: string[] | null;
  bio?: string | null;
};

type Match = Tables<'matches'> & {
  matched_user: PartialProfile;
};

type MatchWithConversation = Match & {
  has_conversation?: boolean;
};

export const useMatches = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  // Use React Query for caching and optimized data fetching
  const { data: matches = [], isLoading: loading, refetch } = useQuery<MatchWithConversation[]>({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log(t('debug.matches.fetching'));
      
      // Parallel fetch for better performance
      const [matchesResponse, conversationsResponse] = await Promise.all([
        supabase
          .from('matches')
          .select(`
            id, user1_id, user2_id, created_at,
            user1_profile:profiles!matches_user1_id_fkey(id, name, age, gender, subscription_tier, location, photos, bio),
            user2_profile:profiles!matches_user2_id_fkey(id, name, age, gender, subscription_tier, location, photos, bio)
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(50),
        
        // Pre-fetch conversations to check which matches have messages
        supabase
          .from('conversations')
          .select('id, participant1_id, participant2_id')
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      ]);
      
      if (matchesResponse.error) {
        console.error(t('debug.matches.fetchError'), matchesResponse.error);
        return [];
      }
      
      const conversationMap = new Map();
      conversationsResponse.data?.forEach(conv => {
        const otherUserId = conv.participant1_id === user.id 
          ? conv.participant2_id 
          : conv.participant1_id;
        conversationMap.set(otherUserId, conv.id);
      });
      
      // Format matches with conversation info
      const formattedMatches = matchesResponse.data?.map(match => {
        const matchedUser = match.user1_id === user.id 
          ? match.user2_profile 
          : match.user1_profile;
        
        return {
          ...match,
          matched_user: matchedUser,
          has_conversation: conversationMap.has(matchedUser.id)
        };
      }) || [];
      
      console.log(t('debug.matches.fetchSuccess', { count: formattedMatches?.length || 0 }));
      return formattedMatches || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes (increased from 30 seconds)
    gcTime: 1000 * 60 * 30, // 30 minutes (increased from 5)
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    refetchInterval: false, // No automatic polling
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`matches-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        },
        () => {
          console.log(t('debug.matches.newMatchDetected'));
          queryClient.invalidateQueries({ queryKey: ['matches', user.id] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, queryClient]);

  // Memoize sorted matches
  const sortedMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return { newMatches: [], olderMatches: [] };
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const newMatches = matches.filter((match) =>
      new Date(match.created_at) > oneDayAgo && !match.has_conversation
    );
    
    const olderMatches = matches.filter((match) =>
      new Date(match.created_at) <= oneDayAgo || match.has_conversation
    );
    
    return { newMatches, olderMatches };
  }, [matches]);

  const refetchMatches = useCallback(() => {
    refetch();
  }, [refetch]);

  return { 
    matches, 
    loading, 
    refetchMatches,
    ...sortedMatches
  };
};
