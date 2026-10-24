import * as THREE from 'three';
import { VoxelWorld } from '../world/voxelWorld';

/**
 * Exact Minecraft Java sneak mechanics:
 * Player bounding box radius is 0.3.
 * When on ground and sneaking, movement is evaluated on each axis.
 * If moving in a direction would make all contact points under the bounding box fall off solid ground,
 * that movement axis is blocked, keeping the player securely at the edge.
 */
export function hasGroundUnderBoundingBox(
  px: number,
  py: number,
  pz: number,
  radius: number,
  world: VoxelWorld
): boolean {
  const checkY = Math.floor(py - 0.1);
  const minX = Math.floor(px - radius + 0.5);
  const maxX = Math.floor(px + radius + 0.4999);
  const minZ = Math.floor(pz - radius + 0.5);
  const maxZ = Math.floor(pz + radius + 0.4999);

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      if (world.isSolid(x, checkY, z)) {
        if (
          px + radius > x - 0.5 &&
          px - radius < x + 0.5 &&
          pz + radius > z - 0.5 &&
          pz - radius < z + 0.5
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export function hasGroundUnderSneak(
  px: number,
  py: number,
  pz: number,
  world: VoxelWorld
): boolean {
  const checkY = Math.floor(py - 0.1);
  const margin = 0.22; // Minecraft Java faithful ledge overhang

  for (let dy = 0; dy >= -1; dy--) {
    const y = checkY + dy;
    const minX = Math.floor(px - 0.5 - margin);
    const maxX = Math.floor(px + 0.5 + margin);
    const minZ = Math.floor(pz - 0.5 - margin);
    const maxZ = Math.floor(pz + 0.5 + margin);

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (world.isSolid(x, y, z)) {
          if (
            px >= x - 0.5 - margin &&
            px <= x + 0.5 + margin &&
            pz >= z - 0.5 - margin &&
            pz <= z + 0.5 + margin
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function applySneakEdgeConstraint(
  currentPos: THREE.Vector3,
  velocity: THREE.Vector3,
  dt: number,
  world: VoxelWorld,
  isSneaking: boolean,
  isGrounded: boolean
): { allowedVx: number; allowedVz: number } {
  if (!isSneaking || !isGrounded) {
    return { allowedVx: velocity.x, allowedVz: velocity.z };
  }

  let allowedVx = velocity.x;
  let allowedVz = velocity.z;

  // 1. Testa movimento em X: se o passo ultrapassa o bloco para o vazio, reduz até a borda segura
  const stepX = velocity.x * dt;
  if (stepX !== 0) {
    const testX = currentPos.x + stepX;
    if (!hasGroundUnderSneak(testX, currentPos.y, currentPos.z, world)) {
      let safeFactor = 0;
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 6; i++) {
        const mid = (lo + hi) * 0.5;
        if (hasGroundUnderSneak(currentPos.x + stepX * mid, currentPos.y, currentPos.z, world)) {
          safeFactor = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      allowedVx = dt > 0 ? (stepX * safeFactor) / dt : 0;
    }
  }

  // 2. Testa movimento em Z: se o passo ultrapassa o bloco para o vazio, reduz até a borda segura
  const stepZ = velocity.z * dt;
  if (stepZ !== 0) {
    const nextX = currentPos.x + allowedVx * dt;
    const testZ = currentPos.z + stepZ;
    if (!hasGroundUnderSneak(nextX, currentPos.y, testZ, world)) {
      let safeFactor = 0;
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 6; i++) {
        const mid = (lo + hi) * 0.5;
        if (hasGroundUnderSneak(nextX, currentPos.y, currentPos.z + stepZ * mid, world)) {
          safeFactor = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      allowedVz = dt > 0 ? (stepZ * safeFactor) / dt : 0;
    }
  }

  // 3. Testa movimento diagonal
  if (allowedVx !== 0 && allowedVz !== 0) {
    const diagX = currentPos.x + allowedVx * dt;
    const diagZ = currentPos.z + allowedVz * dt;
    if (!hasGroundUnderSneak(diagX, currentPos.y, diagZ, world)) {
      if (hasGroundUnderSneak(diagX, currentPos.y, currentPos.z, world)) {
        allowedVz = 0;
      } else if (hasGroundUnderSneak(currentPos.x, currentPos.y, diagZ, world)) {
        allowedVx = 0;
      } else {
        allowedVx = 0;
        allowedVz = 0;
      }
    }
  }

  return { allowedVx, allowedVz };
}
