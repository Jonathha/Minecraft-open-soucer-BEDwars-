import { ServerAimbotState, AIMBOT_BUFFER_THRESHOLD, AIMBOT_BUFFER_DECAY } from './aimbotTypes';

export function updateAimbotBuffer(
  state: ServerAimbotState,
  isSuspicious: boolean,
  weight: number = 1.0,
  now: number = Date.now()
): { isConfirmedAimbot: boolean; currentBuffer: number } {
  state.totalAnalyses += 1;
  state.lastAnalysisTime = now;

  if (isSuspicious) {
    state.suspicionBuffer = Math.min(20.0, state.suspicionBuffer + weight);
  } else {
    // Continuous decay on legitimate human motion
    state.suspicionBuffer = Math.max(0, state.suspicionBuffer - AIMBOT_BUFFER_DECAY);
  }

  // The system only flags after consistent mathematical repetition (Buffer >= 8.0)
  // Preventing any instant kick or false positive on isolated mouse jerks
  if (state.suspicionBuffer >= AIMBOT_BUFFER_THRESHOLD) {
    state.flagCount += 1;
    state.lastConfirmedAimbotTime = now;
    // Cool down the buffer partially to require fresh evidence for subsequent flags
    state.suspicionBuffer = AIMBOT_BUFFER_THRESHOLD * 0.75;
    return {
      isConfirmedAimbot: true,
      currentBuffer: state.suspicionBuffer,
    };
  }

  return {
    isConfirmedAimbot: false,
    currentBuffer: state.suspicionBuffer,
  };
}

export function createInitialAimbotState(): ServerAimbotState {
  return {
    samples: [],
    suspicionBuffer: 0,
    lastAnalysisTime: Date.now(),
    totalAnalyses: 0,
    flagCount: 0,
    centerOffsets: [],
  };
}
