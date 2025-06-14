
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle, XCircle, Activity, Zap, Target } from 'lucide-react';

interface WorkflowAnalyticsProps {
  executionResults: Map<string, any>;
  executionLog: Array<{
    id: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
    timestamp: Date;
    nodeId?: string;
  }>;
  nodeCount: number;
}

export const WorkflowAnalytics = ({ executionResults, executionLog, nodeCount }: WorkflowAnalyticsProps) => {
  const successCount = Array.from(executionResults.values()).filter(r => r !== null).length;
  const errorCount = Array.from(executionResults.values()).filter(r => r === null).length;
  const successRate = executionResults.size > 0 ? (successCount / executionResults.size) * 100 : 0;

  const executionData = [
    { name: 'Success', value: successCount, color: '#10b981' },
    { name: 'Error', value: errorCount, color: '#ef4444' },
    { name: 'Pending', value: Math.max(0, nodeCount - executionResults.size), color: '#6b7280' }
  ];

  const performanceData = executionLog
    .filter(log => log.type === 'success')
    .slice(-10)
    .map((log, index) => ({
      node: `Node ${index + 1}`,
      time: Math.random() * 2000 + 500 // Simulated execution time
    }));

  return (
    <div className="p-4 bg-gray-800 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{executionResults.size}</div>
            <div className="text-xs text-gray-400 mt-1">of {nodeCount} nodes</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-700 border-gray-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-300">Execution Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={executionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={40}
                  dataKey="value"
                >
                  {executionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-2">
            {executionData.map((entry, index) => (
              <div key={index} className="flex items-center text-xs">
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {performanceData.length > 0 && (
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Performance Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="node" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      borderRadius: '4px',
                      color: '#f3f4f6'
                    }}
                  />
                  <Bar dataKey="time" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-2">
        <Badge variant="outline" className="text-green-400 border-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          {successCount} Success
        </Badge>
        <Badge variant="outline" className="text-red-400 border-red-400">
          <XCircle className="w-3 h-3 mr-1" />
          {errorCount} Errors
        </Badge>
        <Badge variant="outline" className="text-blue-400 border-blue-400">
          <Clock className="w-3 h-3 mr-1" />
          {executionLog.length} Events
        </Badge>
      </div>
    </div>
  );
};
