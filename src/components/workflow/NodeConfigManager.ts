
export interface NodeConfig {
  // Common properties
  enabled?: boolean;
  timeout?: number;
  retryAttempts?: number;
  
  // HTTP Node
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  
  // Email Node
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  template?: string;
  attachments?: string[];
  
  // Database Node
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table?: string;
  query?: string;
  data?: any;
  connection?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  
  // Transform Node
  script?: string;
  mapping?: Record<string, string>;
  outputFormat?: 'json' | 'xml' | 'csv';
  
  // Condition Node
  condition?: string;
  field?: string;
  operator?: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
  value?: any;
  
  // Delay Node
  delay?: number;
  unit?: 'ms' | 's' | 'm' | 'h';
  
  // Loop Node
  iterations?: number;
  breakCondition?: string;
  
  // Zapier Node
  zapHookUrl?: string;
  zapName?: string;
  
  // Slack Node
  channel?: string;
  token?: string;
  message?: string;
  
  // Google Sheets Node
  spreadsheetId?: string;
  sheetName?: string;
  range?: string;
  apiKey?: string;
  
  // AI Node
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  
  // Filter Node
  filterType?: 'include' | 'exclude';
  criteria?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  
  // Schedule Node
  schedule?: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  
  // Webhook Node
  webhookUrl?: string;
  secret?: string;
  events?: string[];
}

export class NodeConfigManager {
  private static defaultConfigs: Record<string, Partial<NodeConfig>> = {
    trigger: {
      enabled: true,
      timeout: 5000
    },
    http: {
      method: 'GET',
      timeout: 30000,
      retryAttempts: 3,
      headers: { 'Content-Type': 'application/json' }
    },
    email: {
      timeout: 15000,
      retryAttempts: 2
    },
    database: {
      operation: 'SELECT',
      timeout: 30000,
      retryAttempts: 1
    },
    transform: {
      outputFormat: 'json',
      timeout: 10000
    },
    condition: {
      operator: '==',
      timeout: 1000
    },
    delay: {
      delay: 1000,
      unit: 'ms'
    },
    loop: {
      iterations: 3,
      timeout: 60000
    },
    zapier: {
      timeout: 30000,
      retryAttempts: 2
    },
    slack: {
      timeout: 10000,
      retryAttempts: 2
    },
    sheets: {
      timeout: 20000,
      retryAttempts: 2
    },
    ai: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      timeout: 30000
    },
    filter: {
      filterType: 'include',
      timeout: 5000
    },
    schedule: {
      timezone: 'UTC'
    },
    webhook: {
      timeout: 10000
    }
  };

  public static getDefaultConfig(nodeType: string): Partial<NodeConfig> {
    return { ...this.defaultConfigs[nodeType] } || {};
  }

  public static validateConfig(nodeType: string, config: NodeConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (nodeType) {
      case 'http':
        if (!config.url) errors.push('URL is required');
        if (config.url && !this.isValidUrl(config.url)) errors.push('Invalid URL format');
        break;
        
      case 'email':
        if (!config.to) errors.push('Recipient email is required');
        if (config.to && !this.isValidEmail(config.to)) errors.push('Invalid email format');
        if (!config.subject) errors.push('Email subject is required');
        break;
        
      case 'database':
        if (!config.table) errors.push('Table name is required');
        if (config.operation === 'INSERT' && !config.data) errors.push('Data is required for INSERT operation');
        break;
        
      case 'condition':
        if (!config.condition && !config.field) errors.push('Condition or field is required');
        if (config.field && config.value === undefined) errors.push('Value is required when using field comparison');
        break;
        
      case 'delay':
        if (config.delay === undefined || config.delay < 0) errors.push('Delay must be a positive number');
        break;
        
      case 'loop':
        if (config.iterations === undefined || config.iterations < 1) errors.push('Iterations must be at least 1');
        break;
        
      case 'zapier':
        if (!config.zapHookUrl) errors.push('Zapier webhook URL is required');
        break;
        
      case 'slack':
        if (!config.channel) errors.push('Slack channel is required');
        if (!config.token) errors.push('Slack token is required');
        break;
        
      case 'sheets':
        if (!config.spreadsheetId) errors.push('Spreadsheet ID is required');
        if (!config.apiKey) errors.push('API key is required');
        break;
        
      case 'ai':
        if (!config.prompt) errors.push('AI prompt is required');
        break;
        
      case 'schedule':
        if (!config.schedule) errors.push('Schedule expression is required');
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public static mergeConfigs(defaultConfig: Partial<NodeConfig>, userConfig: Partial<NodeConfig>): NodeConfig {
    return { ...defaultConfig, ...userConfig };
  }

  public static exportConfig(config: NodeConfig): string {
    return JSON.stringify(config, null, 2);
  }

  public static importConfig(configString: string): NodeConfig | null {
    try {
      return JSON.parse(configString);
    } catch {
      return null;
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static getConfigSchema(nodeType: string): Record<string, any> {
    const schemas: Record<string, Record<string, any>> = {
      http: {
        url: { type: 'string', required: true, label: 'URL' },
        method: { type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET', label: 'Method' },
        headers: { type: 'object', label: 'Headers' },
        body: { type: 'object', label: 'Request Body' },
        timeout: { type: 'number', default: 30000, label: 'Timeout (ms)' },
        retryAttempts: { type: 'number', default: 3, label: 'Retry Attempts' }
      },
      email: {
        to: { type: 'string', required: true, label: 'To' },
        cc: { type: 'string', label: 'CC' },
        bcc: { type: 'string', label: 'BCC' },
        subject: { type: 'string', required: true, label: 'Subject' },
        body: { type: 'text', label: 'Message Body' },
        template: { type: 'string', label: 'Template' }
      },
      database: {
        operation: { type: 'select', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], default: 'SELECT', label: 'Operation' },
        table: { type: 'string', required: true, label: 'Table' },
        query: { type: 'text', label: 'Custom Query' },
        data: { type: 'object', label: 'Data' }
      },
      transform: {
        script: { type: 'code', language: 'javascript', label: 'Transform Script' },
        mapping: { type: 'object', label: 'Field Mapping' },
        outputFormat: { type: 'select', options: ['json', 'xml', 'csv'], default: 'json', label: 'Output Format' }
      },
      condition: {
        condition: { type: 'text', label: 'Condition Expression' },
        field: { type: 'string', label: 'Field Path' },
        operator: { type: 'select', options: ['==', '!=', '>', '<', '>=', '<=', 'contains', 'startsWith', 'endsWith'], default: '==', label: 'Operator' },
        value: { type: 'string', label: 'Value' }
      },
      delay: {
        delay: { type: 'number', required: true, default: 1000, label: 'Delay' },
        unit: { type: 'select', options: ['ms', 's', 'm', 'h'], default: 'ms', label: 'Unit' }
      }
    };

    return schemas[nodeType] || {};
  }
}
