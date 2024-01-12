import { ActionManager, ExecuteCodeAction, Scene, Vector3 } from "@babylonjs/core";
import TestCharacter from "client/entities/TestCharacter";
import { escape } from "querystring";

export default class PlayerContorller {
	inputMap: any = [];
	xAxis: number;
	zAxis: number;
	movementDirection: Vector3;
	scene: Scene;

	constructor(scene: Scene) {
		this.scene = scene;
		const inputMap: any[] = []
		scene.actionManager = new ActionManager(scene);
		scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
				inputMap[evt.sourceEvent.inputIndex] = evt.sourceEvent.type == "keydown";
				console.log(evt.sourceEvent);
			}),
		);
		scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {
				inputMap[evt.sourceEvent.inputIndex] = evt.sourceEvent.type == "keydown";
			}),
		);
		this.inputMap = inputMap;

	};

	// getMovementDirection() {
	// 	if ((this.inputMap['w'] || this.inputMap['W']) && !(this.inputMap['s'] || this.inputMap['S'])) {
	// 		this.xAxis = this.speed;
	// 	} else if ((this.inputMap['s'] || this.inputMap['S']) && !(this.inputMap['w'] || this.inputMap['W'])) {
	// 		this.xAxis = -this.speed;
	// 	} else {
	// 		this.xAxis = 0;
	// 	}
	// 	if ((this.inputMap['a'] || this.inputMap['A']) && !(this.inputMap['d'] || this.inputMap['D'])) {
	// 		this.zAxis = this.speed;
	// 	} else if ((this.inputMap['d'] || this.inputMap['D']) && !(this.inputMap['a'] || this.inputMap['A'])) {
	// 		this.zAxis = -this.speed;
	// 	} else {
	// 		this.zAxis = 0;
	// 	}

	getMovementDirection() {
		if (this.inputMap['87'] && !this.inputMap['83']) {
			this.xAxis = 1;
		} else if (this.inputMap['83'] && !this.inputMap['87']) {
			this.xAxis = -1;
		} else {
			this.xAxis = 0;
		}
		if (this.inputMap['65'] && !this.inputMap['68']) {
			this.zAxis = 1;
		} else if (this.inputMap['68'] && !this.inputMap['65']) {
			this.zAxis = -1;
		} else {
			this.zAxis = 0;
		}

		const movementDirection = new Vector3(this.xAxis, 0, this.zAxis);
		this.movementDirection = movementDirection.normalize();
		return this.movementDirection;
	};


	checkjumpInput() {
		if (this.inputMap['32']) {
			return true;
		}
	}

	// getMouseInput() {
	// 	const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
	// 	canvas.addEventListener('click', () => {
	// 		canvas.requestPointerLock = canvas.requestPointerLock
	// 	})
	// }
}

