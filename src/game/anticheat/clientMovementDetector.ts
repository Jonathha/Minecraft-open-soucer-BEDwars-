import * as THREE from 'three';
import { PlayerController } from '../player/playerController';
import { ViolationManager } from './violationManager';
import { MovementLogger } from './movementLogger';
import { VoxelWorld } from '../world/voxelWorld';
import { checkClientSpeed, checkClientFly, checkClientPhase } from './clientSpeedFlyChecks';
import { checkRealGroundSupport } from '../player/voxelCollision';

export class ClientMovementDetector {
  private lastPos = new THREE.Vector3();
  private lastGroundedPos = new THREE.Vector3();
  private lastValidPos = new THREE.Vector3();
  private hasLastPos = false;
  private airtime = 0;
  private timeRisingInAir = 0;
  private speedViolationCooldown = 0;
  private flyViolationCooldown = 0;
  private safeHistory: Array<{ pos: THREE.Vector3; time: number }> = [];
  private historySampleTimer = 0;

  public evaluateMovement(
    delta: number,
    player: PlayerController,
    violationManager: ViolationManager,
    movementLogger: MovementLogger,
    world?: VoxelWorld,
    onRollback?: () => void
  ): void {
    if (this.speedViolationCooldown > 0) this.speedViolationCooldown -= delta;
    if (this.flyViolationCooldown > 0) this.flyViolationCooldown -= delta;

    if (!this.hasLastPos) {
      this.lastPos.copy(player.position);
      this.lastGroundedPos.copy(player.position);
      this.lastValidPos.copy(player.position);
      this.hasLastPos = true;
      this.safeHistory = [{ pos: player.position.clone(), time: Date.now() }];
      return;
    }

    const dX = player.position.x - this.lastPos.x;
    const dY = player.position.y - this.lastPos.y;
    const dZ = player.position.z - this.lastPos.z;
    const distXZ = Math.sqrt(dX * dX + dZ * dZ);
    const totalDist = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
    const speedXZ = distXZ / Math.max(0.001, delta);
    const velocityMagXZ = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.z * player.velocity.z);

    if (player.position.y < -10) {
      this.notifyTeleport(player.position);
      return;
    }

    if (totalDist > 12.0) {
      const details = `Auto-TP / Teleporte Ilícito: Deslocamento instantâneo de ${totalDist.toFixed(1)}m`;
      violationManager.addViolation({ module: 'tp', weight: 10.0, details });
      movementLogger.logViolation('tp', details, violationManager.getScore());
      player.position.copy(this.lastValidPos);
      player.velocity.set(0, 0, 0);
      if (onRollback) onRollback();
      return;
    }

    const isSneaking = player.isSneaking || player.keys.sneak;
    const hasRealGround = world
      ? checkRealGroundSupport(player.position.x, player.position.y, player.position.z, 0.3, world, isSneaking)
      : player.isGrounded;

    // Detect ground spoof or standing on fake/ghost blocks
    if (player.isGrounded && !hasRealGround) {
      player.isGrounded = false;
      this.airtime += delta;

      if (this.flyViolationCooldown <= 0) {
        this.flyViolationCooldown = 0.35;
        const details = `Ground Spoof / Bloco Fantasma: Jogador apoiado no ar em (${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}) sem bloco real no mapa`;
        violationManager.addViolation({ module: 'fly', weight: 5.5, details });
        movementLogger.logViolation('fly', details, violationManager.getScore());
      }

      if (this.lastGroundedPos.y > -10) {
        player.position.copy(this.lastGroundedPos);
      } else {
        player.position.copy(this.lastValidPos);
      }
      player.velocity.set(0, -8.0, 0);
      if (onRollback) onRollback();
      return;
    }

    if (hasRealGround && player.isGrounded) {
      this.lastGroundedPos.copy(player.position);
      this.airtime = 0;
      this.timeRisingInAir = 0;
    } else {
      this.airtime += delta;
      if (player.velocity.y > 0.15 && dY > 0.01) {
        this.timeRisingInAir += delta;
      } else if (player.velocity.y < -0.2) {
        this.timeRisingInAir = Math.max(0, this.timeRisingInAir - delta * 2);
      }
    }

    // Amostra histórico de posições seguras válidas
    this.historySampleTimer += delta;
    if (this.historySampleTimer >= 0.08) {
      this.historySampleTimer = 0;
      const now = Date.now();
      this.safeHistory.push({ pos: player.position.clone(), time: now });
      // Mantém apenas os últimos 2.5 segundos
      while (this.safeHistory.length > 0 && now - this.safeHistory[0].time > 2500) {
        this.safeHistory.shift();
      }
    }

    // 1. Verificação de Phase / In-Block (atravessamento de blocos)
    if (world) {
      const didPhase = checkClientPhase(
        player,
        world,
        this.safeHistory,
        violationManager,
        movementLogger,
        onRollback
      );
      if (didPhase) {
        this.lastPos.copy(player.position);
        return;
      }
    }

    // 2. Verificação de velocidade
    const speedRes = checkClientSpeed(
      player,
      speedXZ,
      velocityMagXZ,
      this.lastValidPos,
      this.speedViolationCooldown,
      violationManager,
      movementLogger,
      onRollback
    );
    this.speedViolationCooldown = speedRes.cooldown;

    // 3. Verificação de fly
    const flyRes = checkClientFly(
      player,
      dY,
      this.airtime,
      this.timeRisingInAir,
      this.lastValidPos,
      this.lastGroundedPos,
      this.flyViolationCooldown,
      violationManager,
      movementLogger,
      onRollback
    );
    this.flyViolationCooldown = flyRes.cooldown;

    this.lastPos.copy(player.position);
  }

  public notifyTeleport(pos: THREE.Vector3): void {
    this.lastPos.copy(pos);
    this.lastGroundedPos.copy(pos);
    this.lastValidPos.copy(pos);
    this.hasLastPos = true;
    this.airtime = 0;
    this.timeRisingInAir = 0;
    this.speedViolationCooldown = 0;
    this.flyViolationCooldown = 0;
    this.safeHistory = [{ pos: pos.clone(), time: Date.now() }];
  }

  public reset(): void {
    this.hasLastPos = false;
    this.airtime = 0;
    this.timeRisingInAir = 0;
    this.speedViolationCooldown = 0;
    this.flyViolationCooldown = 0;
    this.safeHistory = [];
  }
}
