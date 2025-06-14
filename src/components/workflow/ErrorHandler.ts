
export interface WorkflowError {
  id: string;
  nodeId: string;
  type: 'validation' | 'execution' | 'timeout' | 'network' | 'auth' | 'data';
  message: string;
  timestamp: Date;
  stack?: string;
  context?: any;
  retryCount: number;
  recoverable: boolean;
}

export interface ErrorHandlingStrategy {
  maxRetries: number;
  retryDelay: number;
  fallbackAction: 'stop' | 'skip' | 'retry' | 'fallback';
  fallbackNodeId?: string;
  notifyOnError: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class WorkflowErrorHandler {
  private errors: Map<string, WorkflowError[]> = new Map();
  private strategies: Map<string, ErrorHandlingStrategy> = new Map();
  private listeners: Array<(error: WorkflowError) => void> = [];

  public setErrorStrategy(nodeId: string, strategy: ErrorHandlingStrategy): void {
    this.strategies.set(nodeId, strategy);
  }

  public async handleError(
    nodeId: string, 
    error: Error, 
    context?: any
  ): Promise<{ shouldRetry: boolean; shouldStop: boolean; fallbackNodeId?: string }> {
    const workflowError: WorkflowError = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nodeId,
      type: this.categorizeError(error),
      message: error.message,
      timestamp: new Date(),
      stack: error.stack,
      context,
      retryCount: this.getRetryCount(nodeId),
      recoverable: this.isRecoverable(error)
    };

    this.addError(nodeId, workflowError);
    this.notifyListeners(workflowError);

    const strategy = this.strategies.get(nodeId) || this.getDefaultStrategy();
    
    if (workflowError.retryCount < strategy.maxRetries && workflowError.recoverable) {
      await this.delay(strategy.retryDelay * Math.pow(2, workflowError.retryCount)); // Exponential backoff
      return { shouldRetry: true, shouldStop: false };
    }

    switch (strategy.fallbackAction) {
      case 'stop':
        return { shouldRetry: false, shouldStop: true };
      case 'skip':
        return { shouldRetry: false, shouldStop: false };
      case 'fallback':
        return { 
          shouldRetry: false, 
          shouldStop: false, 
          fallbackNodeId: strategy.fallbackNodeId 
        };
      default:
        return { shouldRetry: false, shouldStop: true };
    }
  }

  private categorizeError(error: Error): WorkflowError['type'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('time out')) return 'timeout';
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('unauthorized') || message.includes('auth')) return 'auth';
    if (message.includes('validation') || message.includes('invalid')) return 'validation';
    if (message.includes('data') || message.includes('parse')) return 'data';
    
    return 'execution';
  }

  private isRecoverable(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Network errors are often recoverable
    if (message.includes('network') || message.includes('timeout')) return true;
    
    // Validation errors are usually not recoverable
    if (message.includes('validation') || message.includes('invalid')) return false;
    
    // Auth errors might be recoverable if tokens can be refreshed
    if (message.includes('unauthorized')) return true;
    
    return true; // Default to recoverable
  }

  private getRetryCount(nodeId: string): number {
    const nodeErrors = this.errors.get(nodeId) || [];
    return nodeErrors.length;
  }

  private addError(nodeId: string, error: WorkflowError): void {
    const nodeErrors = this.errors.get(nodeId) || [];
    nodeErrors.push(error);
    this.errors.set(nodeId, nodeErrors);
  }

  private getDefaultStrategy(): ErrorHandlingStrategy {
    return {
      maxRetries: 3,
      retryDelay: 1000,
      fallbackAction: 'stop',
      notifyOnError: true,
      logLevel: 'error'
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private notifyListeners(error: WorkflowError): void {
    this.listeners.forEach(listener => listener(error));
  }

  public addErrorListener(listener: (error: WorkflowError) => void): void {
    this.listeners.push(listener);
  }

  public removeErrorListener(listener: (error: WorkflowError) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public getErrors(nodeId?: string): WorkflowError[] {
    if (nodeId) {
      return this.errors.get(nodeId) || [];
    }
    return Array.from(this.errors.values()).flat();
  }

  public clearErrors(nodeId?: string): void {
    if (nodeId) {
      this.errors.delete(nodeId);
    } else {
      this.errors.clear();
    }
  }

  public getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByNode: Record<string, number>;
    recoveryRate: number;
  } {
    const allErrors = this.getErrors();
    
    const errorsByType: Record<string, number> = {};
    const errorsByNode: Record<string, number> = {};
    let recoveredErrors = 0;

    allErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsByNode[error.nodeId] = (errorsByNode[error.nodeId] || 0) + 1;
      
      if (error.recoverable && error.retryCount > 0) {
        recoveredErrors++;
      }
    });

    return {
      totalErrors: allErrors.length,
      errorsByType,
      errorsByNode,
      recoveryRate: allErrors.length > 0 ? recoveredErrors / allErrors.length : 0
    };
  }
}

export const errorHandler = new WorkflowErrorHandler();
