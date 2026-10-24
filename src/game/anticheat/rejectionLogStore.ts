export interface RejectionLogEntry {
  id: string;
  timestamp: number;
  timeStr: string;
  origin: 'server' | 'client';
  rule: string;
  reason: string;
  file?: string;
  error?: string;
  cause?: string;
  blockType?: string | number;
  blockPos: { x: number; y: number; z: number };
  playerPos?: { x: number; y: number; z: number };
  blockSupport?: string;
  ping?: number;
  fps?: number;
  rttInfo?: string;
  condition?: string;
  details?: Record<string, unknown>;
}

export type RejectionLog = RejectionLogEntry;

class RejectionLogStore {
  private logs: RejectionLogEntry[] = [];
  private listeners: Set<() => void> = new Set();

  public addLog(entry: Omit<RejectionLogEntry, 'id' | 'timestamp' | 'timeStr'>): void {
    const now = Date.now();
    const d = new Date(now);
    const timeStr = `${d.toLocaleTimeString('pt-BR')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
    const newEntry: RejectionLogEntry = {
      ...entry,
      id: `${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      timeStr,
    };
    this.logs.unshift(newEntry);
    if (this.logs.length > 100) {
      this.logs.pop();
    }
    this.notify();
  }

  public getLogs(): RejectionLogEntry[] {
    return this.logs;
  }

  public clear(): void {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const rejectionLogStore = new RejectionLogStore();
