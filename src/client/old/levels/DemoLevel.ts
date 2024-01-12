// @ts-nocheck
import { AbstractMesh, ShadowsOptimization, TextureOptimization, HardwareScalingOptimization, SceneOptimizerOptions, SceneOptimizer, Color3, ScenePerformancePriority, ShadowGenerator, DirectionalLight, CubeTexture, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Texture, TransformNode, Vector3, Mesh, IPointerEvent, PickingInfo, PointerEventTypes } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import { LevelController } from "client/old/controllers/LevelController";
import { PlayerController } from "client/old/controllers/PlayerController";
import { GameEngine } from "client/old/GameEngine";
import { HeadlessEngine } from "client/old/HeadlessEngine";
import { Player } from "client/old/entities/Player";


export class Level {
  private gameEngine: GameEngine | HeadlessEngine;

  public scene: Scene;
  public playerController: PlayerController;
  public levelController: LevelController;
  public shadowGenerator: ShadowGenerator | null = null;

  public onPointerDown: (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => void;

  constructor(gameEngine: GameEngine | HeadlessEngine) {
    this.gameEngine = gameEngine;

    this.scene = new Scene(this.gameEngine.renderEngine);
    this.createScene();
    this.loadAssets();

    this.levelController = new LevelController(this);

    this.playerController = new PlayerController(this, gameEngine.client);

    // TODO: Player Spawner
    const player = new Player(this.playerController);

    this.optimise();
  }

  public createScene() {
    if (__IS_DEV__) {
      Inspector.Show(this.scene, {});
    }

    const framesPerSecond = 60;
    const gravity = -9.81;
    this.scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);
    this.scene.collisionsEnabled = true;
    this.scene.onPointerDown = (evt: IPointerEvent, pickInfo: PickingInfo, type: PointerEventTypes) => {
      if (this.onPointerDown) {
        this.onPointerDown(evt, pickInfo, type);
      }
    }

    // оптимизация, если вы всегда находитесь внутри скайбокса
    this.scene.autoClear = false; // Color buffer
    // в webgpu autoClearDepthAndStencil дает белую картинку рендера
    // this.scene.autoClearDepthAndStencil = false; // Depth and stencil

    // Blocking the dirty mechanism
    // https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene#blocking-the-dirty-mechanism
    this.scene.blockMaterialDirtyMechanism = true;

    this.scene.performancePriority = ScenePerformancePriority.Intermediate;

    // ambient background light
    const light = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), this.scene);
    light.intensity = 0.7;

    const dirlight = new DirectionalLight("dirlight", new Vector3(-1, -2, -1), this.scene);
    dirlight.position = new Vector3(20, 40, 20);

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 1000, height: 1000 },
      this.scene
    );
    ground.checkCollisions = true;
    ground.position = new Vector3(0, -1, 0);
    ground.receiveShadows = true;
    this.toStaticMesh(ground);
    const groundMaterial = new StandardMaterial("ground", this.scene);
    groundMaterial.diffuseTexture = new Texture("textures/env/grass.jpg", this.scene);
    ground.material = groundMaterial;
    // groundMaterial.diffuseTexture.scale(1);
    // @ts-ignore
    groundMaterial.diffuseTexture.uScale = 1000;
    // @ts-ignore
    groundMaterial.diffuseTexture.vScale = 1000;

    const ball = MeshBuilder.CreateSphere('sphere', { diameter: 1 }, this.scene);
    ball.receiveShadows = true;
    ball.position.z = -32;

    // shadow
    const shadowGenerator = new ShadowGenerator(2048, dirlight);
    // shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 1;
    shadowGenerator.filter = 6; // PCF
    this.shadowGenerator = shadowGenerator;
    shadowGenerator?.getShadowMap()?.renderList?.push(ball);

    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
    this.toStaticMesh(skybox);
    var skyboxMaterial = new StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox/TropicalSunnyDay", this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularPower = 128;
    skyboxMaterial.indexOfRefraction = 0.98;
    skyboxMaterial.invertRefractionY = false;
    // skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    skyboxMaterial.disableLighting = true; // remove all light reflections on our box
    skybox.infiniteDistance = true; // follow our camera's position
  }

  private toStaticMesh(mesh: Mesh): void {
    // пропускается трансформация
    mesh.freezeWorldMatrix();
    // пропускается материал
    mesh.material?.freeze();
  }

  private load(sceneFilename: string, rootName: string, parent: TransformNode,
    rootCb: (mesh: AbstractMesh) => void | undefined, addPath?: string) {

    const rootUrl = addPath ? "./models/" + addPath : "./models/";

    SceneLoader.ImportMesh(
      "",
      rootUrl,
      sceneFilename,
      this.scene,
      (meshes, particleSystems, skeletons, animationGroups, transformNodes) => {
        this.scene.blockfreeActiveMeshesAndRenderingGroups = true;

        meshes.forEach((mesh) => {
          mesh.checkCollisions = true;
          mesh.receiveShadows = true;

          if (mesh.name === '__root__') {
            mesh.name = rootName;
            mesh.parent = parent;

            if (rootCb!!) {
              rootCb(mesh);
            }
          }

          // пропускается обновление бокса для коллизии
          mesh.doNotSyncBoundingInfo = true;

          if (!__IS_DEV__) {
            // пропускается трансформация
            mesh.freezeWorldMatrix();
          }

          // ScenePerformancePriority.Intermediate включает следующее по умолчанию
          mesh.alwaysSelectAsActiveMesh = false;
        });

        this.scene.blockfreeActiveMeshesAndRenderingGroups = false;

        this.shadowGenerator?.getShadowMap()?.renderList?.push(...meshes);
      },
    );
  }

  public async loadAssets() {
    const transformNode = new TransformNode("RosAtom");

    this.load("RosAtom_Full.glb", 'RosAtom_Full_root', transformNode,
      mesh => { mesh.position.set(0, 10.6, 0) },
    );

    // this.load("ядерка.glb", 'ядерка_root', transformNode,
    //   mesh => {
    //     mesh.position.set(-47.5, -0.5, 4.91);
    //     mesh.rotate(Vector3.Up(), Math.PI / 2);
    //   }
    // );

    // this.load("эко.glb", 'эко_root', transformNode,
    //   mesh => {
    //     mesh.position.set(-63.39, -0.47, -2.73);
    //   }
    // );

    // this.load("ветряк.glb", 'ветряк_root', transformNode,
    //   mesh => { mesh.position.set(-65.61, -0.43, 12.62) },
    // );

    // this.load("водород.glb", 'водород_root', transformNode,
    //   mesh => { mesh.position.set(-84.962, -0.72, 13.041) },
    // );

    // this.load("морской.glb", 'морской_root', transformNode,
    //   mesh => { mesh.position.set(-101.69, -0.20, 13.04) },
    // );

    const transformTree = new TransformNode("transformTree", this.scene);

    this.load("Trees_Test.glb", 'tree_root', transformTree,
      mesh => {
        mesh.position.set(36, -1, -36);
      },
      'tree/'
    );
  }

  private optimise() {
    const options = new SceneOptimizerOptions(60);
    options.addOptimization(new HardwareScalingOptimization(0, 1));
    // options.addOptimization(new TextureOptimization(1, 256)); // белый экран
    // options.addOptimization(new ShadowsOptimization(0)); // белый экран

    // const options = SceneOptimizerOptions.HighDegradationAllowed(60);

    // SceneOptimizer.OptimizeAsync(this.scene);
    const optimizer = new SceneOptimizer(this.scene, options);
    // optimizer.start();

    setTimeout(() => {
      console.log('SceneOptimizer');
      optimizer.start();
    }, 7000);
  }
}