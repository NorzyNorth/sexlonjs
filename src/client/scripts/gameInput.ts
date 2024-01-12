import { ActionManager, ExecuteCodeAction, Scene, Vector3 } from "@babylonjs/core";
import { InputMode } from "client/entities/TestCharacter";

export default class GameInput {
    private inputMap: any[]
    private scene: Scene
    inputVector: Vector3;
    private axis = {
        x: 0,
        y: 0,
        z: 0,
    }
    constructor(scene: Scene) {
        this.scene = scene
        const inputMap: any[] = []
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

    private switchFly(inputMode : InputMode) {
		inputMode == 'walk' ? inputMode = InputMode.FLY : inputMode = InputMode.WALK
        return inputMode
	}
    
    getInputDirection(inputMode: InputMode) {
        this.inputMap['72'] ? inputMode = this.switchFly(inputMode) : null // Fly switcher
        let inputVector: Vector3 = Vector3.Zero()
        switch (inputMode) {
            case 'walk':
                if (this.inputMap['87'] && !this.inputMap['83']) {
                    this.axis.x = 1;
                } else if (this.inputMap['83'] && !this.inputMap['87']) {
                    this.axis.x = -1;
                } else {
                    this.axis.x = 0;
                }
                if (this.inputMap['65'] && !this.inputMap['68']) {
                    this.axis.z = 1;
                } else if (this.inputMap['68'] && !this.inputMap['65']) {
                    this.axis.z = -1;
                } else {
                    this.axis.z = 0;
                }
                inputVector = new Vector3(this.axis.x, 0, this.axis.z);
                this.inputVector = inputVector.normalize();
                break;
            case 'fly':
                if (this.inputMap['87'] && !this.inputMap['83']) {
                    this.axis.x = 1;
                } else if (this.inputMap['83'] && !this.inputMap['87']) {
                    this.axis.x = -1;
                } else {
                    this.axis.x = 0;
                }
                if (this.inputMap['65'] && !this.inputMap['68']) {
                    this.axis.z = 1;
                } else if (this.inputMap['68'] && !this.inputMap['65']) {
                    this.axis.z = -1;
                } else {
                    this.axis.z = 0;
                }
                if (this.inputMap['32'] && !this.inputMap['17']) {
                    this.axis.y = 1;
                } else if (this.inputMap['17'] && !this.inputMap['32']) {
                    this.axis.y = -1;
                } else {
                    this.axis.y = 0;
                }
                inputVector = new Vector3(this.axis.x, this.axis.y, this.axis.z);
                this.inputVector = inputVector.normalize();
                break;

        }
        console.log(`Input vector -> ${this.inputVector}`)
        return {
            inputVector: this.inputVector,
            inputMode: inputMode,
        };
        
    };
}