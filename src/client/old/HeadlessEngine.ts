import {
  // Engine,
  NullEngine,
} from "@babylonjs/core";
// global.XMLHttpRequest = require("xhr2").XMLHttpRequest;
import { Network } from "client/old/controllers/Network";
import { Level } from "client/old/levels/DemoLevel";


export class HeadlessEngine {
  renderEngine: NullEngine;
  currentLevel: Level | null = null;
  // client: Network;

  constructor() {
    this.renderEngine = this.createRenderEngine()
    this.init();
    this.createScene();

    // create colyseus client
    // this.client = new Network(__WS_PORT__);
  }

  private createRenderEngine() {
    return new NullEngine();
  }

  private init() {
  }

  private createScene() {
    const demoLevel = new Level(this);
    this.currentLevel = demoLevel;

    this.render();
  }

  private render() {
    this.renderEngine.runRenderLoop(() => {
      if (this.currentLevel) {
        this.currentLevel.scene.render();
      }
    });
  }
}

new HeadlessEngine();