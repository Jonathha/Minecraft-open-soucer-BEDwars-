import { ServerPlayerData, CheckResult, Vector3D } from './types';
import { PredictionStateManager } from './predictionStateManager';
import { buildRichViolation } from './violationDetailsHelper';

export class PredictionHelpers {
  public static getOrInitState(player: ServerPlayerData, vel: any, now: number) {
    let state = PredictionStateManager.get(player.id);
    if (!state) {
      state = {
        lastPos: { ...player.lastPos }, lastVelocity: vel || { x: 0, y: 0, z: 0 },
        violationCount: 0, lastPacketTime: now, respawnBypassUntil: now + 1000,
        lastLegitGroundedPos: { ...player.lastPos }
      };
      PredictionStateManager.set(player.id, state);
    }
    return state;
  }

  public static shouldBypass(player: ServerPlayerData, state: any, now: number, newPos: any, vel: any) {
    const isKB = Boolean(player.knockbackUntil && now < player.knockbackUntil);
    const isTP = Boolean(player.teleportBypassUntil && now < player.teleportBypassUntil);
    if (now < state.respawnBypassUntil || player.isFirstPacket || isKB || isTP) {
      PredictionStateManager.updateState(state, newPos, vel, now);
      if (isKB || isTP) state.violationCount = Math.max(0, state.violationCount - 1);
      return true;
    }
    return false;
  }

  public static calcEffVel(newPos: any, lastPos: any, cDt: number) {
    return {
      x: (newPos.x - lastPos.x) / (cDt || 0.05),
      y: (newPos.y - lastPos.y) / (cDt || 0.05),
      z: (newPos.z - lastPos.z) / (cDt || 0.05)
    };
  }

  public static createViolationResult(
    player: ServerPlayerData,
    newPos: Vector3D,
    devV: number,
    isFloating: boolean,
    unreachable: boolean,
    isLag: boolean,
    now: number,
    roomBlocks?: any[]
  ): CheckResult {
    const isFly = devV > 0 || isFloating || unreachable;
    const rule = unreachable ? 'Unreachable Platform / Fly' : 'Movement Mismatch / Prediction Deviation';
    const baseDetails = `Desvio Físico Vertical: ${devV.toFixed(2)}m (Plataforma Inalcançável: ${unreachable}, Lag: ${isLag})`;

    return {
      allowed: false,
      violation: buildRichViolation(
        player,
        isFly ? 'FLY' : 'SPEED',
        rule,
        4.0,
        baseDetails,
        newPos,
        now,
        roomBlocks,
        'server/anticheat/predictionAntiCheat.ts',
        'ERR_PREDICTION_MISMATCH',
        'Trajetória predita pelo modelo autoritativo divergiu da coordenada enviada pelo cliente.'
      )
    };
  }
}

