import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class animatedObject {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map();
  currentAction: string;
  walkDirection = new THREE.Vector3();
  runVelocity = 125;
  constructor(
    model: THREE.Group,
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string, THREE.AnimationAction>,
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
  }

  public update(delta: number) {
    this.mixer.update(delta);
    var maxZ = 1250 * 1.3;
    this.model.position.z += 1.5;
    if (this.model.position.z > maxZ) {
      this.model.position.z = -maxZ;
    } else if (this.model.position.z < -maxZ) {
      this.model.position.z = maxZ;
    }
  }

  public getModel() {
    return this.model;
  }
}
