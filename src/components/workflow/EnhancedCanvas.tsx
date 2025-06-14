
import React, { useCallback, useRef, useState, useEffect } from 'react';
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
  ReactFlowInstance,
  ConnectionMode,
  MiniMap,
  Panel,
  BackgroundVariant,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Grid, Eye, EyeOff, Download } from 'lucide-react';

interface EnhancedCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  onInit: (instance: ReactFlowInstance) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  nodeTypes: any;
  isExecuting: boolean;
}

export const EnhancedCanvas: React.FC<EnhancedCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit,
  onDrop,
  onDragOver,
  onNodeClick,
  nodeTypes,
  isExecuting,
}) => {
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [canvasMode, setCanvasMode] = useState<'design' | 'execution'>('design');
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const handleInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    onInit(instance);
  }, [onInit]);

  const fitView = () => {
    reactFlowInstance.current?.fitView({ padding: 0.1 });
  };

  const zoomIn = () => {
    reactFlowInstance.current?.zoomIn();
  };

  const zoomOut = () => {
    reactFlowInstance.current?.zoomOut();
  };

  const downloadImage = async () => {
    if (!reactFlowInstance.current) return;

    try {
      // Get the current viewport
      const viewport = reactFlowInstance.current.getViewport();
      
      // Export workflow data as JSON
      const workflowData = {
        nodes,
        edges,
        viewport,
        timestamp: new Date().toISOString(),
        metadata: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          version: '1.0.0'
        }
      };
      
      const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workflow-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading workflow:', error);
    }
  };

  useEffect(() => {
    setCanvasMode(isExecuting ? 'execution' : 'design');
  }, [isExecuting]);

  return (
    <div className="relative w-full h-full">
      {/* Dynamic background overlay based on execution state */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
        isExecuting 
          ? 'bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20' 
          : 'bg-gradient-to-br from-gray-900/10 via-slate-900/10 to-gray-800/10'
      }`} />
      
      {/* Execution mode indicator */}
      {isExecuting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 px-6 py-3 rounded-full shadow-2xl animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-white font-semibold">Workflow Executing...</span>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={handleInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className={`transition-all duration-500 ${
          canvasMode === 'execution' ? 'brightness-110 contrast-105' : ''
        }`}
        fitView
        attributionPosition="bottom-left"
        connectionMode={ConnectionMode.Loose}
        snapToGrid={true}
        snapGrid={[15, 15]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={true}
        selectNodesOnDrag={false}
      >
        <Controls 
          className="bg-gray-800/95 backdrop-blur-lg border-gray-600 rounded-xl shadow-2xl"
          position="bottom-left"
        />
        
        <Background 
          color={canvasMode === 'execution' ? "#3b82f6" : "#374151"} 
          gap={20} 
          size={1}
          variant={backgroundVariant}
          className={`transition-all duration-500 ${
            canvasMode === 'execution' ? 'opacity-70' : 'opacity-40'
          }`}
        />

        {showMiniMap && (
          <MiniMap
            style={{
              backgroundColor: '#1f2937',
              border: '2px solid #374151',
              borderRadius: '12px',
              overflow: 'hidden',
              width: 200,
              height: 150
            }}
            nodeColor={(node) => {
              switch (node.data?.status) {
                case 'running': return '#3b82f6';
                case 'success': return '#10b981';
                case 'error': return '#ef4444';
                default: return '#6b7280';
              }
            }}
            nodeStrokeColor="#374151"
            nodeStrokeWidth={1}
            maskColor="rgba(31, 41, 55, 0.7)"
            pannable={true}
            zoomable={true}
            position="bottom-right"
          />
        )}

        {/* Enhanced Canvas Controls Panel */}
        <Panel position="top-right" className="space-y-2">
          <div className="bg-gray-800/95 backdrop-blur-lg border border-gray-600 rounded-xl p-2 shadow-2xl">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={fitView}
                className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400"
                title="Fit View"
              >
                <Maximize className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-600 mx-1"></div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMiniMap(!showMiniMap)}
                className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300"
                title="Toggle Minimap"
              >
                {showMiniMap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBackgroundVariant(
                  backgroundVariant === BackgroundVariant.Dots ? BackgroundVariant.Lines : 
                  backgroundVariant === BackgroundVariant.Lines ? BackgroundVariant.Cross : BackgroundVariant.Dots
                )}
                className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300"
                title="Change Background"
              >
                <Grid className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={downloadImage}
                className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300"
                title="Download Workflow"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Canvas Stats */}
          <div className="bg-gray-800/95 backdrop-blur-lg border border-gray-600 rounded-xl p-3 shadow-2xl text-sm">
            <div className="text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Nodes:</span>
                <span className="text-blue-400 font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Connections:</span>
                <span className="text-green-400 font-medium">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className={`font-medium ${canvasMode === 'execution' ? 'text-orange-400' : 'text-gray-400'}`}>
                  {canvasMode === 'execution' ? 'Executing' : 'Design'}
                </span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
