import { Vector3D } from './types';
import { PredictionState } from './predictionTypes';

export class PredictionStateManager {
  private static playerStates: Map<string, PredictionState> = new Map();

  public static get(playerId: string): PredictionState | undefined {
    return this.playerStates.get(playerId);
  }

  public static set(playerId: string, state: PredictionState) {
    this.playerStates.set(playerId, state);
  }

  public static delete(playerId: string) {
    this.playerStates.delete(playerId);
  }

  public static handleRespawn(playerId: string, pos: Vector3D) {
    this.playerStates.set(playerId, {
      lastPos: { ...pos },
      lastVelocity: { x: 0, y: 0, z: 0 },
      violationCount: 0,
      lastPacketTime: Date.now(),
      respawnBypassUntil: Date.now() + 1500,
      lastLegitGroundedPos: { ...pos }
    });
  }

  public static updateState(state: PredictionState, pos: Vector3D, vel: Vector3D | undefined, now: number) {
    state.lastPos = { ...pos };
    if (vel) state.lastVelocity = { ...vel };
    state.lastPacketTime = now;
  }
}
