import { AntiCheatViolation } from './types';

export interface ViolationCallback {
  onWarning?: (message: string, vl: number) => void;
  onAction?: (reason: string, vl: number) => void;
}

interface TrackedVL {
  id: number;
  weight: number;
  expiresAt: number;
  violation: AntiCheatViolation;
}

/**
 * Violation Manager (Buffer & Decay System):
 * Protege jogadores legítimos e gerencia VLs com expiração individual por infração.
 * Limite de banimento atualizado para 20 VL, salvando cada VL por 3s a mais com tempo independente.
 */
export class ViolationManager {
  private violationScore = 0;
  private lastViolationTime = 0;
  private readonly MAX_VL = 20.0;
  private readonly VL_LIFETIME_MS = 8000; // Tempo base de vida salvo por 3s a mais (5s + 3s = 8s)
  private activeViolations: TrackedVL[] = [];
  private nextId = 0;
  private callbacks: ViolationCallback;

  constructor(callbacks: ViolationCallback = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: ViolationCallback): void {
    this.callbacks = callbacks;
  }

  public update(_delta: number): void {
    const now = performance.now();
    const initialCount = this.activeViolations.length;
    // Remove unicamente as infrações cujo tempo individual específico expirou, sem resetar as demais
    this.activeViolations = this.activeViolations.filter(v => v.expiresAt > now);
    if (this.activeViolations.length !== initialCount) {
      this.recalculateScore();
    }
  }

  private recalculateScore(): void {
    this.violationScore = this.activeViolations.reduce((sum, v) => sum + v.weight, 0);
  }

  public addViolation(violation: AntiCheatViolation): { shouldBlock: boolean; shouldFlag: boolean } {
    const now = performance.now();
    this.lastViolationTime = now;

    // Cada VL possui seu tempo próprio separado (salvo por 3 segundos a mais)
    const expiresAt = now + this.VL_LIFETIME_MS;
    this.activeViolations.push({
      id: ++this.nextId,
      weight: violation.weight,
      expiresAt,
      violation,
    });
    this.recalculateScore();

    const shouldBlock = violation.weight >= 4.0 || this.violationScore >= 4.0;
    const shouldFlag = this.violationScore >= this.MAX_VL;

    if (shouldFlag) {
      this.callbacks.onAction?.(violation.details, this.violationScore);
    } else if (this.violationScore >= 6.0) {
      this.callbacks.onWarning?.(`[Anti-Cheat] Alerta: ${violation.module}`, this.violationScore);
    }

    return { shouldBlock, shouldFlag };
  }

  public getScore(): number {
    return this.violationScore;
  }

  public reset(): void {
    this.activeViolations = [];
    this.violationScore = 0;
    this.lastViolationTime = 0;
  }
}
