import {
  AssetsManager,
  ILoadingScreen,
  Scene,
  SceneOptions,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Actor } from "../GameFramework";
import { GameInstance } from "./GameInstance";
import { Level } from "./Level";
import { IWorldSettings, WorldSettings } from "./WorldSettings";
import { LoadingScreen } from "./LoadingScreen";


// TODO необходимость под вопросом
export enum EEndPlayReason {
  'DESTROYED',          // Actor уничтожен
  'LEVEL_TRANSITION',   // Мир начинает выгрузку для перехода на новый уровень
  'QUIT',               // завершение приложения
}

export class World {
  URL: string;
  netURL: string | undefined = undefined;
  deltaTime: number = 0;

  startLevel: Level | null = null; // стартовый уровень
  levels: Level[] = [];
  createdLevels: Level[] = [];
  // loadingLevel: Level | null = null; // загрузочный уровень
  gameLoadingScreen: ILoadingScreen;

  worldSettings: WorldSettings;   // глобальные настройки окружения
  // assetsManager: AssetsManager;   // TODO протестить
  // gameState: GameState;        // состояние игры для переноса между уровнями
  // gameMode: GameMode;          // игровые правила

  readonly persistentLevel: Level;
  readonly persistentScene: Scene;  // обязателен для старта бабилона

  private owningGameInstance: GameInstance;
  private currentLevel: Level | null = null;  // активный уровень
  private netActors: Actor[] = [];            // сетевые Actor, для быстрого доступа

  constructor(gameInstance: GameInstance, worldSettings?: IWorldSettings) {
    this.URL = String(new Date().getTime());

    this.owningGameInstance = gameInstance;

    this.worldSettings = new WorldSettings();
    if (worldSettings) {
      this.worldSettings.combine(worldSettings);
    }

    this.gameLoadingScreen = new LoadingScreen('Загрузка');
    this.getEngine().loadingScreen = this.gameLoadingScreen;

    this.persistentScene = new Scene(this.getEngine());
    this.persistentLevel = new Level(this, this.persistentScene);

    // this.assetsManager = new AssetsManager(this.persistentScene);

    // this.currentLevel = this.persistentLevel;
  }

  // init(worldSettings?: IWorldSettings) {
  //   this.worldSettings = new WorldSettings();
  //   if (worldSettings) {
  //     this.worldSettings.combine(worldSettings);
  //   }

  //   this._persistentScene = new Scene(this.getEngine());
  //   this._persistentLevel = new Level(this, this._persistentScene);

  //   this.assetsManager = new AssetsManager(this._persistentScene);

  //   this.currentLevel = this._persistentLevel;
  // }

  // onInitWorld: (() => IWorldSettings) | undefined = undefined;

  addActor(actor: Actor, level?: Level) {
    if (this.hasActor(actor, level)) {
      return;
    }

    if (level) {
      level._addActor(actor);
    } else if (this.currentLevel) {
      this.currentLevel._addActor(actor);
    }
  }

  getActor(actor: Actor, level?: Level) {
    const fLevel = level ?? this.currentLevel;
    return fLevel?.actors.find(otherActor => otherActor.URL === actor.URL);
  }

  hasActor(actor: Actor, level?: Level) {
    return Boolean(this.getActor(actor, level));
  }

  removeActor(actor: Actor) {
    this.currentLevel?._deleteActor(actor);
    if (actor.isReplicated) {
      this.netActors = this.netActors.filter(other => other.URL !== actor.URL);
    }
  }

  async spawnActor<TActor extends Actor = Actor>(actor: TActor, position?: Vector3, rotation?: Vector3): Promise<TActor> {
    this.addActor(actor);

    try {
      this.currentLevel?.addToLoadActorAssets(actor);
      await this.currentLevel?.loadAssets();

      if (actor.isReplicated) {
        this.netActors.push(actor);
      }

      this.currentLevel?._registerActorEvents(actor);

      if (rotation) {
        actor.root.rotation = rotation;
      }
      if (position) {
        actor.root.position = position;
      }

      // TODO сетевой запуск actor.onBeginPlay

      actor.root.setEnabled(true);
      actor.isCompleteSpawned = true;
      actor.onBeginPlay?.();

    } catch (error) {
      this.removeActor(actor);

      // TODO this.currentLevel?._unregisterActorEvents

      if (__IS_DEV__) {
        console.error('World.spawnActor', error);
      }
    }

    return actor;
  }

  destroyActor(actor: Actor): boolean {
    if (!this.hasActor(actor)) {
      return false;
    }

    try {
      // TODO сетевой запуск actor.onEndPlay

      actor.onEndPlay?.(EEndPlayReason.DESTROYED);

      this.currentLevel?._unregisterActorEvents(actor);

      this.removeActor(actor);

      actor._destroy();
      return true;

    } catch (error) {
      if (__IS_DEV__) {
        console.error('World.destroyActor', error);
      }
      return false;
    }
  }

  getEngine() { return this.owningGameInstance.engineRef }

  getDeltaTime() { return this.owningGameInstance.engineRef.getDeltaTime() };

  getCurrentScene() { return this.currentLevel?.scene }

  async asyncLoadLevel() { }

  createLevel(): Level {
    const scene = this.createScene();
    const level = new Level(this, scene);
    this.addLevel(level);

    return level;
  }

  transitLevel(newLevel: Level) {
    const oldLevel = this.currentLevel;

    if (oldLevel) {
      try {
        // TODO сетевой запуск actor.onEndPlay

        for (let i = 0; i < oldLevel.actors.length; i++) {
          const actor = oldLevel.actors[i];
          actor.onEndPlay?.(EEndPlayReason.LEVEL_TRANSITION);
        }

        // TODO сетевой запуск level destroy

        oldLevel._destroy();

        this.netActors = [];

        this.loadAndChangeLevel(newLevel);

      } catch (error) {
        if (__IS_DEV__) {
          console.error('World.transitLevel', error);
        }
      }
    }
  }

  setStartLevel(level: Level) {
    this.currentLevel = level;
    this.startLevel = level;
  }

  createScene() {
    // TODO SceneOptions добавить в worldSettings
    const options: SceneOptions = {
      useClonedMeshMap: true,
      useGeometryUniqueIdsMap: true,
      useMaterialMeshMap: true,
    };
    const scene = new Scene(this.getEngine(), options);
    return scene;
  }

  showGameLoadingScreen() {
    this.getEngine().displayLoadingUI();
  }

  hideGameLoadingScreen() {
    this.getEngine().hideLoadingUI();
  }

  addLevel(level: Level) {
    this.levels.push(level);
  }

  async loadLevel(level: Level) {
    await level.load();
  }

  activateLevel(level: Level) {
    this.currentLevel = level;
  }

  async loadAndChangeLevel(level: Level) {
    await this.loadLevel(level);
    this.activateLevel(level);
  }

  render() {
    this.currentLevel?.render();
  }

  // private createPersistentLevel(): Level {
  //   const level = new Level(this, this._persistentScene);
  //   return level;
  // }
}