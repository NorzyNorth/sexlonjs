import {
  AbstractMesh,
  Color3,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeCapsule,
  PhysicsShapeCylinder,
  PhysicsShapeType,
  PickingInfo,
  Ray,
  RayHelper,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { Actor } from "../GameFramework";
import GameInput from "client/scripts/GameInput";
import * as BABYLON from "@babylonjs/core";
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
  private movementSpeed: number = 0.1;
  private gravity: number = 9.8;
  private jumpPower: number = 4;
  private gameInput: GameInput;
  private ray: Ray;
  private rayHelper: RayHelper;
  private isOnGround: boolean = false;
  private preOnGroud: boolean = true;
  private collider: PhysicsBody;
  private colliderParams = {
    pointB: new Vector3(0, 0.5, 0),
    pointA: new Vector3(0, 1.4, 0),
    radius: 0.7,
  };
  private rayCastParams = {
    from: new Vector3(),
    to: new Vector3(),
  };
  private raycastResult: BABYLON.PhysicsRaycastResult;
  private physicsViewer: BABYLON.PhysicsViewer;
  constructor(name: string, scene: Scene) {
    super(name, scene);
    this.name = name;
    this.scene = scene;
    this.gameInput = new GameInput(scene);
    this.rayCastParams.from = new Vector3(
      this.root.position._x,
      this.root.position._y,
      this.root.position._z
    );
    this.rayCastParams.to = new Vector3(
      this.root.position._x,
      this.root.position._y - 1,
      this.root.position._z
    );
    this.raycastResult = this.scene._physicsEngine.raycast(
      this.rayCastParams.from,
      this.rayCastParams.to
    );
    this.physicsViewer = new BABYLON.PhysicsViewer();
    this.addMeshAssetTask(this.name, "models/", "Duck.glb");
  }

  // moveRayCast = () => {
  //   this.raycastResult.body.transformNode = this.collider.transformNode
  // }
  onTick = (deltaTime: number) => {
    if (deltaTime) {
      // this.isOnGround = this.checkGroundCollision();
      this.updatePosition();
      // this.centerView();
      this.move(deltaTime);
      this.jump();
      console.log(this.isOnGround);
      //   this.physicsViewer.showBody(this.collider)
      //   console.log(this.collider._pluginData);
      //   console.log(this.collider.getCollisionObservable())
      // this.moveRayCast()
      // console.log(`Transform node ${this.raycastResult.body.transformNode}`)
      this.raycastResult.reset(
        new Vector3(
          this.root.position._x,
          this.root.position._y + 1,
          this.root.position._z
        ),
        (this.rayCastParams.to = new Vector3(
          this.root.position._x,
          this.root.position._y - 12,
          this.root.position._z
        ))
      );
      this.raycastResult = this.scene._physicsEngine.raycast(
        this.rayCastParams.from,
        this.rayCastParams.to
      );
      console.log(this.raycastResult);
    }
  };

  onBeginPlay = () => {
    console.log("DuckActor onBeginPlay");
    this.meshAssetsMap.get(this.name)?.loadedMeshes[0].position.set(0, 0, 0);
    this.createCollider();
    this.updatePosition();
  };

  private updatePosition = () => {
    this.position = this.root.position;
  };

  private checkGroundCollision = () => {
    // const hitInfo: PickingInfo[] = this.scene.multiPickWithRay(
    //   this.ray,
    //   (mesh: AbstractMesh) => !(mesh == this.root)
    // );
    // hitInfo.length > 0 ? console.log(hitInfo) : null;
    // return hitInfo.hit ? true : false
    // return hitInfo.length > 0 ? true : false;
  };

  private tumbler = () => {
    if (this.isOnGround && !this.preOnGroud) {
      this.preOnGroud = true;
      this.movementY = 0;
    }
    if (!this.isOnGround && this.preOnGroud) {
      this.preOnGroud = false;
    }
  };

  private centerView = () => {
    this.root.rotation._x = 0;
    this.root.rotation._z = 0;
  };

  private move = (deltaTime: number) => {
    // console.log(this.isOnGround);
    this.movementDirection = this.gameInput.getInputDirection();

    //Movement
    // this.tumbler();
    this.movementX = this.movementDirection._x * this.movementSpeed;
    this.movementZ = this.movementDirection._z * this.movementSpeed;

    console.log(this.movementY);
    const movement = new Vector3(
      this.movementX,
      this.movementY,
      this.movementZ
    );
    this.root.moveWithCollisions(movement);
    // console.log(this.collider.getCollisionObservable());
  };

  private jump = () => {
    if (this.gameInput.checkjumpInput() && this.isOnGround) {
      this.collider.setLinearVelocity(new Vector3(0, this.jumpPower, 0));
    }
  };

  private createCollider = () => {
    this.collider = new PhysicsBody(
      this.root,
      PhysicsMotionType.DYNAMIC,
      false,
      this.scene
    );
    this.collider.shape = new PhysicsShapeCapsule(
      this.colliderParams.pointA,
      this.colliderParams.pointB,
      this.colliderParams.radius,
      this.scene
    );
    this.collider.setMassProperties({ mass: 10 });
    this.collider.shape.material = { restitution: 0 };
    this.root.physicsBody = this.collider;

    var start = new BABYLON.Vector3(1, 20, 2);
    var end = new BABYLON.Vector3(1, -20, 2);
    var raycastResult = this.scene._physicsEngine.raycast(start, end);
    raycastResult;
    if (raycastResult.hasHit) {
      console.log("Collision at ", raycastResult.hitPointWorld);
    }
    // best 0
    // nobest 0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000001

    this.collider.disablePreStep = false;
  };
}
