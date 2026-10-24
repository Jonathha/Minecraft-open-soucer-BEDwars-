import { ClientSocket, send, broadcastMatch } from './matchmaking';
import { ServerAntiCheatEngine } from './anticheat/serverAntiCheat';

export function handleBlockPlace(
  ws: ClientSocket,
  roomId: string,
  match: any,
  msg: any,
  antiCheat: ServerAntiCheatEngine
) {
  if (!msg.block) return;
  const normalizedBlock = {
    x: Math.round(msg.block.x),
    y: Math.round(msg.block.y),
    z: Math.round(msg.block.z),
    type: msg.block.type,
    isVisual: msg.block.isVisual,
  };
  const check = antiCheat.processBlockPlace(ws, normalizedBlock, match.blocks);
  if (!check.allowed) {
    send(ws, 'block:rejected', {
      pos: normalizedBlock,
      rule: check.violation?.rule || 'Placement Rejected',
      reason: check.violation?.details || 'Placement rejected by server anti-cheat',
      file: check.violation?.file || 'server/anticheat/placementDetector.ts',
      error: check.violation?.error || 'ERR_SERVER_PLACEMENT_REJECT',
      cause: check.violation?.cause || check.violation?.details || 'Servidor rejeitou a colocação do bloco.',
      details: check.violation ? {
        category: check.violation.category,
        weight: check.violation.weight,
        details: check.violation.details,
        file: check.violation.file,
        error: check.violation.error,
        cause: check.violation.cause,
      } : undefined,
    });
    return;
  }
  match.blocks.push(normalizedBlock);
  const pData = ws.id ? antiCheat.getPlayerData(ws.id) : undefined;
  if (pData) {
    pData.recentPlacedBlocks = pData.recentPlacedBlocks || [];
    pData.recentPlacedBlocks.push({ x: normalizedBlock.x, y: normalizedBlock.y, z: normalizedBlock.z, timestamp: Date.now() });
    if (pData.recentPlacedBlocks.length > 50) pData.recentPlacedBlocks.shift();
  }
  send(ws, 'block:confirmed', { block: normalizedBlock });
  broadcastMatch(roomId, 'block:placed', { block: normalizedBlock }, ws);
}
