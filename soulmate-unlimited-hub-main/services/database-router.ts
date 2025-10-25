import { localDb } from '../config/databases';
import { supabase } from '../client/src/integrations/supabase/client';
import { cache } from '../config/redis';
import * as schema from '../shared/schema';
import { eq, and, or, desc, sql, gte } from 'drizzle-orm';

/**
 * Database Router Service
 * Routes queries to appropriate database:
 * - Supabase: Only for authentication
 * - Local PostgreSQL: All application data
 */

export const dbRouter = {
  // ============= AUTH OPERATIONS (Supabase) =============
  auth: {
    // Get current user from Supabase Auth
    async getCurrentUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },

    // Get session
    async getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },

    // Sign in with email
    async signInWithEmail(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    // Sign up
    async signUp(email: string, password: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    // Sign out
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    // OAuth sign in
    async signInWithOAuth(provider: 'google' | 'apple' | 'facebook') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) throw error;
      return data;
    },
  },

  // ============= DATA OPERATIONS (Local PostgreSQL) =============
  
  // Profile operations
  profiles: {
    async get(userId: string) {
      // Try cache first
      const cacheKey = `profile:${userId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      // Query local database
      const result = await localDb.query.profiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.id, userId),
      });

      // Cache for 5 minutes
      if (result) {
        await cache.set(cacheKey, result, 300);
      }

      return result;
    },

    async update(userId: string, data: any) {
      const result = await localDb
        .update(schema.profiles)
        .set(data)
        .where(eq(schema.profiles.id, userId))
        .returning();

      // Invalidate cache
      await cache.del(`profile:${userId}`);

      return result[0];
    },

    async search(filters: any, limit = 50) {
      // Complex query - implement based on your needs
      const query = localDb
        .select()
        .from(schema.profiles)
        .limit(limit);

      // Add filters dynamically
      if (filters.minAge) {
        query.where(gte(schema.profiles.age, filters.minAge));
      }

      return await query;
    },
  },

  // Conversation operations
  conversations: {
    async list(userId: string) {
      const cacheKey = `conversations:${userId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const result = await localDb.query.conversations.findMany({
        where: (conversations, { or, eq }) => or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        ),
        with: {
          messages: {
            orderBy: (messages: any, { desc }: any) => [desc(messages.createdAt)],
            limit: 1,
          },
        },
      });

      // Cache for 1 minute
      await cache.set(cacheKey, result, 60);
      return result;
    },

    async create(participant1Id: string, participant2Id: string) {
      const result = await localDb
        .insert(schema.conversations)
        .values({
          participant1Id: participant1Id,
          participant2Id: participant2Id,
        })
        .returning();

      // Invalidate cache for both users
      await cache.del([
        `conversations:${participant1Id}`,
        `conversations:${participant2Id}`,
      ]);

      return result[0];
    },
  },

  // Message operations
  messages: {
    async send(conversationId: string, senderId: string, content: string) {
      const result = await localDb
        .insert(schema.messages)
        .values({
          conversationId: conversationId,
          senderId: senderId,
          content,
        })
        .returning();

      // Publish to Redis for real-time
      await pubsub.publish(`messages:${conversationId}`, result[0]);

      return result[0];
    },

    async list(conversationId: string, limit = 50) {
      return await localDb.query.messages.findMany({
        where: (messages, { eq }) => eq(messages.conversationId, conversationId),
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        limit,
      });
    },
  },

  // Swipe operations
  swipes: {
    async create(swiperId: string, swipedId: string, direction: 'left' | 'right') {
      const result = await localDb
        .insert(schema.swipes)
        .values({
          userId: swiperId,
          targetUserId: swipedId,
          direction,
        })
        .returning();

      // Check for match if right swipe
      if (direction === 'right') {
        const reverseSwipe = await localDb.query.swipes.findFirst({
          where: (swipes, { and, eq }) => and(
            eq(swipes.userId, swipedId),
            eq(swipes.targetUserId, swiperId),
            eq(swipes.direction, 'right')
          ),
        });

        if (reverseSwipe) {
          // Create match
          await localDb
            .insert(schema.matches)
            .values({
              user1Id: swiperId,
              user2Id: swipedId,
            });

          // Publish match event
          await pubsub.publish(`matches:${swiperId}`, { matchedWith: swipedId });
          await pubsub.publish(`matches:${swipedId}`, { matchedWith: swiperId });
        }
      }

      return result[0];
    },
  },

  // Subscription operations
  subscribers: {
    async get(userId: string) {
      const cacheKey = `subscription:${userId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const result = await localDb.query.subscribers.findFirst({
        where: (subscribers, { eq }) => eq(subscribers.userId, userId),
      });

      // Cache for 10 minutes
      if (result) {
        await cache.set(cacheKey, result, 600);
      }

      return result;
    },

    async update(userId: string, data: any) {
      const result = await localDb
        .update(schema.subscribers)
        .set(data)
        .where(eq(schema.subscribers.userId, userId))
        .returning();

      // Invalidate cache
      await cache.del(`subscription:${userId}`);

      return result[0];
    },
  },

  // Usage tracking
  usage: {
    async incrementLikes(userId: string) {
      await localDb
        .update(schema.profiles)
        .set({
          dailyLikesUsed: sql`${schema.profiles.dailyLikesUsed} + 1`,
        })
        .where(eq(schema.profiles.id, userId));

      // Invalidate cache
      await cache.del(`profile:${userId}`);
    },

    async resetDailyUsage() {
      // Run this as a cron job
      await localDb
        .update(schema.profiles)
        .set({
          dailyLikesUsed: 0,
          dailySuperLikesUsed: 0,
          dailyBoostsUsed: 0,
          lastLikeResetDate: new Date(),
        });

      // Clear all profile caches
      await cache.clearPattern('profile:*');
    },
  },
};

// Helper to determine if a table should use local DB
export function isLocalTable(tableName: string): boolean {
  const authTables = ['auth.users', 'auth.sessions', 'auth.refresh_tokens'];
  return !authTables.includes(tableName);
}

// Re-export for backward compatibility
import { pubsub } from '../config/redis';