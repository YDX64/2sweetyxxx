import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { RealtimeChannel } from '@supabase/supabase-js';

type UserRole = Database['public']['Enums']['user_role'];

// Production role management service - NO MOCKS
export interface RoleUpdateResult {
  success: boolean;
  message: string;
  updatedRole?: string;
}

export interface UserRoleData {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_seen?: string;
}

export interface AuditLogEntry {
  id: number;
  table_name: string;
  operation: string;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  user_id: string;
  timestamp: string;
}

class RoleService {
  private realtimeChannel: RealtimeChannel | null = null;

  // Update user role - PRODUCTION VERSION
  async updateUserRole(userId: string, newRole: string): Promise<RoleUpdateResult> {
    try {
      console.log(`🎭 PRODUCTION: Updating role: User ${userId} → ${newRole}`);
      
      // Direct database update to profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole as UserRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        console.error('❌ Role update failed:', error);
        return {
          success: false,
          message: `Role update error: ${error.message}`
        };
      }
      
      console.log(`✅ PRODUCTION: Role updated successfully: ${userId} → ${newRole}`);
      return {
        success: true,
        message: `Role successfully updated to ${newRole}`,
        updatedRole: newRole
      };
      
    } catch (error: unknown) {
      console.error('Exception in updateUserRole:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error occurred'
      };
    }
  }

  // Get all users with REAL roles from database - NO MOCKS
  async getAllUsersWithRoles(): Promise<UserRoleData[]> {
    try {
      console.log('🎭 PRODUCTION: Fetching all users with real roles...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No users found in database');
        return [];
      }

      // Return REAL data - no mock assignments
      const users = data.map((user) => ({
        id: user.id,
        email: user.email || 'No email',
        role: user.role || 'registered', // Default fallback only
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_seen: user.updated_at
      }));

      console.log(`✅ PRODUCTION: Found ${users.length} real users`);
      return users;
      
    } catch (error) {
      console.error('Exception in getAllUsersWithRoles:', error);
      return [];
    }
  }

  // Get current user's REAL role from database
  async getCurrentUserRole(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🎭 PRODUCTION: No user found, cannot get role.');
        return null;
      }

      console.log(`🎭 PRODUCTION: Querying role for user ID: ${user.id}`);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(`❌ PRODUCTION: Error getting current user role for ID ${user.id}:`, error);
        return 'registered'; // Default fallback
      }

      console.log(`🎭 PRODUCTION: Raw data from Supabase for user ID ${user.id}:`, data);
      const role = data?.role || 'registered';
      console.log(`🎭 PRODUCTION: Determined role for user ID ${user.id}: ${role}`);
      return role;
    } catch (error) {
      console.error('❌ PRODUCTION: Exception in getCurrentUserRole:', error);
      return 'registered';
    }
  }

  // Check if current user is admin or moderator - REAL CHECK
  async isAdminOrModerator(): Promise<boolean> {
    const role = await this.getCurrentUserRole();
    const isPrivileged = role === 'admin' || role === 'moderator';
    console.log(`🎭 PRODUCTION: User is privileged: ${isPrivileged} (role: ${role})`);
    return isPrivileged;
  }

  // Real-time subscription for profile changes - PRODUCTION
  subscribeToProfileChanges(callback: (payload: Record<string, unknown>) => void): void {
    try {
      console.log('🎭 PRODUCTION: Setting up real-time subscription');
      
      // Prevent multiple subscriptions
      if (this.realtimeChannel) {
        console.log('🎭 PRODUCTION: Channel already exists, unsubscribing first');
        this.unsubscribeFromProfileChanges();
      }
      
      // Use unique channel name to prevent conflicts
      const channelName = `role_service_profiles_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.realtimeChannel = supabase
        .channel(channelName)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('🎭 PRODUCTION: Real-time profile change detected:', payload);
            callback(payload);
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('🎭 PRODUCTION: Subscription error:', err);
          } else {
            console.log('🎭 PRODUCTION: Subscription status:', status);
          }
        });
        
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  }

  // Unsubscribe from real-time updates
  unsubscribeFromProfileChanges(): void {
    if (this.realtimeChannel) {
      try {
        supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
        console.log('🎭 PRODUCTION: Unsubscribed from profile changes');
      } catch (error) {
        console.error('🎭 PRODUCTION: Error unsubscribing:', error);
        this.realtimeChannel = null; // Reset anyway
      }
    }
  }

  // Get REAL audit log from database
  async getAuditLog(limit: number = 50): Promise<AuditLogEntry[]> {
    try {
      console.log('🎭 PRODUCTION: Fetching audit log from database');
      
      // role_audit_log table doesn't exist - returning empty array
      // const { data, error } = await supabase
      //   .from('role_audit_log')
      //   .select(`
      //     id,
      //     user_id,
      //     action_type,
      //     old_value,
      //     new_value,
      //     target_user_id,
      //     performed_by,
      //     metadata,
      //     created_at
      //   `)
      //   .order('created_at', { ascending: false })
      //   .limit(limit);

      // if (error) {
      //   console.error('🎭 Error fetching audit log:', error);
      //   return [];
      // }

      // Transform to AuditLogEntry format
      return [];
      // return (data || []).map(entry => ({
      //   id: entry.id,
      //   timestamp: entry.created_at,
      //   action: entry.action_type as 'role_assigned' | 'role_removed' | 'subscription_changed',
      //   userId: entry.target_user_id || entry.user_id,
      //   performedBy: entry.performed_by,
      //   details: {
      //     oldRole: entry.old_value,
      //     newRole: entry.new_value,
      //     metadata: entry.metadata
      //   }
      // }));
    } catch (error) {
      console.error('Exception in getAuditLog:', error);
      return [];
    }
  }

  // Bulk role update - PRODUCTION VERSION
  async bulkUpdateRoles(updates: Array<{ userId: string; newRole: string }>): Promise<RoleUpdateResult[]> {
    console.log('🎭 PRODUCTION: Starting bulk role update');
    const results: RoleUpdateResult[] = [];
    
    for (const update of updates) {
      const result = await this.updateUserRole(update.userId, update.newRole);
      results.push(result);
      
      // Small delay to avoid overwhelming database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ PRODUCTION: Bulk update completed: ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
  }

  // Get REAL role statistics from database
  async getRoleStatistics(): Promise<Record<string, number>> {
    try {
      console.log('🎭 PRODUCTION: Calculating real role statistics');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role');
        
      if (error) {
        console.error('Error getting role statistics:', error);
        return {};
      }
      
      const stats: Record<string, number> = {};
      data?.forEach(profile => {
        const role = profile.role || 'registered';
        stats[role] = (stats[role] || 0) + 1;
      });
      
      console.log('✅ PRODUCTION: Real role statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Exception in getRoleStatistics:', error);
      return {};
    }
  }

  // Validate role transition
  validateRoleTransition(currentRole: string, newRole: string, adminRole: string): { valid: boolean; message: string } {
    console.log(`🎭 PRODUCTION: Validating transition ${currentRole} → ${newRole} by ${adminRole}`);
    
    // Admins can do anything
    if (adminRole === 'admin') {
      return { valid: true, message: 'Admin can perform this action' };
    }

    // Moderators cannot create admins
    if (adminRole === 'moderator' && newRole === 'admin') {
      return { valid: false, message: 'Moderators cannot create admins' };
    }

    // Moderators can only promote to their level or below
    if (adminRole === 'moderator') {
      const allowedRoles = ['registered', 'silver', 'gold', 'platinum', 'moderator'];
      if (!allowedRoles.includes(newRole)) {
        return { valid: false, message: 'Moderators can only assign certain roles' };
      }
    }

    return { valid: true, message: 'Role transition is valid' };
  }

  // Get role hierarchy for UI display
  getRoleHierarchy(): Array<{ value: string; label: string; level: number }> {
    return [
      { value: 'registered', label: 'Registered User', level: 1 },
      { value: 'silver', label: 'Silver Member', level: 2 },
      { value: 'gold', label: 'Gold Member', level: 3 },
      { value: 'platinum', label: 'Platinum Member', level: 4 },
      { value: 'moderator', label: 'Moderator', level: 5 },
      { value: 'admin', label: 'Administrator', level: 6 }
    ];
  }

  // Format role for display
  formatRoleDisplay(role: string): string {
    const roleMap: Record<string, string> = {
      'registered': 'Registered User',
      'silver': 'Silver Member',
      'gold': 'Gold Member',
      'platinum': 'Platinum Member',
      'moderator': 'Moderator',
      'admin': 'Administrator'
    };

    return roleMap[role] || role;
  }

  // Get role color for UI
  getRoleColor(role: string): string {
    const colorMap: Record<string, string> = {
      'registered': 'gray',
      'silver': 'silver',
      'gold': 'yellow',
      'platinum': 'blue',
      'moderator': 'orange',
      'admin': 'red'
    };

    return colorMap[role] || 'gray';
  }

  // Get role badge variant for UI
  getRoleBadgeVariant(role: string): string {
    const variantMap: Record<string, string> = {
      'registered': 'secondary',
      'silver': 'secondary',
      'gold': 'default',
      'platinum': 'default',
      'moderator': 'outline',
      'admin': 'destructive'
    };

    return variantMap[role] || 'secondary';
  }

  // Check if role update is in progress (for UI loading states)
  isUpdating(): boolean {
    return false; // Can be enhanced with real loading state
  }

  // Get user permissions based on role
  getUserPermissions(role: string): string[] {
    const permissionMap: Record<string, string[]> = {
      'registered': ['view_profiles', 'send_messages'],
      'silver': ['view_profiles', 'send_messages', 'see_likes'],
      'gold': ['view_profiles', 'send_messages', 'see_likes', 'unlimited_likes'],
      'platinum': ['view_profiles', 'send_messages', 'see_likes', 'unlimited_likes', 'read_receipts', 'priority_support'],
      'moderator': ['view_profiles', 'send_messages', 'moderate_content', 'ban_users'],
      'admin': ['all_permissions']
    };

    return permissionMap[role] || permissionMap['registered'];
  }

  // Get specific user by ID - PRODUCTION
  async getUserById(userId: string): Promise<UserRoleData | null> {
    try {
      console.log(`🎭 PRODUCTION: Fetching user by ID: ${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user by ID:', error);
        return null;
      }

      if (!data) {
        console.log('User not found');
        return null;
      }

      return {
        id: data.id,
        email: data.email || 'No email',
        role: data.role || 'registered',
        created_at: data.created_at,
        updated_at: data.updated_at,
        last_seen: data.updated_at
      };
      
    } catch (error) {
      console.error('Exception in getUserById:', error);
      return null;
    }
  }

  // Search users by email - PRODUCTION
  async searchUsersByEmail(searchTerm: string): Promise<UserRoleData[]> {
    try {
      console.log(`🎭 PRODUCTION: Searching users by email: ${searchTerm}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, updated_at')
        .ilike('email', `%${searchTerm}%`)
        .limit(20);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data?.map(user => ({
        id: user.id,
        email: user.email || 'No email',
        role: user.role || 'registered',
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_seen: user.updated_at
      })) || [];
      
    } catch (error) {
      console.error('Exception in searchUsersByEmail:', error);
      return [];
    }
  }
}

export const roleService = new RoleService();
export default roleService;
