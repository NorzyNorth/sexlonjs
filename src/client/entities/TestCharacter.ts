import { Color3, Mesh, MeshBuilder, PhysicsEngine, PhysicsRaycastResult, RayHelper, Scene, StandardMaterial, Vector3, Ray, AbstractMesh } from "@babylonjs/core";
import PlayerContorller from "client/scripts/TestPlayerController";
import cannon from "cannon";
import { number } from "@colyseus/schema/lib/encoding/decode";

window.CANNON = cannon;

interface params {
	characterSpeed?: number
	jumpPower?: number
	gravity?: number
}
export default class TestCharacter {
	scene: Scene;
	characterSpeed: number = 0.1;
	jumpPower: number = 0.3;
	characterBase: Mesh = new Mesh('pivot');;
	position: Vector3 = new Vector3(0, 0, 0);
	movementDirection: Vector3 = Vector3.Zero();
	movementX: number = 0;
	movementY: number = 0;
	movementZ: number = 0;
	gravity: number = 9.8;
	playerController: PlayerContorller;
	headPositionY: number
	private ray: Ray
	isOnGround: boolean = false;
	static physicsEngine: any = new PhysicsEngine(new Vector3(0, -1, 0));
	static preLastCollision: boolean = false;

	constructor(scene: Scene, position?: Vector3, optionalParams?: params) {
		// Init character
		this.createVisual(this.characterBase);
		this.scene = scene;
		this.ray = new Ray(new Vector3(this.characterBase.position._x, this.characterBase.position._y - 0.1, this.characterBase.position._z), new Vector3(0, -1, 0), 0.2);
		this.playerController = new PlayerContorller(this.scene)

		// optional params
		position ? this.characterBase.position = position : null
		optionalParams?.characterSpeed ? this.characterSpeed = optionalParams.characterSpeed : null
		optionalParams?.jumpPower ? this.jumpPower = optionalParams.jumpPower : null
		optionalParams?.gravity ? this.gravity = optionalParams.gravity : null

		this.scene.onBeforeRenderObservable.add(() => {
			this.position = this.characterBase.position;
			this.isOnGround = this.checkGroundCollision();
			this.applyCharacterJumping();
			this.applyCharacterMovement();
		})
	}

	private createVisual(characterBase: Mesh) {
		const headDiam = 1.5;
		const bodyDiam = 2;
		const head = MeshBuilder.CreateSphere("head", { diameter: headDiam });
		head.parent = characterBase;
		const body = MeshBuilder.CreateSphere("body", { diameter: bodyDiam });
		body.parent = characterBase;
		head.position.y = 0.5 * headDiam + 0.85 * bodyDiam;
		this.headPositionY = head.position.y
		body.position.y = 0.5 * (bodyDiam);

		const duckMaterial = new StandardMaterial('duckMaterial', this.scene);
		duckMaterial.diffuseColor = new Color3(1, 0.68, 0);
		head.material = duckMaterial;
		body.material = duckMaterial;

		const eyeLeft = MeshBuilder.CreateSphere("eyeLeft", { diameterX: 0.2, diameterY: 0.4, diameterZ: 0.2 }, this.scene);
		const eyeRight = MeshBuilder.CreateSphere("eyeLeft", { diameterX: 0.2, diameterY: 0.4, diameterZ: 0.2 }, this.scene);
		eyeLeft.parent = head;
		eyeLeft.position = new Vector3(0.4 * headDiam, 0.15 * headDiam, 0.15 * headDiam)
		eyeRight.parent = head;
		eyeRight.position = new Vector3(0.4 * headDiam, 0.15 * headDiam, -0.15 * headDiam)

		const eyesMaterial = new StandardMaterial('eyesMaterial', this.scene);
		eyesMaterial.diffuseColor = new Color3(0, 0, 0);
		eyeLeft.material = eyesMaterial;
		eyeRight.material = eyesMaterial;

		const extra = 0.25;
		characterBase.ellipsoid = new Vector3(0.5 * bodyDiam, 0.5 * (headDiam + bodyDiam), 0.5 * bodyDiam); //x and z must be same value
		characterBase.ellipsoid.addInPlace(new Vector3(extra, extra, extra));
		const offsetY = 0.5 * (headDiam + bodyDiam) - characterBase.position.y
		characterBase.ellipsoidOffset = new Vector3(0, offsetY, 0);
		//Create Visible Ellipsoid around camera
		// const a = characterBase.ellipsoid.x;
		// const b = characterBase.ellipsoid.y;
		// const points = [];
		// for (let theta = -Math.PI / 2; theta < Math.PI / 2; theta += Math.PI / 36) {
		//   points.push(new Vector3(0, b * Math.sin(theta) + offsetY, a * Math.cos(theta)));
		// }

		// const ellipse = [];
		// ellipse[0] = MeshBuilder.CreateLines("e", { points: points }, this.scene);
		// ellipse[0].color = Color3.Red();
		// ellipse[0].parent = characterBase;
		// const steps = 12;
		// const dTheta = 2 * Math.PI / steps;
		// for (let i = 1; i < steps; i++) {
		//   ellipse[i] = ellipse[0].clone("el" + i);
		//   ellipse[i].parent = characterBase;
		//   ellipse[i].rotation.y = i * dTheta;
		// }
	}

	log(mes: any) { console.log(mes) }

	private checkGroundCollision() {
		this.ray.origin = new Vector3(this.characterBase.position._x, this.characterBase.position._y - 0.1, this.characterBase.position._z)
		const hitInfo = this.scene.pickWithRay(this.ray, (mesh: AbstractMesh) => !(mesh == this.characterBase))
		return hitInfo.hit ? true : false
	}
	private tumbler(lastCheck: boolean) {
		if (lastCheck == true && TestCharacter.preLastCollision == false) {
			return true
		} else {
			return false
		}

	}
	private applyCharacterMovement() {
		this.movementDirection = this.playerController.getMovementDirection();
		if (this.movementDirection != null) {
			//Movement
			this.movementX = this.movementDirection._x * this.characterSpeed;
			this.movementZ = this.movementDirection._z * this.characterSpeed;

			//Gravity
			if (!this.isOnGround) {
				this.movementY -= this.gravity * this.scene.deltaTime / 10000
				TestCharacter.preLastCollision = false;
			} else {
				this.tumbler(this.isOnGround) ? this.movementY = -0.1 : null
				this.tumbler(this.isOnGround) ? console.log(`tryli`): console.log(`false`)
				TestCharacter.preLastCollision = true
			}
			console.log(this.movementY)

			const movement = new Vector3(this.movementX, this.movementY, this.movementZ);
			this.characterBase.moveWithCollisions(movement);
		}
	}

	private applyCharacterJumping() {
		if (this.playerController.checkjumpInput() && this.isOnGround) {
			this.movementY = this.jumpPower;
		}
	}
}