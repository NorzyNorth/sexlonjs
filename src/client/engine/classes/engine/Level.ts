import { AbstractAssetTask, AssetsManager, Scene, SceneLoader, SceneOptions } from "@babylonjs/core";
import { Actor } from "../GameFramework";
import { World } from "./World";

export class Level {
  URL: string;
  netURL: string | undefined = undefined;
  scene: Scene;
  actors: Actor[];
  isLoading: boolean = false;

  // preloadAssets: AbstractAssetTask[] = [];
  // postloadAssets: AbstractAssetTask[] = [];

  private owningWorld: World;
  private assetsManager: AssetsManager;

  constructor(owningWorld: World, scene: Scene) {
    this.URL = String(new Date().getTime());
    this.actors = [];
    this.owningWorld = owningWorld;

    this.scene = scene;
    this.assetsManager = new AssetsManager(scene);
  }

  // createScene(sceneOptions?: SceneOptions) {
  //   this.scene = new Scene(this.owningWorld.getEngine(), sceneOptions);
  // }

  getWorld() { return this.owningWorld }

  async load() {
    this.isLoading = true;

    this.addToLoadLevelAssets();

    this.assetsManager.onFinish = (tasks) => {
      if (this.isLoading) {
        this.isLoading = false;
      }
      // console.log(tasks);
    }

    this.assetsManager.onTaskError = (task) => {
      if (__IS_DEV__) {
        console.error('Task load error:', task);
      }
    }

    // this.assetsManager.onTaskSuccess = (task) => { }

    await this.loadAssets();
  }

  addToLoadLevelAssets() {
    for (let i = 0; i < this.actors.length; i++) {
      const actor = this.actors[i];
      this.addToLoadActorAssets(actor);
    }
  }

  addToLoadActorAssets(actor: Actor) {
    for (let j = 0; j < actor._meshAssetsTasksQueue.length; j++) {
      const item = actor._meshAssetsTasksQueue[j];

      const task = this.assetsManager.addMeshTask(
        item.taskName,
        "",
        item.rootUrl,
        item.sceneFilename
      );
      task.onSuccess = task => {
        // for node "__root__"
        task.loadedMeshes[0].name = item.taskName;
        task.loadedMeshes[0].parent = actor.root;
      }

      actor.meshAssetsMap.set(item.taskName, task);
    }

    // TODO actor._textureAssetsTasksQueue
  }

  async loadAssets() {
    await this.assetsManager.loadAsync();
  }

  render() {
    this.scene.render();
  }

  _registerActorEvents(actor: Actor) {
    if (actor.onTick) {
      actor._fnRegisterOnTick = () => {
        // TODO "the current delta time used by animation engine"
        // проверить соответствие this.scene.deltaTime и renderEngine.getDeltaTime()
        // иначе убрать actor._fnRegisterOnTick и подобные _fn
        // и сделать this.scene.registerBeforeRender(actor.onTick)
        if (actor.isCompleteSpawned) {
          actor.onTick?.(this.scene.deltaTime);
        }
      }
      this.scene.registerBeforeRender(actor._fnRegisterOnTick);
    }
  }

  _unregisterActorEvents(actor: Actor) {
    if (actor._fnRegisterOnTick) {
      this.scene.unregisterBeforeRender(actor._fnRegisterOnTick);
      actor._fnRegisterOnTick = undefined;
    }
  }

  _addActor(actor: Actor) {
    this.actors.push(actor);
  }

  _deleteActor(actor: Actor) {
    this.actors = this.actors.filter(other => other.URL !== actor.URL);
  }

  _destroy() {
    this.scene.dispose();
  }
}