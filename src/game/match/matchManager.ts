import * as THREE from 'three';
import { MatchInfo, Team } from '../../types/game';
import { sounds } from '../audio/soundManager';
import { ArenaLocations } from '../world/arenaBuilder';
import { PlayerController } from '../player/playerController';
import { BotOpponent } from '../entities/botOpponent';

export class MatchManager {
  public matchInfo: MatchInfo = {
    roomId: '', myTeam: 'red', opponentName: 'Player 2',
    redBed: true, blueBed: true, redAlive: true, blueAlive: true
  };
  public health = 20;
  public armorTier = 0; // 0: none, 1: chain (20%), 2: iron (40%), 3: diamond (60%)
  private player: PlayerController;
  private getArenaLocs: () => ArenaLocations | null;
  private onGameOver: () => void;
  private onSyncUI?: () => void;
  private onPlayerRespawn?: () => void;
  private onPlayerDeath?: () => void;

  constructor(
    player: PlayerController,
    getArenaLocs: () => ArenaLocations | null,
    onGameOver: () => void,
    onSyncUI?: () => void,
    onPlayerRespawn?: () => void,
    onPlayerDeath?: () => void
  ) {
    this.player = player;
    this.getArenaLocs = getArenaLocs;
    this.onGameOver = onGameOver;
    this.onSyncUI = onSyncUI;
    this.onPlayerRespawn = onPlayerRespawn;
    this.onPlayerDeath = onPlayerDeath;
  }

  public initMatch(roomId: string, myTeam: Team, opponentName: string) {
    this.matchInfo = {
      roomId, myTeam, opponentName,
      redBed: true, blueBed: true, redAlive: true, blueAlive: true
    };
    this.health = 20;
    this.armorTier = 0;
  }

  public takeDamage(amount: number, dir: THREE.Vector3) {
    sounds.playHit();
    const reduction = this.armorTier === 3 ? 0.6 : this.armorTier === 2 ? 0.4 : this.armorTier === 1 ? 0.2 : 0;
    const finalDamage = Math.max(1, Math.round(amount * (1 - reduction)));
    this.health = Math.max(0, this.health - finalDamage);
    this.player.applyKnockback(dir, 7);
    this.onSyncUI?.();
    if (this.health <= 0) this.handlePlayerDeath();
  }

  public handlePlayerDeath() {
    sounds.playHit();
    this.onPlayerDeath?.();
    const myTeam = this.matchInfo.myTeam;
    const bedIntact = myTeam === 'red' ? this.matchInfo.redBed : this.matchInfo.blueBed;

    if (bedIntact) {
      setTimeout(() => {
        const locs = this.getArenaLocs();
        if (locs) {
          const spawn = myTeam === 'red' ? locs.redSpawn : locs.blueSpawn;
          this.player.teleport(spawn, myTeam === 'red' ? Math.PI : 0);
          this.health = 20;
          this.onPlayerRespawn?.();
          this.onSyncUI?.();
        }
      }, 1500);
    } else {
      if (myTeam === 'red') this.matchInfo.redAlive = false;
      else this.matchInfo.blueAlive = false;
      this.matchInfo.winner = myTeam === 'red' ? 'blue' : 'red';
      sounds.playBedBreak();
      this.onGameOver();
      this.onSyncUI?.();
    }
  }

  public handleOpponentDeath(bot: BotOpponent | null) {
    const oppTeam: Team = this.matchInfo.myTeam === 'red' ? 'blue' : 'red';
    const bedIntact = oppTeam === 'red' ? this.matchInfo.redBed : this.matchInfo.blueBed;

    if (bedIntact) {
      if (bot) {
        const locs = this.getArenaLocs();
        if (locs) {
          setTimeout(() => bot.respawn(oppTeam === 'red' ? locs.redSpawn : locs.blueSpawn), 3000);
        }
      }
    } else {
      if (oppTeam === 'red') this.matchInfo.redAlive = false;
      else this.matchInfo.blueAlive = false;
      this.handleOpponentWin();
    }
  }

  public handleBedDestroyed(team: Team) {
    sounds.playBedBreak();
    if (team === 'red') this.matchInfo.redBed = false;
    if (team === 'blue') this.matchInfo.blueBed = false;
    this.onSyncUI?.();
  }

  public handleOpponentWin() {
    this.matchInfo.winner = this.matchInfo.myTeam;
    sounds.playVictory();
    this.onGameOver();
    this.onSyncUI?.();
  }
}
