import * as THREE from 'three';
import { createCharacterModel, CharacterMesh } from '../graphics/characterModel';

export interface NPCData {
  id: 'bedwars_1v1' | 'test_arena' | 'item_shop' | 'upgrade_shop';
  model: CharacterMesh;
  position: THREE.Vector3;
}

export class NPCManager {
  private scene: THREE.Scene;
  public npcs: NPCData[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public setupLobbyNPCs() {
    this.clear();
    // NPC 1: 1v1 BedWars
    const npc1Model = createCharacterModel(0xb91c1c, 0x7f1d1d, '⚔️ 1v1 BedWars');
    npc1Model.position.set(0, 2, -7);
    npc1Model.rotation.y = 0;
    this.scene.add(npc1Model);
    this.npcs.push({ id: 'bedwars_1v1', model: npc1Model, position: npc1Model.position });

    // NPC 2: Test Arena (Bot)
    const npc2Model = createCharacterModel(0x059669, 0x065f46, '🧪 Arena de Testes (Bot)');
    npc2Model.position.set(9, 3, -2);
    npc2Model.rotation.y = -Math.PI / 3;
    this.scene.add(npc2Model);
    this.npcs.push({ id: 'test_arena', model: npc2Model, position: npc2Model.position });
  }

  public setupArenaNPCs(redShop: THREE.Vector3, blueShop: THREE.Vector3, redUp: THREE.Vector3, blueUp: THREE.Vector3) {
    this.clear();
    // Item Shops
    const redShopNPC = createCharacterModel(0xf59e0b, 0x78350f, '🛒 Loja de Itens');
    redShopNPC.position.copy(redShop);
    redShopNPC.rotation.y = Math.PI / 2;
    this.scene.add(redShopNPC);
    this.npcs.push({ id: 'item_shop', model: redShopNPC, position: redShop });

    const blueShopNPC = createCharacterModel(0xf59e0b, 0x78350f, '🛒 Loja de Itens');
    blueShopNPC.position.copy(blueShop);
    blueShopNPC.rotation.y = Math.PI / 2;
    this.scene.add(blueShopNPC);
    this.npcs.push({ id: 'item_shop', model: blueShopNPC, position: blueShop });

    // Upgrade Shops
    const redUpNPC = createCharacterModel(0x8b5cf6, 0x4c1d95, '⚡ Melhorias');
    redUpNPC.position.copy(redUp);
    redUpNPC.rotation.y = -Math.PI / 2;
    this.scene.add(redUpNPC);
    this.npcs.push({ id: 'upgrade_shop', model: redUpNPC, position: redUp });

    const blueUpNPC = createCharacterModel(0x8b5cf6, 0x4c1d95, '⚡ Melhorias');
    blueUpNPC.position.copy(blueUp);
    blueUpNPC.rotation.y = -Math.PI / 2;
    this.scene.add(blueUpNPC);
    this.npcs.push({ id: 'upgrade_shop', model: blueUpNPC, position: blueUp });
  }

  public update(time: number, playerPos: THREE.Vector3) {
    for (const npc of this.npcs) {
      npc.model.updateAnimation(time, false, 0);
      const dist = npc.position.distanceTo(playerPos);
      if (dist < 8) {
        // Softly turn head toward player
        const angle = Math.atan2(playerPos.x - npc.position.x, playerPos.z - npc.position.z);
        npc.model.rotation.y = angle;
      }
    }
  }

  public checkInteraction(raycaster: THREE.Raycaster, maxDistance = 4.5): 'bedwars_1v1' | 'test_arena' | 'item_shop' | 'upgrade_shop' | null {
    for (const npc of this.npcs) {
      const intersects = raycaster.intersectObject(npc.model, true);
      if (intersects.length > 0 && intersects[0].distance <= maxDistance) {
        return npc.id;
      }
    }
    return null;
  }

  public checkProximity(playerPos: THREE.Vector3, maxDistance = 2.5): 'bedwars_1v1' | 'test_arena' | 'item_shop' | 'upgrade_shop' | null {
    for (const npc of this.npcs) {
      if (npc.position.distanceTo(playerPos) <= maxDistance) {
        return npc.id;
      }
    }
    return null;
  }

  public clear() {
    for (const npc of this.npcs) {
      this.scene.remove(npc.model);
    }
    this.npcs = [];
  }
}
