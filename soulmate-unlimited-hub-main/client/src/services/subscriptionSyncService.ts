import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Subscription = Tables<'subscribers'>;
type SubscriptionCallback = (data: SubscriptionUpdate) => void;

export interface SubscriptionUpdate {
  profile?: Partial<Profile>;
  subscription?: Partial<Subscription>;
  usageLimits?: {
    dailyLikesUsed: number;
    dailySuperLikesUsed: number;
    dailyBoostsUsed: number;
    monthlyBoostsUsed: number;
    lastUsageResetDate: string;
    lastBoostResetDate: string;
  };
}

class SubscriptionSyncService {
  private channel: RealtimeChannel | null = null;
  private broadcastChannel: RealtimeChannel | null = null;
  private callbacks: Set<SubscriptionCallback> = new Set();
  private userId: string | null = null;
  private isConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3; // EGRESS OPTIMIZED: Reduced from 5 to 3 attempts
  private reconnectDelay: number = 5000; // EGRESS OPTIMIZED: Start with 5 seconds instead of 1

  // Initialize the sync service for a specific user
  async initialize(userId: string): Promise<void> {
    if (this.userId === userId && this.isConnected) {
      if (import.meta.env.DEV) {
        console.log('🔄 Subscription sync already initialized for user:', userId);
      }
      return;
    }

    this.userId = userId;
    await this.cleanup();
    await this.setupRealtimeSubscriptions();
    await this.setupBroadcastChannel();
  }

  // Setup realtime subscriptions for profile and subscription changes
  private async setupRealtimeSubscriptions(): Promise<void> {
    if (!this.userId) return;

    try {
      // Create channel for database changes
      this.channel = supabase
        .channel(`subscription_changes_${this.userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${this.userId}`
          },
          (payload: RealtimePostgresChangesPayload<Profile>) => {
            if (import.meta.env.DEV) {
              console.log('📊 Profile change detected:', payload);
            }
            this.handleProfileChange(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${this.userId}`
          },
          (payload: RealtimePostgresChangesPayload<Subscription>) => {
            if (import.meta.env.DEV) {
              console.log('💳 Subscription change detected:', payload);
            }
            this.handleSubscriptionChange(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            if (import.meta.env.DEV) {
              console.log('✅ Subscription sync connected');
            }
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            if (import.meta.env.DEV) {
              console.warn('⚠️ Subscription sync disconnected:', status);
            }
            this.isConnected = false;
            
            // Import logService dynamically to avoid circular dependencies
            import('@/services/logService').then(({ logService }) => {
              logService.warn('SUBSCRIPTION', 'Subscription sync disconnected', {
                status,
                userId: this.userId,
                channelName: `subscription_changes_${this.userId}`,
                reconnectAttempts: this.reconnectAttempts,
                maxReconnectAttempts: this.maxReconnectAttempts
              });
            });
            
            this.scheduleReconnect();
          }
        });
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error);
      
      // Log the subscription setup error
      import('@/services/logService').then(({ logService }) => {
        logService.error('SUBSCRIPTION', 'Failed to setup realtime subscriptions', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          userId: this.userId,
          channelName: `subscription_changes_${this.userId}`
        });
      });
      
      this.scheduleReconnect();
    }
  }

  // Setup broadcast channel for cross-tab/device sync
  private async setupBroadcastChannel(): Promise<void> {
    if (!this.userId) return;

    try {
      this.broadcastChannel = supabase
        .channel(`usage_sync_${this.userId}`)
        .on(
          'broadcast',
          { event: 'usage_update' },
          (payload) => {
            console.log('📡 Usage update received:', payload);
            this.notifyCallbacks({
              usageLimits: payload.payload
            });
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error setting up broadcast channel:', error);
    }
  }

  // Handle profile changes
  private handleProfileChange(payload: RealtimePostgresChangesPayload<Profile>): void {
    const profile = payload.new as Profile;
    
    // Extract usage data from profile
    const usageLimits = {
      dailyLikesUsed: profile.daily_likes_used || 0,
      dailySuperLikesUsed: profile.daily_super_likes_used || 0,
      dailyBoostsUsed: profile.daily_boosts_used || 0,
      monthlyBoostsUsed: profile.daily_boosts_used || 0,
      lastUsageResetDate: profile.last_like_reset_date || new Date().toISOString(),
      lastBoostResetDate: profile.last_like_reset_date || new Date().toISOString()
    };

    this.notifyCallbacks({
      profile,
      usageLimits
    });
  }

  // Handle subscription changes
  private handleSubscriptionChange(payload: RealtimePostgresChangesPayload<Subscription>): void {
    const subscription = payload.new as Subscription;
    
    this.notifyCallbacks({
      subscription
    });
  }

  // Broadcast usage update to other tabs/devices
  async broadcastUsageUpdate(usageLimits: Partial<SubscriptionUpdate['usageLimits']>): Promise<void> {
    if (!this.broadcastChannel) return;

    try {
      await this.broadcastChannel.send({
        type: 'broadcast',
        event: 'usage_update',
        payload: usageLimits
      });
    } catch (error) {
      console.error('Error broadcasting usage update:', error);
    }
  }

  // Subscribe to updates
  subscribe(callback: SubscriptionCallback): () => void {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  // Notify all callbacks
  private notifyCallbacks(update: SubscriptionUpdate): void {
    this.callbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });
  }

  // Schedule reconnection with exponential backoff
  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      if (import.meta.env.DEV) {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      }
      
      // Only cleanup old connections, don't cleanup during reconnect
      if (this.channel) {
        this.channel.unsubscribe();
        this.channel = null;
      }
      if (this.broadcastChannel) {
        this.broadcastChannel.unsubscribe();
        this.broadcastChannel = null;
      }
      
      await this.setupRealtimeSubscriptions();
      await this.setupBroadcastChannel();
      
      // EGRESS OPTIMIZED: Slower exponential backoff to reduce connection attempts
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 60000); // Max 1 minute
    }, this.reconnectDelay);
  }

  // Force refresh subscription data
  async forceRefresh(): Promise<SubscriptionUpdate | null> {
    if (!this.userId) return null;

    try {
      // EGRESS OPTIMIZED: Fetch only essential fields instead of full records
      const [profileResult, subscriptionResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, daily_likes_used, daily_super_likes_used, daily_boosts_used, last_like_reset_date, subscription_tier')
          .eq('id', this.userId)
          .single(),
        supabase
          .from('subscribers')
          .select('user_id, subscription_tier, subscribed, subscription_end')
          .eq('user_id', this.userId)
          .single()
      ]);

      const update: SubscriptionUpdate = {};

      if (profileResult.data) {
        update.profile = profileResult.data;
        update.usageLimits = {
          dailyLikesUsed: profileResult.data.daily_likes_used || 0,
          dailySuperLikesUsed: profileResult.data.daily_super_likes_used || 0,
          dailyBoostsUsed: profileResult.data.daily_boosts_used || 0,
          monthlyBoostsUsed: profileResult.data.daily_boosts_used || 0,
          lastUsageResetDate: profileResult.data.last_like_reset_date || new Date().toISOString(),
          lastBoostResetDate: profileResult.data.last_like_reset_date || new Date().toISOString()
        };
      }

      if (subscriptionResult.data) {
        update.subscription = subscriptionResult.data;
      }

      // Notify all listeners
      this.notifyCallbacks(update);

      return update;
    } catch (error) {
      console.error('Error forcing subscription refresh:', error);
      return null;
    }
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    if (this.broadcastChannel) {
      await supabase.removeChannel(this.broadcastChannel);
      this.broadcastChannel = null;
    }

    this.isConnected = false;
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const subscriptionSyncService = new SubscriptionSyncService();