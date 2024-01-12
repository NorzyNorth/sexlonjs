
export interface IWorldSettings {
  worldGravityZ: number; // current gravity actually being used
}

export class WorldSettings implements IWorldSettings {
  worldGravityZ: number = 9.807;

  combine(settings: IWorldSettings) {
    // TODO
  }
}
