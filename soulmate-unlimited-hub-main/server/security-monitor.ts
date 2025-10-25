import { SecurityService, RESTRICTED_ACTIONS } from "./security";

// Real-time security monitoring and logging
export class SecurityMonitor {
  private static securityLogs: Array<{
    timestamp: Date;
    userId: string;
    action: string;
    result: 'allowed' | 'denied';
    reason?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  /**
   * Log security events for monitoring and auditing
   */
  static logSecurityEvent(
    userId: string,
    action: string,
    result: 'allowed' | 'denied',
    reason?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    const event = {
      timestamp: new Date(),
      userId,
      action,
      result,
      reason,
      severity
    };

    this.securityLogs.push(event);
    
    // Log to console for immediate visibility
    const logLevel = result === 'denied' ? 'warn' : 'info';
    console[logLevel](`🔒 SECURITY [${severity.toUpperCase()}]: ${action} ${result} for user ${userId}${reason ? ` - ${reason}` : ''}`);
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.securityLogs.length > 1000) {
      this.securityLogs = this.securityLogs.slice(-1000);
    }
  }

  /**
   * Get recent security events
   */
  static getRecentEvents(limit: number = 50): typeof SecurityMonitor.securityLogs {
    return this.securityLogs.slice(-limit);
  }

  /**
   * Get security events by severity
   */
  static getEventsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): typeof SecurityMonitor.securityLogs {
    return this.securityLogs.filter(event => event.severity === severity);
  }

  /**
   * Check for suspicious activity patterns
   */
  static detectSuspiciousActivity(userId: string): boolean {
    const recentEvents = this.securityLogs
      .filter(event => event.userId === userId && event.result === 'denied')
      .slice(-10); // Last 10 denied events

    // Flag if user has more than 5 denied actions in recent history
    if (recentEvents.length >= 5) {
      this.logSecurityEvent(
        userId,
        'SUSPICIOUS_ACTIVITY_DETECTED',
        'denied',
        `${recentEvents.length} denied actions detected`,
        'critical'
      );
      return true;
    }

    return false;
  }

  /**
   * Enhanced security validation with monitoring
   */
  static validateAndLog(
    userId: string,
    userRole: string,
    action: string,
    targetUserId?: string,
    targetRole?: string
  ): boolean {
    let isAllowed = false;
    let reason = '';

    switch (action) {
      case RESTRICTED_ACTIONS.ASSIGN_ROLE:
        if (targetRole) {
          isAllowed = SecurityService.validateRoleAssignment(userRole, targetRole);
          reason = isAllowed ? 'Valid role assignment' : 'Invalid role assignment - privilege escalation prevented';
        }
        break;

      case RESTRICTED_ACTIONS.DELETE_USER:
        isAllowed = SecurityService.validatePermission(userRole, action);
        if (isAllowed && targetUserId && targetRole) {
          isAllowed = SecurityService.validateUserModification(userRole, targetRole) && userId !== targetUserId;
          reason = isAllowed ? 'Valid user deletion' : 'Cannot delete equal/higher privilege user or self';
        }
        break;

      case RESTRICTED_ACTIONS.BAN_USER:
        isAllowed = SecurityService.validatePermission(userRole, action);
        if (isAllowed && targetUserId && targetRole) {
          isAllowed = SecurityService.validateUserModification(userRole, targetRole) && userId !== targetUserId;
          reason = isAllowed ? 'Valid user ban' : 'Cannot ban equal/higher privilege user or self';
        }
        break;

      case RESTRICTED_ACTIONS.MANAGE_SUBSCRIPTION:
        isAllowed = SecurityService.validatePermission(userRole, action);
        if (isAllowed && targetUserId) {
          isAllowed = userId !== targetUserId;
          reason = isAllowed ? 'Valid subscription management' : 'Cannot modify own subscription';
        }
        break;

      case RESTRICTED_ACTIONS.ACCESS_ADMIN_PANEL:
        isAllowed = SecurityService.validatePermission(userRole, action);
        reason = isAllowed ? 'Admin panel access granted' : 'Insufficient privileges for admin panel';
        break;

      default:
        isAllowed = SecurityService.validatePermission(userRole, action);
        reason = isAllowed ? 'Permission granted' : 'Permission denied';
    }

    // Determine severity based on action and result
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (!isAllowed) {
      if (action.includes('ASSIGN_ROLE') || action.includes('DELETE_USER')) {
        severity = 'high';
      } else if (action.includes('ADMIN_PANEL') || action.includes('MANAGE_SUBSCRIPTION')) {
        severity = 'medium';
      }
    }

    this.logSecurityEvent(
      userId,
      action,
      isAllowed ? 'allowed' : 'denied',
      reason,
      severity
    );

    // Check for suspicious activity if action was denied
    if (!isAllowed) {
      this.detectSuspiciousActivity(userId);
    }

    return isAllowed;
  }

  /**
   * Generate security report
   */
  static generateSecurityReport(): {
    totalEvents: number;
    deniedEvents: number;
    suspiciousUsers: string[];
    criticalEvents: number;
    recentActivity: typeof SecurityMonitor.securityLogs;
  } {
    const deniedEvents = this.securityLogs.filter(event => event.result === 'denied');
    const criticalEvents = this.securityLogs.filter(event => event.severity === 'critical');
    
    // Find users with multiple denied events
    const userDeniedCounts: Record<string, number> = {};
    deniedEvents.forEach(event => {
      userDeniedCounts[event.userId] = (userDeniedCounts[event.userId] || 0) + 1;
    });
    
    const suspiciousUsers = Object.entries(userDeniedCounts)
      .filter(([_, count]) => count >= 3)
      .map(([userId, _]) => userId);

    return {
      totalEvents: this.securityLogs.length,
      deniedEvents: deniedEvents.length,
      suspiciousUsers,
      criticalEvents: criticalEvents.length,
      recentActivity: this.getRecentEvents(20)
    };
  }
}

// Express middleware for automatic security logging
export function securityLoggingMiddleware(req: any, res: any, next: any) {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // Log failed requests as potential security events
    if (res.statusCode === 403 || res.statusCode === 401) {
      SecurityMonitor.logSecurityEvent(
        req.userId || 'anonymous',
        `${req.method} ${req.path}`,
        'denied',
        `HTTP ${res.statusCode}`,
        res.statusCode === 403 ? 'medium' : 'low'
      );
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}