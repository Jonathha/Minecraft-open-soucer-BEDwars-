import { ServerPlayerData, Vector3D } from './types';
import { AimbotAnalysisResult, ServerAimbotState } from './aimbotTypes';
import { createInitialAimbotState, updateAimbotBuffer } from './aimbotBufferManager';
import { recordRotationSample, recordTargetOffset } from './aimbotSampleRecorder';
import { checkRotationGcd } from './aimbotGcdChecker';
import { checkInstantSnap } from './aimbotSnapChecker';
import { calculateAimOffsetToTarget, checkTrackingConsistency } from './aimbotTrackingChecker';
import { checkSnapOnHit } from './aimbotHitSnapChecker';

export class ServerAimbotDetector {
  private static playerStates = new Map<string, ServerAimbotState>();

  public static getState(playerId: string): ServerAimbotState {
    let state = this.playerStates.get(playerId);
    if (!state) this.playerStates.set(playerId, (state = createInitialAimbotState()));
    return state;
  }

  public static analyze(
    player: ServerPlayerData,
    currentYaw: number,
    lookDir?: Vector3D,
    targetPos?: Vector3D,
    isAttack: boolean = false
  ): AimbotAnalysisResult {
    const state = this.getState(player.id);
    const now = Date.now();
    const prevSample = state.samples.length > 0 ? state.samples[state.samples.length - 1] : null;
    const prevYaw = prevSample ? prevSample.yaw : (player.lastRot || currentYaw);
    recordRotationSample(state, currentYaw, now);

    const gcd = checkRotationGcd(state.samples);
    const snap = checkInstantSnap(state.samples);

    let tracking = { suspicious: false, stdDev: 0 };
    let hitSnap = { isSnapOnHit: false, turnAngleDeg: 0, accuracyOffsetRad: 0 };
    if (isAttack && lookDir && targetPos) {
      hitSnap = checkSnapOnHit(player.lastPos, currentYaw, lookDir, targetPos, state.samples);
      const offset = calculateAimOffsetToTarget(player.lastPos, lookDir, targetPos);
      recordTargetOffset(state, offset);
      tracking = checkTrackingConsistency(state.centerOffsets);
    }

    const suspiciousCount = (gcd.suspicious ? 1 : 0) + (snap.suspicious ? 1.5 : 0) + (tracking.suspicious ? 1.5 : 0) + (hitSnap.isSnapOnHit ? 3.5 : 0);
    const { isConfirmedAimbot, currentBuffer } = updateAimbotBuffer(state, suspiciousCount >= 1.0, suspiciousCount, now);

    const reasons: string[] = [];
    if (gcd.suspicious) reasons.push('Abnormal sensitivity quantization (GCD error)');
    if (snap.suspicious) reasons.push(`Instant zero-acceleration snap (ratio ${snap.snapRatio})`);
    if (tracking.suspicious) reasons.push(`Unnatural center-lock tracking (stdDev ${tracking.stdDev})`);
    if (hitSnap.isSnapOnHit) reasons.push(`Snap-on-hit impossible turn (${hitSnap.turnAngleDeg}°)`);

    return {
      detected: isConfirmedAimbot || hitSnap.isSnapOnHit,
      confidence: Math.min(1.0, currentBuffer / 3.0),
      suspicionScore: Number(currentBuffer.toFixed(2)),
      reason: reasons.join('; ') || 'Normal movement',
      metrics: { gcdError: gcd.gcdError, snapRatio: snap.snapRatio, trackingStdDev: tracking.stdDev },
    };
  }
}
