// Barreira atrás de cada ilha base: |z| máximo permitido para andar/construir (igual ao cliente).
export const ARENA_BARRIER_Z = 33;

export function isSolidBlockOnServer(
  x: number,
  y: number,
  z: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): boolean {
  const rx = Math.round(x);
  const ry = Math.round(y);
  const rz = Math.round(z);

  // 1. Check lobby/legacy ground base (floor at y = 0, surface at 0.5)
  if (ry <= 0 && Math.abs(rx) <= 17 && Math.abs(rz) <= 17) {
    return true;
  }

  // 2. Check Red Base Island (Center 0, 10, 22; radius 9; floor at Y in 2..10)
  if (ry >= 2 && ry <= 10 && Math.hypot(rx, rz - 22) <= 9) {
    return true;
  }
  // Red Bed & Shops at Y = 11
  if (ry === 11) {
    if (rx === 0 && (rz === 25 || rz === 26)) return true; // Bed
    if ((rx === -4 || rx === 4) && rz === 22) return true; // Shops
  }

  // 3. Check Blue Base Island (Center 0, 10, -22; radius 9; floor at Y in 2..10)
  if (ry >= 2 && ry <= 10 && Math.hypot(rx, rz + 22) <= 9) {
    return true;
  }
  // Blue Bed & Shops at Y = 11
  if (ry === 11) {
    if (rx === 0 && (rz === -25 || rz === -26)) return true; // Bed
    if ((rx === -4 || rx === 4) && rz === -22) return true; // Shops
  }

  // 4. Diamond (x = -6) & Emerald (x = 6) generators on each base island (Y = 11..12)
  if ((ry === 11 || ry === 12) && Math.abs(rz) === 25 && Math.abs(rx) === 6) return true;

  // Check Central Bridging Highway / Bot's Bridge (Center bridge at x = 0, y = 11, z in -15..15)
  if (rx === 0 && ry === 11 && rz >= -15 && rz <= 15) {
    return true;
  }

  // 7. Check match placed blocks (authoritative server blocks)
  if (roomBlocks && roomBlocks.length > 0) {
    for (let i = 0; i < roomBlocks.length; i++) {
      const b = roomBlocks[i];
      if (
        (Math.round(b.x) === rx && Math.round(b.y) === ry && Math.round(b.z) === rz) ||
        (Math.abs(b.x - x) < 0.45 && Math.abs(b.y - y) < 0.45 && Math.abs(b.z - z) < 0.45)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Authoritative Server Line-Of-Sight raycast across world and placed voxels.
 * Returns true if any solid voxel obstructs the line between start and target.
 */
export function isServerRayBlockedByVoxels(
  start: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): boolean {
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  const dz = target.z - start.z;
  const dist = Math.hypot(dx, dy, dz);
  if (dist < 0.35) return false;

  const stepSize = 0.3;
  const steps = Math.floor(dist / stepSize);

  // Check intermediate points along the ray, skipping the immediate vicinity of endpoints
  for (let i = 1; i < steps; i++) {
    const px = start.x + (dx / dist) * (i * stepSize);
    const py = start.y + (dy / dist) * (i * stepSize);
    const pz = start.z + (dz / dist) * (i * stepSize);

    if (isSolidBlockOnServer(px, py, pz, roomBlocks)) {
      return true;
    }
  }

  return false;
}
