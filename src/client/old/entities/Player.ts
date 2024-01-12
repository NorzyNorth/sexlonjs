import { MeshBuilder, ArcRotateCamera, Camera, FreeCamera, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import { CharacterController } from "client/old/controllers/CharacterController";
import { PlayerController } from "client/old/controllers/PlayerController";

export class Player {
  private playerController: PlayerController;
  private scene: Scene;
  public camera: Camera | null = null;

  constructor(playerController: PlayerController) {
    this.playerController = playerController;
    this.scene = this.playerController.level.scene;

    this.playerController.mainPalyer = this;

    const camera2 = this.freeCamera("free_camera");
    camera2.position.z = -36;
    this.camera = camera2;

    // this.loadAssets();
    this.simpleMesh();

    this.scene.activeCamera = camera2;

    this.playerController.joinTheRoom(this.camera.position);
  }

  public loadAssets() {
    // у Винсента больше анимаций чем у бота
    SceneLoader.ImportMesh(
      "",
      "./models/",
      "Vincent-frontFacing.babylon", //xbot.glb
      this.scene,
      (meshes, particleSystems, skeletons, animationGroups, transformNodes) => {
        // console.log(meshes, particleSystems, skeletons, animationGroups, transformNodes);
        // meshes.map((mesh) => {
        //   mesh.checkCollisions = true;
        // });
        const player = meshes[0];
        const skeleton = skeletons[0];

        skeleton.enableBlending(0.1);

        player.position = new Vector3(1, 2, 1);
        player.checkCollisions = true;
        player.ellipsoid = new Vector3(0.5, 1, 0.5);
        player.ellipsoidOffset = new Vector3(0, 1, 0);

        const alpha = 0;
        const beta = Math.PI / 2.5;
        const target = new Vector3(player.position.x, player.position.y + 1.5, player.position.z);

        const camera = new ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, this.scene);
        this.camera?.dispose();
        this.scene.activeCamera = camera;
        this.camera = camera;

        //standard camera setting
        camera.wheelPrecision = 15;
        camera.checkCollisions = true;
        //make sure the keyboard keys controlling camera are different from those controlling player
        //here we will not use any keyboard keys to control camera
        camera.keysLeft = [];
        camera.keysRight = [];
        camera.keysUp = [];
        camera.keysDown = [];
        //how close can the camera come to player
        camera.lowerRadiusLimit = 2;
        //how far can the camera go from the player
        camera.upperRadiusLimit = 200;
        camera.attachControl();

        // @ts-ignore
        const cc = new CharacterController(player, camera, this.scene);
        cc.setFaceForward(true);
        cc.setMode(0);
        cc.setTurnSpeed(45);
        //below makes the controller point the camera at the player head which is approx
        //1.5m above the player origin
        cc.setCameraTarget(new Vector3(0, 1.5, 0));

        //if the camera comes close to the player we want to enter first person mode.
        cc.setNoFirstPerson(false);
        //the height of steps which the player can climb
        cc.setStepOffset(0.4);
        //the minimum and maximum slope the player can go up
        //between the two the player will start sliding down if it stops
        cc.setSlopeLimit(30, 60);

        //tell controller
        // - which animation range should be used for which player animation
        // - rate at which to play that animation range
        // - wether the animation range should be looped
        //use this if name, rate or looping is different from default
        cc.setIdleAnim("idle", 1, true);
        cc.setTurnLeftAnim("turnLeft", 0.5, true);
        cc.setTurnRightAnim("turnRight", 0.5, true);
        cc.setWalkBackAnim("walkBack", 0.5, true);
        cc.setIdleJumpAnim("idleJump", 0.5, false);
        cc.setRunJumpAnim("runJump", 0.6, false);
        cc.setFallAnim("fall", 2, false);
        cc.setSlideBackAnim("slideBack", 1, false);

        cc.setCameraElasticity(true);
        cc.makeObstructionInvisible(true);
        cc.start();

        camera.checkCollisions = false;
      }
    );
    // xbot.meshes.map((mesh) => {
    //   mesh.checkCollisions = true;
    // });
  }

  private freeCamera(name = "camera"): Camera {
    // свободный полет
    const camera = new FreeCamera(name, new Vector3(108, 30, -35), this.scene);
    camera.setTarget(new Vector3(0, 0, 0));
    camera.attachControl();

    // camera.applyGravity = true;
    // camera.checkCollisions = true;

    camera.ellipsoid = new Vector3(1, 1, 1);

    // camera.minZ = 0.45;
    // camera.speed = 0.75;
    // camera.angularSensibility = 4000;

    camera.keysUp.push(87);
    camera.keysLeft.push(65);
    camera.keysDown.push(83);
    camera.keysRight.push(68);
    camera.keysUpward.push(81, 32); // q & space
    camera.keysDownward.push(16, 69); // e & shift

    return camera;
  }

  private async simpleMesh() {
    const player = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this.scene);
    player.parent = this.camera;
  }
}