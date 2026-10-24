import * as THREE from 'three';
import { BlockType } from '../../types/game';

export interface RotationSample {
  yaw: number;
  pitch: number;
  time: number;
}

export interface BlockPlacePacket {
  position: THREE.Vector3;
  faceNormal: THREE.Vector3;
  playerPos: THREE.Vector3;
  cameraDir: THREE.Vector3;
  cameraPos: THREE.Vector3;
  blockType: BlockType;
  timestamp: number;
}

export interface AntiCheatViolation {
  module: 'scaffold_rotation' | 'robotic_snap' | 'fast_place' | 'reach' | 'air_place' | 'speed' | 'fly' | 'tp' | 'scaffold_nolook' | 'phase' | 'combat_wall_hit' | 'combat_reach' | 'aimbot_snap';
  weight: number;
  details: string;
}

export interface AntiCheatConfig {
  maxReach: number;              // 4.85 blocks (includes ping compensation)
  minPitchAngleForDownPlace: number;
  rotationSampleSize: number;
  maxViolationsBeforeFlag: number;
  decayIntervalSeconds: number;
}

export const DEFAULT_AC_CONFIG: AntiCheatConfig = {
  maxReach: 4.85,
  minPitchAngleForDownPlace: -0.15,
  rotationSampleSize: 12,
  maxViolationsBeforeFlag: 8,
  decayIntervalSeconds: 1.0,
};
