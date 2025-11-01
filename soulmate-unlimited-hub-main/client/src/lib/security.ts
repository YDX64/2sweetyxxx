// Frontend security validation utilities
// These complement server-side security but NEVER replace it

export const ROLE_HIERARCHY = {
  registered: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  moderator: 4,
  admin: 5
} as const;

export const ROLE_PERMISSIONS = {
  registered: [],
  silver: [],
  gold: [],
  platinum: [],
  moderator: [
    "manage_users",
    "ban_users", 
    "view_reports",
    "manage_content"
  ],
  admin: [
    "manage_users",
    "ban_users",
    "delete_users",
    "manage_subscriptions",
    "view_reports", 
    "manage_content",
    "view_analytics",
    "all_permissions"
  ]
} as const;

export class ClientSecurityService {
  /**
   * Client-side validation for UI display purposes only
   * All actual security enforcement happens server-side
   */
  static canUserAccessAdminPanel(userRole: string): boolean {
    return ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] >= ROLE_HIERARCHY.admin;
  }

  static canUserAssignRoles(userRole: string): boolean {
    return userRole === 'admin';
  }

  static canUserDeleteUsers(userRole: string): boolean {
    return userRole === 'admin';
  }

  static canUserBanUsers(userRole: string): boolean {
    return ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] >= ROLE_HIERARCHY.moderator;
  }

  static canUserManageSubscriptions(userRole: string): boolean {
    return userRole === 'admin';
  }

  static canUserModerateContent(userRole: string): boolean {
    return ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] >= ROLE_HIERARCHY.moderator;
  }

  /**
   * Validates if user can assign a specific role (UI validation only)
   */
  static canAssignRole(currentUserRole: string, targetRole: string): boolean {
    const currentLevel = ROLE_HIERARCHY[currentUserRole as keyof typeof ROLE_HIERARCHY];
    const targetLevel = ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY];
    
    // Only admins can assign roles
    if (currentLevel < ROLE_HIERARCHY.admin) {
      return false;
    }
    
    // Cannot assign admin role
    if (targetLevel >= ROLE_HIERARCHY.admin) {
      return false;
    }
    
    return true;
  }

  /**
   * Get available roles for assignment based on current user role
   */
  static getAssignableRoles(currentUserRole: string): string[] {
    if (currentUserRole !== 'admin') {
      return [];
    }
    
    // Admins can assign all roles except admin
    return ['registered', 'silver', 'gold', 'platinum', 'moderator'];
  }

  /**
   * Validates if user can modify another user (UI validation only)
   */
  static canModifyUser(currentUserRole: string, targetUserRole: string, targetUserId: string, currentUserId: string): boolean {
    // Cannot modify yourself
    if (targetUserId === currentUserId) {
      return false;
    }
    
    const currentLevel = ROLE_HIERARCHY[currentUserRole as keyof typeof ROLE_HIERARCHY];
    const targetLevel = ROLE_HIERARCHY[targetUserRole as keyof typeof ROLE_HIERARCHY];
    
    // Can only modify lower-level users
    return currentLevel > targetLevel;
  }

  /**
   * Get user-friendly error message for permission denied
   */
  static getPermissionDeniedMessage(action: string): string {
    const messages: Record<string, string> = {
      'admin_panel': 'You need admin privileges to access the admin panel.',
      'assign_role': 'Only admins can assign roles to users.',
      'delete_user': 'Only admins can delete users.',
      'ban_user': 'You need moderator or admin privileges to ban users.',
      'manage_subscription': 'Only admins can manage subscriptions.',
      'moderate_content': 'You need moderator or admin privileges to moderate content.',
      'modify_user': 'You can only modify users with lower privileges than yours.'
    };
    
    return messages[action] || 'You do not have permission to perform this action.';
  }

  /**
   * Sanitize user input to prevent XSS and injection attacks
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Validate role string
   */
  static isValidRole(role: string): boolean {
    const validRoles = Object.keys(ROLE_HIERARCHY);
    return validRoles.includes(role);
  }

  /**
   * Get role display name with appropriate styling
   */
  static getRoleDisplayInfo(role: string): { name: string; color: string; canModify: boolean } {
    const roleInfo: Record<string, { name: string; color: string; canModify: boolean }> = {
      registered: { name: 'Registered', color: 'text-gray-600', canModify: true },
      silver: { name: 'Silver', color: 'text-gray-400', canModify: true },
      gold: { name: 'Gold', color: 'text-yellow-500', canModify: true },
      platinum: { name: 'Platinum', color: 'text-purple-600', canModify: true },
      moderator: { name: 'Moderator', color: 'text-blue-600', canModify: true },
      admin: { name: 'Admin', color: 'text-red-600', canModify: false }
    };
    
    return roleInfo[role] || { name: 'Unknown', color: 'text-gray-500', canModify: false };
  }
}

/**
 * React hook for security context
 */
export function useSecurityContext(userRole: string, userId: string) {
  return {
    canAccessAdminPanel: ClientSecurityService.canUserAccessAdminPanel(userRole),
    canAssignRoles: ClientSecurityService.canUserAssignRoles(userRole),
    canDeleteUsers: ClientSecurityService.canUserDeleteUsers(userRole),
    canBanUsers: ClientSecurityService.canUserBanUsers(userRole),
    canManageSubscriptions: ClientSecurityService.canUserManageSubscriptions(userRole),
    canModerateContent: ClientSecurityService.canUserModerateContent(userRole),
    assignableRoles: ClientSecurityService.getAssignableRoles(userRole),
    userId,
    userRole,
    canModifyUser: (targetRole: string, targetUserId: string) => 
      ClientSecurityService.canModifyUser(userRole, targetRole, targetUserId, userId)
  };
}