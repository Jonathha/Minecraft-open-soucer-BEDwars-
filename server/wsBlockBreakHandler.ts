import { ClientSocket, broadcastMatch } from './matchmaking';
import { ServerAntiCheatEngine } from './anticheat/serverAntiCheat';

export function handleBlockAndBedBreak(
  ws: ClientSocket,
  roomId: string,
  match: any,
  msg: any,
  antiCheat: ServerAntiCheatEngine
) {
  if (msg.type === 'block:break') {
    if (!msg.pos || typeof msg.pos.x !== 'number' || typeof msg.pos.y !== 'number' || typeof msg.pos.z !== 'number') return;
    const check = antiCheat.processBlockBreak(ws, msg.pos, match ? match.blocks : undefined);
    if (!check.allowed) return;
    broadcastMatch(roomId, 'block:broken', { pos: msg.pos }, ws);
  } else if (msg.type === 'bed:break') {
    if (match) {
      const check = antiCheat.processBedBreak(ws, msg.team, match);
      if (!check.allowed) return;
      if (msg.team === 'red') match.redBed = false;
      if (msg.team === 'blue') match.blueBed = false;
    }
    broadcastMatch(roomId, 'bed:broken', { team: msg.team, by: ws.team });
  }
}
