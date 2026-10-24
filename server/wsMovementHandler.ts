import { ClientSocket, send } from './matchmaking';
import { ServerAntiCheatEngine } from './anticheat/serverAntiCheat';
import { PredictionAntiCheat } from './anticheat/predictionAntiCheat';
import { handleServerViolation } from './anticheat/serverViolationHandler';
import { rollbackLastPlacedBlock } from './wsRollbackBlock';
import { broadcastMovementWithAntiEsp } from './wsAntiEspHelper';

export function handlePlayerMovement(
  ws: ClientSocket,
  roomId: string,
  match: any,
  msg: any,
  antiCheat: ServerAntiCheatEngine
) {
  if (!msg.pos) return;
  const pData = ws.id ? antiCheat.getPlayerData(ws.id) : undefined;
  if (pData) {
    if (typeof msg.ping === 'number') pData.lastPing = Math.round(msg.ping);
    if (typeof msg.fps === 'number') pData.lastFps = Math.round(msg.fps);
    pData.lastClientGrounded = Boolean(msg.isGrounded);
  }
  if (msg.isTeleport && pData) {
    // Só aceita isTeleport se o servidor autorizou o teleporte previamente (ex: pérola validada ou respawn)
    if (pData.teleportBypassUntil && Date.now() < pData.teleportBypassUntil) {
      pData.lastPos = { ...msg.pos };
      pData.lastPosTime = Date.now();
      pData.lastLegitGroundedPos = { ...msg.pos };
      pData.lastGroundY = msg.pos.y;
      pData.airTicks = 0;
      pData.posHistory = [{ pos: { ...msg.pos }, timestamp: Date.now() }];
      if (ws.id) PredictionAntiCheat.handleRespawn(ws.id, msg.pos);
    }
  }
  const lastValidPos = pData && pData.lastPos ? { ...pData.lastPos } : undefined;

  const check = antiCheat.processMovement(ws, msg.pos, msg.rot || 0, match.blocks, msg.keys, msg.isGrounded);
  if (!check.allowed) {
    rollbackLastPlacedBlock(roomId, match, pData);
    const targetPos = check.setbackPos || (pData && pData.lastLegitGroundedPos ? pData.lastLegitGroundedPos : lastValidPos);
    if (targetPos) {
      send(ws, 'player:teleport', { pos: targetPos });
      if (pData) {
        pData.lastPos = { ...targetPos };
        pData.lastPosTime = Date.now();
        pData.teleportBypassUntil = 0; // Punição de infração NÃO concede bypass de teleporte
        pData.isFirstPacket = true;
        pData.posHistory = [{ pos: { ...targetPos }, timestamp: Date.now() }];
        if (ws.id) PredictionAntiCheat.handleRespawn(ws.id, targetPos);
      }
    }
    if (pData && check.violation) {
      handleServerViolation(ws, pData, check.violation, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
    }
    return;
  }

  if (pData && lastValidPos) {
    const predCheck = PredictionAntiCheat.validateMovement(pData, msg.pos, msg.rot || 0, msg.keys, msg.isGrounded, msg.dt, msg.velocity, match.blocks);
    if (!predCheck.allowed && predCheck.violation) {
      rollbackLastPlacedBlock(roomId, match, pData);
      const teleportPos = predCheck.setbackPos || (pData.lastLegitGroundedPos ? pData.lastLegitGroundedPos : lastValidPos);
      send(ws, 'player:teleport', { pos: teleportPos });
      pData.lastPos = { ...teleportPos };
      pData.lastPosTime = Date.now();
      pData.teleportBypassUntil = 0; // Punição de predição NÃO concede bypass de teleporte
      pData.isFirstPacket = true;
      pData.posHistory = [{ pos: { ...teleportPos }, timestamp: Date.now() }];
      if (ws.id) PredictionAntiCheat.handleRespawn(ws.id, teleportPos);
      handleServerViolation(ws, pData, predCheck.violation, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
      return;
    }
  }

  broadcastMovementWithAntiEsp(ws, roomId, match, msg, antiCheat);
}
