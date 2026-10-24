import * as THREE from 'three';
import { BlockType, HotbarItem } from '../../types/game';
import { InteractionContext } from './interactionHandler';
import { BlockPlacePacket } from '../anticheat/types';
import { PlacementPredictionTracker } from './placementPredictionTracker';
import { BridgePlaceTarget } from './bridgeHelper';

export function evaluateAndSendBlockPlacement(
  ctx: InteractionContext,
  target: BridgePlaceTarget,
  currentItem: HotbarItem,
  tracker: PlacementPredictionTracker
): boolean {
  const pp = target.placePos;
  const blockType = currentItem.blockType || BlockType.WHITE_WOOL;
  const isVisualOnly = currentItem.id === 'wool_visual' || Boolean(currentItem.name && currentItem.name.includes('(Visual)'));

  const camDir = new THREE.Vector3();
  ctx.camera.getWorldDirection(camDir);

  if (ctx.antiCheat) {
    const packet: BlockPlacePacket = {
      position: pp.clone(),
      faceNormal: target.faceNormal.clone(),
      playerPos: ctx.player.position.clone(),
      cameraDir: camDir,
      cameraPos: ctx.camera.position.clone(),
      blockType: blockType,
      timestamp: performance.now(),
    };
    const isAllowed = ctx.antiCheat.evaluatePlacement(packet, ctx.world, isVisualOnly);
    if (!isAllowed) return false;
  }

  ctx.world.setBlock(pp.x, pp.y, pp.z, blockType, true);

  const k = tracker.getKey(pp.x, pp.y, pp.z);
  const existingEntry = tracker.get(k);
  if (existingEntry && existingEntry.timeoutId !== undefined) {
    clearTimeout(existingEntry.timeoutId);
  }

  const packetData = {
    x: pp.x,
    y: pp.y,
    z: pp.z,
    type: blockType,
    isVisual: isVisualOnly,
    faceNormal: { x: target.faceNormal.x, y: target.faceNormal.y, z: target.faceNormal.z },
    cameraDir: { x: camDir.x, y: camDir.y, z: camDir.z },
    cameraPos: { x: ctx.camera.position.x, y: ctx.camera.position.y, z: ctx.camera.position.z },
  };

  // Only set a rollback timeout if online network is actively connected to prevent local/practice block removal
  let rollbackTimer: any = undefined;
  if (ctx.network && ctx.network.isConnected) {
    rollbackTimer = setTimeout(() => {
      // Keep block locally unless server explicitly sends block:rejected
      tracker.confirmPlacement(pp.x, pp.y, pp.z);
    }, 5000);
  }

  tracker.set(k, { timeoutId: rollbackTimer, isSent: true, packet: packetData, dependentKeys: [] });
  if (ctx.network && ctx.network.isConnected) {
    ctx.network.sendBlockPlace(packetData);
  }

  return true;
}
