import { Vector3D } from './types';

export interface PredictionState {
  lastPos: Vector3D;
  lastVelocity: Vector3D;
  violationCount: number;
  lastPacketTime: number;
  respawnBypassUntil: number;
  lastLegitGroundedPos: Vector3D;
}
