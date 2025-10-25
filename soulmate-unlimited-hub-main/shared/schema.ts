import { pgTable, text, uuid, timestamp, integer, boolean, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const interestedInEnum = pgEnum("interested_in", ["men", "women", "both"]);
export const sexualOrientationEnum = pgEnum("sexual_orientation", ["heterosexual", "homosexual", "bisexual", "pansexual", "asexual"]);
export const userRoleEnum = pgEnum("user_role", ["registered", "silver", "gold", "platinum", "moderator", "admin"]);
export const moderatorPermissionEnum = pgEnum("moderator_permission", [
  "manage_users", 
  "ban_users", 
  "delete_users", 
  "manage_subscriptions", 
  "view_reports", 
  "manage_content",
  "view_analytics"
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "match",
  "message", 
  "like",
  "super_like",
  "profile_view",
  "photo_approved",
  "photo_rejected",
  "subscription_expiring",
  "subscription_renewed"
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved", 
  "rejected",
  "flagged"
]);

// Profiles table (main user table)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  age: integer("age"),
  bio: text("bio"),
  children: text("children"),
  drinking: text("drinking"),
  education: text("education"),
  exercise: text("exercise"),
  gender: text("gender"),
  height: integer("height"),
  interests: text("interests").array(),
  interestedIn: interestedInEnum("interested_in"),
  languages: text("languages").array(),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  location: text("location"),
  occupation: text("occupation"),
  photos: text("photos").array(),
  preferredLanguage: text("preferred_language"),
  relationshipType: text("relationship_type"),
  religion: text("religion"),
  role: userRoleEnum("role").default("registered"),
  sexualOrientation: sexualOrientationEnum("sexual_orientation"),
  smoking: text("smoking"),
  zodiacSign: text("zodiac_sign"),
  subscriptionTier: text("subscription_tier").default("registered"), // registered, silver, gold, platinum
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, cancelled, expired
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Daily usage tracking (aligned with Supabase functions)
  dailySwipes: integer("daily_swipes").default(0),
  dailySuperLikes: integer("daily_super_likes").default(0),
  dailyBoosts: integer("daily_boosts").default(0),
  dailyRewinds: integer("daily_rewinds").default(0),
  // Reset date tracking
  lastSwipeReset: timestamp("last_swipe_reset").defaultNow(),
  lastSuperLikeReset: timestamp("last_super_like_reset").defaultNow(),
  lastBoostReset: timestamp("last_boost_reset").defaultNow(),
  // Legacy columns for backward compatibility
  dailyLikesUsed: integer("daily_likes_used").default(0),
  dailySuperLikesUsed: integer("daily_super_likes_used").default(0),
  dailyBoostsUsed: integer("daily_boosts_used").default(0),
  lastLikeResetDate: timestamp("last_like_reset_date").defaultNow(),
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversations table
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  participant1Id: uuid("participant1_id").notNull().references(() => profiles.id),
  participant2Id: uuid("participant2_id").notNull().references(() => profiles.id),
  translationEnabledByUser1: boolean("translation_enabled_by_user1").default(false),
  translationEnabledByUser2: boolean("translation_enabled_by_user2").default(false),
  user1Language: text("user1_language"),
  user2Language: text("user2_language"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id),
  senderId: uuid("sender_id").notNull().references(() => profiles.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches table
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  user1Id: uuid("user1_id").notNull().references(() => profiles.id),
  user2Id: uuid("user2_id").notNull().references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Swipes table
export const swipes = pgTable("swipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  targetUserId: uuid("target_user_id").notNull().references(() => profiles.id),
  direction: text("direction").notNull(), // 'left' or 'right'
  createdAt: timestamp("created_at").defaultNow(),
});

// Super likes table
export const superLikes = pgTable("super_likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  targetUserId: uuid("target_user_id").notNull().references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  showMe: text("show_me"),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  maxDistance: integer("max_distance"),
  lgbtqFriendly: boolean("lgbtq_friendly"),
  sameGenderEnabled: boolean("same_gender_enabled"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User blocks table
export const userBlocks = pgTable("user_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockerId: uuid("blocker_id").notNull().references(() => profiles.id),
  blockedUserId: uuid("blocked_user_id").notNull().references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User reports table
export const userReports = pgTable("user_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id").notNull().references(() => profiles.id),
  reportedUserId: uuid("reported_user_id").notNull().references(() => profiles.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscribers table (for subscription management)
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id),
  email: text("email").notNull(),
  subscribed: boolean("subscribed").default(false),
  subscriptionTier: text("subscription_tier"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionEnd: timestamp("subscription_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Message translations cache
export const messageTranslationsCache = pgTable("message_translations_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id").notNull().references(() => messages.id),
  originalLanguage: text("original_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  translatedContent: text("translated_content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Call sessions for video/audio calls
export const callSessions = pgTable("call_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  callerId: uuid("caller_id").notNull().references(() => profiles.id),
  receiverId: uuid("receiver_id").notNull().references(() => profiles.id),
  conversationId: uuid("conversation_id").references(() => conversations.id),
  callType: text("call_type").notNull(), // 'audio' or 'video'
  status: text("status").default("pending"), // 'pending', 'active', 'ended', 'missed'
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Moderator permissions table
export const moderatorPermissions = pgTable("moderator_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  permission: moderatorPermissionEnum("permission").notNull(),
  grantedBy: uuid("granted_by").notNull().references(() => profiles.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Media moderation table for uploaded content
export const mediaModeration = pgTable("media_moderation", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  filePath: text("file_path").notNull(),
  compressedPath: text("compressed_path"),
  fileType: text("file_type").notNull(), // image, video
  mimeType: text("mime_type").notNull(),
  originalSize: integer("original_size").notNull(), // in bytes
  compressedSize: integer("compressed_size"),
  compressionRatio: numeric("compression_ratio"),
  moderationStatus: moderationStatusEnum("moderation_status").default("pending").notNull(),
  moderatedBy: uuid("moderated_by").references(() => profiles.id),
  moderationNotes: text("moderation_notes"),
  flaggedReason: text("flagged_reason"),
  isProfilePhoto: boolean("is_profile_photo").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  moderatedAt: timestamp("moderated_at"),
  approvedAt: timestamp("approved_at")
});

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // "Silver", "Gold", "Platinum"
  tier: text("tier").notNull(), // "silver", "gold", "platinum"
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: numeric("yearly_price", { precision: 10, scale: 2 }).notNull(),
  stripePriceIdMonthly: text("stripe_price_id_monthly"),
  stripePriceIdYearly: text("stripe_price_id_yearly"),
  dailyLikes: integer("daily_likes").notNull(),
  dailySuperLikes: integer("daily_super_likes").notNull(),
  dailyBoosts: integer("daily_boosts").notNull(),
  features: text("features").array().notNull(), // Array of feature names
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Boosts table for tracking profile boosts
export const userBoosts = pgTable("user_boosts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  boostType: text("boost_type").notNull(), // "profile", "super_boost"
  isActive: boolean("is_active").default(true),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment History table
export const paymentHistory = pgTable("payment_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  subscriptionPlanId: uuid("subscription_plan_id").references(() => subscriptionPlans.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("usd"),
  status: text("status").notNull(), // "pending", "succeeded", "failed", "refunded"
  billingPeriod: text("billing_period"), // "monthly", "yearly"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON string for additional data
  isRead: boolean("is_read").default(false),
  relatedUserId: uuid("related_user_id").references(() => profiles.id),
  relatedMatchId: uuid("related_match_id").references(() => matches.id),
  relatedMessageId: uuid("related_message_id").references(() => messages.id),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Create insert schemas
export const insertProfileSchema = createInsertSchema(profiles);
export const insertConversationSchema = createInsertSchema(conversations);
export const insertMessageSchema = createInsertSchema(messages);
export const insertMatchSchema = createInsertSchema(matches);
export const insertSwipeSchema = createInsertSchema(swipes);
export const insertSuperLikeSchema = createInsertSchema(superLikes);
export const insertUserPreferencesSchema = createInsertSchema(userPreferences);
export const insertUserBlockSchema = createInsertSchema(userBlocks);
export const insertUserReportSchema = createInsertSchema(userReports);
export const insertSubscriberSchema = createInsertSchema(subscribers);
export const insertModeratorPermissionSchema = createInsertSchema(moderatorPermissions);
export const insertMediaModerationSchema = createInsertSchema(mediaModeration);
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertUserBoostSchema = createInsertSchema(userBoosts);
export const insertPaymentHistorySchema = createInsertSchema(paymentHistory);
export const insertNotificationSchema = createInsertSchema(notifications);

// Export types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type SuperLike = typeof superLikes.$inferSelect;
export type InsertSuperLike = z.infer<typeof insertSuperLikeSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserBlock = typeof userBlocks.$inferSelect;
export type InsertUserBlock = z.infer<typeof insertUserBlockSchema>;
export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type CallSession = typeof callSessions.$inferSelect;
export type ModeratorPermission = typeof moderatorPermissions.$inferSelect;
export type InsertModeratorPermission = z.infer<typeof insertModeratorPermissionSchema>;
export type MediaModeration = typeof mediaModeration.$inferSelect;
export type InsertMediaModeration = z.infer<typeof insertMediaModerationSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UserBoost = typeof userBoosts.$inferSelect;
export type InsertUserBoost = z.infer<typeof insertUserBoostSchema>;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Legacy compatibility for existing codebase
export const users = profiles;
export type User = Profile;
export type InsertUser = InsertProfile;
