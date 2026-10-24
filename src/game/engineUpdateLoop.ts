import * as THREE from 'three';
import { GameEngine } from './gameEngine';
import { sounds } from './audio/soundManager';
import { updateMenuCamera } from './world/menuScene';

export function updateEngineFrame(engine: GameEngine, delta: number, time: number, accumulator: { value: number; uiSyncTimer: number }) {
  if (delta > 0) {
    const instantFps = 1 / delta;
    engine.network.setFps(instantFps);
  }
  if (engine.state === 'menu') {
    updateMenuCamera(engine.camera, time);
  } else if (engine.state === 'lobby') {
    engine.player.update(delta, engine.world);
    engine.antiCheat.update(delta, engine.player, engine.world);
    engine.npcs.update(time, engine.player.position);
    engine.interaction.update(delta);
    engine.particles.update(delta);
    if (engine.player.position.y < -8) {
      sounds.playTeleport();
      engine.network.sendRespawn({ x: 0, y: 1, z: 8 });
      engine.player.teleport(new THREE.Vector3(0, 1, 8), Math.PI);
    }
  } else if (engine.state === 'match') {
    engine.player.update(delta, engine.world);
    engine.antiCheat.update(delta, engine.player, engine.world);
    engine.testSimulator.update(delta, engine);
    engine.npcs.update(time, engine.player.position);
    engine.resources.update(delta, time, engine.player.position, engine.inventory);
    engine.syncResourcesToHotbar();
    engine.interaction.update(delta);
    engine.particles.update(delta);

    accumulator.uiSyncTimer += delta;
    if (accumulator.uiSyncTimer >= 0.15) {
      accumulator.uiSyncTimer = 0;
      engine.onSyncUI?.();
    }

    if (engine.bot) {
      engine.bot.update(delta, time, engine.player.position, engine.world, (dmg) => {
        const dir = new THREE.Vector3().subVectors(engine.player.position, engine.bot!.position).normalize();
        engine.match.takeDamage(dmg, dir);
      });
    }

    // Update ESP / Anti-ESP raycast occlusion culling
    if (engine.opponentMesh) {
      const isOppAlive = engine.bot ? engine.bot.isAlive : true;
      engine.esp.update(engine.camera, engine.opponentMesh, engine.world, isOppAlive);
    }
    if (engine.player.position.y < -8 && engine.match.health > 0) {
      engine.match.takeDamage(20, new THREE.Vector3(0, 0, 0));
    }

    accumulator.value += delta;
    if (accumulator.value >= 0.05) {
      const dt = accumulator.value;
      engine.network.sendMove(
        { x: engine.player.position.x, y: engine.player.position.y, z: engine.player.position.z },
        engine.player.yaw,
        engine.player.keys,
        engine.player.isGrounded,
        dt,
        { x: engine.player.velocity.x, y: engine.player.velocity.y, z: engine.player.velocity.z }
      );
      accumulator.value = 0;
    }
  }

  // Update first-person hand and held item
  if (engine.firstPersonHand) {
    if (engine.state === 'menu') {
      engine.firstPersonHand.group.visible = false;
    } else {
      engine.firstPersonHand.group.visible = true;
      engine.firstPersonHand.update(delta, engine.player.isMoving && engine.player.isGrounded, time);
      const activeItem = engine.hotbar[engine.selectedSlot] || null;
      engine.firstPersonHand.setItem(activeItem, engine.match ? engine.match.matchInfo.myTeam : 'red');
    }
  }

  engine.renderer.render(engine.scene, engine.camera);
}
