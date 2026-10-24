import { ServerPlayerData, CheckResult, Vector3D } from './types';
import { checkServerFootprint } from './groundCheck';
import { PredictionConstants } from './predictionConstants';
import { predictNextPosition } from './predictionPhysics';
import { PredictionStateManager } from './predictionStateManager';
import { checkViolations } from './predictionViolationLogic';
import { PredictionHelpers } from './predictionHelpers';

export class PredictionAntiCheat {
  public static handleRespawn(playerId: string, pos: Vector3D) {
    PredictionStateManager.handleRespawn(playerId, pos);
  }

  public static handleDisconnect(playerId: string) {
    PredictionStateManager.delete(playerId);
  }

  public static validateMovement(
    player: ServerPlayerData, newPos: Vector3D, yaw: number, keys?: any, 
    isGrounded?: boolean, dt?: number, clientVelocity?: Vector3D, roomBlocks?: any[]
  ): CheckResult {
    const now = Date.now();
    const state = PredictionHelpers.getOrInitState(player, clientVelocity, now);
    if (PredictionHelpers.shouldBypass(player, state, now, newPos, clientVelocity)) return { allowed: true };

    const elapsed = (now - state.lastPacketTime) / 1000;
    const isLag = elapsed > 0.15 || (dt !== undefined && dt > 0.1);
    const cDt = dt && dt > 0 ? Math.min(dt, 0.1) : Math.min(elapsed, 0.1);
    const effVel = clientVelocity || PredictionHelpers.calcEffVel(newPos, state.lastPos, cDt);

    const isSneaking = Boolean(keys?.sneak);
    const hasRecentPlacedFooting = Boolean(
      player.recentPlacedBlocks?.some(b => {
        const dx = Math.abs(state.lastPos.x - b.x);
        const dz = Math.abs(state.lastPos.z - b.z);
        const dy = state.lastPos.y - (b.y + 0.5);
        const maxDist = isSneaking ? 0.92 : 0.65;
        return dx <= maxDist && dz <= maxDist && dy >= -0.25 && dy <= 0.8;
      })
    );
    const sGrounded = checkServerFootprint(state.lastPos.x, state.lastPos.y, state.lastPos.z, roomBlocks, isSneaking) || hasRecentPlacedFooting;
    const isNewGrounded = checkServerFootprint(newPos.x, newPos.y, newPos.z, roomBlocks, isSneaking);
    
    const { predictedPos, predictedVelY } = predictNextPosition(state.lastPos, state.lastVelocity, cDt, sGrounded, !!keys?.jump, effVel, isSneaking);
    const devH = Math.hypot(newPos.x - predictedPos.x, newPos.z - predictedPos.z);
    let devV = newPos.y - predictedPos.y;
    // Se o jogador estiver agachado/segurando Shift na borda da ponte sem pular, a altura Y permanece no plano do bloco
    if (isSneaking && !keys?.jump && Math.abs(newPos.y - state.lastPos.y) < 0.15) {
      devV = 0;
    }

    const isKB = Boolean(player.knockbackUntil && now < player.knockbackUntil);
    const v = checkViolations(newPos, state.lastPos, state.lastLegitGroundedPos.y, sGrounded || isNewGrounded, !!keys?.jump, isKB, cDt, roomBlocks, isSneaking);
    const hasViolated = devH > PredictionConstants.MAX_HORIZONTAL_DEVIATION || devV > PredictionConstants.MAX_VERTICAL_DEVIATION || 
                        v.isFloating || v.isClipping || v.isAscendingInAir || v.isPlatformUnreachable || v.isIllegalStep;

    if (hasViolated) {
      if (isLag) {
        state.violationCount = Math.max(0, state.violationCount - 0.2);
      } else {
        state.violationCount += (v.isFloating || v.isAscendingInAir || v.isClipping) ? 1.0 : 0.25;
      }

      const isSevereViolation = (v.isFloating || v.isPlatformUnreachable || devV > 1.2) && state.violationCount >= 2.0;
      const shouldSetback = state.violationCount >= 2.5 || isSevereViolation;

      if (shouldSetback && !isLag) {
        const res = PredictionHelpers.createViolationResult(player, newPos, devV, v.isFloating, v.isPlatformUnreachable, isLag, now, roomBlocks);
        // Setback: sempre recua para a posição de solo legítimo confirmado no servidor
        const targetPos = state.lastLegitGroundedPos ? { ...state.lastLegitGroundedPos } : (player.lastLegitGroundedPos ? { ...player.lastLegitGroundedPos } : { ...state.lastPos });
        res.setbackPos = targetPos;
        state.lastPos = { ...targetPos };
        state.lastVelocity = { x: 0, y: 0, z: 0 };
        state.violationCount = 0;
        state.respawnBypassUntil = 0; // Punição de anti-cheat NÃO ganha bypass de respawn
        return res;
      }
      
      state.lastPacketTime = now;
      PredictionStateManager.updateState(state, newPos, { ...effVel, y: predictedVelY }, now);
      return { allowed: true };
    }

    // Atualiza a posição de solo legítima APENAS quando o jogador está pisando em solo real do servidor
    if (sGrounded || isNewGrounded) {
      state.lastLegitGroundedPos = { ...newPos };
    }

    state.violationCount = Math.max(0, state.violationCount - 1.0); // Rápido decaimento para jogadores legítimos

    PredictionStateManager.updateState(state, newPos, { ...effVel, y: predictedVelY }, now);
    return { allowed: true };
  }
}
