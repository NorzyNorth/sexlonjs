import { AbstractAssetTask, AssetsManager, Scene, SceneOptions } from "@babylonjs/core";
import { Actor } from "../GameFramework";
import { World } from "./World";

export class Level {
  URL: string;
  netURL: string | undefined = undefined;
  scene: Scene; //  | null = null
  actors: Actor[];
  isLoading: boolean = false;

  preloadAssets: AbstractAssetTask[] = [];
  // postloadAssets: AbstractAssetTask[] = [];

  private owningWorld: World;
  private assetsManager: AssetsManager;

  constructor(owningWorld: World, scene: Scene) {
    this.URL = String(new Date().getTime());
    this.actors = [];
    this.owningWorld = owningWorld;
    this.assetsManager = owningWorld.assetsManager;

    this.scene = scene;
  }

  // createScene(sceneOptions?: SceneOptions) {
  //   this.scene = new Scene(this.owningWorld.getEngine(), sceneOptions);
  // }

  getWorld() { return this.owningWorld }

  async load() {
    // this.isLoading = true;

    // const task = this.assetsManager.addMeshTask(
    //   'mesh',
    //   "",
    //   "models/",
    //   "RosAtom_Full.glb"
    // );
    // task.

    // this.assetsManager.onFinish = () => {
    //   if (this.isLoading) {
    //     this.isLoading = false;
    //   }
    // }

    // this.assetsManager.onTaskError = (task) => {
    //   if (__IS_DEV__) {
    //     console.error('load error:', task);
    //   }
    // }

    // this.assetsManager.onTaskSuccess = (task) => {

    // }

    // // this.assetsManager.load();
    // await this.assetsManager.loadAsync();
  }
}