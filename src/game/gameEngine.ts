import * as THREE from 'three';
import { GameState, HotbarItem, ResourceCounts, ShopItem, Team, TeamUpgrade } from '../types/game';
import { VoxelWorld } from './world/voxelWorld';
import { ArenaLocations } from './world/arenaBuilder';
import { PlayerController } from './player/playerController';
import { ResourceManager } from './entities/resourceManager';
import { NPCManager } from './entities/npcManager';
import { CharacterMesh } from './graphics/characterModel';
import { BotOpponent } from './entities/botOpponent';
import { NetworkClient } from './network/networkClient';
import { createEngineNetwork } from './network/engineNetwork';
import { MatchManager } from './match/matchManager';
import { InteractionHandler } from './player/interactionHandler';
import { BlockBreakVisualizer } from './graphics/destroyStages';
import { BlockParticleManager } from './graphics/blockParticles';
import { syncResourcesToHotbar } from './player/hotbarSync';
import { AntiCheatEngine } from './anticheat/antiCheatEngine';
import { EspManager } from './anticheat/espManager';
import { AimbotManager } from './anticheat/aimbotManager';
import { AntiCheatTestSimulator } from './anticheat/testSimulator';
import { buyEngineItem, buyEngineUpgrade, addItemToEngineHotbar, resetEngineMatchLoadout } from './player/engineInventoryShop';
import { startEngineMenu, enterEngineLobby, startEngineMatch } from './match/engineStateTransitions';
import { updateEngineFrame } from './engineUpdateLoop';
import { createEngineMatchManager, createEngineInteractionHandler } from './engineFactory';
import { FirstPersonHand } from './graphics/firstPersonHand';

export class GameEngine {
  public renderer: THREE.WebGLRenderer;
  public scene = new THREE.Scene();
  public camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  public world: VoxelWorld;
  public player: PlayerController;
  public resources: ResourceManager;
  public npcs: NPCManager;
  public network: NetworkClient;
  public match: MatchManager;
  public interaction: InteractionHandler;
  public visualizer: BlockBreakVisualizer;
  public particles: BlockParticleManager;
  public antiCheat: AntiCheatEngine;
  public esp: EspManager;
  public aimbot = new AimbotManager();
  public testSimulator = new AntiCheatTestSimulator();
  public firstPersonHand: FirstPersonHand;
  public state: GameState = 'menu';
  public arenaLocs: ArenaLocations | null = null;
  public inventory: ResourceCounts = { iron: 0, gold: 0, diamond: 0, emerald: 0 };
  public hotbar: (HotbarItem | null)[] = [];
  public selectedSlot = 0;
  public opponentMesh: CharacterMesh | null = null;
  public bot: BotOpponent | null = null;
  public onSyncUI?: () => void;
  public onOpenShop?: (shopType: 'item_shop' | 'upgrade_shop') => void;
  private clock = new THREE.Clock();
  private isDestroyed = false;
  private loopAccumulator = { value: 0, uiSyncTimer: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.world = new VoxelWorld(this.scene);
    this.player = new PlayerController(this.camera);

    this.scene.add(this.camera);
    this.firstPersonHand = new FirstPersonHand();
    this.camera.add(this.firstPersonHand.group);

    this.resources = new ResourceManager(this.scene);
    this.npcs = new NPCManager(this.scene);
    this.visualizer = new BlockBreakVisualizer(this.scene);
    this.particles = new BlockParticleManager(this.scene);
    this.antiCheat = new AntiCheatEngine();
    this.esp = new EspManager();
    this.match = createEngineMatchManager(this);
    this.player.onLookUpdate = (yaw, pitch) => this.antiCheat.trackPlayerRotation(yaw, pitch);
    this.player.onTeleport = (pos) => this.antiCheat.notifyTeleport(pos);

    this.interaction = createEngineInteractionHandler(this);
    this.network = createEngineNetwork(this);
    (this.interaction as unknown as { ctx: { network: NetworkClient } }).ctx.network = this.network;
    this.antiCheat.onViolationRollback = () => {
      this.interaction.clearPendingPlacements();
    };
    this.startMenu();
    this.animate();
  }

  public startMenu() { startEngineMenu(this); }
  public enterLobby() { enterEngineLobby(this); }
  public startMatch(roomId: string, myTeam: Team, opponentName: string) { startEngineMatch(this, roomId, myTeam, opponentName); }
  public syncResourcesToHotbar() { syncResourcesToHotbar(this.hotbar, this.inventory); }
  public resetMatchLoadout() { this.selectedSlot = resetEngineMatchLoadout(this.inventory, this.hotbar, this.onSyncUI); }
  public addItemToHotbar(item: HotbarItem) { this.selectedSlot = addItemToEngineHotbar(this.hotbar, item); }
  public buyUpgrade(upgrade: TeamUpgrade): boolean { return buyEngineUpgrade(upgrade, this.inventory, this.hotbar, this.onSyncUI); }
  public buyItem(item: ShopItem, myTeam: Team): boolean {
    const res = buyEngineItem(item, myTeam, this.inventory, this.hotbar, this.match, this.network, this.onSyncUI);
    if (res.selectedSlot !== undefined) this.selectedSlot = res.selectedSlot;
    return res.success;
  }

  private animate = () => {
    if (this.isDestroyed) return;
    requestAnimationFrame(this.animate);
    updateEngineFrame(this, this.clock.getDelta(), this.clock.getElapsedTime(), this.loopAccumulator);
  };

  public handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public destroy() {
    this.isDestroyed = true;
    this.visualizer.destroy(this.scene);
    this.particles.destroy();
    this.renderer.dispose();
  }
}
