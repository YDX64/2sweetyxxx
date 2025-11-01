import { SecurityService, RESTRICTED_ACTIONS } from "./security";

// Comprehensive security testing suite
export class SecurityTestSuite {
  
  static runAllTests() {
    console.log('🔒 Starting comprehensive security test suite...');
    
    this.testRoleHierarchy();
    this.testRoleAssignmentValidation();
    this.testUserModificationValidation();
    this.testPermissionValidation();
    this.testPrivilegeEscalationPrevention();
    this.testSubscriptionSecurity();
    
    console.log('✅ Security test suite completed');
  }

  static testRoleHierarchy() {
    console.log('🧪 Testing role hierarchy...');
    
    // Test admin permissions
    console.assert(
      SecurityService.validatePermission('admin', RESTRICTED_ACTIONS.ASSIGN_ROLE),
      'Admin should have role assignment permission'
    );
    
    console.assert(
      SecurityService.validatePermission('admin', RESTRICTED_ACTIONS.DELETE_USER),
      'Admin should have user deletion permission'
    );
    
    // Test moderator permissions
    console.assert(
      SecurityService.validatePermission('moderator', RESTRICTED_ACTIONS.BAN_USER),
      'Moderator should have ban permission'
    );
    
    console.assert(
      !SecurityService.validatePermission('moderator', RESTRICTED_ACTIONS.ASSIGN_ROLE),
      'Moderator should NOT have role assignment permission'
    );
    
    // Test registered user permissions
    console.assert(
      !SecurityService.validatePermission('registered', RESTRICTED_ACTIONS.BAN_USER),
      'Registered user should NOT have ban permission'
    );
    
    console.log('✅ Role hierarchy tests passed');
  }

  static testRoleAssignmentValidation() {
    console.log('🧪 Testing role assignment validation...');
    
    // Admins can assign lower roles
    console.assert(
      SecurityService.validateRoleAssignment('admin', 'moderator'),
      'Admin should be able to assign moderator role'
    );
    
    console.assert(
      SecurityService.validateRoleAssignment('admin', 'platinum'),
      'Admin should be able to assign platinum role'
    );
    
    // Admins cannot assign admin role
    console.assert(
      !SecurityService.validateRoleAssignment('admin', 'admin'),
      'Admin should NOT be able to assign admin role'
    );
    
    // Moderators cannot assign any roles
    console.assert(
      !SecurityService.validateRoleAssignment('moderator', 'registered'),
      'Moderator should NOT be able to assign any roles'
    );
    
    // Role sanitization tests
    console.assert(
      SecurityService.sanitizeRoleAssignment('admin') === null,
      'Admin role should be sanitized to null'
    );
    
    console.assert(
      SecurityService.sanitizeRoleAssignment('moderator') === 'moderator',
      'Moderator role should pass sanitization'
    );
    
    console.log('✅ Role assignment validation tests passed');
  }

  static testUserModificationValidation() {
    console.log('🧪 Testing user modification validation...');
    
    // Admin can modify lower roles
    console.assert(
      SecurityService.validateUserModification('admin', 'moderator'),
      'Admin should be able to modify moderator'
    );
    
    console.assert(
      SecurityService.validateUserModification('admin', 'registered'),
      'Admin should be able to modify registered user'
    );
    
    // Users cannot modify equal or higher roles
    console.assert(
      !SecurityService.validateUserModification('moderator', 'admin'),
      'Moderator should NOT be able to modify admin'
    );
    
    console.assert(
      !SecurityService.validateUserModification('moderator', 'moderator'),
      'Moderator should NOT be able to modify another moderator'
    );
    
    console.assert(
      !SecurityService.validateUserModification('registered', 'registered'),
      'Registered user should NOT be able to modify another registered user'
    );
    
    console.log('✅ User modification validation tests passed');
  }

  static testPermissionValidation() {
    console.log('🧪 Testing permission validation...');
    
    // Admin permissions
    console.assert(
      SecurityService.hasPermission('admin', 'all_permissions'),
      'Admin should have all_permissions'
    );
    
    console.assert(
      SecurityService.hasPermission('admin', 'manage_users'),
      'Admin should have manage_users permission'
    );
    
    // Moderator permissions
    console.assert(
      SecurityService.hasPermission('moderator', 'manage_users'),
      'Moderator should have manage_users permission'
    );
    
    console.assert(
      !SecurityService.hasPermission('moderator', 'all_permissions'),
      'Moderator should NOT have all_permissions'
    );
    
    // Regular user permissions
    console.assert(
      !SecurityService.hasPermission('registered', 'manage_users'),
      'Registered user should NOT have manage_users permission'
    );
    
    console.log('✅ Permission validation tests passed');
  }

  static testPrivilegeEscalationPrevention() {
    console.log('🧪 Testing privilege escalation prevention...');
    
    // Test self-role modification prevention
    const selfModificationAttempt = {
      role: 'admin'
    };
    
    console.assert(
      !SecurityService.preventPrivilegeEscalation('moderator', selfModificationAttempt),
      'Self-role modification should be prevented'
    );
    
    // Test permission assignment to non-admins
    const permissionAttempt = {
      permissions: ['all_permissions']
    };
    
    console.assert(
      !SecurityService.preventPrivilegeEscalation('moderator', permissionAttempt),
      'Permission escalation should be prevented'
    );
    
    console.log('✅ Privilege escalation prevention tests passed');
  }

  static testSubscriptionSecurity() {
    console.log('🧪 Testing subscription security...');
    
    // Only admins can change subscriptions
    console.assert(
      SecurityService.validateSubscriptionChange('admin', 'platinum'),
      'Admin should be able to change subscription'
    );
    
    console.assert(
      !SecurityService.validateSubscriptionChange('moderator', 'platinum'),
      'Moderator should NOT be able to change subscription'
    );
    
    console.assert(
      !SecurityService.validateSubscriptionChange('registered', 'platinum'),
      'Registered user should NOT be able to change subscription'
    );
    
    // Invalid tier validation
    console.assert(
      !SecurityService.validateSubscriptionChange('admin', 'invalid_tier'),
      'Invalid subscription tier should be rejected'
    );
    
    console.log('✅ Subscription security tests passed');
  }
}

// Export for manual execution
// SecurityTestSuite is already exported above