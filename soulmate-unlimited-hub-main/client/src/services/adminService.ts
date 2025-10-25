import { UserRole } from "@/types/roles";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole | null;
  is_banned?: boolean | null;
  ban_reason?: string | null;
  photos?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  subscription_expires_at?: string | null;
  subscription_tier?: string | null;
  subscribed?: boolean;
  subscription_end?: string | null;
}

export class AdminService {
  private static instance: AdminService;

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    // Get JWT token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      console.error('🔧 [AdminService] No access token found in session');
      // Try to refresh the session
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      if (error || !refreshedSession?.access_token) {
        throw new Error('Authentication required - please log in again');
      }
      // Use refreshed token
      const refreshedToken = refreshedSession.access_token;
      console.log('🔧 [AdminService] Using refreshed token');
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshedToken}`,
          ...options.headers
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 [AdminService] Request failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response.json();
    }
    
    console.log('🔧 [AdminService] Making request with token:', token.substring(0, 20) + '...');
    console.log('🔧 [AdminService] Request URL:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      credentials: 'include' // Include cookies
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔧 [AdminService] Request failed:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async getAllUsers(): Promise<AdminUser[]> {
    try {
      console.log('🔧 [AdminService] Fetching all users from Supabase...');
      
      // Get users with subscription data from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          photos,
          created_at,
          updated_at,
          subscribers (
            subscription_tier,
            subscribed,
            subscription_end
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🔧 [AdminService] Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Fetch ban status separately for all users
      const userIds = data?.map(user => user.id) || [];
      const { data: banData } = await supabase
        .from('profiles')
        .select('id, is_banned')
        .in('id', userIds);

      const banMap = new Map(banData?.map(ban => [ban.id, ban]) || []);

      const adminUsers: AdminUser[] = data?.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_banned: banMap.get(user.id)?.is_banned || false,
        ban_reason: null,
        photos: user.photos,
        created_at: user.created_at,
        updated_at: user.updated_at,
        subscription_tier: Array.isArray(user.subscribers) && user.subscribers.length > 0 
          ? user.subscribers[0].subscription_tier 
          : null,
        subscribed: Array.isArray(user.subscribers) && user.subscribers.length > 0 
          ? user.subscribers[0].subscribed 
          : false,
        subscription_end: Array.isArray(user.subscribers) && user.subscribers.length > 0 
          ? user.subscribers[0].subscription_end 
          : null
      })) || [];

      console.log(`✅ [AdminService] Fetched ${adminUsers.length} users from Supabase`);
      console.log('🔧 [AdminService] Raw Supabase data:', data);
      console.log('🔧 [AdminService] Processed admin users:', adminUsers);
      return adminUsers;
      
    } catch (error) {
      console.error('🔧 [AdminService] Get all users error:', error);
      throw error;
    }
  }

  async updateUserRole(targetUserId: string, newRole: UserRole): Promise<void> {
    try {
      console.log(`🔧 [AdminService] Updating role: ${targetUserId} → ${newRole}`);
      console.log(`🔧 [AdminService] Making request to: /api/admin/users/${targetUserId}/role`);
      console.log(`🔧 [AdminService] Request body:`, { role: newRole });
      
      // Use server-side admin API to bypass RLS restrictions
      const data = await this.makeRequest(`/api/admin/users/${targetUserId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      
      console.log(`✅ [AdminService] Role updated successfully via server:`, data);
      console.log(`✅ [AdminService] Role updated: ${targetUserId} → ${newRole}`);
    } catch (error) {
      console.error('🔧 [AdminService] Update role error:', error);
      console.error('🔧 [AdminService] Error details:', error);
      throw error;
    }
  }

  async updateBanStatus(targetUserId: string, isBanned: boolean, reason?: string): Promise<void> {
    try {
      console.log(`🔧 [AdminService] Updating ban status: ${targetUserId} → ${isBanned}`);
      
      // Use server-side admin API to bypass RLS restrictions
      const data = await this.makeRequest(`/api/admin/users/${targetUserId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({ 
          is_banned: isBanned,
          ban_reason: isBanned ? (reason || 'Banned by admin') : null
        })
      });
      
      console.log(`✅ [AdminService] Ban status updated successfully via server:`, data);
      console.log(`✅ [AdminService] Ban status updated: ${targetUserId} → ${isBanned}`);
    } catch (error) {
      console.error('🔧 [AdminService] Update ban status error:', error);
      throw error;
    }
  }

  async updateSubscription(userId: string, subscriptionData: {
    subscription_tier: string;
    subscribed: boolean;
    subscription_end?: string | null;
  }): Promise<void> {
    await this.makeRequest(`/api/admin/users/${userId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData)
    });
  }

  async updateModeratorPermissions(userId: string, permissions: string[]): Promise<any> {
    const url = `/api/admin/users/${userId}/permissions`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ permissions })
    });
  }

  async grantSubscription(targetUserId: string, role: UserRole, durationDays: number): Promise<void> {
    try {
      console.log(`🔧 [AdminService] Granting subscription: ${targetUserId} → ${role} for ${durationDays} days`);
      
      // First get user email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', targetUserId)
        .single();

      if (userError || !user?.email) {
        throw new Error('User not found or missing email');
      }

      // Update role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', targetUserId);

      if (profileError) {
        console.error('🔧 [AdminService] Supabase profile update error:', profileError);
        throw new Error(`Failed to update role: ${profileError.message}`);
      }

      // Update or create subscription record with user_id and email
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

      const { error: subscriptionError } = await supabase
        .from('subscribers')
        .upsert({
          user_id: targetUserId,
          email: user.email,
          subscribed: true,
          subscription_tier: role,
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString()
        });

      if (subscriptionError) {
        console.error('🔧 [AdminService] Supabase subscription update error:', subscriptionError);
        throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
      }
      
      console.log(`✅ [AdminService] Subscription granted: ${targetUserId} → ${role}`);
    } catch (error) {
      console.error('🔧 [AdminService] Grant subscription error:', error);
      throw error;
    }
  }

  async deleteUser(targetUserId: string): Promise<void> {
    try {
      console.log(`🔧 [AdminService] Deleting user: ${targetUserId}`);
      
      // Delete user profile from Supabase
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', targetUserId);

      if (error) {
        console.error('🔧 [AdminService] Supabase delete error:', error);
        throw new Error(`Failed to delete user: ${error.message}`);
      }
      
      console.log(`✅ [AdminService] User deleted: ${targetUserId}`);
    } catch (error) {
      console.error('🔧 [AdminService] Delete user error:', error);
      throw error;
    }
  }

  async getModeratorPermissions(userId: string): Promise<string[]> {
    try {
      const response = await this.makeRequest(`/api/admin/users/${userId}/permissions`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to get moderator permissions');
      }

      const data = await response.json();
      return data.permissions || [];
    } catch (error) {
      console.error('🔧 [AdminService] Get moderator permissions error:', error);
      return [];
    }
  }
}

export const adminService = AdminService.getInstance();