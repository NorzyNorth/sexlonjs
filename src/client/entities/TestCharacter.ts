import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, Ray, AbstractMesh } from "@babylonjs/core";
import PlayerContorller from "client/scripts/TestPlayerController";
import { number } from "@colyseus/schema/lib/encoding/decode";
import { Params } from "../entities/interfaces";


export default class Character {
	scene: Scene;

	protected characterSpeed: number = 0.1;
	protected jumpPower: number = 0.3;
	characterBase: Mesh = new Mesh('pivot');;
	protected position: Vector3 = new Vector3(0, 0, 0);
	protected movementDirection: Vector3 = Vector3.Zero();
	protected movementX: number = 0;
	protected movementY: number = 0;
	protected movementZ: number = 0;
	gravity: number = 9.8;
	// headPositionY: number
	isOnGround: boolean = false;
	static preLastCollision: boolean = false;

	/**
	 * Creating a game character
	 * @param {Scene} scene - Scheme required
	 * @param {Vector3} position - Spawn position (optional)
	 * @param {number=} optionalParams.characterSpeed - Character Speed (optional) (default 0.1)
	 * @param {number} optionalParams.jumpPower - The power of the jump (optional) (default 0.3)
	 * @param {number} optionalParams.gravity - Gravity (optional) (default 9.8)
	 */
	constructor(scene: Scene, position?: Vector3, optionalParams?: Params) {
		// Init character
		this.createVisual(this.characterBase);
		this.scene = scene;
		// optional params
		position ? this.characterBase.position = position : null
		optionalParams?.characterSpeed ? this.characterSpeed = optionalParams.characterSpeed : null
		optionalParams?.jumpPower ? this.jumpPower = optionalParams.jumpPower : null
		optionalParams?.gravity ? this.gravity = optionalParams.gravity : null
		this.scene.onBeforeRenderObservable.add(() => {
			this.position = this.characterBase.position;
		})
	}

	protected createVisual(characterBase: Mesh) {
		const headDiam = 1.5;
		const bodyDiam = 2;
		const head = MeshBuilder.CreateSphere("head", { diameter: headDiam });
		head.parent = characterBase;
		const body = MeshBuilder.CreateSphere("body", { diameter: bodyDiam });
		body.parent = characterBase;
		head.position.y = 0.5 * headDiam + 0.85 * bodyDiam;
		// this.headPositionY = head.position.y
		body.position.y = 0.5 * (bodyDiam);

		const duckMaterial = new StandardMaterial('duckMaterial', this.scene);
		duckMaterial.diffuseColor = new Color3(1, 0.68, 0);
		head.material = duckMaterial;
		body.material = duckMaterial;

		const eyeLeft = MeshBuilder.CreateSphere("eyeLeft", { diameterX: 0.2, diameterY: 0.4, diameterZ: 0.2 }, this.scene);
		const eyeRight = MeshBuilder.CreateSphere("eyeLeft", { diameterX: 0.2, diameterY: 0.4, diameterZ: 0.2 }, this.scene);
		eyeLeft.parent = head;
		eyeLeft.position = new Vector3(0.15 * headDiam, 0.15 * headDiam, 0.4 * headDiam)
		eyeRight.parent = head;
		eyeRight.position = new Vector3(-0.15 * headDiam, 0.15 * headDiam, 0.4 * headDiam)

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
}

	
	

