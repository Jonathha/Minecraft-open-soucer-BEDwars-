import * as THREE from 'three';
import { CharacterMesh } from './characterModel';
import { createNameTagSprite } from './nameTag';
import { createSteveHead, createSteveTorso, createSteveLimb } from './officialSteveParts';
import { updateSteveAnimation } from './officialSteveAnim';

/**
 * Constructs the complete 3D Official Steve Character Model
 * using the authentic 64x64 skin from Minecraft.
 */
export function createOfficialSteveModel(playerName: string): CharacterMesh {
  const model = new THREE.Group() as CharacterMesh;

  // 1. Legs (pivoted at hips y = 0.75)
  const leftLeg = createSteveLimb(false, true);
  leftLeg.position.set(0.125, 0.75, 0);
  const rightLeg = createSteveLimb(false, false);
  rightLeg.position.set(-0.125, 0.75, 0);

  // 2. Torso (centered from y = 0.75 to y = 1.5)
  const torso = createSteveTorso();
  torso.position.set(0, 1.125, 0);

  // 3. Arms (pivoted at shoulders y = 1.5)
  const leftArm = createSteveLimb(true, true);
  leftArm.position.set(0.375, 1.5, 0);
  const rightArm = createSteveLimb(true, false);
  rightArm.position.set(-0.375, 1.5, 0);

  // 4. Head (pivoted at neck y = 1.5)
  const head = createSteveHead();
  head.position.set(0, 1.5, 0);

  // 5. Nametag floating above head
  const nameTag = createNameTagSprite(playerName);
  nameTag.position.set(0, 2.25, 0);

  // Assemble hierarchy
  model.add(leftLeg, rightLeg, torso, leftArm, rightArm, head, nameTag);

  model.head = head;
  model.body = torso;
  model.leftArm = leftArm;
  model.rightArm = rightArm;
  model.leftLeg = leftLeg;
  model.rightLeg = rightLeg;
  model.nameTag = nameTag;

  model.updateAnimation = (time, isMoving, speed) => {
    updateSteveAnimation(model, time, isMoving, speed);
  };

  return model;
}
