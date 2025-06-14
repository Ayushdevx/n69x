
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  StepForward, 
  Bug, 
  Terminal, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface DebugSession {
  id: string;
  nodeId: string;
  nodeName: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  input: any;
  output: any;
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
  }>;
  executionTime: number;
  startTime?: Date;
}

export const DebugMode = ({ nodes, onNodeTest }: {
  nodes: any[];
  onNodeTest: (nodeId: string, input: any) => Promise<any>;
}) => {
  const [debugSessions, setDebugSessions] = useState<DebugSession[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [testInput, setTestInput] = useState('{\n  "key": "value"\n}');
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startDebugSession = async () => {
    if (!selectedNode) return;

    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return;

    const sessionId = `debug_${Date.now()}`;
    const session: DebugSession = {
      id: sessionId,
      nodeId: selectedNode,
      nodeName: node.data?.label || 'Unknown Node',
      status: 'running',
      input: null,
      output: null,
      logs: [{
        timestamp: new Date(),
        level: 'info',
        message: 'Debug session started'
      }],
      executionTime: 0,
      startTime: new Date()
    };

    setDebugSessions(prev => [session, ...prev]);

    try {
      const parsedInput = JSON.parse(testInput);
      session.input = parsedInput;
      
      // Simulate node execution
      const result = await simulateNodeExecution(node, parsedInput);
      
      const endTime = new Date();
      const executionTime = endTime.getTime() - (session.startTime?.getTime() || 0);
      
      const updatedSession: DebugSession = {
        ...session,
        status: result.success ? 'completed' : 'error',
        output: result,
        executionTime,
        logs: [
          ...session.logs,
          {
            timestamp: new Date(),
            level: result.success ? 'info' : 'error',
            message: result.success ? 'Node executed successfully' : `Execution failed: ${result.error}`
          }
        ]
      };

      setDebugSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      
    } catch (error) {
      const updatedSession: DebugSession = {
        ...session,
        status: 'error',
        output: { success: false, error: 'Invalid JSON input' },
        executionTime: 0,
        logs: [
          ...session.logs,
          {
            timestamp: new Date(),
            level: 'error',
            message: `Input parsing failed: ${error}`
          }
        ]
      };

      setDebugSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
    }
  };

  const simulateNodeExecution = async (node: any, input: any): Promise<any> => {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate different outcomes based on node type
    const nodeType = node.type;
    const success = Math.random() > 0.2; // 80% success rate
    
    if (!success) {
      return {
        success: false,
        error: 'Simulated execution error',
        data: null
      };
    }

    switch (nodeType) {
      case 'http':
        return {
          success: true,
          data: {
            status: 200,
            response: { message: 'API call successful', timestamp: new Date().toISOString() },
            headers: { 'content-type': 'application/json' }
          }
        };
      
      case 'email':
        return {
          success: true,
          data: {
            sent: true,
            messageId: `msg_${Date.now()}`,
            recipient: input.to || 'test@example.com'
          }
        };
      
      case 'condition':
        return {
          success: true,
          data: {
            condition_met: Math.random() > 0.5,
            evaluated_expression: 'input.value > 10',
            branch: Math.random() > 0.5 ? 'true' : 'false'
          }
        };
      
      default:
        return {
          success: true,
          data: {
            processed: true,
            input_received: input,
            node_type: nodeType,
            timestamp: new Date().toISOString()
          }
        };
    }
  };

  const getStatusIcon = (status: DebugSession['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Square className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: DebugSession['status']) => {
    switch (status) {
      case 'running': return 'border-blue-500 bg-blue-50';
      case 'completed': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      case 'paused': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bug className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Debug Mode</h3>
          <Badge variant="outline">SureFlow Debug Engine</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={isStepMode ? "default" : "outline"}
            onClick={() => setIsStepMode(!isStepMode)}
          >
            <StepForward className="w-4 h-4 mr-1" />
            Step Mode
          </Button>
        </div>
      </div>

      <Tabs defaultValue="test" className="w-full">
        <TabsList>
          <TabsTrigger value="test">Node Testing</TabsTrigger>
          <TabsTrigger value="sessions">Debug Sessions</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Node Execution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Node to Test</Label>
                <Select value={selectedNode} onValueChange={setSelectedNode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a node..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map(node => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.data?.label || `${node.type} - ${node.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Test Input JSON</Label>
                <Textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="font-mono text-xs h-32"
                  placeholder="Enter test input data..."
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={startDebugSession} disabled={!selectedNode}>
                  <Play className="w-4 h-4 mr-1" />
                  Execute Test
                </Button>
                
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  Validate JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {debugSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No debug sessions yet</p>
                  <p className="text-sm mt-1">Start testing nodes to see debug information</p>
                </div>
              ) : (
                debugSessions.map(session => (
                  <Card key={session.id} className={`${getStatusColor(session.status)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(session.status)}
                          <span className="font-medium">{session.nodeName}</span>
                          <Badge variant="outline" className="text-xs">{session.nodeId}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.executionTime}ms
                        </div>
                      </div>

                      <Tabs defaultValue="output" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-8">
                          <TabsTrigger value="input" className="text-xs">Input</TabsTrigger>
                          <TabsTrigger value="output" className="text-xs">Output</TabsTrigger>
                          <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="input" className="mt-2">
                          <pre className="bg-gray-100 p-2 rounded text-xs font-mono max-h-32 overflow-auto">
                            {JSON.stringify(session.input, null, 2)}
                          </pre>
                        </TabsContent>

                        <TabsContent value="output" className="mt-2">
                          <pre className="bg-gray-100 p-2 rounded text-xs font-mono max-h-32 overflow-auto">
                            {JSON.stringify(session.output, null, 2)}
                          </pre>
                        </TabsContent>

                        <TabsContent value="logs" className="mt-2">
                          <div className="space-y-1 max-h-32 overflow-auto">
                            {session.logs.map((log, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs">
                                <span className="text-gray-500">
                                  {log.timestamp.toLocaleTimeString()}
                                </span>
                                <Badge 
                                  variant={log.level === 'error' ? 'destructive' : 'outline'} 
                                  className="text-xs"
                                >
                                  {log.level}
                                </Badge>
                                <span>{log.message}</span>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Debug Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">[2024-01-01 10:00:00]</span>
                    <Badge variant="outline" className="text-xs">INFO</Badge>
                    <span>SureFlow Debug Engine initialized</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">[2024-01-01 10:00:01]</span>
                    <Badge variant="outline" className="text-xs">INFO</Badge>
                    <span>Node library loaded successfully</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">[2024-01-01 10:00:02]</span>
                    <Badge variant="outline" className="text-xs">DEBUG</Badge>
                    <span>Workflow execution environment ready</span>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-gray-500 text-center border-t pt-3">
        <p>SureFlow Debug Engine - Node execution testing and validation</p>
      </div>
    </div>
  );
};
