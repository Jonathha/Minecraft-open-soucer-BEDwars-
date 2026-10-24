import * as THREE from 'three';
import { createNameTagSprite } from './nameTag';
import { createCharacterTextures, createHeadMesh, createArmMesh, createLegMesh } from './characterGeometry';
import { createSteveCharacterModel } from './steveModel';
import { createOfficialSteveModel } from './officialSteveModel';

export interface CharacterMesh extends THREE.Group {
  head: THREE.Group;
  body: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  nameTag: THREE.Sprite;
  updateAnimation: (time: number, isMoving: boolean, speed?: number) => void;
}

export function createCharacterModel(
  shirtColor = 0xdc2626,
  pantsColor = 0x1e293b,
  playerName = 'Player'
): CharacterMesh {
  return createOfficialSteveModel(playerName);
}

export function animateCharacterModel(
  model: CharacterMesh,
  time: number,
  isMoving: boolean,
  speed = 8
) {
  if (isMoving) {
    const swing = Math.sin(time * speed) * 0.6;
    model.leftLeg.rotation.x = swing;
    model.rightLeg.rotation.x = -swing;
    model.leftArm.rotation.x = -swing;
    model.rightArm.rotation.x = swing;
  } else {
    model.leftLeg.rotation.x = 0;
    model.rightLeg.rotation.x = 0;
    model.leftArm.rotation.x = 0;
    model.rightArm.rotation.x = 0;
  }
}
