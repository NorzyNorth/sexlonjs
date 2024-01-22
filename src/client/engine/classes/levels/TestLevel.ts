import { ArcRotateCamera, FreeCamera, SceneLoader, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";
import { PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core/Physics/v2'
import { World } from "client/engine/classes/engine/World";
import { Level } from "client/engine/classes/engine/Level";
// import TestCharacter from "client/entities/TestCharacter";
// import TestCamera from "client/entities/TestCamera";
import { Inspector } from "@babylonjs/inspector";
import Player from "../entities/Player";
import TestCharacter from "../entities/TestCharacter";

export const initLevel = async (world: World) => {
	const level = await world.createLevel();

	return level;
}

export const addEntities = (level: Level, world: World) => {
	// Inspector.Show(level.scene, {});

	const camera = new FreeCamera('camera', new Vector3(0,2,-24), level.scene);
	camera.attachControl(true);

	level.scene.collisionsEnabled = true
	const ground = MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, level.scene);

	const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, level.scene);

	// const sphere = MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, level.scene);

	// sphere.position.y = 4;

	// const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1, radius: 1}, level.scene);

	// const player = SceneLoader.ImportMeshAsync('', 'C:\\Users\\User\\Documents\\GitLab\\babylonjs-metaverse\\public\\models\\', 'xbot.glb', level.scene);

	const dirLight = new HemisphericLight('direction light', new Vector3(0, 10, 0), level.scene);
	dirLight.intensity = 0.8

	// const player = new TestCharacter(level.scene);
	// player.characterBase.position = new Vector3(0, 0, 0);

	// const box = MeshBuilder.CreateBox('box', { size: 10 }, level.scene);
	// box.checkCollisions = true;
	// box.position = new Vector3(0, 5, -10);
	// const boxMaterial = new StandardMaterial('box', level.scene);
	// boxMaterial.diffuseColor = new Color3(0.5, 0.1, 0.4)
	// box.material = boxMaterial;

	// const box1 = MeshBuilder.CreateBox('box', { size: 10 }, level.scene);
	// box1.checkCollisions = true;
	// box1.position = new Vector3(0, 5, 10);
	// const boxMaterial1 = new StandardMaterial('box1', level.scene);
	// boxMaterial1.diffuseColor = new Color3(0.1, 0.3, 0.9)
	// box1.material = boxMaterial1;

	// // const sphere1 = MeshBuilder.CreateSphere('sphere1', {diameter: 10}, level.scene);
	// // sphere1.checkCollisions = true;
	// // sphere1.position = new Vector3(0, 100, 0);
	// // const sphereMaterial1 = new StandardMaterial('sphere1', level.scene);
	// // sphereMaterial1.diffuseColor = new Color3(0.5, 0.1, 0.4);
	// // sphere1.material = sphereMaterial1;

	// // const sphere2 = MeshBuilder.CreateSphere('sphere2', {diameter: 10}, level.scene);
	// // sphere2.checkCollisions = true;
	// // sphere2.position = new Vector3(0, 150, 0);
	// // const sphereMaterial2 = new StandardMaterial('sphere2', level.scene);
	// // sphereMaterial2.diffuseColor = new Color3(0.1, 0.3, 0.9);
	// // sphere2.material = sphereMaterial2;

	// level.scene.onBeforeRenderObservable.add(() => {
	// 	box.moveWithCollisions(new Vector3(0, 0, 0.1));
	// 	box1.moveWithCollisions(new Vector3(0, 0, 0));
	// 	// sphere1.moveWithCollisions(new Vector3(0, -0.1, 0));
	// 	// sphere2.moveWithCollisions(new Vector3(0, -0.1, 0));
	// })

	const player = new Player('Duck', level.scene);
	world.spawnActor(player, new Vector3(0, 1, 0));
	// const player = new TestCharacter(level.scene);

	// const camera = new TestCamera(level.scene, player);
}