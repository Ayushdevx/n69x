
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Play, 
  Zap, 
  GitBranch, 
  Clock, 
  Globe, 
  Shuffle, 
  RotateCcw, 
  Webhook, 
  Mail, 
  Database,
  Cpu,
  FileText,
  Cloud,
  Plus,
  Settings,
  Code,
  MessageSquare,
  FileSpreadsheet,
  Brain,
  Filter
} from 'lucide-react';
import { NodeLibraryManager } from './NodeLibraryManager';

const nodeCategories = {
  triggers: [
    { type: 'trigger', icon: Play, name: 'Manual Trigger', description: 'Start workflow manually', color: 'bg-green-500' },
    { type: 'webhook', icon: Webhook, name: 'Webhook', description: 'HTTP webhook trigger', color: 'bg-blue-500' },
    { type: 'schedule', icon: Clock, name: 'Schedule', description: 'Time-based trigger', color: 'bg-purple-500' }
  ],
  actions: [
    { type: 'http', icon: Globe, name: 'HTTP Request', description: 'Make API calls', color: 'bg-purple-500' },
    { type: 'email', icon: Mail, name: 'Email', description: 'Send email notifications', color: 'bg-pink-500' },
    { type: 'database', icon: Database, name: 'Database', description: 'Database operations', color: 'bg-emerald-500' },
    { type: 'action', icon: Zap, name: 'Custom Action', description: 'Generic action node', color: 'bg-orange-500' }
  ],
  logic: [
    { type: 'condition', icon: GitBranch, name: 'Condition', description: 'Conditional branching', color: 'bg-yellow-500' },
    { type: 'transform', icon: Shuffle, name: 'Transform', description: 'Data transformation', color: 'bg-teal-500' },
    { type: 'loop', icon: RotateCcw, name: 'Loop', description: 'Repeat operations', color: 'bg-indigo-500' },
    { type: 'delay', icon: Clock, name: 'Delay', description: 'Wait/pause execution', color: 'bg-red-500' },
    { type: 'filter', icon: Filter, name: 'Filter', description: 'Filter data', color: 'bg-cyan-500' }
  ],
  integrations: [
    { type: 'zapier', icon: Zap, name: 'Zapier', description: 'Connect to Zapier', color: 'bg-orange-600' },
    { type: 'slack', icon: MessageSquare, name: 'Slack', description: 'Slack integration', color: 'bg-green-600' },
    { type: 'sheets', icon: FileSpreadsheet, name: 'Google Sheets', description: 'Spreadsheet operations', color: 'bg-green-700' },
    { type: 'ai', icon: Brain, name: 'AI Processing', description: 'AI/ML operations', color: 'bg-violet-600' }
  ]
};

export const NodeLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLibraryManager, setShowLibraryManager] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filterNodes = (nodes: any[]) => {
    return nodes.filter(node =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getAllNodes = () => {
    return Object.values(nodeCategories).flat();
  };

  const renderNodeList = (nodes: any[]) => {
    const filteredNodes = filterNodes(nodes);
    
    return (
      <div className="grid gap-2">
        {filteredNodes.map((node) => (
          <div
            key={node.type}
            className="p-3 bg-gray-700 border border-gray-600 rounded-lg cursor-grab hover:bg-gray-600 transition-colors group"
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg ${node.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <node.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{node.name}</div>
                <div className="text-xs text-gray-400">{node.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Node Library</h2>
          <div className="flex space-x-1">
            <Dialog open={showLibraryManager} onOpenChange={setShowLibraryManager}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle>Node Library Manager</DialogTitle>
                </DialogHeader>
                <div className="h-[80vh]">
                  <NodeLibraryManager />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div className="text-xs text-gray-400 mb-3 flex items-center justify-between">
          <span>SureFlow Node Engine</span>
          <Badge variant="outline" className="text-xs">v2.0.0</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700 mb-4">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="categories" className="text-xs">Categories</TabsTrigger>
              <TabsTrigger value="custom" className="text-xs">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {renderNodeList(getAllNodes())}
            </TabsContent>

            <TabsContent value="categories" className="mt-0 space-y-4">
              {Object.entries(nodeCategories).map(([category, nodes]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-300 capitalize">{category}</h3>
                    <Badge variant="outline" className="text-xs">
                      {filterNodes(nodes).length}
                    </Badge>
                  </div>
                  {renderNodeList(nodes)}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="custom" className="mt-0">
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Code className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-sm text-gray-400 mb-3">No custom nodes yet</p>
                  <Button 
                    size="sm" 
                    onClick={() => setShowLibraryManager(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Custom Node
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center space-y-1">
          <div>Drag nodes to canvas to build workflows</div>
          <div className="text-gray-500">Enhanced with AI & Advanced Logic</div>
        </div>
      </div>
    </div>
  );
};
