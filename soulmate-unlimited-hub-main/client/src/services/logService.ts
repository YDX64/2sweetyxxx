import { supabase } from '@/integrations/supabase/client';
import { ExtendedPerformance, ExtendedWindow, NetworkRequest } from '@/types/common';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
export type LogCategory = 
  | 'AUTH' | 'USER_ACTION' | 'NETWORK' | 'DATABASE' | 'PAYMENT' 
  | 'ADMIN' | 'CHAT' | 'PROFILE' | 'SUBSCRIPTION' | 'PERFORMANCE'
  | 'SYSTEM' | 'ERROR' | 'UI' | 'NAVIGATION' | 'SECURITY';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  userId?: string;
  userEmail?: string;
  adminId?: string;
  sessionId: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  details?: Record<string, unknown>;
  stackTrace?: string;
  performance?: {
    duration?: number;
    memory?: {
      used: number;
      total: number;
      limit: number;
    };
    timing?: Record<string, number>;
  };
  network?: {
    method?: string;
    url?: string;
    status?: number;
    responseTime?: number;
    requestSize?: number;
    responseSize?: number;
  };
}

class LogServiceClass {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private isEnabled: boolean = false;
  private maxLogs: number = 10000;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private networkInterceptor: ((req: NetworkRequest) => void) | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.checkEnvironmentSettings();
    this.setupAutoCleanup();
    this.setupPerformanceMonitoring();
    this.setupNetworkMonitoring();
    this.setupErrorHandling();
    this.setupUserActionTracking();
    
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
      
      // Add to window for debugging
      (window as ExtendedWindow).logService = this;
      this.log('SYSTEM', 'INFO', 'Log service initialized and attached to window', {
        sessionId: this.sessionId,
        loggingEnabled: this.isEnabled
      });
    }
  }

  private checkEnvironmentSettings(): void {
    // Check environment variables for secure logging
    const adminDebugMode = import.meta.env.VITE_ADMIN_DEBUG_MODE;
    const loggingSecret = import.meta.env.VITE_ADMIN_LOGGING_SECRET;
    const logLevel = import.meta.env.VITE_LOG_LEVEL;
    const isProd = import.meta.env.PROD;
    
    // Only enable in development or with explicit admin debug mode
    this.isEnabled = !isProd && (adminDebugMode === 'true' || adminDebugMode === '1');
    
    // Additional security check for production
    if (isProd && adminDebugMode === 'true' && loggingSecret) {
      // Only enable in production if secret is provided (admin access)
      this.isEnabled = true;
    }
    
    if (this.isEnabled) {
      console.log('🔍 [SECURE-LOG] Debug logging enabled');
      console.log('🔍 [SECURE-LOG] Environment:', isProd ? 'Production' : 'Development');
      console.log('🔍 [SECURE-LOG] Log level:', logLevel || 'ALL');
    }
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  private setupAutoCleanup(): void {
    // Clean logs every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupLogs();
    }, 60 * 60 * 1000); // 1 hour

    // Also cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.logPerformance(entry);
          }
        });

        this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }

  private setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Monitor fetch requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = args[0] instanceof Request ? args[0].url : args[0];
        const method = args[1]?.method || (args[0] instanceof Request ? args[0].method : 'GET');
        
        try {
          const response = await originalFetch(...args);
          const endTime = performance.now();
          
          this.logNetwork({
            method,
            url: url.toString(),
            status: response.status,
            responseTime: endTime - startTime,
            success: response.ok
          });
          
          return response;
        } catch (error) {
          const endTime = performance.now();
          this.logNetwork({
            method,
            url: url.toString(),
            status: 0,
            responseTime: endTime - startTime,
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
          });
          throw error;
        }
      };
    }
  }

  private setupErrorHandling(): void {
    if (typeof window !== 'undefined') {
      // React error boundary integration will be handled separately
      window.addEventListener('error', (event) => {
        this.log('ERROR', 'ERROR', 'JavaScript Error', {
          message: event.error?.message || event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.log('ERROR', 'ERROR', 'Unhandled Promise Rejection', {
          reason: event.reason,
          promise: event.promise
        });
      });
    }
  }

  private setupUserActionTracking(): void {
    if (typeof window !== 'undefined') {
      // Wait for DOM to be ready
      const setupTracking = () => {
        // Track clicks, navigation, form submissions
        document.addEventListener('click', (event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
            this.log('UI', 'INFO', 'User Click', {
              element: target.tagName,
              text: target.textContent?.slice(0, 50),
              className: target.className,
              id: target.id
            });
          }
        });

        // Track form submissions
        document.addEventListener('submit', (event) => {
          const form = event.target as HTMLFormElement;
          this.log('UI', 'INFO', 'Form Submission', {
            formId: form.id,
            formClassName: form.className,
            action: form.action
          });
        });
      };

      // Setup tracking when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupTracking);
      } else {
        setupTracking();
      }
    }
  }

  private handleGlobalError(event: ErrorEvent): void {
    this.log('ERROR', 'ERROR', 'Global JavaScript Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.log('ERROR', 'ERROR', 'Unhandled Promise Rejection', {
      reason: event.reason,
      stack: event.reason?.stack
    });
  }

  private logPerformance(entry: PerformanceEntry): void {
    if (!this.isEnabled) return;

    let details: Record<string, unknown> = {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime
    };

    if (entry.entryType === 'navigation') {
      const navEntry = entry as PerformanceNavigationTiming;
      details = {
        ...details,
        loadEventEnd: navEntry.loadEventEnd,
        domContentLoadedEventEnd: navEntry.domContentLoadedEventEnd,
        responseEnd: navEntry.responseEnd
      };
    }

    this.log('PERFORMANCE', 'INFO', `Performance: ${entry.entryType}`, details);
  }

  private logNetwork(networkInfo: NetworkRequest): void {
    if (!this.isEnabled) return;

    this.log('NETWORK', networkInfo.success ? 'INFO' : 'ERROR', 
      `${networkInfo.method} ${networkInfo.url}`, {
        ...networkInfo,
        timestamp: new Date().toISOString()
      });
  }

  public log(
    category: LogCategory,
    level: LogLevel,
    message: string,
    details?: Record<string, any>,
    userId?: string,
    adminId?: string
  ): void {
    if (!this.isEnabled) return;

    // Check admin access for sensitive logging
    const isAdminUser = this.checkAdminAccess();
    
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      userId: isAdminUser ? userId : this.maskUserId(userId),
      adminId,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? this.maskSensitiveUrl(window.location.href) : undefined,
      userAgent: typeof navigator !== 'undefined' ? this.maskUserAgent(navigator.userAgent) : undefined,
      details: this.maskSensitiveData(details || {}),
      performance: this.getPerformanceMetrics()
    };

    this.logs.push(logEntry);

    // Console output only for admin users or development
    if (isAdminUser || !import.meta.env.PROD) {
      this.consoleLog(logEntry);
    }

    // Trim logs if too many
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-Math.floor(this.maxLogs * 0.8));
    }
  }

  private checkAdminAccess(): boolean {
    // Check if current user has admin access
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (!authData) return false;
      
      const parsedAuth = JSON.parse(authData);
      const userRole = parsedAuth?.user?.user_metadata?.role;
      return userRole === 'admin' || userRole === 'moderator';
    } catch {
      return false;
    }
  }

  private maskUserId(userId?: string): string | undefined {
    if (!userId) return undefined;
    // Mask user ID for privacy: show first 8 chars + ***
    return userId.length > 8 ? `${userId.substring(0, 8)}***` : '***';
  }

  private maskSensitiveUrl(url: string): string {
    // Remove query parameters that might contain sensitive data
    try {
      const urlObj = new URL(url);
      urlObj.search = ''; // Remove all query params
      return urlObj.toString();
    } catch {
      return url.split('?')[0]; // Fallback
    }
  }

  private maskUserAgent(userAgent: string): string {
    // Keep only browser info, remove detailed system info
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
    return browserMatch ? browserMatch[0] : 'Browser/Unknown';
  }

  private maskSensitiveData(details: Record<string, any>): Record<string, any> {
    const masked = { ...details };
    
    // Mask common sensitive fields
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'email', 'phone'];
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        if (typeof masked[field] === 'string') {
          masked[field] = this.maskString(masked[field]);
        }
      }
    }

    // Mask email addresses in any field
    for (const [key, value] of Object.entries(masked)) {
      if (typeof value === 'string' && value.includes('@')) {
        masked[key] = this.maskEmail(value);
      }
    }

    return masked;
  }

  private maskString(str: string): string {
    if (str.length <= 3) return '***';
    return `${str.substring(0, 3)}***`;
  }

  private maskEmail(email: string): string {
    const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    return email.replace(emailRegex, (match, username, domain) => {
      const maskedUsername = username.length > 3 ? `${username.substring(0, 3)}***` : '***';
      return `${maskedUsername}@${domain}`;
    });
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  private getPerformanceMetrics(): LogEntry['performance'] {
    if (typeof performance === 'undefined') return undefined;

    const memory = (performance as ExtendedPerformance).memory;
    return {
      memory: memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      } : undefined,
      timing: {
        navigationStart: performance.timeOrigin,
        now: performance.now()
      }
    };
  }

  private consoleLog(entry: LogEntry): void {
    const emoji = this.getLevelEmoji(entry.level);
    const color = this.getLevelColor(entry.level);
    
    const style = `color: ${color}; font-weight: bold;`;
    
    console.log(
      `%c${emoji} [${entry.category}] ${entry.message}`,
      style,
      entry
    );
  }

  private getLevelEmoji(level: LogLevel): string {
    const emojis = {
      DEBUG: '🔍',
      INFO: '💡',
      WARN: '⚠️',
      ERROR: '❌',
      CRITICAL: '🚨'
    };
    return emojis[level] || '📝';
  }

  private getLevelColor(level: LogLevel): string {
    const colors = {
      DEBUG: '#6366f1',
      INFO: '#06b6d4',
      WARN: '#f59e0b',
      ERROR: '#ef4444',
      CRITICAL: '#dc2626'
    };
    return colors[level] || '#64748b';
  }

  public getLogs(filters?: {
    level?: LogLevel;
    category?: LogCategory;
    userId?: string;
    timeRange?: { start: Date; end: Date };
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = this.logs;

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.timeRange) {
        filteredLogs = filteredLogs.filter(log => {
          const logTime = new Date(log.timestamp);
          return logTime >= filters.timeRange!.start && logTime <= filters.timeRange!.end;
        });
      }
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(-filters.limit);
      }
    }

    return filteredLogs;
  }

  public getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
    sessionDuration: number;
    errorRate: number;
  } {
    const byLevel: Record<LogLevel, number> = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      CRITICAL: 0
    };
    const byCategory: Record<string, number> = {};

    this.logs.forEach(log => {
      byLevel[log.level]++;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    });

    const errorCount = byLevel.ERROR + byLevel.CRITICAL;
    const errorRate = this.logs.length > 0 ? (errorCount / this.logs.length) * 100 : 0;

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1]),
      errorRate
    };
  }

  public exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      stats: this.getLogStats(),
      logs: this.logs
    }, null, 2);
  }

  public clearLogs(): void {
    this.logs = [];
    this.log('SYSTEM', 'INFO', 'Logs cleared manually');
  }

  private cleanupLogs(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oldLogCount = this.logs.length;
    
    this.logs = this.logs.filter(log => new Date(log.timestamp) > oneHourAgo);
    
    const removedCount = oldLogCount - this.logs.length;
    if (removedCount > 0) {
      this.log('SYSTEM', 'INFO', `Automatic log cleanup: removed ${removedCount} old logs`);
    }
  }

  public cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }

  public enable(): void {
    this.isEnabled = true;
    this.log('SYSTEM', 'INFO', 'Logging enabled');
  }

  public disable(): void {
    this.log('SYSTEM', 'INFO', 'Logging disabled');
    this.isEnabled = false;
  }

  public isLoggingEnabled(): boolean {
    return this.isEnabled;
  }

  // Convenience methods for different log levels
  public debug(category: LogCategory, message: string, details?: unknown, userId?: string): void {
    this.log(category, 'DEBUG', message, details as Record<string, any>, userId);
  }

  public info(category: LogCategory, message: string, details?: unknown, userId?: string): void {
    this.log(category, 'INFO', message, details as Record<string, any>, userId);
  }

  public warn(category: LogCategory, message: string, details?: unknown, userId?: string): void {
    this.log(category, 'WARN', message, details as Record<string, any>, userId);
  }

  public error(category: LogCategory, message: string, details?: unknown, userId?: string): void {
    this.log(category, 'ERROR', message, details as Record<string, any>, userId);
  }

  public critical(category: LogCategory, message: string, details?: unknown, userId?: string): void {
    this.log(category, 'CRITICAL', message, details as Record<string, any>, userId);
  }
}

// Create singleton instance
export const logService = new LogServiceClass();

// Export for global access
if (typeof window !== 'undefined') {
  (window as ExtendedWindow).logService = logService;
}

export default logService; 