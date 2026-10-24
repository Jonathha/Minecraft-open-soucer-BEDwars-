import * as THREE from 'three';
import { NetworkClient } from './networkClient';
import { GameEngine } from '../gameEngine';
import { rejectionLogStore } from '../anticheat/rejectionLogStore';

export function createEngineNetwork(engine: GameEngine): NetworkClient {
  return new NetworkClient({
    onMatchFound: (rId, team, opp) => engine.startMatch(rId, team, opp),
    onOpponentMove: (pos, rot, occluded) => {
      if (engine.opponentMesh) {
        if (pos) {
          engine.opponentMesh.position.set(pos.x, pos.y, pos.z);
          engine.opponentMesh.rotation.y = (typeof rot === 'number' ? rot : 0) + Math.PI;
          engine.opponentMesh.updateAnimation(performance.now() * 0.001, true, 8);
        }
        if (occluded !== undefined) {
          engine.opponentMesh.visible = !occluded;
          if (occluded) {
            engine.opponentMesh.position.set(0, -9999, 0);
          }
        }
      }
    },
    onPlayerTeleport: (pos) => {
      if (engine.player) {
        const vec = new THREE.Vector3(pos.x, pos.y, pos.z);
        engine.player.teleport(vec, engine.player.yaw, engine.player.pitch);
        engine.antiCheat.notifyTeleport(vec);
      }
    },
    onBlockPlaced: (b) => engine.world.setBlock(b.x, b.y, b.z, b.type),
    onBlockConfirmed: (b) => {
      engine.interaction?.confirmPlacement(b.x, b.y, b.z);
    },
    onBlockRejected: (data) => {
      const p = data.pos;
      engine.interaction?.rejectPlacement(p.x, p.y, p.z);
      const blockType = engine.world.getBlock(p.x, p.y, p.z);
      engine.world.removeBlock(p.x, p.y, p.z);

      // Refund block item back to inventory
      if (blockType >= 6 && blockType <= 8) {
        const woolItem = engine.hotbar.find(h => h && h.type === 'block' && h.blockType === blockType);
        if (woolItem) {
          woolItem.count++;
        } else {
          const emptySlotIdx = engine.hotbar.findIndex(h => !h || h.count <= 0);
          const woolName = blockType === 6 ? 'Lã Vermelha' : blockType === 7 ? 'Lã Azul' : 'Lã Branca';
          const newWool = {
            id: 'wool',
            name: woolName,
            type: 'block' as const,
            blockType: blockType,
            count: 1
          };
          if (emptySlotIdx !== -1) {
            engine.hotbar[emptySlotIdx] = newWool;
          } else {
            engine.hotbar.push(newWool);
          }
        }
        engine.onSyncUI?.();
      }

      if (engine.player) {
        const distY = engine.player.position.y - p.y;
        const distX = Math.abs(engine.player.position.x - p.x);
        const distZ = Math.abs(engine.player.position.z - p.z);
        if (distY > 0 && distY < 2.0 && distX < 1.0 && distZ < 1.0) {
          engine.player.isGrounded = false;
        }
      }

      rejectionLogStore.addLog({
        origin: 'server',
        rule: data.rule || 'Server Block Rejected',
        reason: data.reason || 'Colocação rejeitada pelo Anti-Cheat do Servidor',
        file: data.file || (data.details?.file as string) || (data.rule?.includes('Inventory') ? 'server/anticheat/placementDetector.ts' : data.rule?.includes('Air Place') ? 'server/anticheat/placementDetector.ts & serverWorldBlocks.ts' : 'server/anticheat/placementDetector.ts'),
        error: data.error || (data.details?.error as string) || (data.rule?.includes('Inventory') ? 'ERR_INVENTORY_SPOOF' : data.rule?.includes('Air Place') ? 'ERR_AIR_PLACE' : 'ERR_SERVER_REJECT'),
        cause: data.cause || (data.details?.cause as string) || data.reason || 'O servidor invalidou esta colocação de bloco durante a validação autoritativa.',
        blockPos: { x: p.x, y: p.y, z: p.z },
        playerPos: engine.player ? {
          x: Number(engine.player.position.x.toFixed(2)),
          y: Number(engine.player.position.y.toFixed(2)),
          z: Number(engine.player.position.z.toFixed(2)),
        } : undefined,
        condition: data.reason || (data.details ? JSON.stringify(data.details) : undefined),
        details: data.details,
      });
    },
    onConnectionChange: (connected) => {
      if (!connected) {
        engine.interaction?.clearPendingPlacements();
      }
    },
    onBlockBroken: (p) => engine.world.removeBlock(p.x, p.y, p.z),
    onBedBroken: (team) => {
      engine.match.handleBedDestroyed(team);
      const bZ1 = team === 'red' ? 25 : -25;
      const bZ2 = team === 'red' ? 26 : -26;
      engine.world.removeBlock(0, 11, bZ1);
      engine.world.removeBlock(0, 11, bZ2);
    },
    onCombatDamage: (targetTeam, dmg, dir) => {
      if (targetTeam === engine.match.matchInfo.myTeam) {
        engine.match.takeDamage(dmg, new THREE.Vector3(dir.x, dir.y, dir.z));
      }
    },
    onOpponentLeft: () => {
      if (engine.opponentMesh) {
        engine.opponentMesh.visible = false;
        engine.opponentMesh.position.set(0, -9999, 0);
      }
      engine.match.handleOpponentWin();
    },
    onAntiCheatFlag: (data) => {
      const pPos = data.playerPos || (engine.player ? {
        x: Number(engine.player.position.x.toFixed(2)),
        y: Number(engine.player.position.y.toFixed(2)),
        z: Number(engine.player.position.z.toFixed(2)),
      } : { x: 0, y: 0, z: 0 });

      rejectionLogStore.addLog({
        origin: 'server',
        rule: data.rule,
        reason: data.details,
        file: data.file || 'server/anticheat/flyDetector.ts',
        error: data.error || 'ERR_ILLEGAL_MOVEMENT',
        cause: data.cause || 'Movimento rejeitado pelas regras físicas autoritativas do servidor.',
        blockPos: { x: Math.floor(pPos.x), y: Math.floor(pPos.y - 1), z: Math.floor(pPos.z) },
        playerPos: pPos,
        blockSupport: data.blockSupport,
        ping: data.ping,
        fps: data.fps,
        rttInfo: data.rttInfo || (data.ping !== undefined ? `Latência Data Center (us-east1): ${data.ping}ms` : undefined),
        condition: `VL: ${data.vl.toFixed(1)} | ${data.details}`,
        details: {
          category: data.category,
          rule: data.rule,
          vl: data.vl,
          ping: data.ping,
          fps: data.fps,
          blockSupport: data.blockSupport,
          rttInfo: data.rttInfo
        }
      });

      engine.antiCheat.movementLogger.logViolation(
        `SERVER:${data.category || 'MOVEMENT'}`,
        data.details,
        data.vl,
        {
          origin: 'server',
          ping: data.ping,
          fps: data.fps,
          rttInfo: data.rttInfo,
          playerPos: pPos,
          blockSupport: data.blockSupport
        }
      );
    },
    onPingUpdate: (ping) => {
      // Available if needed for HUD
    }
  });
}
