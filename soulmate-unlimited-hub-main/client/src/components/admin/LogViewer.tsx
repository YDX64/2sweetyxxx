import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { logService, LogEntry, LogLevel, LogCategory } from "@/services/logService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Download, 
  Trash2, 
  RefreshCw,
  Eye,
  AlertTriangle,
  Info,
  Bug,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const LogViewer = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Log seviyesi renkleri ve ikonları
  const getLevelBadge = (level: LogLevel) => {
    const config = {
      ERROR: { 
        color: 'bg-red-500/20 text-red-400 border-red-500', 
        icon: <AlertTriangle className="w-3 h-3" /> 
      },
      WARN: { 
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', 
        icon: <AlertTriangle className="w-3 h-3" /> 
      },
      INFO: { 
        color: 'bg-blue-500/20 text-blue-400 border-blue-500', 
        icon: <Info className="w-3 h-3" /> 
      },
      DEBUG: { 
        color: 'bg-gray-500/20 text-gray-400 border-gray-500', 
        icon: <Bug className="w-3 h-3" /> 
      },
      CRITICAL: {
        color: 'bg-red-700/20 text-red-600 border-red-700',
        icon: <Zap className="w-3 h-3" />
      }
    }[level];

    return config ? (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {level}
      </Badge>
    ) : null;
  };

  // Kategori badge'i
  const getCategoryBadge = (category: LogCategory) => {
    const colors: Record<string, string> = {
      AUTH: 'bg-orange-500/20 text-orange-400 border-orange-500',
      USER_ACTION: 'bg-lime-500/20 text-lime-400 border-lime-500',
      NETWORK: 'bg-violet-500/20 text-violet-400 border-violet-500',
      DATABASE: 'bg-blue-500/20 text-blue-400 border-blue-500',
      PAYMENT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
      ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500',
      CHAT: 'bg-blue-500/20 text-blue-400 border-blue-500',
      PROFILE: 'bg-green-500/20 text-green-400 border-green-500',
      SUBSCRIPTION: 'bg-pink-500/20 text-pink-400 border-pink-500',
      PERFORMANCE: 'bg-indigo-500/20 text-indigo-400 border-indigo-500',
      SYSTEM: 'bg-gray-500/20 text-gray-400 border-gray-500',
      ERROR: 'bg-red-500/20 text-red-400 border-red-500',
      UI: 'bg-teal-500/20 text-teal-400 border-teal-500',
      NAVIGATION: 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
      SECURITY: 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
    };

    return (
      <Badge className={colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500'}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  // Logları yükle
  const loadLogs = () => {
    const allLogs = logService.getLogs();
    setLogs(allLogs);
    filterLogs(allLogs, levelFilter, categoryFilter);
  };

  // Logları filtrele
  const filterLogs = (logsToFilter: LogEntry[], level: LogLevel | 'all', category: LogCategory | 'all') => {
    let filtered = [...logsToFilter];

    if (level !== 'all') {
      filtered = filtered.filter(log => log.level === level);
    }

    if (category !== 'all') {
      filtered = filtered.filter(log => log.category === category);
    }

    setFilteredLogs(filtered);
  };

  // Filtre değişikliklerini handle et
  const handleLevelFilterChange = (value: string) => {
    const newLevel = value as LogLevel | 'all';
    setLevelFilter(newLevel);
    filterLogs(logs, newLevel, categoryFilter);
  };

  const handleCategoryFilterChange = (value: string) => {
    const newCategory = value as LogCategory | 'all';
    setCategoryFilter(newCategory);
    filterLogs(logs, levelFilter, newCategory);
  };

  // Logları temizle
  const clearLogs = () => {
    logService.clearLogs();
    loadLogs();
  };

  // Logları export et
  const exportLogs = () => {
    const logsJson = logService.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2sweety-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 2000); // Her 2 saniyede bir güncelle
      return () => clearInterval(interval);
    }
  }, [autoRefresh, levelFilter, categoryFilter]);

  // İlk yükleme
  useEffect(() => {
    loadLogs();
  }, []);

  const sessionStats = logService.getLogStats();

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {t('adminLogs.system.title')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {t('adminLogs.system.session')}: {sessionStats.sessionDuration ? Math.floor(sessionStats.sessionDuration / 1000 / 60) + 'm' : '0m'}
              </Badge>
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {t('adminLogs.system.total')}: {sessionStats.total}
              </Badge>
              <Badge variant="outline" className="text-red-400 border-red-500">
                {t('adminLogs.system.errors')}: {sessionStats.byLevel.ERROR + sessionStats.byLevel.CRITICAL}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">{t('adminLogs.system.filters.level')}:</label>
                <Select value={levelFilter} onValueChange={handleLevelFilterChange}>
                  <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">{t('adminLogs.system.levels.all')}</SelectItem>
                    <SelectItem value="ERROR">{t('adminLogs.system.levels.error')}</SelectItem>
                    <SelectItem value="WARN">{t('adminLogs.system.levels.warning')}</SelectItem>
                    <SelectItem value="INFO">{t('adminLogs.system.levels.info')}</SelectItem>
                    <SelectItem value="DEBUG">{t('adminLogs.system.levels.debug')}</SelectItem>
                    <SelectItem value="CRITICAL">{t('adminLogs.system.levels.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">{t('adminLogs.system.filters.category')}:</label>
                <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                  <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">{t('adminLogs.system.categories.all')}</SelectItem>
                    <SelectItem value="role_management">{t('adminLogs.system.categories.roleManagement')}</SelectItem>
                    <SelectItem value="user_ban">{t('adminLogs.system.categories.userBan')}</SelectItem>
                    <SelectItem value="permission_check">{t('adminLogs.system.categories.permissionCheck')}</SelectItem>
                    <SelectItem value="database">{t('adminLogs.system.categories.database')}</SelectItem>
                    <SelectItem value="auth">{t('adminLogs.system.categories.auth')}</SelectItem>
                    <SelectItem value="system">{t('adminLogs.system.categories.system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`${autoRefresh ? 'bg-green-700 border-green-600' : 'bg-gray-700 border-gray-600'} text-white`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {t('adminLogs.system.filters.autoRefresh')}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadLogs}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('adminLogs.system.buttons.refresh')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('adminLogs.system.buttons.export')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                className="bg-red-700 border-red-600 text-white hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('adminLogs.system.buttons.clear')}
              </Button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">{t('adminLogs.system.table.time')}</TableHead>
                  <TableHead className="text-gray-300">{t('adminLogs.system.table.level')}</TableHead>
                  <TableHead className="text-gray-300">{t('adminLogs.system.table.category')}</TableHead>
                  <TableHead className="text-gray-300">{t('adminLogs.system.table.details')}</TableHead>
                  <TableHead className="text-gray-300">{t('adminLogs.system.table.user')}</TableHead>
                  <TableHead className="text-gray-300">{t('adminLogs.system.table.admin')}</TableHead>
                  <TableHead className="text-gray-300">{t('adminLogs.system.table.details')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                      {t('adminLogs.system.noLogs')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log, index) => (
                    <TableRow key={index} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="text-gray-300 text-xs">
                        {format(new Date(log.timestamp), 'HH:mm:ss.SSS', { locale: tr })}
                      </TableCell>
                      <TableCell>
                        {getLevelBadge(log.level)}
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(log.category)}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm max-w-48 truncate">
                        {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                      </TableCell>
                      <TableCell className="text-gray-300 text-xs">
                        {log.userId ? log.userId.slice(-8) : '-'}
                      </TableCell>
                      <TableCell className="text-gray-300 text-xs">
                        {log.adminId ? log.adminId.slice(-8) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Selected Log Details */}
          {selectedLog && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{t('adminLogs.system.details.title')}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">{t('adminLogs.system.details.time')}:</span> <span className="text-white">{selectedLog.timestamp}</span></div>
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div><span className="text-gray-400">{t('adminLogs.system.details.info')}:</span> <span className="text-white">{JSON.stringify(selectedLog.details, null, 2)}</span></div>
                )}
                {selectedLog.userId && (
                  <div><span className="text-gray-400">{t('adminLogs.system.details.userId')}:</span> <span className="text-white">{selectedLog.userId}</span></div>
                )}
                {selectedLog.adminId && (
                  <div><span className="text-gray-400">{t('adminLogs.system.details.adminId')}:</span> <span className="text-white">{selectedLog.adminId}</span></div>
                )}
                {selectedLog.stackTrace && (
                  <div><span className="text-gray-400">{t('adminLogs.system.details.stackTrace')}:</span> <span className="text-red-400">{selectedLog.stackTrace}</span></div>
                )}
                <div><span className="text-gray-400">{t('adminLogs.system.details.details')}:</span></div>
                <pre className="text-xs text-gray-300 bg-gray-700/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
                {selectedLog.stackTrace && (
                  <>
                    <div><span className="text-gray-400">{t('adminLogs.system.details.stackTrace')}:</span></div>
                    <pre className="text-xs text-red-300 bg-gray-800 p-2 rounded overflow-x-auto">
                      {selectedLog.stackTrace}
                    </pre>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogViewer; 