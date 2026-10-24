import * as THREE from 'three';

export function createCharacterTextures(shirtColor: number, pantsColor: number) {
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0ac69 });
  const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
  return { skinMat, shirtMat, pantsMat, hairMat, eyeWhiteMat, eyePupilMat };
}

export function createHeadMesh(materials: ReturnType<typeof createCharacterTextures>) {
  const head = new THREE.Group();
  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), materials.skinMat);
  headMesh.castShadow = true;
  head.add(headMesh);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.52), materials.hairMat);
  hair.position.y = 0.18;
  head.add(hair);

  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), materials.eyeWhiteMat);
  leftEye.position.set(-0.12, 0.02, 0.252);
  const leftPupil = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.02), materials.eyePupilMat);
  leftPupil.position.set(-0.1, 0.02, 0.254);
  head.add(leftEye, leftPupil);

  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), materials.eyeWhiteMat);
  rightEye.position.set(0.12, 0.02, 0.252);
  const rightPupil = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.02), materials.eyePupilMat);
  rightPupil.position.set(0.1, 0.02, 0.254);
  head.add(rightEye, rightPupil);

  head.position.y = 1.65;
  return head;
}

export function createArmMesh(material: THREE.Material, xPos: number) {
  const arm = new THREE.Group();
  const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), material);
  armMesh.position.y = -0.375;
  armMesh.castShadow = true;
  arm.add(armMesh);
  arm.position.set(xPos, 1.4, 0);
  return arm;
}

export function createLegMesh(material: THREE.Material, xPos: number) {
  const leg = new THREE.Group();
  const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.24), material);
  legMesh.position.y = -0.375;
  legMesh.castShadow = true;
  leg.add(legMesh);
  leg.position.set(xPos, 0.75, 0);
  return leg;
}
