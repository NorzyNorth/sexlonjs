import { AbstractMesh, Color3, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeCapsule, PhysicsShapeCylinder, PhysicsShapeType, PickingInfo, Ray, RayHelper, Scene, Vector3 } from "@babylonjs/core";
import { Actor } from "../GameFramework";
import GameInput from "client/scripts/GameInput";

export default class Player extends Actor {
	name: string;
	scene: Scene;
	private position: Vector3 = Vector3.Zero();
	private movementDirection: Vector3 = Vector3.Zero();
	private movementX: number = 0;
	private movementY: number = 0;
	private movementZ: number = 0;
	private movementSpeed: number = 7;
	private jumpPower: number = 1;
	private gameInput: GameInput;
	private ray: Ray;
	private rayHelper: RayHelper;
	private isOnGround: boolean = false;
	// private capsuleAgregate: PhysicsAggregate
	private collider: PhysicsBody;
	constructor(name: string, scene: Scene) {
		super(name, scene)
		// this.capsuleAgregate = new PhysicsAggregate(this.root, PhysicsShapeType.CAPSULE, { mass: 10, restitution: 0.1, radius: 0.8, pointA: new Vector3(0, 1.25, 0), pointB: new Vector3(0, 0.7, 0) }, this.scene);
		// this.capsuleAgregate.body.setMassProperties({
		// 	inertia: new Vector3(0, 0, 0)
		// });
		// this.capsuleAgregate.body.disablePreStep = false
		this.name = name;
		this.scene = scene;
		this.gameInput = new GameInput(scene);
		this.ray = new Ray(new Vector3(this.root.position._x, this.root.position._y, this.root.position._z), new Vector3(0, -1, 0), 0.01);
		this.rayHelper = new RayHelper(this.ray);
		this.rayHelper.show(this.scene, new Color3(255, 0, 0));

		this.addMeshAssetTask(this.name, "models/", "Duck.glb");
	}

	onTick = (deltaTime: number) => {
		if (deltaTime) {
			this.updatePosition();
			this.isOnGround = this.checkGroundCollision();
			console.log(this.isOnGround)
			console.log(this.movementY)
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
		this.ray.origin = new Vector3(this.root.position._x, this.root.position._y, this.root.position._z)
		const hitInfo: PickingInfo = this.scene.pickWithRay(this.ray, (mesh: AbstractMesh) => !(mesh == this.root))
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
			console.log(this.collider.getGravityFactor());
			const movement = new Vector3(this.movementX, -9.8, this.movementZ);
			// this.root.moveWithCollisions(movement);
			this.collider.setLinearVelocity(movement);
		};
	};

	private jump = () => {
		if (this.gameInput.checkjumpInput() && this.isOnGround) {
			this.collider.applyImpulse(new Vector3(0, this.jumpPower, 0), this.root.position);
		}
	}

	private createCollider = () => {
		// const capsuleAgregate = new PhysicsAggregate(this.root, PhysicsShapeType.CAPSULE, { mass: 1, restitution: 0, radius: 0.7, pointA: new Vector3(0, 0.7, 0), pointB: new Vector3(0, 1.4, 0) }, this.scene);
		this.collider = new PhysicsBody(this.root, PhysicsMotionType.DYNAMIC, false, this.scene);
		this.collider.shape = new PhysicsShapeCylinder(new Vector3(0, 0, 0), new Vector3(0, 2, 0), 0.7, this.scene);
		this.collider.shape.material = {restitution: 0}
		// this.collider.disablePreStep = true;
	}
};