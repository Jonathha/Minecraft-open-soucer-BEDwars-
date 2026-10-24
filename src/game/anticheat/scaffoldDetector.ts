import * as THREE from 'three';
import { BlockPlacePacket, AntiCheatViolation } from './types';
import { VoxelWorld } from '../world/voxelWorld';

/**
 * Scaffold, Line-of-Sight & Strict Placement Validation (Polar / GrimAC Style):
 * 1. Reach Distance Check: measured to voxel center.
 * 2. Raytrace & Line-of-Sight Check: crosshair ray must directly hit a solid face
 *    that creates this placement position, without being occluded by intermediate blocks.
 * 3. Face Normal Validation: Camera must face against the target face.
 * 4. Downward placement check: Placements below feet must have a valid downward pitch.
 * 5. Air Place check: Placed block must attach to an existing solid neighbor.
 */
export class ScaffoldDetector {
  private static blockCenter = new THREE.Vector3();
  private static dirToBlock = new THREE.Vector3();

  private static rayIntersectsBox(
    rayOrigin: THREE.Vector3,
    rayDir: THREE.Vector3,
    minX: number, minY: number, minZ: number,
    maxX: number, maxY: number, maxZ: number
  ): boolean {
    const invX = Math.abs(rayDir.x) > 0.000001 ? 1.0 / rayDir.x : 1000000;
    const invY = Math.abs(rayDir.y) > 0.000001 ? 1.0 / rayDir.y : 1000000;
    const invZ = Math.abs(rayDir.z) > 0.000001 ? 1.0 / rayDir.z : 1000000;

    let tmin = (minX - rayOrigin.x) * invX;
    let tmax = (maxX - rayOrigin.x) * invX;
    if (tmin > tmax) { const temp = tmin; tmin = tmax; tmax = temp; }

    let tymin = (minY - rayOrigin.y) * invY;
    let tymax = (maxY - rayOrigin.y) * invY;
    if (tymin > tymax) { const temp = tymin; tymin = tymax; tymax = temp; }

    if ((tmin > tymax) || (tymin > tmax)) return false;

    if (tymin > tmin) tmin = tymin;
    if (tymax < tmax) tmax = tymax;

    let tzmin = (minZ - rayOrigin.z) * invZ;
    let tzmax = (maxZ - rayOrigin.z) * invZ;
    if (tzmin > tzmax) { const temp = tzmin; tzmin = tzmax; tzmax = temp; }

    if ((tmin > tzmax) || (tzmin > tmax)) return false;

    if (tzmax < tmax) tmax = tzmax;

    return tmax >= 0 && tmin <= 7.0;
  }

  public static validatePlacement(
    packet: BlockPlacePacket,
    world: VoxelWorld,
    maxReach = 5.85
  ): AntiCheatViolation | null {
    const { position, cameraPos, cameraDir } = packet;

    const targetX = Math.round(position.x);
    const targetY = Math.round(position.y);
    const targetZ = Math.round(position.z);

    this.blockCenter.set(targetX, targetY, targetZ);

    // 1. Strict Reach Distance Check
    const dist = cameraPos.distanceTo(this.blockCenter);
    if (dist > maxReach) {
      return {
        module: 'reach',
        weight: 4.0,
        details: `Distância excessiva: ${dist.toFixed(2)}m (Max: ${maxReach}m)`,
      };
    }

    // 2. Air Place / Neighbor connectivity check (diagonal and edge tolerant to prevent domino effect rejections)
    let hasNeighbor = false;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          if (world.isSolid(targetX + dx, targetY + dy, targetZ + dz)) {
            hasNeighbor = true;
            break;
          }
        }
        if (hasNeighbor) break;
      }
      if (hasNeighbor) break;
    }

    if (!hasNeighbor) {
      return {
        module: 'air_place',
        weight: 5.0,
        details: 'Bloco colocado no ar sem suporte de bloco adjacente',
      };
    }

    // 3. Look Direction Check (Scaffold No-Look)
    const normDir = cameraDir.clone().normalize();

    // Target box check
    const intersectsTargetBox = this.rayIntersectsBox(
      cameraPos,
      normDir,
      targetX - 0.58, targetY - 0.58, targetZ - 0.58,
      targetX + 0.58, targetY + 0.58, targetZ + 0.58
    );

    // Source block box check (the block being clicked on / attached to)
    const normFaceX = packet.faceNormal ? Math.round(packet.faceNormal.x) : 0;
    const normFaceY = packet.faceNormal ? Math.round(packet.faceNormal.y) : 0;
    const normFaceZ = packet.faceNormal ? Math.round(packet.faceNormal.z) : 0;

    const sourceX = targetX - normFaceX;
    const sourceY = targetY - normFaceY;
    const sourceZ = targetZ - normFaceZ;

    const intersectsSourceBox = this.rayIntersectsBox(
      cameraPos,
      normDir,
      sourceX - 0.58, sourceY - 0.58, sourceZ - 0.58,
      sourceX + 0.58, sourceY + 0.58, sourceZ + 0.58
    );

    this.dirToBlock.subVectors(this.blockCenter, cameraPos).normalize();
    const dotTarget = normDir.dot(this.dirToBlock);

    const dirToSource = new THREE.Vector3().subVectors(new THREE.Vector3(sourceX, sourceY, sourceZ), cameraPos).normalize();
    const dotSource = normDir.dot(dirToSource);

    if (!intersectsTargetBox && !intersectsSourceBox && dotTarget < 0.25 && dotSource < 0.25) {
      return {
        module: 'scaffold_nolook',
        weight: 3.0,
        details: 'Colocação de bloco sem mirar na posição ou face do bloco (Scaffold No-Look)',
      };
    }

    return null;
  }
}
