import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  Database, 
  Users, 
  RefreshCw,
  Download,
  Filter,
  Clock,
  Bug,
  Zap
} from 'lucide-react';
import { logService, LogEntry, LogLevel, LogCategory } from '@/services/logService';
import { useLanguage } from '@/hooks/useLanguage';

interface ErrorPattern {
  pattern: string;
  count: number;
  lastSeen: string;
  category: LogCategory;
  examples: LogEntry[];
}

interface ErrorTrend {
  hour: string;
  errorCount: number;
  warnCount: number;
  totalCount: number;
}

const ErrorDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  const refreshLogs = () => {
    if (logService.isLoggingEnabled()) {
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };
      
      const since = new Date(Date.now() - timeRangeMs[timeRange]);
      const allLogs = logService.getLogs({ 
        timeRange: { start: since, end: new Date() },
        limit: 5000 
      });
      setLogs(allLogs);
    }
  };

  useEffect(() => {
    refreshLogs();
    if (autoRefresh) {
      const interval = setInterval(refreshLogs, 10000); // 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  // Error patterns analysis
  const errorPatterns = useMemo(() => {
    const patterns: Map<string, ErrorPattern> = new Map();
    
    logs.filter(log => log.level === 'ERROR' || log.level === 'CRITICAL').forEach(log => {
      // Create pattern key from error message (first 100 chars, normalized)
      const patternKey = log.message.substring(0, 100).toLowerCase()
        .replace(/\d+/g, 'X') // Replace numbers with X
        .replace(/[a-f0-9-]{8,}/g, 'UUID') // Replace UUIDs
        .trim();
      
      if (patterns.has(patternKey)) {
        const existing = patterns.get(patternKey)!;
        existing.count++;
        if (new Date(log.timestamp) > new Date(existing.lastSeen)) {
          existing.lastSeen = log.timestamp;
        }
        existing.examples.push(log);
      } else {
        patterns.set(patternKey, {
          pattern: patternKey,
          count: 1,
          lastSeen: log.timestamp,
          category: log.category,
          examples: [log]
        });
      }
    });

    return Array.from(patterns.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [logs]);

  // Error trends
  const errorTrends = useMemo(() => {
    const trends: Map<string, ErrorTrend> = new Map();
    const now = Date.now();
    const rangeMs = timeRange === '1h' ? 60 * 60 * 1000 : 
                   timeRange === '6h' ? 6 * 60 * 60 * 1000 :
                   timeRange === '24h' ? 24 * 60 * 60 * 1000 :
                   7 * 24 * 60 * 60 * 1000;
    
    const bucketSize = timeRange === '1h' ? 5 * 60 * 1000 : // 5 minute buckets
                      timeRange === '6h' ? 30 * 60 * 1000 : // 30 minute buckets
                      timeRange === '24h' ? 60 * 60 * 1000 : // 1 hour buckets
                      4 * 60 * 60 * 1000; // 4 hour buckets

    // Initialize buckets
    for (let i = 0; i < rangeMs; i += bucketSize) {
      const bucketTime = new Date(now - rangeMs + i);
      const hourKey = bucketTime.toISOString().substring(0, timeRange === '1h' ? 16 : 13);
      if (!trends.has(hourKey)) {
        trends.set(hourKey, {
          hour: hourKey,
          errorCount: 0,
          warnCount: 0,
          totalCount: 0
        });
      }
    }

    logs.forEach(log => {
      const logTime = new Date(log.timestamp);
      const hourKey = logTime.toISOString().substring(0, timeRange === '1h' ? 16 : 13);
      
      if (trends.has(hourKey)) {
        const trend = trends.get(hourKey)!;
        trend.totalCount++;
        if (log.level === 'ERROR' || log.level === 'CRITICAL') {
          trend.errorCount++;
        } else if (log.level === 'WARN') {
          trend.warnCount++;
        }
      }
    });

    return Array.from(trends.values()).sort((a, b) => a.hour.localeCompare(b.hour));
  }, [logs, timeRange]);

  // Statistics
  const stats = useMemo(() => {
    const errorCount = logs.filter(log => log.level === 'ERROR' || log.level === 'CRITICAL').length;
    const warnCount = logs.filter(log => log.level === 'WARN').length;
    const totalCount = logs.length;
    
    const byCategory = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueUsers = new Set(logs.filter(log => log.userId).map(log => log.userId)).size;
    
    // Critical errors in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCritical = logs.filter(log => 
      log.level === 'CRITICAL' && new Date(log.timestamp) > oneHourAgo
    ).length;

    return {
      errorCount,
      warnCount,
      totalCount,
      errorRate: totalCount > 0 ? (errorCount / totalCount * 100) : 0,
      byCategory,
      uniqueUsers,
      recentCritical
    };
  }, [logs]);

  const handleExport = () => {
    const exportData = {
      exportTime: new Date().toISOString(),
      timeRange,
      stats,
      errorPatterns,
      errorTrends,
      recentCriticalErrors: logs.filter(log => log.level === 'CRITICAL').slice(0, 20),
      logs: logs.slice(0, 1000) // Export last 1000 logs
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-analysis-${timeRange}-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: LogCategory) => {
    const colors = {
      'AUTH': 'bg-blue-500/20 text-blue-400',
      'DATABASE': 'bg-indigo-500/20 text-indigo-400',
      'SUBSCRIPTION': 'bg-yellow-500/20 text-yellow-400',
      'USER_ACTION': 'bg-green-500/20 text-green-400',
      'NETWORK': 'bg-purple-500/20 text-purple-400',
      'ERROR': 'bg-red-600/20 text-red-300',
      'SYSTEM': 'bg-gray-500/20 text-gray-400',
      'PAYMENT': 'bg-amber-500/20 text-amber-400',
      'ADMIN': 'bg-rose-500/20 text-rose-400',
      'CHAT': 'bg-cyan-500/20 text-cyan-400',
      'PROFILE': 'bg-emerald-500/20 text-emerald-400',
      'PERFORMANCE': 'bg-orange-500/20 text-orange-400',
      'UI': 'bg-teal-500/20 text-teal-400',
      'NAVIGATION': 'bg-violet-500/20 text-violet-400',
      'SECURITY': 'bg-red-500/20 text-red-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  if (!logService.isLoggingEnabled()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">Logging Disabled</h3>
          <p className="text-muted-foreground mb-4">
            Error logging is currently disabled. Enable it to see error analytics.
          </p>
          <Button onClick={() => { logService.enable(); refreshLogs(); }}>
            Enable Logging
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Error Analysis Dashboard</h2>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="w-4 h-4 mr-2" />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={refreshLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.errorCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.errorRate.toFixed(1)}% error rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.warnCount}</div>
            <p className="text-xs text-muted-foreground">
              Recent critical: {stats.recentCritical}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Unique users with errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Database className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">
              All log entries
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">Error Patterns</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Critical</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bug className="w-5 h-5 mr-2" />
                Error Patterns ({errorPatterns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorPatterns.map((pattern, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(pattern.category)}>
                        {pattern.category}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">{pattern.count} occurrences</Badge>
                        <span className="text-xs text-muted-foreground">
                          Last: {new Date(pattern.lastSeen).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                      {pattern.pattern}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Example from: {pattern.examples[0]?.url || 'Unknown page'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Error Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorTrends.slice(-20).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-mono">
                      {new Date(trend.hour).toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-red-400">{trend.errorCount} errors</span>
                      <span className="text-yellow-400">{trend.warnCount} warnings</span>
                      <span className="text-gray-400">{trend.totalCount} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Errors by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats.byCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded">
                      <Badge className={getCategoryColor(category as LogCategory)}>
                        {category}
                      </Badge>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Recent Critical Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs
                  .filter(log => log.level === 'CRITICAL')
                  .slice(0, 10)
                  .map((log, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={getCategoryColor(log.category)}>
                          {log.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm font-medium">{log.message}</div>
                      {log.details && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.details).substring(0, 200)}...
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorDashboard;