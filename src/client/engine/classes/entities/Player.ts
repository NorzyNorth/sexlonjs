import { AbstractMesh, Color3, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeCapsule, PhysicsShapeCylinder, PhysicsShapeType, PickingInfo, Ray, RayHelper, Scene, Vector3 } from "@babylonjs/core";
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
	private movementSpeed: number = 8;
	private gravity: number = 9.8;
	private jumpPower: number = 4;
	private gameInput: GameInput;
	private ray: Ray;
	private rayHelper: RayHelper;
	private isOnGround: boolean = false;
	private preOnGroud: boolean = true;
	private collider: PhysicsBody;
	constructor(name: string, scene: Scene) {
		super(name, scene)
		this.name = name;
		this.scene = scene;
		this.gameInput = new GameInput(scene);
		this.ray = new Ray(new Vector3(this.root.position._x, this.root.position._y + 0.005, this.root.position._z), new Vector3(0, -1, 0), 0.1);
		this.rayHelper = new RayHelper(this.ray);
		this.rayHelper.show(this.scene, new Color3(255, 0, 0));

		this.addMeshAssetTask(this.name, "models/", "Duck.glb");
	}


	onTick = (deltaTime: number) => {
		if (deltaTime) {
			this.updatePosition();
			// this.centerView();
			this.isOnGround = this.checkGroundCollision();
			this.move(deltaTime);
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
		this.ray.origin = new Vector3(this.root.position._x, this.root.position._y + 0.005, this.root.position._z)
		const hitInfo: PickingInfo = this.scene.pickWithRay(this.ray, (mesh: AbstractMesh) => !(mesh == this.root))
		return hitInfo.hit ? true : false
	}

	private tumbler = () => {
		if (this.isOnGround && !this.preOnGroud) {
			this.preOnGroud = true
			this.movementY = 0
		}
		if (!this.isOnGround && this.preOnGroud) {
			this.preOnGroud = false
		}
	}

	private centerView = () => {
		this.root.rotation._x = 0;
		this.root.rotation._z = 0;
	}

	private move = (deltaTime: number) => {
		console.log(this.isOnGround)
		this.movementDirection = this.gameInput.getInputDirection();

		//Movement
		this.tumbler()
		this.movementX = this.movementDirection._x * this.movementSpeed;
		this.movementZ = this.movementDirection._z * this.movementSpeed;


		//Gravity
		// if (!this.isOnGround) {
		// 	this.movementY -= this.gravity * this.scene.deltaTime / 10000;
		// }
		if (!this.isOnGround) {
			this.movementY += this.scene.gravity.y * this.scene.deltaTime / 1000;
		}
		console.log(this.movementY);
		console.log(this.scene.deltaTime)
		const movement = new Vector3(this.movementX, this.movementY, this.movementZ);
		// this.root.moveWithCollisions(movement);
		this.collider.setLinearVelocity(movement);
	};

	private jump = () => {
		if (this.gameInput.checkjumpInput() && this.isOnGround) {
			this.collider.setLinearVelocity(new Vector3(0, this.jumpPower, 0));
		}
	}

	private createCollider = () => {
		this.collider = new PhysicsBody(this.root, PhysicsMotionType.ANIMATED, false, this.scene);
		this.collider.shape = new PhysicsShapeCapsule(new Vector3(0, 0.7, 0), new Vector3(0, 1.4, 0), 0.7, this.scene);
		this.collider.shape.material = { restitution: 0 }
		// this.collider.disablePreStep = true;
	}
};