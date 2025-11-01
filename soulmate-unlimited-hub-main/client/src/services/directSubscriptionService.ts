import { supabase } from '@/integrations/supabase/client';

export interface UserUsage {
  id: string;
  daily_likes_used: number;
  daily_super_likes_used: number;
  daily_boosts_used: number;
  last_like_reset_date: string;
  role: string;
  email: string;
}

export interface SubscriptionLimits {
  dailyLikes: number;
  dailySuperLikes: number;
  dailyBoosts: number;
  features: string[];
}

export interface SubscriptionTier {
  name: string;
  role: string;
  limits: SubscriptionLimits;
  price: number;
  features: string[];
}

export class DirectSubscriptionService {
  private subscriptionTiers: Record<string, SubscriptionTier> = {
    registered: {
      name: 'Free',
      role: 'registered',
      limits: { dailyLikes: 5, dailySuperLikes: 1, dailyBoosts: 0, features: ['basic_matching'] },
      price: 0,
      features: ['Basic matching', '5 likes per day', '1 super like per day']
    },
    silver: {
      name: 'Silver',
      role: 'silver',
      limits: { dailyLikes: 50, dailySuperLikes: 5, dailyBoosts: 2, features: ['basic_matching', 'advanced_filters'] },
      price: 9.99,
      features: ['Everything in Free', '50 likes per day', '5 super likes per day', '2 boosts per day', 'Advanced filters']
    },
    gold: {
      name: 'Gold',
      role: 'gold',
      limits: { dailyLikes: 100, dailySuperLikes: 10, dailyBoosts: 3, features: ['basic_matching', 'advanced_filters', 'video_calls'] },
      price: 19.99,
      features: ['Everything in Silver', '100 likes per day', '10 super likes per day', '3 boosts per month', 'Video calls']
    },
    platinum: {
      name: 'Platinum',
      role: 'platinum',
      limits: { dailyLikes: 999, dailySuperLikes: 25, dailyBoosts: 10, features: ['basic_matching', 'advanced_filters', 'video_calls', 'unlimited'] },
      price: 29.99,
      features: ['Everything in Gold', 'Unlimited likes', '25 super likes per day', '10 boosts per month', 'Priority support']
    }
  };

  async getUserUsage(userId: string): Promise<UserUsage | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, daily_likes_used, daily_super_likes_used, daily_boosts_used, last_like_reset_date, role, email')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Failed to get user usage:', error);
        return null;
      }

      return data as UserUsage;
    } catch (error) {
      console.error('Error fetching user usage:', error);
      return null;
    }
  }

  async resetDailyUsage(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_likes_used: 0,
          daily_super_likes_used: 0,
          daily_boosts_used: 0,
          last_like_reset_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to reset daily usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resetting daily usage:', error);
      return false;
    }
  }

  async incrementLikes(userId: string, newCount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_likes_used: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to increment likes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing likes:', error);
      return false;
    }
  }

  async incrementSuperLikes(userId: string, currentCount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_super_likes_used: currentCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to increment super likes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing super likes:', error);
      return false;
    }
  }

  async incrementBoosts(userId: string, currentCount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_boosts_used: currentCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to increment boosts:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing boosts:', error);
      return false;
    }
  }

  getSubscriptionTier(role: string): SubscriptionTier {
    return this.subscriptionTiers[role] || this.subscriptionTiers.registered;
  }

  getAllTiers(): SubscriptionTier[] {
    return Object.values(this.subscriptionTiers);
  }

  canPerformAction(usage: UserUsage, action: 'like' | 'super_like' | 'boost'): boolean {
    const tier = this.getSubscriptionTier(usage.role);
    
    switch (action) {
      case 'like':
        return usage.daily_likes_used < tier.limits.dailyLikes;
      case 'super_like':
        return usage.daily_super_likes_used < tier.limits.dailySuperLikes;
      case 'boost':
        return usage.daily_boosts_used < tier.limits.dailyBoosts;
      default:
        return false;
    }
  }

  getRemainingActions(usage: UserUsage): { likes: number; superLikes: number; boosts: number } {
    const tier = this.getSubscriptionTier(usage.role);
    
    return {
      likes: Math.max(0, tier.limits.dailyLikes - usage.daily_likes_used),
      superLikes: Math.max(0, tier.limits.dailySuperLikes - usage.daily_super_likes_used),
      boosts: Math.max(0, tier.limits.dailyBoosts - usage.daily_boosts_used)
    };
  }

  getRecommendedUpgrade(currentRole: string): SubscriptionTier | null {
    const tierOrder = ['registered', 'silver', 'gold', 'platinum'];
    const currentIndex = tierOrder.indexOf(currentRole);
    
    if (currentIndex >= 0 && currentIndex < tierOrder.length - 1) {
      const nextTier = tierOrder[currentIndex + 1];
      return this.subscriptionTiers[nextTier];
    }
    
    return null;
  }

  hasFeature(role: string, feature: string): boolean {
    const tier = this.getSubscriptionTier(role);
    return tier.limits.features.includes(feature);
  }

  async checkAndResetDailyLimits(userId: string): Promise<boolean> {
    try {
      const usage = await this.getUserUsage(userId);
      if (!usage) return false;

      const lastReset = new Date(usage.last_like_reset_date);
      const now = new Date();
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

      // Reset if more than 24 hours have passed
      if (hoursSinceReset >= 24) {
        return await this.resetDailyUsage(userId);
      }

      return true;
    } catch (error) {
      console.error('Error checking daily limits:', error);
      return false;
    }
  }

  // Test helper methods
  async getTestUsers(): Promise<UserUsage[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, daily_likes_used, daily_super_likes_used, daily_boosts_used, last_like_reset_date, role, email')
        .in('email', ['free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com'])
        .order('role');
      
      if (error) {
        console.error('Failed to get test users:', error);
        return [];
      }

      return data as UserUsage[];
    } catch (error) {
      console.error('Error fetching test users:', error);
      return [];
    }
  }

  async createTestUsers(): Promise<boolean> {
    try {
      // First, delete existing test users
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .in('email', ['free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com']);

      if (deleteError && !deleteError.message.includes('Nothing to delete')) {
        console.error('Failed to delete existing test users:', deleteError);
      }

      // Create new test users
      const testUsers = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Free User Test',
          email: 'free@test.com',
          role: 'registered' as const,
          daily_likes_used: 4,
          daily_super_likes_used: 1,
          daily_boosts_used: 0,
          last_like_reset_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Silver User Test',
          email: 'silver@test.com',
          role: 'silver' as const,
          daily_likes_used: 20,
          daily_super_likes_used: 3,
          daily_boosts_used: 1,
          last_like_reset_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Gold User Test',
          email: 'gold@test.com',
          role: 'gold' as const,
          daily_likes_used: 80,
          daily_super_likes_used: 20,
          daily_boosts_used: 3,
          last_like_reset_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'Platinum User Test',
          email: 'platinum@test.com',
          role: 'platinum' as const,
          daily_likes_used: 500,
          daily_super_likes_used: 100,
          daily_boosts_used: 20,
          last_like_reset_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(testUsers);

      if (insertError) {
        console.error('Failed to create test users:', insertError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating test users:', error);
      return false;
    }
  }
}

export const directSubscriptionService = new DirectSubscriptionService();