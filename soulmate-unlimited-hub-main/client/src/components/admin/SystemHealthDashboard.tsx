import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Shield,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  systemHealthService, 
  SystemHealth, 
  HealthCheckResult 
} from '@/services/systemHealthService';
import { logService } from '@/services/logService';

const SystemHealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadSystemHealth();
    
    const unsubscribe = systemHealthService.addListener((newHealth) => {
      setHealth(newHealth);
      setLastUpdate(new Date());
    });

    setIsMonitoring(true);
    systemHealthService.startMonitoring();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadSystemHealth = async () => {
    setIsLoading(true);
    try {
      const newHealth = await systemHealthService.runManualHealthCheck();
      setHealth(newHealth);
      setLastUpdate(new Date());
    } catch (error) {
      logService.error('SYSTEM', 'Failed to load system health', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      systemHealthService.stopMonitoring();
      setIsMonitoring(false);
    } else {
      systemHealthService.startMonitoring();
      setIsMonitoring(true);
    }
  };

  const toggleLogging = () => {
    if (logService.isLoggingEnabled()) {
      logService.disable();
    } else {
      logService.enable();
    }
  };

  const exportHealthReport = () => {
    if (!health) return;

    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: health,
      logs: logService.getLogs({ limit: 100 })
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-health-report-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getOverallStatusColor = (status: SystemHealth['overall']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  if (!health) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-gray-400">Loading system health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center">
          <Shield className="w-6 h-6 mr-2 text-blue-500" />
          System Health Monitor
        </h2>
        <div className="flex items-center space-x-2">
          <Badge className={getOverallStatusColor(health.overall)}>
            {health.overall.toUpperCase()}
          </Badge>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSystemHealth}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
              onClick={toggleMonitoring}
            >
              {isMonitoring ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            
            <Button
              variant={logService.isLoggingEnabled() ? "destructive" : "default"}
              size="sm"
              onClick={toggleLogging}
            >
              {logService.isLoggingEnabled() ? 'Disable Logging' : 'Enable Logging'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportHealthReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            {getStatusIcon(health.overall)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health.overall.charAt(0).toUpperCase() + health.overall.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {health.summary.healthy}/{health.summary.total} services healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Database className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{health.summary.total}</div>
            <p className="text-xs text-muted-foreground">
              {health.summary.error} errors, {health.summary.warning} warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {isMonitoring ? 'ACTIVE' : 'STOPPED'}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time health monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debug Logging</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {logService.isLoggingEnabled() ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">
              Error tracking active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {health.services.map((service, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Database className="w-4 h-4" />
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.message}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {service.responseTime && (
                    <span className="text-xs text-muted-foreground">
                      {service.responseTime < 1000 ? 
                        `${Math.round(service.responseTime)}ms` : 
                        `${(service.responseTime / 1000).toFixed(2)}s`
                      }
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(service.lastChecked).toLocaleTimeString()}
                  </span>
                  {getStatusIcon(service.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SystemHealthDashboard;