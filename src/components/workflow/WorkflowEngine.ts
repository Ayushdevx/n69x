
import { Node, Edge } from '@xyflow/react';

export interface ExecutionContext {
  data: any;
  metadata: {
    nodeId: string;
    executionId: string;
    timestamp: Date;
    previousData?: any;
  };
}

export interface NodeExecutor {
  execute(context: ExecutionContext): Promise<any>;
}

export class WorkflowEngine {
  private nodeExecutors: Map<string, NodeExecutor> = new Map();
  private executionResults: Map<string, any> = new Map();
  private executionLog: Array<{id: string, message: string, type: 'info' | 'error' | 'success' | 'warning', timestamp: Date, nodeId?: string}> = [];

  constructor() {
    this.initializeExecutors();
  }

  private initializeExecutors() {
    // HTTP Request Node
    this.nodeExecutors.set('http', {
      execute: async (context) => {
        const { url, method = 'GET', headers = {}, body } = context.data.config || {};
        
        if (!url) {
          throw new Error('URL is required for HTTP request');
        }

        const startTime = Date.now();
        try {
          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
            body: method !== 'GET' ? JSON.stringify(body) : undefined
          });

          const responseData = await response.json();
          const executionTime = Date.now() - startTime;

          return {
            status: response.status,
            data: responseData,
            headers: Object.fromEntries(response.headers.entries()),
            executionTime,
            success: response.ok
          };
        } catch (error) {
          throw new Error(`HTTP request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    });

    // Email Node
    this.nodeExecutors.set('email', {
      execute: async (context) => {
        const { to, subject, body, from } = context.data.config || {};
        
        if (!to || !subject) {
          throw new Error('Email recipient and subject are required');
        }

        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
          sent: true,
          to,
          subject,
          messageId: `msg_${Date.now()}`,
          timestamp: new Date().toISOString(),
          success: true
        };
      }
    });

    // Database Node
    this.nodeExecutors.set('database', {
      execute: async (context) => {
        const { operation = 'SELECT', table, query, data } = context.data.config || {};
        
        if (!table) {
          throw new Error('Database table is required');
        }

        // Simulate database operation
        await new Promise(resolve => setTimeout(resolve, 200));

        switch (operation.toLowerCase()) {
          case 'select':
            return {
              rows: [{ id: 1, name: 'Sample Data', created_at: new Date().toISOString() }],
              count: 1,
              operation,
              table,
              success: true
            };
          case 'insert':
            return {
              id: Math.floor(Math.random() * 1000),
              affected_rows: 1,
              operation,
              table,
              success: true
            };
          case 'update':
            return {
              affected_rows: 1,
              operation,
              table,
              success: true
            };
          case 'delete':
            return {
              affected_rows: 1,
              operation,
              table,
              success: true
            };
          default:
            throw new Error(`Unsupported database operation: ${operation}`);
        }
      }
    });

    // Transform Node
    this.nodeExecutors.set('transform', {
      execute: async (context) => {
        const { script, mapping } = context.data.config || {};
        
        if (!script && !mapping) {
          throw new Error('Transform script or mapping is required');
        }

        try {
          // Simple transformation simulation
          let result = { ...context.data };
          
          if (mapping) {
            result = this.applyMapping(result, mapping);
          }
          
          if (script) {
            // Safe eval simulation (in real app, use a secure sandbox)
            result = { ...result, transformed: true, timestamp: new Date().toISOString() };
          }

          return {
            data: result,
            originalData: context.data,
            success: true
          };
        } catch (error) {
          throw new Error(`Transform failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    });

    // Condition Node
    this.nodeExecutors.set('condition', {
      execute: async (context) => {
        const { condition, field, operator = '==', value } = context.data.config || {};
        
        if (!condition && !field) {
          throw new Error('Condition or field is required');
        }

        try {
          let result = false;
          
          if (field && operator && value !== undefined) {
            const fieldValue = this.getNestedValue(context.data, field);
            result = this.evaluateCondition(fieldValue, operator, value);
          } else if (condition) {
            // Simple condition evaluation
            result = this.evaluateStringCondition(condition, context.data);
          }

          return {
            result,
            condition: condition || `${field} ${operator} ${value}`,
            data: context.data,
            success: true
          };
        } catch (error) {
          throw new Error(`Condition evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    });

    // Delay Node
    this.nodeExecutors.set('delay', {
      execute: async (context) => {
        const { delay = 1000 } = context.data.config || {};
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return {
          delayed: delay,
          data: context.data,
          success: true
        };
      }
    });

    // Loop Node
    this.nodeExecutors.set('loop', {
      execute: async (context) => {
        const { iterations = 1, data: loopData } = context.data.config || {};
        
        const results = [];
        for (let i = 0; i < iterations; i++) {
          results.push({
            iteration: i + 1,
            data: { ...context.data, loopIndex: i },
            timestamp: new Date().toISOString()
          });
        }
        
        return {
          iterations: results.length,
          results,
          success: true
        };
      }
    });
  }

  private applyMapping(data: any, mapping: any): any {
    const result: any = {};
    
    for (const [targetField, sourceField] of Object.entries(mapping)) {
      result[targetField] = this.getNestedValue(data, sourceField as string);
    }
    
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluateCondition(left: any, operator: string, right: any): boolean {
    switch (operator) {
      case '==': return left == right;
      case '===': return left === right;
      case '!=': return left != right;
      case '!==': return left !== right;
      case '>': return left > right;
      case '>=': return left >= right;
      case '<': return left < right;
      case '<=': return left <= right;
      case 'contains': return String(left).includes(String(right));
      case 'startsWith': return String(left).startsWith(String(right));
      case 'endsWith': return String(left).endsWith(String(right));
      default: return false;
    }
  }

  private evaluateStringCondition(condition: string, data: any): boolean {
    // Simple condition evaluation - in production, use a secure expression evaluator
    try {
      // Replace data references with actual values
      const processedCondition = condition.replace(/\$\{([^}]+)\}/g, (_, path) => {
        const value = this.getNestedValue(data, path);
        return typeof value === 'string' ? `"${value}"` : String(value);
      });
      
      // This is a simplified evaluation - use a proper expression parser in production
      return new Function('return ' + processedCondition)();
    } catch {
      return false;
    }
  }

  async executeNode(nodeId: string, nodeType: string, inputData: any, config: any = {}): Promise<any> {
    const executor = this.nodeExecutors.get(nodeType);
    
    if (!executor) {
      throw new Error(`No executor found for node type: ${nodeType}`);
    }

    const context: ExecutionContext = {
      data: { ...inputData, config },
      metadata: {
        nodeId,
        executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      }
    };

    const startTime = Date.now();
    
    try {
      this.addExecutionLog(`🚀 Executing node ${nodeId} (${nodeType})`, 'info', nodeId);
      
      const result = await executor.execute(context);
      const executionTime = Date.now() - startTime;
      
      const enrichedResult = {
        ...result,
        executionTime,
        nodeId,
        timestamp: new Date().toISOString()
      };
      
      this.executionResults.set(nodeId, enrichedResult);
      this.addExecutionLog(`✅ Node ${nodeId} executed successfully in ${executionTime}ms`, 'success', nodeId);
      
      return enrichedResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResult = {
        error: error instanceof Error ? error.message : String(error),
        nodeId,
        executionTime,
        timestamp: new Date().toISOString(),
        success: false
      };
      
      this.executionResults.set(nodeId, errorResult);
      this.addExecutionLog(`❌ Node ${nodeId} failed: ${errorResult.error}`, 'error', nodeId);
      
      throw error;
    }
  }

  async executeWorkflow(nodes: Node[], edges: Edge[], startNodeId?: string): Promise<Map<string, any>> {
    this.executionResults.clear();
    this.addExecutionLog('🎯 Starting workflow execution', 'info');

    try {
      // Find start nodes (nodes with no incoming edges or specified start node)
      const startNodes = startNodeId 
        ? nodes.filter(node => node.id === startNodeId)
        : nodes.filter(node => !edges.some(edge => edge.target === node.id));

      if (startNodes.length === 0) {
        throw new Error('No start nodes found');
      }

      // Execute nodes in topological order
      for (const startNode of startNodes) {
        await this.executeNodeChain(startNode, nodes, edges, {});
      }

      this.addExecutionLog(`🎉 Workflow execution completed successfully`, 'success');
      return this.executionResults;
    } catch (error) {
      this.addExecutionLog(`💥 Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  }

  private async executeNodeChain(currentNode: Node, nodes: Node[], edges: Edge[], previousData: any): Promise<any> {
    try {
      // Execute current node
      const result = await this.executeNode(
        currentNode.id,
        currentNode.type || 'action',
        previousData,
        currentNode.data?.config
      );

      // Find next nodes
      const outgoingEdges = edges.filter(edge => edge.source === currentNode.id);
      
      // Execute next nodes
      for (const edge of outgoingEdges) {
        const nextNode = nodes.find(node => node.id === edge.target);
        if (nextNode) {
          await this.executeNodeChain(nextNode, nodes, edges, result);
        }
      }

      return result;
    } catch (error) {
      console.error(`Error executing node ${currentNode.id}:`, error);
      throw error;
    }
  }

  private addExecutionLog(message: string, type: 'info' | 'error' | 'success' | 'warning', nodeId?: string) {
    this.executionLog.push({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      timestamp: new Date(),
      nodeId
    });
  }

  getExecutionResults(): Map<string, any> {
    return this.executionResults;
  }

  getExecutionLog() {
    return this.executionLog;
  }

  clearExecutionData() {
    this.executionResults.clear();
    this.executionLog.length = 0;
  }
}

export const workflowEngine = new WorkflowEngine();
