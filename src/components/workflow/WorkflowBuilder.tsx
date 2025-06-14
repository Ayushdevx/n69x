import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodeLibrary } from './NodeLibrary';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowToolbar } from './WorkflowToolbar';
import { NodeInspector } from './NodeInspector';
import { ExecutionPanel } from './ExecutionPanel';
import { WorkflowAnalytics } from './WorkflowAnalytics';
import { WorkflowDebugger } from './WorkflowDebugger';
import { AIAssistant } from './AIAssistant';
import { PerformanceMonitor } from './PerformanceMonitor';
import { EnhancedCanvas } from './EnhancedCanvas';
import { NodeConnectionAnimation } from './NodeConnectionAnimation';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { DelayNode } from './nodes/DelayNode';
import { HttpNode } from './nodes/HttpNode';
import { TransformNode } from './nodes/TransformNode';
import { LoopNode } from './nodes/LoopNode';
import { WebhookNode } from './nodes/WebhookNode';
import { EmailNode } from './nodes/EmailNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { ScheduleNode } from './nodes/ScheduleNode';
import { ZapierNode } from './nodes/ZapierNode';
import { SlackNode } from './nodes/SlackNode';
import { SheetsNode } from './nodes/SheetsNode';
import { AiNode } from './nodes/AiNode';
import { FilterNode } from './nodes/FilterNode';
import { workflowEngine } from './WorkflowEngine';
import { initialNodes, initialEdges } from './initialWorkflow';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Zap, Activity, Brain, Target, Settings, Code, BarChart3 } from 'lucide-react';
import { WorkflowValidation } from './WorkflowValidation';
import { WorkflowSettings } from './WorkflowSettings';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  http: HttpNode,
  transform: TransformNode,
  loop: LoopNode,
  webhook: WebhookNode,
  email: EmailNode,
  database: DatabaseNode,
  schedule: ScheduleNode,
  zapier: ZapierNode,
  slack: SlackNode,
  sheets: SheetsNode,
  ai: AiNode,
  filter: FilterNode,
};

export const WorkflowBuilder = () => {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Map<string, any>>(new Map());
  const [executionLog, setExecutionLog] = useState<Array<{id: string, message: string, type: 'info' | 'error' | 'success' | 'warning', timestamp: Date, nodeId?: string}>>([]);
  const [executionCount, setExecutionCount] = useState(0);
  const [executionFlow, setExecutionFlow] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('inspector');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [workflowSettings, setWorkflowSettings] = useState({
    name: 'My Workflow',
    description: 'A powerful automation workflow',
    timeout: 300,
    retryAttempts: 3,
    enableLogging: true,
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
    enableValidation: true,
    autoSave: true,
    executionMode: 'sequential' as 'parallel' | 'sequential',
    errorHandling: 'stop' as 'stop' | 'continue' | 'retry'
  });
  const [currentExecutingNode, setCurrentExecutingNode] = useState<string | null>(null);
  const [totalNodes, setTotalNodes] = useState(0);
  const [completedNodes, setCompletedNodes] = useState(0);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connecting nodes:', params);
      setEdges((eds) => addEdge(params, eds));
      saveToHistory();
      toast({
        title: "🔗 Nodes Connected",
        description: `Connected ${params.source} to ${params.target}`,
      });
    },
    [setEdges, toast]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          config: {},
          status: 'idle',
          enabled: true
        },
      };

      console.log('Dropping node:', newNode);
      setNodes((nds) => nds.concat(newNode));
      saveToHistory();
      
      toast({
        title: "✨ Node Added",
        description: `${newNode.data.label} has been added to the workflow`,
      });
    },
    [reactFlowInstance, setNodes, toast]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
    
    if (event.ctrlKey || event.metaKey) {
      setSelectedNodes(prev => 
        prev.includes(node.id) 
          ? prev.filter(id => id !== node.id)
          : [...prev, node.id]
      );
    } else {
      setSelectedNodes([node.id]);
    }
  }, []);

  const saveToHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes, edges });
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(prev => prev - 1);
      toast({ title: "↩️ Undone", description: "Action has been undone" });
    }
  }, [history, historyIndex, setNodes, setEdges, toast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(prev => prev + 1);
      toast({ title: "↪️ Redone", description: "Action has been redone" });
    }
  }, [history, historyIndex, setNodes, setEdges, toast]);

  const onDeleteNode = useCallback((nodeId: string) => {
    console.log(`Deleting node: ${nodeId}`);
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    setSelectedNodes(prev => prev.filter(id => id !== nodeId));
    saveToHistory();
    toast({
      title: "🗑️ Node Deleted",
      description: `Node ${nodeId} and its connections have been removed`,
    });
  }, [setNodes, setEdges, selectedNode, toast, saveToHistory]);

  const onDuplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) {
      console.error(`Node ${nodeId} not found for duplication`);
      return;
    }

    const newNodeId = `${nodeToDuplicate.type}-${Date.now()}`;
    const newNode: Node = {
      ...nodeToDuplicate,
      id: newNodeId,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      data: {
        ...nodeToDuplicate.data,
        label: `${nodeToDuplicate.data.label} (Copy)`,
        status: 'idle'
      }
    };

    console.log(`Duplicating node: ${nodeId} -> ${newNodeId}`);
    setNodes((nds) => nds.concat(newNode));
    saveToHistory();
    toast({
      title: "📋 Node Duplicated",
      description: `Created copy of ${nodeToDuplicate.data.label}`,
    });
  }, [nodes, setNodes, toast, saveToHistory]);

  const onApplyTemplate = useCallback((template: any) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNode(null);
    saveToHistory();
    toast({
      title: "📄 Template Applied",
      description: `Applied ${template.name} template`,
    });
  }, [setNodes, setEdges, toast, saveToHistory]);

  const deleteSelectedNodes = useCallback(() => {
    setNodes(nds => nds.filter(n => !selectedNodes.includes(n.id)));
    setEdges(eds => eds.filter(e => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)));
    setSelectedNodes([]);
    setSelectedNode(null);
    saveToHistory();
    toast({
      title: "🗑️ Nodes Deleted",
      description: `Deleted ${selectedNodes.length} nodes`,
    });
  }, [selectedNodes, setNodes, setEdges, toast, saveToHistory]);

  const duplicateSelectedNodes = useCallback(() => {
    const nodesToDuplicate = nodes.filter(n => selectedNodes.includes(n.id));
    const newNodes = nodesToDuplicate.map(node => ({
      ...node,
      id: `${node.type}-${Date.now()}-${Math.random()}`,
      position: {
        x: node.position.x + 100,
        y: node.position.y + 100,
      },
      data: {
        ...node.data,
        label: `${node.data.label} (Copy)`
      }
    }));

    setNodes(nds => [...nds, ...newNodes]);
    saveToHistory();
    toast({
      title: "📋 Nodes Duplicated",
      description: `Duplicated ${selectedNodes.length} nodes`,
    });
  }, [selectedNodes, nodes, setNodes, toast, saveToHistory]);

  const alignNodes = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const selectedNodeObjects = nodes.filter(n => selectedNodes.includes(n.id));
    if (selectedNodeObjects.length < 2) return;

    let alignValue: number;
    const isHorizontal = ['left', 'center', 'right'].includes(alignment);

    if (isHorizontal) {
      const positions = selectedNodeObjects.map(n => n.position.x);
      alignValue = alignment === 'left' ? Math.min(...positions) :
                  alignment === 'right' ? Math.max(...positions) :
                  positions.reduce((a, b) => a + b) / positions.length;
    } else {
      const positions = selectedNodeObjects.map(n => n.position.y);
      alignValue = alignment === 'top' ? Math.min(...positions) :
                  alignment === 'bottom' ? Math.max(...positions) :
                  positions.reduce((a, b) => a + b) / positions.length;
    }

    setNodes(nds => nds.map(n => {
      if (selectedNodes.includes(n.id)) {
        return {
          ...n,
          position: {
            ...n.position,
            [isHorizontal ? 'x' : 'y']: alignValue
          }
        };
      }
      return n;
    }));

    saveToHistory();
    toast({
      title: "📐 Nodes Aligned",
      description: `Aligned ${selectedNodes.length} nodes to ${alignment}`,
    });
  }, [selectedNodes, nodes, setNodes, toast, saveToHistory]);

  const lockNodes = useCallback((lock: boolean) => {
    setNodes(nds => nds.map(n => ({
      ...n,
      draggable: !lock,
      data: { ...n.data, locked: lock }
    })));
    
    toast({
      title: lock ? "🔒 Canvas Locked" : "🔓 Canvas Unlocked",
      description: lock ? "Nodes are now locked in place" : "Nodes can now be moved freely",
    });
  }, [setNodes, toast]);

  const executeWorkflow = async () => {
    if (workflowSettings.enableValidation) {
      const triggerNodes = nodes.filter(node => node.type === 'trigger' && node.data.enabled !== false);
      if (triggerNodes.length === 0) {
        toast({
          title: "❌ Validation Failed",
          description: "No enabled trigger nodes found. Add at least one trigger to start execution.",
          variant: "destructive"
        });
        return;
      }
    }

    console.log('Starting workflow execution with enhanced engine');
    setIsExecuting(true);
    setExecutionResults(new Map());
    setExecutionCount(prev => prev + 1);
    setCurrentExecutingNode(null);
    setCompletedNodes(0);
    
    const enabledNodes = nodes.filter(node => node.data.enabled !== false);
    setTotalNodes(enabledNodes.length);

    toast({
      title: "🚀 Workflow Execution Started",
      description: `Starting ${workflowSettings.name} with ${enabledNodes.length} enabled nodes`,
    });

    try {
      const results = await workflowEngine.executeWorkflow(nodes, edges);
      setExecutionResults(results);
      setExecutionLog(workflowEngine.getExecutionLog());
      
      toast({
        title: "✅ Execution Complete",
        description: `${workflowSettings.name} finished successfully`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
      
      toast({
        title: "❌ Execution Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      console.error('Workflow execution error:', error);
    } finally {
      setIsExecuting(false);
      setCurrentExecutingNode(null);
    }
  };

  const handleStepExecution = async (nodeId: string) => {
    console.log(`Step execution for node: ${nodeId}`);
    try {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      setCurrentExecutingNode(nodeId);
      const result = await workflowEngine.executeNode(nodeId, node.type || 'action', {}, node.data?.config);
      
      setExecutionResults(prev => new Map(prev.set(nodeId, result)));
      setExecutionLog(workflowEngine.getExecutionLog());
      
      setNodes(nds => nds.map(n => 
        n.id === nodeId 
          ? { 
              ...n, 
              data: { 
                ...n.data, 
                status: 'success',
                lastExecuted: new Date(),
                executionTime: result.executionTime
              } 
            }
          : n
      ));
    } catch (error) {
      console.error('Step execution error:', error);
      setNodes(nds => nds.map(n => 
        n.id === nodeId 
          ? { ...n, data: { ...n.data, status: 'error' } }
          : n
      ));
    } finally {
      setCurrentExecutingNode(null);
    }
  };

  const handleSimulateNode = async (nodeId: string, inputData: any) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error(`Node ${nodeId} not found for simulation`);
      return null;
    }

    console.log(`Simulating node: ${nodeId} with input:`, inputData);
    
    try {
      return await workflowEngine.executeNode(nodeId, node.type || 'action', inputData, node.data?.config);
    } catch (error) {
      console.error('Node simulation error:', error);
      return { error: 'Simulation failed', details: error, inputData };
    }
  };

  const clearExecution = () => {
    workflowEngine.clearExecutionData();
    setExecutionResults(new Map());
    setExecutionLog([]);
    setExecutionFlow([]);
    setCurrentExecutingNode(null);
    setCompletedNodes(0);
    setTotalNodes(0);
    
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, status: 'idle', lastExecuted: undefined, executionTime: undefined }
    })));
    
    toast({
      title: "🧹 Execution Cleared",
      description: "Reset all node states and cleared logs",
    });
  };

  const handleApplyWorkflowSuggestion = () => {
    toast({
      title: "🤖 AI Suggestion Applied",
      description: "Workflow optimized with intelligent recommendations",
    });
  };

  const handleApplyNodeOptimization = () => {
    toast({
      title: "⚡ Node Optimized",
      description: `Enhanced performance for selected node`,
    });
  };

  const onToggleNodeEnable = useCallback((nodeId: string) => {
    console.log(`Toggling enable state for node: ${nodeId}`);
    setNodes(nds => nds.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, enabled: !n.data.enabled } }
        : n
    ));
    saveToHistory();
    
    const node = nodes.find(n => n.id === nodeId);
    const newState = !node?.data.enabled;
    
    toast({
      title: newState ? "🟢 Node Enabled" : "🔴 Node Disabled",
      description: `${node?.data.label} has been ${newState ? 'enabled' : 'disabled'}`,
    });
  }, [nodes, setNodes, toast, saveToHistory]);

  const onExecuteSingleNode = useCallback(async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error(`Node ${nodeId} not found for single execution`);
      return;
    }

    console.log(`Single execution for node: ${nodeId}`);
    toast({
      title: "⚡ Executing Single Node",
      description: `Running ${node.data.label}`,
    });

    try {
      await handleStepExecution(nodeId);
    } catch (error) {
      console.error('Single node execution error:', error);
    }
  }, [nodes]);

  // Memoize enhanced nodeTypes to prevent React Flow warning
  const enhancedNodeTypes = useMemo(() => {
    return Object.fromEntries(
      Object.entries(nodeTypes).map(([key, NodeComponent]) => [
        key,
        (props: any) => (
          <NodeComponent
            {...props}
            onDelete={() => onDeleteNode(props.id)}
            onDuplicate={() => onDuplicateNode(props.id)}
            onToggleEnable={() => onToggleNodeEnable(props.id)}
            onExecuteNode={() => onExecuteSingleNode(props.id)}
          />
        )
      ])
    );
  }, [onDeleteNode, onDuplicateNode, onToggleNodeEnable, onExecuteSingleNode]);

  const tabIcons = {
    inspector: { icon: Sparkles, label: 'Inspector' },
    execution: { icon: Zap, label: 'Execution' },
    analytics: { icon: BarChart3, label: 'Analytics' },
    validation: { icon: Target, label: 'Validation' },
    ai: { icon: Brain, label: 'AI Assistant' },
    settings: { icon: Settings, label: 'Settings' }
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen w-full flex bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white overflow-hidden">
        {/* Enhanced Node Library with slide animation */}
        <div className={`transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'} overflow-hidden`}>
          <NodeLibrary />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <WorkflowHeader 
            onExecute={executeWorkflow} 
            onClear={() => {
              workflowEngine.clearExecutionData();
              setExecutionResults(new Map());
              setExecutionLog([]);
              setExecutionFlow([]);
              setCurrentExecutingNode(null);
              setCompletedNodes(0);
              setTotalNodes(0);
              
              setNodes(nds => nds.map(n => ({
                ...n,
                data: { ...n.data, status: 'idle', lastExecuted: undefined, executionTime: undefined }
              })));
              
              toast({
                title: "🧹 Execution Cleared",
                description: "Reset all node states and cleared logs",
              });
            }}
            isExecuting={isExecuting}
            nodeCount={nodes.length}
            connectionCount={edges.length}
            onApplyTemplate={onApplyTemplate}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />

          <WorkflowToolbar
            selectedNodes={selectedNodes}
            onAddNode={(type) => {
              const position = { x: 100, y: 100 };
              const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { 
                  label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
                  config: {},
                  status: 'idle',
                  enabled: true
                },
              };
              setNodes((nds) => nds.concat(newNode));
              saveToHistory();
            }}
            onDeleteSelected={deleteSelectedNodes}
            onDuplicateSelected={duplicateSelectedNodes}
            onAlignNodes={alignNodes}
            onLockNodes={lockNodes}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={undo}
            onRedo={redo}
          />
          
          <div className="flex-1 flex relative">
            {/* Enhanced Canvas with animations */}
            <div className="flex-1 relative overflow-hidden" ref={reactFlowWrapper}>
              <EnhancedCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                nodeTypes={enhancedNodeTypes}
                isExecuting={isExecuting}
              />
              
              <NodeConnectionAnimation
                edges={edges}
                isExecuting={isExecuting}
                executionFlow={executionFlow}
              />
            </div>
            
            {/* Enhanced Right Panel with more tabs */}
            <div className="w-96 border-l border-gray-700/50 flex flex-col bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-6 bg-gray-800/80 border-b border-gray-700/50 backdrop-blur-sm">
                  <TabsTrigger value="inspector" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 transition-all duration-200 hover:scale-105 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Inspector
                  </TabsTrigger>
                  <TabsTrigger value="execution" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 transition-all duration-200 hover:scale-105 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Execution
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 transition-all duration-200 hover:scale-105 text-xs">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="validation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 transition-all duration-200 hover:scale-105 text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    Validation
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 transition-all duration-200 hover:scale-105 text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 transition-all duration-200 hover:scale-105 text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="inspector" className="flex-1 flex flex-col mt-0 animate-fade-in">
                  <NodeInspector 
                    selectedNode={selectedNode} 
                    onUpdateNode={(nodeId, data) => {
                      setNodes(nds => nds.map(n => 
                        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
                      ));
                      saveToHistory();
                    }}
                    onDeleteNode={onDeleteNode}
                    onDuplicateNode={onDuplicateNode}
                  />
                </TabsContent>
                
                <TabsContent value="execution" className="flex-1 mt-0 animate-fade-in">
                  <ExecutionPanel 
                    results={executionResults}
                    executionLog={executionLog}
                    isExecuting={isExecuting}
                    currentExecutingNode={currentExecutingNode}
                    totalNodes={totalNodes}
                    completedNodes={completedNodes}
                  />
                </TabsContent>
                
                <TabsContent value="analytics" className="flex-1 mt-0 animate-fade-in">
                  <WorkflowAnalytics
                    executionResults={executionResults}
                    executionLog={executionLog}
                    nodeCount={nodes.length}
                  />
                </TabsContent>

                <TabsContent value="validation" className="flex-1 mt-0 animate-fade-in">
                  <WorkflowValidation
                    nodes={nodes}
                    edges={edges}
                  />
                </TabsContent>

                <TabsContent value="ai" className="flex-1 mt-0 animate-fade-in">
                  <AIAssistant
                    nodes={nodes}
                    selectedNode={selectedNode}
                    onApplyWorkflowSuggestion={() => {
                      toast({
                        title: "🤖 AI Suggestion Applied",
                        description: "Workflow optimized with intelligent recommendations",
                      });
                    }}
                    onApplyNodeOptimization={() => {
                      toast({
                        title: "⚡ Node Optimized",
                        description: `Enhanced performance for selected node`,
                      });
                    }}
                  />
                </TabsContent>

                <TabsContent value="settings" className="flex-1 mt-0 animate-fade-in">
                  <WorkflowSettings
                    settings={workflowSettings}
                    onSettingsChange={setWorkflowSettings}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
};
