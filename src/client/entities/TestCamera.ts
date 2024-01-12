import { FreeCamera, ArcRotateCamera, Scene, UniversalCamera, Vector3, FollowCamera, Mesh, Viewport } from "@babylonjs/core";
import TestCharacter from "./TestCharacter";

export default class TestCamera {
	scene: Scene;
	player: TestCharacter;
	rotation: Vector3;

	constructor(scene: Scene, player: any) {
		this.scene = scene;
		this.player = player;

		const tpsCamera = new FreeCamera('TPSCamera', Vector3.Zero(), this.scene);
		const cameraRootNode = this.scene.getNodeByName('head');

		// tpsCamera.viewport = new Viewport(0, 0.7, 0.3, 2);
		tpsCamera.position = new Vector3(player.position.x, player.position.y + 2, player.position.z - 10)
		tpsCamera.parent = cameraRootNode;
		// tpsCamera.attachControl(true)

		this.scene.onBeforeCameraRenderObservable.add(() => {
			cameraRootNode.parent = player;
		})

		//FreeCamera
		// const camera = new FreeCamera('camera', new Vector3(player.characterBase.position._x - 5, player.characterBase.position._y + 2, player.characterBase.position._z), this.scene);
		// camera.rotation.set(player.characterBase.rotation._x + 0.26, player.characterBase.rotation._y + 1.57, player.characterBase.rotation._z);
		// this.scene.onBeforeRenderObservable.add(() => {
		// 	camera.position.set(player.characterBase.position._x - 5, player.characterBase.position._y + 3, player.characterBase.position._z - 0.7);
		// 	console.log(camera.rotation);
		// })

		// camera.attachControl(true);

		//FollowCamera
		// const camera = new FollowCamera('camera', Vector3.Zero(), this.scene);
		// camera.upperRadiusLimit = 150;
		// camera.lowerRadiusLimit = 10;
		// camera.lowerHeightOffsetLimit = 5;
		// camera.upperHeightOffsetLimit = 20;
		// camera.lockedTarget = player;
		// camera.attachControl(true);
		// this.scene.onBeforeRenderObservable.add(() => {
		// 	this.rotation = camera.rotation;
		// })

		//ArcRotateCamera
		// const camera = new ArcRotateCamera('camera', -Math.PI, Math.PI / 3.5, 25, new Vector3(player.characterBase.position._x, player.characterBase.position._y + 2, player.characterBase.position._z));
		// this.scene.onBeforeRenderObservable.add(() => {
		// 	camera.position = new Vector3(player.characterBase.position._x - 5, player.characterBase.position._y + 3, player.characterBase.position._z - 0.7);
		// 	console.log(camera.rotation);
		// })
		// camera.attachControl(true);

		//UniversalCamera
		// const camera = new UniversalCamera('camera', new Vector3(-30, 5, 0), this.scene)
		// camera.lockedTarget = player.characterBase;
		// camera.fov = 0.47350045992678597;
		// camera.attachControl(true);

		//MyCamra
	}
}