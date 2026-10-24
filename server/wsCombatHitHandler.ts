import { ClientSocket, broadcastMatch } from './matchmaking';
import { ServerAntiCheatEngine } from './anticheat/serverAntiCheat';

export function handleCombatHit(
  ws: ClientSocket,
  roomId: string,
  match: any,
  msg: any,
  antiCheat: ServerAntiCheatEngine
) {
  let targetPos: { x: number; y: number; z: number } | undefined = undefined;
  let targetWsId: string | undefined = undefined;

  if (match) {
    const targetWs = match.players.find((p: any) => p !== ws && p.team === msg.targetTeam);
    if (targetWs && targetWs.id) {
      targetWsId = targetWs.id;
      const targetData = antiCheat.getPlayerData(targetWs.id);
      if (targetData) targetPos = targetData.lastPos;
    }
  }

  const check = antiCheat.processCombatHit(
    ws,
    { targetTeam: msg.targetTeam, damage: msg.damage, dir: msg.dir, targetPos: msg.targetPos },
    targetPos,
    targetWsId,
    match ? match.blocks : undefined
  );
  if (!check.allowed) return;
  broadcastMatch(roomId, 'combat:damage', { targetTeam: msg.targetTeam, damage: msg.damage, dir: msg.dir });
}
