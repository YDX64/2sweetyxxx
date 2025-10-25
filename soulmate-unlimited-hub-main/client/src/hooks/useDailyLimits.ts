import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/hooks/use-toast';

interface DailyLimits {
  likes: { used: number; limit: number; remaining: number };
  superlikes: { used: number; limit: number; remaining: number };
  boosts: { used: number; limit: number; remaining: number };
  lastResetDate: string | null;
}

export const useDailyLimits = () => {
  const { user } = useAuth();
  const { subscription_tier, features } = useSubscription();
  const { t } = useLanguage();
  const [limits, setLimits] = useState<DailyLimits>({
    likes: { used: 0, limit: 10, remaining: 10 },
    superlikes: { used: 0, limit: 1, remaining: 1 },
    boosts: { used: 0, limit: 0, remaining: 0 },
    lastResetDate: null
  });
  const [loading, setLoading] = useState(true);

  // Load current usage from database
  const loadUsage = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('daily_swipes, daily_super_likes, daily_boosts_used, last_swipe_reset')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const lastReset = profile?.last_swipe_reset?.split('T')[0];

      // Check if we need to reset daily counters
      if (lastReset !== today) {
        // Reset counters for new day
        await resetDailyCounters();
      } else {
        // Use existing counters
        setLimits({
          likes: {
            used: profile.daily_swipes || 0,
            limit: features.dailyLikes,
            remaining: Math.max(0, features.dailyLikes - (profile.daily_swipes || 0))
          },
          superlikes: {
            used: profile.daily_super_likes || 0,
            limit: features.dailySuperlikes,
            remaining: Math.max(0, features.dailySuperlikes - (profile.daily_super_likes || 0))
          },
          boosts: {
            used: profile.daily_boosts_used || 0,
            limit: features.monthlyBoosts,
            remaining: Math.max(0, features.monthlyBoosts - (profile.daily_boosts_used || 0))
          },
          lastResetDate: profile.last_swipe_reset
        });
      }
    } catch (error) {
      console.error('Error loading daily limits:', error);
      toast({
        title: t('error'),
        description: t('errorOccurred'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset daily counters
  const resetDailyCounters = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_swipes: 0,
          daily_super_likes: 0,
          daily_boosts_used: 0,
          last_swipe_reset: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setLimits({
        likes: { used: 0, limit: features.dailyLikes, remaining: features.dailyLikes },
        superlikes: { used: 0, limit: features.dailySuperlikes, remaining: features.dailySuperlikes },
        boosts: { used: 0, limit: features.monthlyBoosts, remaining: features.monthlyBoosts },
        lastResetDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error resetting daily counters:', error);
      toast({
        title: t('error'),
        description: t('errorOccurred'),
        variant: "destructive"
      });
    }
  };

  // Check if action is allowed
  const canPerformAction = (action: 'like' | 'superlike' | 'boost'): boolean => {
    switch (action) {
      case 'like':
        return limits.likes.remaining > 0 || features.dailyLikes === 999;
      case 'superlike':
        return limits.superlikes.remaining > 0 || features.dailySuperlikes === 999;
      case 'boost':
        return limits.boosts.remaining > 0 || features.monthlyBoosts === 999;
      default:
        return false;
    }
  };

  // Use an action (increment counter)
  const useAction = async (action: 'like' | 'superlike' | 'boost'): Promise<boolean> => {
    if (!user) return false;

    if (!canPerformAction(action)) {
      toast({
        title: t('limit.exceeded'),
        description: t('limit.description', { action }),
        variant: "destructive"
      });
      return false;
    }

    try {
      let updateField = '';
      let currentUsed = 0;

      switch (action) {
        case 'like':
          updateField = 'daily_swipes';
          currentUsed = limits.likes.used;
          break;
        case 'superlike':
          updateField = 'daily_super_likes';
          currentUsed = limits.superlikes.used;
          break;
        case 'boost':
          updateField = 'daily_boosts_used';
          currentUsed = limits.boosts.used;
          break;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ [updateField]: currentUsed + 1 })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setLimits(prev => ({
        ...prev,
        [action === 'like' ? 'likes' : action === 'superlike' ? 'superlikes' : 'boosts']: {
          used: currentUsed + 1,
          limit: prev[action === 'like' ? 'likes' : action === 'superlike' ? 'superlikes' : 'boosts'].limit,
          remaining: Math.max(0, prev[action === 'like' ? 'likes' : action === 'superlike' ? 'superlikes' : 'boosts'].limit - (currentUsed + 1))
        }
      }));

      return true;
    } catch (error) {
      console.error(`Error using ${action}:`, error);
      toast({
        title: t('error'),
        description: t('errorOccurred'),
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadUsage();
  }, [user, features]);

  return {
    limits,
    loading,
    canPerformAction,
    useAction,
    refreshLimits: loadUsage
  };
};