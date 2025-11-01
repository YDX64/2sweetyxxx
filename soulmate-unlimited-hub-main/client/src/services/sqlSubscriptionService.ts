import { supabase } from '@/integrations/supabase/client';

export interface UserUsage {
  id: string;
  email: string;
  role: string;
  daily_likes_used: number;
  daily_super_likes_used: number;
  daily_boosts_used: number;
  last_like_reset_date: string;
}

export interface SubscriptionTier {
  name: string;
  role: string;
  limits: {
    dailyLikes: number;
    dailySuperLikes: number;
    dailyBoosts: number;
    features: string[];
  };
  price: number;
  features: string[];
}

export class SqlSubscriptionService {
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

  // Remove executeSql method - use direct Supabase queries instead

  async getUserUsage(userId: string): Promise<UserUsage | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, daily_likes_used, daily_super_likes_used, daily_boosts_used, last_like_reset_date')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email || '',
        role: data.role || 'registered',
        daily_likes_used: data.daily_likes_used || 0,
        daily_super_likes_used: data.daily_super_likes_used || 0,
        daily_boosts_used: data.daily_boosts_used || 0,
        last_like_reset_date: data.last_like_reset_date || ''
      };
    } catch (error) {
      console.error('Failed to get user usage:', error);
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
      
      return !error;
    } catch (error) {
      console.error('Failed to reset daily usage:', error);
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
      
      return !error;
    } catch (error) {
      console.error('Failed to increment likes:', error);
      return false;
    }
  }

  async incrementSuperLikes(userId: string): Promise<boolean> {
    try {
      // First get current count
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_super_likes_used')
        .eq('id', userId)
        .single();
      
      const currentCount = profile?.daily_super_likes_used || 0;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_super_likes_used: currentCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      return !error;
    } catch (error) {
      console.error('Failed to increment super likes:', error);
      return false;
    }
  }

  async incrementBoosts(userId: string): Promise<boolean> {
    try {
      // First get current count
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_boosts_used')
        .eq('id', userId)
        .single();
      
      const currentCount = profile?.daily_boosts_used || 0;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_boosts_used: currentCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to increment boosts:', error);
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

  async createTestUsers(): Promise<boolean> {
    try {
      // Delete existing test users
      const deleteQuery = `
        DELETE FROM profiles 
        WHERE email IN ('free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com')
      `;
      await supabase
        .from('profiles')
        .delete()
        .in('email', ['free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com']);

      // Insert new test users
      const insertQuery = `
        INSERT INTO profiles (
          id, name, email, role, 
          daily_likes_used, daily_super_likes_used, daily_boosts_used, 
          last_like_reset_date, created_at, updated_at
        ) VALUES 
          ('550e8400-e29b-41d4-a716-446655440001', 'Free User Test', 'free@test.com', 'registered', 4, 1, 0, NOW(), NOW(), NOW()),
          ('550e8400-e29b-41d4-a716-446655440002', 'Silver User Test', 'silver@test.com', 'silver', 20, 3, 1, NOW(), NOW(), NOW()),
          ('550e8400-e29b-41d4-a716-446655440003', 'Gold User Test', 'gold@test.com', 'gold', 80, 20, 3, NOW(), NOW(), NOW()),
          ('550e8400-e29b-41d4-a716-446655440004', 'Platinum User Test', 'platinum@test.com', 'platinum', 500, 100, 20, NOW(), NOW(), NOW())
      `;
      
      const now = new Date().toISOString();
      const testUsers = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Free User Test',
          email: 'free@test.com',
          role: 'registered' as const,
          daily_likes_used: 4,
          daily_super_likes_used: 1,
          daily_boosts_used: 0,
          last_like_reset_date: now,
          created_at: now,
          updated_at: now
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Silver User Test',
          email: 'silver@test.com',
          role: 'silver' as const,
          daily_likes_used: 20,
          daily_super_likes_used: 3,
          daily_boosts_used: 1,
          last_like_reset_date: now,
          created_at: now,
          updated_at: now
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Gold User Test',
          email: 'gold@test.com',
          role: 'gold' as const,
          daily_likes_used: 80,
          daily_super_likes_used: 20,
          daily_boosts_used: 3,
          last_like_reset_date: now,
          created_at: now,
          updated_at: now
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'Platinum User Test',
          email: 'platinum@test.com',
          role: 'platinum' as const,
          daily_likes_used: 500,
          daily_super_likes_used: 100,
          daily_boosts_used: 20,
          last_like_reset_date: now,
          created_at: now,
          updated_at: now
        }
      ];
      
      const { error } = await supabase
        .from('profiles')
        .insert(testUsers);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to create test users:', error);
      return false;
    }
  }

  async getTestUsers(): Promise<UserUsage[]> {
    try {
      const query = `
        SELECT id, email, role::text, daily_likes_used, daily_super_likes_used, daily_boosts_used, last_like_reset_date::text
        FROM profiles 
        WHERE email IN ('free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com')
        ORDER BY role
      `;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, daily_likes_used, daily_super_likes_used, daily_boosts_used, last_like_reset_date')
        .in('email', ['free@test.com', 'silver@test.com', 'gold@test.com', 'platinum@test.com'])
        .order('role');
      
      if (error || !data) return [];
      
      return data.map((row: any) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        daily_likes_used: row.daily_likes_used || 0,
        daily_super_likes_used: row.daily_super_likes_used || 0,
        daily_boosts_used: row.daily_boosts_used || 0,
        last_like_reset_date: row.last_like_reset_date
      }));
    } catch (error) {
      console.error('Failed to get test users:', error);
      return [];
    }
  }
}

export const sqlSubscriptionService = new SqlSubscriptionService();