import { AbstractMesh, Ray, Scene, Vector3 } from "@babylonjs/core";
import Character from "./TestCharacter";
import { InputMode, Params } from "./interfaces";
import PlayerContorller from "client/scripts/TestPlayerController";

export default class Player extends Character {
    movementMode: InputMode = InputMode.WALK
    private ray: Ray
    playerController: PlayerContorller;
    constructor(scene: Scene, position?: Vector3, optionalParams?: Params) {
        super(scene, position, optionalParams)
        this.ray = new Ray(new Vector3(this.characterBase.position._x, this.characterBase.position._y - 0.1, this.characterBase.position._z), new Vector3(0, -1, 0), 0.2);
        this.playerController = new PlayerContorller(this.scene)
        this.applyPlayerJumping();
        this.applyPlayerMovement();
        this.scene.onBeforeRenderObservable.add(() => {
            this.isOnGround = this.checkGroundCollision();
		})
    }
    protected checkGroundCollision() {
        this.ray.origin = new Vector3(this.characterBase.position._x, this.characterBase.position._y - 0.1, this.characterBase.position._z)
        const hitInfo = this.scene.pickWithRay(this.ray, (mesh: AbstractMesh) => !(mesh == this.characterBase))
        return hitInfo.hit ? true : false
    }
    protected tumbler(lastCheck: boolean) {
        if (lastCheck == true && Character.preLastCollision == false) {
            return true
        } else {
            return false
        }
    }
    protected applyPlayerMovement() {
		// this.movementDirection = this.playerController.getMovementDirection(this.movementMode);
		// if (this.movementDirection != null) {
		// 	//Movement
		// 	this.movementX = this.movementDirection._x * this.characterSpeed;
		// 	this.movementZ = this.movementDirection._z * this.characterSpeed;

		// 	//Gravity
		// 	if (!this.isOnGround) {
		// 		this.movementY -= this.gravity * this.scene.deltaTime / 10000
		// 		Character.preLastCollision = false;
		// 	} else {
		// 		this.tumbler(this.isOnGround) ? this.movementY = -0.1 : null
		// 		Character.preLastCollision = true
		// 	}
		// 	const movement = new Vector3(this.movementX, this.movementY, this.movementZ);
		// 	this.characterBase.moveWithCollisions(movement);
		// }
	}
    
	private applyPlayerJumping() {
		// if (this.playerController.checkjumpInput() && this.isOnGround) {
		// 	this.movementY = this.jumpPower;
		// }
	}

	positionChange(vector: Vector3) {
		this.position = vector;
	}
}