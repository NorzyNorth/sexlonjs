import { TransformNode } from "@babylonjs/core";


interface IPropertyOptions {
  replication?: boolean;
}

const defaultPropertyOption: Required<IPropertyOptions> = {
  replication: false,
}

interface IActorOptions {
}

// By default, each replicated property has a built-in condition, and that is that they don't replicate if they haven't changed. 

export class Actor<RootNode = TransformNode> {
  root: RootNode;
  name: string;

  isReplicated: boolean = false;
  netUpdateFrequency: number = 100.0; // ms, updating every 0.1 seconds
  isReplicateMovement: boolean = false; // location, velocity, rotation

  private propMetaData: Map<keyof typeof this, Required<IPropertyOptions>>;
  private lastReplicateTime: string | null = null;

  constructor(name: string, root: RootNode, options: IActorOptions) {
    this.name = name;
    this.root = root;

    this.propMetaData = new Map();

    this.defineProp('name', { replication: true });

    this.defineProp.bind(this);
    this.createDefaultPropertyOptions.bind(this);
  }

  onPostActorCreated() { }

  multicast() { }
  runOnServer() { }
  runOnOwningClient() { }

  defineProp(prop: keyof typeof this, options: IPropertyOptions = {}) {
    if (!this.propMetaData.has(prop)) {
      this.propMetaData.set(prop, this.createDefaultPropertyOptions(options, defaultPropertyOption));
    } else {
      const oldOptions = this.propMetaData.get(prop);
      this.propMetaData.set(prop, this.createDefaultPropertyOptions(options, oldOptions));
    }
  }

  private createDefaultPropertyOptions(options: IPropertyOptions = {}, defaultOptions: Required<IPropertyOptions>)
    : Required<IPropertyOptions> {
    return {
      replication: options.replication || defaultOptions.replication,
    }
  }
}