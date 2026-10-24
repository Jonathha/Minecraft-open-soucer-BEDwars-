import { ServerAntiCheatEngine } from './anticheat/serverAntiCheat';
import { ClientSocket, matches } from './matchmaking';
import { handlePlayerMovement } from './wsMovementHandler';
import { handleCombatHit } from './wsCombatHitHandler';
import { handleBlockPlace } from './wsBlockPlaceHandler';
import { handleBlockAndBedBreak } from './wsBlockBreakHandler';

function getOrCreateMatch(ws: ClientSocket): { roomId: string; match: any } {
  const roomId = ws.room || `room_${ws.id}`;
  ws.room = roomId;
  let match = matches.get(roomId);
  if (!match) {
    match = { players: [ws], blocks: [], redBed: true, blueBed: true };
    matches.set(roomId, match);
  }
  return { roomId, match };
}

export function handleMoveAndCombat(ws: ClientSocket, msg: any, antiCheat: ServerAntiCheatEngine) {
  const { roomId, match } = getOrCreateMatch(ws);
  if (msg.type === 'player:move') {
    handlePlayerMovement(ws, roomId, match, msg, antiCheat);
  } else if (msg.type === 'combat:hit') {
    handleCombatHit(ws, roomId, match, msg, antiCheat);
  }
}

export function handleBlockAndBed(ws: ClientSocket, msg: any, antiCheat: ServerAntiCheatEngine) {
  const { roomId, match } = getOrCreateMatch(ws);
  if (msg.type === 'block:place') {
    handleBlockPlace(ws, roomId, match, msg, antiCheat);
  } else if (msg.type === 'block:break' || msg.type === 'bed:break') {
    handleBlockAndBedBreak(ws, roomId, match, msg, antiCheat);
  }
}
