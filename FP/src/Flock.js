import * as THREE from "three";
import Boid from "./Boid.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Flock {
  constructor() {
    this.boids = [];
  }

  update(delta) {
    this.boids.forEach((boid) => {
      boid.update(this.boids, delta);
    });
  }

  init(animationsMap, mixer, currentAction) {
    var geometry = new THREE.SphereGeometry(5);
    var material = new THREE.MeshToonMaterial({ color: 0xffd700 });
    for (var i = 0; i < 100; i++) {
      var mesh = new THREE.Mesh(geometry, material);
      var position = new THREE.Vector3()
        .random()
        .sub(new THREE.Vector3(0.5, 0.5, 0.5))
        .multiplyScalar(50);
      var direction = new THREE.Vector3().random().normalize();
      var boid = new Boid(
        position,
        direction,
        mesh,
        animationsMap,
        mixer,
        currentAction
      );
      this.boids.push(boid);
    }
  }
}
