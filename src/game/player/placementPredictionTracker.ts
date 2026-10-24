import { BlockType } from '../../types/game';
import { InteractionContext } from './interactionHandler';

export interface PendingPlacementEntry {
  timeoutId: any;
  isSent: boolean;
  packet: { x: number; y: number; z: number; type: BlockType; isVisual?: boolean };
  parentKey?: string;
  dependentKeys: string[];
}

export class PlacementPredictionTracker {
  private ctx: InteractionContext;
  private pendingPlacements = new Map<string, PendingPlacementEntry>();

  constructor(ctx: InteractionContext) {
    this.ctx = ctx;
  }

  public getKey(x: number, y: number, z: number): string {
    return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
  }

  public has(key: string): boolean {
    return this.pendingPlacements.has(key);
  }

  public get(key: string): PendingPlacementEntry | undefined {
    return this.pendingPlacements.get(key);
  }

  public set(key: string, entry: PendingPlacementEntry) {
    this.pendingPlacements.set(key, entry);
  }

  public confirmPlacement(x: number, y: number, z: number) {
    const k = this.getKey(x, y, z);
    const entry = this.pendingPlacements.get(k);
    if (!entry) return;

    if (entry.timeoutId !== undefined) {
      clearTimeout(entry.timeoutId);
    }

    for (const depKey of entry.dependentKeys) {
      const depEntry = this.pendingPlacements.get(depKey);
      if (depEntry && !depEntry.isSent) {
        depEntry.isSent = true;
        this.ctx.network.sendBlockPlace(depEntry.packet);
        if (depEntry.timeoutId !== undefined) {
          clearTimeout(depEntry.timeoutId);
        }
        depEntry.timeoutId = setTimeout(() => {
          this.rollbackBlock(depKey);
        }, 1500);
      }
    }

    this.pendingPlacements.delete(k);
  }

  public rejectPlacement(x: number, y: number, z: number) {
    const k = this.getKey(x, y, z);
    this.rollbackBlock(k);
  }

  public rollbackBlock(k: string) {
    const entry = this.pendingPlacements.get(k);
    if (!entry) return;

    if (entry.timeoutId !== undefined) {
      clearTimeout(entry.timeoutId);
    }

    for (const depKey of entry.dependentKeys) {
      this.rollbackBlock(depKey);
    }

    this.pendingPlacements.delete(k);
    const [x, y, z] = k.split(',').map(Number);
    this.ctx.world.removeBlock(x, y, z);
    if (this.ctx.player) {
      const distY = this.ctx.player.position.y - y;
      const distX = Math.abs(this.ctx.player.position.x - x);
      const distZ = Math.abs(this.ctx.player.position.z - z);
      if (distY > 0 && distY < 2.0 && distX < 1.0 && distZ < 1.0) {
        this.ctx.player.isGrounded = false;
      }
    }
  }

  public isPlacementPending(x: number, y: number, z: number): boolean {
    return this.pendingPlacements.has(this.getKey(x, y, z));
  }

  public clearPending() {
    for (const [, entry] of this.pendingPlacements) {
      if (entry.timeoutId !== undefined) {
        clearTimeout(entry.timeoutId);
      }
    }
    this.pendingPlacements.clear();
  }
}
