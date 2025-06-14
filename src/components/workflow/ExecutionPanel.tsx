
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Loader2, Info, AlertTriangle, Terminal, Play, Pause, Square, BarChart3 } from 'lucide-react';

interface ExecutionPanelProps {
  results: Map<string, any>;
  executionLog: Array<{
    id: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
    timestamp: Date;
    nodeId?: string;
  }>;
  isExecuting: boolean;
  currentExecutingNode?: string;
  totalNodes?: number;
  completedNodes?: number;
}

export const ExecutionPanel = ({ 
  results, 
  executionLog, 
  isExecuting, 
  currentExecutingNode,
  totalNodes = 0,
  completedNodes = 0
}: ExecutionPanelProps) => {
  const [selectedTab, setSelectedTab] = useState('results');
  const [executionStats, setExecutionStats] = useState({
    startTime: null as Date | null,
    duration: 0,
    avgNodeTime: 0
  });

  useEffect(() => {
    if (isExecuting && !executionStats.startTime) {
      setExecutionStats(prev => ({ ...prev, startTime: new Date() }));
    }
    
    if (!isExecuting && executionStats.startTime) {
      const duration = Date.now() - executionStats.startTime.getTime();
      const avgNodeTime = completedNodes > 0 ? duration / completedNodes : 0;
      setExecutionStats(prev => ({ ...prev, duration, avgNodeTime }));
    }
  }, [isExecuting, executionStats.startTime, completedNodes]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-3 h-3 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-300 bg-red-900/20 border-red-800';
      case 'success':
        return 'text-green-300 bg-green-900/20 border-green-800';
      case 'warning':
        return 'text-yellow-300 bg-yellow-900/20 border-yellow-800';
      case 'info':
      default:
        return 'text-blue-300 bg-blue-900/20 border-blue-800';
    }
  };

  const successCount = Array.from(results.values()).filter(r => r !== null && !r.error).length;
  const errorCount = Array.from(results.values()).filter(r => r?.error).length;
  const successRate = results.size > 0 ? (successCount / results.size) * 100 : 0;
  const progress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="flex-1 p-4 bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Execution Monitor
        </h3>
        {isExecuting && (
          <Badge variant="secondary" className="bg-blue-600 text-white animate-pulse">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Running
          </Badge>
        )}
      </div>

      {/* Execution Progress */}
      {isExecuting && totalNodes > 0 && (
        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm text-blue-400">{completedNodes}/{totalNodes}</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          {currentExecutingNode && (
            <div className="text-xs text-gray-400">
              Executing: {currentExecutingNode}
            </div>
          )}
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-700/80 backdrop-blur-sm">
          <TabsTrigger value="results" className="data-[state=active]:bg-gray-600 text-xs">
            Results ({results.size})
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-gray-600 text-xs">
            Logs ({executionLog.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-gray-600 text-xs">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-4">
          <ScrollArea className="h-64">
            {results.size === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No execution results yet</p>
                <p className="text-xs mt-1">Run a workflow to see results here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(results.entries()).map(([nodeId, result]) => (
                  <div key={nodeId} className="bg-gray-700/60 p-3 rounded-lg border border-gray-600 hover:bg-gray-700/80 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white truncate">
                        {nodeId}
                      </span>
                      <div className="flex items-center space-x-2">
                        {result?.error ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : result ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        {result?.executionTime && (
                          <Badge variant="outline" className="text-xs">
                            {result.executionTime}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-300 bg-gray-800/80 p-2 rounded overflow-x-auto max-h-24 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <ScrollArea className="h-64">
            {executionLog.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No logs yet</p>
                <p className="text-xs mt-1">Execute a workflow to see logs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {executionLog.slice().reverse().map((log) => (
                  <div key={log.id} className={`p-2 rounded text-xs border ${getLogColor(log.type)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getLogIcon(log.type)}
                        <span className="font-mono text-xs opacity-75">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {log.nodeId && (
                        <Badge variant="outline" className="text-xs">
                          {log.nodeId}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 font-mono">
                      {log.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/60 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-400">{successCount}</div>
                <div className="text-xs text-gray-400">Successful</div>
              </div>
              <div className="bg-gray-700/60 p-3 rounded-lg">
                <div className="text-lg font-bold text-red-400">{errorCount}</div>
                <div className="text-xs text-gray-400">Failed</div>
              </div>
            </div>
            
            <div className="bg-gray-700/60 p-3 rounded-lg">
              <div className="text-lg font-bold text-blue-400">{successRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">Success Rate</div>
              <Progress value={successRate} className="mt-2 h-2" />
            </div>

            {executionStats.duration > 0 && (
              <div className="space-y-2">
                <div className="bg-gray-700/60 p-3 rounded-lg">
                  <div className="text-sm text-gray-300">Execution Time</div>
                  <div className="text-lg font-bold text-white">
                    {formatDuration(executionStats.duration)}
                  </div>
                </div>
                <div className="bg-gray-700/60 p-3 rounded-lg">
                  <div className="text-sm text-gray-300">Avg. Node Time</div>
                  <div className="text-lg font-bold text-white">
                    {formatDuration(executionStats.avgNodeTime)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
