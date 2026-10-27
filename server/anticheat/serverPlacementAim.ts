import { ServerPlayerData } from './types';
import { isSolidBlockOnServer } from './serverWorldBlocks';

type Cell = { x: number; y: number; z: number };
type Blocks = Array<Cell> | undefined;

const FACES: Cell[] = [
  { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
];
const EYE_HEIGHT = 1.62;
const MAX_RAY = 6.6;
const STEP = 0.05;
const SPREAD = 0.31; // ~18° de tolerância pela rotação já ter alguns ms de atraso

// O bloco novo precisa encostar numa FACE de um bloco sólido (diagonal não vale)
export function hasFaceSupport(b: Cell, roomBlocks: Blocks): boolean {
  return FACES.some(f => isSolidBlockOnServer(b.x + f.x, b.y + f.y, b.z + f.z, roomBlocks));
}

export function hasAnyNeighbor(b: Cell, roomBlocks: Blocks): boolean {
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        if (isSolidBlockOnServer(b.x + dx, b.y + dy, b.z + dz, roomBlocks)) return true;
      }
  return false;
}

// Célula onde um bloco cairia se o jogador clicasse com essa mira (primeiro bloco sólido + face de entrada)
function expectedPlaceCell(ox: number, oy: number, oz: number, yaw: number, pitch: number, roomBlocks: Blocks): Cell | null {
  const dx = -Math.sin(yaw) * Math.cos(pitch);
  const dy = Math.sin(pitch);
  const dz = -Math.cos(yaw) * Math.cos(pitch);
  let prev: Cell = { x: Math.round(ox), y: Math.round(oy), z: Math.round(oz) };
  for (let t = STEP; t <= MAX_RAY; t += STEP) {
    const cx = Math.round(ox + dx * t);
    const cy = Math.round(oy + dy * t);
    const cz = Math.round(oz + dz * t);
    if (cx === prev.x && cy === prev.y && cz === prev.z) continue;
    if (isSolidBlockOnServer(cx, cy, cz, roomBlocks)) {
      const axes: Array<['x' | 'y' | 'z', number]> = [];
      if (prev.x !== cx) axes.push(['x', Math.abs(dx)]);
      if (prev.y !== cy) axes.push(['y', Math.abs(dy)]);
      if (prev.z !== cz) axes.push(['z', Math.abs(dz)]);
      axes.sort((a, b) => b[1] - a[1]);
      const axis = axes[0] ? axes[0][0] : 'y';
      const out: Cell = { x: cx, y: cy, z: cz };
      out[axis] += prev[axis] - { x: cx, y: cy, z: cz }[axis];
      return out;
    }
    prev = { x: cx, y: cy, z: cz };
  }
  return null;
}

// Confere, pela rotação conhecida pelo servidor, se o jogador está mirando onde está colocando o bloco
export function isAimingAtPlacement(player: ServerPlayerData, b: Cell, roomBlocks: Blocks): boolean {
  const pos = player.lastPos;
  const yaw = player.lastRot || 0;
  const pitch = player.lastPitch || 0;

  // (a) o raio da mira (com pequena tolerância) tem que cair exatamente na célula do bloco
  const ox = pos.x, oy = pos.y + EYE_HEIGHT, oz = pos.z;
  for (const dyaw of [-SPREAD, 0, SPREAD]) {
    for (const dpitch of [-SPREAD, 0, SPREAD]) {
      const cell = expectedPlaceCell(ox, oy, oz, yaw + dyaw, pitch + dpitch, roomBlocks);
      if (cell && cell.x === b.x && cell.y === b.y && cell.z === b.z) return true;
    }
  }

  // (b) auxílio de ponte do jogo: olhando para baixo, bloco ao lado de um bloco sólido sob os pés, no nível dos pés
  if (pitch < -0.03) {
    const feetY = Math.round(pos.y - 0.5);
    if (b.y === feetY) {
      const bx = Math.floor(pos.x + 0.5);
      const bz = Math.floor(pos.z + 0.5);
      for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const s = { x: b.x + sx, y: feetY, z: b.z + sz };
        if (Math.abs(s.x - bx) <= 1 && Math.abs(s.z - bz) <= 1 && isSolidBlockOnServer(s.x, s.y, s.z, roomBlocks)) return true;
      }
    }
  }
  return false;
}
