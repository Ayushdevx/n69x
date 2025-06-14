
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Cpu, HardDrive, Zap } from 'lucide-react';

interface PerformanceMonitorProps {
  isExecuting: boolean;
  executionCount: number;
  nodeCount: number;
}

export const PerformanceMonitor = ({ isExecuting, executionCount, nodeCount }: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState({
    executionTime: 0,
    memoryUsage: 45,
    cpuUsage: 23,
    throughput: 0
  });

  const [chartData, setChartData] = useState<Array<{time: string, execution: number, memory: number}>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      const newExecutionTime = isExecuting ? metrics.executionTime + 100 : 0;
      const newMemoryUsage = Math.max(20, Math.min(90, metrics.memoryUsage + (Math.random() - 0.5) * 10));
      const newCpuUsage = isExecuting ? Math.max(10, Math.min(80, 30 + Math.random() * 30)) : Math.max(5, Math.min(25, metrics.cpuUsage + (Math.random() - 0.5) * 5));
      const newThroughput = executionCount > 0 ? Math.round((executionCount / (Date.now() / 1000)) * 60) : 0;

      setMetrics({
        executionTime: newExecutionTime,
        memoryUsage: newMemoryUsage,
        cpuUsage: newCpuUsage,
        throughput: newThroughput
      });

      setChartData(prev => {
        const newData = [...prev, {
          time: now,
          execution: newExecutionTime,
          memory: newMemoryUsage
        }].slice(-20);
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExecuting, executionCount, metrics.executionTime, metrics.memoryUsage, metrics.cpuUsage]);

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'text-green-400';
    if (value < thresholds[1]) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Performance Monitor</h3>
        <Badge variant={isExecuting ? "default" : "secondary"}>
          {isExecuting ? "Active" : "Idle"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-400" />
              Execution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(metrics.executionTime / 1000).toFixed(1)}s
            </div>
            <div className="text-xs text-gray-400">Current workflow</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center">
              <HardDrive className="w-4 h-4 mr-2 text-green-400" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, [50, 75])}`}>
              {metrics.memoryUsage.toFixed(0)}%
            </div>
            <Progress value={metrics.memoryUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-purple-400" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.cpuUsage, [40, 70])}`}>
              {metrics.cpuUsage.toFixed(0)}%
            </div>
            <Progress value={metrics.cpuUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.throughput}
            </div>
            <div className="text-xs text-gray-400">executions/min</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-700 border-gray-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center">
            <Activity className="w-4 h-4 mr-2 text-orange-400" />
            Real-time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Memory %"
                />
                <Line 
                  type="monotone" 
                  dataKey="execution" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Execution Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-700 border-gray-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">System Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-400">Total Executions</div>
              <div className="text-white font-medium">{executionCount}</div>
            </div>
            <div>
              <div className="text-gray-400">Nodes in Workflow</div>
              <div className="text-white font-medium">{nodeCount}</div>
            </div>
            <div>
              <div className="text-gray-400">Avg. Execution Time</div>
              <div className="text-white font-medium">
                {executionCount > 0 ? (metrics.executionTime / executionCount / 1000).toFixed(2) : '0.00'}s
              </div>
            </div>
            <div>
              <div className="text-gray-400">Status</div>
              <Badge variant={isExecuting ? "default" : "outline"} className="text-xs">
                {isExecuting ? "Running" : "Ready"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
