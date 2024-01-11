import { IPointerEvent, KeyboardInfo, Mesh, MeshBuilder, PickingInfo, PointerInfo, Scene, Vector3 } from "@babylonjs/core";
import { Level } from "client/old/levels/DemoLevel";
import { Network } from "./Network";
import { Room } from "colyseus.js";
import { Player as ServerPlayer } from "server/rooms/schema/MyRoomState";
import { Player } from "client/old/entities/Player";

export class PlayerController {
  level: Level;
  mainPalyer: Player | null = null;

  private network: Network;
  private sceneRoom: Room | null;
  private playerEntities: { [key: string]: Mesh } = {}; // Player

  constructor(level: Level, network: Network) {
    this.level = level;
    this.network = network;

    this.level.onPointerDown = (event: IPointerEvent, pointer: PickingInfo) => {
      if (this.sceneRoom) {
        console.log(event, event.button, pointer);
        if (event.button == 0) {
          const targetPosition = pointer.pickedPoint.clone();
          this.onUpdate(targetPosition);
        }
      }
    }
  }

  public async joinTheRoom(position: Vector3) {
    this.network.joinOrCreateSceneRoom()
      .then(room => {
        console.log("Connected to roomId: " + room.roomId);
        this.sceneRoom = room;

        // @ts-ignore
        room.state.players.onAdd((player, sessionId) => {
          this.onAdd(player, sessionId, position);
        });
        // @ts-ignore
        room.state.players.onRemove((player, sessionId) => {
          this.onRemove(player, sessionId);
        });
      })
      .catch(error => {
        console.log("Couldn't connect.");
        this.sceneRoom = null;
      });
  }

  private onAdd(player: ServerPlayer, sessionId: string, position: Vector3) {
    console.log(player, sessionId, this.sceneRoom.sessionId);

    const isCurrentPlayer = sessionId === this.sceneRoom.sessionId;

    if (!isCurrentPlayer) {
      const sphere = MeshBuilder.CreateSphere(`player-${sessionId}`, {
        segments: 8,
        diameter: 1
      });

      // set player spawning position
      sphere.position.set(player.x, player.y, player.z);

      this.playerEntities[sessionId] = sphere;

      player.onChange(() => {
        this.playerEntities[sessionId].position.set(player.x, player.y, player.z);
      });
    } {
      this.onUpdate(position);

      this.level.scene.onKeyboardObservable.add((kbInfo: KeyboardInfo) => {
        if (this.mainPalyer) {
          const keys = [
            87, // W
            65, // A
            83, // S
            68, // D
            38, // ArrowUp
            37, // ArrowLeft
            40, // ArrowDown
            39, // ArrowUp
            81, // Q
            69, // E
            16, // ShiftLeft
          ];

          if (keys.includes(kbInfo.event.inputIndex)) {
            this.onUpdate(this.mainPalyer.camera.position);
          }
        }
      });

      // TODO: нужно прогнозирование и хорошая интерполяция
      // https://doc.babylonjs.com/guidedLearning/networking/Colyseus
      // player.onChange(() => {
      //   this.mainPalyer?.camera.position.set(player.x, player.y, player.z);
      //   console.log('main:', player.x, player.y, player.z);
      // });
    }
  }

  private onRemove(player: ServerPlayer, sessionId: string) {
    const isCurrentPlayer = sessionId === this.sceneRoom.sessionId;

    if (!isCurrentPlayer) {
      this.playerEntities[sessionId].dispose();
      delete this.playerEntities[sessionId];
    }
  }

  private onUpdate(position: Vector3) {
    this.sceneRoom.send('updatePosition', {
      x: position.x,
      y: position.y,
      z: position.z,
    })
  }
}