
export interface WorkflowVariable {
  name: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  scope: 'global' | 'node' | 'execution';
  readonly?: boolean;
  encrypted?: boolean;
}

export interface VariableScope {
  global: Map<string, WorkflowVariable>;
  node: Map<string, Map<string, WorkflowVariable>>;
  execution: Map<string, WorkflowVariable>;
}

export class VariableManager {
  private variables: VariableScope = {
    global: new Map(),
    node: new Map(),
    execution: new Map()
  };

  private listeners: Array<(variable: WorkflowVariable, action: 'set' | 'delete') => void> = [];

  public setVariable(variable: WorkflowVariable, nodeId?: string): void {
    switch (variable.scope) {
      case 'global':
        this.variables.global.set(variable.name, variable);
        break;
      case 'node':
        if (!nodeId) throw new Error('Node ID required for node-scoped variables');
        if (!this.variables.node.has(nodeId)) {
          this.variables.node.set(nodeId, new Map());
        }
        this.variables.node.get(nodeId)!.set(variable.name, variable);
        break;
      case 'execution':
        this.variables.execution.set(variable.name, variable);
        break;
    }

    this.notifyListeners(variable, 'set');
  }

  public getVariable(name: string, scope: 'global' | 'node' | 'execution', nodeId?: string): WorkflowVariable | undefined {
    switch (scope) {
      case 'global':
        return this.variables.global.get(name);
      case 'node':
        if (!nodeId) return undefined;
        return this.variables.node.get(nodeId)?.get(name);
      case 'execution':
        return this.variables.execution.get(name);
    }
  }

  public getAllVariables(nodeId?: string): WorkflowVariable[] {
    const variables: WorkflowVariable[] = [];
    
    // Add global variables
    variables.push(...Array.from(this.variables.global.values()));
    
    // Add execution-scoped variables
    variables.push(...Array.from(this.variables.execution.values()));
    
    // Add node-scoped variables if nodeId provided
    if (nodeId && this.variables.node.has(nodeId)) {
      variables.push(...Array.from(this.variables.node.get(nodeId)!.values()));
    }
    
    return variables;
  }

  public resolveVariables(text: string, nodeId?: string): string {
    const variables = this.getAllVariables(nodeId);
    let resolved = text;
    
    // Replace variable references like ${variableName} or {{variableName}}
    const patterns = [
      /\$\{([^}]+)\}/g,  // ${variable}
      /\{\{([^}]+)\}\}/g  // {{variable}}
    ];
    
    patterns.forEach(pattern => {
      resolved = resolved.replace(pattern, (match, varName) => {
        const variable = variables.find(v => v.name === varName.trim());
        if (variable) {
          return this.formatValue(variable.value, variable.type);
        }
        return match; // Keep original if variable not found
      });
    });
    
    return resolved;
  }

  public evaluateExpression(expression: string, nodeId?: string): any {
    const variables = this.getAllVariables(nodeId);
    
    // Create a safe context with variables
    const context: Record<string, any> = {};
    variables.forEach(variable => {
      context[variable.name] = variable.value;
    });
    
    try {
      // Simple expression evaluation (in production, use a secure expression evaluator)
      const func = new Function(...Object.keys(context), `return ${expression}`);
      return func(...Object.values(context));
    } catch (error) {
      console.error('Expression evaluation error:', error);
      return null;
    }
  }

  public deleteVariable(name: string, scope: 'global' | 'node' | 'execution', nodeId?: string): boolean {
    let deleted = false;
    let variable: WorkflowVariable | undefined;

    switch (scope) {
      case 'global':
        variable = this.variables.global.get(name);
        deleted = this.variables.global.delete(name);
        break;
      case 'node':
        if (nodeId && this.variables.node.has(nodeId)) {
          const nodeVars = this.variables.node.get(nodeId)!;
          variable = nodeVars.get(name);
          deleted = nodeVars.delete(name);
        }
        break;
      case 'execution':
        variable = this.variables.execution.get(name);
        deleted = this.variables.execution.delete(name);
        break;
    }

    if (deleted && variable) {
      this.notifyListeners(variable, 'delete');
    }

    return deleted;
  }

  public clearVariables(scope?: 'global' | 'node' | 'execution', nodeId?: string): void {
    if (!scope) {
      // Clear all
      this.variables.global.clear();
      this.variables.node.clear();
      this.variables.execution.clear();
    } else {
      switch (scope) {
        case 'global':
          this.variables.global.clear();
          break;
        case 'node':
          if (nodeId && this.variables.node.has(nodeId)) {
            this.variables.node.get(nodeId)!.clear();
          } else {
            this.variables.node.clear();
          }
          break;
        case 'execution':
          this.variables.execution.clear();
          break;
      }
    }
  }

  public importVariables(variables: WorkflowVariable[], nodeId?: string): void {
    variables.forEach(variable => {
      this.setVariable(variable, nodeId);
    });
  }

  public exportVariables(scope?: 'global' | 'node' | 'execution', nodeId?: string): WorkflowVariable[] {
    if (!scope) {
      return this.getAllVariables(nodeId);
    }

    switch (scope) {
      case 'global':
        return Array.from(this.variables.global.values());
      case 'node':
        if (nodeId && this.variables.node.has(nodeId)) {
          return Array.from(this.variables.node.get(nodeId)!.values());
        }
        return [];
      case 'execution':
        return Array.from(this.variables.execution.values());
    }
  }

  private formatValue(value: any, type: string): string {
    switch (type) {
      case 'object':
      case 'array':
        return JSON.stringify(value);
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return String(value);
      default:
        return String(value);
    }
  }

  private notifyListeners(variable: WorkflowVariable, action: 'set' | 'delete'): void {
    this.listeners.forEach(listener => listener(variable, action));
  }

  public addListener(listener: (variable: WorkflowVariable, action: 'set' | 'delete') => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (variable: WorkflowVariable, action: 'set' | 'delete') => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public getVariableStats(): {
    globalCount: number;
    nodeCount: number;
    executionCount: number;
    totalSize: number;
    encryptedCount: number;
  } {
    const globalCount = this.variables.global.size;
    const nodeCount = Array.from(this.variables.node.values())
      .reduce((sum, nodeVars) => sum + nodeVars.size, 0);
    const executionCount = this.variables.execution.size;
    
    const allVars = this.getAllVariables();
    const totalSize = JSON.stringify(allVars).length;
    const encryptedCount = allVars.filter(v => v.encrypted).length;

    return {
      globalCount,
      nodeCount,
      executionCount,
      totalSize,
      encryptedCount
    };
  }
}

export const variableManager = new VariableManager();
