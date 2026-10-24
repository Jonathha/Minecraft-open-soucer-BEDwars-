import { ServerRotationSample } from './aimbotTypes';

export function checkInstantSnap(samples: ServerRotationSample[]): { suspicious: boolean; snapRatio: number } {
  if (samples.length < 4) return { suspicious: false, snapRatio: 0 };

  const len = samples.length;
  const current = samples[len - 1];
  const previous = samples[len - 2];
  const beforePrev = samples[len - 3];

  const currentDelta = Math.abs(current.deltaYaw);
  const prevDelta = Math.abs(previous.deltaYaw);
  const beforeDelta = Math.abs(beforePrev.deltaYaw);

  // Detect: Calm/Slow rotation -> Instant huge snap (>0.55 rad / ~32 deg) -> Immediate dead stop (<0.02 rad)
  const isSuddenSnap = prevDelta > 0.55 && beforeDelta < 0.15;
  const isInstantDeadStop = currentDelta < 0.02;

  if (isSuddenSnap && isInstantDeadStop) {
    const snapRatio = prevDelta / Math.max(0.001, currentDelta);
    return {
      suspicious: true,
      snapRatio: Number(snapRatio.toFixed(2)),
    };
  }

  // Angular jerk check: infinite acceleration followed by infinite deceleration
  const accel1 = Math.abs(previous.accelYaw);
  const accel2 = Math.abs(current.accelYaw);
  if (accel1 > 0.8 && accel2 > 0.8 && currentDelta < 0.015) {
    return {
      suspicious: true,
      snapRatio: Number((accel1 + accel2).toFixed(2)),
    };
  }

  return { suspicious: false, snapRatio: 0 };
}
