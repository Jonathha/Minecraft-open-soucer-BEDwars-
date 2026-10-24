import * as THREE from 'three';
import { sounds } from '../audio/soundManager';
import { InteractionContext } from './interactionHandler';
import { isRayBlockedByVoxels } from '../anticheat/espManager';

export function handleNpcAndCombatInteractions(ctx: InteractionContext, raycaster: THREE.Raycaster): boolean {
  const state = ctx.getState();

  // 1. NPC interaction check
  const npcHit = ctx.npcs.checkInteraction(raycaster);
  if (npcHit === 'bedwars_1v1' && state === 'lobby') {
    sounds.playClick();
    ctx.network.joinQueue('Jogador');
    return true;
  }
  if (npcHit === 'test_arena' && state === 'lobby') {
    sounds.playClick();
    ctx.onStartTestArena?.();
    return true;
  }
  if ((npcHit === 'item_shop' || npcHit === 'upgrade_shop') && state === 'match') {
    sounds.playClick();
    ctx.onOpenShop?.(npcHit);
    return true;
  }

  // 2. PvP combat check
  const oppMesh = ctx.getOpponentMesh();
  if (state === 'match' && oppMesh) {
    const oppIntersects = raycaster.intersectObject(oppMesh, true);
    if (oppIntersects.length > 0) {
      const hitDistance = oppIntersects[0].distance;
      if (hitDistance > 3.85) {
        return false;
      }
      const hitPoint = oppIntersects[0].point;
      const eyePos = ctx.camera.position;

      // Physical voxel occlusion check: if blocked by a block, simply ignore the attack
      const voxelBlockHit = ctx.world.raycast(raycaster, hitDistance);
      const isBlocked = isRayBlockedByVoxels(eyePos, hitPoint, ctx.world);
      const blockDist = voxelBlockHit ? voxelBlockHit.point.distanceTo(eyePos) : Infinity;

      if (isBlocked || blockDist < hitDistance) {
        return false;
      }

      // Comprehensive AntiCheat verification (Reach, Anti-ESP occlusion, Aimbot Snap)
      if (ctx.antiCheat) {
        const combatCheck = ctx.antiCheat.evaluateCombatAttack(
          eyePos,
          hitPoint,
          hitDistance,
          ctx.world,
          oppMesh.visible
        );
        if (!combatCheck.allowed) {
          return false;
        }
      }

      sounds.playHit();
      const lookDir = new THREE.Vector3();
      ctx.camera.getWorldDirection(lookDir);
      const damage = ctx.getHotbar()[ctx.getSelectedSlot()]?.damage || 4;
      const bot = ctx.getBot();
      if (bot) {
        bot.takeDamage(damage, lookDir);
        if (!bot.isAlive) ctx.onOpponentDeath();
      } else {
        const oppTeam = ctx.getMatchInfo().myTeam === 'red' ? 'blue' : 'red';
        ctx.network.sendHit(oppTeam, damage, { x: lookDir.x, y: 0.2, z: lookDir.z }, { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z });
      }
      return true;
    }
  }

  return false;
}
