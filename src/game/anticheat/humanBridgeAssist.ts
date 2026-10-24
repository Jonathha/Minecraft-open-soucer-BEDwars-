import * as THREE from 'three';
import { GameEngine } from '../gameEngine';

export function runHumanBridgeAssist(delta: number, engine: GameEngine, assistPlaceTimer: { value: number }): void {
  const player = engine.player;
  const world = engine.world;

  const hotbar = engine.hotbar;
  const currentItem = hotbar[engine.selectedSlot];
  if (!currentItem || currentItem.type !== 'block' || currentItem.count <= 0) {
    const blockSlot = hotbar.findIndex(item => item && item.type === 'block' && item.count > 0);
    if (blockSlot !== -1) {
      engine.selectedSlot = blockSlot;
      engine.onSyncUI?.();
    }
  }

  const currentGroundY = Math.floor(player.position.y - 0.1);
  const px = Math.round(player.position.x);
  const pz = Math.round(player.position.z);

  if (!world.isSolid(px, currentGroundY, pz)) return;

  const dirs = [
    { dx: 0, dz: -1 },
    { dx: 0, dz: 1 },
    { dx: -1, dz: 0 },
    { dx: 1, dz: 0 },
  ];

  const backX = Math.sin(player.yaw);
  const backZ = Math.cos(player.yaw);
  const relX = player.position.x - px;
  const relZ = player.position.z - pz;

  let bestDir: { dx: number; dz: number } | null = null;
  let maxScore = -999;

  for (const d of dirs) {
    const neighborX = px + d.dx;
    const neighborZ = pz + d.dz;

    if (!world.isSolid(neighborX, currentGroundY, neighborZ)) {
      const dot = backX * d.dx + backZ * d.dz;
      const distOff = relX * d.dx + relZ * d.dz;
      const score = dot * 3.0 + distOff * 2.0;

      if (score > maxScore) {
        maxScore = score;
        bestDir = d;
      }
    }
  }

  if (!bestDir) {
    const backDx = Math.round(backX);
    const backDz = Math.round(backZ);
    bestDir = { dx: backDx === 0 && backDz === 0 ? 0 : backDx, dz: backDz };
  }

  const targetFaceX = px + bestDir.dx * 0.5;
  const targetFaceZ = pz + bestDir.dz * 0.5;
  const targetFaceY = currentGroundY - 0.15;

  const eyeOffset = player.isSneaking ? 1.48 : 1.62;
  const eyeX = player.position.x;
  const eyeY = player.position.y + eyeOffset;
  const eyeZ = player.position.z;

  const diffX = targetFaceX - eyeX;
  const diffY = targetFaceY - eyeY;
  const diffZ = targetFaceZ - eyeZ;
  const distXZ = Math.sqrt(diffX * diffX + diffZ * diffZ);

  const targetYaw = Math.atan2(-diffX, -diffZ);
  const targetPitch = Math.atan2(diffY, Math.max(0.05, distXZ));

  const smoothRate = Math.min(1.0, delta * 18.0);
  let diffYaw = targetYaw - player.yaw;
  while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
  while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;

  player.yaw += diffYaw * smoothRate;
  player.pitch += (targetPitch - player.pitch) * smoothRate;
  player.pitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, player.pitch));

  engine.camera.position.set(player.position.x, player.position.y + eyeOffset, player.position.z);
  const quatY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);
  const quatX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), player.pitch);
  engine.camera.quaternion.copy(quatY).multiply(quatX);
  player.onLookUpdate?.(player.yaw, player.pitch);

  player.keys.backward = true;
  player.keys.forward = false;
  player.keys.sneak = true;

  assistPlaceTimer.value += delta;
  if (assistPlaceTimer.value >= 0.12) {
    assistPlaceTimer.value = 0;
    engine.interaction.handlePlaceBlock();
  }
}
