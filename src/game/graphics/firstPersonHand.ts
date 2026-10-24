import * as THREE from 'three';
import { HotbarItem, Team, BlockType } from '../../types/game';
import { getOfficialSteveTexture } from './officialSteveSkin';
import { createBoxMaterials, STEVE_ARM_R_UV } from './officialSteveUV';

export class FirstPersonHand {
  public group = new THREE.Group();
  private armMesh: THREE.Mesh;
  private itemGroup = new THREE.Group();
  private currentItemMesh: THREE.Object3D | null = null;
  private textureLoader = new THREE.TextureLoader();

  // Animation states
  private swingTime = 0;
  private swingDuration = 0.25; // 250ms for a punch/swing
  private isSwinging = false;

  // Active item tracking
  private activeItemId: string | null = null;
  private activeBlockType: BlockType | null = null;

  // Default positions (Right-handed, bottom-right of viewport)
  private defaultPos = new THREE.Vector3(0.38, -0.20, -0.22);
  private defaultRot = new THREE.Euler(-0.15, -0.85, 0.15);

  constructor() {
    this.group.position.copy(this.defaultPos);
    this.group.rotation.copy(this.defaultRot);

    // Create the textured right arm using the official Steve skin
    const skinTexture = getOfficialSteveTexture();
    const armMaterials = createBoxMaterials(skinTexture, STEVE_ARM_R_UV);

    // Steve's right arm geometry
    const armGeom = new THREE.BoxGeometry(0.06, 0.22, 0.06);
    this.armMesh = new THREE.Mesh(armGeom, armMaterials);
    this.armMesh.position.set(0, -0.06, 0);
    this.armMesh.renderOrder = 9999; // Render on top of everything
    this.group.add(this.armMesh);

    // Container for held items
    this.itemGroup.position.set(0, 0, 0); // Position relative to group
    this.group.add(this.itemGroup);
  }

  // Triggers the sword swing or punch animation
  public swing() {
    this.isSwinging = true;
    this.swingTime = 0;
  }

  // Update loop for Bobbing, Swing physics, and item positioning
  public update(delta: number, isMoving: boolean, time: number) {
    // Determine target default position and rotation depending on if we hold an item
    const hasItem = this.activeItemId !== null;
    const targetPos = hasItem 
      ? new THREE.Vector3(0.38, -0.20, -0.22) // Sits far right, lower, and slightly receded in depth
      : new THREE.Vector3(0.34, -0.20, -0.24);
    const targetRot = hasItem
      ? new THREE.Euler(-0.15, -0.85, 0.15) // Rotated outward and more vertical
      : new THREE.Euler(-0.25, -0.85, 0.10);

    // 1. Swing Animation (quadratic easing-out punch)
    if (this.isSwinging) {
      this.swingTime += delta;
      const progress = this.swingTime / this.swingDuration;

      if (progress >= 1) {
        this.isSwinging = false;
        this.swingTime = 0;
        this.group.position.copy(targetPos);
        this.group.rotation.copy(targetRot);
      } else {
        // Swing movement: swing down and inward, then return
        const swingFactor = Math.sin(progress * Math.PI);
        
        // Position translation during swing
        this.group.position.set(
          targetPos.x - swingFactor * 0.08,
          targetPos.y - swingFactor * 0.06,
          targetPos.z + swingFactor * 0.06
        );

        // Rotation angles during swing
        this.group.rotation.set(
          targetRot.x - swingFactor * 0.7,
          targetRot.y - swingFactor * 0.3,
          targetRot.z + swingFactor * 0.5
        );
      }
    } else {
      // 2. View Bobbing (only active when moving on ground)
      if (isMoving) {
        const bobX = Math.sin(time * 6) * 0.01;
        const bobY = Math.cos(time * 12) * 0.006;
        this.group.position.set(
          targetPos.x + bobX,
          targetPos.y + bobY,
          targetPos.z
        );
        this.group.rotation.set(
          targetRot.x,
          targetRot.y + bobX * 0.15,
          targetRot.z + bobY * 0.08
        );
      } else {
        // Subtle idle breathing
        const idleBob = Math.sin(time * 1.5) * 0.002;
        this.group.position.set(
          targetPos.x,
          targetPos.y + idleBob,
          targetPos.z
        );
      }
    }
  }

  // Updates the item currently held in first person
  public setItem(item: HotbarItem | null, myTeam: Team) {
    const itemKey = item ? `${item.id}_${item.blockType || ''}` : 'null';
    const oldKey = this.activeItemId ? `${this.activeItemId}_${this.activeBlockType || ''}` : 'null';

    if (itemKey === oldKey) return; // Prevent redundant re-creations

    this.activeItemId = item ? item.id : null;
    this.activeBlockType = item ? (item.blockType || null) : null;

    // Clear old held item mesh
    if (this.currentItemMesh) {
      this.itemGroup.remove(this.currentItemMesh);
      this.currentItemMesh = null;
    }

    if (!item) {
      // Bare hand: show arm mesh
      this.armMesh.visible = true;
      this.armMesh.scale.set(1.1, 1.1, 1.1);
      return;
    }

    // Hide arm mesh when holding any item or block to match original Minecraft first-person view
    this.armMesh.visible = false;

    if (item.type === 'weapon' || item.type === 'tool') {
      // Map weapon/tool to correct high-resolution classic item texture
      let texPath = '';
      if (item.id === 'sword_wood') texPath = '/textures/items/swordWood.png';
      else if (item.id === 'sword_stone') texPath = '/textures/items/swordStone.png';
      else if (item.id === 'sword_iron') texPath = '/textures/items/swordIron.png';
      else if (item.id === 'sword_diamond') texPath = '/textures/items/swordDiamond.png';
      else if (item.id.includes('pickaxe')) texPath = '/textures/items/pickaxeDiamond.png';
      else if (item.id.includes('axe')) texPath = '/textures/items/hatchetDiamond.png';
      else if (item.id.includes('shears')) texPath = '/textures/items/shears.png';
      else texPath = '/textures/items/swordWood.png'; // Fallback

      this.textureLoader.load(texPath, (tex) => {
        // Match standard Minecraft pixel-perfect sharpness
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;

        // Enlarged to match the prominent size in the screenshot
        const geom = new THREE.PlaneGeometry(0.24, 0.24);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          alphaTest: 0.1,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: true
        });

        const mesh = new THREE.Mesh(geom, mat);
        
        // Position item diagonally forward and rotated pointing up-left
        mesh.position.set(-0.02, 0.08, -0.02);
        mesh.rotation.set(0, -0.1, Math.PI / 4 + 0.15); // Perfectly angled sword
        mesh.renderOrder = 9999;

        this.currentItemMesh = mesh;
        this.itemGroup.add(mesh);
      });
    } else if (item.type === 'block') {
      // Render holding a beautiful mini 3D block
      let blockTexPath = '';
      if (item.blockType === BlockType.RED_WOOL) blockTexPath = '/textures/blocks/red_wool.png';
      else if (item.blockType === BlockType.BLUE_WOOL) blockTexPath = '/textures/blocks/blue_wool.png';
      else if (item.blockType === BlockType.WHITE_WOOL) blockTexPath = '/textures/blocks/white_wool.png';
      else if (item.blockType === (18 as BlockType)) blockTexPath = '/textures/blocks/cherry_log.png';
      else if (item.blockType === (19 as BlockType)) blockTexPath = '/textures/blocks/cherry_leaves.png';
      else if (item.blockType === BlockType.WOOD) blockTexPath = '/textures/blocks/wood.png';
      else if (item.blockType === BlockType.STONE) blockTexPath = '/textures/blocks/stone.png';
      else if (item.blockType === BlockType.DIAMOND_BLOCK) blockTexPath = '/textures/blocks/blockDiamond.png';
      else if (item.blockType === BlockType.EMERALD_BLOCK) blockTexPath = '/textures/blocks/blockEmerald.png';
      else if (item.blockType === BlockType.GOLD_BLOCK) blockTexPath = '/textures/blocks/blockGold.png';
      else if (item.blockType === BlockType.IRON_BLOCK) blockTexPath = '/textures/blocks/blockIron.png';
      else if (item.blockType === BlockType.OBSIDIAN) blockTexPath = '/textures/blocks/obsidian.png';
      else if (item.blockType === BlockType.BRICKS) blockTexPath = '/textures/blocks/brick.png';
      else blockTexPath = '/textures/blocks/wood.png'; // Fallback

      this.textureLoader.load(blockTexPath, (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;

        // Enlarged block scale
        const blockGeom = new THREE.BoxGeometry(0.11, 0.11, 0.11);
        const blockMat = new THREE.MeshBasicMaterial({
          map: tex,
          depthTest: true,
          depthWrite: true
        });

        const mesh = new THREE.Mesh(blockGeom, blockMat);
        mesh.position.set(-0.02, 0.05, -0.02);
        mesh.rotation.set(0.25, 0.45, 0.15); // Rotated block showcase
        mesh.renderOrder = 9999;

        this.currentItemMesh = mesh;
        this.itemGroup.add(mesh);
      });
    } else if (item.type === 'utility') {
      let utilTexPath = '/textures/items/ender_pearl.png';
      if (item.id === 'golden_apple') utilTexPath = '/textures/items/appleGold.png';
      else if (item.id === 'fireball') utilTexPath = '/textures/items/fireball.png';

      this.textureLoader.load(utilTexPath, (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        const geom = new THREE.PlaneGeometry(0.18, 0.18);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          alphaTest: 0.1,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: true
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(-0.02, 0.05, -0.02);
        mesh.renderOrder = 9999;
        this.currentItemMesh = mesh;
        this.itemGroup.add(mesh);
      });
    }
  }
}
