import * as THREE from 'three';
import { getOfficialSteveTexture } from './officialSteveSkin';
import {
  createBoxMaterials,
  STEVE_HEAD_UV,
  STEVE_TORSO_UV,
  STEVE_ARM_R_UV,
  STEVE_ARM_L_UV,
  STEVE_LEG_R_UV,
  STEVE_LEG_L_UV,
} from './officialSteveUV';

export function createSteveHead(): THREE.Group {
  const tex = getOfficialSteveTexture();
  const group = new THREE.Group();
  const geom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const mats = createBoxMaterials(tex, STEVE_HEAD_UV);
  const mesh = new THREE.Mesh(geom, mats);
  mesh.position.set(0, 0.25, 0); // Center above neck pivot
  mesh.castShadow = true;
  group.add(mesh);
  return group;
}

export function createSteveTorso(): THREE.Mesh {
  const tex = getOfficialSteveTexture();
  const geom = new THREE.BoxGeometry(0.5, 0.75, 0.25);
  const mats = createBoxMaterials(tex, STEVE_TORSO_UV);
  const mesh = new THREE.Mesh(geom, mats);
  mesh.castShadow = true;
  return mesh;
}

export function createSteveLimb(isArm: boolean, isLeft: boolean): THREE.Group {
  const tex = getOfficialSteveTexture();
  const group = new THREE.Group();
  const w = isArm ? 0.25 : 0.25;
  const h = 0.75;
  const d = 0.25;
  const geom = new THREE.BoxGeometry(w, h, d);
  const uv = isArm
    ? (isLeft ? STEVE_ARM_L_UV : STEVE_ARM_R_UV)
    : (isLeft ? STEVE_LEG_L_UV : STEVE_LEG_R_UV);
  const mats = createBoxMaterials(tex, uv);
  const mesh = new THREE.Mesh(geom, mats);
  mesh.position.set(0, -h / 2, 0); // Pivot at top (shoulder/hip)
  mesh.castShadow = true;
  group.add(mesh);
  return group;
}
