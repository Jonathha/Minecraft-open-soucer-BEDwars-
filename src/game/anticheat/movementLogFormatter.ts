import { BlockPlacePacket } from './types';
import { MovementLogEntry, TelemetrySample } from './movementLogger';

export function createPlacementLogEntries(
  packet: BlockPlacePacket,
  isAllowed: boolean,
  reason: string | undefined,
  now: number,
  placementCount: number,
  prePlacementSamples: TelemetrySample[]
): MovementLogEntry[] {
  const headerTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  const entries: MovementLogEntry[] = [];

  entries.push({
    id: Math.random().toString(36).substring(2),
    timestamp: now,
    formattedTime: headerTime,
    type: 'PLACEMENT_EVENT',
    category: isAllowed ? 'PLACE_OK' : 'PLACE_BLOCK',
    text: `\n========== 🔨 COLOCAÇÃO DE BLOCO #${placementCount} (${isAllowed ? 'APROVADO' : 'BLOQUEADO: ' + (reason || 'Scaffold')}) ==========`
  });

  entries.push({
    id: Math.random().toString(36).substring(2),
    timestamp: now,
    formattedTime: headerTime,
    type: 'PLACEMENT_PRE_3S',
    category: 'MOVE',
    text: `--- ⏱️ HISTÓRICO 3 SEGUNDOS ANTES (${prePlacementSamples.length} amostras) ---`
  });

  for (const s of prePlacementSamples) {
    const timeDiff = ((s.timestamp - now) / 1000).toFixed(2);
    entries.push({
      id: Math.random().toString(36).substring(2),
      timestamp: s.timestamp,
      formattedTime: s.timeStr,
      type: 'MOVEMENT',
      category: s.isSneaking ? 'SNEAK' : 'MOVE',
      text: `[${timeDiff}s] POS:(${s.posX}, ${s.posY}, ${s.posZ}) | YAW:${s.yawDeg}° PITCH:${s.pitchDeg}° | VEL:(${s.vx}, ${s.vy}, ${s.vz}) | SHIFT:${s.isSneaking ? 'SIM' : 'NÃO'} | CHÃO:${s.isGrounded ? 'SIM' : 'NÃO'} | TECLAS:${s.keysPressed}`
    });
  }

  const targetX = Math.round(packet.position.x);
  const targetY = Math.round(packet.position.y);
  const targetZ = Math.round(packet.position.z);
  const faceN = `(${packet.faceNormal.x}, ${packet.faceNormal.y}, ${packet.faceNormal.z})`;
  const playerPosStr = `(${packet.playerPos.x.toFixed(2)}, ${packet.playerPos.y.toFixed(2)}, ${packet.playerPos.z.toFixed(2)})`;
  const camDirStr = `(${packet.cameraDir.x.toFixed(2)}, ${packet.cameraDir.y.toFixed(2)}, ${packet.cameraDir.z.toFixed(2)})`;

  entries.push({
    id: Math.random().toString(36).substring(2),
    timestamp: now,
    formattedTime: headerTime,
    type: 'PLACEMENT_EVENT',
    category: isAllowed ? 'PLACE_OK' : 'PLACE_BLOCK',
    text: `🎯 AÇÃO COLOCAÇÃO: Bloco Alvo: (${targetX}, ${targetY}, ${targetZ}) | Face: ${faceN} | Pos Jogador: ${playerPosStr} | Dir Câmera: ${camDirStr} | RESULTADO: ${isAllowed ? '✅ PERMITIDO' : '🚫 BLOQUEADO'}`
  });

  return entries;
}
