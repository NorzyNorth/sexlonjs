import { FreeCamera, ArcRotateCamera, Scene, UniversalCamera, Vector3, FollowCamera } from "@babylonjs/core";
import TestCharacter from "./TestCharacter";

export default class TestCamera {
	scene: Scene;
	player: TestCharacter;

	constructor(scene: Scene, player: TestCharacter) {
		this.scene = scene;
		// this.player = player;

		//FreeCamera
		// const camera = new FreeCamera('camera', new Vector3(0, 5, -20), this.scene);
		// camera.attachControl(true);

		//FollowCamera
		const camera = new FollowCamera('camera', new Vector3(0, 100, 0), this.scene);
		camera.upperRadiusLimit = 10;
		camera.lowerRadiusLimit = 5;
		camera.lowerHeightOffsetLimit = 5;
		camera.upperHeightOffsetLimit = 20;
		camera.lockedTarget = player.characterBase;
		camera.attachControl(true);

		//ArcRotateCamera
		// const camera = new ArcRotateCamera('camera', -Math.PI, Math.PI / 3.5, 25, new Vector3(0, 0, 0));
		// camera.attachControl(true);

		//UniversalCamera
		// const camera = new UniversalCamera('camera', new Vector3(-30, 5, 0), this.scene)
		// camera.lockedTarget = player.characterBase;
		// camera.fov = 0.47350045992678597;
		// camera.attachControl(true);

		//MyCamra
	}
}