import { ArcRotateCamera, FreeCamera, SceneLoader, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";
import { PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core/Physics/v2'
import { World } from "client/engine/classes/engine/World";
import { Level } from "client/engine/classes/engine/Level";
import TestCharacter from "client/entities/TestCharacter";
import TestCamera from "client/entities/TestCamera";
import { Inspector } from "@babylonjs/inspector";

export const initLevel = (world: World) => {
	const level = world.createLevel();

	addEntities(level);

	return level;
}

const addEntities = (level: Level) => {
	// Inspector.Show(level.scene, {});

	level.scene.collisionsEnabled = true
	const ground = MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, level.scene);
	ground.checkCollisions = true;

	// const player = SceneLoader.ImportMeshAsync('', 'C:\\Users\\User\\Documents\\GitLab\\babylonjs-metaverse\\public\\models\\', 'xbot.glb', level.scene);

	const dirLight = new HemisphericLight('direction light', new Vector3(0, 10, 0), level.scene);
	dirLight.intensity = 0.8

	const player = new TestCharacter(level.scene);
	player.characterBase.position = new Vector3(0, 0, 0);

	const box = MeshBuilder.CreateBox('box', { size: 10 }, level.scene);
	box.checkCollisions = true;
	box.position = new Vector3(0, 100, 0);
	const boxMaterial = new StandardMaterial('box', level.scene);
	boxMaterial.diffuseColor = new Color3(0.5, 0.1, 0.4)
	box.material = boxMaterial;

	const box1 = MeshBuilder.CreateBox('box', { size: 10 }, level.scene);
	box1.checkCollisions = true;
	box1.position = new Vector3(0, 150, 0);
	const boxMaterial1 = new StandardMaterial('box1', level.scene);
	boxMaterial1.diffuseColor = new Color3(0.1, 0.3, 0.9)
	box1.material = boxMaterial1;

	level.scene.onBeforeRenderObservable.add(() => {
		box.moveWithCollisions(new Vector3(0, -0.1, 0));
		box1.moveWithCollisions(new Vector3(0, -0.1, 0));
	})

	const camera = new TestCamera(level.scene, player);
}