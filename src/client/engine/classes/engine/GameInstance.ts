import { Engine, ILoadingScreen } from "@babylonjs/core";
import { World } from "./World";

export class GameInstance {
  currentWorld: World | null | undefined = undefined;
  error: boolean = false;
  errorMsg: string | undefined = undefined;
  welcomeScreen: ILoadingScreen | null = null; // TODO
  // mainMenu: ...  // No gameplay, just user/session management and UI

  readonly engineRef: Engine;

  constructor(engineRef: Engine) {
    this.engineRef = engineRef;

    // this.createWorld();
  }

  createDefaultWorld() {
    // this.createWorldAsync()
    //   .then(world => {
    //     this.currentWorld = world;
    //   })
    //   .catch(reason => {
    //     this.currentWorld = null;
    //     this.error = true;
    //     this.errorMsg = "Неопределенная ошибка";
    //     console.error(reason);
    //   });

    // try {
    //   const world = new World(this);
    //   this.currentWorld = world;
    //   return world;
    // } catch (error) {
    //   this.currentWorld = null;
    //   this.error = true;
    //   this.errorMsg = "Неопределенная ошибка";
    //   if (__IS_DEV__) {
    //     console.error(error);
    //   }
    // }
    const world = new World(this);
    this.currentWorld = world;
    return world;
  }

  appendWorld(world: World) {
    this.currentWorld = world;
  }

  // private async createWorldAsync(): Promise<World> {
  //   return new Promise((resolve, reject) => {
  //     const world = new World(this);
  //     resolve(world);
  //   })
  // }

  render() {
    this.currentWorld?.render();
  }

  load() { }

  dispose() { }
}