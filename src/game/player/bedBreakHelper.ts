import * as THREE from 'three';
import { BlockType } from '../../types/game';
import { sounds } from '../audio/soundManager';
import { InteractionContext } from './interactionHandler';

export function handleBedBreakEvent(ctx: InteractionContext, bp: THREE.Vector3, brokenType: BlockType) {
  sounds.playBedBreak();
  const bedTeam = brokenType === BlockType.BED_RED ? 'red' : 'blue';
  const otherZ = bedTeam === 'red' ? (bp.z === 25 ? 26 : 25) : (bp.z === -25 ? -26 : -25);
  ctx.world.removeBlock(bp.x, bp.y, otherZ);
  ctx.particles.spawnBreakExplosion(new THREE.Vector3(bp.x, bp.y, otherZ), brokenType);
  ctx.network.sendBedBreak(bedTeam);
  ctx.onBedDestroyed(bedTeam, ctx.getMatchInfo().myTeam);
}
