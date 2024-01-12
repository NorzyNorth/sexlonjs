import {
  EngineFactory,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Vector3,
} from "@babylonjs/core";
import { GameEngine, GameEngineOptions } from "client/engine/classes/engine/GameEngine";
import { initLevel } from "./levels/TestLevel";
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";

async function getInitializedHavok() {
  return await HavokPhysics();
}

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

EngineFactory.CreateAsync(canvas, {
  adaptToDeviceRatio: true,
  antialias: true,
}).then(async renderEngine => {
  const engine = new GameEngine(renderEngine, GameEngineOptions.clientOptions(canvas));

  engine.init();

  // globalThis.HK : Promise<HavokPhysicsWithBindings> = await HavokPhysics()
  // await HavokPhysics().then((havok) => {
  //   let initializedHavok = havok;
  // });

  // entities
  const world = engine.gameInstance.createDefaultWorld();

  const testLevel = initLevel(world);
  world.loadAndChangeLevel(testLevel);

  engine.start();
})
