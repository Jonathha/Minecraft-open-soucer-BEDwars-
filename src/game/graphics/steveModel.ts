import * as THREE from 'three';
import { createNameTagSprite } from './nameTag';
import { CharacterMesh, animateCharacterModel } from './characterModel';

// Generates the classic 64x32 Steve skin procedurally on a canvas
export function createSteveSkinTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  // Clear / transparent background
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 64, 32);

  // --- Head (0,0 to 32,16) ---
  ctx.fillStyle = '#5c3e21'; // Hair (brown)
  ctx.fillRect(8, 0, 8, 8); // Top
  ctx.fillRect(16, 0, 8, 8); // Bottom/neck
  ctx.fillRect(0, 8, 8, 8); // Right side
  ctx.fillRect(8, 8, 8, 8); // Front base
  ctx.fillRect(16, 8, 8, 8); // Left side
  ctx.fillRect(24, 8, 8, 8); // Back

  // Face Skin base (#fbc59e)
  ctx.fillStyle = '#fbc59e';
  ctx.fillRect(8, 10, 8, 6); // Front Face
  ctx.fillRect(0, 10, 8, 6); // Right Side Face
  ctx.fillRect(16, 10, 8, 6); // Left Side Face
  ctx.fillRect(24, 10, 8, 6); // Back Face

  // Eyes (Front Face)
  ctx.fillStyle = '#ffffff'; // Whites
  ctx.fillRect(9, 12, 2, 1);
  ctx.fillRect(13, 12, 2, 1);
  ctx.fillStyle = '#3c59bf'; // Blue pupils
  ctx.fillRect(10, 12, 1, 1);
  ctx.fillRect(13, 12, 1, 1);

  // Nose and Mouth
  ctx.fillStyle = '#c68965'; // Nose shadow
  ctx.fillRect(11, 13, 2, 1);
  ctx.fillStyle = '#5c3e21'; // Mouth/Beard
  ctx.fillRect(11, 14, 2, 1);
  ctx.fillRect(10, 14, 4, 1);

  // --- Torso (16,16 to 40,32) ---
  ctx.fillStyle = '#00a1a1'; // Teal shirt
  ctx.fillRect(20, 16, 8, 4); // Top
  ctx.fillRect(28, 16, 8, 4); // Bottom
  ctx.fillRect(16, 20, 4, 12); // Right side
  ctx.fillRect(20, 20, 8, 12); // Front
  ctx.fillRect(28, 20, 4, 12); // Left side
  ctx.fillRect(32, 20, 8, 12); // Back
  // Neck cutout
  ctx.fillStyle = '#fbc59e';
  ctx.fillRect(22, 20, 4, 2);

  // --- Right Leg (0,16 to 16,32) ---
  ctx.fillStyle = '#4c50a1'; // Blue pants
  ctx.fillRect(4, 16, 4, 4); // Top
  ctx.fillRect(8, 16, 4, 4); // Bottom
  ctx.fillRect(0, 20, 4, 12); // Right side
  ctx.fillRect(4, 20, 4, 12); // Front
  ctx.fillRect(8, 20, 4, 12); // Left side
  ctx.fillRect(12, 20, 4, 12); // Back
  // Gray Shoes (bottom 2 pixels)
  ctx.fillStyle = '#5c5c5c';
  ctx.fillRect(0, 30, 16, 2);

  // --- Right Arm (40,16 to 56,32) ---
  ctx.fillStyle = '#00a1a1'; // Teal sleeve (top 4 pixels)
  ctx.fillRect(44, 16, 4, 4); // Top
  ctx.fillRect(48, 16, 4, 4); // Bottom
  ctx.fillRect(40, 20, 16, 4); // Sleeve sides
  ctx.fillStyle = '#fbc59e'; // Skin arm
  ctx.fillRect(40, 24, 16, 8); // Arm skin

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// Maps specific regions of the texture to the 6 faces of a BoxGeometry
function createSteveMaterials(texture: THREE.Texture, mapping: Array<{ x: number, y: number, w: number, h: number }>) {
  return mapping.map(face => {
    const t = texture.clone();
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.offset.set(face.x / 64, (32 - face.y - face.h) / 32);
    t.repeat.set(face.w / 64, face.h / 32);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return new THREE.MeshLambertMaterial({ map: t });
  });
}

const headMapping = [
  { x: 16, y: 8, w: 8, h: 8 },  // +X (Right)
  { x: 0, y: 8, w: 8, h: 8 },   // -X (Left)
  { x: 8, y: 0, w: 8, h: 8 },   // +Y (Top)
  { x: 16, y: 0, w: 8, h: 8 },  // -Y (Bottom)
  { x: 8, y: 8, w: 8, h: 8 },   // +Z (Front)
  { x: 24, y: 8, w: 8, h: 8 }   // -Z (Back)
];

const torsoMapping = [
  { x: 28, y: 20, w: 4, h: 12 }, // +X (Right)
  { x: 16, y: 20, w: 4, h: 12 }, // -X (Left)
  { x: 20, y: 16, w: 8, h: 4 },  // +Y (Top)
  { x: 28, y: 16, w: 8, h: 4 },  // -Y (Bottom)
  { x: 20, y: 20, w: 8, h: 12 }, // +Z (Front)
  { x: 32, y: 20, w: 8, h: 12 }  // -Z (Back)
];

const armMapping = [
  { x: 48, y: 20, w: 4, h: 12 }, // +X (Right)
  { x: 40, y: 20, w: 4, h: 12 }, // -X (Left)
  { x: 44, y: 16, w: 4, h: 4 },  // +Y (Top)
  { x: 48, y: 16, w: 4, h: 4 },  // -Y (Bottom)
  { x: 44, y: 20, w: 4, h: 12 }, // +Z (Front)
  { x: 52, y: 20, w: 4, h: 12 }  // -Z (Back)
];

const legMapping = [
  { x: 8, y: 20, w: 4, h: 12 },  // +X (Right)
  { x: 0, y: 20, w: 4, h: 12 },  // -X (Left)
  { x: 4, y: 16, w: 4, h: 4 },   // +Y (Top)
  { x: 8, y: 16, w: 4, h: 4 },   // -Y (Bottom)
  { x: 4, y: 20, w: 4, h: 12 },  // +Z (Front)
  { x: 12, y: 20, w: 4, h: 12 }  // -Z (Back)
];

export function createSteveCharacterModel(playerName: string): CharacterMesh {
  const group = new THREE.Group() as CharacterMesh;
  const texture = createSteveSkinTexture();

  // Head Mesh
  const head = new THREE.Group();
  const headMaterials = createSteveMaterials(texture, headMapping);
  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), headMaterials);
  headMesh.castShadow = true;
  head.add(headMesh);
  head.position.y = 1.65;
  group.add(head);
  group.head = head;

  // Body Mesh
  const torsoMaterials = createSteveMaterials(texture, torsoMapping);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), torsoMaterials);
  body.position.y = 1.025;
  body.castShadow = true;
  group.add(body);
  group.body = body;

  // Right Arm
  const rightArm = new THREE.Group();
  const armMaterials = createSteveMaterials(texture, armMapping);
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), armMaterials);
  rightArmMesh.position.y = -0.375;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  rightArm.position.set(0.38, 1.4, 0);
  group.add(rightArm);
  group.rightArm = rightArm;

  // Left Arm (Identical to Right Arm for classic 64x32 Steve model)
  const leftArm = new THREE.Group();
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), armMaterials);
  leftArmMesh.position.y = -0.375;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  leftArm.position.set(-0.38, 1.4, 0);
  group.add(leftArm);
  group.leftArm = leftArm;

  // Right Leg
  const rightLeg = new THREE.Group();
  const legMaterials = createSteveMaterials(texture, legMapping);
  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.24), legMaterials);
  rightLegMesh.position.y = -0.375;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);
  rightLeg.position.set(0.13, 0.75, 0);
  group.add(rightLeg);
  group.rightLeg = rightLeg;

  // Left Leg (Identical to Right Leg for classic 64x32 Steve model)
  const leftLeg = new THREE.Group();
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.24), legMaterials);
  leftLegMesh.position.y = -0.375;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);
  leftLeg.position.set(-0.13, 0.75, 0);
  group.add(leftLeg);
  group.leftLeg = leftLeg;

  // Name Tag Sprite
  const nameTag = createNameTagSprite(playerName);
  nameTag.position.y = 2.15;
  group.add(nameTag);
  group.nameTag = nameTag;

  group.updateAnimation = (time: number, isMoving: boolean, speed = 8) => {
    animateCharacterModel(group, time, isMoving, speed);
  };

  return group;
}
