import {
  EngineFactory,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Vector3,
} from "@babylonjs/core";
import { GameEngine, GameEngineOptions } from "client/engine/classes/engine/GameEngine";
import { initLevel } from "./levels/TestLevel";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

EngineFactory.CreateAsync(canvas, {
  adaptToDeviceRatio: true,
  antialias: true,
}).then(renderEngine => {
  const engine = new GameEngine(renderEngine, GameEngineOptions.clientOptions(canvas));

  engine.init();

  // entities
  const world = engine.gameInstance.createDefaultWorld();

  const testLevel = initLevel(world);
  world.loadAndChangeLevel(testLevel);

  engine.start();
})
