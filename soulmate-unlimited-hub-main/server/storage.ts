import { profiles, conversations, messages, matches, swipes, superLikes, userPreferences, userBlocks, userReports, subscribers, messageTranslationsCache, callSessions, mediaModeration } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc } from "drizzle-orm";
import type { Profile, InsertProfile, Conversation, InsertConversation, Message, InsertMessage, Match, InsertMatch, Swipe, InsertSwipe, SuperLike, InsertSuperLike, UserPreferences, InsertUserPreferences, UserBlock, InsertUserBlock, UserReport, InsertUserReport, Subscriber, InsertSubscriber, CallSession, MediaModeration, InsertMediaModeration } from "@shared/schema";

export interface IStorage {
  // Profile operations
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(id: string): Promise<boolean>;
  
  // Conversation operations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation>;
  
  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Match operations
  getMatch(id: string): Promise<Match | undefined>;
  getMatchesByUser(userId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  checkMatch(user1Id: string, user2Id: string): Promise<Match | undefined>;
  
  // Swipe operations
  getSwipe(id: string): Promise<Swipe | undefined>;
  getSwipesByUser(userId: string): Promise<Swipe[]>;
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  checkSwipe(userId: string, targetUserId: string): Promise<Swipe | undefined>;
  
  // Super like operations
  getSuperLike(id: string): Promise<SuperLike | undefined>;
  getSuperLikesByUser(userId: string): Promise<SuperLike[]>;
  createSuperLike(superLike: InsertSuperLike): Promise<SuperLike>;
  
  // User preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createOrUpdateUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  
  // User blocks operations
  getUserBlocks(userId: string): Promise<UserBlock[]>;
  createUserBlock(block: InsertUserBlock): Promise<UserBlock>;
  checkUserBlock(blockerId: string, blockedUserId: string): Promise<UserBlock | undefined>;
  
  // User reports operations
  getUserReports(): Promise<UserReport[]>;
  createUserReport(report: InsertUserReport): Promise<UserReport>;
  
  // Subscriber operations
  getSubscriber(email: string): Promise<Subscriber | undefined>;
  getSubscriberByUserId(userId: string): Promise<Subscriber | undefined>;
  createOrUpdateSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  
  // Call session operations
  getCallSession(id: string): Promise<CallSession | undefined>;
  getCallSessionsByUser(userId: string): Promise<CallSession[]>;
  createCallSession(callSession: Partial<CallSession>): Promise<CallSession>;
  updateCallSession(id: string, updates: Partial<CallSession>): Promise<CallSession | undefined>;
  
  // Media moderation operations
  getMediaModeration(id: string): Promise<MediaModeration | undefined>;
  getPendingMediaModeration(): Promise<MediaModeration[]>;
  getUserMediaModeration(userId: string): Promise<MediaModeration[]>;
  createMediaModeration(moderation: InsertMediaModeration): Promise<MediaModeration>;
  updateMediaModeration(id: string, updates: Partial<MediaModeration>): Promise<MediaModeration | undefined>;
  deleteMediaModeration(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Profile operations
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return result[0];
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const result = await db.update(profiles).set(updates).where(eq(profiles.id, id)).returning();
    return result[0];
  }

  async deleteProfile(id: string): Promise<boolean> {
    const result = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    return result.length > 0;
  }

  // Conversation operations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)))
      .orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    // Check if conversation exists
    const existing = await db.select().from(conversations)
      .where(
        or(
          and(eq(conversations.participant1Id, user1Id), eq(conversations.participant2Id, user2Id)),
          and(eq(conversations.participant1Id, user2Id), eq(conversations.participant2Id, user1Id))
        )
      ).limit(1);

    if (existing[0]) {
      return existing[0];
    }

    // Create new conversation
    return await this.createConversation({
      participant1Id: user1Id,
      participant2Id: user2Id
    });
  }

  // Message operations
  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return result[0];
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  // Match operations
  async getMatch(id: string): Promise<Match | undefined> {
    const result = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
    return result[0];
  }

  async getMatchesByUser(userId: string): Promise<Match[]> {
    return await db.select().from(matches)
      .where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)))
      .orderBy(desc(matches.createdAt));
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const result = await db.insert(matches).values(match).returning();
    return result[0];
  }

  async checkMatch(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const result = await db.select().from(matches)
      .where(
        or(
          and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
          and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
        )
      ).limit(1);
    return result[0];
  }

  // Swipe operations
  async getSwipe(id: string): Promise<Swipe | undefined> {
    const result = await db.select().from(swipes).where(eq(swipes.id, id)).limit(1);
    return result[0];
  }

  async getSwipesByUser(userId: string): Promise<Swipe[]> {
    return await db.select().from(swipes)
      .where(eq(swipes.userId, userId))
      .orderBy(desc(swipes.createdAt));
  }

  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const result = await db.insert(swipes).values(swipe).returning();
    return result[0];
  }

  async checkSwipe(userId: string, targetUserId: string): Promise<Swipe | undefined> {
    const result = await db.select().from(swipes)
      .where(and(eq(swipes.userId, userId), eq(swipes.targetUserId, targetUserId)))
      .limit(1);
    return result[0];
  }

  // Super like operations
  async getSuperLike(id: string): Promise<SuperLike | undefined> {
    const result = await db.select().from(superLikes).where(eq(superLikes.id, id)).limit(1);
    return result[0];
  }

  async getSuperLikesByUser(userId: string): Promise<SuperLike[]> {
    return await db.select().from(superLikes)
      .where(eq(superLikes.userId, userId))
      .orderBy(desc(superLikes.createdAt));
  }

  async createSuperLike(superLike: InsertSuperLike): Promise<SuperLike> {
    const result = await db.insert(superLikes).values(superLike).returning();
    return result[0];
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
    return result[0];
  }

  async createOrUpdateUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const result = await db.insert(userPreferences).values(preferences)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          showMe: preferences.showMe,
          minAge: preferences.minAge,
          maxAge: preferences.maxAge,
          maxDistance: preferences.maxDistance,
          lgbtqFriendly: preferences.lgbtqFriendly,
          sameGenderEnabled: preferences.sameGenderEnabled,
          updatedAt: new Date()
        }
      }).returning();
    return result[0];
  }

  // User blocks operations
  async getUserBlocks(userId: string): Promise<UserBlock[]> {
    return await db.select().from(userBlocks)
      .where(eq(userBlocks.blockerId, userId))
      .orderBy(desc(userBlocks.createdAt));
  }

  async createUserBlock(block: InsertUserBlock): Promise<UserBlock> {
    const result = await db.insert(userBlocks).values(block).returning();
    return result[0];
  }

  async checkUserBlock(blockerId: string, blockedUserId: string): Promise<UserBlock | undefined> {
    const result = await db.select().from(userBlocks)
      .where(and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedUserId, blockedUserId)))
      .limit(1);
    return result[0];
  }

  // User reports operations
  async getUserReports(): Promise<UserReport[]> {
    return await db.select().from(userReports)
      .orderBy(desc(userReports.createdAt));
  }

  async createUserReport(report: InsertUserReport): Promise<UserReport> {
    const result = await db.insert(userReports).values(report).returning();
    return result[0];
  }

  // Subscriber operations
  async getSubscriber(email: string): Promise<Subscriber | undefined> {
    const result = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    return result[0];
  }

  async getSubscriberByUserId(userId: string): Promise<Subscriber | undefined> {
    const result = await db.select().from(subscribers).where(eq(subscribers.userId, userId)).limit(1);
    return result[0];
  }

  async createOrUpdateSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const result = await db.insert(subscribers).values(subscriber)
      .onConflictDoUpdate({
        target: subscribers.email,
        set: {
          userId: subscriber.userId,
          subscribed: subscriber.subscribed,
          subscriptionTier: subscriber.subscriptionTier,
          stripeCustomerId: subscriber.stripeCustomerId,
          subscriptionEnd: subscriber.subscriptionEnd,
          updatedAt: new Date()
        }
      }).returning();
    return result[0];
  }

  // Call session operations
  async getCallSession(id: string): Promise<CallSession | undefined> {
    const result = await db.select().from(callSessions).where(eq(callSessions.id, id)).limit(1);
    return result[0];
  }

  async getCallSessionsByUser(userId: string): Promise<CallSession[]> {
    return await db.select().from(callSessions)
      .where(or(eq(callSessions.callerId, userId), eq(callSessions.receiverId, userId)))
      .orderBy(desc(callSessions.createdAt));
  }

  async createCallSession(callSession: Partial<CallSession>): Promise<CallSession> {
    const result = await db.insert(callSessions).values(callSession as typeof callSessions.$inferInsert).returning();
    return result[0];
  }

  async updateCallSession(id: string, updates: Partial<CallSession>): Promise<CallSession | undefined> {
    const result = await db.update(callSessions).set(updates).where(eq(callSessions.id, id)).returning();
    return result[0];
  }

  // Media moderation operations
  async getMediaModeration(id: string): Promise<MediaModeration | undefined> {
    const [moderation] = await db
      .select()
      .from(mediaModeration)
      .where(eq(mediaModeration.id, id));
    return moderation || undefined;
  }

  async getPendingMediaModeration(): Promise<MediaModeration[]> {
    return await db
      .select()
      .from(mediaModeration)
      .where(eq(mediaModeration.moderationStatus, 'pending'))
      .orderBy(desc(mediaModeration.uploadedAt));
  }

  async getUserMediaModeration(userId: string): Promise<MediaModeration[]> {
    return await db
      .select()
      .from(mediaModeration)
      .where(eq(mediaModeration.userId, userId))
      .orderBy(desc(mediaModeration.uploadedAt));
  }

  async createMediaModeration(moderation: InsertMediaModeration): Promise<MediaModeration> {
    const [newModeration] = await db
      .insert(mediaModeration)
      .values(moderation)
      .returning();
    return newModeration;
  }

  async updateMediaModeration(id: string, updates: Partial<MediaModeration>): Promise<MediaModeration | undefined> {
    const [updatedModeration] = await db
      .update(mediaModeration)
      .set(updates)
      .where(eq(mediaModeration.id, id))
      .returning();
    return updatedModeration || undefined;
  }

  async deleteMediaModeration(id: string): Promise<boolean> {
    const result = await db
      .delete(mediaModeration)
      .where(eq(mediaModeration.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

// Legacy compatibility
export interface LegacyUser {
  id: string;
  username?: string;
  password?: string;
  email?: string;
  name?: string;
}

export class LegacyUserAdapter {
  async getUser(id: string): Promise<LegacyUser | undefined> {
    const profile = await storage.getProfile(id);
    if (!profile) return undefined;
    
    return {
      id: profile.id,
      username: profile.email || profile.name || '',
      email: profile.email || undefined,
      name: profile.name || undefined
    };
  }

  async getUserByUsername(username: string): Promise<LegacyUser | undefined> {
    const profile = await storage.getProfileByEmail(username);
    if (!profile) return undefined;
    
    return {
      id: profile.id,
      username: profile.email || profile.name || '',
      email: profile.email || undefined,
      name: profile.name || undefined
    };
  }

  async createUser(user: { username: string; password?: string; email?: string; name?: string }): Promise<LegacyUser> {
    const profile = await storage.createProfile({
      id: crypto.randomUUID(),
      email: user.email || user.username,
      name: user.name || user.username
    });
    
    return {
      id: profile.id,
      username: user.username,
      email: profile.email || undefined,
      name: profile.name || undefined
    };
  }
}

export const legacyUserAdapter = new LegacyUserAdapter();
