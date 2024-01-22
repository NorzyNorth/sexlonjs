import { AbstractMesh, Color3, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeCapsule, PhysicsShapeType, PickingInfo, Ray, RayHelper, Scene, Vector3 } from "@babylonjs/core";
import { Actor } from "../GameFramework";
import GameInput from "client/scripts/GameInput";
import * as BABYLON from "@babylonjs/core"
import { PhysicsEngine } from "@babylonjs/core/Physics/v2/physicsEngine";
import { HavokPlugin } from "@babylonjs/core";
export default class Player extends Actor {
	name: string;
	scene: Scene;
	private position: Vector3 = Vector3.Zero();
	private movementDirection: Vector3 = Vector3.Zero();
	private movementX: number = 0;
	private movementY: number = 0;
	private movementZ: number = 0;
	private movementSpeed: number = 0.2;
	private gravity: number = 9.8;
	private jumpPower: number = 0.1;
	private gameInput: GameInput;
	private ray: Ray;
	private isOnGround: boolean = false;
	private collider: PhysicsBody
	private rayHelper: RayHelper
	constructor(name: string, scene: Scene) {
		super(name, scene)
		this.name = name;
		this.scene = scene;
		this.gameInput = new GameInput(scene);
		this.ray = new Ray(new Vector3(this.root.position._x, this.root.position._y, this.root.position._z), new Vector3(0, -1, 0), 0.05);
		this.rayHelper = new RayHelper(this.ray)
		this.rayHelper.show(this.scene, new Color3(255, 0, 0))
		this.addMeshAssetTask(this.name, "models/", "Duck.glb");
	}

	
	onTick = (deltaTime: number) => {
		// console.log()
		if (deltaTime) {
			this.updatePosition();
			this.isOnGround = this.checkGroundCollision();
			this.move(deltaTime);
			console.log(this.isOnGround)
			// console.log(this.movementY)
			this.jump();
		}
	};

	onBeginPlay = () => {
		console.log('DuckActor onBeginPlay');
		this.meshAssetsMap.get(this.name)?.loadedMeshes[0].position.set(0, 0, 0);
		this.createCollider();
		this.updatePosition();
	};

	private updatePosition = () => {
		this.position = this.root.position;
	}

	private checkGroundCollision = () => {
		this.ray.origin = new Vector3(this.root.position._x, this.root.position._y, this.root.position._z)
		const hitInfo: PickingInfo = this.scene.pickWithRay(this.ray, (mesh: AbstractMesh) => !(mesh == this.root))
		// console.log(`${this.ray.origin._x} , ${this.rayHelper.ray.origin._x}, ${this.root.position._x}, ${this.position._x}, ${this.meshAssetsMap.get(this.name)?.loadedMeshes[0].position}`)
		// console.log(this.scene.getNodeById('Pivot'))
		return hitInfo.hit ? true : false
	}

	private move = (deltaTime: number) => {
		this.movementDirection = this.gameInput.getInputDirection();

		if (this.movementDirection != null) {
			//Movement
			this.movementX = this.movementDirection._x * this.movementSpeed;
			this.movementZ = this.movementDirection._z * this.movementSpeed;


			//Gravity
			// if (!this.isOnGround) {
			// 	this.movementY -= this.gravity * this.scene.deltaTime / 10000;
			// }
			const movement = new Vector3(this.movementX, this.movementY, this.movementZ);
			this.root.moveWithCollisions(movement).position
			// console.log(this.root.moveWithCollisions(movement).position);
			// console.log(movement)
			// console.log(this.movementDirection)
		};
	};

	private jump = () => {
		if (this.gameInput.checkjumpInput() && this.isOnGround) {
			this.movementY = this.jumpPower;
		}
	}

	private createCollider = () => {
		// const capsuleAgregate = new PhysicsAggregate(this.root, PhysicsShapeType.CAPSULE, { mass: 1, restitution: 0, radius: 0.7, pointA: new Vector3(0, 0.7, 0), pointB: new Vector3(0, 1.4, 0) }, this.scene);
		const collider = new PhysicsBody(this.root, PhysicsMotionType.DYNAMIC, false, this.scene);
		collider.shape = new PhysicsShapeCapsule(new Vector3(0, 0.7, 0), new Vector3(0, 1.4, 0), 0.7, this.scene);
		// collider.shape = new PhysicsShapeCapsule(new Vector3(0, 0.3, 0), new Vector3(0, 1.4, 0), 1.7, this.scene);

		collider.setMassProperties({
			inertia: new Vector3(1, 1, 1),

		})
		collider.shape.material = { restitution: 0 }
		collider.disablePreStep = false;
	}
};