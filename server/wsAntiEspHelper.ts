import { ClientSocket, send, broadcastMatch } from './matchmaking';
import { ServerAntiCheatEngine } from './anticheat/serverAntiCheat';
import { isServerRayBlockedByVoxels } from './anticheat/serverWorldBlocks';

export function broadcastMovementWithAntiEsp(
  ws: ClientSocket,
  roomId: string,
  match: any,
  msg: any,
  antiCheat: ServerAntiCheatEngine
) {
  if (match && match.players && match.players.length > 1) {
    for (const other of match.players) {
      if (other === ws || !other.id) continue;
      const otherData = antiCheat.getPlayerData(other.id);
      if (otherData && otherData.lastPos && msg.pos) {
        const dist = Math.hypot(msg.pos.x - otherData.lastPos.x, msg.pos.y - otherData.lastPos.y, msg.pos.z - otherData.lastPos.z);
        // If outside buffer distance (> 5.0m) and completely occluded behind solid blocks
        const isOccluded = dist > 5.0 && isServerRayBlockedByVoxels(
          { x: otherData.lastPos.x, y: otherData.lastPos.y + 1.62, z: otherData.lastPos.z },
          { x: msg.pos.x, y: msg.pos.y + 1.1, z: msg.pos.z },
          match.blocks
        );
        if (isOccluded) {
          send(other, 'player:moved', { id: ws.id, team: ws.team, occluded: true });
        } else {
          send(other, 'player:moved', { id: ws.id, team: ws.team, pos: msg.pos, rot: msg.rot, occluded: false });
        }
      } else {
        send(other, 'player:moved', { id: ws.id, team: ws.team, pos: msg.pos, rot: msg.rot });
      }
    }
  } else {
    broadcastMatch(roomId, 'player:moved', { id: ws.id, team: ws.team, pos: msg.pos, rot: msg.rot }, ws);
  }
}
