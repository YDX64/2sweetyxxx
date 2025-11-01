import { Profile } from "@shared/schema";

// Define role hierarchy levels
export const ROLE_LEVELS = {
  registered: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  moderator: 4,
  admin: 5
} as const;

// Define maximum permissions for each role
export const ROLE_PERMISSIONS = {
  registered: [] as string[],
  silver: [] as string[],
  gold: [] as string[],
  platinum: [] as string[],
  moderator: [
    "manage_users",
    "ban_users", 
    "view_reports",
    "manage_content"
  ] as string[],
  admin: [
    "manage_users",
    "ban_users",
    "delete_users",
    "manage_subscriptions",
    "view_reports", 
    "manage_content",
    "view_analytics",
    "all_permissions"
  ] as string[]
};

// Define actions that require elevated permissions
export const RESTRICTED_ACTIONS = {
  ASSIGN_ROLE: "assign_role",
  DELETE_USER: "delete_user",
  BAN_USER: "ban_user",
  MANAGE_SUBSCRIPTION: "manage_subscription",
  ACCESS_ADMIN_PANEL: "access_admin_panel",
  MODERATE_CONTENT: "moderate_content",
  VIEW_USER_DATA: "view_user_data"
} as const;

export class SecurityService {
  
  /**
   * Validates if a user can perform a specific action
   */
  static validatePermission(userRole: string, action: string): boolean {
    const userLevel = ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS];
    
    switch (action) {
      case RESTRICTED_ACTIONS.ACCESS_ADMIN_PANEL:
        return userLevel >= ROLE_LEVELS.moderator;
      
      case RESTRICTED_ACTIONS.ASSIGN_ROLE:
        return userLevel >= ROLE_LEVELS.admin;
      
      case RESTRICTED_ACTIONS.DELETE_USER:
        return userLevel >= ROLE_LEVELS.admin;
      
      case RESTRICTED_ACTIONS.MANAGE_SUBSCRIPTION:
        return userLevel >= ROLE_LEVELS.admin;
      
      case RESTRICTED_ACTIONS.BAN_USER:
        return userLevel >= ROLE_LEVELS.moderator;
      
      case RESTRICTED_ACTIONS.MODERATE_CONTENT:
        return userLevel >= ROLE_LEVELS.moderator;
      
      case RESTRICTED_ACTIONS.VIEW_USER_DATA:
        return userLevel >= ROLE_LEVELS.moderator;
      
      default:
        return false;
    }
  }

  /**
   * Validates if a user can assign a specific role to another user
   */
  static validateRoleAssignment(assignerRole: string, targetRole: string): boolean {
    const assignerLevel = ROLE_LEVELS[assignerRole as keyof typeof ROLE_LEVELS];
    const targetLevel = ROLE_LEVELS[targetRole as keyof typeof ROLE_LEVELS];
    
    // Only admins can assign roles
    if (assignerLevel < ROLE_LEVELS.admin) {
      return false;
    }
    
    // Admins cannot assign admin role to others (prevents privilege escalation)
    if (targetLevel >= ROLE_LEVELS.admin) {
      return false;
    }
    
    // Can only assign roles lower than assigner's level
    return targetLevel < assignerLevel;
  }

  /**
   * Validates if a user can modify another user's data
   */
  static validateUserModification(modifierRole: string, targetRole: string): boolean {
    const modifierLevel = ROLE_LEVELS[modifierRole as keyof typeof ROLE_LEVELS];
    const targetLevel = ROLE_LEVELS[targetRole as keyof typeof ROLE_LEVELS];
    
    // Users cannot modify their own role
    if (modifierLevel === targetLevel) {
      return false;
    }
    
    // Only higher-level roles can modify lower-level roles
    return modifierLevel > targetLevel;
  }

  /**
   * Sanitizes role assignment requests
   */
  static sanitizeRoleAssignment(requestedRole: string): string | null {
    const validRoles = Object.keys(ROLE_LEVELS);
    
    // Ensure requested role is valid
    if (!validRoles.includes(requestedRole)) {
      return null;
    }
    
    // Prevent direct admin assignment through API
    if (requestedRole === "admin") {
      return null;
    }
    
    return requestedRole;
  }

  /**
   * Validates subscription tier changes
   */
  static validateSubscriptionChange(userRole: string, newTier: string): boolean {
    // Only admins can manually change subscription tiers
    if (ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] < ROLE_LEVELS.admin) {
      return false;
    }
    
    const validTiers = ["registered", "silver", "gold", "platinum"];
    return validTiers.includes(newTier);
  }

  /**
   * Checks if user has required permission
   */
  static hasPermission(userRole: string, permission: string): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
    
    if (!rolePermissions) {
      return false;
    }
    
    return rolePermissions.includes(permission) || rolePermissions.includes("all_permissions");
  }

  /**
   * Validates moderator permission assignment
   */
  static validateModeratorPermission(assignerRole: string, permission: string): boolean {
    // Only admins can assign moderator permissions
    if (ROLE_LEVELS[assignerRole as keyof typeof ROLE_LEVELS] < ROLE_LEVELS.admin) {
      return false;
    }
    
    const validPermissions = ROLE_PERMISSIONS.moderator;
    return validPermissions.includes(permission);
  }

  /**
   * Prevents privilege escalation attacks
   */
  static preventPrivilegeEscalation(currentRole: string, requestedChanges: any): boolean {
    const currentLevel = ROLE_LEVELS[currentRole as keyof typeof ROLE_LEVELS];
    
    // Check if user is trying to modify their own role
    if (requestedChanges.role && requestedChanges.role !== currentRole) {
      return false;
    }
    
    // Check if user is trying to assign admin permissions to themselves
    if (requestedChanges.permissions && currentLevel < ROLE_LEVELS.admin) {
      return false;
    }
    
    return true;
  }
}

// Export security middleware for Express routes
export function requireRole(minimumRole: keyof typeof ROLE_LEVELS) {
  return (req: any, res: any, next: any) => {
    const userRole = req.user?.role || "registered";
    const userLevel = ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS];
    const requiredLevel = ROLE_LEVELS[minimumRole];
    
    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        required: minimumRole,
        current: userRole 
      });
    }
    
    next();
  };
}

// Export permission middleware
export function requirePermission(permission: string) {
  return (req: any, res: any, next: any) => {
    const userRole = req.user?.role || "registered";
    
    if (!SecurityService.hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        error: "Permission denied",
        required: permission,
        role: userRole 
      });
    }
    
    next();
  };
}