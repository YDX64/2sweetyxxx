import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertCircle, 
  Download, 
  Filter, 
  Trash2, 
  RefreshCw, 
  Activity,
  TrendingUp,
  Users,
  Clock,
  Search,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logService, LogEntry, LogLevel, LogCategory } from '@/services/logService';
import { useLanguage } from '@/hooks/useLanguage';

const EnhancedLogViewer: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'ALL'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Stats
  const stats = useMemo(() => {
    if (!logService.isLoggingEnabled()) {
      return {
        total: 0,
        byLevel: { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 },
        byCategory: {},
        sessionDuration: 0,
        errorRate: 0
      };
    }
    return logService.getLogStats();
  }, [logs]);

  // Load logs
  const refreshLogs = () => {
    if (logService.isLoggingEnabled()) {
      const allLogs = logService.getLogs({ limit: 1000 });
      setLogs(allLogs);
    } else {
      setLogs([]);
    }
  };

  // Auto refresh
  useEffect(() => {
    refreshLogs();
    
    if (autoRefresh) {
      const interval = setInterval(refreshLogs, 2000); // 2 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Filter logs
  useEffect(() => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    setFilteredLogs(filtered.reverse()); // Most recent first
  }, [logs, searchTerm, levelFilter, categoryFilter]);

  const handleExport = () => {
    const dataStr = logService.exportLogs();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClearLogs = () => {
    logService.clearLogs();
    refreshLogs();
  };

  const toggleLogging = () => {
    if (logService.isLoggingEnabled()) {
      logService.disable();
    } else {
      logService.enable();
    }
    refreshLogs();
  };

  const getLevelColor = (level: LogLevel) => {
    const colors = {
      DEBUG: 'bg-blue-500/20 text-blue-400 border-blue-500',
      INFO: 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
      WARN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      ERROR: 'bg-red-500/20 text-red-400 border-red-500',
      CRITICAL: 'bg-red-600/20 text-red-300 border-red-600'
    };
    return colors[level] || 'bg-gray-500/20 text-gray-400 border-gray-500';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (milliseconds: number) => {
    if (milliseconds < 1000) return `${Math.round(milliseconds)}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    return `${(milliseconds / 60000).toFixed(1)}m`;
  };

  const LogEntryRow: React.FC<{ log: LogEntry }> = ({ log }) => (
    <div
      className="border-b border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => {
        setSelectedLog(log);
        setShowDetails(true);
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Badge className={getLevelColor(log.level)}>
            {log.level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {log.category}
          </Badge>
          <span className="text-xs text-gray-400">
            {formatTime(log.timestamp)}
          </span>
        </div>
        {log.performance?.duration && (
          <span className="text-xs text-cyan-400">
            {formatDuration(log.performance.duration)}
          </span>
        )}
      </div>
      <div className="text-sm text-foreground mb-1 font-medium">
        {log.message}
      </div>
      {log.details && Object.keys(log.details).length > 0 && (
        <div className="text-xs text-muted-foreground truncate">
          {JSON.stringify(log.details).substring(0, 100)}...
        </div>
      )}
      {log.userId && (
        <div className="text-xs text-purple-400 mt-1">
          {t('adminLogs.details.fields.user')}: {log.userId}
        </div>
      )}
    </div>
  );

  const LogDetailsModal: React.FC = () => {
    if (!showDetails || !selectedLog) return null;

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-card-foreground">{t('adminLogs.details.title')}</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.system.filters.level')}</label>
                  <Badge className={getLevelColor(selectedLog.level)}>
                    {selectedLog.level}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.system.filters.category')}</label>
                  <Badge variant="outline">{selectedLog.category}</Badge>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.details.time')}</label>
                  <div className="text-card-foreground">{selectedLog.timestamp}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.system.session')}</label>
                  <div className="text-card-foreground font-mono text-xs">{selectedLog.sessionId}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">{t('adminLogs.details.message')}</label>
                <div className="text-card-foreground bg-muted p-3 rounded">{selectedLog.message}</div>
              </div>

              {selectedLog.url && (
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.details.fields.url')}</label>
                  <div className="text-cyan-400 text-sm break-all">{selectedLog.url}</div>
                </div>
              )}

              {selectedLog.userId && (
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.details.userId')}</label>
                  <div className="text-purple-400 font-mono">{selectedLog.userId}</div>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.details.details')}</label>
                  <pre className="text-xs text-card-foreground bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.performance && (
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.details.fields.performance')}</label>
                  <pre className="text-xs text-green-400 bg-muted p-3 rounded">
                    {JSON.stringify(selectedLog.performance, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.network && (
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.details.fields.network')}</label>
                  <pre className="text-xs text-blue-400 bg-muted p-3 rounded">
                    {JSON.stringify(selectedLog.network, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.stackTrace && (
                <div>
                  <label className="text-sm text-muted-foreground">{t('adminLogs.details.fields.stackTrace')}</label>
                  <pre className="text-xs text-red-400 bg-muted p-3 rounded overflow-auto">
                    {selectedLog.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t('adminLogs.system.title')}</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={logService.isLoggingEnabled() ? "destructive" : "default"}
            size="sm"
            onClick={toggleLogging}
          >
            {logService.isLoggingEnabled() ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {logService.isLoggingEnabled() ? t('adminLogs.system.buttons.disable') : t('adminLogs.system.buttons.enable')} {t('adminLogs.system.buttons.logging')}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshLogs}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('adminLogs.system.buttons.refresh')}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={logs.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('adminLogs.system.buttons.export')}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleClearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('adminLogs.system.buttons.clear')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminLogs.system.stats.totalLogs')}</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {t('adminLogs.system.session')}: {formatDuration(stats.sessionDuration)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminLogs.system.stats.errorRate')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.byLevel.ERROR + stats.byLevel.CRITICAL} {t('adminLogs.system.stats.errors')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminLogs.system.stats.categories')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {Object.keys(stats.byCategory).length}
            </div>
            <p className="text-xs text-muted-foreground">{t('adminLogs.system.stats.activeCategories')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminLogs.system.stats.status')}</CardTitle>
            <Settings className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {logService.isLoggingEnabled() ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('adminLogs.system.filters.autoRefresh')}: {autoRefresh ? t('adminLogs.system.stats.on') : t('adminLogs.system.stats.off')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            {t('adminLogs.system.filtersAndSearch')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('adminLogs.system.search')}</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder={t('adminLogs.system.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('adminLogs.system.filters.level')}</label>
              <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('adminLogs.system.levels.all')}</SelectItem>
                  <SelectItem value="DEBUG">{t('adminLogs.system.levels.debug')}</SelectItem>
                  <SelectItem value="INFO">{t('adminLogs.system.levels.info')}</SelectItem>
                  <SelectItem value="WARN">{t('adminLogs.system.levels.warning')}</SelectItem>
                  <SelectItem value="ERROR">{t('adminLogs.system.levels.error')}</SelectItem>
                  <SelectItem value="CRITICAL">{t('adminLogs.system.levels.critical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('adminLogs.system.filters.category')}</label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as LogCategory | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('adminLogs.system.categories.all')}</SelectItem>
                  <SelectItem value="AUTH">{t('adminLogs.system.categories.auth')}</SelectItem>
                  <SelectItem value="USER_ACTION">{t('adminLogs.system.categories.userAction')}</SelectItem>
                  <SelectItem value="NETWORK">{t('adminLogs.system.categories.network')}</SelectItem>
                  <SelectItem value="DATABASE">{t('adminLogs.system.categories.database')}</SelectItem>
                  <SelectItem value="PAYMENT">{t('adminLogs.system.categories.payment')}</SelectItem>
                  <SelectItem value="ADMIN">{t('adminLogs.system.categories.admin')}</SelectItem>
                  <SelectItem value="ERROR">{t('adminLogs.system.categories.error')}</SelectItem>
                  <SelectItem value="PERFORMANCE">{t('adminLogs.system.categories.performance')}</SelectItem>
                  <SelectItem value="SYSTEM">{t('adminLogs.system.categories.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                {t('adminLogs.system.filters.autoRefresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            {t('adminLogs.system.title')} ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!logService.isLoggingEnabled() ? (
            <Alert className="m-6 bg-gray-800/80 border-gray-600/50">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              <AlertDescription className="text-gray-200">
                {t('adminLogs.system.loggingDisabled')}
              </AlertDescription>
            </Alert>
          ) : filteredLogs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {t('adminLogs.system.noLogs')}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <LogEntryRow key={log.id} log={log} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      <LogDetailsModal />
    </div>
  );
};

export default EnhancedLogViewer; 