import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { A, D, DIRECTIONS, S, W } from "./utils";

export class CharacterControls {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map(); // Walk, Run, Idle
  orbitControl: OrbitControls;
  camera: THREE.Camera;

  // state
  toggleRun: boolean = false;
  currentAction: string;
  toggleJump: boolean = false;
  toggleSit: boolean = false;
  togglePunch: boolean = false;

  // temporary data
  walkDirection = new THREE.Vector3();
  rotateAngle = new THREE.Vector3(0, 1, 0);
  rotateQuarternion: THREE.Quaternion = new THREE.Quaternion();
  cameraTarget = new THREE.Vector3();

  // constants
  fadeDuration: number = 0.2;
  runVelocity = 75;
  walkVelocity = 20;

  constructor(
    model: THREE.Group,
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string, THREE.AnimationAction>,
    orbitControl: OrbitControls,
    camera: THREE.Camera,
    currentAction: string
  ) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    this.animationsMap.forEach((value, key) => {
      if (key == currentAction) {
        value.play();
      }
    });
    this.orbitControl = orbitControl;
    this.camera = camera;
    this.updateCameraTarget(0, 0);
  }

  public switchRunToggle() {
    this.toggleRun = !this.toggleRun;
  }

  public switchJumpToggle() {
    this.toggleJump = !this.toggleJump;
  }

  public switchSitToggle() {
    this.toggleSit = !this.toggleSit;
  }

  public switchPunchToggle() {
    this.togglePunch = !this.togglePunch;
  }
  public getModel() {
    return this.model;
  }

  public update(delta: number, keysPressed: any, collide: any) {
    const directionPressed = DIRECTIONS.some((key) => keysPressed[key] == true);

    var play = "";
    if (directionPressed && this.toggleRun) {
      play = "Armature|ArmatureAction";
    } else if (directionPressed) {
      play = "Armature|ArmatureAction";
    }

    this.currentAction = play;

    this.mixer.update(delta);
    if (
      this.currentAction == "Armature|ArmatureAction" ||
      this.currentAction == "Armature|ArmatureAction"
    ) {
      // calculate towards camera direction

      var angleYCameraDirection = Math.atan2(
        -(this.camera.position.x - this.model.position.x),
        -(this.camera.position.z - this.model.position.z)
      );
      // diagonal movement angle offset
      var directionOffset = this.directionOffset(keysPressed);

      // rotate model
      this.rotateQuarternion.setFromAxisAngle(
        this.rotateAngle,
        angleYCameraDirection + directionOffset
      );
      this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);

      const direction = this.walkDirection.normalize().multiplyScalar(-1);
      const m = new THREE.Matrix4();
      m.lookAt(
        new THREE.Vector3(0, 0, 0),
        direction,
        new THREE.Vector3(0, 1, 0)
      );
      this.model.quaternion.setFromRotationMatrix(m);

      // calculate direction
      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.normalize();
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      // run/walk velocity
      const velocity =
        this.currentAction == "Armature|ArmatureAction"
          ? this.runVelocity
          : this.walkVelocity;

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      const moveY = this.walkDirection.y * velocity * delta;
      if (!collide) {
        this.model.position.x += moveX;
        this.model.position.z += moveZ;
        this.model.position.y += moveY;
      } else {
        this.model.position.x -= moveX;
        this.model.position.z -= moveZ;
        this.model.position.y -= moveY;
      }

      var minY = 80;
      var maxY = 365;
      var maxX = 1240 * 2;
      var maxZ = 1240 * 2;
      // console.log(this.model.position);
      if (this.model.position.y < 4) {
        this.model.position.y = 4;
      }
      if (this.model.position.x < -maxX) {
        this.model.position.x = -maxX;
      }
      if (this.model.position.x > maxX) {
        this.model.position.x = maxX;
      }
      if (this.model.position.y > maxY) {
        this.model.position.y = maxY;
      }
      if (this.model.position.z < -maxZ) {
        this.model.position.z = -maxZ;
      }
      if (this.model.position.z > maxZ) {
        this.model.position.z = maxZ;
      }

      this.updateCameraTarget(moveX, moveZ);
    }
  }

  private updateCameraTarget(moveX: number, moveZ: number) {
    // move camera
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;

    // update camera target
    this.cameraTarget.x = this.model.position.x;
    this.cameraTarget.y = this.model.position.y;
    this.cameraTarget.z = this.model.position.z;

    this.orbitControl.target = this.cameraTarget;
  }

  private directionOffset(keysPressed: any) {
    var directionOffset = 0; // w

    if (keysPressed[W]) {
      // directionOffset =
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4; // w+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4; // w+d
      }
    } else if (keysPressed[S]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
      } else {
        directionOffset = Math.PI; // s
      }
    } else if (keysPressed[A]) {
      directionOffset = Math.PI / 2; // a
    } else if (keysPressed[D]) {
      directionOffset = -Math.PI / 2; // d
    }

    return directionOffset;
  }
}
