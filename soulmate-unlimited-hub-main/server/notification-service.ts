import { db } from "./db";
import { notifications, profiles, matches, messages } from "@shared/schema";
import { InsertNotification, Notification } from "@shared/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

export class NotificationService {
  
  /**
   * Create a new notification
   */
  static async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    
    return newNotification;
  }

  /**
   * Get unread notifications for a user
   */
  static async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  /**
   * Get all notifications for a user with related user info
   */
  static async getUserNotifications(userId: string, limit: number = 20): Promise<Array<Notification & { relatedUser?: { name: string; photos: string[] } }>> {
    const userNotifications = await db
      .select({
        notification: notifications,
        relatedUser: {
          name: profiles.name,
          photos: profiles.photos
        }
      })
      .from(notifications)
      .leftJoin(profiles, eq(notifications.relatedUserId, profiles.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return userNotifications.map(({ notification, relatedUser }) => ({
      ...notification,
      relatedUser: (relatedUser && relatedUser.name && relatedUser.photos) ? {
        name: relatedUser.name,
        photos: relatedUser.photos
      } : undefined
    }) as Notification & { relatedUser?: { name: string; photos: string[] } });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(eq(notifications.id, notificationId));
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
  }

  /**
   * Get notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result.length;
  }

  /**
   * Create a match notification
   */
  static async createMatchNotification(userId: string, matchedUserId: string, matchId: string): Promise<void> {
    // Get matched user info
    const [matchedUser] = await db
      .select({ name: profiles.name })
      .from(profiles)
      .where(eq(profiles.id, matchedUserId));

    if (matchedUser) {
      await this.createNotification({
        userId,
        type: 'match',
        title: 'matchNotification',
        message: `newMatchNotificationMessage`,
        relatedUserId: matchedUserId,
        relatedMatchId: matchId,
        data: JSON.stringify({ matchId, matchedUserId, matchedUserName: matchedUser.name })
      });
    }
  }

  /**
   * Create a message notification
   */
  static async createMessageNotification(recipientId: string, senderId: string, messageId: string, messagePreview: string): Promise<void> {
    // Get sender info
    const [sender] = await db
      .select({ name: profiles.name })
      .from(profiles)
      .where(eq(profiles.id, senderId));

    if (sender) {
      await this.createNotification({
        userId: recipientId,
        type: 'message',
        title: 'messageNotification',
        message: 'newMessageNotificationMessage',
        relatedUserId: senderId,
        relatedMessageId: messageId,
        data: JSON.stringify({ messageId, senderId, preview: messagePreview, senderName: sender.name })
      });
    }
  }

  /**
   * Create a like notification
   */
  static async createLikeNotification(userId: string, likerId: string): Promise<void> {
    // Get liker info
    const [liker] = await db
      .select({ name: profiles.name })
      .from(profiles)
      .where(eq(profiles.id, likerId));

    if (liker) {
      await this.createNotification({
        userId,
        type: 'like',
        title: 'likeNotification',
        message: 'likeNotificationMessage',
        relatedUserId: likerId,
        data: JSON.stringify({ likerId, likerName: liker.name })
      });
    }
  }

  /**
   * Create a super like notification
   */
  static async createSuperLikeNotification(userId: string, likerId: string): Promise<void> {
    // Get liker info
    const [liker] = await db
      .select({ name: profiles.name })
      .from(profiles)
      .where(eq(profiles.id, likerId));

    if (liker) {
      await this.createNotification({
        userId,
        type: 'super_like',
        title: 'superLikeNotification',
        message: 'superLikeNotificationMessage',
        relatedUserId: likerId,
        data: JSON.stringify({ likerId, likerName: liker.name })
      });
    }
  }

  /**
   * Create a profile view notification (for premium users)
   */
  static async createProfileViewNotification(userId: string, viewerId: string): Promise<void> {
    // Get viewer info
    const [viewer] = await db
      .select({ name: profiles.name })
      .from(profiles)
      .where(eq(profiles.id, viewerId));

    if (viewer) {
      await this.createNotification({
        userId,
        type: 'profile_view',
        title: 'profileViewNotification',
        message: 'profileViewNotificationMessage',
        relatedUserId: viewerId,
        data: JSON.stringify({ viewerId, viewerName: viewer.name })
      });
    }
  }

  /**
   * Create photo moderation notifications
   */
  static async createPhotoApprovedNotification(userId: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'photo_approved',
      title: 'photoApprovedNotification',
      message: 'photoApprovedNotificationMessage',
      data: JSON.stringify({ moderationType: 'photo_approval' })
    });
  }

  static async createPhotoRejectedNotification(userId: string, reason?: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'photo_rejected',
      title: 'photoRejectedNotification',
      message: 'photoRejectedNotificationMessage',
      data: JSON.stringify({ moderationType: 'photo_rejection', reason })
    });
  }

  /**
   * Create subscription notifications
   */
  static async createSubscriptionExpiringNotification(userId: string, daysLeft: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'subscription_expiring',
      title: 'subscriptionExpiringNotification',
      message: 'subscriptionExpiringNotificationMessage',
      data: JSON.stringify({ daysLeft })
    });
  }

  static async createSubscriptionRenewedNotification(userId: string, planName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'subscription_renewed',
      title: 'subscriptionRenewedNotification',
      message: 'subscriptionRenewedNotificationMessage',
      data: JSON.stringify({ planName })
    });
  }

  /**
   * Delete notifications by type and related users (for rewind operations)
   */
  static async deleteNotificationsByTypeAndUser(
    type: 'like' | 'super_like' | 'match', 
    userId: string, 
    relatedUserId: string
  ): Promise<void> {
    await db
      .delete(notifications)
      .where(and(
        eq(notifications.type, type),
        eq(notifications.userId, userId),
        eq(notifications.relatedUserId, relatedUserId)
      ));
  }

  /**
   * Delete match notifications by match ID (for rewind operations)
   */
  static async deleteNotificationsByMatchId(matchId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.relatedMatchId, matchId));
  }

  /**
   * Delete all notifications related to a specific action for rewind
   */
  static async deleteRewindRelatedNotifications(
    actorUserId: string, 
    targetUserId: string, 
    actionType: 'like' | 'dislike', 
    matchId?: string
  ): Promise<void> {
    // Delete like/super_like notifications if it was a like action
    if (actionType === 'like') {
      // Delete like notification sent to target user
      await this.deleteNotificationsByTypeAndUser('like', targetUserId, actorUserId);
      
      // Delete super_like notification if exists
      await this.deleteNotificationsByTypeAndUser('super_like', targetUserId, actorUserId);
    }

    // Delete match notifications if a match was formed and is being deleted
    if (matchId) {
      await this.deleteNotificationsByMatchId(matchId);
    }
  }

  /**
   * Delete old notifications (cleanup)
   */
  static async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    await db
      .delete(notifications)
      .where(and(
        eq(notifications.isRead, true),
        // Add date comparison when available
      ));
  }
}