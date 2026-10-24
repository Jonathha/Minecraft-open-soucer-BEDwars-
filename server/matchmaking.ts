import { WebSocket } from 'ws';

export interface ClientSocket extends WebSocket {
  id?: string;
  room?: string;
  name?: string;
  team?: 'red' | 'blue';
  initializedRoom?: string;
  lastSeen?: number;
}

export interface MatchRoom {
  players: ClientSocket[];
  blocks: { x: number; y: number; z: number; type: number }[];
  redBed: boolean;
  blueBed: boolean;
}

export const queue: ClientSocket[] = [];
export const matches = new Map<string, MatchRoom>();

export function send(ws: WebSocket, type: string, data: Record<string, unknown> = {}) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...data }));
  }
}

export function broadcastMatch(roomId: string, type: string, data: Record<string, unknown> = {}, exclude?: WebSocket) {
  const match = matches.get(roomId);
  if (!match) return;
  for (const client of match.players) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, ...data }));
    }
  }
}

export function checkMatchTimeouts() {
  const now = Date.now();
  for (const [roomId, match] of Array.from(matches.entries())) {
    if (match.players.length === 2) {
      const p1 = match.players[0];
      const p2 = match.players[1];

      const p1Inactive = p1.readyState !== WebSocket.OPEN || (p1.lastSeen && (now - p1.lastSeen > 20000));
      const p2Inactive = p2.readyState !== WebSocket.OPEN || (p2.lastSeen && (now - p2.lastSeen > 20000));

      if (p1Inactive && !p2Inactive) {
        if (p2.readyState === WebSocket.OPEN) {
          send(p2, 'opponent:left', { team: p1.team, reason: 'timeout' });
        }
        matches.delete(roomId);
      } else if (p2Inactive && !p1Inactive) {
        if (p1.readyState === WebSocket.OPEN) {
          send(p1, 'opponent:left', { team: p2.team, reason: 'timeout' });
        }
        matches.delete(roomId);
      } else if (p1Inactive && p2Inactive) {
        matches.delete(roomId);
      }
    }
  }
}

export function tryMatchmaking() {
  while (queue.length >= 2) {
    const p1 = queue.shift()!;
    const p2 = queue.shift()!;
    if (p1.readyState !== WebSocket.OPEN) continue;
    if (p2.readyState !== WebSocket.OPEN) { queue.unshift(p1); continue; }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    p1.room = roomId; p1.team = 'red';
    p2.room = roomId; p2.team = 'blue';

    matches.set(roomId, {
      players: [p1, p2],
      blocks: [],
      redBed: true,
      blueBed: true
    });

    send(p1, 'match:found', { roomId, team: 'red', opponentName: p2.name || 'Player 2' });
    send(p2, 'match:found', { roomId, team: 'blue', opponentName: p1.name || 'Player 1' });
  }
}
