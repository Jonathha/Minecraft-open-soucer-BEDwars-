import { Vector3D } from './types';
import { ServerRotationSample } from './aimbotTypes';
import { normalizeAngleDiff } from './aimbotSampleRecorder';
import { calculateAimOffsetToTarget } from './aimbotTrackingChecker';

export interface HitSnapResult {
  isSnapOnHit: boolean;
  turnAngleDeg: number;
  accuracyOffsetRad: number;
}

export function checkSnapOnHit(
  attackerPos: Vector3D,
  currentYaw: number,
  lookDir: Vector3D,
  targetPos: Vector3D,
  samples: ServerRotationSample[] = []
): HitSnapResult {
  const now = Date.now();
  let maxTurnDelta = 0;
  let wasOffTargetRecently = false;

  for (let i = samples.length - 1; i >= 0; i--) {
    const s = samples[i];
    const age = now - s.timestamp;
    if (age > 20 && age < 400) {
      const delta = Math.abs(normalizeAngleDiff(currentYaw - s.yaw));
      if (delta > maxTurnDelta) maxTurnDelta = delta;

      const pastLookDir = { x: -Math.sin(s.yaw), y: lookDir.y, z: -Math.cos(s.yaw) };
      const pastOffset = calculateAimOffsetToTarget(attackerPos, pastLookDir, targetPos);
      if (pastOffset > 0.30) {
        wasOffTargetRecently = true;
      }
    }
  }

  const offsetToTarget = calculateAimOffsetToTarget(attackerPos, lookDir, targetPos);

  // Aimbot snap-on-hit / Trigger aimbot conditions:
  // 1. Player snapped > 8° (0.14 rad) in < 400ms directly onto target (< 0.28 rad offset)
  const isSnapTurnToTarget = maxTurnDelta > 0.14 && offsetToTarget < 0.28;

  // 2. Was not looking at target recently (>0.30 rad offset), but on attack tick instantly snapped to target (<0.22 rad)
  const isInstantLockOnAttack = wasOffTargetRecently && offsetToTarget < 0.22;

  // 3. Pinpoint center lock on attack (<0.08 rad)
  const isPinpointSnap = offsetToTarget < 0.08;

  const isSnapOnHit = isSnapTurnToTarget || isInstantLockOnAttack || isPinpointSnap;

  return {
    isSnapOnHit,
    turnAngleDeg: Number((maxTurnDelta * (180 / Math.PI)).toFixed(1)),
    accuracyOffsetRad: Number(offsetToTarget.toFixed(4)),
  };
}

