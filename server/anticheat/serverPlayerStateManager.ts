import { ServerPlayerData, Vector3D } from './types';
import { TeleportDetector } from './tpDetector';

export function createInitialPlayerData(id: string): ServerPlayerData {
  const now = Date.now();
  return {
    id,
    lastPos: { x: 0, y: 0, z: 0 },
    lastPosTime: now,
    lastRot: 0,
    violationLevel: 0,
    violations: [],
    posHistory: [],
    airTicks: 0,
    lastGroundY: 0,
    packetTimestamps: [],
    suspendedDuration: 0,
    lastAttackTime: 0,
    attackCountWindow: 0,
    lastAttackResetTime: now,
    lastPlaceTime: 0,
    placeCountWindow: 0,
    lastPlaceResetTime: now,
    blockInventory: new Map([
      [6, 64],
      [7, 64],
      [8, 64]
    ]),
    resources: { iron: 18, gold: 4, diamond: 0, emerald: 0 },
    matchStartTime: now,
    lastResourceSyncTime: now,
    isFirstPacket: true,
  };
}

export function resetPlayerMatch(player: ServerPlayerData, initialPos?: Vector3D): void {
  const now = Date.now();
  player.blockInventory.clear();
  player.blockInventory.set(6, 64);
  player.blockInventory.set(7, 64);
  player.blockInventory.set(8, 64);
  player.resources = { iron: 18, gold: 4, diamond: 0, emerald: 0 };
  player.matchStartTime = now;
  player.lastResourceSyncTime = now;
  player.airTicks = 0;
  player.lastDY = 0;
  player.violationLevel = 0;
  player.knockbackUntil = undefined;
  player.isFirstPacket = true;
  player.packetTimestamps = [];
  player.placeCountWindow = 0;
  if (initialPos) {
    player.lastPos = { ...initialPos };
    player.lastGroundY = initialPos.y;
    player.lastPosTime = now;
  }
  TeleportDetector.clearHistory(player);
  if (initialPos) {
    player.posHistory = [{ pos: { ...initialPos }, timestamp: now }];
  }
}

export function resetPlayerRespawn(player: ServerPlayerData, initialPos?: Vector3D): void {
  const now = Date.now();
  player.blockInventory.set(6, Math.max(player.blockInventory.get(6) || 0, 64));
  player.blockInventory.set(7, Math.max(player.blockInventory.get(7) || 0, 64));
  player.blockInventory.set(8, Math.max(player.blockInventory.get(8) || 0, 64));
  player.resources = {
    iron: Math.max(player.resources.iron, 18),
    gold: Math.max(player.resources.gold, 4),
    diamond: player.resources.diamond,
    emerald: player.resources.emerald,
  };
  player.lastResourceSyncTime = now;
  player.airTicks = 0;
  player.lastDY = 0;
  player.violationLevel = 0;
  player.knockbackUntil = undefined;
  player.isFirstPacket = true;
  player.packetTimestamps = [];
  player.placeCountWindow = 0;
  if (initialPos) {
    player.lastPos = { ...initialPos };
    player.lastGroundY = initialPos.y;
    player.lastPosTime = now;
  }
  TeleportDetector.clearHistory(player);
  if (initialPos) {
    player.posHistory = [{ pos: { ...initialPos }, timestamp: now }];
  }
}
