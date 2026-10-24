import * as THREE from 'three';
import { VoxelWorld } from '../world/voxelWorld';
import { checkBlockOverlap, getBlockBounds } from './voxelCollision';

export function resolveVerticalMovement(
  pos: THREE.Vector3,
  vel: THREE.Vector3,
  dt: number,
  radius: number,
  height: number,
  world: VoxelWorld,
  isSneaking: boolean,
  isGrounded: boolean
): boolean {
  const nextY = pos.y + vel.y * dt;

  if (vel.y <= 0) {
    // When sneaking on a ledge or grounded, include the sneak margin (0.22) so the player
    // is solidly supported at the edge of the block and does not drop vertically.
    const effectiveR = (isSneaking && isGrounded) ? radius + 0.22 : radius;
    const minX = Math.floor(pos.x - effectiveR + 0.5);
    const maxX = Math.floor(pos.x + effectiveR + 0.4999);
    const minZ = Math.floor(pos.z - effectiveR + 0.5);
    const maxZ = Math.floor(pos.z + effectiveR + 0.4999);
    const checkMinY = Math.floor(nextY - 0.5);
    const checkMaxY = Math.floor(pos.y + 0.5);

    let highestTop = -999;
    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        for (let y = checkMinY; y <= checkMaxY; y++) {
          const bounds = getBlockBounds(x, y, z, world);
          if (bounds) {
            const top = bounds.maxY;
            // Player lands on block top smoothly when falling through or reaching the block surface
            const isCrossing = pos.y >= top - 0.05 && nextY <= top + 0.001;
            const isDescendingClose = pos.y >= top - 0.45 && nextY <= top + 0.001;
            // Step-up support when already grounded and walking onto a step
            const isStepUp = isGrounded && pos.y >= top - 0.6 && pos.y <= top + 0.1;

            if (isCrossing || isDescendingClose || isStepUp) {
              highestTop = Math.max(highestTop, top);
            }
          }
        }
      }
    }

    if (highestTop > -900) {
      pos.y = highestTop;
      vel.y = 0;
      return true;
    }

    // No ground under player — free fall
    pos.y = nextY;
    return false;
  } else {
    // vel.y > 0 (jumping upwards into air or ceiling)
    if (!checkBlockOverlap(pos.x, nextY, pos.z, radius, height, world)) {
      pos.y = nextY;
    } else {
      // Hit ceiling: clamp right below ceiling block
      const minCheckX = Math.floor(pos.x - radius + 0.5);
      const maxCheckX = Math.floor(pos.x + radius + 0.4999);
      const minCheckZ = Math.floor(pos.z - radius + 0.5);
      const maxCheckZ = Math.floor(pos.z + radius + 0.4999);
      const checkY = Math.floor(nextY + height + 0.4999);

      let lowestCeiling = 999;
      for (let x = minCheckX; x <= maxCheckX; x++) {
        for (let z = minCheckZ; z <= maxCheckZ; z++) {
          const bounds = getBlockBounds(x, checkY, z, world);
          if (bounds && bounds.minY > pos.y + height - 0.5) {
            lowestCeiling = Math.min(lowestCeiling, bounds.minY);
          }
        }
      }

      if (lowestCeiling < 900) {
        pos.y = lowestCeiling - height - 0.0001;
      }
      vel.y = 0;
    }
    return false;
  }
}
