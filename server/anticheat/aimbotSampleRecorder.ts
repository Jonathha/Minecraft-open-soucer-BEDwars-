import { ServerAimbotState, AIMBOT_SAMPLE_WINDOW } from './aimbotTypes';

export function normalizeAngleDiff(delta: number): number {
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
}

export function recordRotationSample(
  state: ServerAimbotState,
  currentYaw: number,
  now: number = Date.now()
): void {
  const samples = state.samples;
  const lastSample = samples.length > 0 ? samples[samples.length - 1] : undefined;
  const rawDelta = lastSample ? currentYaw - lastSample.yaw : 0;
  const deltaYaw = normalizeAngleDiff(rawDelta);
  const prevDelta = lastSample ? lastSample.deltaYaw : 0;
  const accelYaw = deltaYaw - prevDelta;

  samples.push({
    yaw: currentYaw,
    timestamp: now,
    deltaYaw,
    accelYaw,
  });

  if (samples.length > AIMBOT_SAMPLE_WINDOW) {
    samples.shift();
  }
}

export function recordTargetOffset(state: ServerAimbotState, offset: number): void {
  state.centerOffsets.push(offset);
  if (state.centerOffsets.length > 15) {
    state.centerOffsets.shift();
  }
}
