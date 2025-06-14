
import { Node, Edge } from '@xyflow/react';
import { workflowEngine } from './WorkflowEngine';

export interface ParallelBatch {
  id: string;
  nodes: Node[];
  dependencies: string[];
  completed: boolean;
  results: Map<string, any>;
  errors: Map<string, Error>;
}

export class ParallelExecutor {
  private batches: Map<string, ParallelBatch> = new Map();
  private maxConcurrency: number = 5;
  private currentlyExecuting: Set<string> = new Set();

  public async executeInParallel(
    nodes: Node[], 
    edges: Edge[], 
    maxConcurrency: number = 5
  ): Promise<Map<string, any>> {
    this.maxConcurrency = maxConcurrency;
    this.currentlyExecuting.clear();
    
    const batches = this.createExecutionBatches(nodes, edges);
    const results = new Map<string, any>();
    
    console.log(`Created ${batches.size} execution batches for parallel execution`);
    
    // Execute batches in dependency order
    const sortedBatches = this.sortBatchesByDependencies(batches);
    
    for (const batch of sortedBatches) {
      console.log(`Executing batch ${batch.id} with ${batch.nodes.length} nodes`);
      
      const batchResults = await this.executeBatch(batch);
      
      // Merge results
      batchResults.forEach((result, nodeId) => {
        results.set(nodeId, result);
      });
      
      batch.completed = true;
      batch.results = batchResults;
    }
    
    return results;
  }

  private createExecutionBatches(nodes: Node[], edges: Edge[]): Map<string, ParallelBatch> {
    const batches = new Map<string, ParallelBatch>();
    const nodeDependencies = this.calculateNodeDependencies(nodes, edges);
    const processed = new Set<string>();
    let batchCounter = 0;

    while (processed.size < nodes.length) {
      const readyNodes = nodes.filter(node => 
        !processed.has(node.id) && 
        this.areDependenciesSatisfied(node.id, nodeDependencies, processed)
      );

      if (readyNodes.length === 0) {
        // Break circular dependencies or handle remaining nodes
        const remainingNodes = nodes.filter(node => !processed.has(node.id));
        if (remainingNodes.length > 0) {
          readyNodes.push(remainingNodes[0]);
        }
      }

      if (readyNodes.length > 0) {
        const batchId = `batch_${batchCounter++}`;
        const dependencies = this.getBatchDependencies(readyNodes, nodeDependencies, batches);
        
        batches.set(batchId, {
          id: batchId,
          nodes: readyNodes,
          dependencies,
          completed: false,
          results: new Map(),
          errors: new Map()
        });

        readyNodes.forEach(node => processed.add(node.id));
      }
    }

    return batches;
  }

  private calculateNodeDependencies(nodes: Node[], edges: Edge[]): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    
    nodes.forEach(node => {
      const incomingEdges = edges.filter(edge => edge.target === node.id);
      dependencies.set(node.id, incomingEdges.map(edge => edge.source));
    });
    
    return dependencies;
  }

  private areDependenciesSatisfied(
    nodeId: string, 
    dependencies: Map<string, string[]>, 
    processed: Set<string>
  ): boolean {
    const nodeDeps = dependencies.get(nodeId) || [];
    return nodeDeps.every(dep => processed.has(dep));
  }

  private getBatchDependencies(
    nodes: Node[], 
    nodeDependencies: Map<string, string[]>, 
    existingBatches: Map<string, ParallelBatch>
  ): string[] {
    const dependencies = new Set<string>();
    
    nodes.forEach(node => {
      const deps = nodeDependencies.get(node.id) || [];
      deps.forEach(dep => {
        // Find which batch contains this dependency
        for (const [batchId, batch] of existingBatches) {
          if (batch.nodes.some(n => n.id === dep)) {
            dependencies.add(batchId);
            break;
          }
        }
      });
    });
    
    return Array.from(dependencies);
  }

  private sortBatchesByDependencies(batches: Map<string, ParallelBatch>): ParallelBatch[] {
    const sorted: ParallelBatch[] = [];
    const visited = new Set<string>();
    
    const visit = (batchId: string) => {
      if (visited.has(batchId)) return;
      
      const batch = batches.get(batchId);
      if (!batch) return;
      
      // Visit dependencies first
      batch.dependencies.forEach(depId => {
        if (batches.has(depId)) {
          visit(depId);
        }
      });
      
      visited.add(batchId);
      sorted.push(batch);
    };
    
    Array.from(batches.keys()).forEach(visit);
    return sorted;
  }

  private async executeBatch(batch: ParallelBatch): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const promises: Promise<void>[] = [];
    const semaphore = new Semaphore(this.maxConcurrency);
    
    for (const node of batch.nodes) {
      promises.push(
        semaphore.acquire().then(async (release) => {
          try {
            this.currentlyExecuting.add(node.id);
            console.log(`Executing node ${node.id} (${node.type}) in parallel`);
            
            const result = await workflowEngine.executeNode(
              node.id,
              node.type || 'action',
              {},
              node.data?.config
            );
            
            results.set(node.id, result);
            batch.results.set(node.id, result);
            
            console.log(`Node ${node.id} completed successfully`);
          } catch (error) {
            console.error(`Node ${node.id} failed:`, error);
            batch.errors.set(node.id, error instanceof Error ? error : new Error(String(error)));
            
            // Still add a result to prevent hanging
            results.set(node.id, { 
              error: error instanceof Error ? error.message : String(error),
              success: false 
            });
          } finally {
            this.currentlyExecuting.delete(node.id);
            release();
          }
        })
      );
    }
    
    await Promise.all(promises);
    return results;
  }

  public getCurrentlyExecuting(): string[] {
    return Array.from(this.currentlyExecuting);
  }

  public getBatches(): ParallelBatch[] {
    return Array.from(this.batches.values());
  }

  public getExecutionStats(): {
    totalBatches: number;
    completedBatches: number;
    totalNodes: number;
    completedNodes: number;
    currentlyExecuting: number;
    errors: number;
  } {
    const batches = Array.from(this.batches.values());
    const completedBatches = batches.filter(b => b.completed).length;
    const totalNodes = batches.reduce((sum, b) => sum + b.nodes.length, 0);
    const completedNodes = batches.reduce((sum, b) => sum + b.results.size, 0);
    const errors = batches.reduce((sum, b) => sum + b.errors.size, 0);
    
    return {
      totalBatches: batches.length,
      completedBatches,
      totalNodes,
      completedNodes,
      currentlyExecuting: this.currentlyExecuting.size,
      errors
    };
  }
}

// Simple semaphore implementation for concurrency control
class Semaphore {
  private count: number;
  private waiting: Array<() => void> = [];

  constructor(count: number) {
    this.count = count;
  }

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      if (this.count > 0) {
        this.count--;
        resolve(() => this.release());
      } else {
        this.waiting.push(() => {
          this.count--;
          resolve(() => this.release());
        });
      }
    });
  }

  private release(): void {
    this.count++;
    if (this.waiting.length > 0) {
      const next = this.waiting.shift();
      if (next) next();
    }
  }
}

export const parallelExecutor = new ParallelExecutor();
