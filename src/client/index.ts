import {
  EngineFactory,
  FreeCamera,
  HemisphericLight,
  MeshAssetTask,
  MeshBuilder,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';
import { GameEngine, GameEngineOptions } from "client/engine/classes/engine/GameEngine";
import { Actor } from "./engine/classes/GameFramework";
import { addEntities, initLevel } from "./engine/classes/levels/TestLevel";
import HavokPhysics from "@babylonjs/havok";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

EngineFactory.CreateAsync(canvas, {
  adaptToDeviceRatio: true,
  antialias: true,
}).then(async renderEngine => {
  const engine = new GameEngine(renderEngine, GameEngineOptions.clientOptions(canvas));

  engine.init();

  // engine.renderEngine.displayLoadingUI();

  // entities
  const world = engine.gameInstance.createDefaultWorld();
  world.showGameLoadingScreen();

  const level = await initLevel(world);

  // content
  // class BallActor extends Actor {
  //   RosAtom_Full = "RosAtom_Full";

  //   constructor() {
  //     const name = 'ball';

  //     super(name, level.scene);

  //     // const ball = MeshBuilder.CreateSphere(name, { diameter: 1 });
  //     // ball.parent = this.root;
  //     console.log(this.meshAssetsMap);
  //     this.addMeshAssetTask(this.RosAtom_Full, "models/", "Duck.glb");
  //     console.log(this.meshAssetsMap);
  //   }

  //   onBeginPlay = () => {
  //     console.log('BallActor onBeginPlay');

  //     this.meshAssetsMap.get(this.RosAtom_Full)?.loadedMeshes[0].position.set(0, 0, 0);
  //     console.log(this.meshAssetsMap.get(this.RosAtom_Full));
  //   };
  // }

  // const light = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), level.scene);
  // light.intensity = 0.7;

  // const camera = new FreeCamera('FreeCamera', new Vector3(10, 5, 10), level.scene);
  // camera.setTarget(new Vector3(0, 0, 0));
  // camera.attachControl();


  // run 
  world.loadAndChangeLevel(level)
    .then(() => {
      world.hideGameLoadingScreen();
      engine.start();

      addEntities(level, world);
      // const ballActor = new BallActor();
      // world.spawnActor(ballActor);

      if (__IS_DEV__) {
        Inspector.Show(level.scene, {});
      }

      async function getInitializedHavok() {
        return await HavokPhysics();
      }

  //     // setTimeout(() => {
  //     //   const isDestroyed = world.destroyActor(ballActor);
  //     //   console.log('world.destroyActor', isDestroyed);
  //     // }, 3000);
    });
})

