import * as THREE from 'three';
import { VoxelWorld } from '../world/voxelWorld';
import { BlockPlacePacket } from './types';
import { RotationAnalytics } from './rotationAnalytics';
import { RateLimiter } from './rateLimiter';
import { ViolationManager, ViolationCallback } from './violationManager';
import { MovementLogger } from './movementLogger';
import { PlayerController } from '../player/playerController';
import { ClientMovementDetector } from './clientMovementDetector';
import { evaluateBlockPlacementCheck } from './placementEvaluator';
import { isRayBlockedByVoxels } from './espManager';

export class AntiCheatEngine {
  private rotationAnalytics = new RotationAnalytics();
  private rateLimiter = new RateLimiter();
  private violationManager: ViolationManager;
  public movementLogger = new MovementLogger();
  private movementDetector = new ClientMovementDetector();

  public onViolationRollback?: () => void;

  constructor(callbacks: ViolationCallback = {}) {
    this.violationManager = new ViolationManager(callbacks);
  }

  public setCallbacks(callbacks: ViolationCallback): void {
    this.violationManager.setCallbacks(callbacks);
  }

  public trackPlayerRotation(yaw: number, pitch: number): void {
    this.rotationAnalytics.recordSample(yaw, pitch);
  }

  public update(delta: number, player?: PlayerController, world?: VoxelWorld): void {
    this.violationManager.update(delta);
    if (player) {
      this.movementLogger.update(delta, player);
      this.movementDetector.evaluateMovement(
        delta,
        player,
        this.violationManager,
        this.movementLogger,
        world,
        this.onViolationRollback
      );
    }
  }

  public triggerDirectViolation(reason: string, weight = 4.0): void {
    this.violationManager.addViolation({
      module: 'scaffold_rotation',
      weight: weight,
      details: reason,
    });
  }

  public triggerCombatViolation(reason: string, weight = 4.5): void {
    this.violationManager.addViolation({
      module: 'combat_wall_hit',
      weight: weight,
      details: reason,
    });
  }

  public checkAttackRotation(): { isRobotic: boolean; score: number; reason: string } {
    return this.rotationAnalytics.checkRoboticRotation();
  }

  public evaluateCombatAttack(
    eyePos: THREE.Vector3,
    targetPoint: THREE.Vector3,
    distance: number,
    world: VoxelWorld,
    isTargetVisible = true
  ): { allowed: boolean; reason?: string } {
    // 1. Strict reach check (3.85m max): disallow hit cleanly if target is out of reach
    if (distance > 3.85) {
      return { allowed: false, reason: 'Alvo fora de alcance' };
    }

    // 2. Anti-ESP Occlusion check: Disallow hit if target is visually occluded (do not flag false-positive cheat violation)
    if (!isTargetVisible) {
      return { allowed: false, reason: 'Alvo ocluso por Anti-ESP' };
    }

    // 3. Wall-hit Line-of-sight check across voxels: block attack cleanly without false-positive violation
    if (isRayBlockedByVoxels(eyePos, targetPoint, world)) {
      return { allowed: false, reason: 'Ataque bloqueado por parede' };
    }

    // 4. Robotic / Aimbot instant snap check
    const snap = this.rotationAnalytics.checkRoboticRotation();
    if (snap.isRobotic) {
      this.violationManager.addViolation({
        module: 'aimbot_snap',
        weight: 4.0,
        details: `Aimbot: ${snap.reason}`,
      });
      return { allowed: false, reason: snap.reason };
    }

    return { allowed: true };
  }

  public evaluatePlacement(packet: BlockPlacePacket, world: VoxelWorld, isVisual = false): boolean {
    return evaluateBlockPlacementCheck(
      packet,
      world,
      isVisual,
      this.rotationAnalytics,
      this.rateLimiter,
      this.violationManager,
      this.movementLogger
    );
  }

  public getViolationLevel(): number {
    return this.violationManager.getScore();
  }

  public notifyTeleport(pos: THREE.Vector3): void {
    this.movementDetector.notifyTeleport(pos);
    this.violationManager.reset();
  }

  public reset(): void {
    this.rotationAnalytics.reset();
    this.rateLimiter.reset();
    this.violationManager.reset();
    this.movementLogger.clearLogs();
    this.movementDetector.reset();
  }
}
