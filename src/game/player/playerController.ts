import * as THREE from 'three';
import { VoxelWorld } from '../world/voxelWorld';
import { resolvePlayerMovement } from './voxelCollision';
import { computePlayerVelocity } from './playerMovementMath';

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public position = new THREE.Vector3(0, 12, 0);
  public velocity = new THREE.Vector3(0, 0, 0);
  public isGrounded = false;
  public isSneaking = false;
  public yaw = 0;
  public pitch = 0;
  public speed = 6.2;
  public isMoving = false;
  public zLimit: number | null = null; // barreira: |z| máximo (só na partida)

  // Anti-Cheat Test Controls (Fly & Speed)
  public isFlyEnabled = false;
  public isSpeedEnabled = false;
  public speedMultiplier = 2.5;
  public isHoldingLKey = false;

  public keys = { forward: false, backward: false, left: false, right: false, jump: false, sneak: false, flyKey: false };
  public mobileMove = { x: 0, y: 0 };
  public onLookUpdate?: (yaw: number, pitch: number) => void;
  public onTeleport?: (pos: THREE.Vector3) => void;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public handleMouseMove(movementX: number, movementY: number, sensitivity = 0.0024) {
    this.yaw -= movementX * sensitivity;
    this.pitch -= movementY * sensitivity;
    this.pitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, this.pitch));
    this.onLookUpdate?.(this.yaw, this.pitch);
  }

  public setMoveInput(x: number, y: number) {
    this.mobileMove.x = x;
    this.mobileMove.y = y;
  }

  public setJump(jumping: boolean) {
    this.keys.jump = jumping;
  }

  public applyTouchLook(deltaX: number, deltaY: number, sensitivity = 0.0035) {
    this.yaw -= deltaX * sensitivity;
    this.pitch -= deltaY * sensitivity;
    this.pitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, this.pitch));
    this.onLookUpdate?.(this.yaw, this.pitch);
  }

  public teleport(pos: THREE.Vector3, yaw = 0, pitch = 0) {
    this.position.copy(pos);
    this.velocity.set(0, 0, 0);
    this.yaw = yaw;
    this.pitch = pitch;
    this.onLookUpdate?.(this.yaw, this.pitch);
    this.onTeleport?.(pos);
  }

  public applyKnockback(dir: THREE.Vector3, force = 8) {
    this.velocity.x += dir.x * force;
    this.velocity.y += 4;
    this.velocity.z += dir.z * force;
  }

  public update(delta: number, world: VoxelWorld) {
    const dt = Math.min(delta, 0.05);

    const { isMoving, isSneaking, isFlying, isGrounded } = computePlayerVelocity({
      keys: this.keys,
      mobileMove: this.mobileMove,
      yaw: this.yaw,
      pitch: this.pitch,
      speed: this.speed,
      isFlyEnabled: this.isFlyEnabled,
      isSpeedEnabled: this.isSpeedEnabled,
      speedMultiplier: this.speedMultiplier,
      isHoldingLKey: this.isHoldingLKey,
      velocity: this.velocity,
      isGrounded: this.isGrounded,
      dt,
    });

    this.isMoving = isMoving;
    this.isSneaking = isSneaking;
    this.isGrounded = isGrounded;

    const collision = resolvePlayerMovement(
      this.position,
      this.velocity,
      dt,
      0.28,
      1.7,
      world,
      this.isSneaking && !isFlying,
      this.isGrounded
    );
    this.isGrounded = isFlying ? false : collision.isGrounded;
    if (this.zLimit !== null) {
      if (this.position.z > this.zLimit) { this.position.z = this.zLimit; if (this.velocity.z > 0) this.velocity.z = 0; }
      else if (this.position.z < -this.zLimit) { this.position.z = -this.zLimit; if (this.velocity.z < 0) this.velocity.z = 0; }
    }

    const eyeOffset = (this.isSneaking && !isFlying) ? 1.48 : 1.62;
    this.camera.position.set(this.position.x, this.position.y + eyeOffset, this.position.z);
    const quatY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const quatX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    this.camera.quaternion.copy(quatY).multiply(quatX);
  }
}
