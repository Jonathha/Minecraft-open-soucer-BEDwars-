import * as THREE from 'three';
import { GameEngine } from '../gameEngine';
import { isRayBlockedByVoxels } from './espManager';

export class AimbotManager {
  public aimbotEnabled = false;
  public fov = 90; // Ângulo total de visão em graus (15° a 360°)
  public maxDistance = 64; // Alcance estendido para toda a arena/partida

  public getTargetPosition(engine: GameEngine): THREE.Vector3 | null {
    if (engine.state !== 'match') return null;

    const eyePos = new THREE.Vector3(
      engine.player.position.x,
      engine.player.position.y + 1.62,
      engine.player.position.z
    );

    let rawPos: THREE.Vector3 | null = null;
    let isAlive = false;

    if (engine.bot) {
      if (!engine.bot.isAlive) return null;
      rawPos = new THREE.Vector3(engine.bot.position.x, engine.bot.position.y + 1.1, engine.bot.position.z);
      isAlive = true;
    } else if (engine.opponentMesh) {
      if (engine.esp?.antiEspEnabled && !engine.opponentMesh.visible) return null;
      const pos = new THREE.Vector3();
      engine.opponentMesh.getWorldPosition(pos);
      pos.y += 1.1;
      rawPos = pos;
      isAlive = true;
    }

    if (!rawPos || !isAlive) return null;

    // Se o Anti-ESP estiver ativo e o oponente estiver ocluso, o Aimbot é impedido de obter coordenadas
    if (engine.esp && engine.esp.antiEspEnabled && engine.esp.currentStatus === 'occluded') {
      return null;
    }

    // Validação física de oclusão por voxels no mundo (impossível de burlar através de paredes)
    if (isRayBlockedByVoxels(eyePos, rawPos, engine.world)) {
      return null;
    }

    return rawPos;
  }

  public isTargetInFov(engine: GameEngine, targetPos: THREE.Vector3): boolean {
    const eyePos = new THREE.Vector3(
      engine.player.position.x,
      engine.player.position.y + 1.62,
      engine.player.position.z
    );
    const toTarget = new THREE.Vector3().subVectors(targetPos, eyePos);
    const dist = toTarget.length();
    if (dist > this.maxDistance || dist < 0.1) return false;

    // Bloqueia qualquer linha de visão obstruída por voxels
    if (isRayBlockedByVoxels(eyePos, targetPos, engine.world)) {
      return false;
    }

    toTarget.normalize();
    const yaw = engine.player.yaw;
    const pitch = engine.player.pitch;
    const lookDir = new THREE.Vector3(
      -Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      -Math.cos(yaw) * Math.cos(pitch)
    ).normalize();

    const dot = Math.min(Math.max(lookDir.dot(toTarget), -1), 1);
    const angleDeg = THREE.MathUtils.radToDeg(Math.acos(dot));
    return angleDeg <= this.fov / 2;
  }

  public triggerAimbot(engine: GameEngine, executeAttack = true): boolean {
    if (!this.aimbotEnabled) return false;
    const targetPos = this.getTargetPosition(engine);
    if (!targetPos || !this.isTargetInFov(engine, targetPos)) return false;

    const eyePos = new THREE.Vector3(
      engine.player.position.x,
      engine.player.position.y + 1.62,
      engine.player.position.z
    );

    // Dupla verificação de oclusão contra burlas
    if (isRayBlockedByVoxels(eyePos, targetPos, engine.world)) {
      return false;
    }

    const dx = targetPos.x - eyePos.x;
    const dy = targetPos.y - eyePos.y;
    const dz = targetPos.z - eyePos.z;

    const targetYaw = Math.atan2(-dx, -dz);
    const distH = Math.sqrt(dx * dx + dz * dz);
    const targetPitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, Math.atan2(dy, distH)));

    engine.player.yaw = targetYaw;
    engine.player.pitch = targetPitch;
    engine.player.onLookUpdate?.(targetYaw, targetPitch);

    const quatY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw);
    const quatX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), targetPitch);
    engine.camera.position.copy(eyePos);
    engine.camera.quaternion.copy(quatY).multiply(quatX);
    engine.camera.updateMatrixWorld(true);

    if (executeAttack) {
      engine.interaction.handleAttackOrBreak();
    }
    return true;
  }
}
