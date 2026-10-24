export interface ServerRotationSample {
  yaw: number;
  timestamp: number;
  deltaYaw: number;
  accelYaw: number;
}

export interface ServerAimbotState {
  samples: ServerRotationSample[];
  suspicionBuffer: number;
  lastAnalysisTime: number;
  totalAnalyses: number;
  flagCount: number;
  centerOffsets: number[];
  lastConfirmedAimbotTime?: number;
}

export interface AimbotAnalysisResult {
  detected: boolean;
  confidence: number;
  suspicionScore: number;
  reason: string;
  metrics: {
    gcdError?: number;
    snapRatio?: number;
    trackingStdDev?: number;
  };
}

export const AIMBOT_BUFFER_THRESHOLD = 3.0;
export const AIMBOT_BUFFER_DECAY = 0.15;
export const AIMBOT_SAMPLE_WINDOW = 20;
