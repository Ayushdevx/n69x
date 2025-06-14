
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Code, 
  Save, 
  Play, 
  Download,
  Upload,
  Copy,
  Zap,
  Globe,
  Database,
  Mail,
  GitBranch,
  Clock,
  Shuffle,
  Webhook,
  Settings
} from 'lucide-react';

interface NodeDefinition {
  nodeId: string;
  nodeName: string;
  nodeDescription: string;
  category: string;
  icon: string;
  color: string;
  sampleInputJson: string;
  sampleOutputJson: string;
  codeFile: string;
  pythonCode: string;
  version: string;
  author: string;
  tags: string[];
  isCustom: boolean;
}

const iconMap = {
  Zap, Globe, Database, Mail, GitBranch, Clock, Shuffle, Webhook, Settings, Code, Play
};

const defaultCategories = ['triggers', 'actions', 'logic', 'integrations', 'custom'];

const samplePythonCode = `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import json

app = FastAPI()

class NodeInput(BaseModel):
    data: Dict[str, Any]
    config: Dict[str, Any] = {}

class NodeOutput(BaseModel):
    data: Dict[str, Any]
    success: bool
    message: str = ""

@app.post("/execute", response_model=NodeOutput)
async def execute_node(input_data: NodeInput):
    """
    Execute the node logic here
    """
    try:
        # Your node logic goes here
        result_data = {
            "processed": True,
            "input_received": input_data.data,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        return NodeOutput(
            data=result_data,
            success=True,
            message="Node executed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`;

export const NodeLibraryManager = () => {
  const [nodes, setNodes] = useState<NodeDefinition[]>([
    {
      nodeId: 'http_request',
      nodeName: 'HTTP Request',
      nodeDescription: 'Make HTTP API calls',
      category: 'actions',
      icon: 'Globe',
      color: 'bg-purple-500',
      sampleInputJson: '{"url": "https://api.example.com", "method": "GET", "headers": {}}',
      sampleOutputJson: '{"status": 200, "data": {}, "headers": {}}',
      codeFile: 'http_request.py',
      pythonCode: samplePythonCode,
      version: '1.0.0',
      author: 'System',
      tags: ['http', 'api', 'request'],
      isCustom: false
    },
    {
      nodeId: 'email_sender',
      nodeName: 'Email Sender',
      nodeDescription: 'Send email notifications',
      category: 'actions',
      icon: 'Mail',
      color: 'bg-pink-500',
      sampleInputJson: '{"to": "user@example.com", "subject": "Test", "body": "Hello"}',
      sampleOutputJson: '{"sent": true, "messageId": "123", "timestamp": "2024-01-01T00:00:00Z"}',
      codeFile: 'email_sender.py',
      pythonCode: samplePythonCode,
      version: '1.0.0',
      author: 'System',
      tags: ['email', 'notification', 'smtp'],
      isCustom: false
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<NodeDefinition | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [newNode, setNewNode] = useState<Partial<NodeDefinition>>({
    nodeId: '',
    nodeName: '',
    nodeDescription: '',
    category: 'custom',
    icon: 'Code',
    color: 'bg-gray-500',
    sampleInputJson: '{\n  "key": "value"\n}',
    sampleOutputJson: '{\n  "result": "success"\n}',
    pythonCode: samplePythonCode,
    version: '1.0.0',
    author: 'System',
    tags: [],
    isCustom: true
  });

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.nodeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.nodeDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNode = () => {
    if (!newNode.nodeId || !newNode.nodeName) {
      alert('Please fill in required fields');
      return;
    }

    const nodeDefinition: NodeDefinition = {
      ...newNode as NodeDefinition,
      codeFile: `${newNode.nodeId}.py`,
      tags: typeof newNode.tags === 'string' ? (newNode.tags as string).split(',').map(t => t.trim()) : newNode.tags || []
    };

    setNodes([...nodes, nodeDefinition]);
    setNewNode({
      nodeId: '',
      nodeName: '',
      nodeDescription: '',
      category: 'custom',
      icon: 'Code',
      color: 'bg-gray-500',
      sampleInputJson: '{\n  "key": "value"\n}',
      sampleOutputJson: '{\n  "result": "success"\n}',
      pythonCode: samplePythonCode,
      version: '1.0.0',
      author: 'System',
      tags: [],
      isCustom: true
    });
    setIsCreateMode(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.nodeId !== nodeId));
    if (selectedNode?.nodeId === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleDuplicateNode = (node: NodeDefinition) => {
    const duplicated: NodeDefinition = {
      ...node,
      nodeId: `${node.nodeId}_copy_${Date.now()}`,
      nodeName: `${node.nodeName} (Copy)`,
      isCustom: true,
      author: 'System'
    };
    setNodes([...nodes, duplicated]);
  };

  const exportNodeLibrary = () => {
    const dataStr = JSON.stringify(nodes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'sureflow_node_library.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedNodes = JSON.parse(e.target?.result as string);
          setNodes([...nodes, ...importedNodes]);
        } catch (error) {
          alert('Error importing nodes: Invalid JSON format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Node List */}
      <div className="w-1/3 border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Node Library</h2>
            <div className="flex space-x-2">
              <Dialog open={isCreateMode} onOpenChange={setIsCreateMode}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Custom Node</DialogTitle>
                  </DialogHeader>
                  <CreateNodeForm 
                    node={newNode}
                    setNode={setNewNode}
                    onSave={handleCreateNode}
                    onCancel={() => setIsCreateMode(false)}
                  />
                </DialogContent>
              </Dialog>
              
              <Button size="sm" variant="outline" onClick={exportNodeLibrary}>
                <Download className="w-4 h-4" />
              </Button>
              
              <Button size="sm" variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileImport}
                    className="hidden" 
                  />
                </label>
              </Button>
            </div>
          </div>

          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {defaultCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredNodes.map((node) => (
              <Card 
                key={node.nodeId}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedNode?.nodeId === node.nodeId ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedNode(node)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg ${node.color} flex items-center justify-center`}>
                      {React.createElement(iconMap[node.icon as keyof typeof iconMap] || Code, { 
                        className: "w-4 h-4 text-white" 
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{node.nodeName}</div>
                      <div className="text-xs text-gray-500 truncate">{node.nodeDescription}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant="outline" className="text-xs">{node.category}</Badge>
                        {node.isCustom && <Badge variant="secondary" className="text-xs">Custom</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Node Details */}
      <div className="flex-1">
        {selectedNode ? (
          <NodeDetailsPanel 
            node={selectedNode}
            onDelete={() => handleDeleteNode(selectedNode.nodeId)}
            onDuplicate={() => handleDuplicateNode(selectedNode)}
            onUpdate={(updatedNode) => {
              setNodes(nodes.map(n => n.nodeId === updatedNode.nodeId ? updatedNode : n));
              setSelectedNode(updatedNode);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a node to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateNodeForm = ({ node, setNode, onSave, onCancel }: {
  node: Partial<NodeDefinition>;
  setNode: (node: Partial<NodeDefinition>) => void;
  onSave: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Node ID*</Label>
          <Input
            value={node.nodeId || ''}
            onChange={(e) => setNode({...node, nodeId: e.target.value})}
            placeholder="unique_node_id"
          />
        </div>
        <div>
          <Label>Node Name*</Label>
          <Input
            value={node.nodeName || ''}
            onChange={(e) => setNode({...node, nodeName: e.target.value})}
            placeholder="My Custom Node"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={node.nodeDescription || ''}
          onChange={(e) => setNode({...node, nodeDescription: e.target.value})}
          placeholder="What does this node do?"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={node.category} onValueChange={(value) => setNode({...node, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {defaultCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Icon</Label>
          <Select value={node.icon} onValueChange={(value) => setNode({...node, icon: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(iconMap).map(iconName => (
                <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Color</Label>
          <Select value={node.color} onValueChange={(value) => setNode({...node, color: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bg-blue-500">Blue</SelectItem>
              <SelectItem value="bg-green-500">Green</SelectItem>
              <SelectItem value="bg-purple-500">Purple</SelectItem>
              <SelectItem value="bg-red-500">Red</SelectItem>
              <SelectItem value="bg-yellow-500">Yellow</SelectItem>
              <SelectItem value="bg-pink-500">Pink</SelectItem>
              <SelectItem value="bg-indigo-500">Indigo</SelectItem>
              <SelectItem value="bg-gray-500">Gray</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList>
          <TabsTrigger value="code">Python Code</TabsTrigger>
          <TabsTrigger value="io">Input/Output</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code">
          <div>
            <Label>FastAPI Python Code</Label>
            <Textarea
              value={node.pythonCode || ''}
              onChange={(e) => setNode({...node, pythonCode: e.target.value})}
              className="font-mono text-xs h-64"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="io">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sample Input JSON</Label>
              <Textarea
                value={node.sampleInputJson || ''}
                onChange={(e) => setNode({...node, sampleInputJson: e.target.value})}
                className="font-mono text-xs"
                rows={8}
              />
            </div>
            <div>
              <Label>Sample Output JSON</Label>
              <Textarea
                value={node.sampleOutputJson || ''}
                onChange={(e) => setNode({...node, sampleOutputJson: e.target.value})}
                className="font-mono text-xs"
                rows={8}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-1" />
          Create Node
        </Button>
      </div>
    </div>
  );
};

const NodeDetailsPanel = ({ node, onDelete, onDuplicate, onUpdate }: {
  node: NodeDefinition;
  onDelete: () => void;
  onDuplicate: () => void;
  onUpdate: (node: NodeDefinition) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNode, setEditedNode] = useState(node);

  const handleSave = () => {
    onUpdate(editedNode);
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${node.color} flex items-center justify-center`}>
              {React.createElement(iconMap[node.icon as keyof typeof iconMap] || Code, { 
                className: "w-5 h-5 text-white" 
              })}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{node.nodeName}</h3>
              <p className="text-sm text-gray-600">{node.nodeDescription}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDuplicate}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isEditing ? (
            <EditNodeForm 
              node={editedNode}
              setNode={setEditedNode}
              onSave={handleSave}
              onCancel={() => {
                setEditedNode(node);
                setIsEditing(false);
              }}
            />
          ) : (
            <NodeViewDetails node={node} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const EditNodeForm = ({ node, setNode, onSave, onCancel }: {
  node: NodeDefinition;
  setNode: (node: NodeDefinition) => void;
  onSave: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="space-y-4">
      {/* Same form structure as CreateNodeForm but with update logic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Node Name</Label>
          <Input
            value={node.nodeName}
            onChange={(e) => setNode({...node, nodeName: e.target.value})}
          />
        </div>
        <div>
          <Label>Version</Label>
          <Input
            value={node.version}
            onChange={(e) => setNode({...node, version: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={node.nodeDescription}
          onChange={(e) => setNode({...node, nodeDescription: e.target.value})}
          rows={2}
        />
      </div>

      <div>
        <Label>Python Code</Label>
        <Textarea
          value={node.pythonCode}
          onChange={(e) => setNode({...node, pythonCode: e.target.value})}
          className="font-mono text-xs h-48"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-1" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

const NodeViewDetails = ({ node }: { node: NodeDefinition }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="io">I/O Schema</TabsTrigger>
        <TabsTrigger value="test">Test</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Node Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ID:</span> {node.nodeId}
              </div>
              <div>
                <span className="font-medium">Version:</span> {node.version}
              </div>
              <div>
                <span className="font-medium">Category:</span> {node.category}
              </div>
              <div>
                <span className="font-medium">Author:</span> {node.author}
              </div>
            </div>
            
            <div>
              <span className="font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {node.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="code">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">FastAPI Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
              {node.pythonCode}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="io">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Input Schema</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded text-xs font-mono">
                {node.sampleInputJson}
              </pre>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Output Schema</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded text-xs font-mono">
                {node.sampleOutputJson}
              </pre>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="test">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test Node Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label>Test Input JSON</Label>
                <Textarea
                  defaultValue={node.sampleInputJson}
                  className="font-mono text-xs"
                  rows={4}
                />
              </div>
              <Button>
                <Play className="w-4 h-4 mr-1" />
                Execute Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
