import * as THREE from 'three';
import { VoxelWorld } from './voxelWorld';
import { buildLobbyLights } from './lobbyLights';
import { buildLobbyFloor } from './lobbyFloor';
import { buildLobbyTowers } from './lobbyTowers';
import { buildLobbyStructures } from './lobbyStructures';
import { buildLobbyFoliage } from './lobbyFoliage';
import { buildLobbyParkour } from './lobbyParkour';
import { buildLobbyCherryTrees } from './lobbyCherryTrees';

/**
 * Main function to assemble the entire detailed 3D Lobby world.
 * This method coordinates lights, floor generation, towers, structures,
 * parkour courses, and the majestic cherry blossom trees.
 */
export function buildLobbyWorld(scene: THREE.Scene, world: VoxelWorld) {
  // 1. Setup scene illumination and ambient environment lights
  buildLobbyLights(scene);

  // 2. Generate the large circular floating island foundation
  buildLobbyFloor(world);

  // 3. Construct grand watchtowers on the island's corners
  buildLobbyTowers(world);

  // 4. Place decorative portals and central lobby structures
  buildLobbyStructures(world);

  // 5. Add flowers, ground plants, and aesthetic lampposts
  buildLobbyFoliage(world);

  // 6. Build the challenging lobby parkour minigame courses
  buildLobbyParkour(world);

  // 7. Grow the magnificent cherry blossom trees around the lobby
  buildLobbyCherryTrees(world);

  // 8. Bake all lobby voxel blocks into ultra-fast GPU InstancedMeshes
  world.bakeLobbyInstancedMeshes();
}
