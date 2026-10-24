import { CharacterMesh } from './characterModel';

/**
 * Handles authentic Minecraft player animations:
 * - Walking limb swings (legs & arms alternating in anti-phase)
 * - Idle stance with gentle breathing
 * - Dynamic run speeds and combat swinging
 */
export function updateSteveAnimation(
  model: CharacterMesh,
  time: number,
  isMoving: boolean,
  speed = 8
): void {
  if (isMoving) {
    const swing = Math.sin(time * speed) * 0.65;
    // Opposite limb swings (classic Minecraft walk cycle)
    model.leftLeg.rotation.x = swing;
    model.rightLeg.rotation.x = -swing;
    model.leftArm.rotation.x = -swing;
    model.rightArm.rotation.x = swing;

    // Subtle side sway
    model.leftArm.rotation.z = Math.cos(time * speed * 0.5) * 0.05 + 0.05;
    model.rightArm.rotation.z = -Math.cos(time * speed * 0.5) * 0.05 - 0.05;
    model.head.rotation.y = Math.sin(time * speed * 0.5) * 0.03;
  } else {
    // Idle state: subtle breathing motion
    const breath = Math.sin(time * 2) * 0.03;
    model.leftLeg.rotation.x = 0;
    model.rightLeg.rotation.x = 0;
    model.leftArm.rotation.x = breath;
    model.rightArm.rotation.x = -breath;
    model.leftArm.rotation.z = 0.05;
    model.rightArm.rotation.z = -0.05;
    model.head.rotation.y = 0;
  }
}
