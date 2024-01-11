import {
  Engine,
  WebGPUEngine,
  EngineFactory,
  Constants,
  SceneOptimizer,
  NullEngine,
} from "@babylonjs/core";
import { Network } from "client/old/controllers/Network";
import { Level } from "client/old/levels/DemoLevel";

export class GameEngine {
  canvas: HTMLCanvasElement;
  // @ts-ignore // разделить GameEngine и вынести сущности в парам констуктора
  renderEngine: Engine;
  currentLevel: Level | null = null;
  client: Network;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.createRenderEngine()
      .then(renderEngine => {
        this.renderEngine = renderEngine;

        this.init();

        this.createScene();
        this.optimize();
      })
      .catch(err => {
        this.renderEngine = new NullEngine();
        console.error(err);
      });

    // create colyseus client
    this.client = new Network(__WS_PORT__);
  }

  private async optimize() {
    //test
    if (!__IS_DEV__) {
      // инспектор может не обновлять информацию
      setTimeout(async () => {
        const supported = await WebGPUEngine.IsSupportedAsync;
        if (supported) {
          // +7 fps for WebGPUEngine
          console.log('snapshotRendering');
          this.renderEngine.snapshotRendering = true;
          this.renderEngine.snapshotRenderingMode = Constants.SNAPSHOTRENDERING_STANDARD;
        }
      }, 6000);
    }
  }

  private async createRenderEngine() {
    // dom.webgpu.enabled - firefox
    return await EngineFactory.CreateAsync(this.canvas, {
      adaptToDeviceRatio: true,
      antialias: true,
    });
  }

  private init() {
    window.addEventListener('resize', () => {
      this.renderEngine.resize();
    });
  }

  private createScene() {
    const demoLevel = new Level(this);
    this.currentLevel = demoLevel;

    demoLevel.scene.onPointerDown = (evt) => {
      // среднее колесо мыши
      if (evt.button === 1 && this.renderEngine.isPointerLock) this.renderEngine.exitPointerlock();
      if (evt.button === 1 && !this.renderEngine.isPointerLock) this.renderEngine.enterPointerlock();
    };

    this.render();
  }

  private render() {
    let divFps = document.getElementById("fps");

    this.renderEngine.runRenderLoop(() => {
      if (this.currentLevel) {
        this.currentLevel.scene.render();
      }
      if (divFps) {
        divFps.innerHTML = this.renderEngine.getFps().toFixed() + " fps";
      }
    });
  }
}
