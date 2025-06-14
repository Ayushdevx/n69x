
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, Zap, Globe, Database, Mail } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  nodes: any[];
  edges: any[];
  tags: string[];
}

const templates: Template[] = [
  {
    id: 'email-notification',
    name: 'Email Notification Workflow',
    description: 'Send automated email notifications when specific conditions are met',
    category: 'Communication',
    icon: Mail,
    tags: ['email', 'notification', 'automation'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 50, y: 100 },
        data: { label: 'Start Process', config: {}, status: 'idle' }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 100 },
        data: { label: 'Check Criteria', config: { condition: 'data.priority === "high"' }, status: 'idle' }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 450, y: 50 },
        data: { label: 'Send Alert Email', config: { to: 'admin@company.com', subject: 'High Priority Alert' }, status: 'idle' }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2', source: 'condition-1', target: 'email-1', sourceHandle: 'true' }
    ]
  },
  {
    id: 'data-processing',
    name: 'Data Processing Pipeline',
    description: 'Fetch, transform, and store data from external APIs',
    category: 'Data',
    icon: Database,
    tags: ['api', 'transform', 'database'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 50, y: 100 },
        data: { label: 'Scheduled Trigger', config: {}, status: 'idle' }
      },
      {
        id: 'http-1',
        type: 'http',
        position: { x: 250, y: 100 },
        data: { label: 'Fetch API Data', config: { method: 'GET', url: 'https://api.example.com/data' }, status: 'idle' }
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 450, y: 100 },
        data: { label: 'Process Data', config: { script: 'return {...data, processed: true}' }, status: 'idle' }
      },
      {
        id: 'database-1',
        type: 'database',
        position: { x: 650, y: 100 },
        data: { label: 'Store Results', config: { operation: 'INSERT', table: 'processed_data' }, status: 'idle' }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'http-1' },
      { id: 'e2', source: 'http-1', target: 'transform-1' },
      { id: 'e3', source: 'transform-1', target: 'database-1' }
    ]
  },
  {
    id: 'webhook-processor',
    name: 'Webhook Event Processor',
    description: 'Process incoming webhook events with conditional logic',
    category: 'Integration',
    icon: Globe,
    tags: ['webhook', 'event', 'processing'],
    nodes: [
      {
        id: 'webhook-1',
        type: 'webhook',
        position: { x: 50, y: 100 },
        data: { label: 'Webhook Receiver', config: { path: '/webhook/events' }, status: 'idle' }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 100 },
        data: { label: 'Event Type Check', config: { condition: 'data.event_type === "user_signup"' }, status: 'idle' }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 450, y: 50 },
        data: { label: 'Welcome Email', config: { to: '{{data.user_email}}', subject: 'Welcome!' }, status: 'idle' }
      },
      {
        id: 'database-1',
        type: 'database',
        position: { x: 450, y: 150 },
        data: { label: 'Log Event', config: { operation: 'INSERT', table: 'event_log' }, status: 'idle' }
      }
    ],
    edges: [
      { id: 'e1', source: 'webhook-1', target: 'condition-1' },
      { id: 'e2', source: 'condition-1', target: 'email-1', sourceHandle: 'true' },
      { id: 'e3', source: 'condition-1', target: 'database-1', sourceHandle: 'false' }
    ]
  }
];

interface WorkflowTemplatesProps {
  onApplyTemplate: (template: Template) => void;
}

export const WorkflowTemplates = ({ onApplyTemplate }: WorkflowTemplatesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
          <FileText className="w-4 h-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Workflow Templates</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 
                    "bg-blue-600 hover:bg-blue-700" : 
                    "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <div key={template.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <template.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-300 mb-3">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{template.nodes.length} nodes</span>
                        <Button
                          size="sm"
                          onClick={() => onApplyTemplate(template)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
