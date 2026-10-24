import { Vector3D } from './types';

export function calculateAimOffsetToTarget(
  attackerPos: Vector3D,
  lookDir: Vector3D,
  targetPos: Vector3D
): number {
  const dX = targetPos.x - attackerPos.x;
  const dY = (targetPos.y + 1.1) - (attackerPos.y + 1.62);
  const dZ = targetPos.z - attackerPos.z;
  const dist = Math.hypot(dX, dY, dZ);
  if (dist < 0.1) return 0;

  const toX = dX / dist;
  const toY = dY / dist;
  const toZ = dZ / dist;

  const lookLen = Math.hypot(lookDir.x, lookDir.y, lookDir.z);
  if (lookLen < 0.001) return 0;

  const lX = lookDir.x / lookLen;
  const lY = lookDir.y / lookLen;
  const lZ = lookDir.z / lookLen;

  const dot = Math.max(-1, Math.min(1, lX * toX + lY * toY + lZ * toZ));
  return Math.acos(dot);
}

export function checkTrackingConsistency(offsets: number[]): { suspicious: boolean; stdDev: number } {
  if (offsets.length < 6) return { suspicious: false, stdDev: 0 };

  const mean = offsets.reduce((acc, v) => acc + v, 0) / offsets.length;
  const variance = offsets.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / offsets.length;
  const stdDev = Math.sqrt(variance);

  // Unnatural lock: average offset is strictly on center (<0.08 rad) and stdDev is unnaturally small (<0.012 rad)
  const isCenterLocked = mean < 0.08 && stdDev < 0.012;
  return {
    suspicious: isCenterLocked,
    stdDev: Number(stdDev.toFixed(4)),
  };
}
