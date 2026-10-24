import { WebSocket } from 'ws';
import { ServerPlayerData, CheckResult, Vector3D } from './types';
import { CombatHitPayload } from './combatDetector';
import { BlockPlacePayload } from './placementDetector';
import { SERVER_SHOP_CATALOG, ServerShopItem, validateAndProcessShopBuy } from './serverShopValidator';
import { validateBedBreak, validateBlockBreak } from './serverBlockInteractionValidator';
import { createInitialPlayerData, resetPlayerMatch, resetPlayerRespawn } from './serverPlayerStateManager';
import { runMovementCheck, runCombatCheck, runPlacementCheck } from './serverGameplayCheckers';
import { handleServerViolation } from './serverViolationHandler';

export { SERVER_SHOP_CATALOG };
export type { ServerShopItem };

export class ServerAntiCheatEngine {
  private players: Map<string, ServerPlayerData> = new Map();
  private decayInterval: NodeJS.Timeout | null = null;
  public static readonly KICK_VL_THRESHOLD = 20.0;
  private static readonly VL_DECAY_PER_SEC = 0.5;

  constructor() {
    this.decayInterval = setInterval(() => {
      const now = Date.now();
      for (const player of this.players.values()) {
        if (player.violations && player.violations.length > 0) {
          // Remove apenas as infrações cujo tempo individual expirou (não afeta as outras)
          player.violations = player.violations.filter(v => (v.expiresAt || (v.timestamp + 8000)) > now);
          player.violationLevel = player.violations.reduce((sum, v) => sum + v.weight, 0);
        } else {
          player.violationLevel = 0;
        }
      }
    }, 500);
  }

  public registerPlayer(id: string): ServerPlayerData {
    const data = createInitialPlayerData(id);
    this.players.set(id, data);
    return data;
  }

  public resetPlayerMatchState(id: string, initialPos?: Vector3D): void {
    const player = this.players.get(id);
    if (player) resetPlayerMatch(player, initialPos);
  }

  public resetPlayerDeathState(id: string): void {
    const player = this.players.get(id);
    if (player) {
      player.blockInventory.clear();
      player.resources = { iron: 18, gold: 4, diamond: 0, emerald: 0 };
      player.lastResourceSyncTime = Date.now();
    }
  }

  public resetPlayerRespawnState(id: string, initialPos?: Vector3D): void {
    const player = this.players.get(id);
    if (player) resetPlayerRespawn(player, initialPos);
  }

  public unregisterPlayer(id: string): void { this.players.delete(id); }
  public getPlayerData(id: string): ServerPlayerData | undefined { return this.players.get(id); }

  public processShopBuy(ws: WebSocket & { id?: string; team?: 'red' | 'blue' }, purchase: { itemId: string; costType?: string; costAmount?: number; count?: number; blockType?: number }): CheckResult {
    if (!ws.id) return { allowed: false };
    const player = this.players.get(ws.id) || this.registerPlayer(ws.id);
    const res = validateAndProcessShopBuy(ws, player, purchase);
    if (!res.allowed && res.violation) handleServerViolation(ws, player, res.violation, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
    return res;
  }

  public processMovement(
    ws: WebSocket & { id?: string },
    pos: Vector3D,
    rot: number,
    roomBlocks?: Array<{ x: number; y: number; z: number }>,
    keys?: { forward?: boolean; backward?: boolean; left?: boolean; right?: boolean; jump?: boolean; sneak?: boolean },
    isGroundedClient?: boolean
  ): CheckResult {
    if (!ws.id) return { allowed: true };
    const player = this.players.get(ws.id) || this.registerPlayer(ws.id);
    return runMovementCheck(player, pos, rot, roomBlocks, keys, isGroundedClient);
  }

  public processCombatHit(
    ws: WebSocket & { id?: string; team?: 'red' | 'blue' },
    hitData: CombatHitPayload,
    targetPlayerPos?: Vector3D,
    targetPlayerId?: string,
    roomBlocks?: Array<{ x: number; y: number; z: number }>
  ): CheckResult {
    if (!ws.id) return { allowed: true };
    const player = this.players.get(ws.id) || this.registerPlayer(ws.id);
    const targetPlayer = targetPlayerId ? this.players.get(targetPlayerId) : undefined;
    const res = runCombatCheck(player, hitData, ws.team, targetPlayerPos, targetPlayer, roomBlocks);
    if (!res.allowed && res.violation) handleServerViolation(ws, player, res.violation, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
    return res;
  }

  public processBedBreak(ws: WebSocket & { id?: string; team?: 'red' | 'blue' }, targetTeam: 'red' | 'blue', match: { redBed: boolean; blueBed: boolean }): CheckResult {
    if (!ws.id) return { allowed: false };
    const player = this.players.get(ws.id);
    if (!player) return { allowed: false };
    const res = validateBedBreak(ws, player, targetTeam, match);
    if (!res.allowed && res.violation) handleServerViolation(ws, player, res.violation, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
    return res;
  }

  public processBlockBreak(ws: WebSocket & { id?: string }, pos: Vector3D, roomBlocks?: Array<{ x: number; y: number; z: number }>): CheckResult {
    if (!ws.id) return { allowed: false };
    const player = this.players.get(ws.id);
    if (!player) return { allowed: false };
    const res = validateBlockBreak(player, pos, roomBlocks);
    if (!res.allowed && res.violation) handleServerViolation(ws, player, res.violation, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
    return res;
  }

  public processBlockPlace(ws: WebSocket & { id?: string }, block: BlockPlacePayload, roomBlocks?: Array<{ x: number; y: number; z: number }>): CheckResult {
    if (!ws.id) return { allowed: true };
    const player = this.players.get(ws.id) || this.registerPlayer(ws.id);
    const res = runPlacementCheck(player, block, roomBlocks);
    if (!res.allowed && res.violation) handleServerViolation(ws, player, res.violation, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
    return res;
  }

  public destroy(): void {
    if (this.decayInterval) clearInterval(this.decayInterval);
  }
}
