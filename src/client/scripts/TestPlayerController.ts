import { ActionManager, ExecuteCodeAction, Scene, Vector3 } from "@babylonjs/core";
import TestCharacter from "client/entities/TestCharacter";
import { escape } from "querystring";
import { InputMode } from "client/entities/interfaces";
import GameInput from "./gameInput";
export default class PlayerContorller {
	movementDirection: Vector3;
	scene: Scene;
	player: TestCharacter
	constructor(scene: Scene) {
		this.scene = scene;
		this.scene.onBeforeRenderObservable.add(() => {
			this.isOnGround = this.checkGroundCollision();
			this.applyPlayerJumping();
			this.applyPlayerMovement();
		})
	}

}

