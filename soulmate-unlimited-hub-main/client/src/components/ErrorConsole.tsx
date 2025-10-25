import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Download, Trash2, Filter } from 'lucide-react';

interface ConsoleLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  args?: any[];
}

interface ErrorConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorConsole: React.FC<ErrorConsoleProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [maxLogs] = useState(200);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store original console methods
    const originalMethods = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    // Intercept console methods
    const createInterceptor = (level: 'info' | 'warn' | 'error') => (...args: any[]) => {
      originalMethods[level === 'info' ? 'log' : level](...args);
      
      const newLog: ConsoleLog = {
        id: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        timestamp: Date.now(),
        level,
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        args
      };

      setLogs(prevLogs => {
        const updatedLogs = [...prevLogs, newLog];
        return updatedLogs.slice(-maxLogs); // Keep only last N logs
      });
    };

    console.error = createInterceptor('error');
    console.warn = createInterceptor('warn');
    console.info = createInterceptor('info');
    console.log = createInterceptor('info');

    // Cleanup function
    return () => {
      console.log = originalMethods.log;
      console.warn = originalMethods.warn;
      console.error = originalMethods.error;
      console.info = originalMethods.info;
    };
  }, [isOpen, maxLogs]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  );

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalLogs: logs.length,
      logs: logs.map(log => ({
        timestamp: new Date(log.timestamp).toISOString(),
        level: log.level,
        message: log.message
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `console-logs-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: 'info' | 'warn' | 'error') => {
    switch (level) {
      case 'error': return 'bg-red-500';
      case 'warn': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getErrorCount = () => logs.filter(log => log.level === 'error').length;
  const getWarnCount = () => logs.filter(log => log.level === 'warn').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🔍 Error Console
              <div className="flex gap-2">
                <Badge variant="destructive">{getErrorCount()} errors</Badge>
                <Badge variant="secondary">{getWarnCount()} warnings</Badge>
                <Badge variant="outline">{logs.length} total</Badge>
              </div>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-2">
            <div className="flex gap-1">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'error' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFilter('error')}
              >
                Errors ({getErrorCount()})
              </Button>
              <Button
                variant={filter === 'warn' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setFilter('warn')}
              >
                Warnings ({getWarnCount()})
              </Button>
              <Button
                variant={filter === 'info' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('info')}
              >
                Info
              </Button>
            </div>
            
            <div className="flex gap-1 ml-auto">
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-y-auto bg-gray-900 text-gray-100 font-mono text-sm">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No logs to display
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border-b border-gray-700 p-2 hover:bg-gray-800">
                  <div className="flex items-start gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full mt-2 ${getLevelColor(log.level)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="uppercase">{log.level}</span>
                      </div>
                      <div className="whitespace-pre-wrap break-words">
                        {log.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};