import { PlayerController } from '../player/playerController';

export interface TelemetrySample {
  timestamp: number;
  timeStr: string;
  posX: number;
  posY: number;
  posZ: number;
  yawDeg: number;
  pitchDeg: number;
  vx: number;
  vy: number;
  vz: number;
  isGrounded: boolean;
  isSneaking: boolean;
  isMoving: boolean;
  keysPressed: string;
}

export interface MovementLogEntry {
  id: string;
  timestamp: number;
  formattedTime: string;
  type: 'MOVEMENT' | 'PLACEMENT_PRE_3S' | 'PLACEMENT_EVENT';
  text: string;
  category: 'MOVE' | 'SNEAK' | 'PLACE_OK' | 'PLACE_BLOCK';
}

export function recordPlayerTelemetrySample(player: PlayerController, rollingSamples: TelemetrySample[], maxRollingTimeMs: number) {
  const now = performance.now();
  const activeKeys: string[] = [];
  if (player.keys.forward) activeKeys.push('W');
  if (player.keys.backward) activeKeys.push('S');
  if (player.keys.left) activeKeys.push('A');
  if (player.keys.right) activeKeys.push('D');
  if (player.keys.jump) activeKeys.push('JUMP');
  if (player.keys.sneak) activeKeys.push('SHIFT');

  const yawDeg = Math.round((player.yaw * 180 / Math.PI) * 10) / 10;
  const pitchDeg = Math.round((player.pitch * 180 / Math.PI) * 10) / 10;

  const sample: TelemetrySample = {
    timestamp: now,
    timeStr: new Date().toLocaleTimeString('pt-BR', { hour12: false }) + '.' + Math.floor((now % 1000)).toString().padStart(3, '0'),
    posX: Math.round(player.position.x * 100) / 100,
    posY: Math.round(player.position.y * 100) / 100,
    posZ: Math.round(player.position.z * 100) / 100,
    yawDeg,
    pitchDeg,
    vx: Math.round(player.velocity.x * 100) / 100,
    vy: Math.round(player.velocity.y * 100) / 100,
    vz: Math.round(player.velocity.z * 100) / 100,
    isGrounded: player.isGrounded,
    isSneaking: player.isSneaking,
    isMoving: player.isMoving,
    keysPressed: activeKeys.length > 0 ? activeKeys.join('+') : 'NENHUMA',
  };

  rollingSamples.push(sample);
  const cutoff = now - maxRollingTimeMs;
  while (rollingSamples.length > 0 && rollingSamples[0].timestamp < cutoff) {
    rollingSamples.shift();
  }
}
