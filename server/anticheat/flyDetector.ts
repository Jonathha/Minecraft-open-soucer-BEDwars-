import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { updateFlyState } from './flyStateHelper';
import { checkSneakSpeed } from './sneakSpeedChecker';
import { checkSpeedHack } from './speedHackChecker';
import { checkYFly } from './yFlyChecker';
import { checkHighJump } from './highJumpChecker';
import { checkHoverFly } from './hoverFlyChecker';
import { checkRepeatedSetback } from './repeatedSetbackChecker';
import { checkFallBoost } from './fallBoostChecker';

export class FlyDetector {
  public static checkMovement(
    player: ServerPlayerData,
    newPos: Vector3D,
    now: number,
    roomBlocks?: Array<{ x: number; y: number; z: number }>,
    keys?: { sneak?: boolean },
    isGroundedClient?: boolean
  ): CheckResult {
    if (player.teleportBypassUntil && now < player.teleportBypassUntil) {
      if (player.lastLegitGroundedPos && Math.hypot(newPos.x - player.lastLegitGroundedPos.x, newPos.z - player.lastLegitGroundedPos.z) < 2.5) {
        player.airTicks = 0;
        return { allowed: true };
      }
    }

    if (!player.lastPos) {
      player.lastLegitGroundedPos = { ...newPos };
      return { allowed: true };
    }

    const state = updateFlyState(player, newPos, now, roomBlocks, keys, isGroundedClient);
    if (!state) return { allowed: true };

    const { prevPos, speed, dXZ, dY, prevDY, timeDelta, isSneaking, isKnockbackActive, isBurstPacket, isStandingOnServerBlock, isFalling } = state;

    const res = checkSneakSpeed(player, newPos, prevPos, speed, dXZ, isSneaking, isKnockbackActive, now, roomBlocks)
      || checkSpeedHack(player, newPos, prevPos, speed, dXZ, isKnockbackActive, isBurstPacket, now, roomBlocks)
      || checkYFly(player, newPos, prevPos, dY, timeDelta, isKnockbackActive, isBurstPacket, now, roomBlocks)
      || checkHighJump(player, newPos, prevPos, dY, isKnockbackActive, isStandingOnServerBlock, Boolean(isGroundedClient), isFalling, now, roomBlocks)
      || checkFallBoost(player, newPos, prevPos, dY, prevDY, dXZ, isKnockbackActive, isStandingOnServerBlock, now, roomBlocks)
      || checkRepeatedSetback(player, newPos, prevPos, isStandingOnServerBlock, Boolean(isGroundedClient), isFalling, now, roomBlocks)
      || checkHoverFly(player, newPos, prevPos, dXZ, dY, isStandingOnServerBlock, Boolean(isGroundedClient), isKnockbackActive, now, roomBlocks);

    if (res) {
      player.lastSetbackTime = now;
      player.setbackStreak = (player.setbackStreak || 0) + 1;
      return res;
    }

    return { allowed: true };
  }
}
