import { createClient } from '@supabase/supabase-js';

// Supabase configuration - use environment variables for security
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client for mobile
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      }
    }
  }
});

// Mobile-specific helper functions
export const mobileAuthHelpers = {
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async signUp(email, password, name) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Mobile-specific profile helpers
export const mobileProfileHelpers = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getDiscoveryProfiles(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, profiles: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Swipe helpers for mobile
export const mobileSwipeHelpers = {
  async likeUser(userId, targetUserId, isSuperLike = false) {
    try {
      // Check if already swiped
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .maybeSingle();

      if (existingSwipe) {
        return { success: false, error: 'Already swiped on this user' };
      }

      // Create swipe record
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          direction: 'right'
        });

      if (swipeError) {
        return { success: false, error: swipeError.message };
      }

      // Create super like record if needed
      if (isSuperLike) {
        await supabase
          .from('super_likes')
          .insert({
            user_id: userId,
            target_user_id: targetUserId
          });
      }

      // Check for match
      const { data: theirSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('target_user_id', userId)
        .eq('direction', 'right')
        .maybeSingle();

      if (theirSwipe) {
        // It's a match!
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: userId,
            user2_id: targetUserId
          })
          .select()
          .single();

        if (!matchError && match) {
          return {
            success: true,
            isMatch: true,
            message: 'It\'s a match!',
            matchId: match.id
          };
        }
      }

      return {
        success: true,
        message: isSuperLike ? 'Super like sent!' : 'Liked!'
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async passUser(userId, targetUserId) {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          direction: 'left'
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Passed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Real-time sync helpers for mobile
export const mobileRealtimeHelpers = {
  subscribeToMatches(userId, callback) {
    return supabase
      .channel(`matches:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToMessages(matchId, callback) {
    return supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToSwipeNotifications(userId, callback) {
    return supabase
      .channel(`swipe_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `target_user_id=eq.${userId}&&direction=eq.right`
        },
        callback
      )
      .subscribe();
  }
};

export default supabase;