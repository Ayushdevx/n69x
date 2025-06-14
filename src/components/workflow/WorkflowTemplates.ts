
import { Node, Edge } from '@xyflow/react';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodes: Node[];
  edges: Edge[];
  thumbnail?: string;
  author?: string;
  version?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'data-processing-pipeline',
    name: 'Data Processing Pipeline',
    description: 'A comprehensive data processing workflow with validation, transformation, and storage',
    category: 'Data Processing',
    tags: ['data', 'processing', 'validation', 'transformation'],
    author: 'SureFlow Team',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    nodes: [
      {
        id: 'webhook-1',
        type: 'webhook',
        position: { x: 100, y: 100 },
        data: {
          label: 'Data Webhook',
          config: { webhookUrl: '/api/data-webhook' },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'filter-1',
        type: 'filter',
        position: { x: 300, y: 100 },
        data: {
          label: 'Validate Data',
          config: { 
            filterType: 'include',
            criteria: [{ field: 'email', operator: 'contains', value: '@' }]
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 500, y: 100 },
        data: {
          label: 'Clean & Transform',
          config: { 
            script: 'return { ...data, processed_at: new Date().toISOString() }',
            outputFormat: 'json'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'database-1',
        type: 'database',
        position: { x: 700, y: 100 },
        data: {
          label: 'Store in Database',
          config: { 
            operation: 'INSERT',
            table: 'processed_data'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'slack-1',
        type: 'slack',
        position: { x: 900, y: 100 },
        data: {
          label: 'Notify Team',
          config: { 
            channel: 'data-team',
            message: 'New data processed successfully!'
          },
          status: 'idle',
          enabled: true
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'webhook-1', target: 'filter-1' },
      { id: 'e2', source: 'filter-1', target: 'transform-1' },
      { id: 'e3', source: 'transform-1', target: 'database-1' },
      { id: 'e4', source: 'database-1', target: 'slack-1' }
    ]
  },
  {
    id: 'customer-onboarding',
    name: 'Customer Onboarding Flow',
    description: 'Automated customer onboarding with email sequences and account setup',
    category: 'Customer Management',
    tags: ['customer', 'onboarding', 'email', 'automation'],
    author: 'SureFlow Team',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'New Customer Signup',
          config: {},
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 300, y: 100 },
        data: {
          label: 'Welcome Email',
          config: { 
            subject: 'Welcome to our platform!',
            template: 'welcome-template'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 500, y: 100 },
        data: {
          label: 'Wait 24 Hours',
          config: { delay: 24, unit: 'h' },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 700, y: 100 },
        data: {
          label: 'Check Profile Complete',
          config: { 
            field: 'profile.completed',
            operator: '==',
            value: true
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 900, y: 50 },
        data: {
          label: 'Setup Complete',
          config: { 
            subject: 'Your setup is complete!',
            template: 'setup-complete-template'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'email-3',
        type: 'email',
        position: { x: 900, y: 150 },
        data: {
          label: 'Complete Your Profile',
          config: { 
            subject: 'Complete your profile to get started',
            template: 'profile-reminder-template'
          },
          status: 'idle',
          enabled: true
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'email-1' },
      { id: 'e2', source: 'email-1', target: 'delay-1' },
      { id: 'e3', source: 'delay-1', target: 'condition-1' },
      { id: 'e4', source: 'condition-1', target: 'email-2', sourceHandle: 'true' },
      { id: 'e5', source: 'condition-1', target: 'email-3', sourceHandle: 'false' }
    ]
  },
  {
    id: 'ai-content-generator',
    name: 'AI Content Generation Pipeline',
    description: 'Generate, review, and publish content using AI with human approval',
    category: 'Content Management',
    tags: ['ai', 'content', 'generation', 'approval'],
    author: 'SureFlow Team',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    nodes: [
      {
        id: 'schedule-1',
        type: 'schedule',
        position: { x: 100, y: 100 },
        data: {
          label: 'Daily Content Schedule',
          config: { 
            schedule: '0 9 * * *',
            timezone: 'UTC'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 300, y: 100 },
        data: {
          label: 'Generate Content',
          config: { 
            model: 'gpt-4',
            prompt: 'Generate a blog post about latest tech trends',
            maxTokens: 2000
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 500, y: 100 },
        data: {
          label: 'Format Content',
          config: { 
            script: 'return { title: data.title, content: data.content, metadata: { generated_at: new Date() } }',
            outputFormat: 'json'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 700, y: 100 },
        data: {
          label: 'Send for Review',
          config: { 
            to: 'editor@company.com',
            subject: 'New AI-generated content for review'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'sheets-1',
        type: 'sheets',
        position: { x: 900, y: 100 },
        data: {
          label: 'Log to Content Sheet',
          config: { 
            sheetName: 'Content Pipeline',
            range: 'A:D'
          },
          status: 'idle',
          enabled: true
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'schedule-1', target: 'ai-1' },
      { id: 'e2', source: 'ai-1', target: 'transform-1' },
      { id: 'e3', source: 'transform-1', target: 'email-1' },
      { id: 'e4', source: 'email-1', target: 'sheets-1' }
    ]
  },
  {
    id: 'monitoring-alerts',
    name: 'System Monitoring & Alerts',
    description: 'Monitor system health and send alerts when issues are detected',
    category: 'Monitoring',
    tags: ['monitoring', 'alerts', 'system', 'health'],
    author: 'SureFlow Team',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    nodes: [
      {
        id: 'schedule-1',
        type: 'schedule',
        position: { x: 100, y: 100 },
        data: {
          label: 'Health Check Schedule',
          config: { 
            schedule: '*/5 * * * *',
            timezone: 'UTC'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'http-1',
        type: 'http',
        position: { x: 300, y: 100 },
        data: {
          label: 'Check API Health',
          config: { 
            url: 'https://api.example.com/health',
            method: 'GET',
            timeout: 10000
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 500, y: 100 },
        data: {
          label: 'Check Status Code',
          config: { 
            field: 'status',
            operator: '!=',
            value: 200
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'slack-1',
        type: 'slack',
        position: { x: 700, y: 50 },
        data: {
          label: 'Alert DevOps',
          config: { 
            channel: 'alerts',
            message: '🚨 API health check failed!'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 700, y: 150 },
        data: {
          label: 'Email On-Call',
          config: { 
            to: 'oncall@company.com',
            subject: 'URGENT: API Health Check Failed'
          },
          status: 'idle',
          enabled: true
        }
      },
      {
        id: 'database-1',
        type: 'database',
        position: { x: 700, y: 250 },
        data: {
          label: 'Log Success',
          config: { 
            operation: 'INSERT',
            table: 'health_checks'
          },
          status: 'idle',
          enabled: true
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'schedule-1', target: 'http-1' },
      { id: 'e2', source: 'http-1', target: 'condition-1' },
      { id: 'e3', source: 'condition-1', target: 'slack-1', sourceHandle: 'true' },
      { id: 'e4', source: 'condition-1', target: 'email-1', sourceHandle: 'true' },
      { id: 'e5', source: 'condition-1', target: 'database-1', sourceHandle: 'false' }
    ]
  }
];

export class WorkflowTemplateManager {
  public static getTemplates(): WorkflowTemplate[] {
    return workflowTemplates;
  }

  public static getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return workflowTemplates.filter(template => template.category === category);
  }

  public static getTemplatesByTag(tag: string): WorkflowTemplate[] {
    return workflowTemplates.filter(template => template.tags.includes(tag));
  }

  public static searchTemplates(query: string): WorkflowTemplate[] {
    const lowerQuery = query.toLowerCase();
    return workflowTemplates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  public static getTemplate(id: string): WorkflowTemplate | undefined {
    return workflowTemplates.find(template => template.id === id);
  }

  public static exportTemplate(template: WorkflowTemplate): string {
    return JSON.stringify(template, null, 2);
  }

  public static importTemplate(templateString: string): WorkflowTemplate | null {
    try {
      const template = JSON.parse(templateString);
      // Validate template structure
      if (template.id && template.name && template.nodes && template.edges) {
        return template;
      }
      return null;
    } catch {
      return null;
    }
  }

  public static createCustomTemplate(
    name: string,
    description: string,
    category: string,
    nodes: Node[],
    edges: Edge[],
    tags: string[] = []
  ): WorkflowTemplate {
    return {
      id: `custom-${Date.now()}`,
      name,
      description,
      category,
      tags,
      nodes,
      edges,
      author: 'User',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public static getCategories(): string[] {
    const categories = new Set(workflowTemplates.map(template => template.category));
    return Array.from(categories).sort();
  }

  public static getAllTags(): string[] {
    const tags = new Set(workflowTemplates.flatMap(template => template.tags));
    return Array.from(tags).sort();
  }
}
