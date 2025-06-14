
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Globe, 
  Clock, 
  GitBranch, 
  Repeat, 
  Shuffle, 
  Webhook,
  Play,
  Mail,
  Database,
  Search
} from 'lucide-react';
import { useState } from 'react';

const nodeCategories = [
  {
    title: 'Triggers',
    nodes: [
      { type: 'trigger', label: 'Manual Trigger', icon: Play, color: 'bg-green-500', description: 'Start workflow manually' },
      { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'bg-blue-500', description: 'HTTP webhook trigger' },
    ]
  },
  {
    title: 'Actions',
    nodes: [
      { type: 'http', label: 'HTTP Request', icon: Globe, color: 'bg-purple-500', description: 'Make HTTP API calls' },
      { type: 'action', label: 'Custom Action', icon: Zap, color: 'bg-orange-500', description: 'Custom business logic' },
      { type: 'email', label: 'Send Email', icon: Mail, color: 'bg-pink-500', description: 'Send email notifications' },
      { type: 'database', label: 'Database', icon: Database, color: 'bg-emerald-500', description: 'Database operations' },
    ]
  },
  {
    title: 'Logic & Flow',
    nodes: [
      { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-yellow-500', description: 'Conditional branching' },
      { type: 'loop', label: 'Loop', icon: Repeat, color: 'bg-indigo-500', description: 'Iterate over data' },
      { type: 'delay', label: 'Delay', icon: Clock, color: 'bg-red-500', description: 'Wait for specified time' },
    ]
  },
  {
    title: 'Data',
    nodes: [
      { type: 'transform', label: 'Transform', icon: Shuffle, color: 'bg-teal-500', description: 'Transform data structure' },
    ]
  }
];

export const NodeSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = nodeCategories.map(category => ({
    ...category,
    nodes: category.nodes.filter(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0);

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-white">Node Library</h2>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>
      
      {filteredCategories.map((category) => (
        <div key={category.title} className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            {category.title}
          </h3>
          
          <div className="space-y-2">
            {category.nodes.map((node) => (
              <div
                key={node.type}
                className="group flex flex-col p-3 bg-gray-700 rounded-lg cursor-grab hover:bg-gray-600 transition-colors"
                draggable
                onDragStart={(event) => onDragStart(event, node.type)}
                title={node.description}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg ${node.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                    <node.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white font-medium block truncate">{node.label}</span>
                    <span className="text-xs text-gray-400 block truncate group-hover:text-gray-300 transition-colors">
                      {node.description}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {filteredCategories.length === 0 && searchTerm && (
        <div className="text-center text-gray-400 mt-8">
          <p className="text-sm">No nodes found</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-300 mb-2">
          💡 <strong>Pro Tips:</strong>
        </p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Drag nodes onto canvas</li>
          <li>• Connect with handles</li>
          <li>• Configure in inspector</li>
          <li>• Use search to find nodes</li>
        </ul>
      </div>
    </div>
  );
};
