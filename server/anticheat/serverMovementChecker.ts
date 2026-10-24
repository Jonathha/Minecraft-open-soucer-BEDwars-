import { ServerPlayerData, CheckResult, Vector3D } from './types';
import { FlyDetector } from './flyDetector';
import { FakeLagDetector } from './fakeLagDetector';
import { TeleportDetector } from './tpDetector';
import { runAimbotMovementAnalysis } from './aimbotCheckHandler';

export function runMovementCheck(
  player: ServerPlayerData,
  pos: Vector3D,
  rot: number,
  roomBlocks?: Array<{ x: number; y: number; z: number }>,
  keys?: { forward?: boolean; backward?: boolean; left?: boolean; right?: boolean; jump?: boolean; sneak?: boolean },
  isGroundedClient?: boolean
): CheckResult {
  const now = Date.now();
  if (player.isFirstPacket || (player.teleportBypassUntil && now < player.teleportBypassUntil)) {
    player.isFirstPacket = false;
    player.lastPos = { ...pos };
    player.lastPosTime = now;
    player.lastRot = rot;
    player.lastGroundY = pos.y;
    if (!player.lastLegitGroundedPos) player.lastLegitGroundedPos = { ...pos };
    player.airTicks = 0;
    player.posHistory = [{ pos: { ...pos }, timestamp: now }];
    return { allowed: true };
  }

  const fakeLagResult = FakeLagDetector.checkPacketRateAndBlink(player, pos, now);
  if (!fakeLagResult.allowed && fakeLagResult.violation) return fakeLagResult;

  const flyResult = FlyDetector.checkMovement(player, pos, now, roomBlocks, keys, isGroundedClient);
  if (!flyResult.allowed && flyResult.violation) return flyResult;

  const tpResult = TeleportDetector.checkTeleport(player, pos, now);
  if (!tpResult.allowed && tpResult.violation) return tpResult;

  // Pass rotation to modern server-side aimbot tracker
  runAimbotMovementAnalysis(player, rot);

  player.lastPos = { ...pos };
  player.lastPosTime = now;
  player.lastRot = rot;
  return { allowed: true };
}
