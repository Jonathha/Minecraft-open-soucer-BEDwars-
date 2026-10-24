import * as THREE from 'three';
import { BlockType } from '../../types/game';
import { GameEngine } from '../gameEngine';

export function performEdgeBridgePlacement(engine: GameEngine): boolean {
  if (engine.state !== 'match') return false;
  const hotbar = engine.hotbar;
  const currentItem = hotbar[engine.selectedSlot];
  const blockItem = (currentItem && currentItem.type === 'block')
    ? currentItem
    : hotbar.find(item => item && item.type === 'block');

  if (!blockItem || blockItem.count <= 0) return false;

  const playerPos = engine.player.position;
  const yaw = engine.player.yaw;
  const backwardX = Math.sin(yaw);
  const backwardZ = Math.cos(yaw);

  const placeX = Math.round(playerPos.x + backwardX * 0.8);
  const placeY = Math.round(playerPos.y - 1);
  const placeZ = Math.round(playerPos.z + backwardZ * 0.8);

  if (engine.world.isSolid(placeX, placeY, placeZ)) return false;

  const blockType = blockItem.blockType || BlockType.WHITE_WOOL;
  const camDir = new THREE.Vector3();
  engine.camera.getWorldDirection(camDir);

  const packet = {
    position: new THREE.Vector3(placeX, placeY, placeZ),
    faceNormal: new THREE.Vector3(0, 1, 0),
    playerPos: playerPos.clone(),
    cameraDir: camDir,
    cameraPos: engine.camera.position.clone(),
    blockType: blockType,
    timestamp: performance.now(),
  };

  const isAllowed = engine.antiCheat.evaluatePlacement(packet, engine.world);
  if (isAllowed) {
    engine.world.setBlock(placeX, placeY, placeZ, blockType, true);
    blockItem.count--;
    if (blockItem.count <= 0) {
      const slotIdx = hotbar.indexOf(blockItem);
      if (slotIdx !== -1) hotbar[slotIdx] = null;
    }
    engine.onSyncUI?.();
    return true;
  }
  return false;
}

export function performTestPlacement(engine: GameEngine, withoutAiming: boolean): boolean {
  if (engine.state !== 'match') return false;
  const hotbar = engine.hotbar;
  const currentItem = hotbar[engine.selectedSlot];
  const blockItem = (currentItem && currentItem.type === 'block')
    ? currentItem
    : hotbar.find(item => item && item.type === 'block');

  if (!blockItem || blockItem.count <= 0) return false;

  const playerPos = engine.player.position;
  const yaw = engine.player.yaw;
  const forwardX = -Math.sin(yaw);
  const forwardZ = -Math.cos(yaw);

  const placeX = Math.round(playerPos.x + (withoutAiming ? forwardX * 1.5 : 0));
  const placeY = Math.round(playerPos.y - 1);
  const placeZ = Math.round(playerPos.z + (withoutAiming ? forwardZ * 1.5 : 0));

  if (engine.world.isSolid(placeX, placeY, placeZ)) return false;

  const blockType = blockItem.blockType || BlockType.WHITE_WOOL;
  const camDir = new THREE.Vector3();
  engine.camera.getWorldDirection(camDir);
  const evaluatedCamDir = withoutAiming ? new THREE.Vector3(0, 0.2, -1) : camDir;

  const packet = {
    position: new THREE.Vector3(placeX, placeY, placeZ),
    faceNormal: new THREE.Vector3(0, 1, 0),
    playerPos: playerPos.clone(),
    cameraDir: evaluatedCamDir,
    cameraPos: engine.camera.position.clone(),
    blockType: blockType,
    timestamp: performance.now(),
  };

  const isAllowed = engine.antiCheat.evaluatePlacement(packet, engine.world);
  if (isAllowed) {
    engine.world.setBlock(placeX, placeY, placeZ, blockType, true);
    blockItem.count--;
    if (blockItem.count <= 0) {
      const slotIdx = hotbar.indexOf(blockItem);
      if (slotIdx !== -1) hotbar[slotIdx] = null;
    }
    engine.onSyncUI?.();
    return true;
  }
  return false;
}
