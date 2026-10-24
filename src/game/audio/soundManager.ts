import { synthBedBreak, synthBlockBreak, synthVictory } from './soundSynthesizers';
import { synthClick, synthBlockPlace, synthBlockHit, synthTeleport, synthPickup, synthCombatHit, synthThrow } from './basicSoundSynthesizers';

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playClick() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthClick(this.ctx);
  }

  public playBlockPlace() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthBlockPlace(this.ctx);
  }

  public playBlockHit() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthBlockHit(this.ctx);
  }

  public playTeleport() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthTeleport(this.ctx);
  }

  public playBlockBreak() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthBlockBreak(this.ctx);
  }

  public playPickup() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthPickup(this.ctx);
  }

  public playHit() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthCombatHit(this.ctx);
  }

  public playThrow() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthThrow(this.ctx);
  }

  public playBedBreak() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthBedBreak(this.ctx);
  }

  public playVictory() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx) synthVictory(this.ctx);
  }
}

export const sounds = new SoundManager();
