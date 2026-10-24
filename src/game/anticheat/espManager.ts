import * as THREE from 'three';
import { VoxelWorld } from '../world/voxelWorld';
import { BlockType } from '../../types/game';

export type OcclusionStatus = 'visible' | 'occluded' | 'buffer' | 'no_opponent';

export interface EspState {
  espEnabled: boolean;
  antiEspEnabled: boolean;
  fakeFovBypass: boolean;
  status: OcclusionStatus;
  distance: number;
}

/**
 * Checks if a specific ray between eye position and target point is blocked by any solid voxel.
 */
export function isRayBlockedByVoxels(
  start: THREE.Vector3,
  target: THREE.Vector3,
  world: VoxelWorld
): boolean {
  const dir = new THREE.Vector3().subVectors(target, start);
  const totalDist = dir.length();
  if (totalDist < 0.3) return false;
  dir.normalize();

  const stepSize = 0.35;
  const steps = Math.floor(totalDist / stepSize);

  // Check intermediary points along the ray (excluding endpoints)
  for (let i = 1; i < steps; i++) {
    const px = start.x + dir.x * (i * stepSize);
    const py = start.y + dir.y * (i * stepSize);
    const pz = start.z + dir.z * (i * stepSize);

    const bx = Math.round(px);
    const by = Math.round(py);
    const bz = Math.round(pz);

    const block = world.getBlock(bx, by, bz);
    if (block !== BlockType.AIR) {
      return true; // Ray hit an opaque solid block
    }
  }

  return false;
}

/**
 * Checks line of sight from camera to opponent across 5 key body points.
 * Returns true if the opponent is completely occluded behind solid blocks.
 */
export function isOpponentOccluded(
  eyePos: THREE.Vector3,
  opponentPos: THREE.Vector3,
  world: VoxelWorld,
  bufferDistance = 4.5
): { occluded: boolean; isInBuffer: boolean; dist: number } {
  const dist = eyePos.distanceTo(opponentPos);

  // 1. Proximity Buffer rule: if within bufferDistance (<5m), never occlude (prevents pop-in)
  if (dist <= bufferDistance) {
    return { occluded: false, isInBuffer: true, dist };
  }

  // 2. Key target points on player body (Steve height is ~1.8m)
  const targetPoints = [
    new THREE.Vector3(opponentPos.x, opponentPos.y + 1.6, opponentPos.z),      // Head
    new THREE.Vector3(opponentPos.x, opponentPos.y + 1.1, opponentPos.z),      // Chest
    new THREE.Vector3(opponentPos.x, opponentPos.y + 0.2, opponentPos.z),      // Feet
    new THREE.Vector3(opponentPos.x - 0.35, opponentPos.y + 1.1, opponentPos.z), // Left shoulder
    new THREE.Vector3(opponentPos.x + 0.35, opponentPos.y + 1.1, opponentPos.z), // Right shoulder
  ];

  // If ALL target points are blocked by voxels, the opponent is completely behind walls
  const allBlocked = targetPoints.every(pt => isRayBlockedByVoxels(eyePos, pt, world));

  return { occluded: allBlocked, isInBuffer: false, dist };
}

/**
 * Sets depthTest and renderOrder on all meshes inside a character model
 * to make the 3D player mesh render through walls (Chams style, no boxes/lines).
 */
export function applyEspToCharacterModel(mesh: THREE.Object3D, espEnabled: boolean) {
  mesh.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      if (Array.isArray(m.material)) {
        m.material.forEach((mat) => {
          mat.depthTest = !espEnabled;
          mat.depthWrite = !espEnabled;
          mat.needsUpdate = true;
        });
      } else if (m.material) {
        m.material.depthTest = !espEnabled;
        m.material.depthWrite = !espEnabled;
        m.material.needsUpdate = true;
      }
      m.renderOrder = espEnabled ? 9999 : 0;
    }
  });
}

export class EspManager {
  public espEnabled = false;
  public antiEspEnabled = true;
  public fakeFovBypass = false;
  public currentStatus: OcclusionStatus = 'no_opponent';
  public currentDistance = 0;
  private lastEspApplied = false;

  public toggleEsp(enabled?: boolean): boolean {
    this.espEnabled = enabled !== undefined ? enabled : !this.espEnabled;
    return this.espEnabled;
  }

  public toggleAntiEsp(enabled?: boolean): boolean {
    this.antiEspEnabled = enabled !== undefined ? enabled : !this.antiEspEnabled;
    return this.antiEspEnabled;
  }

  public toggleFakeFovBypass(enabled?: boolean): boolean {
    this.fakeFovBypass = enabled !== undefined ? enabled : !this.fakeFovBypass;
    return this.fakeFovBypass;
  }

  public update(
    camera: THREE.PerspectiveCamera,
    opponentMesh: THREE.Object3D | null,
    world: VoxelWorld,
    isOpponentAlive = true
  ) {
    if (!opponentMesh || !isOpponentAlive) {
      this.currentStatus = 'no_opponent';
      this.currentDistance = 0;
      return;
    }

    // Apply or remove ESP material state when changed
    if (this.espEnabled !== this.lastEspApplied) {
      applyEspToCharacterModel(opponentMesh, this.espEnabled);
      this.lastEspApplied = this.espEnabled;
    }

    // Calculate line-of-sight & occlusion
    const { occluded, isInBuffer, dist } = isOpponentOccluded(
      camera.position,
      opponentMesh.position,
      world,
      4.5
    );
    this.currentDistance = Math.round(dist * 10) / 10;

    if (this.fakeFovBypass) {
      // Fake FOV Bypass simulation: Client cheat claims the target is in direct line-of-sight
      // BUT because the server raycast anti-cheat checks voxels independently,
      // the real occlusion status is still occluded/blocked.
      if (occluded && this.antiEspEnabled) {
        this.currentStatus = 'occluded';
        // Anti-ESP ignores client fake claim and keeps opponent hidden
        opponentMesh.visible = false;
      } else {
        this.currentStatus = isInBuffer ? 'buffer' : (occluded ? 'occluded' : 'visible');
        opponentMesh.visible = true;
      }
    } else {
      if (isInBuffer) {
        this.currentStatus = 'buffer';
        opponentMesh.visible = true;
      } else if (occluded) {
        this.currentStatus = 'occluded';
        // If Anti-ESP is enabled, hide the opponent mesh entirely (Server-side Occlusion Culling)
        opponentMesh.visible = !this.antiEspEnabled;
      } else {
        this.currentStatus = 'visible';
        opponentMesh.visible = true;
      }
    }
  }

  public getState(): EspState {
    return {
      espEnabled: this.espEnabled,
      antiEspEnabled: this.antiEspEnabled,
      fakeFovBypass: this.fakeFovBypass,
      status: this.currentStatus,
      distance: this.currentDistance,
    };
  }
}
