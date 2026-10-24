import * as THREE from 'three';

/**
 * Builds and configures all illumination for the lobby environment.
 * Ensures daytime sky background and rich daylight lighting.
 */
export function buildLobbyLights(scene: THREE.Scene) {
  // 1. Set daylight sky color and fog so the lobby void is never black
  scene.background = new THREE.Color(0x78b7ff);
  scene.fog = new THREE.FogExp2(0x78b7ff, 0.012);

  // 2. Identify and remove any preexisting light instances in the scene
  const existingLights = scene.children.filter(
    (child) => child instanceof THREE.Light
  );
  
  for (const light of existingLights) {
    scene.remove(light);
  }

  // 3. Add an ambient light to provide bright baseline color fill to all blocks
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  // 4. Setup a primary directional sunlight source to create sharp depth
  const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.3);
  sunLight.position.set(28, 48, 22);
  scene.add(sunLight);
  
  // 5. Add sky/ground hemisphere light for rich outdoor contrast
  const hemisphereLight = new THREE.HemisphereLight(0x78b7ff, 0x4a5d3b, 0.5);
  scene.add(hemisphereLight);
}
