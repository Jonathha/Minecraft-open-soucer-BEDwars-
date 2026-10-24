import * as THREE from 'three';
import { VoxelWorld } from '../world/voxelWorld';
import { BlockType } from '../../types/game';
import { applySneakEdgeConstraint } from './sneakPhysics';
import { resolveVerticalMovement } from './verticalCollision';

export interface CollisionResult {
  isGrounded: boolean;
}

export interface BlockBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export function getBlockBounds(x: number, y: number, z: number, world: VoxelWorld): BlockBounds | null {
  const type = world.getBlock(x, y, z);
  if (type === BlockType.AIR) return null;
  const isBed = type === BlockType.BED_RED || type === BlockType.BED_BLUE;
  return {
    minX: x - 0.5,
    maxX: x + 0.5,
    minY: y - 0.5,
    maxY: isBed ? y + 0.0625 : y + 0.5,
    minZ: z - 0.5,
    maxZ: z + 0.5,
  };
}

export function getRealBlockBounds(x: number, y: number, z: number, world: VoxelWorld): BlockBounds | null {
  const type = world.getRealBlock(x, y, z);
  if (type === BlockType.AIR) return null;
  const isBed = type === BlockType.BED_RED || type === BlockType.BED_BLUE;
  return {
    minX: x - 0.5,
    maxX: x + 0.5,
    minY: y - 0.5,
    maxY: isBed ? y + 0.0625 : y + 0.5,
    minZ: z - 0.5,
    maxZ: z + 0.5,
  };
}

/**
 * Checks if the player is physically resting on an authentic solid block in world.blocks.
 * Validates against ghost blocks, air jumps, and ground spoofing.
 */
export function checkRealGroundSupport(
  px: number,
  py: number,
  pz: number,
  r: number,
  world: VoxelWorld,
  isSneaking = false
): boolean {
  const effectiveR = isSneaking ? r + 0.22 : r;
  const minX = Math.floor(px - effectiveR + 0.5);
  const maxX = Math.floor(px + effectiveR + 0.4999);
  const minZ = Math.floor(pz - effectiveR + 0.5);
  const maxZ = Math.floor(pz + effectiveR + 0.4999);
  const checkMinY = Math.floor(py - 0.65);
  const checkMaxY = Math.floor(py + 0.1);

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      for (let y = checkMinY; y <= checkMaxY; y++) {
        const bounds = getRealBlockBounds(x, y, z, world);
        if (!bounds) continue;

        const top = bounds.maxY;
        // Player feet are within contact range of the real solid surface
        if (py >= top - 0.15 && py <= top + 0.25) {
          if (
            px + effectiveR > bounds.minX &&
            px - effectiveR < bounds.maxX &&
            pz + effectiveR > bounds.minZ &&
            pz - effectiveR < bounds.maxZ
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Checks if the player's bounding box overlaps any solid block.
 * Uses a small skin margin (default 0.005m) to prevent false positives at surface boundaries.
 */
export function checkBlockOverlap(
  px: number,
  py: number,
  pz: number,
  r: number,
  h: number,
  world: VoxelWorld,
  margin = 0.005
): boolean {
  const pMinX = px - r;
  const pMaxX = px + r;
  const pMinY = py;
  const pMaxY = py + h;
  const pMinZ = pz - r;
  const pMaxZ = pz + r;

  const minX = Math.floor(pMinX + 0.5);
  const maxX = Math.floor(pMaxX + 0.4999);
  const minZ = Math.floor(pMinZ + 0.5);
  const maxZ = Math.floor(pMaxZ + 0.4999);
  const minY = Math.floor(pMinY + 0.5);
  const maxY = Math.floor(pMaxY + 0.4999);

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      for (let y = minY; y <= maxY; y++) {
        const bounds = getBlockBounds(x, y, z, world);
        if (!bounds) continue;
        if (
          pMaxX > bounds.minX + margin &&
          pMinX < bounds.maxX - margin &&
          pMaxY > bounds.minY + margin &&
          pMinY < bounds.maxY - margin &&
          pMaxZ > bounds.minZ + margin &&
          pMinZ < bounds.maxZ - margin
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Finds the nearest safe unoccupied position around a location (air feet + air head with solid ground below).
 */
export function findNearestSafeOpenPosition(
  pos: THREE.Vector3,
  world: VoxelWorld,
  radius = 0.28,
  height = 1.7
): THREE.Vector3 | null {
  const cx = Math.round(pos.x);
  const cy = Math.round(pos.y);
  const cz = Math.round(pos.z);

  let bestPos: THREE.Vector3 | null = null;
  let bestDistSq = Infinity;

  for (let dy = -2; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      for (let dz = -3; dz <= 3; dz++) {
        const bx = cx + dx;
        const by = cy + dy;
        const bz = cz + dz;

        // Ground must be solid
        if (!world.isSolid(bx, by - 1, bz)) continue;
        // Target feet block must be AIR
        if (world.isSolid(bx, by, bz)) continue;
        // Target head block must be AIR
        if (world.isSolid(bx, by + 1, bz)) continue;

        const candX = bx;
        const candY = by - 0.5 + 0.001; // standing on ground top
        const candZ = bz;

        // Check that player bounding box is clear at this position
        if (!checkBlockOverlap(candX, candY, candZ, radius, height, world, 0.02)) {
          const dSq = (candX - pos.x) ** 2 + (candY - pos.y) ** 2 + (candZ - pos.z) ** 2;
          if (dSq < bestDistSq) {
            bestDistSq = dSq;
            bestPos = new THREE.Vector3(candX, candY, candZ);
          }
        }
      }
    }
  }

  return bestPos;
}

/**
 * Physical depenetration pushout: if the player overlaps a solid block,
 * push them out along the shallowest penetration axis to keep them outside solid blocks.
 */
export function depenetratePlayer(
  pos: THREE.Vector3,
  radius: number,
  height: number,
  world: VoxelWorld
): void {
  const pMinX = pos.x - radius;
  const pMaxX = pos.x + radius;
  const pMinY = pos.y;
  const pMaxY = pos.y + height;
  const pMinZ = pos.z - radius;
  const pMaxZ = pos.z + radius;

  const minX = Math.floor(pMinX + 0.5);
  const maxX = Math.floor(pMaxX + 0.4999);
  const minZ = Math.floor(pMinZ + 0.5);
  const maxZ = Math.floor(pMaxZ + 0.4999);
  const minY = Math.floor(pMinY + 0.5);
  const maxY = Math.floor(pMaxY + 0.4999);

  let totalPushX = 0;
  let totalPushZ = 0;
  let totalPushY = 0;
  let overlapCount = 0;

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      for (let y = minY; y <= maxY; y++) {
        const bounds = getBlockBounds(x, y, z, world);
        if (!bounds) continue;

        const overlapX1 = pMaxX - bounds.minX;
        const overlapX2 = bounds.maxX - pMinX;
        const overlapY1 = pMaxY - bounds.minY;
        const overlapY2 = bounds.maxY - pMinY;
        const overlapZ1 = pMaxZ - bounds.minZ;
        const overlapZ2 = bounds.maxZ - pMinZ;

        if (
          overlapX1 > 0.005 &&
          overlapX2 > 0.005 &&
          overlapY1 > 0.005 &&
          overlapY2 > 0.005 &&
          overlapZ1 > 0.005 &&
          overlapZ2 > 0.005
        ) {
          overlapCount++;
          // Find minimal penetration axis
          const minPenX = overlapX1 < overlapX2 ? -overlapX1 : overlapX2;
          const minPenZ = overlapZ1 < overlapZ2 ? -overlapZ1 : overlapZ2;
          const minPenY = overlapY1 < overlapY2 ? -overlapY1 : overlapY2;

          const absX = Math.abs(minPenX);
          const absZ = Math.abs(minPenZ);
          const absY = Math.abs(minPenY);

          if (absX <= absZ && absX <= absY) {
            totalPushX += minPenX;
          } else if (absZ <= absX && absZ <= absY) {
            totalPushZ += minPenZ;
          } else {
            totalPushY += minPenY;
          }
        }
      }
    }
  }

  if (overlapCount > 0) {
    if (overlapCount >= 6) {
      // Heavily buried or suffocation bug: find nearest clear spot
      const safe = findNearestSafeOpenPosition(pos, world, radius, height);
      if (safe) {
        pos.copy(safe);
        return;
      }
    }
    // Apply shallowest pushout
    pos.x += totalPushX * 1.05;
    pos.z += totalPushZ * 1.05;
    pos.y += totalPushY * 1.05;
  }
}

export function resolvePlayerMovement(
  pos: THREE.Vector3,
  vel: THREE.Vector3,
  dt: number,
  radius: number,
  height: number,
  world: VoxelWorld,
  isSneaking: boolean,
  isGrounded: boolean
): CollisionResult {
  // 1. Sneak edge prevention constraint (Java Edition style)
  const { allowedVx, allowedVz } = applySneakEdgeConstraint(
    pos,
    vel,
    dt,
    world,
    isSneaking,
    isGrounded
  );
  vel.x = allowedVx;
  vel.z = allowedVz;

  // 2. Resolve X movement with continuous face clamping
  const stepX = vel.x * dt;
  if (stepX !== 0) {
    const nextX = pos.x + stepX;
    if (!checkBlockOverlap(nextX, pos.y, pos.z, radius, height, world)) {
      pos.x = nextX;
    } else {
      // Clamp precisely to the block face
      let clampedX = pos.x;
      const minCheckZ = Math.floor(pos.z - radius + 0.5);
      const maxCheckZ = Math.floor(pos.z + radius + 0.4999);
      const minCheckY = Math.floor(pos.y + 0.5);
      const maxCheckY = Math.floor(pos.y + height + 0.4999);

      if (stepX > 0) {
        const checkX = Math.floor(pos.x + radius + stepX + 0.5);
        for (let z = minCheckZ; z <= maxCheckZ; z++) {
          for (let y = minCheckY; y <= maxCheckY; y++) {
            const bounds = getBlockBounds(checkX, y, z, world);
            if (bounds && bounds.minX > pos.x) {
              clampedX = Math.min(clampedX, bounds.minX - radius - 0.0001);
            }
          }
        }
      } else {
        const checkX = Math.floor(pos.x - radius + stepX + 0.5);
        for (let z = minCheckZ; z <= maxCheckZ; z++) {
          for (let y = minCheckY; y <= maxCheckY; y++) {
            const bounds = getBlockBounds(checkX, y, z, world);
            if (bounds && bounds.maxX < pos.x) {
              clampedX = Math.max(clampedX, bounds.maxX + radius + 0.0001);
            }
          }
        }
      }

      if (!checkBlockOverlap(clampedX, pos.y, pos.z, radius, height, world)) {
        pos.x = clampedX;
      }
      vel.x = 0;
    }
  }

  // 3. Resolve Z movement with continuous face clamping
  const stepZ = vel.z * dt;
  if (stepZ !== 0) {
    const nextZ = pos.z + stepZ;
    if (!checkBlockOverlap(pos.x, pos.y, nextZ, radius, height, world)) {
      pos.z = nextZ;
    } else {
      // Clamp precisely to the block face
      let clampedZ = pos.z;
      const minCheckX = Math.floor(pos.x - radius + 0.5);
      const maxCheckX = Math.floor(pos.x + radius + 0.4999);
      const minCheckY = Math.floor(pos.y + 0.5);
      const maxCheckY = Math.floor(pos.y + height + 0.4999);

      if (stepZ > 0) {
        const checkZ = Math.floor(pos.z + radius + stepZ + 0.5);
        for (let x = minCheckX; x <= maxCheckX; x++) {
          for (let y = minCheckY; y <= maxCheckY; y++) {
            const bounds = getBlockBounds(x, y, checkZ, world);
            if (bounds && bounds.minZ > pos.z) {
              clampedZ = Math.min(clampedZ, bounds.minZ - radius - 0.0001);
            }
          }
        }
      } else {
        const checkZ = Math.floor(pos.z - radius + stepZ + 0.5);
        for (let x = minCheckX; x <= maxCheckX; x++) {
          for (let y = minCheckY; y <= maxCheckY; y++) {
            const bounds = getBlockBounds(x, y, checkZ, world);
            if (bounds && bounds.maxZ < pos.z) {
              clampedZ = Math.max(clampedZ, bounds.maxZ + radius + 0.0001);
            }
          }
        }
      }

      if (!checkBlockOverlap(pos.x, pos.y, clampedZ, radius, height, world)) {
        pos.z = clampedZ;
      }
      vel.z = 0;
    }
  }

  // 4. Resolve Y movement
  const grounded = resolveVerticalMovement(
    pos,
    vel,
    dt,
    radius,
    height,
    world,
    isSneaking,
    isGrounded
  );

  // 5. Anti-clip depenetration (guarantees player never remains inside blocks)
  depenetratePlayer(pos, radius, height, world);

  return { isGrounded: grounded };
}
