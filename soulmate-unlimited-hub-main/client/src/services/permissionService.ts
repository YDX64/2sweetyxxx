import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserPermissions } from '@/types/roles';
import { User } from '@supabase/supabase-js';
import { logService } from './logService';

// Modern TypeScript utility types with proper constraints
type DatabaseProfile = {
  id: string;
  role?: UserRole;
  is_banned?: boolean;
  ban_reason?: string | null;
  banned_at?: string | null;
  banned_by?: string | null;
  [key: string]: unknown;
};

type PermissionRecord = {
  id?: string;
  role: UserRole;
  feature: string;
  can_access: boolean;
  daily_limit: number | null;
  created_at?: string;
};

type ActivityLog = {
  id?: string;
  user_id: string;
  action: string;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
};

type ModerationLog = {
  id?: string;
  moderator_id: string;
  target_user_id: string;
  action: string;
  reason?: string | null;
  details?: Record<string, unknown> | null;
  created_at?: string;
};

// Type guard functions with modern patterns
function isValidProfile(data: unknown): data is DatabaseProfile {
  return typeof data === 'object' && data !== null && 'id' in data;
}

function isValidPermission(data: unknown): data is PermissionRecord {
  return typeof data === 'object' && 
         data !== null && 
         'role' in data && 
         'feature' in data && 
         'can_access' in data;
}

// Modern TypeScript utility for camelCase conversion
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// IP address utility with type safety
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data: { ip: string } = await response.json();
    return data.ip;
  } catch {
    return null;
  }
}

// Modern singleton pattern with type safety
class PermissionService {
  private static instance: PermissionService;
  private readonly permissions: Map<string, UserPermissions> = new Map();
  private userRole: UserRole | null = null;

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  // Load user permissions with modern error handling
  async loadUserPermissions(userId: string): Promise<void> {
    try {
      // Get user role with type assertion and validation
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!isValidProfile(profileData)) {
        throw new Error('Invalid profile data received');
      }

      this.userRole = (profileData as DatabaseProfile).role ?? 'registered';

      // Create complete UserPermissions object with type safety
      const permMap: UserPermissions = this.createUserPermissions(this.userRole);
      this.permissions.set(userId, permMap);
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Set default permissions on error with proper structure
      const defaultPermissions = this.createUserPermissions('registered');
      this.permissions.set(userId, defaultPermissions);
    }
  }

  // Modern TypeScript utility to create complete UserPermissions
  private createUserPermissions(role: UserRole): UserPermissions {
    const isPremiumRole = ['silver', 'gold', 'platinum', 'moderator', 'admin'].includes(role);
    const isModeratorRole = ['moderator', 'admin'].includes(role);
    const isAdminRole = role === 'admin';

    // Base permissions for all users
    const basePermissions: UserPermissions = {
      swipe: { canAccess: true, dailyLimit: role === 'registered' ? 10 : isPremiumRole ? null : 50 },
      match: { canAccess: true, dailyLimit: role === 'registered' ? 5 : isPremiumRole ? null : 20 },
      message: { canAccess: true, dailyLimit: role === 'registered' ? 5 : isPremiumRole ? null : 25 },
      seeLikes: { canAccess: isPremiumRole, dailyLimit: null },
      unlimitedSwipes: { canAccess: ['gold', 'platinum', 'moderator', 'admin'].includes(role), dailyLimit: null },
      advancedFilters: { canAccess: isPremiumRole, dailyLimit: null },
      seeWhoLiked: { canAccess: isPremiumRole, dailyLimit: null },
      boostProfile: { canAccess: isPremiumRole, dailyLimit: role === 'silver' ? 1 : null }
    };

    // Add optional premium features
    if (isPremiumRole) {
      basePermissions.voiceCall = { canAccess: ['gold', 'platinum', 'moderator', 'admin'].includes(role), dailyLimit: null };
      basePermissions.videoCall = { canAccess: ['gold', 'platinum', 'moderator', 'admin'].includes(role), dailyLimit: null };
      basePermissions.chatTranslation = { canAccess: ['platinum', 'moderator', 'admin'].includes(role), dailyLimit: null };
      basePermissions.prioritySupport = { canAccess: ['platinum', 'moderator', 'admin'].includes(role), dailyLimit: null };
      basePermissions.verifiedBadge = { canAccess: ['platinum', 'moderator', 'admin'].includes(role), dailyLimit: null };
    }

    // Add moderation features
    if (isModeratorRole) {
      basePermissions.moderateUsers = { canAccess: true, dailyLimit: null };
      basePermissions.banUsers = { canAccess: true, dailyLimit: null };
      basePermissions.reviewReports = { canAccess: true, dailyLimit: null };
      basePermissions.manageRoles = { canAccess: isAdminRole, dailyLimit: null };
    }

    // Add admin features
    if (isAdminRole) {
      basePermissions.viewAnalytics = { canAccess: true, dailyLimit: null };
      basePermissions.managePayments = { canAccess: true, dailyLimit: null };
      basePermissions.systemSettings = { canAccess: true, dailyLimit: null };
    }

    return basePermissions;
  }

  // Type-safe permission checking
  hasPermission(userId: string, feature: keyof UserPermissions): boolean {
    const userPerms = this.permissions.get(userId);
    if (!userPerms) return false;
    
    const perm = userPerms[feature];
    return Boolean(perm?.canAccess);
  }

  // Modern async pattern with proper type constraints
  async checkDailyLimit(
    userId: string, 
    feature: keyof UserPermissions
  ): Promise<{ allowed: boolean; remaining: number | null }> {
    const userPerms = this.permissions.get(userId);
    if (!userPerms) return { allowed: false, remaining: 0 };

    const perm = userPerms[feature];
    if (!perm?.canAccess) return { allowed: false, remaining: 0 };
    if (perm.dailyLimit === null) return { allowed: true, remaining: null };

    // Mock daily usage check since table doesn't exist
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // This would be the actual query when table exists:
      // const { data: logs, error } = await supabase
      //   .from('user_activity_logs')
      //   .select('id')
      //   .eq('user_id', userId)
      //   .eq('action', feature)
      //   .gte('created_at', today.toISOString());

      // Mock data for now
      const used = 0; // Replace with actual count when table exists
      const remaining = perm.dailyLimit - used;

      return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining)
      };
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return { allowed: false, remaining: 0 };
    }
  }

  // Activity logging with type safety
  async logActivity(
    userId: string, 
    action: string, 
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      const activityLog: ActivityLog = {
        user_id: userId,
        action,
        details: details ?? null,
        ip_address: await getClientIP(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        created_at: new Date().toISOString()
      };

      // This would be the actual insert when table exists:
      // await supabase.from('user_activity_logs').insert(activityLog);
      
      console.log('Activity logged:', activityLog);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Update user role with modern type constraints
  async updateUserRole(userId: string, newRole: UserRole, adminId: string): Promise<void> {
          logService.info('ADMIN', 'Role update started', {
      targetUserId: userId,
      newRole,
              adminId,
        timestamp: new Date().toISOString()
      }, userId);

    try {
      console.log('🔧 [DEBUG] updateUserRole started:', {
        userId,
        newRole,
        adminId,
        timestamp: new Date().toISOString()
      });

      // Admin permission check with type safety
      await logService.debug('ADMIN', 'Checking admin permissions', {
        adminId,
        checkingPermissions: true,
        targetUserId: userId
      }, adminId);

      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminId)
        .single();

      if (adminError) {
        await logService.error('ADMIN', 'Admin profile fetch failed', {
          adminId,
          errorDetails: adminError,
          targetUserId: userId
        }, adminId);
        throw adminError;
      }

      if (!isValidProfile(adminData)) {
        const error = new Error('Invalid admin profile data');
        await logService.error('ADMIN', 'Invalid admin profile data', {
          error: error.message,
          adminId,
          receivedData: adminData,
          targetUserId: userId
        }, adminId);
        throw error;
      }

      const adminProfile = adminData as DatabaseProfile;
      const adminRole = adminProfile.role;
      
      await logService.debug('ADMIN', 'Admin role verified', {
        adminId,
        adminRole,
        profileData: adminProfile,
        targetUserId: userId
      }, adminId);
      
      if (!adminRole || (adminRole !== 'admin' && adminRole !== 'moderator')) {
        const error = new Error('Insufficient permissions to update user role');
        await logService.error('ADMIN', 'Insufficient admin permissions', {
          error: error.message,
          adminId,
          adminRole,
          requiredRoles: ['admin', 'moderator'],
          targetUserId: userId
        }, adminId);
        throw error;
      }

      // Update role with type-safe data
      const updateData: Partial<DatabaseProfile> = {
        role: newRole
      };

      await logService.debug('ADMIN', 'Preparing database update', {
        targetUserId: userId,
        updateData,
        adminId
      }, adminId);

      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select('*');

      if (updateError) {
        await logService.error('ADMIN', 'Database update failed', {
          targetUserId: userId,
          updateData,
          errorDetails: updateError,
          adminId
        }, userId);
        console.error('🔧 [DEBUG] Database update error:', updateError);
        throw updateError;
      }

              logService.info('ADMIN', 'Database update successful', {
        targetUserId: userId,
        newRole,
        updateResult,
        affectedRows: updateResult?.length,
        adminId
      }, userId);

      console.log('🔧 [DEBUG] Database update result:', {
        updateResult,
        affectedRows: updateResult?.length
      });

      // Log moderation action
      const moderationLog: ModerationLog = {
        moderator_id: adminId,
        target_user_id: userId,
        action: 'change_role',
        details: { new_role: newRole },
        created_at: new Date().toISOString()
      };

      // This would be the actual insert when table exists:
      // await supabase.from('moderation_logs').insert(moderationLog);
      
      console.log('Moderation action logged:', moderationLog);
      
              logService.info('ADMIN', 'Moderation action logged', {
        moderationLog,
        targetUserId: userId,
        adminId
      }, adminId);

      // Reload permissions
      await this.loadUserPermissions(userId);
      
              logService.info('ADMIN', 'Role update completed successfully', {
        targetUserId: userId,
        newRole,
        adminId,
        completedAt: new Date().toISOString()
      }, adminId);

    } catch (error) {
      await logService.error('ADMIN', 'Role update failed', {
        error: (error as Error).message,
        targetUserId: userId,
        newRole,
        adminId,
        failedAt: new Date().toISOString()
      }, adminId);
      
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Ban user with type safety
  async banUser(userId: string, moderatorId: string, reason: string): Promise<void> {
          logService.info('ADMIN', 'User ban started', {
      targetUserId: userId,
      moderatorId,
      reason,
      timestamp: new Date().toISOString()
    }, moderatorId);

    try {
      const banData: Partial<DatabaseProfile> = {
        is_banned: true,
        ban_reason: reason
      };

      await logService.debug('ADMIN', 'Preparing ban database update', {
        targetUserId: userId,
        banData,
        moderatorId
      }, moderatorId);

      const { error } = await supabase
        .from('profiles')
        .update(banData)
        .eq('id', userId);

      if (error) {
        await logService.error('ADMIN', 'Ban database update failed', {
          error: error.message,
          targetUserId: userId,
          banData,
          errorDetails: error,
          moderatorId
        }, moderatorId);
        throw error;
      }

              logService.info('ADMIN', 'User banned successfully', {
        targetUserId: userId,
        moderatorId,
        reason,
        completedAt: new Date().toISOString()
      }, moderatorId);

      // Log moderation action
      const moderationLog: ModerationLog = {
        moderator_id: moderatorId,
        target_user_id: userId,
        action: 'ban',
        reason,
        created_at: new Date().toISOString()
      };

      console.log('Ban action logged:', moderationLog);
      
              logService.info('ADMIN', 'Ban moderation action logged', {
        moderationLog,
        targetUserId: userId,
        moderatorId
      }, moderatorId);

    } catch (error) {
      await logService.error('ADMIN', 'User ban failed', {
        error: (error as Error).message,
        targetUserId: userId,
        moderatorId,
        reason,
        failedAt: new Date().toISOString()
      }, moderatorId);
      
      console.error('Error banning user:', error);
      throw error;
    }
  }

  // Unban user with type safety
  async unbanUser(userId: string, moderatorId: string): Promise<void> {
          logService.info('ADMIN', 'User unban started', {
      targetUserId: userId,
      moderatorId,
      timestamp: new Date().toISOString()
    }, moderatorId);

    try {
      const unbanData: Partial<DatabaseProfile> = {
        is_banned: false,
        ban_reason: null
      };

      await logService.debug('ADMIN', 'Preparing unban database update', {
        targetUserId: userId,
        unbanData,
        moderatorId
      }, moderatorId);

      const { error } = await supabase
        .from('profiles')
        .update(unbanData)
        .eq('id', userId);

      if (error) {
        await logService.error('ADMIN', 'Unban database update failed', {
          error: error.message,
          targetUserId: userId,
          unbanData,
          errorDetails: error,
          moderatorId
        }, moderatorId);
        throw error;
      }

              logService.info('ADMIN', 'User unbanned successfully', {
        targetUserId: userId,
        moderatorId,
        completedAt: new Date().toISOString()
      }, moderatorId);

      // Log moderation action
      const moderationLog: ModerationLog = {
        moderator_id: moderatorId,
        target_user_id: userId,
        action: 'unban',
        created_at: new Date().toISOString()
      };

      console.log('Unban action logged:', moderationLog);
      
              logService.info('ADMIN', 'Unban moderation action logged', {
        moderationLog,
        targetUserId: userId,
        moderatorId
      }, moderatorId);

    } catch (error) {
      await logService.error('ADMIN', 'User unban failed', {
        error: (error as Error).message,
        targetUserId: userId,
        moderatorId,
        failedAt: new Date().toISOString()
      }, moderatorId);
      
      console.error('Error unbanning user:', error);
      throw error;
    }
  }

  // Role checking with type guards
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isModerator(): boolean {
    return this.userRole === 'moderator' || this.userRole === 'admin';
  }

  isPremium(): boolean {
    const premiumRoles: UserRole[] = ['silver', 'gold', 'platinum', 'moderator', 'admin'];
    return this.userRole ? premiumRoles.includes(this.userRole) : false;
  }

  getUserRole(): UserRole | null {
    return this.userRole;
  }
}

// Utility functions for role checking
export function isAdminUser(user: User | null, profile: DatabaseProfile | null): boolean {
  if (!user || !profile) return false;
  return profile.role === 'admin' || profile.subscription_tier === 'admin';
}

export function isModeratorUser(user: User | null, profile: DatabaseProfile | null): boolean {
  if (!user || !profile) return false;
  const role = profile.role || profile.subscription_tier;
  return role === 'moderator' || role === 'admin';
}

// Export singleton instance with proper typing
export const permissionService = PermissionService.getInstance();
export type { DatabaseProfile, PermissionRecord, ActivityLog, ModerationLog };
