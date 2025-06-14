
export interface CacheEntry {
  key: string;
  value: any;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  nodeId: string;
  executionId: string;
  size: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
  topNodes: Array<{ nodeId: string; entries: number; hits: number }>;
}

export class WorkflowCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 100 * 1024 * 1024; // 100MB default
  private maxEntries: number = 10000;
  private currentSize: number = 0;
  private hits: number = 0;
  private misses: number = 0;

  public set(
    key: string, 
    value: any, 
    nodeId: string, 
    executionId: string, 
    ttl: number = 3600000 // 1 hour default
  ): void {
    const entry: CacheEntry = {
      key,
      value,
      timestamp: new Date(),
      ttl,
      nodeId,
      executionId,
      size: this.calculateSize(value),
      hits: 0
    };

    // Check if we need to evict entries
    this.evictIfNeeded(entry.size);
    
    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.currentSize -= existing.size;
    }
    
    this.cache.set(key, entry);
    this.currentSize += entry.size;
    
    console.log(`Cache SET: ${key} (${entry.size} bytes) for node ${nodeId}`);
  }

  public get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      console.log(`Cache MISS: ${key}`);
      return null;
    }
    
    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.delete(key);
      this.misses++;
      console.log(`Cache EXPIRED: ${key}`);
      return null;
    }
    
    entry.hits++;
    this.hits++;
    console.log(`Cache HIT: ${key} (hits: ${entry.hits})`);
    return entry.value;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  public delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
      console.log(`Cache DELETE: ${key}`);
      return true;
    }
    return false;
  }

  public clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    this.hits = 0;
    this.misses = 0;
    console.log('Cache CLEARED');
  }

  public clearByNode(nodeId: string): number {
    let cleared = 0;
    for (const [key, entry] of this.cache) {
      if (entry.nodeId === nodeId) {
        this.delete(key);
        cleared++;
      }
    }
    console.log(`Cache CLEARED ${cleared} entries for node ${nodeId}`);
    return cleared;
  }

  public clearByExecution(executionId: string): number {
    let cleared = 0;
    for (const [key, entry] of this.cache) {
      if (entry.executionId === executionId) {
        this.delete(key);
        cleared++;
      }
    }
    console.log(`Cache CLEARED ${cleared} entries for execution ${executionId}`);
    return cleared;
  }

  public getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.hits + this.misses;
    
    const nodeStats = new Map<string, { entries: number; hits: number }>();
    let oldestEntry: Date | null = null;
    let newestEntry: Date | null = null;
    
    entries.forEach(entry => {
      // Node statistics
      const nodeStat = nodeStats.get(entry.nodeId) || { entries: 0, hits: 0 };
      nodeStat.entries++;
      nodeStat.hits += entry.hits;
      nodeStats.set(entry.nodeId, nodeStat);
      
      // Timestamp statistics
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    });
    
    const topNodes = Array.from(nodeStats.entries())
      .map(([nodeId, stats]) => ({ nodeId, ...stats }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return {
      totalEntries: entries.length,
      totalSize: this.currentSize,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.misses / totalRequests : 0,
      oldestEntry,
      newestEntry,
      topNodes
    };
  }

  public cleanupExpired(): number {
    let cleaned = 0;
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        this.delete(key);
        cleaned++;
      }
    }
    console.log(`Cache CLEANUP: ${cleaned} expired entries removed`);
    return cleaned;
  }

  public generateKey(nodeId: string, inputs: any, config: any): string {
    const hash = this.simpleHash(JSON.stringify({ nodeId, inputs, config }));
    return `${nodeId}_${hash}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp.getTime() > entry.ttl;
  }

  private calculateSize(value: any): number {
    return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
  }

  private evictIfNeeded(newEntrySize: number): void {
    // Check if we need to evict by size
    while (this.currentSize + newEntrySize > this.maxSize && this.cache.size > 0) {
      this.evictLeastUsed();
    }
    
    // Check if we need to evict by count
    while (this.cache.size >= this.maxEntries) {
      this.evictLeastUsed();
    }
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedHits = Infinity;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.hits < leastUsedHits || 
          (entry.hits === leastUsedHits && entry.timestamp.getTime() < oldestTime)) {
        leastUsedKey = key;
        leastUsedHits = entry.hits;
        oldestTime = entry.timestamp.getTime();
      }
    }
    
    if (leastUsedKey) {
      this.delete(leastUsedKey);
      console.log(`Cache EVICTED: ${leastUsedKey} (${leastUsedHits} hits)`);
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  public setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
    this.evictIfNeeded(0);
  }

  public setMaxEntries(maxEntries: number): void {
    this.maxEntries = maxEntries;
    this.evictIfNeeded(0);
  }
}

export const workflowCache = new WorkflowCache();
