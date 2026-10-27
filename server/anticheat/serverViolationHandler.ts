import { WebSocket } from 'ws';
import { ServerPlayerData, ServerViolation } from './types';

export function handleServerViolation(
  ws: WebSocket,
  player: ServerPlayerData,
  violation: ServerViolation,
  kickThreshold: number
): void {
  const now = Date.now();
  // Cada VL possui seu tempo separado (salvo por 3 segundos a mais: 5s + 3s = 8s)
  violation.expiresAt = now + 8000;
  player.violations.push(violation);
  if (player.violations.length > 50) player.violations.shift();

  // Recalcula o nível de violação com base nas infrações não expiradas
  player.violationLevel = player.violations
    .filter(v => (v.expiresAt || (v.timestamp + 8000)) > now)
    .reduce((sum, v) => sum + v.weight, 0);

  // Em produção o cliente não recebe regra, limites nem arquivos (ANTICHEAT_DEBUG=1 reativa para testes)
  const hideDetails = process.env.NODE_ENV === 'production' && process.env.ANTICHEAT_DEBUG !== '1';

  if (ws.readyState === WebSocket.OPEN && hideDetails) {
    ws.send(JSON.stringify({
      type: 'anticheat:flag',
      rule: violation.category,
      details: '',
      vl: player.violationLevel,
      category: violation.category,
      error: 'ERR_ANTICHEAT',
      file: '',
      cause: '',
      timestamp: violation.timestamp || now
    }));
  } else if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'anticheat:flag',
      rule: violation.rule,
      details: violation.details,
      vl: player.violationLevel,
      category: violation.category,
      error: violation.error || 'ERR_ILLEGAL_MOVEMENT',
      file: violation.file || 'server/anticheat/flyDetector.ts',
      cause: violation.cause || 'Movimento rejeitado pelas regras de física do servidor.',
      playerPos: violation.playerPos,
      blockSupport: violation.blockSupport,
      ping: violation.ping !== undefined ? violation.ping : player.lastPing,
      fps: violation.fps !== undefined ? violation.fps : player.lastFps,
      rttInfo: violation.rttInfo || (player.lastPing !== undefined ? `Latência Data Center (us-east1): ${player.lastPing}ms` : undefined),
      timestamp: violation.timestamp || now
    }));
  }

  if (player.violationLevel >= kickThreshold && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'anticheat:kick',
      reason: hideDetails ? 'Kicked by Server Anti-Cheat' : `Kicked by Server Anti-Cheat: ${violation.rule}`,
      details: hideDetails ? '' : violation.details
    }));
    ws.close(4001, 'Kicked by Anti-Cheat');
  }
}
