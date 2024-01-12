import { Level } from "client/old/levels/DemoLevel";

// логика одного уровня
export class LevelController {
  level: Level;

  constructor(level: Level) {
    this.level = level;
  }
}