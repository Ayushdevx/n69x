
import { Node, Edge } from '@xyflow/react';
import { workflowEngine } from './WorkflowEngine';

export interface ExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export interface ExecutionContext {
  executionId: string;
  workflowName: string;
  startTime: Date;
  nodes: Map<string, ExecutionState>;
  totalNodes: number;
  completedNodes: number;
  isParallel: boolean;
  timeout: number;
}

export class ExecutionManager {
  private currentExecution: ExecutionContext | null = null;
  private executionHistory: ExecutionContext[] = [];
  private listeners: Array<(context: ExecutionContext) => void> = [];

  public async executeWorkflow(
    nodes: Node[], 
    edges: Edge[], 
    options: {
      name?: string;
      isParallel?: boolean;
      timeout?: number;
      startNodeId?: string;
    } = {}
  ): Promise<Map<string, any>> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentExecution = {
      executionId,
      workflowName: options.name || 'Unnamed Workflow',
      startTime: new Date(),
      nodes: new Map(),
      totalNodes: nodes.length,
      completedNodes: 0,
      isParallel: options.isParallel || false,
      timeout: options.timeout || 300000 // 5 minutes default
    };

    // Initialize all nodes as pending
    nodes.forEach(node => {
      this.currentExecution!.nodes.set(node.id, {
        nodeId: node.id,
        status: 'pending'
      });
    });

    this.notifyListeners();

    try {
      const results = await workflowEngine.executeWorkflow(nodes, edges, options.startNodeId);
      
      // Update final execution state
      this.currentExecution.nodes.forEach((state, nodeId) => {
        if (results.has(nodeId)) {
          state.status = 'success';
          state.result = results.get(nodeId);
          state.endTime = new Date();
        }
      });

      this.executionHistory.push(this.currentExecution);
      this.notifyListeners();

      return results;
    } catch (error) {
      if (this.currentExecution) {
        this.currentExecution.nodes.forEach(state => {
          if (state.status === 'running') {
            state.status = 'error';
            state.error = error instanceof Error ? error.message : 'Unknown error';
            state.endTime = new Date();
          }
        });
        this.executionHistory.push(this.currentExecution);
        this.notifyListeners();
      }
      throw error;
    } finally {
      this.currentExecution = null;
    }
  }

  public updateNodeState(nodeId: string, updates: Partial<ExecutionState>) {
    if (this.currentExecution && this.currentExecution.nodes.has(nodeId)) {
      const currentState = this.currentExecution.nodes.get(nodeId)!;
      this.currentExecution.nodes.set(nodeId, { ...currentState, ...updates });
      
      if (updates.status === 'success' || updates.status === 'error' || updates.status === 'skipped') {
        this.currentExecution.completedNodes++;
      }
      
      this.notifyListeners();
    }
  }

  public getCurrentExecution(): ExecutionContext | null {
    return this.currentExecution;
  }

  public getExecutionHistory(): ExecutionContext[] {
    return this.executionHistory;
  }

  public addListener(listener: (context: ExecutionContext) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (context: ExecutionContext) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    if (this.currentExecution) {
      this.listeners.forEach(listener => listener(this.currentExecution!));
    }
  }

  public getExecutionStats(executionId?: string): {
    totalExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    mostFailedNodes: Array<{ nodeId: string; failureCount: number }>;
  } {
    const executions = executionId 
      ? this.executionHistory.filter(e => e.executionId === executionId)
      : this.executionHistory;

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => 
      Array.from(e.nodes.values()).every(n => n.status === 'success' || n.status === 'skipped')
    );

    const executionTimes = executions
      .filter(e => e.startTime)
      .map(e => {
        const endTimes = Array.from(e.nodes.values())
          .map(n => n.endTime)
          .filter(Boolean) as Date[];
        const maxEndTime = Math.max(...endTimes.map(d => d.getTime()));
        return maxEndTime - e.startTime.getTime();
      });

    const averageExecutionTime = executionTimes.length > 0 
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;

    const successRate = totalExecutions > 0 ? successfulExecutions.length / totalExecutions : 0;

    // Calculate most failed nodes
    const failureCounts = new Map<string, number>();
    executions.forEach(exec => {
      exec.nodes.forEach(node => {
        if (node.status === 'error') {
          failureCounts.set(node.nodeId, (failureCounts.get(node.nodeId) || 0) + 1);
        }
      });
    });

    const mostFailedNodes = Array.from(failureCounts.entries())
      .map(([nodeId, failureCount]) => ({ nodeId, failureCount }))
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 5);

    return {
      totalExecutions,
      averageExecutionTime,
      successRate,
      mostFailedNodes
    };
  }

  public clearHistory() {
    this.executionHistory = [];
  }
}

export const executionManager = new ExecutionManager();
