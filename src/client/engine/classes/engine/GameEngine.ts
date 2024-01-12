import { Engine } from "@babylonjs/core";
import { GameInstance } from "./GameInstance";

interface IGameEngineOptions {
  isServer?: boolean;
  canvas?: HTMLCanvasElement | null;
}

export class GameEngineOptions {
  static clientOptions(canvas: HTMLCanvasElement, options: Omit<IGameEngineOptions, "canvas"> = {})
    : Required<IGameEngineOptions> {
    return {
      isServer: false,
      ...options,
      canvas,
    }
  }

  static serverOptions(options: IGameEngineOptions = {}): Required<IGameEngineOptions> {
    return {
      isServer: true,
      canvas: null,
      ...options,
    }
  }
}

export class GameEngine {
  gameEngineOptions: Required<IGameEngineOptions>;
  renderEngine: Engine;
  gameInstance: GameInstance;

  constructor(renderEngine: Engine, options: Required<IGameEngineOptions>) {
    this.gameEngineOptions = options;
    this.renderEngine = renderEngine;

    this.gameInstance = new GameInstance(this.renderEngine);
  }

  onInit(gameEngineOptions: Required<IGameEngineOptions>) { }
  onStart() { }
  onTick(deltaSeconds: number) { }
  onPreExit() { }
  onExit() { }

  async exit() {
    this.onPreExit();
    this.gameInstance.dispose();
    this.renderEngine.dispose();
    this.onExit();
  }

  init() {
    if (!this.gameEngineOptions.isServer && window) {
      window.addEventListener('resize', () => {
        this.renderEngine.resize();
      });
    }
    this.onInit(this.gameEngineOptions);
  }

  start() {
    if (!this.gameInstance.error) {
      this.onStart();

      this.renderEngine.runRenderLoop(() => {
        // stop
        if (this.gameInstance.error) {
          this.renderEngine.stopRenderLoop();
          this.exit();
          return;
        }

        const delta = this.renderEngine.getDeltaTime();
        this.onTick(delta);
        if (this.gameInstance.currentWorld) {
          this.gameInstance.currentWorld.deltaTime = delta;
        }

        this.gameInstance.render();
      });

    } else {
      if (__IS_DEV__) {
        console.error(this.gameInstance.errorMsg);
      }
      this.exit();
    }
  }

  getWorld() { return this.gameInstance.currentWorld };
}