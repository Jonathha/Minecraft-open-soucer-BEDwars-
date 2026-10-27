import { WebSocket } from 'ws';
import { ServerPlayerData, CheckResult, Vector3D } from './types';

export function validateBedBreak(
  ws: WebSocket & { id?: string; team?: 'red' | 'blue' },
  player: ServerPlayerData,
  targetTeam: 'red' | 'blue',
  match: { redBed: boolean; blueBed: boolean; blocks?: Array<{ x: number; y: number; z: number }> }
): CheckResult {
  if (targetTeam !== 'red' && targetTeam !== 'blue') return { allowed: false };
  if (ws.team && ws.team === targetTeam) {
    return {
      allowed: false,
      violation: {
        category: 'PLACEMENT',
        rule: 'Friendly Bed Destruction / Self Bed Break',
        weight: 3.0,
        details: `Attempted to break own team bed (${targetTeam})`,
        timestamp: Date.now(),
      },
    };
  }

  const bedIntact = targetTeam === 'red' ? match.redBed : match.blueBed;
  if (!bedIntact) {
    return { allowed: false };
  }

  const bedPos = targetTeam === 'red' ? { x: 0, y: 11, z: 25 } : { x: 0, y: 11, z: -25 };
  const playerPos = player.lastPos;
  const dX = bedPos.x - playerPos.x;
  const dY = bedPos.y - playerPos.y;
  const dZ = bedPos.z - playerPos.z;
  const dist = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

  if (dist > 6.0) {
    return {
      allowed: false,
      violation: {
        category: 'PLACEMENT',
        rule: 'Bed Break Reach / Far Distance',
        weight: 5.0,
        details: `Attempted to break bed from ${dist.toFixed(2)}m away (max: 6.0m)`,
        timestamp: Date.now(),
      },
    };
  }

  // A cama só pode ser quebrada se ao menos uma face estiver exposta (sem bloco colocado por jogador)
  if (match.blocks) {
    const blocks = match.blocks;
    const sign = targetTeam === 'red' ? 1 : -1;
    const has = (x: number, y: number, z: number) =>
      blocks.some(b => Math.round(b.x) === x && Math.round(b.y) === y && Math.round(b.z) === z);
    const cells: Array<[number, number, number]> = [[0, 11, 24 * sign], [0, 11, 27 * sign]];
    for (const z of [25 * sign, 26 * sign]) cells.push([0, 12, z], [-1, 11, z], [1, 11, z]);
    if (cells.every(([x, y, z]) => has(x, y, z))) return { allowed: false };
  }

  return { allowed: true };
}

export function validateBlockBreak(
  player: ServerPlayerData,
  pos: Vector3D,
  roomBlocks?: Array<{ x: number; y: number; z: number }>
): CheckResult {
  const now = Date.now();
  if (!player.lastBreakResetTime || now - player.lastBreakResetTime > 1000) {
    player.lastBreakResetTime = now;
    player.breakCountWindow = 0;
  }
  player.breakCountWindow = (player.breakCountWindow || 0) + 1;
  if (player.breakCountWindow > 12) {
    return {
      allowed: false,
      violation: {
        category: 'PLACEMENT',
        rule: 'Nuker / Break Burst',
        weight: 3.0,
        details: `Quebrou ${player.breakCountWindow} blocos em 1 segundo`,
        timestamp: now,
      },
    };
  }

  const playerPos = player.lastPos;
  const dX = pos.x - playerPos.x;
  const dY = pos.y - playerPos.y;
  const dZ = pos.z - playerPos.z;
  const dist = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

  if (dist > 6.0) {
    return {
      allowed: false,
      violation: {
        category: 'PLACEMENT',
        rule: 'Block Break Reach / Far Mining',
        weight: 3.5,
        details: `Attempted to break block at (${pos.x}, ${pos.y}, ${pos.z}) from ${dist.toFixed(2)}m away`,
        timestamp: Date.now(),
      },
    };
  }

  // Só blocos colocados por jogadores (os do servidor) podem ser quebrados
  if (!roomBlocks) return { allowed: false };
  const rx = Math.round(pos.x);
  const ry = Math.round(pos.y);
  const rz = Math.round(pos.z);
  const idx = roomBlocks.findIndex(
    b => Math.round(b.x) === rx && Math.round(b.y) === ry && Math.round(b.z) === rz
  );
  if (idx === -1) return { allowed: false };
  roomBlocks.splice(idx, 1);

  return { allowed: true };
}
