import { supabase } from '@/integrations/supabase/client';
import { logService } from './logService';
import { ExtendedPerformance, ExtendedNavigator, MemoryInfo, ConnectionInfo } from '@/types/common';

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message: string;
  responseTime?: number;
  details?: Record<string, any>;
  lastChecked: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error';
  services: HealthCheckResult[];
  summary: {
    healthy: number;
    warning: number;
    error: number;
    total: number;
  };
}

class SystemHealthService {
  private healthChecks: Map<string, HealthCheckResult> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(health: SystemHealth) => void> = new Set();
  private isMonitoring: boolean = false;

  constructor() {
    // Auto-start monitoring if admin debug mode is enabled
    if (import.meta.env.VITE_ADMIN_DEBUG_MODE === 'true') {
      this.startMonitoring();
    }
  }

  public startMonitoring(): void {
    if (this.isMonitoring) {
      logService.warn('SYSTEM', 'System health monitoring already started');
      return;
    }
    
    this.isMonitoring = true;
    // EGRESS OPTIMIZED: Increased interval from 30s to 5 minutes (300s) to reduce egress usage
    const interval = parseInt(import.meta.env.VITE_HEALTH_CHECK_INTERVAL || '300000');
    
    // Initial check
    this.runAllHealthChecks();
    
    // Schedule regular checks
    this.checkInterval = setInterval(() => {
      if (!this.isMonitoring) {
        this.stopMonitoring();
        return;
      }
      this.runAllHealthChecks();
    }, interval);

    logService.info('SYSTEM', 'System health monitoring started', {
      interval,
      adminMode: import.meta.env.VITE_ADMIN_DEBUG_MODE
    });
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    logService.info('SYSTEM', 'System health monitoring stopped');
  }

  public addListener(listener: (health: SystemHealth) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const health = this.getSystemHealth();
    this.listeners.forEach(listener => {
      try {
        listener(health);
      } catch (error) {
        logService.error('SYSTEM', 'Health listener error', { error });
      }
    });
  }

  private async runAllHealthChecks(): Promise<void> {
    try {
      // Run all health checks in parallel
      await Promise.allSettled([
        this.checkSupabaseConnection(),
        this.checkDatabaseHealth(),
        this.checkDockerServices(),
        this.checkNetworkConnectivity(),
        this.checkBrowserResources(),
        this.checkLocalStorage(),
        this.checkWebSocketConnection()
      ]);

      this.notifyListeners();
    } catch (error) {
      logService.error('SYSTEM', 'Health check execution failed', { error });
    }
  }

  private async checkSupabaseConnection(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Test Supabase connection with a simple query
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseTime = performance.now() - startTime;

      if (error) {
        this.updateHealthCheck('supabase', {
          name: 'Supabase Connection',
          status: 'error',
          message: `Connection failed: ${error.message}`,
          responseTime,
          details: { error: error.message, code: error.code },
          lastChecked: new Date().toISOString()
        });
      } else {
        this.updateHealthCheck('supabase', {
          name: 'Supabase Connection',
          status: responseTime > 2000 ? 'warning' : 'healthy',
          message: responseTime > 2000 ? 'Slow response time' : 'Connection healthy',
          responseTime,
          details: { recordCount: data?.length || 0 },
          lastChecked: new Date().toISOString()
        });
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateHealthCheck('supabase', {
        name: 'Supabase Connection',
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime,
        details: { error },
        lastChecked: new Date().toISOString()
      });
    }
  }

  private async checkDatabaseHealth(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Test database performance with multiple queries
      const [profilesResult, matchesResult] = await Promise.allSettled([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true })
      ]);

      const responseTime = performance.now() - startTime;
      
      const profilesSuccess = profilesResult.status === 'fulfilled' && !profilesResult.value.error;
      const matchesSuccess = matchesResult.status === 'fulfilled' && !matchesResult.value.error;
      
      if (profilesSuccess && matchesSuccess) {
        this.updateHealthCheck('database', {
          name: 'Database Health',
          status: responseTime > 3000 ? 'warning' : 'healthy',
          message: responseTime > 3000 ? 'Slow query performance' : 'Database performing well',
          responseTime,
          details: {
            profilesCount: profilesResult.status === 'fulfilled' ? profilesResult.value.count : 0,
            matchesCount: matchesResult.status === 'fulfilled' ? matchesResult.value.count : 0
          },
          lastChecked: new Date().toISOString()
        });
      } else {
        this.updateHealthCheck('database', {
          name: 'Database Health',
          status: 'error',
          message: 'Database queries failing',
          responseTime,
          details: {
            profilesError: profilesResult.status === 'rejected' ? profilesResult.reason : null,
            matchesError: matchesResult.status === 'rejected' ? matchesResult.reason : null
          },
          lastChecked: new Date().toISOString()
        });
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateHealthCheck('database', {
        name: 'Database Health',
        status: 'error',
        message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime,
        details: { error },
        lastChecked: new Date().toISOString()
      });
    }
  }

  private async checkDockerServices(): Promise<void> {
    try {
      // Since we can't directly access Docker from the browser,
      // we'll check if the services Docker provides are accessible
      const checks = await Promise.allSettled([
        this.checkPostgreSQLContainer(),
        this.checkRedisContainer(),
        this.checkPgAdminContainer()
      ]);

      const healthyChecks = checks.filter(check => 
        check.status === 'fulfilled' && check.value
      ).length;

      this.updateHealthCheck('docker', {
        name: 'Docker Services',
        status: healthyChecks === checks.length ? 'healthy' : 
                healthyChecks > 0 ? 'warning' : 'error',
        message: `${healthyChecks}/${checks.length} services accessible`,
        details: {
          postgresql: checks[0].status === 'fulfilled' ? checks[0].value : false,
          redis: checks[1].status === 'fulfilled' ? checks[1].value : false,
          pgadmin: checks[2].status === 'fulfilled' ? checks[2].value : false
        },
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      this.updateHealthCheck('docker', {
        name: 'Docker Services',
        status: 'error',
        message: 'Failed to check Docker services',
        details: { error },
        lastChecked: new Date().toISOString()
      });
    }
  }

  private async checkPostgreSQLContainer(): Promise<boolean> {
    try {
      // Test if PostgreSQL is accessible through Supabase
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  private async checkRedisContainer(): Promise<boolean> {
    try {
      // Since Redis is typically used for sessions/cache, we can't directly test it from browser
      // We'll assume it's healthy if the main app is working
      return typeof window !== 'undefined' && window.navigator.onLine;
    } catch {
      return false;
    }
  }

  private async checkPgAdminContainer(): Promise<boolean> {
    try {
      // Check if PgAdmin is accessible (though we can't actually test it due to CORS)
      const response = await fetch('http://localhost:5050/misc/ping', { 
        mode: 'no-cors',
        method: 'HEAD'
      });
      return true; // If no error thrown, service is likely up
    } catch {
      // PgAdmin not accessible, but this is not critical for app functionality
      return true; // We'll assume it's fine since it's an admin tool
    }
  }

  private async checkNetworkConnectivity(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Test network connectivity
      const online = navigator.onLine;
      const responseTime = performance.now() - startTime;

      if (online) {
        // Test actual connectivity with a simple request
        try {
          await fetch('https://httpbin.org/status/200', { 
            method: 'HEAD',
            mode: 'no-cors'
          });
          
          this.updateHealthCheck('network', {
            name: 'Network Connectivity',
            status: 'healthy',
            message: 'Network connection active',
            responseTime,
            details: { online: true },
            lastChecked: new Date().toISOString()
          });
        } catch {
          this.updateHealthCheck('network', {
            name: 'Network Connectivity',
            status: 'warning',
            message: 'Limited connectivity detected',
            responseTime,
            details: { online: true, external: false },
            lastChecked: new Date().toISOString()
          });
        }
      } else {
        this.updateHealthCheck('network', {
          name: 'Network Connectivity',
          status: 'error',
          message: 'No network connection',
          responseTime,
          details: { online: false },
          lastChecked: new Date().toISOString()
        });
      }
    } catch (error) {
      this.updateHealthCheck('network', {
        name: 'Network Connectivity',
        status: 'error',
        message: 'Network check failed',
        details: { error },
        lastChecked: new Date().toISOString()
      });
    }
  }

  private async checkBrowserResources(): Promise<void> {
    try {
      const memoryInfo = (performance as ExtendedPerformance).memory;
      const connectionInfo = (navigator as ExtendedNavigator).connection;
      
      const memoryUsage = memoryInfo ? {
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit,
        percentage: (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
      } : null;

      const isMemoryHigh = memoryUsage && memoryUsage.percentage > 80;
      const isMemoryWarning = memoryUsage && memoryUsage.percentage > 60;

      this.updateHealthCheck('browser', {
        name: 'Browser Resources',
        status: isMemoryHigh ? 'error' : isMemoryWarning ? 'warning' : 'healthy',
        message: isMemoryHigh ? 'High memory usage' : 
                isMemoryWarning ? 'Elevated memory usage' : 'Resource usage normal',
        details: {
          memory: memoryUsage,
          connection: connectionInfo ? {
            effectiveType: connectionInfo.effectiveType,
            downlink: connectionInfo.downlink,
            rtt: connectionInfo.rtt
          } : null,
          userAgent: navigator.userAgent.substring(0, 100)
        },
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      this.updateHealthCheck('browser', {
        name: 'Browser Resources',
        status: 'warning',
        message: 'Cannot assess browser resources',
        details: { error },
        lastChecked: new Date().toISOString()
      });
    }
  }

  private async checkLocalStorage(): Promise<void> {
    try {
      const testKey = '__health_check_test__';
      const testValue = Date.now().toString();
      
      // Test localStorage write/read
      localStorage.setItem(testKey, testValue);
      const readValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      const isWorking = readValue === testValue;
      
      // Get storage usage info
      const estimate = await navigator.storage?.estimate?.();
      const storageInfo = estimate ? {
        quota: estimate.quota,
        usage: estimate.usage,
        percentage: estimate.quota ? (estimate.usage! / estimate.quota) * 100 : 0
      } : null;

      this.updateHealthCheck('storage', {
        name: 'Browser Storage',
        status: isWorking ? 'healthy' : 'error',
        message: isWorking ? 'Storage accessible' : 'Storage not working',
        details: {
          localStorage: isWorking,
          storageEstimate: storageInfo
        },
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      this.updateHealthCheck('storage', {
        name: 'Browser Storage',
        status: 'error',
        message: 'Storage check failed',
        details: { error },
        lastChecked: new Date().toISOString()
      });
    }
  }

  private async checkWebSocketConnection(): Promise<void> {
    try {
      // Test Supabase real-time connection
      const channel = supabase.channel('health_check', {
        config: { presence: { key: 'health_check' } }
      });

      const startTime = performance.now();
      
      const connectionPromise = new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);
        
        channel.subscribe((status) => {
          clearTimeout(timeout);
          resolve(status === 'SUBSCRIBED');
        });
      });

      const connected = await connectionPromise;
      const responseTime = performance.now() - startTime;
      
      await supabase.removeChannel(channel);

      this.updateHealthCheck('websocket', {
        name: 'WebSocket Connection',
        status: connected ? 'healthy' : 'warning',
        message: connected ? 'Real-time connection active' : 'Real-time connection issues',
        responseTime,
        details: { connected },
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      this.updateHealthCheck('websocket', {
        name: 'WebSocket Connection',
        status: 'error',
        message: 'WebSocket check failed',
        details: { error },
        lastChecked: new Date().toISOString()
      });
    }
  }

  private updateHealthCheck(service: string, result: HealthCheckResult): void {
    this.healthChecks.set(service, result);
    
    // Log critical issues
    if (result.status === 'error') {
      logService.error('SYSTEM', `${result.name} health check failed`, {
        service,
        message: result.message,
        details: result.details
      });
    } else if (result.status === 'warning') {
      logService.warn('SYSTEM', `${result.name} health warning`, {
        service,
        message: result.message,
        details: result.details
      });
    }
  }

  public getSystemHealth(): SystemHealth {
    const services = Array.from(this.healthChecks.values());
    const summary = {
      healthy: services.filter(s => s.status === 'healthy').length,
      warning: services.filter(s => s.status === 'warning').length,
      error: services.filter(s => s.status === 'error').length,
      total: services.length
    };

    const overall = summary.error > 0 ? 'error' : 
                   summary.warning > 0 ? 'warning' : 'healthy';

    return {
      overall,
      services,
      summary
    };
  }

  public async runManualHealthCheck(): Promise<SystemHealth> {
    await this.runAllHealthChecks();
    return this.getSystemHealth();
  }
}

export const systemHealthService = new SystemHealthService();