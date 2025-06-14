
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, Play, Pause, StepForward, RotateCcw, Eye, EyeOff, Terminal, Trash2 } from 'lucide-react';
import { Node } from '@xyflow/react';

interface WorkflowDebuggerProps {
  nodes: Node[];
  selectedNode: Node | null;
  executionResults: Map<string, any>;
  onStepExecution: (nodeId: string) => Promise<void>;
  onSimulateNode: (nodeId: string, inputData: any) => Promise<any>;
  isExecuting: boolean;
  executionLog: Array<{id: string, message: string, type: 'info' | 'error' | 'success' | 'warning', timestamp: Date, nodeId?: string}>;
}

export const WorkflowDebugger = ({ 
  nodes, 
  selectedNode, 
  executionResults, 
  onStepExecution, 
  onSimulateNode,
  isExecuting,
  executionLog
}: WorkflowDebuggerProps) => {
  const [debugMode, setDebugMode] = useState(false);
  const [simulationInput, setSimulationInput] = useState('{"data": "sample input", "timestamp": "2024-01-01T10:00:00Z"}');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeBreakpoints, setActiveBreakpoints] = useState<Set<string>>(new Set());
  const [debugConsole, setDebugConsole] = useState<Array<{message: string, type: 'log' | 'error' | 'warn', timestamp: Date}>>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<Map<string, { avgTime: number, execCount: number }>>(new Map());
  const [executionHistory, setExecutionHistory] = useState<Array<{nodeId: string, timestamp: Date, duration: number, success: boolean}>>([]);

  useEffect(() => {
    if (debugMode) {
      console.log('🔧 Debug mode activated for workflow');
      addToDebugConsole('🔧 Debug mode activated - Enhanced debugging enabled', 'log');
    } else {
      addToDebugConsole('🔧 Debug mode deactivated', 'log');
    }
  }, [debugMode]);

  const addToDebugConsole = (message: string, type: 'log' | 'error' | 'warn' = 'log') => {
    setDebugConsole(prev => [
      ...prev.slice(-99),
      { message, type, timestamp: new Date() }
    ]);
  };

  const handleSimulateNode = async () => {
    if (!selectedNode) {
      addToDebugConsole('❌ No node selected for simulation', 'error');
      return;
    }

    setIsSimulating(true);
    const startTime = Date.now();
    
    try {
      const inputData = JSON.parse(simulationInput);
      const result = await onSimulateNode(selectedNode.id, inputData);
      const duration = Date.now() - startTime;
      
      setSimulationResult(result);
      addToDebugConsole(`✅ Simulation completed successfully in ${duration}ms`, 'log');
    } catch (error) {
      const errorResult = { 
        error: 'Simulation failed', 
        details: error instanceof Error ? error.message : String(error)
      };
      setSimulationResult(errorResult);
      addToDebugConsole(`❌ Simulation failed: ${errorResult.details}`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const getNodeStatus = (nodeId: string) => {
    const result = executionResults.get(nodeId);
    if (result === undefined) return 'pending';
    if (result === null || result?.error) return 'error';
    return 'success';
  };

  const formatJsonOutput = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data || '');
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Debug Console</h3>
          <Badge variant={debugMode ? "default" : "secondary"}>
            {debugMode ? "Active" : "Inactive"}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDebugMode(!debugMode)}
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          {debugMode ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {debugMode ? "Stop Debug" : "Start Debug"}
        </Button>
      </div>

      {debugMode && (
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="simulation" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700">
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="console">Console</TabsTrigger>
            </TabsList>

            <TabsContent value="simulation" className="flex-1 space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">
                  Node Simulation: {selectedNode?.data?.label ? String(selectedNode.data.label) : 'Select a node'}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Input JSON</label>
                    <Textarea
                      value={simulationInput}
                      onChange={(e) => setSimulationInput(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white font-mono text-xs h-24"
                    />
                  </div>
                  
                  <Button
                    onClick={handleSimulateNode}
                    disabled={!selectedNode || isSimulating}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isSimulating ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Simulate Node
                      </>
                    )}
                  </Button>

                  {simulationResult && (
                    <div>
                      <label className="text-xs text-gray-300 block mb-1">Result</label>
                      <div className="bg-gray-800 p-3 rounded text-xs text-gray-300 font-mono max-h-40 overflow-auto">
                        <pre>{formatJsonOutput(simulationResult)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variables" className="flex-1 space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {Array.from(executionResults.entries()).map(([nodeId, result]) => {
                    const node = nodes.find(n => n.id === nodeId);
                    return (
                      <div key={nodeId} className="p-3 bg-gray-800 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300">
                            {node?.data?.label ? String(node.data.label) : nodeId}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {result?.error ? 'error' : 'success'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 font-mono bg-gray-900 p-2 rounded max-h-32 overflow-auto">
                          <pre>{formatJsonOutput(result)}</pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="console" className="flex-1 space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-1 font-mono text-xs">
                  {debugConsole.map((entry, index) => (
                    <div key={index} className={`p-1 rounded ${
                      entry.type === 'error' ? 'text-red-400 bg-red-900/20' :
                      entry.type === 'warn' ? 'text-yellow-400 bg-yellow-900/20' :
                      'text-gray-300 bg-gray-800/20'
                    }`}>
                      <span className="text-gray-500">[{entry.timestamp.toLocaleTimeString()}]</span>{' '}
                      {entry.message}
                    </div>
                  ))}
                  {executionLog.map((entry) => (
                    <div key={entry.id} className={`p-1 rounded ${
                      entry.type === 'error' ? 'text-red-400 bg-red-900/20' :
                      entry.type === 'warning' ? 'text-yellow-400 bg-yellow-900/20' :
                      entry.type === 'success' ? 'text-green-400 bg-green-900/20' :
                      'text-blue-400 bg-blue-900/20'
                    }`}>
                      <span className="text-gray-500">[{entry.timestamp.toLocaleTimeString()}]</span>{' '}
                      {entry.message}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
