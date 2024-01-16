import { ActionManager, ExecuteCodeAction, Scene, Vector3 } from "@babylonjs/core";

export default class GameInput {
	private inputMap: any = [];
	private axis = {
		x: 0,
		y: 0,
		z: 0
	};
	inputVector: Vector3 = Vector3.Zero();
	scene: Scene


	constructor(scene: Scene) {
		this.scene = scene;
		const inputMap: any[] = [];
		scene.actionManager = new ActionManager(scene);
		scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
				inputMap[evt.sourceEvent.inputIndex] = evt.sourceEvent.type == "keydown";
				console.log(evt.sourceEvent.inputIndex)
			}),
		);
		scene.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {
				inputMap[evt.sourceEvent.inputIndex] = evt.sourceEvent.type == "keydown";
			}),
		);
		this.inputMap = inputMap;
	}

	checkjumpInput() {
		if (this.inputMap['32']) {
			return true;
		}
	}

	getInputDirection() {
		let inputVector: Vector3 = Vector3.Zero()
		if (this.inputMap['87'] && !this.inputMap['83']) {
			this.axis.z = 1;
		} else if (this.inputMap['83'] && !this.inputMap['87']) {
			this.axis.z = -1;
		} else {
			this.axis.z = 0;
		}
		if (this.inputMap['65'] && !this.inputMap['68']) {
			this.axis.x = -1;
		} else if (this.inputMap['68'] && !this.inputMap['65']) {
			this.axis.x = 1;
		} else {
			this.axis.x = 0;
		}
		inputVector = new Vector3(this.axis.x, 0, this.axis.z);
		this.inputVector = inputVector.normalize();
		// console.log(`Input vector -> ${this.inputVector}`)
		return this.inputVector
	};
}