import { ServerAntiCheatEngine } from './anticheat/serverAntiCheat';
import { ClientSocket, queue, matches, send, broadcastMatch, tryMatchmaking } from './matchmaking';
import { handleMoveAndCombat, handleBlockAndBed } from './wsCombatBlockHandler';
import { PredictionAntiCheat } from './anticheat/predictionAntiCheat';
import { handleServerViolation } from './anticheat/serverViolationHandler';

export function handleWsMessage(ws: ClientSocket, raw: any, antiCheat: ServerAntiCheatEngine) {
  ws.lastSeen = Date.now();
  if (!ws.msgWindowStart || ws.lastSeen - ws.msgWindowStart > 1000) { ws.msgWindowStart = ws.lastSeen; ws.msgCount = 0; }
  ws.msgCount = (ws.msgCount || 0) + 1;
  if (ws.msgCount > 300) { ws.close(1008, 'Rate limit'); return; }
  try {
    const msg = JSON.parse(raw.toString());
    if (msg.type === 'queue:join') {
      ws.name = String(msg.name || 'Player').slice(0, 24);
      if (!queue.includes(ws)) queue.push(ws);
      send(ws, 'queue:status', { inQueue: true, position: queue.length });
      tryMatchmaking();
    } else if (msg.type === 'queue:leave') {
      const idx = queue.indexOf(ws);
      if (idx !== -1) queue.splice(idx, 1);
      send(ws, 'queue:status', { inQueue: false });
    } else if (msg.type === 'match:start') {
      // A sala vem do matchmaking (ws.room); o roomId enviado pelo cliente é ignorado
      const roomId = ws.room || `room_${ws.id}`;
      ws.room = roomId;
      ws.initializedRoom = roomId;
      const defaultSpawn = ws.team === 'blue' ? { x: 0, y: 12, z: -21 } : { x: 0, y: 12, z: 21 };
      // Com time definido pelo matchmaking o spawn é do servidor; só partida sem time (solo/teste) usa o spawn enviado
      const spawnPos = (!ws.team && msg.spawnPos && typeof msg.spawnPos.x === 'number' && typeof msg.spawnPos.y === 'number' && typeof msg.spawnPos.z === 'number')
        ? msg.spawnPos
        : defaultSpawn;
      if (!ws.team && spawnPos) ws.team = spawnPos.z < 0 ? 'blue' : 'red';
      if (ws.id) {
        antiCheat.resetPlayerMatchState(ws.id, spawnPos);
        PredictionAntiCheat.handleRespawn(ws.id, spawnPos);
        const startData = antiCheat.getPlayerData(ws.id);
        if (startData) { startData.awaitingRespawn = false; startData.deathTime = undefined; startData.spawnAnchor = { ...spawnPos }; }
      }

      const existingMatch = matches.get(roomId);
      if (!existingMatch) {
        matches.set(roomId, { players: [ws], blocks: [], redBed: true, blueBed: true });
      } else {
        if (!existingMatch.players.includes(ws)) {
          existingMatch.players.push(ws);
        }
      }
    } else if (msg.type === 'player:respawn') {
      const roomId = ws.room || `room_${ws.id}`;
      const respawnData = ws.id ? antiCheat.getPlayerData(ws.id) : undefined;
      let spawnPos = { x: 0, y: 1, z: 8 }; // lobby
      if (ws.initializedRoom) {
        // Em partida: só reaparece após uma morte registrada, com a cama viva e o atraso mínimo; o ponto é do servidor
        const room = matches.get(roomId);
        const ownBedAlive = !room || (ws.team === 'blue' ? room.blueBed : room.redBed);
        if (!respawnData || !respawnData.awaitingRespawn || !ownBedAlive || Date.now() - (respawnData.deathTime || 0) < 1000) return;
        spawnPos = ws.team === 'blue' ? { x: 0, y: 12, z: -21 } : { x: 0, y: 12, z: 21 };
        respawnData.awaitingRespawn = false;
        respawnData.deathTime = undefined;
        respawnData.spawnAnchor = { ...spawnPos };
      }
      if (ws.id) {
        antiCheat.resetPlayerRespawnState(ws.id, spawnPos);
        PredictionAntiCheat.handleRespawn(ws.id, spawnPos);
      }
      broadcastMatch(roomId, 'player:respawned', { id: ws.id, team: ws.team, pos: spawnPos }, ws);
    } else if (msg.type === 'pearl:throw') {
      const pData = ws.id ? antiCheat.getPlayerData(ws.id) : undefined;
      if (pData && msg.origin && typeof msg.origin.x === 'number' && typeof msg.origin.y === 'number' && typeof msg.origin.z === 'number') {
        const distFromPlayer = Math.hypot(msg.origin.x - pData.lastPos.x, msg.origin.z - pData.lastPos.z);
        if (distFromPlayer <= 4.0) {
          pData.activePearl = {
            origin: { ...msg.origin },
            throwTime: Date.now(),
            dir: msg.dir || { x: 0, y: 0, z: 0 }
          };
        }
      }
    } else if (msg.type === 'pearl:land') {
      const roomId = ws.room || `room_${ws.id}`;
      const pData = ws.id ? antiCheat.getPlayerData(ws.id) : undefined;
      const targetPos = msg.pos;
      const now = Date.now();

      if (!pData || !pData.activePearl) {
        // Teleporte sem lançamento registrado
        const setback = pData?.lastLegitGroundedPos || pData?.lastPos;
        if (setback) send(ws, 'player:teleport', { pos: setback });
        if (pData) {
          handleServerViolation(ws, pData, {
            category: 'TELEPORT',
            rule: 'Ender Pearl Spoof / Unregistered Throw',
            weight: 5.0,
            details: 'Tentativa de aterrissagem de Ender Pearl sem registro prévio de arremesso no servidor.',
            timestamp: now,
            file: 'server/wsMessageHandler.ts',
            error: 'ERR_UNREGISTERED_PEARL',
            cause: 'Cliente enviou pouso de pérola sem arremesso correspondente registrado pelo servidor.'
          }, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
        }
      } else {
        const pearl = pData.activePearl;
        const flightTime = (now - pearl.throwTime) / 1000;
        const dist = Math.hypot(targetPos.x - pearl.origin.x, targetPos.z - pearl.origin.z);
        const minFlightTime = Math.max(0.08, (dist / 32.0) - 0.25);

        // Validação física de voo balístico da pérola (alcance máximo ~52m e tempo mínimo de voo)
        if (dist > 52.0 || flightTime < minFlightTime || targetPos.y < -15.0) {
          pData.activePearl = undefined;
          const setback = pData.lastLegitGroundedPos || pData.lastPos;
          if (setback) send(ws, 'player:teleport', { pos: setback });
          handleServerViolation(ws, pData, {
            category: 'TELEPORT',
            rule: 'Ender Pearl Trajectory / Distance Spoof',
            weight: 5.0,
            details: `Teleporte de pérola impossível: dist=${dist.toFixed(1)}m em ${flightTime.toFixed(2)}s (mínimo=${minFlightTime.toFixed(2)}s, maxDist=52m)`,
            timestamp: now,
            file: 'server/wsMessageHandler.ts',
            error: 'ERR_PEARL_TRAJECTORY_SPOOF',
            cause: 'Tempo de voo ou alcance do teleporte divergiram da física balística oficial do servidor.'
          }, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
        } else {
          // Teleporte legítimo confirmado pelo servidor
          pData.activePearl = undefined;
          pData.teleportBypassUntil = now + 600; // Curto intervalo para sincronização de rede
          pData.lastPos = { ...targetPos };
          pData.lastPosTime = now;
          pData.lastLegitGroundedPos = { ...targetPos };
          pData.lastGroundY = targetPos.y;
          pData.airTicks = 0;
          pData.posHistory = [{ pos: { ...targetPos }, timestamp: now }];
          if (ws.id) PredictionAntiCheat.handleRespawn(ws.id, targetPos);
          broadcastMatch(roomId, 'player:teleported', { id: ws.id, team: ws.team, pos: targetPos }, ws);
        }
      }
    } else if (msg.type === 'player:teleport') {
      // Bloqueia tentativas ilegais de teleporte direto enviadas por clientes modificados
      const pData = ws.id ? antiCheat.getPlayerData(ws.id) : undefined;
      const setback = pData?.lastLegitGroundedPos || pData?.lastPos;
      if (setback) send(ws, 'player:teleport', { pos: setback });
      if (pData) {
        handleServerViolation(ws, pData, {
          category: 'TELEPORT',
          rule: 'Direct Teleport Spoof / Bypass Attempt',
          weight: 6.0,
          details: `Tentativa de teleporte direto desautorizado (X=${msg.pos?.x?.toFixed(1)}, Y=${msg.pos?.y?.toFixed(1)}, Z=${msg.pos?.z?.toFixed(1)})`,
          timestamp: Date.now(),
          file: 'server/wsMessageHandler.ts',
          error: 'ERR_DIRECT_TELEPORT_SPOOF',
          cause: 'Tentativa de forçar teleporte livre sem validação física de Ender Pearl no servidor.'
        }, ServerAntiCheatEngine.KICK_VL_THRESHOLD);
      }
    } else if (msg.type === 'ping:check') {
      send(ws, 'ping:reply', { clientTime: msg.clientTime, serverTime: Date.now() });
    } else if (msg.type === 'shop:buy') {
      if (msg.purchase) {
        const check = antiCheat.processShopBuy(ws, msg.purchase);
        if (!check.allowed) send(ws, 'shop:rejected', { itemId: msg.purchase.itemId });
        else send(ws, 'shop:confirmed', { itemId: msg.purchase.itemId });
      }
    } else if (msg.type === 'player:move' || msg.type === 'combat:hit') {
      handleMoveAndCombat(ws, msg, antiCheat);
    } else if (msg.type === 'block:place' || msg.type === 'block:break' || msg.type === 'bed:break') {
      handleBlockAndBed(ws, msg, antiCheat);
    } else if (msg.type === 'player:death') {
      const deathData = ws.id ? antiCheat.getPlayerData(ws.id) : undefined;
      if (!ws.initializedRoom || !deathData || deathData.awaitingRespawn) return;
      deathData.awaitingRespawn = true;
      deathData.deathTime = Date.now();
      const roomId = ws.room || `room_${ws.id}`;
      if (ws.id) antiCheat.resetPlayerDeathState(ws.id);
      broadcastMatch(roomId, 'player:died', { team: ws.team });
    } else if (msg.type === 'match:leave') {
      if (ws.room) {
        broadcastMatch(ws.room, 'opponent:left', { team: ws.team }, ws);
        matches.delete(ws.room);
        ws.room = undefined;
        ws.initializedRoom = undefined;
      }
      const qIdx = queue.indexOf(ws);
      if (qIdx !== -1) queue.splice(qIdx, 1);
      const lobbySpawn = { x: 0, y: 1, z: 8 };
      if (ws.id) {
        antiCheat.resetPlayerRespawnState(ws.id, lobbySpawn);
        PredictionAntiCheat.handleRespawn(ws.id, lobbySpawn);
      }
    }
  } catch {}
}

export function handleWsClose(ws: ClientSocket, antiCheat: ServerAntiCheatEngine) {
  if (ws.id) {
    antiCheat.unregisterPlayer(ws.id);
    PredictionAntiCheat.handleDisconnect(ws.id);
  }
  const qIdx = queue.indexOf(ws);
  if (qIdx !== -1) queue.splice(qIdx, 1);
  if (ws.room) {
    broadcastMatch(ws.room, 'opponent:left', { team: ws.team }, ws);
    matches.delete(ws.room);
  }
}
