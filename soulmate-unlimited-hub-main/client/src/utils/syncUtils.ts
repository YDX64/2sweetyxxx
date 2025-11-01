import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const syncUtils = {
  /**
   * Force refresh all user data from Supabase
   */
  async forceRefreshUserData(userId: string) {
    console.log('🔄 Force refreshing user data...');
    const startTime = Date.now();
    
    try {
      // Refresh auth session
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) throw sessionError;
      
      // Clear any local storage caches
      const keysToRefresh = ['profiles', 'subscriptions', 'preferences'];
      keysToRefresh.forEach(key => {
        const storageKey = `supabase.auth.${key}`;
        if (localStorage.getItem(storageKey)) {
          localStorage.removeItem(storageKey);
        }
      });
      
      // Force reload profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      // Broadcast refresh event
      await supabase
        .channel('sync-updates')
        .send({
          type: 'broadcast',
          event: 'force-refresh',
          payload: { userId, timestamp: Date.now() }
        });
      
      const elapsed = Date.now() - startTime;
      console.log(`✅ User data refreshed successfully in ${elapsed}ms`);
      
      return { success: true, profile };
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      toast.error('Failed to sync data', {
        description: 'Please refresh the page',
      });
      return { success: false, error };
    }
  },
  
  /**
   * Check if data needs to be refreshed based on last sync time
   */
  shouldRefreshData(lastSyncTime?: number): boolean {
    if (!lastSyncTime) return true;
    
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - lastSyncTime) > fiveMinutes;
  },
  
  /**
   * Listen for sync events from other tabs/windows
   */
  listenForSyncEvents(callback: (event: any) => void) {
    const channel = supabase
      .channel('sync-updates')
      .on('broadcast', { event: '*' }, callback)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }
};