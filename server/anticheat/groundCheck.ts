import { isSolidBlockOnServer } from './placementDetector';

export function checkServerFootprint(
  x: number,
  y: number,
  z: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>,
  isSneaking = false
): boolean {
  // Bounding box horizontal (raio 0.52 cobre o bloco completo de 1.0m mais margem de 0.02m)
  const r = isSneaking ? 0.75 : 0.52;
  const feetBlockY = Math.floor(y - 0.85);

  // Checa a camada onde estão os pés e uma camada abaixo
  for (let dy = 0; dy >= -1; dy--) {
    const by = feetBlockY + dy;
    const topY = by + 0.5;

    // Pés do jogador (y - 0.9) apoiados na superfície ou acabando de decolar no pulo (y entre topY + 0.60 e topY + 1.25)
    if (y >= topY + 0.55 && y <= topY + 1.30) {
      const minX = Math.floor(x - r + 0.5);
      const maxX = Math.floor(x + r + 0.4999);
      const minZ = Math.floor(z - r + 0.5);
      const maxZ = Math.floor(z + r + 0.4999);

      for (let bx = minX; bx <= maxX; bx++) {
        for (let bz = minZ; bz <= maxZ; bz++) {
          if (isSolidBlockOnServer(bx, by, bz, roomBlocks)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export interface BlockSupportReport {
  isSupported: boolean;
  nearestBlock: { x: number; y: number; z: number; distY: number; distXZ: number } | null;
  description: string;
}

export function getDetailedBlockSupport(
  x: number,
  y: number,
  z: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>,
  isSneaking = false
): BlockSupportReport {
  const isSupported = checkServerFootprint(x, y, z, roomBlocks, isSneaking);
  if (isSupported) {
    const feetBlockY = Math.floor(y - 0.4);
    return {
      isSupported: true,
      nearestBlock: { x: Math.floor(x + 0.5), y: feetBlockY, z: Math.floor(z + 0.5), distY: 0, distXZ: 0 },
      description: `Apoiado sobre bloco sólido em Y=${feetBlockY}`,
    };
  }

  // Find nearest solid block below or around player within radius
  let nearest: { x: number; y: number; z: number; distY: number; distXZ: number } | null = null;
  let minTotalDist = Infinity;

  const playerFeetY = y - 0.9;
  const feetBlockY = Math.floor(playerFeetY);

  for (let dy = 0; dy >= -5; dy--) {
    const by = feetBlockY + dy;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const bx = Math.floor(x + 0.5) + dx;
        const bz = Math.floor(z + 0.5) + dz;
        if (isSolidBlockOnServer(bx, by, bz, roomBlocks)) {
          const topSurfaceY = by + 0.5;
          const distY = playerFeetY - topSurfaceY;
          const distXZ = Math.hypot(x - bx, z - bz);
          const totalDist = Math.hypot(distXZ, Math.max(0, distY));
          if (totalDist < minTotalDist) {
            minTotalDist = totalDist;
            nearest = { x: bx, y: by, z: bz, distY: Math.max(0, distY), distXZ };
          }
        }
      }
    }
  }

  if (nearest) {
    return {
      isSupported: false,
      nearestBlock: nearest,
      description: `Sem apoio direto (No Ar). Bloco mais próximo em (${nearest.x}, ${nearest.y}, ${nearest.z}) a ${nearest.distY.toFixed(2)}m abaixo (${nearest.distXZ.toFixed(2)}m horiz)`,
    };
  }

  return {
    isSupported: false,
    nearestBlock: null,
    description: `No ar livre / Void (Nenhum bloco sólido encontrado em raio de 5m)`,
  };
}
