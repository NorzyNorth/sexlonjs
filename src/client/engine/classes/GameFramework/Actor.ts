import { Mesh, MeshAssetTask, Node, Scene, TextureAssetTask } from "@babylonjs/core";
import { EEndPlayReason } from "../engine/World";


interface IMeshAssetsTaskProps {
  taskName: string;
  rootUrl: string,
  sceneFilename: string,
}

interface ITextureAssetsTaskProps {
  taskName: string;
  url: string;
  noMipmap?: boolean | undefined;
  invertY?: boolean;
  samplingMode?: number;
}


interface IPropertyOptions {
  replication?: boolean;
}

const defaultPropertyOption: Required<IPropertyOptions> = {
  replication: false,
}

export interface IActorOptions {
}

// By default, each replicated property has a built-in condition, and that is that they don't replicate if they haven't changed. 

export class Actor {
  URL: string;
  root: Mesh;
  name: string;

  isReplicated: boolean = false;
  netUpdateFrequency: number = 100.0;     // ms, updating every 0.1 seconds
  isReplicateMovement: boolean = false;   // location, velocity, rotation

  meshAssetsMap = new Map<string, MeshAssetTask>();
  textureAssetsMap = new Map<string, TextureAssetTask>();

  private propMetaData: Map<keyof typeof this, Required<IPropertyOptions>>;
  private lastReplicateTime: string | null = null;
  private _isCompleteSpawned: boolean = false;     // завершение спавна

  protected scene: Scene;

  _meshAssetsTasksQueue: IMeshAssetsTaskProps[] = [];
  _textureAssetsTasksQueue: ITextureAssetsTaskProps[] = [];

  // служебные данные для бабилон рендерера
  _fnRegisterOnTick?: () => void;
  // _fnRegisterOnBeginPlay?: () => void;
  // _fnRegisterOnEndPlay?: () => void;

  constructor(name: string, scene: Scene, options?: IActorOptions) {
    this.name = name;
    this.scene = scene;
    this.URL = String(new Date().getTime());

    this.root = new Mesh('Pivot');
    this.root.setEnabled(false);
    this.root.name = name;

    this.propMetaData = new Map();

    this.defineProp('name', { replication: false });

    this.defineProp.bind(this);
    this.createDefaultPropertyOptions.bind(this);
  }

  multicast() { }
  runOnServer() { }
  runOnOwningClient() { }

  onBeginPlay?: () => void;
  onTick?: (deltaTime: number) => void;
  onEndPlay?: (endPlayReason: EEndPlayReason) => void;

  get isCompleteSpawned() { return this._isCompleteSpawned }
  set isCompleteSpawned(value: boolean) { if (!this._isCompleteSpawned) this._isCompleteSpawned = value; }

  defineProp(prop: keyof typeof this, options: IPropertyOptions = {}) {
    const oldOptions = this.propMetaData.get(prop);
    if (!oldOptions) {
      this.propMetaData.set(prop, this.createDefaultPropertyOptions(options, defaultPropertyOption));
    } else {
      this.propMetaData.set(prop, this.createDefaultPropertyOptions(options, oldOptions));
    }
  }

  addMeshAssetTask(taskName: string, rootUrl: string, sceneFilename: string) {
    this._meshAssetsTasksQueue.push({
      taskName,
      rootUrl,
      sceneFilename,
    });
  }

  addTextureAssetTask(taskName: string, url: string, noMipmap?: boolean | undefined, invertY?: boolean, samplingMode?: number) {
    this._textureAssetsTasksQueue.push({
      taskName,
      url,
      invertY,
      noMipmap,
      samplingMode,
    });
  }

  private createDefaultPropertyOptions(options: IPropertyOptions = {}, defaultOptions: Required<IPropertyOptions>)
    : Required<IPropertyOptions> {
    return {
      replication: options.replication || defaultOptions.replication,
    }
  }

  _destroy() {
    this.root.dispose(false);
  }
}