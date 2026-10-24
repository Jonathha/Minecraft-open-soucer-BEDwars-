import { GameEngine } from '../gameEngine';
import { runHumanBridgeAssist } from './humanBridgeAssist';
import { performEdgeBridgePlacement, performTestPlacement } from './testPlacementHelpers';

export class AntiCheatTestSimulator {
  public autoPlaceHoldingL = false;
  public autoSneakBridgeOnE = false;
  public humanBridgeAssistOnL = false;
  public noAimMode = false;

  private autoTimer = 0;
  private assistPlaceTimer = { value: 0 };
  private isHoldingLKey = false;

  public setLKeyState(isDown: boolean): void {
    this.isHoldingLKey = isDown;
    if (!this.humanBridgeAssistOnL) {
      this.autoPlaceHoldingL = isDown;
    }
  }

  public update(delta: number, engine: GameEngine): void {
    if (engine.state !== 'match') return;

    if (this.autoSneakBridgeOnE && engine.player.isMoving) {
      engine.player.keys.sneak = true;
    }

    if (this.humanBridgeAssistOnL && this.isHoldingLKey) {
      runHumanBridgeAssist(delta, engine, this.assistPlaceTimer);
      return;
    }

    if (this.autoPlaceHoldingL) {
      this.autoTimer += delta;
      if (this.autoTimer >= 0.08) {
        this.autoTimer = 0;
        this.performTestPlacement(engine, this.noAimMode);
      }
    }
  }

  public handleSmartEPlace(engine: GameEngine): boolean {
    if (engine.state !== 'match') return false;
    return this.performEdgeBridgePlacement(engine);
  }

  public performEdgeBridgePlacement(engine: GameEngine): boolean {
    return performEdgeBridgePlacement(engine);
  }

  public performTestPlacement(engine: GameEngine, withoutAiming: boolean): boolean {
    return performTestPlacement(engine, withoutAiming);
  }
}
