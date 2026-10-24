import { ServerPlayerData, Vector3D, CheckResult } from './types';
import { isServerRayBlockedByVoxels } from './serverWorldBlocks';

export interface CombatHitPayload {
  targetTeam: 'red' | 'blue';
  damage: number;
  dir: Vector3D;
  targetPos?: Vector3D;
}

/**
 * Server-side Combat, Reach & KillAura Detector
 * Detects:
 * - Wall-Hit (Attacking through solid voxel blocks / obstacles)
 * - Angle / FOV Hack (KillAura hitting outside of facing direction)
 * - Reach Hack (Attacking from > 3.9 blocks away)
 * - KillAura / Auto-Clicker (Extreme CPS attack speed)
 * - Damage Multiplier / Instant Kill Hacks (Abnormal damage values)
 */
export class CombatDetector {
  private static readonly MAX_REACH_DISTANCE = 3.9; // Strict 3.9m (legit Minecraft reach is 3.0m, 3.9m allows ping)
  private static readonly MAX_SINGLE_HIT_DAMAGE = 40; // Max allowed damage per single hit
  private static readonly MAX_ATTACKS_PER_SEC = 14;   // Max allowed attack hits per second

  public static checkHit(
    attacker: ServerPlayerData,
    attackerPos: Vector3D,
    hitData: CombatHitPayload,
    attackerTeam?: 'red' | 'blue',
    now: number = Date.now(),
    authoritativeTargetPos?: Vector3D,
    roomBlocks?: Array<{ x: number; y: number; z: number }>
  ): CheckResult {
    // 1. Team check (Cannot attack own team member in 1v1 Bed Wars)
    if (attackerTeam && hitData.targetTeam === attackerTeam) {
      return {
        allowed: false,
        violation: {
          category: 'COMBAT',
          rule: 'Friendly Fire / Invalid Target',
          weight: 2.0,
          details: `Attempted to hit own team member (${attackerTeam})`,
          timestamp: now,
        },
      };
    }

    // 2. Damage Hack / One-Hit Kill Mod Check
    if (hitData.damage > this.MAX_SINGLE_HIT_DAMAGE || hitData.damage <= 0) {
      return {
        allowed: false,
        violation: {
          category: 'COMBAT',
          rule: 'Damage Hack / Abnormal Hit Value',
          weight: 5.0,
          details: `Sent abnormal damage value of ${hitData.damage}`,
          timestamp: now,
        },
      };
    }

    // 3. Combat Reach & Line-of-Sight Checks
    const targetPos = authoritativeTargetPos || hitData.targetPos;
    if (targetPos) {
      const dX = targetPos.x - attackerPos.x;
      const dY = targetPos.y - attackerPos.y;
      const dZ = targetPos.z - attackerPos.z;
      const distance = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

      // Reach check
      if (distance > this.MAX_REACH_DISTANCE) {
        return {
          allowed: false,
          violation: {
            category: 'COMBAT',
            rule: 'Combat Reach / Far Hit',
            weight: 4.5,
            details: `Hit target from ${distance.toFixed(2)} blocks away (max: ${this.MAX_REACH_DISTANCE}m)`,
            timestamp: now,
          },
        };
      }

      // Wall-Hit (Line of sight check through solid voxels)
      const attackerEyePos = {
        x: attackerPos.x,
        y: attackerPos.y + 1.62,
        z: attackerPos.z,
      };

      // Test 3 points on victim: Head, Chest, Feet
      const targetHead = { x: targetPos.x, y: targetPos.y + 1.5, z: targetPos.z };
      const targetChest = { x: targetPos.x, y: targetPos.y + 1.1, z: targetPos.z };
      const targetFeet = { x: targetPos.x, y: targetPos.y + 0.3, z: targetPos.z };

      const headBlocked = isServerRayBlockedByVoxels(attackerEyePos, targetHead, roomBlocks);
      const chestBlocked = isServerRayBlockedByVoxels(attackerEyePos, targetChest, roomBlocks);
      const feetBlocked = isServerRayBlockedByVoxels(attackerEyePos, targetFeet, roomBlocks);

      if (headBlocked && chestBlocked && feetBlocked) {
        return {
          allowed: false,
        };
      }

      // 4. Direction / Look Angle Check (KillAura / Blind attack detector)
      const distXZ = Math.hypot(dX, dZ);
      if (distXZ > 0.4) {
        let lookX = hitData.dir ? hitData.dir.x : -Math.sin(attacker.lastRot || 0);
        let lookZ = hitData.dir ? hitData.dir.z : -Math.cos(attacker.lastRot || 0);
        const lookLen = Math.hypot(lookX, lookZ);

        if (lookLen > 0.01) {
          lookX /= lookLen;
          lookZ /= lookLen;
          const toTargetX = dX / distXZ;
          const toTargetZ = dZ / distXZ;
          const dot = Math.max(-1, Math.min(1, lookX * toTargetX + lookZ * toTargetZ));
          const angleDeg = Math.acos(dot) * (180 / Math.PI);

          // If the attacker is looking more than 38 degrees away from the target
          if (angleDeg > 38) {
            return {
              allowed: false,
              violation: {
                category: 'COMBAT',
                rule: 'Angle / Impossible Attack Direction (KillAura)',
                weight: 4.0,
                details: `Attack direction was ${angleDeg.toFixed(1)}° off-target (max: 38°)`,
                timestamp: now,
              },
            };
          }
        }
      }
    }

    // 5. CPS / Killaura Frequency Check
    if (now - attacker.lastAttackResetTime > 1000) {
      attacker.attackCountWindow = 0;
      attacker.lastAttackResetTime = now;
    }
    attacker.attackCountWindow += 1;

    if (attacker.attackCountWindow > this.MAX_ATTACKS_PER_SEC) {
      return {
        allowed: false,
        violation: {
          category: 'COMBAT',
          rule: 'Auto-Clicker / Killaura Burst',
          weight: 3.5,
          details: `Executed ${attacker.attackCountWindow} attacks in 1 second`,
          timestamp: now,
        },
      };
    }

    attacker.lastAttackTime = now;
    return { allowed: true };
  }
}
