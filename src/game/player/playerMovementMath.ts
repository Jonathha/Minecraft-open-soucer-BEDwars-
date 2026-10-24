import * as THREE from 'three';

export interface MovementUpdateParams {
  keys: { forward: boolean; backward: boolean; left: boolean; right: boolean; jump: boolean; sneak: boolean; flyKey: boolean };
  mobileMove: { x: number; y: number };
  yaw: number;
  pitch: number;
  speed: number;
  isFlyEnabled: boolean;
  isSpeedEnabled: boolean;
  speedMultiplier: number;
  isHoldingLKey: boolean;
  velocity: THREE.Vector3;
  isGrounded: boolean;
  dt: number;
}

export function computePlayerVelocity(params: MovementUpdateParams) {
  const { keys, mobileMove, yaw, speed, isFlyEnabled, isSpeedEnabled, speedMultiplier, isHoldingLKey, velocity, dt } = params;
  let isGrounded = params.isGrounded;
  const isSneaking = keys.sneak;

  const moveDir = new THREE.Vector3();
  if (keys.forward) moveDir.z -= 1;
  if (keys.backward) moveDir.z += 1;
  if (keys.left) moveDir.x -= 1;
  if (keys.right) moveDir.x += 1;

  if (mobileMove.x !== 0 || mobileMove.y !== 0) {
    moveDir.x = mobileMove.x;
    moveDir.z = mobileMove.y;
  }

  const isMoving = moveDir.lengthSq() > 0.001;
  if (isMoving) moveDir.normalize();

  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const wishDir = forward.clone().multiplyScalar(-moveDir.z).add(right.clone().multiplyScalar(moveDir.x));

  const isFlying = isFlyEnabled && (isHoldingLKey || keys.flyKey);
  const baseSpeed = isSpeedEnabled ? speed * Math.max(1, speedMultiplier) : speed;
  const currentSpeed = (isSneaking && !isFlying) ? baseSpeed * 0.38 : baseSpeed;

  const targetVelX = wishDir.x * currentSpeed;
  const targetVelZ = wishDir.z * currentSpeed;

  velocity.x += (targetVelX - velocity.x) * Math.min(1, dt * 15);
  velocity.z += (targetVelZ - velocity.z) * Math.min(1, dt * 15);

  if (isFlying) {
    let targetVelY = 0;
    if (keys.jump) {
      targetVelY = Math.max(8.0, currentSpeed * 0.8);
    } else if (keys.sneak) {
      targetVelY = -Math.max(8.0, currentSpeed * 0.8);
    } else {
      targetVelY = 5.0; // Fly upwards / float when holding L
    }
    velocity.y += (targetVelY - velocity.y) * Math.min(1, dt * 12);
    isGrounded = false;
  } else {
    if (keys.jump && isGrounded) {
      velocity.y = 8.5;
      isGrounded = false;
    }
    velocity.y -= 22 * dt;
  }

  return { isMoving, isSneaking, isFlying, isGrounded };
}
